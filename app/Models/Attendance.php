<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Attendance extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'attendances';
    protected $fillable = [
        'session_id', 'course_code', 'section', 'student_no',
        'date', 'week_number', 'status', 'method',
    ];
}
