<?php

namespace App\Http\Controllers;

use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => RoleResource::collection(Role::query()->orderBy('id')->get()),
            'message' => 'OK',
        ]);
    }
}
