<?php

namespace Modules\Transport\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Admin\Models\Admin;
use Modules\HR\Models\Staff;
use Modules\HR\Models\StaffStatus;
use Modules\Transport\Models\DesialPrice;
use Modules\Transport\Models\StaffType;
use Modules\Transport\Models\Transport;
use Modules\Transport\Models\Truck;

class TransportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Admin::query()->first();
        if (! $admin) {
            return;
        }

        $driverType = StaffType::firstOrCreate(['staff_type' => 'Driver']);
        $activeStatus = StaffStatus::firstOrCreate(['staff_status' => 'Active']);

        $driver1 = Staff::updateOrCreate(
            ['nic' => '198812345670'],
            [
                'first_name' => 'Pradeep',
                'last_name' => 'Wijesinghe',
                'mobile' => '0774455661',
                'staff_statuses_id' => $activeStatus->id,
                'staff_type_id' => $driverType->id,
                'add_at' => now()->subDays(90),
                'add_by' => $admin->id,
            ]
        );

        $driver2 = Staff::updateOrCreate(
            ['nic' => '199123456781'],
            [
                'first_name' => 'Janaka',
                'last_name' => 'Rathnayake',
                'mobile' => '0715566772',
                'staff_statuses_id' => $activeStatus->id,
                'staff_type_id' => $driverType->id,
                'add_at' => now()->subDays(75),
                'add_by' => $admin->id,
            ]
        );

        $latestDiesel = DesialPrice::query()->orderByDesc('add_date')->orderByDesc('id')->first();
        $trucks = Truck::query()->orderBy('id')->get();

        if (! $latestDiesel || $trucks->isEmpty()) {
            return;
        }

        $truck1 = $trucks->get(0);
        $truck2 = $trucks->get(1) ?? $truck1;
        $dieselRate = (float) $latestDiesel->price;

        $truck1->update(['default_staff_id' => $driver1->id, 'status' => 'On Trip', 'current_km' => 45382]);
        if ($truck2->id !== $truck1->id) {
            $truck2->update(['default_staff_id' => $driver2->id, 'status' => 'Available', 'current_km' => 28965]);
        }

        $trips = [
            [
                'start' => now()->subDays(3)->setTime(8, 30),
                'end' => now()->subDays(3)->setTime(13, 15),
                'start_km' => 45200,
                'end_km' => 45268,
                'desial_price_id' => $latestDiesel->id,
                'truck_id' => $truck1->id,
                'staff_id' => $driver1->id,
                'junry' => 68,
                'destination' => 'Colombo Fort - Billboard Material Delivery',
                'diesel_liters' => 8.000,
                'diesel_cost' => round(8.0 * $dieselRate, 2),
                'notes' => 'Delivered flex frames and vinyl rolls on schedule.',
            ],
            [
                'start' => now()->subDays(2)->setTime(9, 0),
                'end' => now()->subDays(2)->setTime(16, 40),
                'start_km' => 45268,
                'end_km' => 45382,
                'desial_price_id' => $latestDiesel->id,
                'truck_id' => $truck1->id,
                'staff_id' => $driver1->id,
                'junry' => 114,
                'destination' => 'Kandy Town - Hoarding Installation & Delivery',
                'diesel_liters' => 13.500,
                'diesel_cost' => round(13.5 * $dieselRate, 2),
                'notes' => 'Round-trip highway delivery with installation crew.',
            ],
            [
                'start' => now()->subDay()->setTime(10, 15),
                'end' => now()->subDay()->setTime(15, 0),
                'start_km' => 28910,
                'end_km' => 28965,
                'desial_price_id' => $latestDiesel->id,
                'truck_id' => $truck2->id,
                'staff_id' => $driver2->id,
                'junry' => 55,
                'destination' => 'Negombo - Shop Signage & Lightbox Handover',
                'diesel_liters' => 6.200,
                'diesel_cost' => round(6.2 * $dieselRate, 2),
                'notes' => 'Completed customer site delivery.',
            ],
            [
                'start' => now()->setTime(8, 45),
                'end' => null,
                'start_km' => 45382,
                'end_km' => null,
                'desial_price_id' => $latestDiesel->id,
                'truck_id' => $truck1->id,
                'staff_id' => $driver1->id,
                'junry' => 0,
                'destination' => 'Gampaha & Kurunegala - Multi-Store Banner Drop',
                'diesel_liters' => null,
                'diesel_cost' => null,
                'notes' => 'Dispatched morning route.',
            ],
        ];

        foreach ($trips as $trip) {
            Transport::updateOrCreate(
                [
                    'truck_id' => $trip['truck_id'],
                    'start_km' => $trip['start_km'],
                ],
                $trip
            );
        }
    }
}
