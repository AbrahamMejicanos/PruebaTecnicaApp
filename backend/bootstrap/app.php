<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(
            fn (Request $request) => $request->is('api/*') ? null : route('login'),
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('api/*')) {
                if ($request->bearerToken()) {
                    return response()->json([
                        'message' => 'Token invalido.',
                    ], 401);
                }

                return response()->json([
                    'message' => 'Token ausente o no autenticado.',
                ], 401);
            }
        });

        $exceptions->render(function (TokenInvalidException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Token invalido.',
                ], 401);
            }
        });

        $exceptions->render(function (TokenExpiredException $exception, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Token expirado.',
                ], 401);
            }
        });
    })->create();
