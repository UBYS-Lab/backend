<?php

namespace App\Http\Controllers;

use App\Http\Responses\ApiResponse;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'student_no' => 'required|string',
            'password'   => 'required|string',
        ]);

        $student = $this->authService->attempt($request->student_no, $request->password);

        if (!$student) {
            return ApiResponse::error('Öğrenci numarası veya şifre hatalı.', null, 401);
        }

        return ApiResponse::success('Giriş başarılı.', ['student' => $student]);
    }
}
