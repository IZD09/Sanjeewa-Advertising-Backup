<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PrintJob\Models\PrintJobStatus;

class PrintJobStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Pending',
            'Designing',
            'Approved',
            'Printing',
            'Finishing',
            'Ready for Pickup',
            'Completed',
            'Delivered',
            'Cancelled',
        ];

        foreach ($statuses as $status) {
            PrintJobStatus::firstOrCreate(['print_job_states' => $status]);
        }
    }
}
