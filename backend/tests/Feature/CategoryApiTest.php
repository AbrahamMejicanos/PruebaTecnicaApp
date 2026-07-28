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
                    '*' => ['id', 'name', 'description'],
                ],
            ]);
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
