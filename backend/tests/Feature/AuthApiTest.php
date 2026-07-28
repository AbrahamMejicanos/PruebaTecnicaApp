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
            'email' => 'demo@example.com',
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'OK')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'token_type',
                    'expires_in',
                    'user' => ['id', 'name', 'email'],
                ],
            ])
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
            'email' => 'demo@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Credenciales invalidas.');
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $this->seed();
        $user = User::query()->where('email', 'demo@example.com')->firstOrFail();

        $response = $this
            ->actingAs($user, 'api')
            ->getJson('/api/me');

        $response
            ->assertOk()
            ->assertJsonPath('data.email', 'demo@example.com')
            ->assertJsonMissingPath('data.created_at')
            ->assertJsonMissingPath('data.updated_at');
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
}
