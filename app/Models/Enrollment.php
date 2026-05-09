<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Enrollment extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'enrollments';
    protected $fillable = ['student_no', 'course_code', 'semester_name', 'section', 'status', 'enrollment_date'];
}
