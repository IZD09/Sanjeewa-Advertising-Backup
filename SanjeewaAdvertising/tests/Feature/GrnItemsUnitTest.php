<?php

namespace Tests\Feature;

use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockUnit;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\PurchaseOrderItem;
use Modules\Supplier\Models\PurchaseOrderStatus;
use Modules\Supplier\Models\Supplier;
use Modules\Supplier\Services\GrnService;
use Modules\Supplier\Services\PurchaseOrderService;
use Tests\TestCase;

class GrnItemsUnitTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_grn_and_po_items_load_unit_from_database(): void
    {
        // 1. Create stock unit
        $unitRolls = StockUnit::firstOrCreate(['id' => 2], ['unit' => 'Rolls', 'symble' => 'roll']);
        $unitLiters = StockUnit::firstOrCreate(['id' => 7], ['unit' => 'Liters', 'symble' => 'L']);

        // 2. Create Category and Subcategory
        $category = Category::firstOrCreate(['category' => 'Testing Media']);
        $subcategory = Subcategory::firstOrCreate(
            ['subcategory' => 'Testing Flex', 'categories_id' => $category->id]
        );

        // 3. Create StockItems with specific stock_units_id
        $itemFlex = StockItem::create([
            'name' => 'Test Flex Banner 440gsm',
            'code' => 'TEST-FLX-'.uniqid(),
            'subcategories_id' => $subcategory->id,
            'stock_units_id' => $unitRolls->id,
        ]);

        $itemInk = StockItem::create([
            'name' => 'Test Cyan Ink 1L',
            'code' => 'TEST-INK-'.uniqid(),
            'subcategories_id' => $subcategory->id,
            'stock_units_id' => $unitLiters->id,
        ]);

        $this->assertEquals('Rolls', $itemFlex->stockUnit?->unit);
        $this->assertEquals('Liters', $itemInk->stockUnit?->unit);

        // 4. Create Supplier and Purchase Order
        $supplier = Supplier::create([
            'name' => 'Unit Test Supplier '.uniqid(),
            'mobile' => '071'.rand(1000000, 9999999),
            'email' => 'supplier_'.uniqid().'@test.com',
        ]);

        $po = PurchaseOrder::create([
            'suppliers_id' => $supplier->id,
            'add_date' => now(),
        ]);

        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemFlex->id,
            'qty_ordered' => 10,
            'qty_received' => 0,
            'unit_cost' => 1500.00,
        ]);

        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemInk->id,
            'qty_ordered' => 5,
            'qty_received' => 0,
            'unit_cost' => 2500.00,
        ]);

        // 5. Test PurchaseOrderService formatting
        $poService = app(PurchaseOrderService::class);
        $freshPo = $poService->getPurchaseOrderById($po->id);
        $formattedPo = $poService->formatPurchaseOrderRecord($freshPo);

        $this->assertCount(2, $formattedPo['items']);
        $this->assertEquals('Rolls', $formattedPo['items'][0]['unit']);
        $this->assertEquals('Liters', $formattedPo['items'][1]['unit']);

        // 6. Test GRN Service formatting
        $grn = Grn::create([
            'at_time' => now(),
            'grn_statuses_id' => 1,
        ]);

        $brand = Brand::firstOrCreate(['brand' => 'Starflex Test']);

        $stock = Stock::create([
            'stock_items_id' => $itemFlex->id,
            'brands_id' => $brand->id,
            'grn_id' => $grn->id,
            'qty' => 10,
            'buy' => 1500.00,
            'price' => 1875.00,
            'add_date' => now(),
        ]);

        $grnService = app(GrnService::class);
        $freshGrn = $grnService->getGrnById($grn->id);
        $formattedGrn = $grnService->formatGrnRecord($freshGrn);

        $this->assertCount(1, $formattedGrn['items']);
        $this->assertEquals('Rolls', $formattedGrn['items'][0]['unit']);
    }

    public function test_create_grn_process_handles_approved_po_brands_new_and_existing_batches(): void
    {
        $unitRolls = StockUnit::firstOrCreate(['id' => 2], ['unit' => 'Rolls', 'symble' => 'roll']);
        $unitLiters = StockUnit::firstOrCreate(['id' => 7], ['unit' => 'Liters', 'symble' => 'L']);

        $category = Category::firstOrCreate(['category' => 'GRN Process Media']);
        $subcategory = Subcategory::firstOrCreate(
            ['subcategory' => 'GRN Process Subcat', 'categories_id' => $category->id]
        );

        $brandStarflex = Brand::firstOrCreate(['brand' => 'Starflex Pro']);
        $brandRoland = Brand::firstOrCreate(['brand' => 'Roland Ink']);

        $itemFlex = StockItem::create([
            'name' => 'StarFlex Banner 510gsm',
            'code' => 'GRN-FLX-'.uniqid(),
            'subcategories_id' => $subcategory->id,
            'stock_units_id' => $unitRolls->id,
        ]);

        $itemInk = StockItem::create([
            'name' => 'Roland Magenta Ink 1L',
            'code' => 'GRN-INK-'.uniqid(),
            'subcategories_id' => $subcategory->id,
            'stock_units_id' => $unitLiters->id,
        ]);

        // Existing batch for itemInk
        $existingBatch = ItemBatch::create([
            'stock_items_id' => $itemInk->id,
        ]);

        PurchaseOrderStatus::firstOrCreate(['id' => 1], ['purchase_orders_status' => 'Pending']);
        $approvedStatus = PurchaseOrderStatus::firstOrCreate(['id' => 2], ['purchase_orders_status' => 'Approved']);
        PurchaseOrderStatus::firstOrCreate(['id' => 3], ['purchase_orders_status' => 'Completed']);

        $supplier = Supplier::create([
            'name' => 'Approved PO Supplier '.uniqid(),
            'mobile' => '077'.rand(1000000, 9999999),
            'email' => 'appsup_'.uniqid().'@test.com',
        ]);

        $po = PurchaseOrder::create([
            'suppliers_id' => $supplier->id,
            'purchase_orders_status_id' => $approvedStatus->id,
            'add_date' => now(),
        ]);

        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemFlex->id,
            'qty_ordered' => 12,
            'qty_received' => 0,
            'unit_cost' => 14000.00,
        ]);

        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemInk->id,
            'qty_ordered' => 6,
            'qty_received' => 0,
            'unit_cost' => 7800.00,
        ]);

        // Submit Create GRN payload matching CreateGrnModal.js
        $response = $this->postJson('/advertising/grns', [
            'status' => 'Pending',
            'purchase_orders' => [
                [
                    'id' => $po->id,
                    'supplyer_invoice' => 'INV-PROC-2026-01',
                ],
            ],
            'purchase_orders_id' => $po->id,
            'supplyer_invoice' => 'INV-PROC-2026-01',
            'remarks' => 'Received in good condition',
            'discount' => 0,
            'stocks' => [
                [
                    'stock_items_id' => $itemFlex->id,
                    'purchase_orders_id' => $po->id,
                    'brands_id' => $brandStarflex->id,
                    'batch_mode' => 'NEW',
                    'create_new_batch' => true,
                    'batch_id' => null,
                    'qty' => 12,
                    'buy' => 14000.00,
                    'price' => 17500.00,
                ],
                [
                    'stock_items_id' => $itemInk->id,
                    'purchase_orders_id' => $po->id,
                    'brands_id' => $brandRoland->id,
                    'batch_mode' => 'EXISTING',
                    'create_new_batch' => false,
                    'batch_id' => $existingBatch->id,
                    'qty' => 6,
                    'buy' => 7800.00,
                    'price' => 9750.00,
                ],
            ],
        ]);

        $response->assertCreated();
        $grnId = $response->json('data.id');
        $this->assertNotEmpty($response->json('data.grn_number'));

        // Verify grn_has_puches_order link
        $this->assertDatabaseHas('grn_has_puches_order', [
            'grn_id' => $grnId,
            'purchase_orders_id' => $po->id,
            'supplyer_invoice' => 'INV-PROC-2026-01',
        ]);

        // Verify stock records created with per-item brands
        $this->assertDatabaseHas('stock', [
            'grn_id' => $grnId,
            'stock_items_id' => $itemFlex->id,
            'brands_id' => $brandStarflex->id,
            'qty' => 12,
            'buy' => 14000.00,
        ]);

        $this->assertDatabaseHas('stock', [
            'grn_id' => $grnId,
            'stock_items_id' => $itemInk->id,
            'brands_id' => $brandRoland->id,
            'qty' => 6,
            'buy' => 7800.00,
        ]);

        // Verify existing batch was reused for itemInk in grm_items
        $inkStock = Stock::where('grn_id', $grnId)->where('stock_items_id', $itemInk->id)->firstOrFail();
        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $grnId,
            'item_batches_id' => $existingBatch->id,
            'stock_id' => $inkStock->id,
            'qty' => 6,
        ]);

        // Verify new batch was created for itemFlex in grm_items
        $flexStock = Stock::where('grn_id', $grnId)->where('stock_items_id', $itemFlex->id)->firstOrFail();
        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $grnId,
            'stock_id' => $flexStock->id,
            'qty' => 12,
        ]);

        // Verify stock movements created
        $this->assertDatabaseHas('stock_movements', [
            'stock_id' => $flexStock->id,
            'qty' => 12,
            'source_id' => $grnId,
        ]);
        $this->assertDatabaseHas('stock_movements', [
            'stock_id' => $inkStock->id,
            'qty' => 6,
            'source_id' => $grnId,
        ]);

        // Verify purchase_order_items qty_received updated and PO marked Completed (3)
        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemFlex->id,
            'qty_received' => 12,
        ]);
        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemInk->id,
            'qty_received' => 6,
        ]);
        $this->assertDatabaseHas('purchase_orders', [
            'id' => $po->id,
            'purchase_orders_status_id' => PurchaseOrderStatus::STATUS_COMPLETED,
        ]);
    }
}
