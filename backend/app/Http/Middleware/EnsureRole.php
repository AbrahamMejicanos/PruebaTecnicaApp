<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = auth('api')->user()?->loadMissing('role');

        if (! $user || ! $user->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'No tienes permisos para realizar esta accion.',
            ], 403);
        }

        return $next($request);
    }
}
