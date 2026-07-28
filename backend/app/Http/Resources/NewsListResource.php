<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsListResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image_url' => $this->resolveImageUrl($request),
            'excerpt' => $this->excerpt,
            'published_at' => $this->published_at?->toISOString(),
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }

    private function resolveImageUrl(Request $request): string
    {
        if (str_starts_with($this->image_url, 'http://') || str_starts_with($this->image_url, 'https://')) {
            return $this->image_url;
        }

        return $request->getSchemeAndHttpHost().'/'.ltrim($this->image_url, '/');
    }
}
