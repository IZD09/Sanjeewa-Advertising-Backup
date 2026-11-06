<?php

namespace Tests\Feature;

use Database\Seeders\AdminStatusSeeder;
use Database\Seeders\AdminTypeSeeder;
use Database\Seeders\DefaultAdminSeeder;
use Database\Seeders\UserStatusSeeder;
use Modules\Admin\Models\Admin;
use Modules\User\Models\SystemModule;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class UserPermissionTest extends TestCase
{
    private User $user;

    private SystemModule $module;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate');
        $this->seed(UserStatusSeeder::class);

        $status = UserStatus::firstOrCreate(['user_status' => 'Active']);

        $this->user = User::firstOrCreate(
            ['username' => 'test_perm_user'],
            [
                'first_name' => 'Perm',
                'last_name' => 'Tester',
                'mobile' => '0779998877',
                'register_at' => now(),
                'password' => bcrypt('password123'),
                'is_login' => false,
                'user_statuses_id' => $status->id,
            ]
        );

        $this->module = SystemModule::firstOrCreate(['system_module' => 'Test Module']);
    }

    public function test_can_list_system_modules(): void
    {
        $response = $this->getJson('/api/v1/system-modules?all=true');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonFragment(['system_module' => 'Test Module']);
    }

    public function test_can_create_system_module(): void
    {
        $name = 'Custom Module ' . uniqid();
        $response = $this->postJson('/api/v1/system-modules', [
            'system_module' => $name,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.system_module', $name);

        $this->assertDatabaseHas('system_modules', ['system_module' => $name]);
    }

    public function test_can_assign_permission_to_user(): void
    {
        $response = $this->postJson("/api/v1/users/{$this->user->id}/permissions", [
            'system_modules_id' => $this->module->id,
            'view' => true,
            'create' => true,
            'edit' => false,
            'delete' => false,
            'export' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.system_modules_id', $this->module->id)
            ->assertJsonPath('data.view', true)
            ->assertJsonPath('data.create', true)
            ->assertJsonPath('data.edit', false)
            ->assertJsonPath('data.delete', false)
            ->assertJsonPath('data.export', true);

        $this->assertDatabaseHas('system_modules_has_users', [
            'users_id' => $this->user->id,
            'system_modules_id' => $this->module->id,
            'view' => 1,
            'create' => 1,
            'edit' => 0,
            'delete' => 0,
            'export' => 1,
        ]);
    }

    public function test_can_get_user_permissions(): void
    {
        SystemModuleUser::firstOrCreate(
            [
                'users_id' => $this->user->id,
                'system_modules_id' => $this->module->id,
            ],
            [
                'view' => 1,
                'create' => 0,
                'edit' => 0,
                'delete' => 0,
                'export' => 0,
            ]
        );

        $response = $this->getJson("/api/v1/users/{$this->user->id}/permissions");

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonFragment(['system_modules_id' => $this->module->id]);
    }

    public function test_can_sync_user_permissions(): void
    {
        $module2 = SystemModule::firstOrCreate(['system_module' => 'Second Test Module']);

        $response = $this->putJson("/api/v1/users/{$this->user->id}/permissions/sync", [
            'permissions' => [
                [
                    'system_modules_id' => $this->module->id,
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => false,
                    'export' => true,
                ],
                [
                    'system_modules_id' => $module2->id,
                    'view' => true,
                    'create' => false,
                    'edit' => false,
                    'delete' => false,
                    'export' => false,
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('system_modules_has_users', [
            'users_id' => $this->user->id,
            'system_modules_id' => $this->module->id,
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 0,
            'export' => 1,
        ]);
        $this->assertDatabaseHas('system_modules_has_users', [
            'users_id' => $this->user->id,
            'system_modules_id' => $module2->id,
            'view' => 1,
            'create' => 0,
            'edit' => 0,
            'delete' => 0,
            'export' => 0,
        ]);
    }

    public function test_can_revoke_user_permission(): void
    {
        SystemModuleUser::firstOrCreate(
            [
                'users_id' => $this->user->id,
                'system_modules_id' => $this->module->id,
            ],
            [
                'view' => 1,
                'create' => 1,
                'edit' => 0,
                'delete' => 0,
                'export' => 0,
            ]
        );

        $response = $this->deleteJson("/api/v1/users/{$this->user->id}/permissions/{$this->module->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('system_modules_has_users', [
            'users_id' => $this->user->id,
            'system_modules_id' => $this->module->id,
        ]);
    }

    public function test_user_model_relationships(): void
    {
        SystemModuleUser::firstOrCreate(
            [
                'users_id' => $this->user->id,
                'system_modules_id' => $this->module->id,
            ],
            [
                'view' => 1,
                'create' => 1,
                'edit' => 1,
                'delete' => 1,
                'export' => 1,
            ]
        );

        $freshUser = User::with(['systemModules', 'userPermissions'])->find($this->user->id);
        $this->assertCount(1, $freshUser->systemModules);
        $this->assertSame($this->module->id, $freshUser->systemModules->first()->id);
        $this->assertCount(1, $freshUser->userPermissions);
    }

    public function test_user_control_view_renders_database_statuses(): void
    {
        $this->seed(AdminStatusSeeder::class);
        $this->seed(AdminTypeSeeder::class);
        $this->seed(DefaultAdminSeeder::class);

        $admin = Admin::where('username', 'admin')->first();

        $response = $this->actingAs($admin, 'admin')->get('/admin/user-control');

        $response->assertStatus(200)
            ->assertSee('id="userStatusSelect"', false)
            ->assertSee('Active')
            ->assertSee('Inactive')
            ->assertSee('Suspended')
            ->assertSee('Pending');
    }
}
