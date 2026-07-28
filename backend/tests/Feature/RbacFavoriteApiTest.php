<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\News;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class RbacFavoriteApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_endpoint_is_restricted_to_admin_roles(): void
    {
        $this->seed();

        $this
            ->withHeaders($this->loginHeaders('user@example.com', 'password'))
            ->getJson('/api/roles')
            ->assertForbidden()
            ->assertJsonPath('message', 'No tienes permisos para realizar esta accion.');

        $this
            ->withHeaders($this->loginHeaders('admin@example.com', 'password'))
            ->getJson('/api/roles')
            ->assertOk()
            ->assertJsonCount(4, 'data');
    }

    public function test_administrator_cannot_assign_superuser_role(): void
    {
        $this->seed();

        $normalUser = User::query()->where('email', 'user@example.com')->firstOrFail();
        $superuserRole = Role::query()->where('slug', 'superuser')->firstOrFail();

        $this
            ->withHeaders($this->loginHeaders('admin@example.com', 'password'))
            ->putJson("/api/users/{$normalUser->id}/role", [
                'role_id' => $superuserRole->id,
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Solo un superusuario puede gestionar superusuarios.');
    }

    public function test_superuser_can_assign_roles(): void
    {
        $this->seed();

        $normalUser = User::query()->where('email', 'user@example.com')->firstOrFail();
        $editorRole = Role::query()->where('slug', 'news_editor')->firstOrFail();

        $this
            ->withHeaders($this->loginHeaders((string) env('SUPERUSER_EMAIL'), (string) env('SUPERUSER_PASSWORD')))
            ->putJson("/api/users/{$normalUser->id}/role", [
                'role_id' => $editorRole->id,
            ])
            ->assertOk()
            ->assertJsonPath('data.role.slug', 'news_editor');
    }

    public function test_user_cannot_create_news_but_editor_can(): void
    {
        $this->seed();

        $category = Category::query()->firstOrFail();
        $payload = [
            'category_id' => $category->id,
            'title' => 'Nueva nota de producto',
            'image_url' => 'images/news/api-testing.png',
            'excerpt' => 'Resumen breve de la noticia.',
            'body' => 'Contenido completo de la noticia creada por el editor.',
            'published_at' => now()->toISOString(),
        ];

        $this
            ->withHeaders($this->loginHeaders('user@example.com', 'password'))
            ->postJson('/api/news', $payload)
            ->assertForbidden();

        $this
            ->withHeaders($this->loginHeaders('editor@example.com', 'password'))
            ->postJson('/api/news', $payload)
            ->assertCreated()
            ->assertJsonPath('data.title', 'Nueva nota de producto')
            ->assertJsonPath('message', 'Noticia creada.');
    }

    public function test_editor_can_create_news_with_uploaded_image(): void
    {
        $this->seed();

        $category = Category::query()->firstOrFail();

        $this
            ->withHeaders($this->loginHeaders('editor@example.com', 'password'))
            ->post('/api/news', [
                'category_id' => $category->id,
                'title' => 'Noticia con imagen subida',
                'image' => UploadedFile::fake()->createWithContent(
                    'nota.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=')
                ),
                'excerpt' => 'Resumen breve de la noticia.',
                'body' => 'Contenido completo de la noticia con imagen subida.',
                'published_at' => now()->toISOString(),
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Noticia con imagen subida');

        $this->assertDatabaseHas('news', [
            'title' => 'Noticia con imagen subida',
        ]);
    }

    public function test_normal_user_cannot_update_or_delete_news(): void
    {
        $this->seed();

        $news = News::query()->firstOrFail();
        $headers = $this->loginHeaders('user@example.com', 'password');

        $this
            ->withHeaders($headers)
            ->putJson("/api/news/{$news->id}", [
                'title' => 'Intento sin permiso',
            ])
            ->assertForbidden();

        $this
            ->withHeaders($headers)
            ->deleteJson("/api/news/{$news->id}")
            ->assertForbidden();
    }

    public function test_editor_cannot_manage_users(): void
    {
        $this->seed();

        $this
            ->withHeaders($this->loginHeaders('editor@example.com', 'password'))
            ->getJson('/api/users')
            ->assertForbidden();
    }

    public function test_news_can_be_filtered_and_paginated(): void
    {
        $this->seed();

        $this
            ->withHeaders($this->loginHeaders('user@example.com', 'password'))
            ->getJson('/api/news?search=JWT|PostgreSQL&date_from=2026-07-01&page=1&per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 2);
    }

    public function test_authenticated_user_can_manage_favorites(): void
    {
        $this->seed();

        $news = News::query()->firstOrFail();
        $headers = $this->loginHeaders('user@example.com', 'password');

        $this
            ->withHeaders($headers)
            ->postJson("/api/news/{$news->id}/favorite")
            ->assertOk()
            ->assertJsonPath('data.is_favorite', true);

        $this
            ->withHeaders($headers)
            ->getJson('/api/favorites')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_favorite', true);

        $this
            ->withHeaders($headers)
            ->deleteJson("/api/news/{$news->id}/favorite")
            ->assertOk()
            ->assertJsonPath('data.is_favorite', false);
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
