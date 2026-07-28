<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_categories(): void
    {
        $this->seed();
        $user = User::query()->where('email', (string) env('SUPERUSER_EMAIL'))->firstOrFail();

        $response = $this
            ->actingAs($user, 'api')
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
}
