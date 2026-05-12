<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssignmentController extends Controller
{
    // ─────────────────────────────────────────────────────────
    // INSTRUCTOR — Ödev oluştur
    // ─────────────────────────────────────────────────────────
    public function createAssignment(Request $request): JsonResponse
    {
        $request->validate([
            'course_code'  => 'required|string',
            'section'      => 'required|string',
            'title'        => 'required|string|max:200',
            'description'  => 'nullable|string|max:2000',
            'due_date'     => 'required|date',
            'allowed_extensions' => 'nullable|array',
            'max_file_size_mb'   => 'nullable|integer|min:1|max:100',
        ]);

        $instructorId = $request->header('X-User-Id')
            ?? $request->query('instructor_id');

        $assignment = Assignment::create([
            'course_code'        => $request->course_code,
            'section'            => $request->section,
            'semester_name'      => $request->semester_name ?? '2025-2026 Güz',
            'instructor_id'      => $instructorId,
            'title'              => $request->title,
            'description'        => $request->description ?? '',
            'due_date'           => $request->due_date,
            'max_file_size_mb'   => $request->max_file_size_mb ?? 10,
            'allowed_extensions' => $request->allowed_extensions ?? ['pdf', 'doc', 'docx', 'zip', 'rar'],
            'is_active'          => true,
        ]);

        return response()->json(['success' => true, 'assignment' => $this->formatAssignment($assignment)]);
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCTOR — Kendi derslerinin ödevlerini listele
    // ─────────────────────────────────────────────────────────
    public function instructorAssignments(Request $request): JsonResponse
    {
        $instructorId = $request->header('X-User-Id')
            ?? $request->query('instructor_id');

        $assignments = Assignment::where('instructor_id', $instructorId)
            ->orderBy('created_at', 'desc')
            ->get();

        $result = $assignments->map(function ($a) {
            $data = $this->formatAssignment($a);
            $data['submission_count'] = AssignmentSubmission::where('assignment_id', (string)$a->_id)->count();
            return $data;
        });

        return response()->json(['success' => true, 'assignments' => $result]);
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCTOR — Bir ödevin teslimlerini listele
    // ─────────────────────────────────────────────────────────
    public function assignmentSubmissions(Request $request, string $id): JsonResponse
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'Ödev bulunamadı.'], 404);
        }

        $enrolledStudentNos = Enrollment::where('course_code', $assignment->course_code)
            ->where('section', $assignment->section)
            ->where('semester_name', $assignment->semester_name)
            ->pluck('student_no')->unique()->values();

        // is_latest=true VEYA alan hiç yoksa (geriye dönük uyumluluk)
        $submissionsMap = AssignmentSubmission::where('assignment_id', $id)
            ->where(function ($q) {
                $q->where('is_latest', true)->orWhereNull('is_latest');
            })
            ->get()
            ->keyBy('student_no');

        $allStudents = $enrolledStudentNos->map(function ($studentNo) use ($submissionsMap) {
            $student  = Student::where('student_no', $studentNo)->first();
            $fullName = $student
                ? ($student->personal['first_name'] ?? '') . ' ' . ($student->personal['last_name'] ?? '')
                : $studentNo;

            $sub = $submissionsMap->get($studentNo);

            $avgGrade   = null;
            $gradedSubs = AssignmentSubmission::where('student_no', $studentNo)
                ->whereNotNull('grade')
                ->pluck('grade');
            if ($gradedSubs->count() > 0) {
                $avgGrade = round($gradedSubs->avg(), 1);
            }

            return [
                'student_no'         => $studentNo,
                'student_name'       => trim($fullName),
                'submitted'          => $sub ? true : false,
                'id'                 => $sub ? (string)$sub->_id : null,
                'original_filename'  => $sub ? ($sub->original_filename ?? '') : null,
                'original_filenames' => $sub ? ($sub->original_filenames ?? [$sub->original_filename]) : null,
                'file_size'          => $sub ? $sub->file_size : null,
                'submitted_at'       => $sub ? $sub->submitted_at : null,
                'grade'              => $sub ? $sub->grade : null,
                'feedback'           => $sub ? $sub->feedback : null,
                'avg_grade'          => $avgGrade,
            ];
        });

        $sorted = $allStudents->sortBy(
            fn($s) => ($s['submitted'] ? '0' : '1') . $s['student_name']
        )->values();

        return response()->json([
            'success'         => true,
            'assignment'      => $this->formatAssignment($assignment),
            'all_students'    => $sorted,
            'enrolled_count'  => $enrolledStudentNos->count(),
            'submitted_count' => $submissionsMap->count(),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCTOR — Teslimi indir
    // ─────────────────────────────────────────────────────────
    public function downloadSubmission(Request $request, string $submissionId)
    {
        $submission = AssignmentSubmission::find($submissionId);
        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Teslimat bulunamadı.'], 404);
        }

        $fileIndex = (int)$request->query('index', 0);
        $paths     = $submission->file_paths     ?? ($submission->file_path     ? [$submission->file_path]     : []);
        $filenames = $submission->original_filenames ?? ($submission->original_filename ? [$submission->original_filename] : []);

        $path     = $paths[$fileIndex]     ?? $paths[0]     ?? null;
        $filename = $filenames[$fileIndex] ?? $filenames[0] ?? 'dosya';

        if (!$path || !Storage::disk('local')->exists($path)) {
            return response()->json(['success' => false, 'message' => 'Dosya bulunamadı.'], 404);
        }

        return Storage::disk('local')->download($path, $filename);
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCTOR — Ödevi sil
    // ─────────────────────────────────────────────────────────
    public function deleteAssignment(Request $request, string $id): JsonResponse
    {
        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'Ödev bulunamadı.'], 404);
        }

        // Tüm teslim kayıtlarını ve dosyaları sil (arşiv dahil)
        AssignmentSubmission::where('assignment_id', $id)->each(function ($s) {
            foreach ($s->file_paths ?? ($s->file_path ? [$s->file_path] : []) as $p) {
                if ($p && Storage::disk('local')->exists($p)) Storage::disk('local')->delete($p);
            }
            $s->delete();
        });

        $assignment->delete();

        return response()->json(['success' => true, 'message' => 'Ödev silindi.']);
    }

    // ─────────────────────────────────────────────────────────
    // STUDENT — Kayıtlı derslerin ödevlerini listele
    // ─────────────────────────────────────────────────────────
    public function studentAssignments(Request $request): JsonResponse
    {
        $studentNo = $request->header('X-User-Id')
            ?? $request->query('student_no');

        $activeSemester = '2025-2026 Güz';

        // Öğrencinin kayıtlı dersleri
        $enrollments = Enrollment::where('student_no', $studentNo)
            ->where('semester_name', $activeSemester)
            ->get();

        $assignmentList = [];
        foreach ($enrollments as $enr) {
            $assignments = Assignment::where('course_code', $enr->course_code)
                ->where('section', $enr->section)
                ->where('is_active', true)
                ->get();

            foreach ($assignments as $a) {
                $submission = AssignmentSubmission::where('assignment_id', (string)$a->_id)
                    ->where('student_no', $studentNo)
                    ->where(function ($q) {
                        $q->where('is_latest', true)->orWhereNull('is_latest');
                    })
                    ->orderBy('submitted_at', 'desc')
                    ->first();

                $item = $this->formatAssignment($a);
                $item['submitted']          = $submission ? true : false;
                $item['submission_id']      = $submission ? (string)$submission->_id : null;
                $item['submitted_filename'] = $submission ? $submission->original_filename : null;
                $item['submitted_at']       = $submission ? $submission->submitted_at : null;
                $item['grade']              = $submission ? $submission->grade : null;
                $item['feedback']           = $submission ? $submission->feedback : null;

                $assignmentList[] = $item;
            }
        }

        // Due date'e göre sırala
        usort($assignmentList, fn($a, $b) => strtotime($a['due_date']) - strtotime($b['due_date']));

        return response()->json(['success' => true, 'assignments' => $assignmentList]);
    }

    // ─────────────────────────────────────────────────────────
    // STUDENT — Ödev teslim et
    // ─────────────────────────────────────────────────────────
    public function submitAssignment(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'files'   => 'required|array|min:1',
            'files.*' => 'required|file|max:102400',
        ]);

        $assignment = Assignment::find($id);
        if (!$assignment) {
            return response()->json(['success' => false, 'message' => 'Ödev bulunamadı.'], 404);
        }

        if (!$assignment->is_active) {
            return response()->json(['success' => false, 'message' => 'Bu ödev artık aktif değil.'], 422);
        }

        if (now()->greaterThan($assignment->due_date)) {
            return response()->json(['success' => false, 'message' => 'Son teslim tarihi geçmiş.'], 422);
        }

        $studentNo = $request->header('X-User-Id')
            ?? $request->input('student_no')
            ?? $request->query('student_no');

        $allowed  = $assignment->allowed_extensions ?? ['pdf', 'doc', 'docx', 'zip', 'rar'];
        $maxBytes = ($assignment->max_file_size_mb ?? 10) * 1024 * 1024;

        $originalFilenames = [];
        $storedFilenames   = [];
        $filePaths         = [];
        $totalSize         = 0;

        foreach ($request->file('files') as $file) {
            $origName  = $file->getClientOriginalName();
            $extension = strtolower($file->getClientOriginalExtension());

            if (!in_array($extension, $allowed)) {
                return response()->json([
                    'success' => false,
                    'message' => "'{$origName}' — İzin verilmeyen dosya türü. İzin verilenler: " . implode(', ', $allowed),
                ], 422);
            }
            if ($file->getSize() > $maxBytes) {
                return response()->json([
                    'success' => false,
                    'message' => "'{$origName}' çok büyük. Maksimum: {$assignment->max_file_size_mb} MB",
                ], 422);
            }

            $storedName = Str::uuid() . '.' . $extension;
            $storedPath = "assignments/{$id}/{$storedName}";
            Storage::disk('local')->put($storedPath, file_get_contents($file->getRealPath()));

            $originalFilenames[] = $origName;
            $storedFilenames[]   = $storedName;
            $filePaths[]         = $storedPath;
            $totalSize           += $file->getSize();
        }

        // Önceki "en son" teslimi arşivle (SİLME — kalıcı saklama)
        $previousLatest = AssignmentSubmission::where('assignment_id', $id)
            ->where('student_no', $studentNo)
            ->where('is_latest', true)
            ->first();

        // Eski kayıt is_latest alanı yoksa (migration öncesi) onu da bul
        if (!$previousLatest) {
            $previousLatest = AssignmentSubmission::where('assignment_id', $id)
                ->where('student_no', $studentNo)
                ->whereNull('is_latest')
                ->orderBy('submitted_at', 'desc')
                ->first();
        }

        $attempt = 1;
        if ($previousLatest) {
            $attempt = ($previousLatest->attempt ?? 1) + 1;
            $previousLatest->is_latest = false;
            $previousLatest->save();
            // Dosyaları SILME — arşivde kalsın
        }

        $submission = AssignmentSubmission::create([
            'assignment_id'      => $id,
            'student_no'         => $studentNo,
            'original_filename'  => implode(', ', $originalFilenames),
            'original_filenames' => $originalFilenames,
            'stored_filenames'   => $storedFilenames,
            'file_path'          => $filePaths[0] ?? null,
            'file_paths'         => $filePaths,
            'file_size'          => $totalSize,
            'submitted_at'       => now(),
            'grade'              => null,
            'feedback'           => null,
            'attempt'            => $attempt,
            'is_latest'          => true,
            'semester_name'      => $assignment->semester_name,
        ]);

        return response()->json([
            'success'    => true,
            'message'    => count($originalFilenames) . ' dosya başarıyla teslim edildi.',
            'submission' => [
                'id'                 => (string)$submission->_id,
                'original_filenames' => $originalFilenames,
                'submitted_at'       => $submission->submitted_at,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // INSTRUCTOR — Not ver / geri bildirim
    // ─────────────────────────────────────────────────────────
    public function gradeSubmission(Request $request, string $submissionId): JsonResponse
    {
        $request->validate([
            'grade'    => 'nullable|numeric|min:0|max:100',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $submission = AssignmentSubmission::find($submissionId);
        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Teslimat bulunamadı.'], 404);
        }

        $submission->grade    = $request->grade;
        $submission->feedback = $request->feedback;
        $submission->save();

        return response()->json(['success' => true, 'message' => 'Not kaydedildi.']);
    }

    // ─────────────────────────────────────────────────────────
    // Yardımcı: Assignment formatlama
    // ─────────────────────────────────────────────────────────
    private function formatAssignment(Assignment $a): array
    {
        $course = Course::where('course_code', $a->course_code)->first();
        return [
            'id'                  => (string)$a->_id,
            'course_code'         => $a->course_code,
            'course_name'         => $course?->name ?? $a->course_code,
            'section'             => $a->section,
            'semester_name'       => $a->semester_name,
            'title'               => $a->title,
            'description'         => $a->description,
            'due_date'            => $a->due_date,
            'max_file_size_mb'    => $a->max_file_size_mb,
            'allowed_extensions'  => $a->allowed_extensions,
            'is_active'           => $a->is_active,
            'created_at'          => $a->created_at,
        ];
    }
}
