<?php

namespace Modules\PrintJob\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PrintJob\Models\Unit;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['id' => 1, 'simble' => 'ft', 'name' => 'Feet'],
            ['id' => 2, 'simble' => 'in', 'name' => 'Inches'],
            ['id' => 3, 'simble' => 'cm', 'name' => 'Centimeters'],
            ['id' => 4, 'simble' => 'mm', 'name' => 'Millimeters'],
            ['id' => 5, 'simble' => 'm', 'name' => 'Meters'],
            ['id' => 6, 'simble' => 'pcs', 'name' => 'Pieces'],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(
                ['id' => $unit['id']],
                [
                    'simble' => $unit['simble'],
                    'name' => $unit['name'],
                ]
            );
        }
    }
}
