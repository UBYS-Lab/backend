<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Course;
use App\Models\CourseOffering;
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
}
