<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Course;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Instructor;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagerController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'stats' => [
                'students'    => Student::where('academic.status', 'active')->count(),
                'instructors' => Instructor::where('is_active', true)->count(),
                'courses'     => Course::where('is_active', true)->count(),
                'departments' => Department::where('is_active', true)->count(),
            ],
        ]);
    }

    public function activities(): JsonResponse
    {
        $semester = Semester::where('is_active', true)->first();

        $recentEnrollments = Enrollment::where('semester_name', $semester?->name)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($e) {
                $student = Student::where('student_no', $e->student_no)->first();
                $name = $student
                    ? (($student->personal['first_name'] ?? '') . ' ' . ($student->personal['last_name'] ?? ''))
                    : $e->student_no;
                return [
                    'type' => 'enroll',
                    'text' => "{$name} — {$e->course_code} dersine kaydoldu",
                    'time' => $e->created_at?->format('H:i') ?? '',
                    'date' => $e->created_at?->format('Y-m-d') ?? '',
                ];
            });

        $recentGrades = Grade::where('semester_name', $semester?->name)
            ->orderBy('graded_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($g) {
                $instructor = Instructor::where('staff_id', $g->instructor_id)->first();
                $name = $instructor
                    ? (($instructor->personal['first_name'] ?? '') . ' ' . ($instructor->personal['last_name'] ?? ''))
                    : $g->instructor_id;
                return [
                    'type' => 'grade',
                    'text' => "{$name} — {$g->course_code} için not girişi yaptı",
                    'time' => $g->graded_at?->format('H:i') ?? '',
                    'date' => $g->graded_at?->format('Y-m-d') ?? '',
                ];
            });

        $activities = $recentEnrollments->concat($recentGrades)
            ->sortByDesc('date')
            ->take(8)
            ->values();

        return response()->json(['success' => true, 'activities' => $activities]);
    }

    public function announcements(): JsonResponse
    {
        $announcements = Announcement::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(fn($a) => [
                'title'    => $a->title,
                'content'  => $a->content,
                'priority' => $a->priority,
                'audience' => $a->target_audience,
                'date'     => $a->created_at?->format('d M Y') ?? '',
            ]);

        return response()->json(['success' => true, 'announcements' => $announcements]);
    }
}
