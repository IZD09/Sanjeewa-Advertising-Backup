<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;

class HRDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            StaffStatusSeeder::class,
            StaffSeeder::class,
            SalarySeeder::class,
            DalySalarySeeder::class,
            WorkDayStatusSeeder::class,
            WorkDaySeeder::class,
            AtendanceStatusSeeder::class,
            AtendanceSeeder::class,
        ]);
    }
}
