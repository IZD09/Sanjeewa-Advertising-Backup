<?php

namespace Modules\Transport\Database\Seeders;

use Illuminate\Database\Seeder;

class TransportDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            StaffTypeSeeder::class,
            VehicleModelSeeder::class,
            TruckSeeder::class,
            DesialPriceSeeder::class,
            TransportSeeder::class,
        ]);
    }
}
