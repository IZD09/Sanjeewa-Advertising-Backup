<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserStatusSeeder::class,
            PrintTypeSeeder::class,
            PrintCostTypeSeeder::class,
            PrintJobStatusSeeder::class,
            CategorySeeder::class,
            SubcategorySeeder::class,
            BrandSeeder::class,
            StockMovementTypeSeeder::class,
            ExpenseTypeSeeder::class,
            ExpenseStatusSeeder::class,
            PaymentTypeSeeder::class,
            AdminStatusSeeder::class,
            AdminTypeSeeder::class,
            PurchaseOrderStatusSeeder::class,
            ActivityTypeSeeder::class,
            SystemModuleSeeder::class,
            DefaultAdminSeeder::class,
            CustomerSeeder::class,
            UnitSeeder::class,
            DeliveryMethodSeeder::class,
            StockMovementSeeder::class,
            PrintJobSeeder::class,
        ]);
    }
}
