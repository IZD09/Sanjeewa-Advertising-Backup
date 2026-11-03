<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Inventory\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Banner Media',
            'Stickers & Vinyls',
            'Inks & Solvents',
            'Rigid Boards & Sheets',
            'Display Hardware',
            'Lamination Films',
            'Packaging & Finishing',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['category' => $category]);
        }
    }
}
