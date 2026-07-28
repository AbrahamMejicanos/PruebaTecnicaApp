<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $this->seed();

        $response = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => (string) env('SUPERUSER_PASSWORD'),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'OK')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'token_type',
                    'expires_in',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role' => ['id', 'name', 'slug'],
                    ],
                ],
            ])
            ->assertJsonPath('data.user.role.slug', 'superuser')
            ->assertJsonMissingPath('data.user.created_at')
            ->assertJsonMissingPath('data.user.updated_at');
    }

    public function test_login_requires_valid_payload(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'not-an-email',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $this->seed();

        $response = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Credenciales invalidas.');
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $token = $this->loginAndGetToken();

        $response = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath('data.email', (string) env('SUPERUSER_EMAIL'))
            ->assertJsonPath('data.role.slug', 'superuser')
            ->assertJsonMissingPath('data.created_at')
            ->assertJsonMissingPath('data.updated_at');
    }

    public function test_logout_returns_the_user_that_closed_session(): void
    {
        $this->seed();

        $login = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => (string) env('SUPERUSER_PASSWORD'),
        ]);

        $token = $login->json('data.token');

        $response = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Sesion cerrada.')
            ->assertJsonPath('data.user.email', (string) env('SUPERUSER_EMAIL'))
            ->assertJsonPath('data.user.role.slug', 'superuser');
    }

    public function test_second_login_replaces_previous_token_for_same_user(): void
    {
        $this->seed();

        $firstLogin = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => (string) env('SUPERUSER_PASSWORD'),
        ]);

        $secondLogin = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => (string) env('SUPERUSER_PASSWORD'),
        ]);

        $firstToken = $firstLogin->json('data.token');
        $secondToken = $secondLogin->json('data.token');

        $this
            ->withHeader('Authorization', "Bearer {$firstToken}")
            ->getJson('/api/me')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Sesion reemplazada por un nuevo inicio de sesion.');

        $this
            ->withHeader('Authorization', "Bearer {$secondToken}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', (string) env('SUPERUSER_EMAIL'));
    }

    public function test_logout_clears_active_session_for_that_user(): void
    {
        $this->seed();

        $login = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => (string) env('SUPERUSER_PASSWORD'),
        ]);

        $token = $login->json('data.token');

        $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk();

        $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Token invalido.');

        $this->assertNull(User::query()->where('email', (string) env('SUPERUSER_EMAIL'))->firstOrFail()->active_jwt_id);
    }

    public function test_protected_routes_reject_requests_without_token(): void
    {
        $response = $this->getJson('/api/news');

        $response
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Token ausente o no autenticado.');
    }

    public function test_protected_routes_reject_invalid_token(): void
    {
        $response = $this
            ->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/news');

        $response
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Token invalido.');
    }

    private function loginAndGetToken(): string
    {
        $this->seed();

        $response = $this->postJson('/api/login', [
            'email' => (string) env('SUPERUSER_EMAIL'),
            'password' => (string) env('SUPERUSER_PASSWORD'),
        ]);

        return $response->json('data.token');
    }
}
