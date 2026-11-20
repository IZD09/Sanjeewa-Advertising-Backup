<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\HR\Models\AtendanceStatus;

class AtendanceStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Present',
            'Absent',
            'Late',
            'Half Day',
            'On Leave',
        ];

        foreach ($statuses as $status) {
            AtendanceStatus::firstOrCreate(['atendance_statuses' => $status]);
        }
    }
}
