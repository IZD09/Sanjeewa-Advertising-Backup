<?php

namespace Modules\Transport\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Transport\Models\DesialPrice;

class DesialPriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prices = [
            ['add_date' => now()->subDays(60)->toDateString(), 'price' => 289.00],
            ['add_date' => now()->subDays(30)->toDateString(), 'price' => 283.00],
            ['add_date' => now()->toDateString(), 'price' => 286.00],
        ];

        foreach ($prices as $entry) {
            DesialPrice::updateOrCreate(
                ['add_date' => $entry['add_date']],
                ['price' => $entry['price']]
            );
        }
    }
}
