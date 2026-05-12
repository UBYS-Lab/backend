<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Assignment extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'assignments';

    protected $fillable = [
        'course_code',
        'section',
        'semester_name',
        'instructor_id',
        'title',
        'description',
        'due_date',
        'max_file_size_mb',
        'allowed_extensions',
        'is_active',
    ];

    protected $casts = [
        'due_date'           => 'datetime',
        'is_active'          => 'boolean',
        'allowed_extensions' => 'array',
    ];
}
