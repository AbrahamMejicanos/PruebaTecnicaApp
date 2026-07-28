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
            'image_url' => $this->image_url,
            'excerpt' => $this->excerpt,
            'published_at' => $this->published_at?->toISOString(),
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
