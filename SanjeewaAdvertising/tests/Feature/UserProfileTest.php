<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Modules\User\Models\SystemModule;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_staff_user_sidebar_shows_user_profile_and_hides_user_control_and_admin_profile(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Nimal',
            'last_name' => 'Fernando',
            'mobile' => '0772222222',
            'register_at' => now(),
            'username' => 'nimal',
            'password' => Hash::make('secret123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::create(['id' => 1, 'system_module' => 'Dashboard']);
        $staffUser->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 0,
            'edit' => 0,
            'delete' => 0,
            'export' => 0,
        ]);

        $response = $this->actingAs($staffUser, 'web')
            ->withSession(['active_portal' => 'user'])
            ->get('/dashboard');

        $response->assertOk();
        $response->assertSee('User Profile');
        $response->assertDontSee('Admin Profile');
        $response->assertDontSee('data-route="user-control"', false);
    }

    public function test_admin_sidebar_shows_user_control_and_admin_profile(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $adminUser = User::create([
            'first_name' => 'System',
            'last_name' => 'Admin',
            'mobile' => '0770000000',
            'register_at' => now(),
            'username' => 'admin',
            'password' => Hash::make('secret123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::create(['id' => 1, 'system_module' => 'Dashboard']);
        $adminUser->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $response = $this->actingAs($adminUser, 'web')
            ->withSession(['active_portal' => 'admin'])
            ->get('/admin/dashboard');

        $response->assertOk();
        $response->assertSee('Admin Profile');
        $response->assertSee('User Control');
    }

    public function test_user_profile_page_renders_successfully(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Saman',
            'last_name' => 'Silva',
            'mobile' => '0773333333',
            'register_at' => now(),
            'username' => 'saman',
            'password' => Hash::make('secret123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $response = $this->actingAs($staffUser, 'web')
            ->get('/profile');

        $response->assertOk();
        $response->assertSee('User Profile & Credentials', false);
        $response->assertSee('Saman Silva');
        $response->assertSee('0773333333');
    }

    public function test_user_profile_data_endpoint(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Sunil',
            'last_name' => 'Dias',
            'mobile' => '0774444444',
            'register_at' => now(),
            'username' => 'sunil',
            'password' => Hash::make('secret123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $response = $this->actingAs($staffUser, 'web')
            ->getJson('/user/profile/data');

        $response->assertOk();
        $response->assertJsonPath('data.username', 'sunil');
        $response->assertJsonPath('data.mobile', '0774444444');
    }

    public function test_user_profile_update_details_and_password(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Amal',
            'last_name' => 'Perera',
            'mobile' => '0775555555',
            'register_at' => now(),
            'username' => 'amal',
            'password' => Hash::make('oldpassword123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        // 1. Wrong current password should fail
        $failResponse = $this->actingAs($staffUser, 'web')
            ->putJson('/user/profile', [
                'first_name' => 'Amal Updated',
                'last_name' => 'Perera',
                'mobile' => '0775555555',
                'current_password' => 'wrongpass',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $failResponse->assertStatus(422);

        // 2. Correct current password updates password and names
        $successResponse = $this->actingAs($staffUser, 'web')
            ->putJson('/user/profile', [
                'first_name' => 'Amal Updated',
                'last_name' => 'Perera Updated',
                'mobile' => '0779999999',
                'current_password' => 'oldpassword123',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $successResponse->assertOk();
        $staffUser->refresh();
        $this->assertEquals('Amal Updated', $staffUser->first_name);
        $this->assertEquals('0779999999', $staffUser->mobile);
        $this->assertTrue(Hash::check('newpassword123', $staffUser->password));
    }

    public function test_user_can_update_profile_details_alone_without_password(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Kamal',
            'last_name' => 'Gunaratne',
            'mobile' => '0776666666',
            'register_at' => now(),
            'username' => 'kamal',
            'password' => Hash::make('mypassword123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $response = $this->actingAs($staffUser, 'web')
            ->putJson('/user/profile', [
                'first_name' => 'Kamal New',
                'last_name' => 'Gunaratne New',
                'mobile' => '0778888888',
            ]);

        $response->assertOk();
        $staffUser->refresh();
        $this->assertEquals('Kamal New', $staffUser->first_name);
        $this->assertEquals('Gunaratne New', $staffUser->last_name);
        $this->assertEquals('0778888888', $staffUser->mobile);
        $this->assertTrue(Hash::check('mypassword123', $staffUser->password));
    }

    public function test_user_can_update_password_alone_without_profile_details(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Ruwan',
            'last_name' => 'Silva',
            'mobile' => '0777777777',
            'register_at' => now(),
            'username' => 'ruwan',
            'password' => Hash::make('initialpass123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $response = $this->actingAs($staffUser, 'web')
            ->putJson('/user/profile', [
                'current_password' => 'initialpass123',
                'password' => 'brandnewpass456',
                'password_confirmation' => 'brandnewpass456',
            ]);

        $response->assertOk();
        $staffUser->refresh();
        $this->assertTrue(Hash::check('brandnewpass456', $staffUser->password));
        $this->assertEquals('Ruwan', $staffUser->first_name);
    }

    public function test_user_can_update_password_via_dedicated_password_endpoint(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Ruwan',
            'last_name' => 'Silva',
            'mobile' => '0777777778',
            'register_at' => now(),
            'username' => 'ruwan_dedicated',
            'password' => Hash::make('mypassword123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $response = $this->actingAs($staffUser, 'web')
            ->putJson('/user/profile/password', [
                'current_password' => 'mypassword123',
                'password' => 'newsecurepass789',
                'password_confirmation' => 'newsecurepass789',
            ]);

        $response->assertOk();
        $staffUser->refresh();
        $this->assertTrue(Hash::check('newsecurepass789', $staffUser->password));
    }
}
