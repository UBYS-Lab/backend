<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::prefix('student')->group(function () {
    Route::get('schedule',              [StudentController::class, 'schedule']);
    Route::get('announcements',         [StudentController::class, 'announcements']);
    Route::get('grades',                [StudentController::class, 'grades']);
    Route::get('transcript',            [GradeController::class, 'getTranscript']);
    Route::get('available-courses',     [StudentController::class, 'availableCourses']);
    Route::post('registration-request', [StudentController::class, 'submitRegistrationRequest']);
    Route::get('registration-status',   [StudentController::class, 'registrationStatus']);
});

Route::prefix('instructor')->group(function () {
    Route::get('courses',                              [InstructorController::class, 'courses']);
    Route::get('pending-grades',                       [InstructorController::class, 'pendingGrades']);
    Route::get('announcements',                        [InstructorController::class, 'announcements']);
    Route::get('registration-requests',                [InstructorController::class, 'registrationRequests']);
    Route::post('registration-requests/{id}/review',   [InstructorController::class, 'reviewRegistrationRequest']);
    Route::get('course-grades',                        [GradeController::class, 'getCourseGrades']);
    Route::post('course-grades/batch',                 [GradeController::class, 'batchEnterGrades']);
});

Route::prefix('attendance')->group(function () {
    Route::post('/session',              [AttendanceController::class, 'createSession']);
    Route::get('/session/{id}',          [AttendanceController::class, 'sessionStatus']);
    Route::post('/session/{id}/close',   [AttendanceController::class, 'closeSession']);
    Route::post('/mark',                 [AttendanceController::class, 'markStudent']);
    Route::post('/qr-checkin',           [AttendanceController::class, 'qrCheckin']);
    Route::get('/student-report',        [AttendanceController::class, 'studentReport']);
    Route::get('/course-report',         [AttendanceController::class, 'courseReport']);
    Route::get('/active-sessions',       [AttendanceController::class, 'activeSessions']);
});

Route::prefix('announcements')->group(function () {
    Route::get('/',                     [AnnouncementController::class, 'index']);
    Route::get('/{id}',                 [AnnouncementController::class, 'show']);
    Route::post('/{id}/like',           [AnnouncementController::class, 'like']);
    Route::post('/{id}/react',          [AnnouncementController::class, 'react']);
    Route::post('/{id}/comment',        [AnnouncementController::class, 'comment']);
});

Route::prefix('manager')->group(function () {
    Route::get('stats',         [ManagerController::class, 'stats']);
    Route::get('activities',    [ManagerController::class, 'activities']);
    Route::get('announcements', [ManagerController::class, 'announcements']);
});
