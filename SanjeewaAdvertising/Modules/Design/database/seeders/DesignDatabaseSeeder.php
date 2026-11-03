<?php

namespace Modules\Design\Database\Seeders;

use Database\Seeders\PrintCostTypeSeeder;
use Database\Seeders\PrintTypeSeeder;
use Illuminate\Database\Seeder;

class DesignDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            PrintTypeSeeder::class,
            PrintCostTypeSeeder::class,
        ]);
    }
}
