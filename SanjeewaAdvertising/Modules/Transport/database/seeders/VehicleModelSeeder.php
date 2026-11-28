<?php

namespace Modules\Transport\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Transport\Models\VehicleModel;

class VehicleModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $models = [
            'Isuzu Elf',
            'Mitsubishi Canter',
            'Toyota TownAce',
            'Mahindra Bolero',
            'Bajaj Maxima Cargo',
        ];

        foreach ($models as $modelName) {
            VehicleModel::firstOrCreate(['mane' => $modelName]);
        }
    }
}
