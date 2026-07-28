<?php

namespace App\Http\Controllers;

use App\Http\Resources\NewsDetailResource;
use App\Http\Resources\NewsListResource;
use App\Models\News;
use Illuminate\Http\JsonResponse;

class NewsController extends Controller
{
    public function index(): JsonResponse
    {
        $news = News::query()
            ->with('category')
            ->latest('published_at')
            ->get();

        return response()->json([
            'data' => NewsListResource::collection($news),
            'message' => 'OK',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $news = News::query()
            ->with('category')
            ->find($id);

        if (! $news) {
            return response()->json([
                'message' => 'Noticia no encontrada.',
            ], 404);
        }

        return response()->json([
            'data' => new NewsDetailResource($news),
            'message' => 'OK',
        ]);
    }

    public function recommended(int $id): JsonResponse
    {
        $news = News::query()->find($id);

        if (! $news) {
            return response()->json([
                'message' => 'Noticia no encontrada.',
            ], 404);
        }

        $recommended = News::query()
            ->with('category')
            ->whereKeyNot($news->id)
            ->where('category_id', $news->category_id)
            ->latest('published_at')
            ->limit(3)
            ->get();

        if ($recommended->count() < 3) {
            $fill = News::query()
                ->with('category')
                ->whereKeyNot($news->id)
                ->whereNotIn('id', $recommended->pluck('id'))
                ->latest('published_at')
                ->limit(3 - $recommended->count())
                ->get();

            $recommended = $recommended->merge($fill);
        }

        return response()->json([
            'data' => NewsListResource::collection($recommended),
            'message' => 'OK',
        ]);
    }
}
