<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\HR\Models\StaffStatus;

class StaffStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Active',
            'Inactive',
            'On Leave',
            'Suspended',
            'Resigned',
        ];

        foreach ($statuses as $status) {
            StaffStatus::firstOrCreate(['staff_status' => $status]);
        }
    }
}
