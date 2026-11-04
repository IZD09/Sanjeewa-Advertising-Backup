<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Core\Models\ActivityType;

class ActivityTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Login',
            'Logout',
            'Create Order',
            'Update Order',
            'Cancel Order',
            'Add Payment',
            'Reverse Payment',
            'Receive GRN',
            'Stock Adjustment',
            'Record Expense',
            'Update Settings',
            'Create User',
            'Update User',
            'Delete User',
            'Update User Status',
            'Update Permissions',
        ];

        foreach ($types as $type) {
            ActivityType::firstOrCreate(['activity_type' => $type]);
        }
    }
}
