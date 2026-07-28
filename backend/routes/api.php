<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\NewsController;
use App\Http\Middleware\EnsureActiveJwtSession;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api', EnsureActiveJwtSession::class])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{id}', [NewsController::class, 'show'])->whereNumber('id');
    Route::get('/news/{id}/recommended', [NewsController::class, 'recommended'])->whereNumber('id');

    Route::get('/categories', [CategoryController::class, 'index']);
});
