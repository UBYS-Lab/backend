<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Announcement extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'announcements';
    protected $fillable = ['title', 'content', 'target_audience', 'department_id', 'published_by', 'publisher_type', 'priority', 'is_active'];
}
