<?php

namespace Modules\Supplier\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Supplier\Models\PurchaseOrderStatus;

class PurchaseOrderStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            1 => 'Pending',
            2 => 'Partial',
            3 => 'Completed',
            4 => 'Cancelled',
            5 => 'Approved',
        ];

        foreach ($statuses as $id => $name) {
            PurchaseOrderStatus::updateOrCreate(
                ['id' => $id],
                ['purchase_orders_status' => $name]
            );
        }
    }
}
