<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockMovement;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\Supplier;

class StockDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure prerequisite reference seeders have run
        $this->call([
            CategorySeeder::class,
            SubcategorySeeder::class,
            BrandSeeder::class,
            SupplierSeeder::class,
            StockMovementTypeSeeder::class,
        ]);

        DB::transaction(function () {
            // 2. Ensure GRNs and Purchase Orders exist for all key suppliers
            $this->seedSuppliersAndGrns();

            // 3. Define and seed all realistic digital printing Stock Items
            $this->seedStockCatalog();
        });
    }

    /**
     * Ensure realistic Purchase Orders and GRNs exist for suppliers.
     */
    private function seedSuppliersAndGrns(): void
    {
        $now = Carbon::now();

        // Map of GRN IDs to Supplier Name & Invoice info
        $grnConfigs = [
            101 => ['supplier_name' => 'PaperPro Lanka (Pvt) Ltd', 'days_ago' => 35, 'inv' => 'INV-PP-8821'],
            102 => ['supplier_name' => 'Lanka Vinyl & Sign Supplies', 'days_ago' => 28, 'inv' => 'INV-LV-9412'],
            103 => ['supplier_name' => 'ColorTech Eco-Solvent Inks', 'days_ago' => 20, 'inv' => 'INV-CT-5034'],
            104 => ['supplier_name' => 'Ceylon Flex & Banner House', 'days_ago' => 14, 'inv' => 'INV-CF-7102'],
            105 => ['supplier_name' => 'Metro Rigid Boards & Acrylics', 'days_ago' => 8,  'inv' => 'INV-MR-3329'],
            106 => ['supplier_name' => 'Prime Display Hardware Lanka', 'days_ago' => 5,  'inv' => 'INV-PD-4180'],
            107 => ['supplier_name' => 'Lanka Vinyl & Sign Supplies', 'days_ago' => 2,  'inv' => 'INV-LV-9580'],
        ];

        $defaultSupplier = Supplier::first();

        foreach ($grnConfigs as $grnId => $cfg) {
            $supplier = Supplier::where('name', $cfg['supplier_name'])->first() ?? $defaultSupplier;
            if (! $supplier) {
                continue;
            }

            Grn::firstOrCreate(
                ['id' => $grnId],
                [
                    'at_time' => $now->copy()->subDays($cfg['days_ago']),
                    'status' => 'Completed',
                ]
            );

            // Check if GRN is already linked to a purchase order
            $existingLink = DB::table('grn_has_puches_order')
                ->where('grn_id', $grnId)
                ->first();

            if (! $existingLink) {
                $po = PurchaseOrder::create([
                    'suppliers_id' => $supplier->id,
                    'purchase_orders_status_id' => 3, // Received / Completed
                    'add_date' => $now->copy()->subDays($cfg['days_ago'] + 3),
                    'notes' => 'Inventory restock order for digital printing materials',
                ]);

                // Ensure unique invoice string
                $invNumber = $cfg['inv'];
                if (DB::table('grn_has_puches_order')->where('supplyer_invoice', $invNumber)->exists()) {
                    $invNumber .= '-'.rand(10, 99);
                }

                DB::table('grn_has_puches_order')->insert([
                    'grn_id' => $grnId,
                    'purchase_orders_id' => $po->id,
                    'supplyer_invoice' => $invNumber,
                ]);
            }
        }
    }

    /**
     * Seed comprehensive printing materials, batches, and stock entries.
     */
    private function seedStockCatalog(): void
    {
        $now = Carbon::now();

        // Full catalog of printing materials with natural subcategory names and brand names
        $catalog = [
            // ==================== Category 1: Banner Media ====================
            [
                'code' => 'FLX-101',
                'name' => 'Frontlit Flex 280gsm Economy 10ft',
                'subcat' => 'Frontlit Flex 280gsm',
                'low_stock_qty' => 15,
                'reorder_qty' => 30,
                'brands' => ['Starflex', 'Generic / Local'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Starflex', 'qty' => 45, 'buy' => 14500.00, 'price' => 17500.00, 'days_ago' => 14],
                ],
            ],
            [
                'code' => 'FLX-102',
                'name' => 'Frontlit Flex 280gsm Economy 6ft',
                'subcat' => 'Frontlit Flex 280gsm',
                'low_stock_qty' => 10,
                'reorder_qty' => 25,
                'brands' => ['Starflex', 'Generic / Local'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Starflex', 'qty' => 30, 'buy' => 9200.00, 'price' => 11500.00, 'days_ago' => 14],
                ],
            ],
            [
                'code' => 'FLX-201',
                'name' => 'Frontlit Flex 380gsm 10ft',
                'subcat' => 'Frontlit Flex 380gsm (Star)',
                'low_stock_qty' => 15,
                'reorder_qty' => 35,
                'brands' => ['Starflex'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Starflex', 'qty' => 60, 'buy' => 19000.00, 'price' => 23500.00, 'days_ago' => 12],
                ],
            ],
            [
                'code' => 'FLX-203',
                'name' => 'Frontlit Flex 380gsm StarFlex 8ft',
                'subcat' => 'Frontlit Flex 380gsm (Star)',
                'low_stock_qty' => 12,
                'reorder_qty' => 30,
                'brands' => ['Starflex'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Starflex', 'qty' => 8, 'buy' => 16500.00, 'price' => 20000.00, 'days_ago' => 10], // Low Stock!
                ],
            ],
            [
                'code' => 'FLX-202',
                'name' => 'Backlit Banner 510gsm 6ft',
                'subcat' => 'Backlit Flex',
                'low_stock_qty' => 10,
                'reorder_qty' => 20,
                'brands' => ['Starflex'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Starflex', 'qty' => 25, 'buy' => 18000.00, 'price' => 22000.00, 'days_ago' => 14],
                ],
            ],
            [
                'code' => 'FLX-301',
                'name' => 'Blockout Banner Double-Sided 510gsm 10ft',
                'subcat' => 'Blockout Banner',
                'low_stock_qty' => 8,
                'reorder_qty' => 20,
                'brands' => ['Starflex', 'LG Hausys'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Starflex', 'qty' => 14, 'buy' => 28000.00, 'price' => 34000.00, 'days_ago' => 13],
                ],
            ],
            [
                'code' => 'FLX-401',
                'name' => 'Perforated Mesh Banner with Liner 10ft',
                'subcat' => 'Mesh Banner',
                'low_stock_qty' => 6,
                'reorder_qty' => 15,
                'brands' => ['Starflex'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Starflex', 'qty' => 0, 'buy' => 24000.00, 'price' => 29500.00, 'days_ago' => 25], // Out of Stock!
                ],
            ],

            // ==================== Category 2: Stickers & Vinyls ====================
            [
                'code' => 'VIN-301',
                'name' => 'Gloss White Self-Adhesive Vinyl 4.2ft',
                'subcat' => 'Glossy Vinyl',
                'low_stock_qty' => 20,
                'reorder_qty' => 40,
                'brands' => ['Avery Dennison', 'LG Hausys', 'ORAFOL'],
                'stocks' => [
                    ['grn_id' => 102, 'brand' => 'Avery Dennison', 'qty' => 55, 'buy' => 14000.00, 'price' => 17500.00, 'days_ago' => 26],
                    ['grn_id' => 107, 'brand' => 'LG Hausys', 'qty' => 30, 'buy' => 13200.00, 'price' => 16800.00, 'days_ago' => 2],
                ],
            ],
            [
                'code' => 'VIN-101',
                'name' => 'Matte White Polymeric Vinyl 4ft',
                'subcat' => 'Matte Vinyl',
                'low_stock_qty' => 15,
                'reorder_qty' => 30,
                'brands' => ['3M', 'ORAFOL'],
                'stocks' => [
                    ['grn_id' => 102, 'brand' => 'ORAFOL', 'qty' => 40, 'buy' => 16500.00, 'price' => 21000.00, 'days_ago' => 25],
                ],
            ],
            [
                'code' => 'VIN-201',
                'name' => 'Ultra Clear Transparent Vinyl 4.2ft',
                'subcat' => 'Clear Transparent Vinyl',
                'low_stock_qty' => 10,
                'reorder_qty' => 25,
                'brands' => ['LG Hausys', '3M'],
                'stocks' => [
                    ['grn_id' => 102, 'brand' => 'LG Hausys', 'qty' => 22, 'buy' => 15500.00, 'price' => 19000.00, 'days_ago' => 22],
                ],
            ],
            [
                'code' => 'VIN-302',
                'name' => 'One Way Vision Perforated Window Film 4.2ft',
                'subcat' => 'One Way Vision',
                'low_stock_qty' => 12,
                'reorder_qty' => 25,
                'brands' => ['Generic / Local', 'LG Hausys'],
                'stocks' => [
                    ['grn_id' => 102, 'brand' => 'Generic / Local', 'qty' => 18, 'buy' => 22000.00, 'price' => 27500.00, 'days_ago' => 20],
                ],
            ],
            [
                'code' => 'VIN-401',
                'name' => 'Commercial Grade Reflective Vinyl White 4ft',
                'subcat' => 'Reflective Vinyl',
                'low_stock_qty' => 5,
                'reorder_qty' => 15,
                'brands' => ['3M'],
                'stocks' => [
                    ['grn_id' => 107, 'brand' => '3M', 'qty' => 4, 'buy' => 48000.00, 'price' => 58000.00, 'days_ago' => 2], // Low Stock!
                ],
            ],
            [
                'code' => 'VIN-501',
                'name' => 'Heavy Duty Anti-Slip Floor Graphic Vinyl 4ft',
                'subcat' => 'Floor Graphic Vinyl',
                'low_stock_qty' => 8,
                'reorder_qty' => 20,
                'brands' => ['ORAFOL'],
                'stocks' => [
                    ['grn_id' => 107, 'brand' => 'ORAFOL', 'qty' => 14, 'buy' => 32000.00, 'price' => 39000.00, 'days_ago' => 2],
                ],
            ],

            // ==================== Category 3: Inks & Solvents ====================
            [
                'code' => 'INK-101',
                'name' => 'Eco-Solvent Cyan Ink 1L',
                'subcat' => 'Eco-Solvent Cyan',
                'low_stock_qty' => 5,
                'reorder_qty' => 15,
                'brands' => ['Roland', 'Mimaki'],
                'stocks' => [
                    ['grn_id' => 103, 'brand' => 'Roland', 'qty' => 18, 'buy' => 7800.00, 'price' => 9500.00, 'days_ago' => 18],
                ],
            ],
            [
                'code' => 'INK-102',
                'name' => 'Eco-Solvent Magenta Ink 1L',
                'subcat' => 'Eco-Solvent Magenta',
                'low_stock_qty' => 5,
                'reorder_qty' => 15,
                'brands' => ['Roland', 'Mimaki'],
                'stocks' => [
                    ['grn_id' => 103, 'brand' => 'Roland', 'qty' => 15, 'buy' => 7800.00, 'price' => 9500.00, 'days_ago' => 18],
                ],
            ],
            [
                'code' => 'INK-103',
                'name' => 'Eco-Solvent Yellow Ink 1L',
                'subcat' => 'Eco-Solvent Yellow',
                'low_stock_qty' => 5,
                'reorder_qty' => 15,
                'brands' => ['Roland', 'Mimaki'],
                'stocks' => [
                    ['grn_id' => 103, 'brand' => 'Roland', 'qty' => 16, 'buy' => 7800.00, 'price' => 9500.00, 'days_ago' => 18],
                ],
            ],
            [
                'code' => 'INK-104',
                'name' => 'Eco-Solvent Black Ink 1L',
                'subcat' => 'Eco-Solvent Black',
                'low_stock_qty' => 5,
                'reorder_qty' => 15,
                'brands' => ['Roland', 'Mimaki'],
                'stocks' => [
                    ['grn_id' => 103, 'brand' => 'Roland', 'qty' => 22, 'buy' => 7800.00, 'price' => 9500.00, 'days_ago' => 18],
                ],
            ],
            [
                'code' => 'INK-105',
                'name' => 'Universal Cleaning Solvent Flush 1L',
                'subcat' => 'Cleaning Solvent Flush',
                'low_stock_qty' => 8,
                'reorder_qty' => 15,
                'brands' => ['Allwin'],
                'stocks' => [
                    ['grn_id' => 103, 'brand' => 'Allwin', 'qty' => 25, 'buy' => 3200.00, 'price' => 4200.00, 'days_ago' => 18],
                ],
            ],

            // ==================== Category 4: Rigid Boards & Sheets ====================
            [
                'code' => 'RIG-101',
                'name' => 'PVC Foam Board 3mm 8x4ft High Density',
                'subcat' => 'PVC Foam Board 3mm',
                'low_stock_qty' => 20,
                'reorder_qty' => 40,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 105, 'brand' => 'Generic / Local', 'qty' => 110, 'buy' => 2100.00, 'price' => 2800.00, 'days_ago' => 8],
                ],
            ],
            [
                'code' => 'RIG-401',
                'name' => 'Foam Board 5mm 8x4ft White',
                'subcat' => 'PVC Foam Board 5mm',
                'low_stock_qty' => 15,
                'reorder_qty' => 30,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 105, 'brand' => 'Generic / Local', 'qty' => 80, 'buy' => 2800.00, 'price' => 3600.00, 'days_ago' => 8],
                ],
            ],
            [
                'code' => 'RIG-402',
                'name' => 'Acrylic Sheet 3mm Clear 8x4ft',
                'subcat' => 'Acrylic Sheet Clear',
                'low_stock_qty' => 10,
                'reorder_qty' => 20,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 105, 'brand' => 'Generic / Local', 'qty' => 35, 'buy' => 14500.00, 'price' => 18500.00, 'days_ago' => 8],
                ],
            ],
            [
                'code' => 'RIG-201',
                'name' => 'Corrugated Sheet (Corriboard) 4mm 8x4ft',
                'subcat' => 'Corrugated Sheet (Corriboard)',
                'low_stock_qty' => 25,
                'reorder_qty' => 50,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 105, 'brand' => 'Generic / Local', 'qty' => 150, 'buy' => 1450.00, 'price' => 1950.00, 'days_ago' => 7],
                ],
            ],
            [
                'code' => 'RIG-301',
                'name' => 'Aluminium Composite Panel 3mm 8x4ft',
                'subcat' => 'Aluminium Composite Panel',
                'low_stock_qty' => 10,
                'reorder_qty' => 20,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 105, 'brand' => 'Generic / Local', 'qty' => 45, 'buy' => 6800.00, 'price' => 8900.00, 'days_ago' => 7],
                ],
            ],

            // ==================== Category 5: Display Hardware ====================
            [
                'code' => 'DSP-101',
                'name' => 'Aluminium Roll-Up Banner Stand 2.5x6ft',
                'subcat' => 'Rollup Banner Stand',
                'low_stock_qty' => 10,
                'reorder_qty' => 25,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 106, 'brand' => 'Generic / Local', 'qty' => 45, 'buy' => 3500.00, 'price' => 4800.00, 'days_ago' => 5],
                ],
            ],
            [
                'code' => 'DSP-102',
                'name' => 'Luxury Broad Base Roll-Up Stand 3x6.5ft',
                'subcat' => 'Rollup Banner Stand',
                'low_stock_qty' => 5,
                'reorder_qty' => 15,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 106, 'brand' => 'Generic / Local', 'qty' => 4, 'buy' => 6200.00, 'price' => 8500.00, 'days_ago' => 5], // Low Stock!
                ],
            ],
            [
                'code' => 'DSP-201',
                'name' => 'Adjustable X-Banner Stand 2x5ft Fiber Rod',
                'subcat' => 'X-Stand Banner',
                'low_stock_qty' => 15,
                'reorder_qty' => 30,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 106, 'brand' => 'Generic / Local', 'qty' => 65, 'buy' => 1800.00, 'price' => 2600.00, 'days_ago' => 5],
                ],
            ],
            [
                'code' => 'DSP-301',
                'name' => 'Curved Magnetic Pop-Up Display 3x3 with Case',
                'subcat' => 'Pop-up Display',
                'low_stock_qty' => 2,
                'reorder_qty' => 5,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 106, 'brand' => 'Generic / Local', 'qty' => 3, 'buy' => 45000.00, 'price' => 62000.00, 'days_ago' => 5],
                ],
            ],
            [
                'code' => 'DSP-401',
                'name' => 'Aluminium Snap Frame A1 Poster Display',
                'subcat' => 'Sign Snap Frame',
                'low_stock_qty' => 8,
                'reorder_qty' => 20,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 106, 'brand' => 'Generic / Local', 'qty' => 28, 'buy' => 4200.00, 'price' => 5800.00, 'days_ago' => 5],
                ],
            ],

            // ==================== Category 6: Lamination Films ====================
            [
                'code' => 'LAM-101',
                'name' => 'Cold Glossy Overlaminate Film 80mic 4.2ft',
                'subcat' => 'Cold Gloss Lamination',
                'low_stock_qty' => 15,
                'reorder_qty' => 30,
                'brands' => ['ORAFOL', 'LG Hausys'],
                'stocks' => [
                    ['grn_id' => 102, 'brand' => 'ORAFOL', 'qty' => 42, 'buy' => 11500.00, 'price' => 14800.00, 'days_ago' => 24],
                ],
            ],
            [
                'code' => 'VIN-303',
                'name' => 'Matte Clear Lamination Film 4.5ft',
                'subcat' => 'Cold Matte Lamination',
                'low_stock_qty' => 12,
                'reorder_qty' => 25,
                'brands' => ['Avery Dennison', 'LG Hausys'],
                'stocks' => [
                    ['grn_id' => 102, 'brand' => 'Avery Dennison', 'qty' => 36, 'buy' => 12800.00, 'price' => 16200.00, 'days_ago' => 24],
                ],
            ],
            [
                'code' => 'LAM-201',
                'name' => 'Thermal BOPP Gloss Lamination Film 1000m',
                'subcat' => 'Hot Thermal Film',
                'low_stock_qty' => 5,
                'reorder_qty' => 12,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 101, 'brand' => 'Generic / Local', 'qty' => 10, 'buy' => 18500.00, 'price' => 23500.00, 'days_ago' => 30],
                ],
            ],

            // ==================== Category 7: Packaging & Finishing ====================
            [
                'code' => 'ACC-101',
                'name' => 'Brass Eyelets #4 with Washers (1000pcs)',
                'subcat' => 'Eyelets / Grommets',
                'low_stock_qty' => 10,
                'reorder_qty' => 25,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Generic / Local', 'qty' => 75, 'buy' => 2400.00, 'price' => 3200.00, 'days_ago' => 14],
                ],
            ],
            [
                'code' => 'ACC-201',
                'name' => 'Double Sided Banner Tape 25mm x 50m',
                'subcat' => 'Double Sided Tape',
                'low_stock_qty' => 20,
                'reorder_qty' => 50,
                'brands' => ['3M', 'Generic / Local'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => '3M', 'qty' => 110, 'buy' => 1250.00, 'price' => 1750.00, 'days_ago' => 14],
                ],
            ],
            [
                'code' => 'ACC-301',
                'name' => 'Banner Seaming Hem Tape 40mm x 50m',
                'subcat' => 'Seaming Tape',
                'low_stock_qty' => 15,
                'reorder_qty' => 30,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 104, 'brand' => 'Generic / Local', 'qty' => 45, 'buy' => 1850.00, 'price' => 2450.00, 'days_ago' => 14],
                ],
            ],
            [
                'code' => 'ACC-401',
                'name' => 'Heavy Duty Desktop Corner Rounder Punch',
                'subcat' => 'Corner Cutters',
                'low_stock_qty' => 3,
                'reorder_qty' => 6,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 106, 'brand' => 'Generic / Local', 'qty' => 5, 'buy' => 8500.00, 'price' => 12000.00, 'days_ago' => 5],
                ],
            ],

            // ==================== Category 8: Paper ====================
            [
                'code' => 'PAP-003',
                'name' => '150gsm Glossy Art Paper A4 (500 Sheets)',
                'subcat' => 'A4 Paper',
                'low_stock_qty' => 30,
                'reorder_qty' => 60,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 101, 'brand' => 'Generic / Local', 'qty' => 140, 'buy' => 2200.00, 'price' => 2900.00, 'days_ago' => 34],
                ],
            ],
            [
                'code' => 'PAP-101',
                'name' => 'Digital Gloss Sticker Paper A4 (100 Sheets)',
                'subcat' => 'A4 Paper',
                'low_stock_qty' => 20,
                'reorder_qty' => 40,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 101, 'brand' => 'Generic / Local', 'qty' => 85, 'buy' => 1600.00, 'price' => 2200.00, 'days_ago' => 34],
                ],
            ],
            [
                'code' => 'PAP-001',
                'name' => '300gsm Art Board SRA3 (100 Sheets)',
                'subcat' => 'A3 Paper',
                'low_stock_qty' => 25,
                'reorder_qty' => 50,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 101, 'brand' => 'Generic / Local', 'qty' => 90, 'buy' => 3800.00, 'price' => 4900.00, 'days_ago' => 34],
                ],
            ],
            [
                'code' => 'PAP-002',
                'name' => '250gsm Ivory Board A3 (100 Sheets)',
                'subcat' => 'A3 Paper',
                'low_stock_qty' => 20,
                'reorder_qty' => 40,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 101, 'brand' => 'Generic / Local', 'qty' => 70, 'buy' => 3400.00, 'price' => 4400.00, 'days_ago' => 34],
                ],
            ],
            [
                'code' => 'PAP-102',
                'name' => 'Matte Digital Paper 200gsm SRA3 (250s)',
                'subcat' => 'A3 Paper',
                'low_stock_qty' => 15,
                'reorder_qty' => 30,
                'brands' => ['Generic / Local'],
                'stocks' => [
                    ['grn_id' => 101, 'brand' => 'Generic / Local', 'qty' => 60, 'buy' => 4200.00, 'price' => 5500.00, 'days_ago' => 34],
                ],
            ],
        ];

        $defaultSubcat = Subcategory::first();
        $defaultBrand = Brand::first();

        foreach ($catalog as $itemData) {
            $subcat = Subcategory::where('subcategory', $itemData['subcat'])->first() ?? $defaultSubcat;
            $subcatId = $subcat ? $subcat->id : 1;

            // Update or create StockItem
            $stockItem = StockItem::updateOrCreate(
                ['code' => $itemData['code']],
                [
                    'name' => $itemData['name'],
                    'subcategories_id' => $subcatId,
                    'low_stock_qty' => $itemData['low_stock_qty'],
                    'reorder_qty' => $itemData['reorder_qty'],
                ]
            );

            // Link Brand relationships (stock_items_has_brands)
            if (! empty($itemData['brands'])) {
                $brandIds = Brand::whereIn('brand', $itemData['brands'])->pluck('id')->all();
                if (! empty($brandIds)) {
                    $stockItem->brands()->syncWithoutDetaching($brandIds);
                }
            }

            // Ensure an ItemBatch exists for this StockItem
            $batch = ItemBatch::firstOrCreate(['stock_items_id' => $stockItem->id]);

            // Seed Stock rows for this item
            foreach ($itemData['stocks'] as $sData) {
                $brand = Brand::where('brand', $sData['brand'])->first() ?? $defaultBrand;
                $brandId = $brand ? $brand->id : 1;

                // Check if a stock record exists for this item and brand/grn
                $existingStock = Stock::where('stock_items_id', $stockItem->id)
                    ->where('brands_id', $brandId)
                    ->where('grn_id', $sData['grn_id'])
                    ->first();

                if ($existingStock) {
                    $existingStock->update([
                        'qty' => $sData['qty'],
                        'price' => $sData['price'],
                        'buy' => $sData['buy'],
                    ]);
                    $stockModel = $existingStock;
                } else {
                    $stockModel = Stock::create([
                        'stock_items_id' => $stockItem->id,
                        'add_date' => $now->copy()->subDays($sData['days_ago']),
                        'qty' => $sData['qty'],
                        'price' => $sData['price'],
                        'buy' => $sData['buy'],
                        'grn_id' => $sData['grn_id'],
                        'brands_id' => $brandId,
                    ]);
                }

                // Link to grm_items
                $grmExists = DB::table('grm_items')
                    ->where('grn_id', $sData['grn_id'])
                    ->where('item_batches_id', $batch->id)
                    ->where('stock_id', $stockModel->id)
                    ->exists();

                if (! $grmExists) {
                    DB::table('grm_items')->insert([
                        'grn_id' => $sData['grn_id'],
                        'item_batches_id' => $batch->id,
                        'stock_id' => $stockModel->id,
                        'qty' => $sData['qty'],
                    ]);
                }

                // Add an initial stock movement receipt if none exists for this stock
                $hasMovement = StockMovement::where('stock_id', $stockModel->id)->exists();
                if (! $hasMovement && $sData['qty'] > 0) {
                    StockMovement::create([
                        'stock_id' => $stockModel->id,
                        'stock_movements_types_id' => 1, // GRN / Purchase Receipt
                        'qty' => $sData['qty'],
                        'date' => $now->copy()->subDays($sData['days_ago'])->setHour(rand(9, 16)),
                        'source_id' => $sData['grn_id'],
                    ]);
                }
            }
        }
    }
}
