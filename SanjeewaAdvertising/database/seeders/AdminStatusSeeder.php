<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Admin\Models\AdminStatus;

class AdminStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Active',
            'Inactive',
            'Suspended',
            'Locked',
        ];

        foreach ($statuses as $status) {
            AdminStatus::firstOrCreate(['admin_statas' => $status]);
        }
    }
}
