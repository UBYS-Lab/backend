<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /* ── Öğretmen: Oturum başlat ──────────────────────────── */
    public function createSession(Request $request): JsonResponse
    {
        $instructorId = $request->get('instructor_id');
        $courseCode   = $request->get('course_code');
        $section      = $request->get('section', 'A');

        $offering = CourseOffering::where('course_code', $courseCode)
            ->where('section', $section)
            ->where('instructor_id', $instructorId)
            ->first();

        if (!$offering) {
            return response()->json(['success' => false, 'message' => 'Ders bulunamadı'], 404);
        }

        $date      = now()->format('Y-m-d');
        $weekNo    = (int) now()->format('W');
        $chars   = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $qrToken = '';
        for ($i = 0; $i < 8; $i++) {
            $qrToken .= $chars[random_int(0, strlen($chars) - 1)];
        }
        $expiresAt = now()->addMinutes(15);

        $existing = AttendanceSession::where('course_code', $courseCode)
            ->where('section', $section)
            ->where('date', $date)
            ->first();

        $enrolledNos = Enrollment::where('course_code', $courseCode)
            ->where('section', $section)
            ->pluck('student_no')->unique()->values()->toArray();

        if ($existing && !$existing->is_closed) {
            $existing->qr_token   = $qrToken;
            $existing->expires_at = $expiresAt;
            if (empty($existing->absent_students) && empty($existing->present_students) && empty($existing->late_students)) {
                $existing->absent_students = $enrolledNos;
            }
            $existing->save();
            $session = $existing;
        } else {

            $session = AttendanceSession::create([
                'course_code'      => $courseCode,
                'course_name'      => $offering->course_name ?? $courseCode,
                'section'          => $section,
                'instructor_id'    => $instructorId,
                'date'             => $date,
                'week_number'      => $weekNo,
                'qr_token'         => $qrToken,
                'expires_at'       => $expiresAt,
                'present_students' => [],
                'absent_students'  => $enrolledNos ?? [],
                'late_students'    => [],
                'is_closed'        => false,
            ]);
        }

        return response()->json([
            'success'    => true,
            'session_id' => (string) $session->_id,
            'qr_token'   => $qrToken,
            'expires_at' => $expiresAt->toIso8601String(),
            'date'       => $date,
            'course_code'=> $courseCode,
            'course_name'=> $session->course_name,
        ]);
    }

    /* ── Öğretmen: Oturum durumu + öğrenci listesi ──────── */
    public function sessionStatus(Request $request, string $sessionId): JsonResponse
    {
        $session = AttendanceSession::find($sessionId);
        if (!$session) return response()->json(['success' => false, 'message' => 'Oturum bulunamadı'], 404);

        $present = $session->present_students ?? [];
        $absent  = $session->absent_students  ?? [];
        $late    = $session->late_students    ?? [];

        $allNos = array_unique(array_merge($present, $absent, $late));

        if (empty($allNos)) {
            $allNos = Enrollment::where('course_code', $session->course_code)
                ->where('section', $session->section)
                ->pluck('student_no')->unique()->values()->toArray();
            $absent = $allNos;
        }

        $studentNames = Student::whereIn('student_no', $allNos)
            ->get(['student_no', 'personal'])
            ->mapWithKeys(fn($s) => [
                $s->student_no => trim(
                    ($s->personal['first_name'] ?? '') . ' ' .
                    ($s->personal['last_name']  ?? '')
                ),
            ])->toArray();

        $orderedStudents = array_map(fn($no) => [
            'student_no' => $no,
            'name'       => $studentNames[$no] ?? $no,
            'status'     => in_array($no, $present) ? 'present'
                          : (in_array($no, $late) ? 'late' : 'absent'),
        ], $allNos);

        return response()->json([
            'success'          => true,
            'session_id'       => (string) $session->_id,
            'course_code'      => $session->course_code,
            'course_name'      => $session->course_name,
            'date'             => $session->date,
            'week_number'      => $session->week_number,
            'is_closed'        => $session->is_closed,
            'expires_at'       => $session->expires_at?->toIso8601String(),
            'present_students' => $present,
            'absent_students'  => $absent,
            'late_students'    => $late,
            'students'         => $orderedStudents,
            'qr_token'         => $session->is_closed ? null : $session->qr_token,
        ]);
    }

    /* ── Öğretmen: Manuel işaretleme ───────────────────── */
    public function markStudent(Request $request): JsonResponse
    {
        $sessionId = $request->get('session_id');
        $studentNo = $request->get('student_no');
        $status    = $request->get('status'); // present|absent|late

        if (!in_array($status, ['present', 'absent', 'late'])) {
            return response()->json(['success' => false, 'message' => 'Geçersiz durum'], 422);
        }

        $session = AttendanceSession::find($sessionId);
        if (!$session) return response()->json(['success' => false], 404);

        $present = $session->present_students ?? [];
        $absent  = $session->absent_students  ?? [];
        $late    = $session->late_students    ?? [];

        $present = array_values(array_diff($present, [$studentNo]));
        $absent  = array_values(array_diff($absent,  [$studentNo]));
        $late    = array_values(array_diff($late,    [$studentNo]));

        match($status) {
            'present' => $present[] = $studentNo,
            'absent'  => $absent[]  = $studentNo,
            'late'    => $late[]    = $studentNo,
        };

        $session->present_students = $present;
        $session->absent_students  = $absent;
        $session->late_students    = $late;
        $session->save();

        $this->upsertAttendance($session, $studentNo, $status, 'manual');

        return response()->json(['success' => true, 'status' => $status]);
    }

    /* ── Öğretmen: Oturumu kapat ────────────────────────── */
    public function closeSession(Request $request, string $sessionId): JsonResponse
    {
        $session = AttendanceSession::find($sessionId);
        if (!$session) return response()->json(['success' => false], 404);

        foreach ($session->absent_students ?? [] as $no) {
            $this->upsertAttendance($session, $no, 'absent', 'auto');
        }
        $session->is_closed = true;
        $session->save();

        return response()->json(['success' => true, 'message' => 'Oturum kapatıldı']);
    }

    /* ── Öğrenci: QR ile giriş ──────────────────────────── */
    public function qrCheckin(Request $request): JsonResponse
    {
        $token     = $request->get('qr_token');
        $studentNo = $request->get('student_no');

        $session = AttendanceSession::where('qr_token', $token)->first();

        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Geçersiz QR kodu'], 404);
        }
        if ($session->is_closed) {
            return response()->json(['success' => false, 'message' => 'Bu yoklama oturumu kapatılmış'], 422);
        }
        if ($session->expires_at && now()->isAfter($session->expires_at)) {
            return response()->json(['success' => false, 'message' => 'QR kodunun süresi dolmuş'], 422);
        }

        $present = $session->present_students ?? [];
        $absent  = $session->absent_students  ?? [];
        $late    = $session->late_students    ?? [];

        $allEnrolled = array_merge($present, $absent, $late);
        if (!in_array($studentNo, $allEnrolled)) {
            return response()->json([
                'success' => false,
                'message' => 'Bu derse kayıtlı değilsiniz. Yoklamaya katılamazsınız.',
            ], 403);
        }

        if (in_array($studentNo, $present)) {
            return response()->json(['success' => true, 'message' => 'Yoklamaya zaten kaydedildiniz', 'already' => true, 'course_name' => $session->course_name]);
        }

        $absent = array_values(array_diff($absent, [$studentNo]));
        $present[] = $studentNo;

        $session->present_students = $present;
        $session->absent_students  = $absent;
        $session->save();

        $this->upsertAttendance($session, $studentNo, 'present', 'qr');

        return response()->json([
            'success'     => true,
            'message'     => 'Yoklamaya başarıyla kaydedildiniz',
            'course_name' => $session->course_name,
            'date'        => $session->date,
        ]);
    }

    /* ── Öğrenci: Kendi yoklama kayıtları ──────────────── */
    public function studentReport(Request $request): JsonResponse
    {
        $studentNo = $request->get('student_no');

        $records = Attendance::where('student_no', $studentNo)
            ->orderBy('date', 'desc')
            ->get();

        $byCourse = [];
        foreach ($records as $r) {
            $code = $r->course_code;
            if (!isset($byCourse[$code])) {
                $byCourse[$code] = ['course_code'=>$code, 'total'=>0, 'present'=>0, 'absent'=>0, 'late'=>0, 'records'=>[]];
            }
            $byCourse[$code]['total']++;
            $byCourse[$code][$r->status]++;
            $byCourse[$code]['records'][] = [
                'date'        => $r->date,
                'week_number' => $r->week_number,
                'status'      => $r->status,
                'method'      => $r->method,
            ];
        }

        $summary = array_values(array_map(function($c) {
            $c['attendance_rate'] = $c['total'] > 0
                ? round(($c['present'] + $c['late']) / $c['total'] * 100, 1)
                : 0;
            return $c;
        }, $byCourse));

        return response()->json(['success' => true, 'attendance' => $summary]);
    }

    /* ── Öğretmen: Ders bazlı yoklama raporu ──────────── */
    public function courseReport(Request $request): JsonResponse
    {
        $courseCode = $request->get('course_code');
        $section    = $request->get('section', 'A');

        $sessions = AttendanceSession::where('course_code', $courseCode)
            ->where('section', $section)
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($s) => [
                'session_id'       => (string) $s->_id,
                'date'             => $s->date,
                'week_number'      => $s->week_number,
                'is_closed'        => $s->is_closed,
                'present_count'    => count($s->present_students ?? []),
                'absent_count'     => count($s->absent_students ?? []),
                'late_count'       => count($s->late_students ?? []),
            ]);

        return response()->json(['success' => true, 'course_code' => $courseCode, 'sessions' => $sessions]);
    }

    /* ── Öğretmen: Aktif oturumlar ──────────────────────── */
    public function activeSessions(Request $request): JsonResponse
    {
        $instructorId = $request->get('instructor_id');

        $sessions = AttendanceSession::where('instructor_id', $instructorId)
            ->where('is_closed', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'session_id'  => (string) $s->_id,
                'course_code' => $s->course_code,
                'course_name' => $s->course_name,
                'date'        => $s->date,
                'expires_at'  => $s->expires_at?->toIso8601String(),
                'present_count' => count($s->present_students ?? []),
                'total_count'   => count($s->present_students ?? []) + count($s->absent_students ?? []) + count($s->late_students ?? []),
            ]);

        return response()->json(['success' => true, 'sessions' => $sessions]);
    }

    /* ── Yardımcı ──────────────────────────────────────── */
    private function upsertAttendance(AttendanceSession $session, string $studentNo, string $status, string $method): void
    {
        Attendance::where('session_id', (string) $session->_id)
            ->where('student_no', $studentNo)
            ->delete();

        Attendance::create([
            'session_id'  => (string) $session->_id,
            'course_code' => $session->course_code,
            'section'     => $session->section,
            'student_no'  => $studentNo,
            'date'        => $session->date,
            'week_number' => $session->week_number,
            'status'      => $status,
            'method'      => $method,
        ]);
    }
}
