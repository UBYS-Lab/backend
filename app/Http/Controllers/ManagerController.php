<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\AttendanceSession;
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

    public function attendanceOverview(Request $request): JsonResponse
    {
        $sessions = AttendanceSession::where('is_closed', true)
            ->orderBy('date', 'desc')
            ->limit(200)
            ->get();

        $byCourse = [];
        foreach ($sessions as $s) {
            $key = $s->course_code . '|' . $s->section;
            if (!isset($byCourse[$key])) {
                $byCourse[$key] = [
                    'course_code'    => $s->course_code,
                    'course_name'    => $s->course_name ?? $s->course_code,
                    'section'        => $s->section,
                    'session_count'  => 0,
                    'total_present'  => 0,
                    'total_absent'   => 0,
                    'total_late'     => 0,
                ];
            }
            $byCourse[$key]['session_count']++;
            $byCourse[$key]['total_present'] += count($s->present_students ?? []);
            $byCourse[$key]['total_absent']  += count($s->absent_students  ?? []);
            $byCourse[$key]['total_late']    += count($s->late_students    ?? []);
        }

        $result = array_values(array_map(function ($c) {
            $total = $c['total_present'] + $c['total_absent'] + $c['total_late'];
            $c['attendance_rate'] = $total > 0
                ? round(($c['total_present'] + $c['total_late']) / $total * 100, 1)
                : 0;
            return $c;
        }, $byCourse));

        usort($result, fn($a, $b) => $a['attendance_rate'] <=> $b['attendance_rate']);

        return response()->json([
            'success'         => true,
            'total_sessions'  => $sessions->count(),
            'courses'         => $result,
        ]);
    }
}
