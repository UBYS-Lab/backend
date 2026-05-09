<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Instructor;
use App\Models\Semester;
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
            'semester' => $semester->name,
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
}
