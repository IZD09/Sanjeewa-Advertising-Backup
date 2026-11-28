<?php

namespace Modules\Transport\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Transport\Models\StaffType;

class StaffTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'General Staff',
            'Driver',
            'Delivery Assistant',
            'Graphic Designer',
            'Machine Operator',
            'Installation Technician',
        ];

        foreach ($types as $type) {
            StaffType::firstOrCreate(['staff_type' => $type]);
        }
    }
}
