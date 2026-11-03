<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Transaction\Models\ExpencesessType;

class ExpenseTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Electricity Utility',
            'Water Utility',
            'Internet & Telephone',
            'Shop Rent / Lease',
            'Machine Maintenance & Parts',
            'Staff Salary & Wages',
            'Office Supplies & Stationery',
            'Transportation & Fuel',
            'Marketing & Advertising',
            'Refreshments & Welfare',
            'Municipal Taxes & Licenses',
            'Other Operating Expenses',
        ];

        foreach ($types as $type) {
            ExpencesessType::firstOrCreate(['expencesess_type' => $type]);
        }
    }
}
