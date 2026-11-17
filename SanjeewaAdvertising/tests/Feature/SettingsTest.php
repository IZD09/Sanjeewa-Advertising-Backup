<?php

namespace Tests\Feature;

use Database\Seeders\AdminStatusSeeder;
use Database\Seeders\AdminTypeSeeder;
use Database\Seeders\DefaultAdminSeeder;
use Database\Seeders\SystemModuleSeeder;
use Database\Seeders\UserStatusSeeder;
use Modules\Admin\Models\Admin;
use Tests\TestCase;

class SettingsTest extends TestCase
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

    public function test_unauthenticated_user_accessing_settings_redirects_to_login(): void
    {
        $response = $this->get('/settings');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_admin_can_access_settings_page(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $response = $this->actingAs($admin, 'admin')->get('/settings');

        $response->assertStatus(200);
        $response->assertSee('System Preferences & Shop Config', false);
        $response->assertSee('Shop Profile & Contact Details', false);
        $response->assertSee('Shop Logo & System Icon', false);
        $response->assertSee('Color Theme & System Appearance', false);
        $response->assertSee('settingShopName', false);
        $response->assertSee('settingShopAddress', false);
        $response->assertSee('settingShopPhone', false);
        $response->assertSee('settingCurrencySymbol', false);
    }

    public function test_authenticated_admin_can_update_settings_via_json(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $payload = [
            'shop_name' => 'Sanjeewa Advertising Pro',
            'shop_address' => 'No. 100 Kandy Road, Colombo',
            'shop_phone' => '+94 11 999 8888',
            'currency_symbol' => 'Rs.',
            'logo_icon' => 'fa-solid fa-store',
            'theme_mode' => 'dark',
            'theme_color' => '#059669',
        ];

        $response = $this->actingAs($admin, 'admin')->postJson('/settings', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'shop_name' => 'Sanjeewa Advertising Pro',
                'currency_symbol' => 'Rs.',
                'theme_color' => '#059669',
                'theme_mode' => 'dark',
            ],
        ]);

        $this->assertFileExists(storage_path('app/settings.json'));
        $content = json_decode((string) file_get_contents(storage_path('app/settings.json')), true);
        $this->assertSame('Sanjeewa Advertising Pro', $content['shop_name']);
        $this->assertSame('#059669', $content['theme_color']);
    }

    public function test_authenticated_admin_can_retrieve_settings_via_endpoint(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $response = $this->actingAs($admin, 'admin')->getJson('/settings/data');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'shop_name',
                'shop_address',
                'shop_phone',
                'currency_symbol',
                'theme_color',
                'theme_mode',
            ],
        ]);
    }

    public function test_authenticated_admin_can_update_shop_name_and_logo_to_visual_line_advertising(): void
    {
        $admin = Admin::where('username', 'admin')->first();
        $this->assertNotNull($admin);

        $payload = [
            'shop_name' => 'Visual Line Advertising',
            'shop_address' => 'No. 42 Main Street, Colombo 03, Sri Lanka',
            'shop_phone' => '+94 11 234 5678',
            'currency_symbol' => 'Rs.',
            'logo_url' => '/uploads/branding/visual_line_advertising_logo.png',
            'logo_icon' => 'fa-solid fa-print',
            'theme_mode' => 'light',
            'theme_color' => '#2563eb',
        ];

        $response = $this->actingAs($admin, 'admin')->postJson('/settings', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'shop_name' => 'Visual Line Advertising',
                'logo_url' => '/uploads/branding/visual_line_advertising_logo.png',
            ],
        ]);

        $this->assertFileExists(storage_path('app/settings.json'));
        $content = json_decode((string) file_get_contents(storage_path('app/settings.json')), true);
        $this->assertSame('Visual Line Advertising', $content['shop_name']);
        $this->assertSame('/uploads/branding/visual_line_advertising_logo.png', $content['logo_url']);
    }
}
