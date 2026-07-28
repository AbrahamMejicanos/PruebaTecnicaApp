<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveJwtSession
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();
        $jwtId = JWTAuth::parseToken()->getPayload()->get('jti');

        if (! $user || ! $user->active_jwt_id || $user->active_jwt_id !== $jwtId) {
            return response()->json([
                'message' => 'Sesion reemplazada por un nuevo inicio de sesion.',
            ], 401);
        }

        return $next($request);
    }
}
