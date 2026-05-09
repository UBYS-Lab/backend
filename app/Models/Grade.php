<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Grade extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'grades';
    protected $fillable = ['student_no', 'course_code', 'semester_name', 'score_breakdown', 'raw_score', 'letter_grade', 'grade_point', 'is_passing', 'instructor_id', 'graded_at'];
}
