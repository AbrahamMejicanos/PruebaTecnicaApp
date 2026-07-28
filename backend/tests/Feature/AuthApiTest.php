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
            ]);
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
            ->assertJsonPath('data.email', 'demo@example.com');
    }

    public function test_protected_routes_reject_requests_without_token(): void
    {
        $response = $this->getJson('/api/news');

        $response->assertUnauthorized();
    }
}
