<?php

namespace Modules\Inventory\Database\Seeders;

use Database\Seeders\BrandSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\StockMovementTypeSeeder;
use Database\Seeders\SubcategorySeeder;
use Illuminate\Database\Seeder;

class InventoryDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            SubcategorySeeder::class,
            BrandSeeder::class,
            StockMovementTypeSeeder::class,
        ]);
    }
}
