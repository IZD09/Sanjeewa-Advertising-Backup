<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\HR\Models\WorkDayStatus;

class WorkDayStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Working Day',
            'Half Day',
            'Public Holiday',
            'Weekend',
            'Company Holiday',
        ];

        foreach ($statuses as $status) {
            WorkDayStatus::firstOrCreate(['work_day_status' => $status]);
        }
    }
}
