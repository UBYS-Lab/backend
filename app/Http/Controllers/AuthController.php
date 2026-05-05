<?php

namespace App\Http\Controllers;

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
            return response()->json([
                'success' => false,
                'message' => 'Öğrenci numarası veya şifre hatalı.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'student' => $student,
        ]);
    }
}
