<?php

namespace App\Http\Controllers;

use App\Helpers\SemesterHelper;
use App\Models\Announcement;
use App\Models\Course;
use App\Models\Department;
use App\Models\CourseOffering;
use App\Models\CourseRegistrationRequest;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Instructor;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function schedule(Request $request): JsonResponse
    {
        $studentNo = $request->get('student_no');
        if (!$studentNo) {
            return response()->json(['success' => false, 'message' => 'student_no required'], 422);
        }

        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return response()->json(['success' => true, 'semester' => null, 'schedule' => []]);
        }

        $enrollments = Enrollment::where('student_no', $studentNo)
            ->where('semester_name', $semester->name)
            ->get();

        $courseCodes = $enrollments->pluck('course_code')->unique()->values()->toArray();

        $offerings = CourseOffering::where('semester_name', $semester->name)
            ->whereIn('course_code', $courseCodes)
            ->get()
            ->keyBy('course_code');

        $courses = Course::whereIn('course_code', $courseCodes)
            ->get()
            ->keyBy('course_code');

        $instructorIds = $offerings->pluck('instructor_id')->unique()->values()->toArray();
        $instructors = Instructor::whereIn('staff_id', $instructorIds)
            ->get()
            ->keyBy('staff_id');

        $schedule = $enrollments->map(function ($enrollment) use ($offerings, $courses, $instructors) {
            $offering    = $offerings->get($enrollment->course_code);
            $course      = $courses->get($enrollment->course_code);
            $instructor  = $offering ? $instructors->get($offering->instructor_id) : null;

            $instructorName = $instructor
                ? (($instructor->academic['title'] ?? '') . ' ' . ($instructor->personal['first_name'] ?? '') . ' ' . ($instructor->personal['last_name'] ?? ''))
                : 'N/A';

            return [
                'course_code'    => $enrollment->course_code,
                'course_name'    => $course?->name ?? $enrollment->course_code,
                'section'        => $enrollment->section,
                'instructor'     => trim($instructorName),
                'status'         => $enrollment->status,
                'schedule'       => $offering?->schedule ?? [],
            ];
        })->values();

        return response()->json([
            'success'  => true,
            'semester' => SemesterHelper::tr($semester->name),
            'schedule' => $schedule,
        ]);
    }

    public function announcements(Request $request): JsonResponse
    {
        $departmentId = $request->get('department_id');

        $query = Announcement::where('is_active', true)
            ->whereIn('target_audience', ['students', 'all']);

        if ($departmentId) {
            $query->where(function ($q) use ($departmentId) {
                $q->whereNull('department_id')
                  ->orWhere('department_id', (int) $departmentId);
            });
        }

        $announcements = $query->orderBy('created_at', 'desc')->limit(5)->get()
            ->map(fn($a) => [
                'title'     => $a->title,
                'content'   => $a->content,
                'priority'  => $a->priority,
                'date'      => $a->created_at?->format('d M Y') ?? '',
                'publisher' => $a->published_by,
            ]);

        return response()->json(['success' => true, 'announcements' => $announcements]);
    }

    public function grades(Request $request): JsonResponse
    {
        $studentNo = $request->get('student_no');
        if (!$studentNo) {
            return response()->json(['success' => false, 'message' => 'student_no required'], 422);
        }

        $grades = Grade::where('student_no', $studentNo)
            ->orderBy('graded_at', 'desc')
            ->get()
            ->map(fn($g) => [
                'course_code'  => $g->course_code,
                'semester'     => $g->semester_name,
                'raw_score'    => $g->raw_score,
                'letter_grade' => $g->letter_grade,
                'grade_point'  => $g->grade_point,
                'is_passing'   => $g->is_passing,
            ]);

        return response()->json(['success' => true, 'grades' => $grades]);
    }

    public function availableCourses(Request $request): JsonResponse
    {
        $studentNo = $request->get('student_no');
        if (!$studentNo) {
            return response()->json(['success' => false, 'message' => 'student_no required'], 422);
        }

        $student = Student::where('student_no', $studentNo)->first();
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }

        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return response()->json(['success' => true, 'courses' => [], 'credits_allowed' => 0, 'existing_request' => null]);
        }

        $gpa            = $student->academic['gpa'] ?? 0.0;
        $departmentId   = $student->department_id;
        $department     = Department::where('department_id', $departmentId)->first();
        $deptMax        = $department?->max_credits ?? null;
        $creditsAllowed = $deptMax ?? ($gpa >= 3.0 ? 30 : ($gpa >= 2.5 ? 27 : 24));

        $alreadyEnrolled = Enrollment::where('student_no', $studentNo)
            ->where('semester_name', $semester->name)
            ->pluck('course_code')->toArray();

        $existingRequest = CourseRegistrationRequest::where('student_no', $studentNo)
            ->where('semester_name', $semester->name)
            ->orderBy('submitted_at', 'desc')->first();

        $offeringCodes = CourseOffering::where('semester_name', $semester->name)
            ->pluck('course_code')->unique()->values()->toArray();

        $offerings = CourseOffering::where('semester_name', $semester->name)
            ->get()->keyBy('course_code');

        $instructorIds = $offerings->pluck('instructor_id')->unique()->filter()->values()->toArray();
        $instructors   = Instructor::whereIn('staff_id', $instructorIds)->get()->keyBy('staff_id');

        $courses = Course::where('department_id', $departmentId)
            ->whereIn('course_code', $offeringCodes)
            ->orderBy('class_year')->orderBy('course_code')->get();

        $result = $courses->map(function ($course) use ($offerings, $instructors, $alreadyEnrolled) {
            $offering   = $offerings->get($course->course_code);
            $instructor = $offering ? $instructors->get($offering->instructor_id) : null;
            $instName   = $instructor
                ? trim(($instructor->academic['title'] ?? '') . ' ' . ($instructor->personal['first_name'] ?? '') . ' ' . ($instructor->personal['last_name'] ?? ''))
                : 'N/A';

            return [
                'course_code'      => $course->course_code,
                'course_name'      => $course->name,
                'credits'          => $course->credits,
                'ects'             => $course->ects,
                'type'             => $course->type,
                'class_year'       => $course->class_year,
                'section'          => $offering?->section ?? 'A',
                'instructor'       => $instName,
                'instructor_id'    => $offering?->instructor_id,
                'capacity'         => $offering?->capacity ?? 0,
                'enrolled_count'   => $offering?->enrolled_count ?? 0,
                'schedule'         => $offering?->schedule ?? [],
                'already_enrolled' => in_array($course->course_code, $alreadyEnrolled),
            ];
        })->values();

        return response()->json([
            'success'          => true,
            'semester'         => SemesterHelper::tr($semester->name),
            'credits_allowed'  => $creditsAllowed,
            'existing_request' => $existingRequest ? [
                'id'       => (string) $existingRequest->_id,
                'status'   => $existingRequest->status,
                'feedback' => $existingRequest->feedback,
                'courses'  => $existingRequest->requested_courses,
                'submitted_at' => $existingRequest->submitted_at
                    ? \Carbon\Carbon::parse($existingRequest->submitted_at)->format('d M Y H:i')
                    : '',
            ] : null,
            'courses' => $result,
        ]);
    }

    public function submitRegistrationRequest(Request $request): JsonResponse
    {
        $studentNo   = $request->get('student_no');
        $courseCodes = $request->get('course_codes', []);

        if (!$studentNo || empty($courseCodes)) {
            return response()->json(['success' => false, 'message' => 'student_no and course_codes required'], 422);
        }

        $student = Student::where('student_no', $studentNo)->first();
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }

        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return response()->json(['success' => false, 'message' => 'No active semester'], 422);
        }

        CourseRegistrationRequest::where('student_no', $studentNo)
            ->where('semester_name', $semester->name)
            ->where('status', 'pending')->delete();

        $courses   = Course::whereIn('course_code', $courseCodes)->get()->keyBy('course_code');
        $offerings = CourseOffering::where('semester_name', $semester->name)
            ->whereIn('course_code', $courseCodes)->get()->keyBy('course_code');

        $requestedCourses = collect($courseCodes)->map(function ($code) use ($courses, $offerings) {
            $course   = $courses->get($code);
            $offering = $offerings->get($code);
            return [
                'course_code'   => $code,
                'course_name'   => $course?->name ?? $code,
                'credits'       => $course?->credits ?? 0,
                'section'       => $offering?->section ?? 'A',
                'instructor_id' => $offering?->instructor_id,
            ];
        })->values()->toArray();

        $totalCredits  = collect($requestedCourses)->sum('credits');
        $instructorIds = collect($requestedCourses)->pluck('instructor_id')->unique()->filter()->values()->toArray();

        $regRequest = CourseRegistrationRequest::create([
            'student_no'              => $studentNo,
            'student_name'            => trim(($student->personal['first_name'] ?? '') . ' ' . ($student->personal['last_name'] ?? '')),
            'department_id'           => $student->department_id,
            'semester_name'           => $semester->name,
            'requested_courses'       => $requestedCourses,
            'total_credits_requested' => $totalCredits,
            'instructor_ids'          => $instructorIds,
            'status'                  => 'pending',
            'feedback'                => null,
            'submitted_at'            => new \DateTime(),
            'reviewed_at'             => null,
            'reviewed_by'             => null,
        ]);

        return response()->json([
            'success'    => true,
            'message'    => 'Registration request submitted successfully.',
            'request_id' => (string) $regRequest->_id,
        ]);
    }

    public function registrationStatus(Request $request): JsonResponse
    {
        $studentNo = $request->get('student_no');
        if (!$studentNo) {
            return response()->json(['success' => false, 'message' => 'student_no required'], 422);
        }

        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return response()->json(['success' => true, 'request' => null]);
        }

        $regRequest = CourseRegistrationRequest::where('student_no', $studentNo)
            ->where('semester_name', $semester->name)
            ->orderBy('submitted_at', 'desc')->first();

        if (!$regRequest) {
            return response()->json(['success' => true, 'request' => null]);
        }

        return response()->json([
            'success' => true,
            'request' => [
                'id'            => (string) $regRequest->_id,
                'status'        => $regRequest->status,
                'feedback'      => $regRequest->feedback,
                'courses'       => $regRequest->requested_courses,
                'total_credits' => $regRequest->total_credits_requested,
                'submitted_at'  => $regRequest->submitted_at
                    ? \Carbon\Carbon::parse($regRequest->submitted_at)->format('d M Y H:i')
                    : '',
                'reviewed_at'   => $regRequest->reviewed_at
                    ? \Carbon\Carbon::parse($regRequest->reviewed_at)->format('d M Y H:i')
                    : null,
            ],
        ]);
    }
}
