<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Course extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'courses';
    protected $fillable = ['course_code', 'name', 'department_id', 'credits', 'ects', 'theory_hours', 'lab_hours', 'type', 'class_year', 'prerequisites', 'is_active'];
}
