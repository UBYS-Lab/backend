<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Department extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'departments';
    protected $fillable = ['department_id', 'name', 'faculty_code', 'program_duration', 'quota', 'is_active'];
}
