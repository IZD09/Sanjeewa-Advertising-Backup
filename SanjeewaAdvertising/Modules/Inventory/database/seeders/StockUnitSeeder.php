<?php

namespace Modules\Inventory\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Inventory\Models\StockUnit;

class StockUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['id' => 1, 'unit' => 'Pieces', 'symble' => 'pcs'],
            ['id' => 2, 'unit' => 'Rolls', 'symble' => 'roll'],
            ['id' => 3, 'unit' => 'Boxes', 'symble' => 'box'],
            ['id' => 4, 'unit' => 'Packets', 'symble' => 'pack'],
            ['id' => 5, 'unit' => 'Meters', 'symble' => 'm'],
            ['id' => 6, 'unit' => 'Sheets', 'symble' => 'sht'],
            ['id' => 7, 'unit' => 'Liters', 'symble' => 'L'],
            ['id' => 8, 'unit' => 'Kilograms', 'symble' => 'kg'],
        ];

        foreach ($units as $unit) {
            StockUnit::updateOrCreate(
                ['id' => $unit['id']],
                [
                    'unit' => $unit['unit'],
                    'symble' => $unit['symble'],
                ]
            );
        }
    }
}
