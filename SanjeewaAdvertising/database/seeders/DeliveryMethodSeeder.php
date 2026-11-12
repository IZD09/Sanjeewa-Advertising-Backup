<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\PrintJob\Models\DeliveryMethod;

class DeliveryMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            ['id' => 1, 'methord' => 'Customer Pickup'],
            ['id' => 2, 'methord' => 'Courier Delivery'],
            ['id' => 3, 'methord' => 'Company Delivery'],
            ['id' => 4, 'methord' => 'Express Delivery'],
            ['id' => 5, 'methord' => 'Postal Service'],
        ];

        foreach ($methods as $method) {
            DeliveryMethod::updateOrCreate(
                ['id' => $method['id']],
                ['methord' => $method['methord']]
            );
        }
    }
}
