<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Database\Seeders\AdminStatusSeeder;
use Modules\Admin\Database\Seeders\AdminTypeSeeder;
use Modules\Admin\Database\Seeders\DefaultAdminSeeder;
use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminLogin;
use Modules\User\Database\Seeders\SystemModuleSeeder;
use Modules\User\Database\Seeders\UserStatusSeeder;
use Modules\User\Models\User;
use Modules\User\Models\UserLogin;
use Tests\TestCase;

class SessionInactivityTimeoutTest extends TestCase
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

    public function test_active_session_within_10_minutes_is_allowed_and_updates_last_activity(): void
    {
        $admin = Admin::where('username', 'admin')->first();

        $response = $this->actingAs($admin, 'admin')
            ->withSession([
                'active_portal' => 'admin',
                'last_activity_time' => now()->subMinutes(3)->timestamp,
            ])
            ->get('/admin/dashboard');

        $response->assertStatus(200);
        $this->assertTrue(Auth::guard('admin')->check());
        $this->assertGreaterThanOrEqual(now()->subSeconds(5)->timestamp, session('last_activity_time'));
    }

    public function test_admin_session_idle_for_more_than_10_minutes_is_deactivated(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $admin->update(['is_log' => 1]);

        $loginRecord = AdminLogin::create([
            'admins_id' => $admin->id,
            'login' => now()->subMinutes(20),
            'logout' => null,
        ]);

        $response = $this->actingAs($admin, 'admin')
            ->withSession([
                'active_portal' => 'admin',
                'last_activity_time' => now()->subMinutes(11)->timestamp, // 11 minutes idle
            ])
            ->get('/admin/dashboard');

        // Should be redirected to admin.login
        $response->assertRedirect(route('admin.login'));
        $this->assertFalse(Auth::guard('admin')->check());

        // Admin database state must be deactivated
        $admin->refresh();
        $this->assertEquals(0, $admin->is_log);

        $loginRecord->refresh();
        $this->assertNotNull($loginRecord->logout);
    }

    public function test_user_session_idle_for_more_than_10_minutes_is_deactivated(): void
    {
        $user = User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'password' => Hash::make('password123'),
            'mobile' => '0771234567',
            'user_statuses_id' => 1,
            'is_login' => 1,
            'register_at' => now(),
        ]);

        $loginRecord = UserLogin::create([
            'user_id' => $user->id,
            'login' => now()->subMinutes(25),
            'logout' => null,
        ]);

        $response = $this->actingAs($user, 'web')
            ->withSession([
                'active_portal' => 'user',
                'last_activity_time' => now()->subMinutes(15)->timestamp, // 15 minutes idle
            ])
            ->get('/dashboard');

        // Should be redirected to user login
        $response->assertRedirect(route('login'));
        $this->assertFalse(Auth::guard('web')->check());

        // User database state must be deactivated
        $user->refresh();
        $this->assertEquals(0, $user->is_login);

        $loginRecord->refresh();
        $this->assertNotNull($loginRecord->logout);
    }

    public function test_ajax_request_after_10_minutes_idle_returns_401_with_session_expired(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $admin->update(['is_log' => 1]);

        $response = $this->actingAs($admin, 'admin')
            ->withSession([
                'active_portal' => 'admin',
                'last_activity_time' => now()->subMinutes(12)->timestamp,
            ])
            ->getJson('/admin/users/all');

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'session_expired' => true,
        ]);
        $this->assertFalse(Auth::guard('admin')->check());
    }

    public function test_background_poll_request_does_not_reset_inactivity_timer(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $pastTimestamp = now()->subMinutes(5)->timestamp;

        $response = $this->actingAs($admin, 'admin')
            ->withSession([
                'active_portal' => 'admin',
                'last_activity_time' => $pastTimestamp,
            ])
            ->withHeaders([
                'X-Background-Poll' => '1',
            ])
            ->getJson('/advertising/users/all');

        $response->assertStatus(200);
        // The background poll must NOT have changed last_activity_time to now()
        $this->assertEquals($pastTimestamp, session('last_activity_time'));
    }

    public function test_keep_alive_endpoint_refreshes_last_activity_time(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $oldTimestamp = now()->subMinutes(8)->timestamp;

        $response = $this->actingAs($admin, 'admin')
            ->withSession([
                'active_portal' => 'admin',
                'last_activity_time' => $oldTimestamp,
            ])
            ->postJson('/session/keep-alive');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'authenticated' => true,
        ]);

        $this->assertGreaterThan($oldTimestamp, session('last_activity_time'));
    }

    public function test_timeout_endpoint_explicitly_deactivates_session(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $admin->update(['is_log' => 1]);

        $loginRecord = AdminLogin::create([
            'admins_id' => $admin->id,
            'login' => now()->subMinutes(12),
            'logout' => null,
        ]);

        $response = $this->actingAs($admin, 'admin')
            ->withSession([
                'active_portal' => 'admin',
                'last_activity_time' => now()->subMinutes(10)->timestamp,
            ])
            ->postJson('/session/inactivity-timeout');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'session_expired' => true,
            'redirect_url' => route('admin.login'),
        ]);

        $this->assertFalse(Auth::guard('admin')->check());
        $admin->refresh();
        $this->assertEquals(0, $admin->is_log);
        $loginRecord->refresh();
        $this->assertNotNull($loginRecord->logout);
    }
}
