<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureActiveJwtSession;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api', EnsureActiveJwtSession::class])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/news', [NewsController::class, 'index']);
    Route::post('/news', [NewsController::class, 'store'])->middleware('role:superuser,administrator,news_editor');
    Route::get('/news/{id}', [NewsController::class, 'show'])->whereNumber('id');
    Route::post('/news/{id}', [NewsController::class, 'update'])->whereNumber('id')->middleware('role:superuser,administrator,news_editor');
    Route::put('/news/{id}', [NewsController::class, 'update'])->whereNumber('id')->middleware('role:superuser,administrator,news_editor');
    Route::delete('/news/{id}', [NewsController::class, 'destroy'])->whereNumber('id')->middleware('role:superuser,administrator,news_editor');
    Route::get('/news/{id}/recommended', [NewsController::class, 'recommended'])->whereNumber('id');

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('role:superuser,administrator');
    Route::get('/categories/{id}/news', [CategoryController::class, 'news'])->whereNumber('id');

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/news/{id}/favorite', [FavoriteController::class, 'store'])->whereNumber('id');
    Route::delete('/news/{id}/favorite', [FavoriteController::class, 'destroy'])->whereNumber('id');

    Route::middleware('role:superuser,administrator')->group(function (): void {
        Route::get('/roles', [RoleController::class, 'index']);

        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show'])->whereNumber('id');
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update'])->whereNumber('id');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->whereNumber('id');
        Route::put('/users/{id}/role', [UserController::class, 'updateRole'])->whereNumber('id');
    });
});
