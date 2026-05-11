<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Course;
use App\Models\CourseOffering;
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

    /* ── Öğrenci Yönetimi ─────────────────────────────── */
    public function students(Request $request): JsonResponse
    {
        $search = trim($request->get('search', ''));
        $status = $request->get('status', '');
        $deptId = $request->get('department_id', '');

        $query = Student::query();
        if ($status)  $query->where('academic.status', $status);
        if ($deptId)  $query->where('department_id', (int)$deptId);

        $all = $query->get();

        if ($search) {
            $s = strtolower($search);
            $all = $all->filter(function ($st) use ($s) {
                $fn   = strtolower($st->personal['first_name'] ?? '');
                $ln   = strtolower($st->personal['last_name']  ?? '');
                $no   = strtolower($st->student_no ?? '');
                $mail = strtolower($st->personal['email'] ?? '');
                return str_contains($fn, $s) || str_contains($ln, $s)
                    || str_contains($no, $s) || str_contains($mail, $s)
                    || str_contains("$fn $ln", $s);
            });
        }

        $depts = Department::get()->keyBy('department_id');

        $result = $all->values()->map(fn($st) => [
            'student_no'      => $st->student_no,
            'full_name'       => trim(($st->personal['first_name'] ?? '') . ' ' . ($st->personal['last_name'] ?? '')),
            'email'           => $st->personal['email'] ?? '',
            'phone'           => $st->personal['phone'] ?? '',
            'department_id'   => $st->department_id,
            'department_name' => $depts->get($st->department_id)?->name ?? '',
            'enrollment_year' => $st->enrollment_year,
            'status'          => $st->academic['status'] ?? 'active',
            'gpa'             => $st->academic['gpa'] ?? 0,
            'class_year'      => $st->academic['class_year'] ?? 1,
        ]);

        return response()->json(['success' => true, 'students' => $result, 'total' => $result->count()]);
    }

    public function updateStudent(Request $request, string $studentNo): JsonResponse
    {
        $student = Student::where('student_no', $studentNo)->first();
        if (!$student) return response()->json(['success' => false, 'message' => 'Öğrenci bulunamadı'], 404);

        if ($request->has('status')) {
            $academic = $student->academic ?? [];
            $academic['status'] = $request->get('status');
            $student->academic = $academic;
        }
        if ($request->has('class_year')) {
            $academic = $student->academic ?? [];
            $academic['class_year'] = (int) $request->get('class_year');
            $student->academic = $academic;
        }
        if ($request->has('department_id')) {
            $student->department_id = (int) $request->get('department_id');
        }
        $student->save();

        return response()->json(['success' => true, 'message' => 'Öğrenci güncellendi']);
    }

    /* ── Akademisyen Yönetimi ─────────────────────────── */
    public function instructors(Request $request): JsonResponse
    {
        $search = trim($request->get('search', ''));
        $deptId = $request->get('department_id', '');

        $query = Instructor::query();
        if ($deptId) $query->where('department_id', (int)$deptId);
        $all = $query->get();

        if ($search) {
            $s = strtolower($search);
            $all = $all->filter(function ($ins) use ($s) {
                $fn = strtolower($ins->personal['first_name'] ?? '');
                $ln = strtolower($ins->personal['last_name']  ?? '');
                $id = strtolower($ins->staff_id ?? '');
                return str_contains($fn, $s) || str_contains($ln, $s)
                    || str_contains($id, $s) || str_contains("$fn $ln", $s);
            });
        }

        $depts    = Department::get()->keyBy('department_id');
        $semester = Semester::where('is_active', true)->first();
        $courseCounts = CourseOffering::where('semester_name', $semester?->name)
            ->get(['instructor_id'])
            ->countBy('instructor_id');

        $result = $all->values()->map(fn($ins) => [
            'staff_id'        => $ins->staff_id,
            'full_name'       => trim(($ins->personal['first_name'] ?? '') . ' ' . ($ins->personal['last_name'] ?? '')),
            'email'           => $ins->personal['email'] ?? '',
            'phone'           => $ins->personal['phone'] ?? '',
            'title'           => $ins->academic['title'] ?? '',
            'department_id'   => $ins->department_id,
            'department_name' => $depts->get($ins->department_id)?->name ?? '',
            'is_active'       => $ins->is_active ?? true,
            'course_count'    => $courseCounts->get($ins->staff_id, 0),
        ]);

        return response()->json(['success' => true, 'instructors' => $result, 'total' => $result->count()]);
    }

    public function updateInstructor(Request $request, string $staffId): JsonResponse
    {
        $instructor = Instructor::where('staff_id', $staffId)->first();
        if (!$instructor) return response()->json(['success' => false, 'message' => 'Akademisyen bulunamadı'], 404);

        if ($request->has('is_active'))    $instructor->is_active    = (bool) $request->get('is_active');
        if ($request->has('department_id')) $instructor->department_id = (int) $request->get('department_id');
        if ($request->has('title')) {
            $academic = $instructor->academic ?? [];
            $academic['title'] = $request->get('title');
            $instructor->academic = $academic;
        }
        $instructor->save();

        return response()->json(['success' => true, 'message' => 'Akademisyen güncellendi']);
    }

    /* ── Ders Yönetimi ────────────────────────────────── */
    public function courses(Request $request): JsonResponse
    {
        $search = trim($request->get('search', ''));
        $deptId = $request->get('department_id', '');

        $query = Course::query();
        if ($deptId) $query->where('department_id', (int)$deptId);
        $all = $query->get();

        if ($search) {
            $s = strtolower($search);
            $all = $all->filter(function ($c) use ($s) {
                return str_contains(strtolower($c->name ?? ''), $s)
                    || str_contains(strtolower($c->course_code ?? ''), $s);
            });
        }

        $depts    = Department::get()->keyBy('department_id');
        $semester = Semester::where('is_active', true)->first();

        $offeringCounts = CourseOffering::where('semester_name', $semester?->name)
            ->get(['course_code'])
            ->countBy('course_code');

        $enrollCounts = Enrollment::where('semester_name', $semester?->name)
            ->get(['course_code', 'student_no'])
            ->groupBy('course_code')
            ->map(fn($g) => $g->pluck('student_no')->unique()->count());

        $result = $all->values()->map(fn($c) => [
            'course_code'     => $c->course_code,
            'name'            => $c->name,
            'department_id'   => $c->department_id,
            'department_name' => $depts->get($c->department_id)?->name ?? '',
            'credits'         => $c->credits,
            'ects'            => $c->ects,
            'type'            => $c->type ?? 'zorunlu',
            'class_year'      => $c->class_year,
            'is_active'       => $c->is_active ?? true,
            'section_count'   => $offeringCounts->get($c->course_code, 0),
            'enrolled_count'  => $enrollCounts->get($c->course_code, 0),
        ]);

        return response()->json(['success' => true, 'courses' => $result, 'total' => $result->count()]);
    }

    public function toggleCourse(Request $request, string $code): JsonResponse
    {
        $course = Course::where('course_code', $code)->first();
        if (!$course) return response()->json(['success' => false, 'message' => 'Ders bulunamadı'], 404);
        $course->is_active = !($course->is_active ?? true);
        $course->save();
        return response()->json(['success' => true, 'is_active' => $course->is_active]);
    }

    /* ── Duyuru Yönetimi ──────────────────────────────── */
    public function allAnnouncements(Request $request): JsonResponse
    {
        $announcements = Announcement::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($a) => [
                'id'       => (string) $a->_id,
                'title'    => $a->title,
                'content'  => $a->content,
                'priority' => $a->priority,
                'audience' => $a->target_audience,
                'is_active'=> $a->is_active ?? true,
                'date'     => $a->created_at?->format('d M Y') ?? '',
            ]);

        return response()->json(['success' => true, 'announcements' => $announcements]);
    }

    public function createAnnouncement(Request $request): JsonResponse
    {
        $ann = Announcement::create([
            'title'           => $request->get('title'),
            'content'         => $request->get('content'),
            'target_audience' => $request->get('audience', 'all'),
            'department_id'   => $request->get('department_id', 0),
            'published_by'    => $request->get('published_by', ''),
            'publisher_type'  => 'manager',
            'priority'        => $request->get('priority', 'normal'),
            'is_active'       => true,
        ]);

        return response()->json(['success' => true, 'id' => (string) $ann->_id, 'message' => 'Duyuru yayınlandı']);
    }

    public function toggleAnnouncement(Request $request, string $id): JsonResponse
    {
        $ann = Announcement::find($id);
        if (!$ann) return response()->json(['success' => false], 404);
        $ann->is_active = !($ann->is_active ?? true);
        $ann->save();
        return response()->json(['success' => true, 'is_active' => $ann->is_active]);
    }

    public function deleteAnnouncement(Request $request, string $id): JsonResponse
    {
        $ann = Announcement::find($id);
        if (!$ann) return response()->json(['success' => false], 404);
        $ann->delete();
        return response()->json(['success' => true]);
    }

    /* ── Raporlar ─────────────────────────────────────── */
    public function reports(Request $request): JsonResponse
    {
        $semester = Semester::where('is_active', true)->first();

        $totalStudents    = Student::count();
        $activeStudents   = Student::where('academic.status', 'active')->count();
        $totalInstructors = Instructor::where('is_active', true)->count();
        $totalCourses     = Course::where('is_active', true)->count();
        $totalDepts       = Department::where('is_active', true)->count();

        $enrollments = Enrollment::where('semester_name', $semester?->name)->count();

        $grades = Grade::where('semester_name', $semester?->name)->get();
        $avgGpa = $grades->count() > 0
            ? round($grades->avg(fn($g) => ($g->letter_grade_points ?? 0)), 2)
            : 0;

        $gradeDistribution = $grades->groupBy('letter_grade')
            ->map(fn($g) => $g->count())
            ->sortKeys();

        $deptStudents = Student::where('academic.status', 'active')
            ->get(['department_id'])
            ->groupBy('department_id')
            ->map(fn($g) => $g->count());

        $depts = Department::get()->keyBy('department_id');
        $deptBreakdown = $deptStudents->map(fn($count, $id) => [
            'department' => $depts->get((int)$id)?->name ?? $id,
            'count'      => $count,
        ])->values();

        return response()->json([
            'success' => true,
            'semester' => $semester?->name ?? '',
            'overview' => [
                'total_students'    => $totalStudents,
                'active_students'   => $activeStudents,
                'total_instructors' => $totalInstructors,
                'total_courses'     => $totalCourses,
                'total_departments' => $totalDepts,
                'semester_enrollments' => $enrollments,
                'avg_gpa'           => $avgGpa,
            ],
            'grade_distribution' => $gradeDistribution,
            'department_breakdown' => $deptBreakdown,
        ]);
    }

    /* ── Sistem Ayarları ──────────────────────────────── */
    public function settings(Request $request): JsonResponse
    {
        $semesters = Semester::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'id'           => (string) $s->_id,
                'name'         => $s->name,
                'academic_year'=> $s->academic_year ?? '',
                'type'         => $s->type ?? '',
                'start_date'   => $s->start_date ?? '',
                'end_date'     => $s->end_date ?? '',
                'is_active'    => $s->is_active ?? false,
            ]);

        $departments = Department::get()->map(fn($d) => [
            'department_id' => $d->department_id,
            'name'          => $d->name,
            'quota'         => $d->quota ?? 0,
            'max_credits'   => $d->max_credits ?? 30,
            'is_active'     => $d->is_active ?? true,
        ]);

        return response()->json([
            'success'     => true,
            'semesters'   => $semesters,
            'departments' => $departments,
        ]);
    }

    public function activateSemester(Request $request, string $id): JsonResponse
    {
        Semester::query()->update(['is_active' => false]);
        $semester = Semester::find($id);
        if (!$semester) return response()->json(['success' => false, 'message' => 'Dönem bulunamadı'], 404);
        $semester->is_active = true;
        $semester->save();
        return response()->json(['success' => true, 'message' => "{$semester->name} aktif dönem yapıldı"]);
    }

    public function createSemester(Request $request): JsonResponse
    {
        $semester = Semester::create([
            'name'          => $request->get('name'),
            'academic_year' => $request->get('academic_year', ''),
            'type'          => $request->get('type', 'guz'),
            'start_date'    => $request->get('start_date', ''),
            'end_date'      => $request->get('end_date', ''),
            'is_active'     => false,
        ]);
        return response()->json(['success' => true, 'id' => (string) $semester->_id]);
    }
}
