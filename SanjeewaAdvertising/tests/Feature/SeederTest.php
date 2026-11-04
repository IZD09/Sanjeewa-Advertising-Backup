<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\Admin;
use Modules\User\Models\User;
use Tests\TestCase;

class SeederTest extends TestCase
{
    public function test_can_seed_all_lookup_tables(): void
    {
        $this->artisan('migrate');

        $this->seed(DatabaseSeeder::class);

        // 1. user_statuses
        $this->assertGreaterThan(0, DB::table('user_statuses')->count());
        $this->assertDatabaseHas('user_statuses', ['user_status' => 'Active']);

        // 2. print_types, print_cost_type, print_job_statuses
        $this->assertGreaterThan(0, DB::table('print_types')->count());
        $this->assertGreaterThan(0, DB::table('print_cost_type')->count());
        $this->assertGreaterThan(0, DB::table('print_job_statuses')->count());
        $this->assertDatabaseHas('print_types', ['print_type' => 'Flex Banner']);
        $this->assertDatabaseHas('print_job_statuses', ['print_job_states' => 'Pending']);

        // 3. brands, categories, subcategories, stock_movements_types
        $this->assertGreaterThan(0, DB::table('brands')->count());
        $this->assertGreaterThan(0, DB::table('categories')->count());
        $this->assertGreaterThan(0, DB::table('subcategories')->count());
        $this->assertGreaterThan(0, DB::table('stock_movements_types')->count());
        $this->assertDatabaseHas('brands', ['brand' => 'Starflex']);
        $this->assertDatabaseHas('categories', ['category' => 'Banner Media']);
        $this->assertDatabaseHas('stock_movements_types', ['stock_movements_type' => 'GRN / Purchase Receipt']);

        // 4. expencesess_statuses, expencesess_types
        $this->assertGreaterThan(0, DB::table('expencesess_types')->count());
        $this->assertGreaterThan(0, DB::table('expencesess_statuses')->count());
        $this->assertDatabaseHas('expencesess_types', ['expencesess_type' => 'Electricity Utility']);
        $this->assertDatabaseHas('expencesess_statuses', ['expencesess_status' => 'Paid']);

        // 5. payment_types
        $this->assertGreaterThan(0, DB::table('payment_types')->count());
        $this->assertDatabaseHas('payment_types', ['payment_type' => 'Cash']);

        // 6. admin_statuses, admin_types
        $this->assertGreaterThan(0, DB::table('admin_statuses')->count());
        $this->assertGreaterThan(0, DB::table('admin_types')->count());
        $this->assertDatabaseHas('admin_statuses', ['admin_statas' => 'Active']);
        $this->assertDatabaseHas('admin_types', ['admin_type' => 'Super Admin']);

        // 7. activity_types
        $this->assertGreaterThan(0, DB::table('activity_types')->count());
        $this->assertDatabaseHas('activity_types', ['activity_type' => 'Login']);

        // 8. system_modules, permision_stateses
        $this->assertGreaterThan(0, DB::table('system_modules')->count());
        $this->assertGreaterThan(0, DB::table('permision_stateses')->count());
        $this->assertDatabaseHas('system_modules', ['system_module' => 'Dashboard']);
        $this->assertDatabaseHas('permision_stateses', ['permision_states' => 'Full Access']);

        // 9. default admin in admins and users tables
        $this->assertDatabaseHas('admins', ['username' => 'admin']);
        $this->assertDatabaseHas('users', ['username' => 'admin']);
        $admin = Admin::where('username', 'admin')->first();
        $userAdmin = User::where('username', 'admin')->first();
        $this->assertTrue(Hash::check('admin', $admin->password));
        $this->assertTrue(Hash::check('admin', $userAdmin->password));
        $this->assertGreaterThanOrEqual(12, $userAdmin->userPermissions()->count());

        // Test idempotency: run seeder again, count should not double and no error
        $this->seed(DatabaseSeeder::class);
    }
}
