<?php

namespace Tests\Feature;

use Database\Seeders\AdminStatusSeeder;
use Database\Seeders\AdminTypeSeeder;
use Database\Seeders\DefaultAdminSeeder;
use Database\Seeders\PermisionStateSeeder;
use Database\Seeders\SystemModuleSeeder;
use Database\Seeders\UserStatusSeeder;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\Admin;
use Modules\User\Models\PermisionState;
use Modules\User\Models\SystemModule;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $this->seed(UserStatusSeeder::class);
        $this->seed(AdminStatusSeeder::class);
        $this->seed(AdminTypeSeeder::class);
        $this->seed(SystemModuleSeeder::class);
        $this->seed(PermisionStateSeeder::class);
        $this->seed(DefaultAdminSeeder::class);
    }

    public function test_guest_cannot_create_user_via_admin_route(): void
    {
        $response = $this->postJson('/admin/users', [
            'first_name' => 'Guest',
            'last_name' => 'Attempt',
            'mobile' => '0779991122',
            'username' => 'guest_attempt',
            'password' => 'Secret123',
            'user_statuses_id' => 1,
        ]);

        $this->assertTrue(in_array($response->status(), [401, 403, 302], true));
    }

    public function test_authenticated_admin_can_create_user_via_admin_web_route(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $unique = uniqid();
        $response = $this->actingAs($admin, 'admin')->postJson('/admin/users', [
            'first_name' => 'Dilshan',
            'last_name' => 'Silva',
            'mobile' => '077'.rand(1000000, 9999999),
            'username' => 'dilshan_'.$unique,
            'password' => 'SecretPass123',
            'user_statuses_id' => 1,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User created successfully.',
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'dilshan_'.$unique,
            'first_name' => 'Dilshan',
        ]);

        $this->assertDatabaseHas('activities', [
            'user_or_admin' => 2,
        ]);

        $this->assertDatabaseHas('admin_activities', [
            'admins_id' => $admin->id,
        ]);
    }

    public function test_authenticated_admin_can_create_user_via_admin_api_route(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $unique = uniqid();
        $response = $this->actingAs($admin, 'admin')->postJson('/api/v1/admin/users', [
            'first_name' => 'Nuwan',
            'last_name' => 'Pradeep',
            'mobile' => '078'.rand(1000000, 9999999),
            'username' => 'nuwan_'.$unique,
            'password' => 'Nuwan123',
            'user_statuses_id' => 1,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User created successfully.',
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'nuwan_'.$unique,
        ]);
    }

    public function test_admin_can_update_user_status(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $activeStatus = UserStatus::where('user_status', 'Active')->first();
        $inactiveStatus = UserStatus::where('user_status', 'Inactive')->first();

        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'mobile' => '071'.rand(1000000, 9999999),
            'username' => 'test_user_'.uniqid(),
            'password' => Hash::make('password123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $activeStatus->id,
        ]);

        $response = $this->actingAs($admin, 'admin')->patchJson("/admin/users/{$user->id}/status", [
            'user_statuses_id' => $inactiveStatus->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'user_statuses_id' => $inactiveStatus->id,
        ]);
    }

    public function test_admin_can_sync_user_permissions(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $activeStatus = UserStatus::where('user_status', 'Active')->first();
        $module = SystemModule::first();
        $permState = PermisionState::first();

        $user = User::create([
            'first_name' => 'Perm',
            'last_name' => 'User',
            'mobile' => '072'.rand(1000000, 9999999),
            'username' => 'perm_user_'.uniqid(),
            'password' => Hash::make('password123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $activeStatus->id,
        ]);

        $response = $this->actingAs($admin, 'admin')->putJson("/admin/users/{$user->id}/permissions/sync", [
            'permissions' => [
                [
                    'system_modules_id' => $module->id,
                    'permision_stateses_id' => $permState->id,
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('system_modules_has_users', [
            'users_id' => $user->id,
            'system_modules_id' => $module->id,
            'permision_stateses_id' => $permState->id,
        ]);
    }

    public function test_admin_can_list_all_users(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $response = $this->actingAs($admin, 'admin')->getJson('/admin/users/all');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_non_admin_user_cannot_create_user_via_admin_route(): void
    {
        $activeStatus = UserStatus::where('user_status', 'Active')->first();
        $staffUser = User::create([
            'first_name' => 'Staff',
            'last_name' => 'Member',
            'mobile' => '076'.rand(1000000, 9999999),
            'username' => 'staff_'.uniqid(),
            'password' => Hash::make('password123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $activeStatus->id,
        ]);

        $response = $this->actingAs($staffUser, 'web')->postJson('/admin/users', [
            'first_name' => 'Forbidden',
            'last_name' => 'User',
            'mobile' => '0769998877',
            'username' => 'forbidden_'.uniqid(),
            'password' => 'Secret123',
            'user_statuses_id' => 1,
        ]);

        $response->assertStatus(403);
    }
}
