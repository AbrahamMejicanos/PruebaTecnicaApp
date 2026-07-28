<?php

namespace App\Http\Controllers;

use App\Http\Resources\NewsListResource;
use App\Models\News;
use Illuminate\Http\JsonResponse;

class FavoriteController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth('api')->user();

        $favorites = $user->favoriteNews()
            ->with('category')
            ->latest('favorite_news.created_at')
            ->get();

        return response()->json([
            'data' => NewsListResource::collection($favorites),
            'message' => 'OK',
        ]);
    }

    public function store(int $id): JsonResponse
    {
        $news = News::query()->find($id);

        if (! $news) {
            return response()->json([
                'message' => 'Noticia no encontrada.',
            ], 404);
        }

        auth('api')->user()->favoriteNews()->syncWithoutDetaching([$news->id]);

        return response()->json([
            'data' => [
                'news_id' => $news->id,
                'is_favorite' => true,
            ],
            'message' => 'Noticia agregada a favoritos.',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $news = News::query()->find($id);

        if (! $news) {
            return response()->json([
                'message' => 'Noticia no encontrada.',
            ], 404);
        }

        auth('api')->user()->favoriteNews()->detach($news->id);

        return response()->json([
            'data' => [
                'news_id' => $news->id,
                'is_favorite' => false,
            ],
            'message' => 'Noticia removida de favoritos.',
        ]);
    }
}
