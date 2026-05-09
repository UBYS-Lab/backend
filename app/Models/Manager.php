<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Manager extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'managers';

    protected $hidden = ['password'];

    protected $fillable = [
        'staff_id',
        'role',
        'unit_type',
        'unit_id',
        'personal',
        'password',
        'is_active',
        'appointment_start',
        'appointment_end',
        'created_at',
        'updated_at',
    ];
}
