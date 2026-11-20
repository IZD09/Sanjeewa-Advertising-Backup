<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Database\Seeders\AdminStatusSeeder;
use Modules\Admin\Database\Seeders\AdminTypeSeeder;
use Modules\Admin\Database\Seeders\DefaultAdminSeeder;
use Modules\Admin\Models\Admin;
use Modules\User\Database\Seeders\SystemModuleSeeder;
use Modules\User\Database\Seeders\UserStatusSeeder;
use Modules\User\Models\SystemModule;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;
use Modules\User\Models\UserLogin;
use Tests\TestCase;

class UserAccessRequestAndNotificationTest extends TestCase
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

    public function test_user_with_zero_permissions_is_prevented_from_login_without_session(): void
    {
        // 1. Create a user with zero module permissions
        $user = User::create([
            'first_name' => 'Nimal',
            'last_name' => 'Perera',
            'mobile' => '0711234567',
            'username' => 'nimal',
            'password' => Hash::make('password123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        $this->assertFalse($user->hasAnyModulePermission());
        $this->assertEquals(0, $user->getAssignedModulesCount());

        // 2. Submit login attempt via JSON/AJAX
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'nimal',
            'password' => 'password123',
        ]);

        // 3. Must return 403 Forbidden with requires_permissions payload and redirect_url to /access-restricted
        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'requires_permissions' => true,
            'redirect_url' => route('access.restricted'),
            'user' => [
                'id' => $user->id,
                'name' => 'Nimal Perera',
                'username' => 'nimal',
                'status' => 'Active',
            ],
        ]);

        // 4. Verify that NO session was created and is_login remains 0
        $this->assertFalse(Auth::guard('web')->check());
        $user->refresh();
        $this->assertEquals(0, $user->is_login);
        $this->assertEquals(0, UserLogin::where('user_id', $user->id)->count());

        // 5. Verify /access-restricted page renders the dedicated profile view
        $restrictedPage = $this->withSession([
            'pending_user' => [
                'id' => $user->id,
                'name' => 'Nimal Perera',
                'username' => 'nimal',
                'mobile' => '0711234567',
                'status' => 'Active',
                'initials' => 'NP',
                'register_at' => 'Recent',
            ],
        ])->get(route('access.restricted'));

        $restrictedPage->assertStatus(200);
        $restrictedPage->assertSee('Access Restricted', false);
        $restrictedPage->assertSee('Nimal Perera', false);
        $restrictedPage->assertSee('0 / 12 Active', false);
        $restrictedPage->assertSee('btnSendAccessRequest', false);

        // 6. Direct access without pending_user session redirects to login
        $this->flushSession();
        $directAccess = $this->get(route('access.restricted'));
        $directAccess->assertRedirect(route('login'));
    }

    public function test_user_with_module_permissions_can_login_normally(): void
    {
        $user = User::create([
            'first_name' => 'Kamal',
            'last_name' => 'Silva',
            'mobile' => '0779876543',
            'username' => 'kamal',
            'password' => Hash::make('password123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        // Assign at least 1 module permission (Dashboard)
        $dashboardModule = SystemModule::where('system_module', 'Dashboard')->first();
        SystemModuleUser::create([
            'users_id' => $user->id,
            'system_modules_id' => $dashboardModule->id,
            'view' => 1,
            'create' => 0,
            'edit' => 0,
            'delete' => 0,
            'export' => 0,
        ]);

        $this->assertTrue($user->hasAnyModulePermission());

        // Submit login
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'kamal',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Login successful.',
        ]);

        $this->assertTrue(Auth::guard('web')->check());
        $user->refresh();
        $this->assertEquals(1, $user->is_login);
        $this->assertGreaterThanOrEqual(1, UserLogin::where('user_id', $user->id)->count());
    }

    public function test_user_can_request_permissions_from_admin_generating_notification_and_activity(): void
    {
        $user = User::create([
            'first_name' => 'Saman',
            'last_name' => 'Kumara',
            'mobile' => '0781112233',
            'username' => 'saman',
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        $admin = Admin::where('username', 'admin')->first();

        // Submit one-click permission request
        $response = $this->postJson('/api/v1/permissions/request', [
            'user_id' => $user->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Permission request sent to administrators successfully.',
        ]);

        // Check that in-app notification exists for Admin
        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => Admin::class,
            'notifiable_id' => $admin->id,
            'type' => 'Modules\Core\Notifications\SystemNotification',
        ]);

        $notification = $admin->notifications()->first();
        $this->assertNotNull($notification);
        $this->assertEquals('Module Access Request', $notification->data['title']);
        $this->assertEquals('access_request', $notification->data['type']);
        $this->assertEquals($user->id, $notification->data['metadata']['user_id']);
    }

    public function test_admin_can_retrieve_and_read_notifications(): void
    {
        $admin = Admin::where('username', 'admin')->first();

        $user = User::create([
            'first_name' => 'Sunil',
            'last_name' => 'Bandara',
            'mobile' => '0754445566',
            'username' => 'sunil',
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        // Trigger a notification
        $this->postJson('/api/v1/permissions/request', ['user_id' => $user->id]);

        // Authenticate as Admin
        $response = $this->actingAs($admin, 'admin')->getJson('/api/v1/notifications');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, $data['unread_count']);
        $this->assertNotEmpty($data['notifications']);

        $notificationId = $data['notifications'][0]['id'];

        // Mark as read
        $markResponse = $this->actingAs($admin, 'admin')->patchJson("/api/v1/notifications/{$notificationId}/read");
        $markResponse->assertStatus(200);
        $markResponse->assertJson([
            'success' => true,
            'data' => [
                'marked' => true,
            ],
        ]);

        // Verify unread count is updated
        $updatedResponse = $this->actingAs($admin, 'admin')->getJson('/api/v1/notifications');
        $this->assertEquals(0, $updatedResponse->json('data.unread_count'));
    }

    public function test_admin_can_mark_all_notifications_as_read(): void
    {
        $admin = Admin::where('username', 'admin')->first();

        $user1 = User::create([
            'first_name' => 'User1',
            'last_name' => 'Test',
            'mobile' => '0710000001',
            'username' => 'user1',
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        $user2 = User::create([
            'first_name' => 'User2',
            'last_name' => 'Test',
            'mobile' => '0710000002',
            'username' => 'user2',
            'password' => Hash::make('secret123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        $this->postJson('/api/v1/permissions/request', ['user_id' => $user1->id]);
        $this->postJson('/api/v1/permissions/request', ['user_id' => $user2->id]);

        $response = $this->actingAs($admin, 'admin')->postJson('/api/v1/notifications/mark-all-read');
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'unread_count' => 0,
            ],
        ]);

        $checkResponse = $this->actingAs($admin, 'admin')->getJson('/api/v1/notifications');
        $this->assertEquals(0, $checkResponse->json('data.unread_count'));
    }
}
