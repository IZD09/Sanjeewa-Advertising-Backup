<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Modules\Admin\Database\Seeders\AdminDatabaseSeeder;
use Modules\Core\Database\Seeders\CoreDatabaseSeeder;
use Modules\Customer\Database\Seeders\CustomerDatabaseSeeder;
use Modules\Design\Database\Seeders\DesignDatabaseSeeder;
use Modules\HR\Database\Seeders\HRDatabaseSeeder;
use Modules\Inventory\Database\Seeders\InventoryDatabaseSeeder;
use Modules\Invoice\Database\Seeders\InvoiceDatabaseSeeder;
use Modules\PrintJob\Database\Seeders\PrintJobDatabaseSeeder;
use Modules\Supplier\Database\Seeders\SupplierDatabaseSeeder;
use Modules\Transaction\Database\Seeders\TransactionDatabaseSeeder;
use Modules\Transport\Database\Seeders\TransportDatabaseSeeder;
use Modules\User\Database\Seeders\UserDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserDatabaseSeeder::class,
            AdminDatabaseSeeder::class,
            CoreDatabaseSeeder::class,
            DesignDatabaseSeeder::class,
            CustomerDatabaseSeeder::class,
            SupplierDatabaseSeeder::class,
            InventoryDatabaseSeeder::class,
            TransactionDatabaseSeeder::class,
            PrintJobDatabaseSeeder::class,
            InvoiceDatabaseSeeder::class,
            HRDatabaseSeeder::class,
            TransportDatabaseSeeder::class,
            PaymentsModuleDataSeeder::class,
        ]);
    }
}
