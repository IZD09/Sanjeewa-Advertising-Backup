<?php

namespace Tests\Feature;

use Database\Seeders\AdminStatusSeeder;
use Database\Seeders\AdminTypeSeeder;
use Database\Seeders\DefaultAdminSeeder;
use Database\Seeders\SystemModuleSeeder;
use Database\Seeders\UserStatusSeeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\Admin;
use Modules\User\Models\SystemModule;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class AuthenticationAndPermissionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $this->seed(UserStatusSeeder::class);
        $this->seed(AdminStatusSeeder::class);
        $this->seed(AdminTypeSeeder::class);
        $this->seed(SystemModuleSeeder::class);
        $this->seed(DefaultAdminSeeder::class);
    }

    public function test_unauthenticated_guest_is_redirected_to_login_when_accessing_dashboard(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_unauthenticated_guest_is_redirected_to_login_when_accessing_protected_pages(): void
    {
        $this->get('/place-order')->assertRedirect('/login');
        $this->get('/customers')->assertRedirect('/login');
        $this->get('/print-jobs')->assertRedirect('/login');
        $this->get('/inventory')->assertRedirect('/login');
    }

    public function test_unauthenticated_guest_is_redirected_to_admin_login_when_accessing_admin_pages(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/admin/login');
        $this->get('/admin/user-control')->assertRedirect('/admin/login');
    }

    public function test_default_admin_can_login_via_admin_login_endpoint(): void
    {
        $response = $this->postJson('/admin/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertTrue(Auth::guard('admin')->check());
        $this->assertSame('admin', Auth::guard('admin')->user()->username);
    }

    public function test_default_admin_can_login_via_staff_login_endpoint(): void
    {
        $response = $this->postJson('/login', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertTrue(Auth::guard('web')->check());
        $this->assertSame('admin', Auth::guard('web')->user()->username);
    }

    public function test_authenticated_admin_can_access_dashboard_and_user_control(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $response = $this->actingAs($admin, 'admin')->get('/admin/user-control');
        $response->assertStatus(200);

        $responseDash = $this->actingAs($admin, 'admin')->get('/dashboard');
        $responseDash->assertStatus(200);
    }

    public function test_user_without_module_permission_is_redirected_to_dashboard(): void
    {
        $activeStatus = UserStatus::where('user_status', 'Active')->first();
        $user = User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'mobile' => '0779998877',
            'username' => 'johndoe_'.uniqid(),
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $activeStatus->id,
        ]);

        // User has no permission for Inventory
        $response = $this->actingAs($user, 'web')->get('/inventory');

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('error');
    }

    public function test_user_with_module_permission_can_access_module(): void
    {
        $activeStatus = UserStatus::where('user_status', 'Active')->first();
        $user = User::create([
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'mobile' => '0779998866',
            'username' => 'janedoe_'.uniqid(),
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $activeStatus->id,
        ]);

        $placeOrderModule = SystemModule::where('system_module', 'Place Order')->first();

        SystemModuleUser::create([
            'users_id' => $user->id,
            'system_modules_id' => $placeOrderModule->id,
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $response = $this->actingAs($user, 'web')->get('/place-order');
        $response->assertStatus(200);
    }

    public function test_user_with_denied_permission_cannot_access_module(): void
    {
        $activeStatus = UserStatus::where('user_status', 'Active')->first();
        $user = User::create([
            'first_name' => 'Bob',
            'last_name' => 'Smith',
            'mobile' => '0779998855',
            'username' => 'bobsmith_'.uniqid(),
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $activeStatus->id,
        ]);

        $customerModule = SystemModule::where('system_module', 'Customers')->first();

        SystemModuleUser::create([
            'users_id' => $user->id,
            'system_modules_id' => $customerModule->id,
            'view' => 0,
            'create' => 0,
            'edit' => 0,
            'delete' => 0,
            'export' => 0,
        ]);

        $response = $this->actingAs($user, 'web')->get('/customers');
        $response->assertRedirect('/dashboard');
    }

    public function test_authenticated_user_visiting_login_redirects_to_dashboard(): void
    {
        $user = User::where('username', 'admin')->first();

        $response = $this->actingAs($user, 'web')->get('/login');
        $response->assertRedirect('/dashboard');
    }

    public function test_guest_cannot_create_user_via_user_module(): void
    {
        $response = $this->postJson('/api/v1/users', [
            'first_name' => 'Unauthorized',
            'last_name' => 'User',
            'mobile' => '0771112233',
            'username' => 'unauth_'.uniqid(),
            'password' => 'Secret123',
            'user_statuses_id' => 1,
        ]);

        $response->assertStatus(403);
    }

    public function test_regular_user_cannot_create_user_via_user_module(): void
    {
        $activeStatus = UserStatus::where('user_status', 'Active')->first();
        $staffUser = User::create([
            'first_name' => 'Staff',
            'last_name' => 'Member',
            'mobile' => '0772223344',
            'username' => 'staff_'.uniqid(),
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $activeStatus->id,
        ]);

        $response = $this->actingAs($staffUser, 'web')->postJson('/api/v1/users', [
            'first_name' => 'Unauthorized',
            'last_name' => 'User',
            'mobile' => '0773334455',
            'username' => 'unauth2_'.uniqid(),
            'password' => 'Secret123',
            'user_statuses_id' => 1,
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_create_user_via_user_module(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $unique = uniqid();

        $response = $this->actingAs($admin, 'admin')->postJson('/api/v1/users', [
            'first_name' => 'AdminCreated',
            'last_name' => 'User',
            'mobile' => '077'.rand(1000000, 9999999),
            'username' => 'created_'.$unique,
            'password' => 'Secret123',
            'user_statuses_id' => 1,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User created successfully.',
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'created_'.$unique,
        ]);

        // Verify Core Module activity logger captured the event
        $this->assertDatabaseHas('activities', [
            'user_or_admin' => 2,
        ]);
        $this->assertDatabaseHas('admin_activities', [
            'admins_id' => $admin->id,
        ]);
    }

    public function test_user_activity_is_logged_when_user_status_is_updated(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $user = User::where('username', 'admin')->first();

        $response = $this->actingAs($admin, 'admin')->patchJson("/api/v1/users/{$user->id}/status", [
            'user_statuses_id' => 2,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('activities', [
            'user_or_admin' => 2,
        ]);
    }
}
