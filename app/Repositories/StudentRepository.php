<?php

namespace App\Repositories;

use App\Models\Student;

class StudentRepository
{
    public function findByStudentNo(string $studentNo): ?Student
    {
        return Student::where('student_no', $studentNo)->first();
    }
}
