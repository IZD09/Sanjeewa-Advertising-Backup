<?php

namespace Modules\Admin\Database\Seeders;

use Database\Seeders\AdminStatusSeeder;
use Database\Seeders\AdminTypeSeeder;
use Database\Seeders\DefaultAdminSeeder;
use Illuminate\Database\Seeder;

class AdminDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            AdminStatusSeeder::class,
            AdminTypeSeeder::class,
            DefaultAdminSeeder::class,
            DefaultAdminSeeder::class,
        ]);
    }
}
