<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Semester extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'semesters';
    protected $fillable = ['name', 'academic_year', 'type', 'start_date', 'end_date', 'is_active'];
}
