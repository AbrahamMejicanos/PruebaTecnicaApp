<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with('role')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => UserResource::collection($users),
            'message' => 'OK',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::query()->with('role')->find($id);

        if (! $user) {
            return $this->notFound();
        }

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'OK',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        $role = Role::query()->findOrFail($data['role_id']);

        if (! $this->actorCanAssignRole($role)) {
            return $this->forbiddenSuperuser();
        }

        $user = User::query()->create($data)->load('role');

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Usuario creado.',
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::query()->with('role')->find($id);

        if (! $user) {
            return $this->notFound();
        }

        if (! $this->actorCanManageTarget($user)) {
            return $this->forbiddenSuperuser();
        }

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'required', 'string', 'min:6'],
            'role_id' => ['sometimes', 'required', 'integer', 'exists:roles,id'],
        ]);

        if (array_key_exists('role_id', $data)) {
            $role = Role::query()->findOrFail($data['role_id']);

            if (! $this->actorCanAssignRole($role)) {
                return $this->forbiddenSuperuser();
            }
        }

        $user->update($data);

        return response()->json([
            'data' => new UserResource($user->refresh()->load('role')),
            'message' => 'Usuario actualizado.',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::query()->with('role')->find($id);

        if (! $user) {
            return $this->notFound();
        }

        if (! $this->actorCanManageTarget($user)) {
            return $this->forbiddenSuperuser();
        }

        $user->delete();

        return response()->json([
            'data' => [
                'id' => $id,
            ],
            'message' => 'Usuario eliminado.',
        ]);
    }

    public function updateRole(Request $request, int $id): JsonResponse
    {
        $user = User::query()->with('role')->find($id);

        if (! $user) {
            return $this->notFound();
        }

        if (! $this->actorCanManageTarget($user)) {
            return $this->forbiddenSuperuser();
        }

        $data = $request->validate([
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        $role = Role::query()->findOrFail($data['role_id']);

        if (! $this->actorCanAssignRole($role)) {
            return $this->forbiddenSuperuser();
        }

        $user->update([
            'role_id' => $role->id,
        ]);

        return response()->json([
            'data' => new UserResource($user->refresh()->load('role')),
            'message' => 'Rol actualizado.',
        ]);
    }

    private function actorCanManageTarget(User $target): bool
    {
        $actor = auth('api')->user()->loadMissing('role');

        return $actor->isSuperuser() || ! $target->isSuperuser();
    }

    private function actorCanAssignRole(Role $role): bool
    {
        $actor = auth('api')->user()->loadMissing('role');

        return $actor->isSuperuser() || $role->slug !== 'superuser';
    }

    private function notFound(): JsonResponse
    {
        return response()->json([
            'message' => 'Usuario no encontrado.',
        ], 404);
    }

    private function forbiddenSuperuser(): JsonResponse
    {
        return response()->json([
            'message' => 'Solo un superusuario puede gestionar superusuarios.',
        ], 403);
    }
}
