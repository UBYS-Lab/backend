<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class CourseRegistrationRequest extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'course_registration_requests';
    protected $guarded    = [];
    protected $dates      = ['submitted_at', 'reviewed_at'];
}
