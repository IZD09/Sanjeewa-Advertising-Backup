<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\HR\Models\Salary;
use Modules\HR\Models\Staff;

class SalarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $salaryMap = [
            '199212345678' => 65000.00,
            '199523456789' => 55000.00,
            '198934567890' => 75000.00,
            '199845678901' => 50000.00,
            '199456789012' => 48000.00,
            '199067890123' => 45000.00,
        ];

        foreach ($salaryMap as $nic => $amount) {
            $staff = Staff::where('nic', $nic)->first();

            if (! $staff) {
                continue;
            }

            Salary::firstOrCreate(
                [
                    'staff_id' => $staff->id,
                    'amount' => $amount,
                ],
                [
                    'update_at' => now()->startOfMonth(),
                ]
            );
        }
    }
}
