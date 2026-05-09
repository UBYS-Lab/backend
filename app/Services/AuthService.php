<?php

namespace App\Services;

use App\Models\Instructor;
use App\Models\Manager;
use App\Repositories\StudentRepository;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private StudentRepository $students) {}

    public function attempt(string $identifier, string $password): ?array
    {
        // 1) Student
        $student = $this->students->findByStudentNo($identifier);
        if ($student && Hash::check($password, $student->password)) {
            return [
                'role'          => 'student',
                'identifier'    => $student->student_no,
                'full_name'     => ($student->personal['first_name'] ?? '') . ' ' . ($student->personal['last_name'] ?? ''),
                'email'         => $student->personal['email'] ?? null,
                'department_id' => $student->department_id,
                'class_year'    => $student->academic['class_year'] ?? null,
                'gpa'           => $student->academic['gpa'] ?? null,
                'status'        => $student->academic['status'] ?? null,
            ];
        }

        // 2) Instructor
        $instructor = Instructor::where('staff_id', $identifier)->first();
        if ($instructor && Hash::check($password, $instructor->password)) {
            return [
                'role'          => 'instructor',
                'identifier'    => $instructor->staff_id,
                'full_name'     => ($instructor->personal['first_name'] ?? '') . ' ' . ($instructor->personal['last_name'] ?? ''),
                'email'         => $instructor->personal['email'] ?? null,
                'department_id' => $instructor->department_id,
                'title'         => $instructor->academic['title'] ?? null,
            ];
        }

        // 3) Manager
        $manager = Manager::where('staff_id', $identifier)->first();
        if ($manager && Hash::check($password, $manager->password)) {
            return [
                'role'       => 'manager',
                'identifier' => $manager->staff_id,
                'full_name'  => ($manager->personal['first_name'] ?? '') . ' ' . ($manager->personal['last_name'] ?? ''),
                'email'      => $manager->personal['email'] ?? null,
                'unit_type'  => $manager->unit_type,
                'unit_id'    => $manager->unit_id,
                'manager_role' => $manager->role,
            ];
        }

        return null;
    }
}
