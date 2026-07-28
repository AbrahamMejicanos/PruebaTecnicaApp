<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_categories(): void
    {
        $headers = $this->seedAndGetAuthHeaders();

        $response = $this
            ->withHeaders($headers)
            ->getJson('/api/categories');

        $response
            ->assertOk()
            ->assertJsonPath('message', 'OK')
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'description', 'news_count'],
                ],
            ]);
    }

    public function test_categories_are_ordered_by_news_count_descending(): void
    {
        $headers = $this->seedAndGetAuthHeaders();

        $response = $this
            ->withHeaders($headers)
            ->getJson('/api/categories');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Tecnologia')
            ->assertJsonPath('data.0.news_count', 4)
            ->assertJsonPath('data.1.news_count', 2)
            ->assertJsonPath('data.2.news_count', 2);
    }

    public function test_authenticated_user_can_list_news_by_category(): void
    {
        $headers = $this->seedAndGetAuthHeaders();

        $categories = $this
            ->withHeaders($headers)
            ->getJson('/api/categories')
            ->json('data');

        $technology = collect($categories)->firstWhere('name', 'Tecnologia');

        $this
            ->withHeaders($headers)
            ->getJson("/api/categories/{$technology['id']}/news")
            ->assertOk()
            ->assertJsonPath('data.category.name', 'Tecnologia')
            ->assertJsonCount(4, 'data.news')
            ->assertJsonPath('data.news.0.category.name', 'Tecnologia');
    }

    public function test_admin_can_create_category_but_editor_cannot(): void
    {
        $this->seed();

        $this
            ->withHeaders($this->loginHeaders('editor@example.com', 'password'))
            ->postJson('/api/categories', [
                'name' => 'Seguridad',
                'description' => 'Noticias de seguridad.',
            ])
            ->assertForbidden();

        $this
            ->withHeaders($this->loginHeaders('admin@example.com', 'password'))
            ->postJson('/api/categories', [
                'name' => 'Seguridad',
                'description' => 'Noticias de seguridad.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Seguridad')
            ->assertJsonPath('data.news_count', 0);
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

    /**
     * @return array<string, string>
     */
    private function loginHeaders(string $email, string $password): array
    {
        $response = $this->postJson('/api/login', [
            'email' => $email,
            'password' => $password,
        ]);

        return [
            'Authorization' => 'Bearer '.$response->json('data.token'),
        ];
    }
}
