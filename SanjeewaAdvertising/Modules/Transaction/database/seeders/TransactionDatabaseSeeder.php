<?php

namespace Modules\Transaction\Database\Seeders;

use Database\Seeders\ExpenseStatusSeeder;
use Database\Seeders\ExpenseTypeSeeder;
use Database\Seeders\PaymentTypeSeeder;
use Illuminate\Database\Seeder;

class TransactionDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            ExpenseTypeSeeder::class,
            ExpenseStatusSeeder::class,
            PaymentTypeSeeder::class,
        ]);
    }
}
