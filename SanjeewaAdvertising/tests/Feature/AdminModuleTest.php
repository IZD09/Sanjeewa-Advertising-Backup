<?php

namespace Tests\Feature;

use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminStatus;
use Modules\Admin\Models\AdminType;
use Tests\TestCase;

class AdminModuleTest extends TestCase
{
    private AdminType $adminType;

    private AdminStatus $adminStatus;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $this->adminType = AdminType::firstOrCreate(['admin_type' => 'Super Admin']);
        $this->adminStatus = AdminStatus::firstOrCreate(['admin_statas' => 'Active']);
    }

    public function test_can_create_admin(): void
    {
        $payload = [
            'admin_types_id' => $this->adminType->id,
            'admin_statuses_id' => $this->adminStatus->id,
            'first_name' => 'System',
            'last_name' => 'Admin',
            'mobile' => '0778889900',
            'email' => 'admin_' . uniqid() . '@example.com',
            'username' => 'sysadmin_' . uniqid(),
            'password' => 'secret1234',
        ];

        $response = $this->postJson('/api/v1/admins', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Admin created successfully.',
            ])
            ->assertJsonPath('data.first_name', 'System');

        $this->assertDatabaseHas('admins', [
            'username' => $payload['username'],
            'email' => $payload['email'],
        ]);
    }

    public function test_can_list_and_search_admins(): void
    {
        Admin::create([
            'admin_types_id' => $this->adminType->id,
            'admin_statuses_id' => $this->adminStatus->id,
            'first_name' => 'Searchable',
            'last_name' => 'Admin',
            'mobile' => '0771239999',
            'email' => 'search_' . uniqid() . '@example.com',
            'username' => 'search_' . uniqid(),
            'password' => bcrypt('secret'),
            'add_time' => now(),
            'is_log' => 0,
        ]);

        $this->getJson('/api/v1/admins')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/api/v1/admins/all')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/api/v1/admins/search?q=Searchable')->assertStatus(200);
        $this->getJson('/api/v1/admins/types')->assertStatus(200);
        $this->getJson('/api/v1/admins/statuses')->assertStatus(200);
    }

    public function test_can_show_update_and_change_status(): void
    {
        $admin = Admin::create([
            'admin_types_id' => $this->adminType->id,
            'admin_statuses_id' => $this->adminStatus->id,
            'first_name' => 'Original',
            'last_name' => 'Admin',
            'mobile' => '0770001122',
            'email' => 'orig_' . uniqid() . '@example.com',
            'username' => 'orig_' . uniqid(),
            'password' => bcrypt('secret'),
            'add_time' => now(),
            'is_log' => 0,
        ]);

        // Show
        $this->getJson("/api/v1/admins/{$admin->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $admin->id);

        // Update
        $this->putJson("/api/v1/admins/{$admin->id}", [
            'first_name' => 'Updated Admin',
        ])->assertStatus(200)->assertJsonPath('data.first_name', 'Updated Admin');

        // Change Status
        $inactiveStatus = AdminStatus::firstOrCreate(['admin_statas' => 'Inactive']);
        $this->patchJson("/api/v1/admins/{$admin->id}/status", [
            'admin_statuses_id' => $inactiveStatus->id,
        ])->assertStatus(200)->assertJsonPath('data.admin_statuses_id', $inactiveStatus->id);

        // Logins
        $this->getJson("/api/v1/admins/{$admin->id}/logins")->assertStatus(200);

        // Delete
        $this->deleteJson("/api/v1/admins/{$admin->id}")->assertStatus(200);
        $this->assertDatabaseMissing('admins', ['id' => $admin->id]);
    }
}
