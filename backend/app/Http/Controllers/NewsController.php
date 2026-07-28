<?php

namespace App\Http\Controllers;

use App\Http\Resources\NewsDetailResource;
use App\Http\Resources\NewsListResource;
use App\Models\News;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = News::query()
            ->with('category')
            ->latest('published_at');

        $this->applyFilters($query, $data);

        if ($request->filled('page') || $request->filled('per_page')) {
            $paginator = $query->paginate((int) ($data['per_page'] ?? 10));

            return response()->json([
                'data' => NewsListResource::collection($paginator->items()),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
                'message' => 'OK',
            ]);
        }

        $news = $query->get();

        return response()->json([
            'data' => NewsListResource::collection($news),
            'message' => 'OK',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'image' => ['required_without:image_url', 'image', 'max:5120'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['required', 'string'],
            'body' => ['required', 'string'],
            'published_at' => ['required', 'date'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_url'] = $this->storeNewsImage($request);
        }

        unset($data['image']);

        $news = News::query()->create($data)->load('category');

        return response()->json([
            'data' => new NewsDetailResource($news),
            'message' => 'Noticia creada.',
        ], 201);
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

    public function update(Request $request, int $id): JsonResponse
    {
        $news = News::query()->find($id);

        if (! $news) {
            return response()->json([
                'message' => 'Noticia no encontrada.',
            ], 404);
        }

        $data = $request->validate([
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'image' => ['sometimes', 'image', 'max:5120'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'excerpt' => ['sometimes', 'required', 'string'],
            'body' => ['sometimes', 'required', 'string'],
            'published_at' => ['sometimes', 'required', 'date'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_url'] = $this->storeNewsImage($request);
        }

        unset($data['image']);

        $news->update($data);

        return response()->json([
            'data' => new NewsDetailResource($news->refresh()->load('category')),
            'message' => 'Noticia actualizada.',
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

        $news->delete();

        return response()->json([
            'data' => [
                'id' => $id,
            ],
            'message' => 'Noticia eliminada.',
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

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = (string) $filters['search'];

            if (DB::connection()->getDriverName() === 'pgsql') {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->whereRaw('title ~* ?', [$search])
                        ->orWhereRaw('excerpt ~* ?', [$search])
                        ->orWhereRaw('body ~* ?', [$search]);
                });
            } else {
                $query->where(function (Builder $query) use ($search): void {
                    foreach (preg_split('/\|+/', $search) ?: [] as $term) {
                        $term = trim($term);

                        if ($term === '') {
                            continue;
                        }

                        $query
                            ->orWhere('title', 'like', "%{$term}%")
                            ->orWhere('excerpt', 'like', "%{$term}%")
                            ->orWhere('body', 'like', "%{$term}%");
                    }
                });
            }
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('published_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('published_at', '<=', $filters['date_to']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
    }

    private function storeNewsImage(Request $request): string
    {
        $image = $request->file('image');
        $directory = public_path('uploads/news');

        File::ensureDirectoryExists($directory);

        $filename = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME));
        $filename = ($filename ?: 'news-image').'-'.Str::random(8).'.'.$image->extension();

        File::put($directory.DIRECTORY_SEPARATOR.$filename, File::get($image->getRealPath()));

        return 'uploads/news/'.$filename;
    }
}
