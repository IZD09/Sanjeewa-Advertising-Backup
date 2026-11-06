<?php

namespace Tests\Feature;

use Database\Seeders\AdminStatusSeeder;
use Database\Seeders\AdminTypeSeeder;
use Database\Seeders\DefaultAdminSeeder;
use Database\Seeders\SystemModuleSeeder;
use Database\Seeders\UserStatusSeeder;
use Modules\Admin\Models\Admin;
use Tests\TestCase;

class AdminProfileTest extends TestCase
{
    private Admin $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $this->seed(UserStatusSeeder::class);
        $this->seed(AdminStatusSeeder::class);
        $this->seed(AdminTypeSeeder::class);
        $this->seed(SystemModuleSeeder::class);
        $this->seed(DefaultAdminSeeder::class);

        $this->admin = Admin::where('username', 'admin')->first();
    }

    public function test_guest_is_redirected_when_accessing_admin_profile_page(): void
    {
        $response = $this->get('/admin/profile');
        $response->assertRedirect('/admin/login');
    }

    public function test_authenticated_admin_can_access_admin_profile_page(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->get('/admin/profile');
        $response->assertStatus(200);
        $response->assertSee('id="module-admin-profile"', false);
        $response->assertSee('id="adminProfileLockModal"', false);
        $response->assertSee('id="formVerifyAdminAccess"', false);
    }

    public function test_verify_profile_access_rejects_invalid_credentials(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->postJson('/admin/profile/verify', [
            'username' => 'admin',
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_verify_profile_access_succeeds_with_valid_credentials(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->postJson('/admin/profile/verify', [
            'username' => 'admin',
            'password' => 'admin',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Credentials verified successfully.',
            ])
            ->assertJsonPath('data.verified', true)
            ->assertJsonPath('data.admin.username', 'admin');
    }

    public function test_authenticated_admin_can_fetch_profile_details(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->getJson('/admin/profile/data');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonPath('data.username', 'admin');
    }

    public function test_admin_can_update_profile_details(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->putJson('/admin/profile', [
            'first_name' => 'Sanjeewa Updated',
            'last_name' => 'Admin',
            'email' => 'updated_admin@sanjeewaadvertising.com',
            'mobile' => '0771239999',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonPath('data.first_name', 'Sanjeewa Updated');

        $this->assertDatabaseHas('admins', [
            'username' => 'admin',
            'first_name' => 'Sanjeewa Updated',
            'email' => 'updated_admin@sanjeewaadvertising.com',
        ]);
    }
}
