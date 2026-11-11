<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\User\Models\SystemModule;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class SidebarCustomerNavigationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_admin_sidebar_keeps_all_buttons_when_visiting_customers_page(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $adminUser = User::create([
            'first_name' => 'System',
            'last_name' => 'Admin',
            'mobile' => '0770000000',
            'register_at' => now(),
            'username' => 'admin',
            'password' => 'secret123',
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $response = $this->actingAs($adminUser, 'web')
            ->withSession(['active_portal' => 'admin'])
            ->get('/customers');

        $response->assertOk();
        $response->assertSee('ADMIN WORKSPACE');
        $response->assertSee('Dashboard');
        $response->assertSee('Sales & Revenue');
        $response->assertSee('Customers');
        $response->assertSee('Payments');
        $response->assertSee('Reports');
        $response->assertSee('Purchase Orders');
        $response->assertSee('Stock Management');
        $response->assertSee('Goods Received');
        $response->assertSee('User Control');
        $response->assertSee('Settings');
    }

    public function test_staff_user_keeps_assigned_buttons_when_visiting_customers_page(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $staffUser = User::create([
            'first_name' => 'Kasun',
            'last_name' => 'Perera',
            'mobile' => '0771111111',
            'register_at' => now(),
            'username' => 'kasun',
            'password' => 'secret123',
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $modules = [
            'Dashboard',
            'Customers',
            'Place Order',
            'Print Jobs',
            'Inventory',
            'Payments & Financials',
            'Reports',
            'Settings',
        ];

        foreach ($modules as $modName) {
            $mod = SystemModule::create(['system_module' => $modName]);
            $staffUser->systemModules()->attach($mod->id, [
                'view' => 1,
                'create' => 1,
                'edit' => 1,
                'delete' => 0,
                'export' => 1,
            ]);
        }

        $response = $this->actingAs($staffUser, 'web')
            ->withSession(['active_portal' => 'user'])
            ->get('/customers');

        $response->assertOk();
        $response->assertSee('STAFF WORKSPACE');
        $response->assertSee('Dashboard');
        $response->assertSee('Customers');
        $response->assertSee('Place Order');
        $response->assertSee('Print Jobs');
        $response->assertSee('Stock Management');
        $response->assertSee('Payments');
        $response->assertSee('Reports');
        $response->assertSee('Settings');
    }
}
