<?php

namespace Tests\Feature;

use Modules\Core\Models\ActivityType;
use Tests\TestCase;

class CoreModuleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_manage_activities(): void
    {
        $type = ActivityType::firstOrCreate(['activity_type' => 'System Log '.uniqid()]);

        // 1. Create activity
        $response = $this->postJson('/api/v1/activities', [
            'activity_types_id' => $type->id,
            'activity' => 'User logged in',
        ]);
        $response->assertStatus(201)->assertJsonPath('data.activity.message', 'User logged in');

        $activityId = $response->json('data.id');

        // 2. List
        $this->getJson('/api/v1/activities')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'pagination']);

        // 3. Types
        $this->getJson('/api/v1/activities/types')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);

        // 4. Show
        $this->getJson("/api/v1/activities/{$activityId}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $activityId);
    }
}
