<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Student extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'students';

    protected $hidden = ['password'];

    protected $fillable = [
        'student_no',
        'department_id',
        'enrollment_year',
        'sequence_no',
        'personal',
        'academic',
        'courses',
        'password',
        'created_at',
        'updated_at',
    ];
}
