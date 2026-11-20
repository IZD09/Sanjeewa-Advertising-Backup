<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\HR\Models\DalySalary;
use Modules\HR\Models\Staff;

class DalySalarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dailyRates = [
            '199212345678' => 2500.00,
            '199523456789' => 2200.00,
            '198934567890' => 3000.00,
            '199845678901' => 2000.00,
            '199456789012' => 1800.00,
        ];

        foreach ($dailyRates as $nic => $dailyRate) {
            $staff = Staff::where('nic', $nic)->first();

            if (! $staff) {
                continue;
            }

            for ($day = 1; $day <= 5; $day++) {
                $payAt = now()->startOfDay()->subDays($day)->setTime(17, 30, 0);

                DalySalary::firstOrCreate(
                    [
                        'staff_id' => $staff->id,
                        'pay_at' => $payAt,
                    ],
                    [
                        'amount' => $dailyRate,
                    ]
                );
            }
        }
    }
}
