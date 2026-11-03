<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Admin\Models\AdminType;

class AdminTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Super Admin',
            'Administrator',
            'Manager',
            'Accountant',
            'Operator',
        ];

        foreach ($types as $type) {
            AdminType::firstOrCreate(['admin_type' => $type]);
        }
    }
}
