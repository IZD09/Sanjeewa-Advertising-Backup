<?php

namespace Modules\Transport\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Transport\Models\Truck;
use Modules\Transport\Models\VehicleModel;

class TruckSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fleet = [
            ['register' => 'WP-LB-4521', 'model' => 'Isuzu Elf', 'current_km' => 45382, 'fuel_efficiency' => 8.50, 'status' => 'On Trip'],
            ['register' => 'WP-PE-8834', 'model' => 'Mitsubishi Canter', 'current_km' => 28965, 'fuel_efficiency' => 9.00, 'status' => 'Available'],
            ['register' => 'WP-DA-2190', 'model' => 'Toyota TownAce', 'current_km' => 61420, 'fuel_efficiency' => 11.50, 'status' => 'Available'],
            ['register' => 'WP-KW-6712', 'model' => 'Mahindra Bolero', 'current_km' => 34100, 'fuel_efficiency' => 12.00, 'status' => 'Available'],
            ['register' => 'WP-QD-9045', 'model' => 'Bajaj Maxima Cargo', 'current_km' => 18750, 'fuel_efficiency' => 22.00, 'status' => 'Available'],
        ];

        foreach ($fleet as $item) {
            $vehicleModel = VehicleModel::firstOrCreate(['mane' => $item['model']]);

            Truck::updateOrCreate(
                ['register' => $item['register']],
                [
                    'model_id' => $vehicleModel->id,
                    'current_km' => $item['current_km'],
                    'fuel_efficiency' => $item['fuel_efficiency'],
                    'status' => $item['status'],
                ]
            );
        }
    }
}
