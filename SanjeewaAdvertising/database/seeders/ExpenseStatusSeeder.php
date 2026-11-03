<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Transaction\Models\ExpencesessStatus;

class ExpenseStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Pending',
            'Approved',
            'Paid',
            'Partial',
            'Overdue',
            'Cancelled',
        ];

        foreach ($statuses as $status) {
            ExpencesessStatus::firstOrCreate(['expencesess_status' => $status]);
        }
    }
}
