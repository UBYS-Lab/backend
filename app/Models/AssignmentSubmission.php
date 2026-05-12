<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class AssignmentSubmission extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'assignment_submissions';

    protected $fillable = [
        'assignment_id',
        'student_no',
        'original_filename',
        'original_filenames',
        'stored_filename',
        'stored_filenames',
        'file_path',
        'file_paths',
        'file_size',
        'submitted_at',
        'grade',
        'feedback',
        'attempt',
        'is_latest',
        'semester_name',
    ];

    protected $casts = [
        'submitted_at'       => 'datetime',
        'original_filenames' => 'array',
        'stored_filenames'   => 'array',
        'file_paths'         => 'array',
        'is_latest'          => 'boolean',
        'attempt'            => 'integer',
    ];
}
