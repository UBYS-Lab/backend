<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Instructor extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'instructors';

    protected $hidden = ['password'];

    protected $fillable = [
        'staff_id',
        'department_id',
        'personal',
        'academic',
        'password',
        'is_active',
        'created_at',
        'updated_at',
    ];
}
