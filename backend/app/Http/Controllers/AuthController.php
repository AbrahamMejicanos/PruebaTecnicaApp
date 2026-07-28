<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales invalidas.',
            ], 401);
        }

        return response()->json([
            'data' => [
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user' => new UserResource(auth('api')->user()->load('role')),
            ],
            'message' => 'OK',
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json([
            'data' => new UserResource(auth('api')->user()->load('role')),
            'message' => 'OK',
        ]);
    }

    public function logout(): JsonResponse
    {
        $user = auth('api')->user()->load('role');

        auth('api')->logout();

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
            ],
            'message' => 'Sesion cerrada.',
        ]);
    }
}
