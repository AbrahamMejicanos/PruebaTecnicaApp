<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_news(): void
    {
        $user = $this->seedAndGetDemoUser();

        $response = $this
            ->actingAs($user, 'api')
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
        $user = $this->seedAndGetDemoUser();
        $news = News::query()->firstOrFail();

        $response = $this
            ->actingAs($user, 'api')
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
        $user = $this->seedAndGetDemoUser();

        $response = $this
            ->actingAs($user, 'api')
            ->getJson('/api/news/99999');

        $response
            ->assertNotFound()
            ->assertJsonPath('message', 'Noticia no encontrada.');
    }

    public function test_authenticated_user_can_fetch_recommended_news(): void
    {
        $user = $this->seedAndGetDemoUser();
        $news = News::query()
            ->whereHas('category', fn ($query) => $query->where('name', 'Tecnologia'))
            ->firstOrFail();

        $response = $this
            ->actingAs($user, 'api')
            ->getJson("/api/news/{$news->id}/recommended");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'OK')
            ->assertJsonCount(3, 'data')
            ->assertJsonMissingPath('data.0.body');
    }

    public function test_recommended_news_returns_not_found_for_missing_news(): void
    {
        $user = $this->seedAndGetDemoUser();

        $response = $this
            ->actingAs($user, 'api')
            ->getJson('/api/news/99999/recommended');

        $response
            ->assertNotFound()
            ->assertJsonPath('message', 'Noticia no encontrada.');
    }

    private function seedAndGetDemoUser(): User
    {
        $this->seed();

        return User::query()->where('email', 'demo@example.com')->firstOrFail();
    }
}
