<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Inventory\Models\Brand;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            'Starflex',
            'LG Hausys',
            'Avery Dennison',
            '3M',
            'ORAFOL',
            'Mimaki',
            'Roland',
            'Epson',
            'Allwin',
            'Generic / Local',
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(['brand' => $brand]);
        }
    }
}
