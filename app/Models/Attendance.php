<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Attendance extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'attendances';
    protected $fillable = [
        'session_id', 'course_code', 'course_name', 'section',
        'instructor_id', 'student_no', 'date', 'week_number', 'status', 'method',
    ];
}
