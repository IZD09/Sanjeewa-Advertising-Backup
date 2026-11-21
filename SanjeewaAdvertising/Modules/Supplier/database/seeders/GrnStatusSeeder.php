<?php

namespace Modules\Supplier\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Supplier\Models\GrnStatus;

class GrnStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            GrnStatus::STATUS_DRAFT => 'Draft',
            GrnStatus::STATUS_APPROVED => 'Approved',
            GrnStatus::STATUS_COMPLETED => 'Completed',
            GrnStatus::STATUS_CANCELLED => 'Cancelled',
            GrnStatus::STATUS_PENDING => 'Pending',
            GrnStatus::STATUS_PENDING_STOCK => 'Pending Stock',
        ];

        foreach ($statuses as $id => $name) {
            GrnStatus::updateOrCreate(
                ['id' => $id],
                ['grn_status' => $name]
            );
        }
    }
}
