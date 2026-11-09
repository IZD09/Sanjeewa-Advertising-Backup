<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockMovement;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;

class StockMovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Categories, Subcategories, Brands & Movement Types exist
        $this->call([
            CategorySeeder::class,
            SubcategorySeeder::class,
            BrandSeeder::class,
            StockMovementTypeSeeder::class,
        ]);

        // 2. Ensure at least one GRN exists for linking
        $grn = Grn::firstOrCreate(['id' => 101], [
            'at_time' => Carbon::now()->subDays(30),
        ]);
        $grn2 = Grn::firstOrCreate(['id' => 102], [
            'at_time' => Carbon::now()->subDays(15),
        ]);

        $subcat = Subcategory::first();
        $brand = Brand::first();

        // 3. Define sample stock items
        $itemsData = [
            ['code' => 'PAP-001', 'name' => '300gsm Art Board SRA3', 'qty' => 2700, 'price' => 45.00, 'buy' => 40.00],
            ['code' => 'PAP-002', 'name' => '250gsm Ivory Board A3', 'qty' => 1280, 'price' => 38.00, 'buy' => 34.00],
            ['code' => 'PAP-003', 'name' => '150gsm Glossy Art Paper A4', 'qty' => 4200, 'price' => 14.00, 'buy' => 11.50],
            ['code' => 'INK-101', 'name' => 'Eco-Solvent Cyan Ink 1L', 'qty' => 8, 'price' => 8500.00, 'buy' => 7800.00],
            ['code' => 'INK-102', 'name' => 'Eco-Solvent Magenta Ink 1L', 'qty' => 4, 'price' => 8500.00, 'buy' => 7800.00],
            ['code' => 'INK-103', 'name' => 'Eco-Solvent Yellow Ink 1L', 'qty' => 12, 'price' => 8500.00, 'buy' => 7800.00],
            ['code' => 'FLX-201', 'name' => 'Frontlit Flex 380gsm 10ft', 'qty' => 180, 'price' => 65.00, 'buy' => 52.00],
            ['code' => 'FLX-202', 'name' => 'Backlit Banner 510gsm 6ft', 'qty' => 95, 'price' => 120.00, 'buy' => 98.00],
            ['code' => 'VIN-301', 'name' => 'Gloss White Self-Adhesive Vinyl 4.2ft', 'qty' => 340, 'price' => 88.00, 'buy' => 72.00],
            ['code' => 'VIN-303', 'name' => 'Matte Clear Lamination Film 4.5ft', 'qty' => 210, 'price' => 54.00, 'buy' => 42.00],
            ['code' => 'RIG-401', 'name' => 'Foam Board 5mm 8x4ft White', 'qty' => 65, 'price' => 2850.00, 'buy' => 2400.00],
            ['code' => 'RIG-402', 'name' => 'Acrylic Sheet 3mm Clear 8x4ft', 'qty' => 15, 'price' => 9200.00, 'buy' => 8100.00],
        ];

        $stockModels = [];
        foreach ($itemsData as $idx => $d) {
            $stockItem = StockItem::firstOrCreate(
                ['code' => $d['code']],
                [
                    'name' => $d['name'],
                    'subcategories_id' => $subcat ? $subcat->id : 1,
                ]
            );

            $stock = Stock::firstOrCreate(
                ['stock_items_id' => $stockItem->id],
                [
                    'add_date' => Carbon::now()->subDays(25 - $idx),
                    'qty' => $d['qty'],
                    'price' => $d['price'],
                    'buy' => $d['buy'],
                    'grn_id' => ($idx % 2 === 0) ? $grn->id : $grn2->id,
                    'brands_id' => $brand ? $brand->id : 1,
                ]
            );

            $stockModels[] = $stock;
        }

        // 4. Seed Stock Movements if empty
        if (StockMovement::count() === 0 && count($stockModels) > 0) {
            $movementsSeed = [
                ['stock_idx' => 0, 'type_id' => 1, 'qty' => 2500, 'days_ago' => 25, 'source_id' => 101], // GRN
                ['stock_idx' => 0, 'type_id' => 1, 'qty' => 1500, 'days_ago' => 20, 'source_id' => 102], // GRN
                ['stock_idx' => 0, 'type_id' => 2, 'qty' => 350,  'days_ago' => 18, 'source_id' => 1048], // Job Issue
                ['stock_idx' => 0, 'type_id' => 2, 'qty' => 450,  'days_ago' => 15, 'source_id' => 1052], // Job Issue
                ['stock_idx' => 0, 'type_id' => 5, 'qty' => 20,   'days_ago' => 12, 'source_id' => 201],  // Adjustment
                ['stock_idx' => 0, 'type_id' => 6, 'qty' => 15,   'days_ago' => 10, 'source_id' => 301],  // Damage
                ['stock_idx' => 1, 'type_id' => 1, 'qty' => 1000, 'days_ago' => 22, 'source_id' => 101],
                ['stock_idx' => 1, 'type_id' => 2, 'qty' => 150,  'days_ago' => 19, 'source_id' => 1049],
                ['stock_idx' => 1, 'type_id' => 2, 'qty' => 220,  'days_ago' => 14, 'source_id' => 1055],
                ['stock_idx' => 1, 'type_id' => 3, 'qty' => 500,  'days_ago' => 8,  'source_id' => 103],  // Manual In
                ['stock_idx' => 2, 'type_id' => 1, 'qty' => 5000, 'days_ago' => 24, 'source_id' => 101],
                ['stock_idx' => 2, 'type_id' => 2, 'qty' => 800,  'days_ago' => 16, 'source_id' => 1050],
                ['stock_idx' => 2, 'type_id' => 4, 'qty' => 100,  'days_ago' => 9,  'source_id' => 401],  // Manual Out
                ['stock_idx' => 3, 'type_id' => 1, 'qty' => 15,   'days_ago' => 21, 'source_id' => 102],
                ['stock_idx' => 3, 'type_id' => 2, 'qty' => 3,    'days_ago' => 17, 'source_id' => 1051],
                ['stock_idx' => 3, 'type_id' => 2, 'qty' => 4,    'days_ago' => 11, 'source_id' => 1058],
                ['stock_idx' => 4, 'type_id' => 1, 'qty' => 10,   'days_ago' => 20, 'source_id' => 102],
                ['stock_idx' => 4, 'type_id' => 2, 'qty' => 6,    'days_ago' => 13, 'source_id' => 1053],
                ['stock_idx' => 5, 'type_id' => 1, 'qty' => 15,   'days_ago' => 19, 'source_id' => 102],
                ['stock_idx' => 5, 'type_id' => 2, 'qty' => 3,    'days_ago' => 7,  'source_id' => 1060],
                ['stock_idx' => 6, 'type_id' => 1, 'qty' => 300,  'days_ago' => 23, 'source_id' => 101],
                ['stock_idx' => 6, 'type_id' => 2, 'qty' => 120,  'days_ago' => 14, 'source_id' => 1054],
                ['stock_idx' => 7, 'type_id' => 1, 'qty' => 150,  'days_ago' => 18, 'source_id' => 101],
                ['stock_idx' => 7, 'type_id' => 2, 'qty' => 55,   'days_ago' => 10, 'source_id' => 1056],
                ['stock_idx' => 8, 'type_id' => 1, 'qty' => 500,  'days_ago' => 22, 'source_id' => 102],
                ['stock_idx' => 8, 'type_id' => 2, 'qty' => 160,  'days_ago' => 12, 'source_id' => 1057],
                ['stock_idx' => 9, 'type_id' => 1, 'qty' => 300,  'days_ago' => 20, 'source_id' => 102],
                ['stock_idx' => 9, 'type_id' => 2, 'qty' => 90,   'days_ago' => 8,  'source_id' => 1059],
                ['stock_idx' => 10, 'type_id' => 1, 'qty' => 80,  'days_ago' => 16, 'source_id' => 101],
                ['stock_idx' => 10, 'type_id' => 2, 'qty' => 15,  'days_ago' => 6,  'source_id' => 1061],
                ['stock_idx' => 11, 'type_id' => 1, 'qty' => 20,  'days_ago' => 15, 'source_id' => 101],
                ['stock_idx' => 11, 'type_id' => 2, 'qty' => 5,   'days_ago' => 4,  'source_id' => 1062],
                ['stock_idx' => 0,  'type_id' => 2, 'qty' => 120,  'days_ago' => 2,  'source_id' => 1063],
                ['stock_idx' => 6,  'type_id' => 5, 'qty' => 10,   'days_ago' => 1,  'source_id' => 202],
            ];

            foreach ($movementsSeed as $m) {
                $stockModel = $stockModels[$m['stock_idx']] ?? $stockModels[0];
                StockMovement::create([
                    'stock_id' => $stockModel->id,
                    'stock_movements_types_id' => $m['type_id'],
                    'qty' => $m['qty'],
                    'date' => Carbon::now()->subDays($m['days_ago'])->setHour(rand(8, 17))->setMinute(rand(0, 59)),
                    'source_id' => $m['source_id'],
                ]);
            }
        }
    }
}
