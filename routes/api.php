<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::prefix('student')->group(function () {
    Route::get('schedule',      [StudentController::class, 'schedule']);
    Route::get('announcements', [StudentController::class, 'announcements']);
    Route::get('grades',        [StudentController::class, 'grades']);
});

Route::prefix('instructor')->group(function () {
    Route::get('courses',        [InstructorController::class, 'courses']);
    Route::get('pending-grades', [InstructorController::class, 'pendingGrades']);
    Route::get('announcements',  [InstructorController::class, 'announcements']);
});

Route::prefix('manager')->group(function () {
    Route::get('stats',         [ManagerController::class, 'stats']);
    Route::get('activities',    [ManagerController::class, 'activities']);
    Route::get('announcements', [ManagerController::class, 'announcements']);
});
