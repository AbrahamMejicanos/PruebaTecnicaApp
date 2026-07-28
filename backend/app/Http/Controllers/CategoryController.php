<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\NewsListResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount('news')
            ->orderByDesc('news_count')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
            'message' => 'OK',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:categories,name'],
            'description' => ['nullable', 'string'],
        ]);

        $category = Category::query()
            ->create($data)
            ->loadCount('news');

        return response()->json([
            'data' => new CategoryResource($category),
            'message' => 'Categoria creada.',
        ], 201);
    }

    public function news(int $id): JsonResponse
    {
        $category = Category::query()
            ->withCount('news')
            ->find($id);

        if (! $category) {
            return response()->json([
                'message' => 'Categoria no encontrada.',
            ], 404);
        }

        $news = $category->news()
            ->with('category')
            ->latest('published_at')
            ->get();

        return response()->json([
            'data' => [
                'category' => new CategoryResource($category),
                'news' => NewsListResource::collection($news),
            ],
            'message' => 'OK',
        ]);
    }
}
