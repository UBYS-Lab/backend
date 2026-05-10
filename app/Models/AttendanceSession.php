<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class AttendanceSession extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'attendance_sessions';
    protected $fillable = [
        'course_code', 'course_name', 'section', 'instructor_id',
        'date', 'week_number', 'qr_token', 'expires_at',
        'present_students', 'absent_students', 'late_students',
        'is_closed',
    ];
    protected $casts = ['is_closed' => 'boolean', 'expires_at' => 'datetime'];
}
