<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class CourseOffering extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'course_offerings';
    protected $fillable = ['course_code', 'semester_name', 'instructor_id', 'section', 'capacity', 'enrolled_count', 'schedule', 'is_active'];
}
