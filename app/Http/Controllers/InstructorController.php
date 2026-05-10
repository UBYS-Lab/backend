<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\CourseRegistrationRequest;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstructorController extends Controller
{
    public function courses(Request $request): JsonResponse
    {
        $instructorId = $request->get('instructor_id');
        if (!$instructorId) {
            return response()->json(['success' => false, 'message' => 'instructor_id required'], 422);
        }

        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return response()->json(['success' => true, 'semester' => null, 'courses' => []]);
        }

        $offerings = CourseOffering::where('instructor_id', $instructorId)
            ->where('semester_name', $semester->name)
            ->get();

        $courseCodes = $offerings->pluck('course_code')->unique()->values()->toArray();
        $courses = Course::whereIn('course_code', $courseCodes)->get()->keyBy('course_code');

        $result = $offerings->map(fn($o) => [
            'course_code'    => $o->course_code,
            'course_name'    => $courses->get($o->course_code)?->name ?? $o->course_code,
            'section'        => $o->section,
            'enrolled_count' => $o->enrolled_count ?? 0,
            'capacity'       => $o->capacity,
            'schedule'       => $o->schedule ?? [],
        ])->values();

        return response()->json([
            'success'  => true,
            'semester' => $semester->name,
            'courses'  => $result,
        ]);
    }

    public function pendingGrades(Request $request): JsonResponse
    {
        $instructorId = $request->get('instructor_id');
        if (!$instructorId) {
            return response()->json(['success' => false, 'message' => 'instructor_id required'], 422);
        }

        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return response()->json(['success' => true, 'pending' => []]);
        }

        $offerings = CourseOffering::where('instructor_id', $instructorId)
            ->where('semester_name', $semester->name)
            ->get();

        $pending = [];
        foreach ($offerings as $offering) {
            $enrollments = Enrollment::where('course_code', $offering->course_code)
                ->where('semester_name', $semester->name)
                ->where('section', $offering->section)
                ->where('status', 'ongoing')
                ->get();

            $gradedStudents = Grade::where('course_code', $offering->course_code)
                ->where('semester_name', $semester->name)
                ->pluck('student_no')
                ->toArray();

            foreach ($enrollments as $enrollment) {
                if (!in_array($enrollment->student_no, $gradedStudents)) {
                    $student = Student::where('student_no', $enrollment->student_no)->first();
                    $pending[] = [
                        'student_no'  => $enrollment->student_no,
                        'name'        => $student
                            ? (($student->personal['first_name'] ?? '') . ' ' . ($student->personal['last_name'] ?? ''))
                            : $enrollment->student_no,
                        'course_code' => $offering->course_code,
                        'section'     => $offering->section,
                    ];
                }
            }
        }

        return response()->json(['success' => true, 'pending' => $pending]);
    }

    public function announcements(Request $request): JsonResponse
    {
        $announcements = Announcement::where('is_active', true)
            ->whereIn('target_audience', ['instructors', 'all'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($a) => [
                'title'    => $a->title,
                'content'  => $a->content,
                'priority' => $a->priority,
                'date'     => $a->created_at?->format('d M Y') ?? '',
            ]);

        return response()->json(['success' => true, 'announcements' => $announcements]);
    }

    public function registrationRequests(Request $request): JsonResponse
    {
        $instructorId = $request->get('instructor_id');
        if (!$instructorId) {
            return response()->json(['success' => false, 'message' => 'instructor_id required'], 422);
        }

        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return response()->json(['success' => true, 'requests' => []]);
        }

        $requests = CourseRegistrationRequest::where('semester_name', $semester->name)
            ->where('instructor_ids', $instructorId)
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id'            => (string) $r->_id,
                'student_no'    => $r->student_no,
                'student_name'  => $r->student_name,
                'department_id' => $r->department_id,
                'courses'       => $r->requested_courses,
                'total_credits' => $r->total_credits_requested,
                'status'        => $r->status,
                'feedback'      => $r->feedback,
                'submitted_at'  => $r->submitted_at
                    ? \Carbon\Carbon::parse($r->submitted_at)->format('d M Y H:i')
                    : '',
                'reviewed_at'   => $r->reviewed_at
                    ? \Carbon\Carbon::parse($r->reviewed_at)->format('d M Y H:i')
                    : null,
            ]);

        return response()->json(['success' => true, 'requests' => $requests]);
    }

    public function reviewRegistrationRequest(Request $request, string $id): JsonResponse
    {
        $instructorId = $request->get('instructor_id');
        $action       = $request->get('action');
        $feedback     = $request->get('feedback', '');

        if (!$instructorId || !in_array($action, ['approve', 'reject'])) {
            return response()->json(['success' => false, 'message' => 'instructor_id and action (approve/reject) required'], 422);
        }

        $regRequest = CourseRegistrationRequest::find($id);
        if (!$regRequest) {
            return response()->json(['success' => false, 'message' => 'Request not found'], 404);
        }

        $newStatus          = $action === 'approve' ? 'approved' : 'rejected';
        $regRequest->status      = $newStatus;
        $regRequest->feedback    = $feedback ?: null;
        $regRequest->reviewed_at = new \DateTime();
        $regRequest->reviewed_by = $instructorId;
        $regRequest->save();

        if ($newStatus === 'approved') {
            foreach ($regRequest->requested_courses as $courseData) {
                $exists = Enrollment::where('student_no', $regRequest->student_no)
                    ->where('course_code', $courseData['course_code'])
                    ->where('semester_name', $regRequest->semester_name)
                    ->exists();

                if (!$exists) {
                    Enrollment::create([
                        'student_no'      => $regRequest->student_no,
                        'course_code'     => $courseData['course_code'],
                        'semester_name'   => $regRequest->semester_name,
                        'section'         => $courseData['section'] ?? 'A',
                        'status'          => 'ongoing',
                        'enrollment_date' => new \DateTime(),
                        'created_at'      => new \DateTime(),
                    ]);

                    CourseOffering::where('course_code', $courseData['course_code'])
                        ->where('semester_name', $regRequest->semester_name)
                        ->increment('enrolled_count');
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'approved'
                ? 'Request approved and enrollments created.'
                : 'Request rejected.',
        ]);
    }
}
