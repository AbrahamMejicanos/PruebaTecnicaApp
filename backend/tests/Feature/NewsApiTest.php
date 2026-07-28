<?php

namespace Tests\Feature;

use App\Models\News;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_news(): void
    {
        $headers = $this->seedAndGetAuthHeaders();

        $response = $this
            ->withHeaders($headers)
            ->getJson('/api/news');

        $response
            ->assertOk()
            ->assertJsonPath('message', 'OK')
            ->assertJsonCount(8, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'image_url',
                        'excerpt',
                        'published_at',
                        'category' => ['id', 'name', 'description'],
                    ],
                ],
            ]);
    }

    public function test_authenticated_user_can_show_news_detail(): void
    {
        $headers = $this->seedAndGetAuthHeaders();
        $news = News::query()->firstOrFail();

        $response = $this
            ->withHeaders($headers)
            ->getJson("/api/news/{$news->id}");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'OK')
            ->assertJsonPath('data.id', $news->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'image_url',
                    'excerpt',
                    'body',
                    'published_at',
                    'category' => ['id', 'name', 'description'],
                ],
            ]);
    }

    public function test_news_detail_returns_not_found_for_missing_news(): void
    {
        $headers = $this->seedAndGetAuthHeaders();

        $response = $this
            ->withHeaders($headers)
            ->getJson('/api/news/99999');

        $response
            ->assertNotFound()
            ->assertJsonPath('message', 'Noticia no encontrada.');
    }

    public function test_authenticated_user_can_fetch_recommended_news(): void
    {
        $headers = $this->seedAndGetAuthHeaders();
        $news = News::query()
            ->whereHas('category', fn ($query) => $query->where('name', 'Tecnologia'))
            ->firstOrFail();

        $response = $this
            ->withHeaders($headers)
            ->getJson("/api/news/{$news->id}/recommended");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'OK')
            ->assertJsonCount(3, 'data')
            ->assertJsonMissingPath('data.0.body');
    }

    public function test_recommended_news_returns_not_found_for_missing_news(): void
    {
        $headers = $this->seedAndGetAuthHeaders();

        $response = $this
            ->withHeaders($headers)
            ->getJson('/api/news/99999/recommended');

        $response
            ->assertNotFound()
            ->assertJsonPath('message', 'Noticia no encontrada.');
    }

    /**
     * @return array<string, string>
     */
    private function seedAndGetAuthHeaders(): array
    {
        $this->seed();

        $response = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => (string) env('SUPERUSER_PASSWORD'),
        ]);

        return [
            'Authorization' => 'Bearer '.$response->json('data.token'),
        ];
    }
}
