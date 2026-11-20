<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Admin\Models\Admin;
use Modules\HR\Models\Staff;
use Modules\HR\Models\StaffStatus;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Admin::query()->first();

        if (! $admin) {
            return;
        }

        $activeStatus = StaffStatus::firstOrCreate(['staff_status' => 'Active']);
        $onLeaveStatus = StaffStatus::firstOrCreate(['staff_status' => 'On Leave']);
        $inactiveStatus = StaffStatus::firstOrCreate(['staff_status' => 'Inactive']);

        $staffMembers = [
            [
                'first_name' => 'Kamal',
                'last_name' => 'Perera',
                'mobile' => '0771122331',
                'nic' => '199212345678',
                'staff_statuses_id' => $activeStatus->id,
                'days_ago' => 120,
            ],
            [
                'first_name' => 'Nimal',
                'last_name' => 'Bandara',
                'mobile' => '0712233442',
                'nic' => '199523456789',
                'staff_statuses_id' => $activeStatus->id,
                'days_ago' => 95,
            ],
            [
                'first_name' => 'Sunil',
                'last_name' => 'Fernando',
                'mobile' => '0763344553',
                'nic' => '198934567890',
                'staff_statuses_id' => $activeStatus->id,
                'days_ago' => 80,
            ],
            [
                'first_name' => 'Sanduni',
                'last_name' => 'Silva',
                'mobile' => '0754455664',
                'nic' => '199845678901',
                'staff_statuses_id' => $activeStatus->id,
                'days_ago' => 60,
            ],
            [
                'first_name' => 'Ruwan',
                'last_name' => 'Kumara',
                'mobile' => '0785566775',
                'nic' => '199456789012',
                'staff_statuses_id' => $onLeaveStatus->id,
                'days_ago' => 45,
            ],
            [
                'first_name' => 'Chathura',
                'last_name' => 'Jayasinghe',
                'mobile' => '0706677886',
                'nic' => '199067890123',
                'staff_statuses_id' => $inactiveStatus->id,
                'days_ago' => 150,
            ],
        ];

        foreach ($staffMembers as $member) {
            Staff::firstOrCreate(
                ['nic' => $member['nic']],
                [
                    'first_name' => $member['first_name'],
                    'last_name' => $member['last_name'],
                    'mobile' => $member['mobile'],
                    'staff_statuses_id' => $member['staff_statuses_id'],
                    'add_at' => now()->subDays($member['days_ago']),
                    'add_by' => $admin->id,
                ]
            );
        }
    }
}
