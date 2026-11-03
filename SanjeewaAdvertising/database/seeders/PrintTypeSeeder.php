<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Design\Models\PrintType;

class PrintTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Flex Banner',
            'Sticker / Vinyl',
            'Visiting Cards',
            'Leaflets & Flyers',
            'Signage & Backlit',
            'Custom Printing',
        ];

        foreach ($types as $type) {
            PrintType::firstOrCreate(['print_type' => $type]);
        }
    }
}
