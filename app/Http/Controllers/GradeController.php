<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    // ── Not hesaplama yardımcısı ──────────────────────────────────────────────
    private function calcGrade(float $raw): array
    {
        if ($raw >= 90) return ['letter' => 'AA', 'point' => 4.0,  'passing' => true];
        if ($raw >= 85) return ['letter' => 'BA', 'point' => 3.5,  'passing' => true];
        if ($raw >= 75) return ['letter' => 'BB', 'point' => 3.0,  'passing' => true];
        if ($raw >= 70) return ['letter' => 'CB', 'point' => 2.5,  'passing' => true];
        if ($raw >= 60) return ['letter' => 'CC', 'point' => 2.0,  'passing' => true];
        if ($raw >= 55) return ['letter' => 'DC', 'point' => 1.5,  'passing' => false];
        if ($raw >= 50) return ['letter' => 'DD', 'point' => 1.0,  'passing' => false];
        if ($raw >= 30) return ['letter' => 'FD', 'point' => 0.5,  'passing' => false];
        return              ['letter' => 'FF', 'point' => 0.0,  'passing' => false];
    }

    // ── GPA yeniden hesapla & öğrenciye yaz ──────────────────────────────────
    private function recalculateGpa(string $studentNo): void
    {
        $grades = Grade::where('student_no', $studentNo)->get();
        if ($grades->isEmpty()) return;

        $weighted = 0.0;
        $total    = 0;
        foreach ($grades as $g) {
            $credits   = Course::where('course_code', $g->course_code)->value('credits') ?? 3;
            $weighted += $credits * (float)$g->grade_point;
            $total    += $credits;
        }
        $gano = $total > 0 ? round($weighted / $total, 2) : 0.0;
        Student::where('student_no', $studentNo)->update(['academic.gpa' => $gano]);
    }

    // ── GET /instructor/course-grades?instructor_id=&course_code=&semester= ──
    public function getCourseGrades(Request $request): JsonResponse
    {
        $instructorId = $request->get('instructor_id');
        $courseCode   = $request->get('course_code');
        $semesterName = $request->get('semester');

        if (!$instructorId || !$courseCode) {
            return response()->json(['success' => false, 'message' => 'instructor_id and course_code required'], 422);
        }

        if (!$semesterName) {
            $semesterName = Semester::where('is_active', true)->value('name');
        }

        $enrollments = Enrollment::where('course_code', $courseCode)
            ->where('semester_name', $semesterName)
            ->get();

        $rows = [];
        foreach ($enrollments as $e) {
            $student = Student::where('student_no', $e->student_no)->first();
            $grade   = Grade::where('student_no', $e->student_no)
                ->where('course_code', $courseCode)
                ->where('semester_name', $semesterName)
                ->first();

            $rows[] = [
                'student_no'   => $e->student_no,
                'student_name' => $student
                    ? ($student->personal['first_name'] . ' ' . $student->personal['last_name'])
                    : $e->student_no,
                'midterm'      => $grade?->score_breakdown['midterm'] ?? null,
                'final'        => $grade?->score_breakdown['final'] ?? null,
                'homework'     => $grade?->score_breakdown['homework'] ?? null,
                'raw_score'    => $grade?->raw_score ?? null,
                'letter_grade' => $grade?->letter_grade ?? null,
                'grade_point'  => $grade?->grade_point ?? null,
                'is_passing'   => $grade?->is_passing ?? null,
                'graded'       => $grade !== null,
            ];
        }

        $course = Course::where('course_code', $courseCode)->first();

        return response()->json([
            'success'       => true,
            'course_code'   => $courseCode,
            'course_name'   => $course?->name ?? $courseCode,
            'credits'       => $course?->credits ?? 0,
            'semester_name' => $semesterName,
            'students'      => $rows,
        ]);
    }

    // ── POST /instructor/course-grades/batch ──────────────────────────────────
    public function batchEnterGrades(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_code'   => 'required|string',
            'semester_name' => 'required|string',
            'instructor_id' => 'required|string',
            'grades'                    => 'required|array|min:1',
            'grades.*.student_no'       => 'required|string',
            'grades.*.midterm'          => 'required|numeric|min:0|max:100',
            'grades.*.final'            => 'required|numeric|min:0|max:100',
            'grades.*.homework'         => 'nullable|numeric|min:0|max:100',
        ]);

        $results = [];
        foreach ($data['grades'] as $row) {
            $hw  = (float)($row['homework'] ?? 0);
            $raw = round($row['midterm'] * 0.3 + $row['final'] * 0.5 + $hw * 0.2);
            $g   = $this->calcGrade((float)$raw);

            Grade::updateOrCreate(
                [
                    'student_no'    => $row['student_no'],
                    'course_code'   => $data['course_code'],
                    'semester_name' => $data['semester_name'],
                ],
                [
                    'score_breakdown' => [
                        'midterm'  => (float)$row['midterm'],
                        'final'    => (float)$row['final'],
                        'homework' => $hw,
                    ],
                    'raw_score'     => $raw,
                    'letter_grade'  => $g['letter'],
                    'grade_point'   => $g['point'],
                    'is_passing'    => $g['passing'],
                    'instructor_id' => $data['instructor_id'],
                    'graded_at'     => now(),
                    'updated_at'    => now(),
                ]
            );

            $this->recalculateGpa($row['student_no']);

            $results[] = [
                'student_no'   => $row['student_no'],
                'raw_score'    => $raw,
                'letter_grade' => $g['letter'],
                'grade_point'  => $g['point'],
                'is_passing'   => $g['passing'],
            ];
        }

        return response()->json([
            'success' => true,
            'count'   => count($results),
            'results' => $results,
        ]);
    }

    // ── GET /student/transcript?student_no= ──────────────────────────────────
    public function getTranscript(Request $request): JsonResponse
    {
        $studentNo = $request->get('student_no');
        if (!$studentNo) {
            return response()->json(['success' => false, 'message' => 'student_no required'], 422);
        }

        $student = Student::where('student_no', $studentNo)->first();
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Student not found'], 404);
        }

        $grades = Grade::where('student_no', $studentNo)->get();

        // ── Dönem bazlı gruplama ─────────────────────────────────────────────
        $bySemester = [];
        foreach ($grades as $g) {
            $course = Course::where('course_code', $g->course_code)->first();
            $bySemester[$g->semester_name][] = [
                'course_code'  => $g->course_code,
                'course_name'  => $course?->name ?? $g->course_code,
                'credits'      => (int)($course?->credits ?? 3),
                'midterm'      => $g->score_breakdown['midterm'] ?? null,
                'final'        => $g->score_breakdown['final']   ?? null,
                'homework'     => $g->score_breakdown['homework'] ?? null,
                'raw_score'    => $g->raw_score,
                'letter_grade' => $g->letter_grade,
                'grade_point'  => $g->grade_point,
                'is_passing'   => $g->is_passing,
            ];
        }

        // ── YANO ve dönem özeti ──────────────────────────────────────────────
        $semesterSummaries = [];
        $totalWeighted     = 0.0;
        $totalCredits      = 0;

        // Dönem sıralaması: Fall önce, Spring sonra
        uksort($bySemester, fn($a, $b) => strcmp($a, $b));

        foreach ($bySemester as $semName => $courses) {
            $sw = 0.0;
            $sc = 0;
            foreach ($courses as $c) {
                $sw += $c['credits'] * (float)$c['grade_point'];
                $sc += $c['credits'];
            }
            $yano = $sc > 0 ? round($sw / $sc, 2) : 0.0;
            $totalWeighted += $sw;
            $totalCredits  += $sc;

            $semesterSummaries[] = [
                'semester_name'  => $semName,
                'courses'        => $courses,
                'yano'           => $yano,
                'credits_taken'  => $sc,
                'passed_count'   => count(array_filter($courses, fn($c) => $c['is_passing'])),
                'failed_count'   => count(array_filter($courses, fn($c) => !$c['is_passing'])),
                'needs_repeat'   => $yano < 2.0,
            ];
        }

        $gano = $totalCredits > 0 ? round($totalWeighted / $totalCredits, 2) : 0.0;

        // ── Dönem tekrarı analizi ────────────────────────────────────────────
        $repeatSemesters = array_values(
            array_filter($semesterSummaries, fn($s) => $s['needs_repeat'])
        );

        // ── Aktif dönem kayıtları (not girilmemiş) ───────────────────────────
        $activeSem    = Semester::where('is_active', true)->value('name');
        $activeEnrolls = Enrollment::where('student_no', $studentNo)
            ->where('semester_name', $activeSem)
            ->pluck('course_code')
            ->toArray();

        $gradedCodes = Grade::where('student_no', $studentNo)
            ->where('semester_name', $activeSem)
            ->pluck('course_code')
            ->toArray();

        $pendingCodes = array_diff($activeEnrolls, $gradedCodes);
        $pendingCourses = [];
        foreach ($pendingCodes as $code) {
            $course = Course::where('course_code', $code)->first();
            $pendingCourses[] = [
                'course_code' => $code,
                'course_name' => $course?->name ?? $code,
                'credits'     => (int)($course?->credits ?? 3),
            ];
        }

        return response()->json([
            'success' => true,
            'student' => [
                'student_no'    => $student->student_no,
                'full_name'     => $student->personal['first_name'] . ' ' . $student->personal['last_name'],
                'department_id' => $student->department_id,
                'class_year'    => $student->academic['class_year'],
                'status'        => $student->academic['status'] ?? 'active',
            ],
            'semesters'        => $semesterSummaries,
            'gano'             => $gano,
            'total_credits'    => $totalCredits,
            'repeat_semesters' => $repeatSemesters,
            'pending_courses'  => $pendingCourses,
            'active_semester'  => $activeSem,
        ]);
    }
}
