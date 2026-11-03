<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\Subcategory;

class SubcategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $map = [
            'Banner Media' => [
                'Frontlit Flex 280gsm',
                'Frontlit Flex 380gsm (Star)',
                'Backlit Flex',
                'Blockout Banner',
                'Mesh Banner',
            ],
            'Stickers & Vinyls' => [
                'Glossy Vinyl',
                'Matte Vinyl',
                'Clear Transparent Vinyl',
                'One Way Vision',
                'Reflective Vinyl',
                'Floor Graphic Vinyl',
            ],
            'Inks & Solvents' => [
                'Eco-Solvent Cyan',
                'Eco-Solvent Magenta',
                'Eco-Solvent Yellow',
                'Eco-Solvent Black',
                'Cleaning Solvent Flush',
            ],
            'Rigid Boards & Sheets' => [
                'PVC Foam Board 3mm',
                'PVC Foam Board 5mm',
                'Acrylic Sheet Clear',
                'Corrugated Sheet (Corriboard)',
                'Aluminium Composite Panel',
            ],
            'Display Hardware' => [
                'Rollup Banner Stand',
                'X-Stand Banner',
                'Pop-up Display',
                'Sign Snap Frame',
            ],
            'Lamination Films' => [
                'Cold Gloss Lamination',
                'Cold Matte Lamination',
                'Hot Thermal Film',
            ],
            'Packaging & Finishing' => [
                'Eyelets / Grommets',
                'Double Sided Tape',
                'Seaming Tape',
                'Corner Cutters',
            ],
        ];

        foreach ($map as $catName => $subcategories) {
            $category = Category::where('category', $catName)->first();
            if ($category) {
                foreach ($subcategories as $subName) {
                    Subcategory::firstOrCreate([
                        'subcategory' => $subName,
                        'categories_id' => $category->id,
                    ]);
                }
            }
        }
    }
}
