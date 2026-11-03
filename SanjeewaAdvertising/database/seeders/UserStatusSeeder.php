<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\User\Models\UserStatus;

class UserStatusSeeder extends Seeder
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
            'Pending',
        ];

        foreach ($statuses as $status) {
            UserStatus::firstOrCreate(['user_status' => $status]);
        }
    }
}
