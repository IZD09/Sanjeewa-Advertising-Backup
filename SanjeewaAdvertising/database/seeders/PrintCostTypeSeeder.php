<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Design\Models\PrintCostType;
use Modules\Design\Models\PrintType;

class PrintCostTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $printTypes = PrintType::all();

        foreach ($printTypes as $printType) {
            PrintCostType::firstOrCreate([
                'print_types_id' => $printType->id,
            ]);
        }
    }
}
