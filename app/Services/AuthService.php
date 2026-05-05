<?php

namespace App\Services;

use App\Repositories\StudentRepository;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private StudentRepository $students) {}

    public function attempt(string $studentNo, string $password): ?array
    {
        $student = $this->students->findByStudentNo($studentNo);

        if (!$student || !Hash::check($password, $student->password)) {
            return null;
        }

        return [
            'student_no'    => $student->student_no,
            'full_name'     => $student->personal['first_name'] . ' ' . $student->personal['last_name'],
            'email'         => $student->personal['email'],
            'department_id' => $student->department_id,
            'status'        => $student->academic['status'],
            'semester'      => $student->academic['current_semester'],
            'gpa'           => $student->academic['gpa'],
        ];
    }
}
