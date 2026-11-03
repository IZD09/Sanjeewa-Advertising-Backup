<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Inventory\Models\StockMovementType;

class StockMovementTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'GRN / Purchase Receipt',
            'Job Usage / Issue',
            'Manual Stock In',
            'Manual Stock Out',
            'Inventory Adjustment',
            'Damage / Wastage',
            'Return to Supplier',
        ];

        foreach ($types as $type) {
            StockMovementType::firstOrCreate(['stock_movements_type' => $type]);
        }
    }
}
