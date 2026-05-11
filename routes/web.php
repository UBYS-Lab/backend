<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/checkin', function (\Illuminate\Http\Request $req) {
    $token = $req->query('token', '');
    return view('checkin', ['token' => $token]);
});
