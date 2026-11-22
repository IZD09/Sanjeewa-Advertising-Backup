<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\GrmItem;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockMovementType;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\GrnStatus;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\PurchaseOrderItem;
use Modules\Supplier\Models\PurchaseOrderStatus;
use Modules\Supplier\Models\Supplier;
use Tests\TestCase;

class InventoryStockReceiptTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $types = [
            ['id' => 1, 'stock_movements_type' => 'GRN / Purchase Receipt'],
            ['id' => 2, 'stock_movements_type' => 'Job Usage / Issue'],
            ['id' => 3, 'stock_movements_type' => 'Manual Stock In'],
            ['id' => 4, 'stock_movements_type' => 'Manual Stock Out'],
            ['id' => 5, 'stock_movements_type' => 'Inventory Adjustment'],
            ['id' => 6, 'stock_movements_type' => 'Damage / Wastage'],
            ['id' => 7, 'stock_movements_type' => 'Return to Supplier'],
        ];

        foreach ($types as $type) {
            StockMovementType::firstOrCreate(['id' => $type['id']], $type);
        }
    }

    public function test_can_fetch_stock_inventory_listing_and_form_data(): void
    {
        $category = Category::create(['category' => 'Test Paper']);
        $subcat = Subcategory::create(['subcategory' => 'Art Paper', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'TestBrand']);
        $item = StockItem::create(['name' => 'Glossy A4', 'code' => 'PAP-999', 'subcategories_id' => $subcat->id]);
        $grn = Grn::create(['at_time' => now()]);

        $stock = Stock::create([
            'stock_items_id' => $item->id,
            'brands_id' => $brand->id,
            'qty' => 150,
            'price' => 45.00,
            'buy' => 38.00,
            'grn_id' => $grn->id,
            'add_date' => now(),
        ]);

        // Test form data endpoint
        $formDataResponse = $this->getJson('/api/v1/inventory/stocks/form-data');
        $formDataResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => ['categories', 'brands', 'stock_items', 'grns'],
            ]);

        // Test stocks listing
        $listingResponse = $this->getJson('/api/v1/inventory/stocks?per_page=20');
        $listingResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.items.0.name', 'Glossy A4')
            ->assertJsonPath('data.items.0.brand', 'TestBrand')
            ->assertJsonPath('data.aggregated_items.0.code', 'PAP-999')
            ->assertJsonPath('data.aggregated_items.0.total_qty', 150);
    }

    public function test_can_fetch_aggregated_stock_items_listing(): void
    {
        $category = Category::create(['category' => 'Paper & Boards']);
        $subcat = Subcategory::create(['subcategory' => 'Art Paper', 'categories_id' => $category->id]);
        $brand1 = Brand::create(['brand' => 'Brand Alpha']);
        $brand2 = Brand::create(['brand' => 'Brand Beta']);
        $item = StockItem::create([
            'name' => 'Art Board 300gsm',
            'code' => 'PAP-300',
            'subcategories_id' => $subcat->id,
            'low_stock_qty' => 50,
            'reorder_qty' => 100,
        ]);
        $item->brands()->attach([$brand1->id, $brand2->id]);

        $grn = Grn::create(['at_time' => now()]);

        // Create 2 batches / stock records for the same item
        Stock::create([
            'stock_items_id' => $item->id,
            'brands_id' => $brand1->id,
            'qty' => 120,
            'price' => 50.00,
            'buy' => 40.00,
            'grn_id' => $grn->id,
            'add_date' => now(),
        ]);

        Stock::create([
            'stock_items_id' => $item->id,
            'brands_id' => $brand2->id,
            'qty' => 80,
            'price' => 55.00,
            'buy' => 42.00,
            'grn_id' => $grn->id,
            'add_date' => now(),
        ]);

        $response = $this->getJson('/api/v1/inventory/stocks?per_page=20');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'items',
                    'aggregated_items',
                    'pagination',
                    'stats',
                ],
            ]);

        // Detailed stocks has 2 items
        $this->assertCount(2, $response->json('data.items'));

        // Aggregated has 1 item with summed total_qty = 200, total_val = 10400 (120*50 + 80*55), batches_count = 2
        $agg = $response->json('data.aggregated_items');
        $this->assertCount(1, $agg);
        $this->assertSame('PAP-300', $agg[0]['code']);
        $this->assertSame(200, $agg[0]['total_qty']);
        $this->assertSame(10400.0, (float) $agg[0]['total_val']);
        $this->assertSame(2, $agg[0]['batches_count']);
        $this->assertSame('In Stock', $agg[0]['status']['label']);
    }

    public function test_can_store_new_stock_and_creates_stock_movement_with_grn_source_id(): void
    {
        $category = Category::create(['category' => 'Flex']);
        $subcat = Subcategory::create(['subcategory' => 'Frontlit', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'StarFlex']);
        $item = StockItem::create(['name' => 'Frontlit 440gsm', 'code' => 'FLX-001', 'subcategories_id' => $subcat->id]);
        $grn = Grn::create([
            'at_time' => now(),
            'grn_statuses_id' => GrnStatus::STATUS_PENDING_STOCK,
        ]);

        $payload = [
            'stock_items_id' => $item->id,
            'brands_id' => $brand->id,
            'qty' => 500,
            'buy' => 75.00,
            'price' => 95.00,
            'grn_id' => $grn->id,
            'create_new_batch' => true,
        ];

        $response = $this->postJson('/api/v1/inventory/stocks', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.currentStock', 500);

        $this->assertDatabaseHas('stock', [
            'stock_items_id' => $item->id,
            'brands_id' => $brand->id,
            'qty' => 500,
            'grn_id' => $grn->id,
        ]);

        // Verify stock movement created with source_id = grn_id
        $this->assertDatabaseHas('stock_movements', [
            'qty' => 500,
            'source_id' => $grn->id,
            'stock_movements_types_id' => 1,
        ]);

        // Verify grm_items
        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $grn->id,
            'qty' => 500,
        ]);
    }

    public function test_can_update_existing_stock_and_creates_stock_movement_with_grn_source_id(): void
    {
        $category = Category::create(['category' => 'Inks']);
        $subcat = Subcategory::create(['subcategory' => 'Solvent', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'Flora']);
        $item = StockItem::create(['name' => 'Solvent Cyan 1L', 'code' => 'INK-001', 'subcategories_id' => $subcat->id]);
        $grn1 = Grn::create(['at_time' => now()->subDays(5)]);
        $grn2 = Grn::create(['at_time' => now()]);

        $batch = ItemBatch::create(['stock_items_id' => $item->id]);

        $stock = Stock::create([
            'stock_items_id' => $item->id,
            'brands_id' => $brand->id,
            'qty' => 20,
            'price' => 8500.00,
            'buy' => 7200.00,
            'grn_id' => $grn1->id,
            'add_date' => now()->subDays(5),
        ]);

        $payload = [
            'stock_id' => $stock->id,
            'qty' => 10,
            'buy' => 7300.00,
            'price' => 8600.00,
            'grn_id' => $grn2->id,
            'batch_id' => $batch->id,
        ];

        $response = $this->putJson("/api/v1/inventory/stocks/{$stock->id}", $payload);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.currentStock', 30); // 20 + 10

        $this->assertDatabaseHas('stock', [
            'id' => $stock->id,
            'qty' => 30,
            'buy' => 7300.00,
            'price' => 8600.00,
            'grn_id' => $grn2->id,
        ]);

        // Verify movement has incoming qty 10 and source_id = grn2->id
        $this->assertDatabaseHas('stock_movements', [
            'stock_id' => $stock->id,
            'qty' => 10,
            'source_id' => $grn2->id,
            'stock_movements_types_id' => 1,
        ]);
    }

    public function test_grn_unstocked_items_are_loaded_and_removed_after_stock_added(): void
    {
        $category = Category::create(['category' => 'Display Media']);
        $subcat = Subcategory::create(['subcategory' => 'Vinyl', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'Avery']);
        $item1 = StockItem::create(['name' => 'Gloss Vinyl 100mic', 'code' => 'VIN-001', 'subcategories_id' => $subcat->id]);
        $item2 = StockItem::create(['name' => 'Matte Vinyl 100mic', 'code' => 'VIN-002', 'subcategories_id' => $subcat->id]);

        $status = PurchaseOrderStatus::firstOrCreate(['id' => 1], ['purchase_orders_status' => 'Pending']);
        $supplier = Supplier::create(['name' => 'Test Supplier', 'mobile' => '0771234567']);

        $po = PurchaseOrder::create([
            'add_date' => now(),
            'suppliers_id' => $supplier->id,
            'purchase_orders_status_id' => $status->id,
        ]);

        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $item1->id,
            'unit_cost' => 150.00,
            'qty_ordered' => 50,
            'qty_received' => 50,
        ]);

        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $item2->id,
            'unit_cost' => 200.00,
            'qty_ordered' => 30,
            'qty_received' => 30,
        ]);

        $grn = Grn::create([
            'at_time' => now(),
            'grn_statuses_id' => GrnStatus::STATUS_PENDING_STOCK,
        ]);
        $grn->purchaseOrders()->attach($po->id, ['supplyer_invoice' => 'INV-TEST-01']);

        $otherGrn = Grn::create([
            'at_time' => now(),
            'grn_statuses_id' => GrnStatus::STATUS_PENDING,
        ]);
        $otherGrn->purchaseOrders()->attach($po->id, ['supplyer_invoice' => 'INV-TEST-02']);

        // Step 1: Check form-data endpoint before stock added - only Pending Stock GRN is returned with both items
        $formData1 = $this->getJson('/api/v1/inventory/stocks/form-data')->json();
        $grnData1 = collect($formData1['data']['grns'])->firstWhere('id', $grn->id);
        $otherGrnData1 = collect($formData1['data']['grns'])->firstWhere('id', $otherGrn->id);

        $this->assertNotNull($grnData1);
        $this->assertNull($otherGrnData1);
        $this->assertCount(2, $grnData1['items']);

        // Check calculations and GRN item metadata (Category, Subcategory, Brand, Batch ID) on item 1: 50 * 150.00 = 7500.00
        $item1Data = collect($grnData1['items'])->firstWhere('id', $item1->id);
        $this->assertEquals(50, $item1Data['qty']);
        $this->assertEquals(150.00, $item1Data['unit_cost']);
        $this->assertEquals(7500.00, $item1Data['total_cost']);
        $this->assertEquals('Display Media', $item1Data['category_name']);
        $this->assertEquals('Vinyl', $item1Data['subcategory_name']);
        $this->assertEquals('Avery', $item1Data['brand_name']);
        $this->assertNull($item1Data['batch_id']);
        $this->assertNull($item1Data['batch_no']);

        // Step 2: Add item 1 to stock
        $payload = [
            'stock_items_id' => $item1->id,
            'brands_id' => $brand->id,
            'qty' => 50,
            'buy' => 150.00,
            'price' => 187.50,
            'grn_id' => $grn->id,
            'create_new_batch' => true,
        ];

        $storeResponse = $this->postJson('/api/v1/inventory/stocks', $payload);
        $storeResponse->assertCreated();

        // Step 3: Check form-data endpoint after item 1 added - item 1 must be removed, only item 2 remains!
        $formData2 = $this->getJson('/api/v1/inventory/stocks/form-data')->json();
        $grnData2 = collect($formData2['data']['grns'])->firstWhere('id', $grn->id);

        $this->assertNotNull($grnData2);
        $this->assertCount(1, $grnData2['items']);
        $this->assertEquals($item2->id, $grnData2['items'][0]['id']);

        // Step 4: Add item 2 to stock
        $payload2 = [
            'stock_items_id' => $item2->id,
            'brands_id' => $brand->id,
            'qty' => 30,
            'buy' => 200.00,
            'price' => 250.00,
            'grn_id' => $grn->id,
            'create_new_batch' => true,
        ];

        $storeResponse2 = $this->postJson('/api/v1/inventory/stocks', $payload2);
        $storeResponse2->assertCreated();

        // Step 5: Check form-data endpoint after item 2 added - GRN is fully stocked, so it is removed from Select GRN Reference!
        $formData3 = $this->getJson('/api/v1/inventory/stocks/form-data')->json();
        $grnData3 = collect($formData3['data']['grns'])->firstWhere('id', $grn->id);

        $this->assertNull($grnData3);
    }

    public function test_can_adjust_stock_quantity_up_and_down_and_record_movement(): void
    {
        StockMovementType::firstOrCreate(['id' => 3], ['stock_movements_type' => 'Manual Stock In']);
        StockMovementType::firstOrCreate(['id' => 5], ['stock_movements_type' => 'Inventory Adjustment']);
        StockMovementType::firstOrCreate(['id' => 6], ['stock_movements_type' => 'Damage / Wastage']);

        $category = Category::create(['category' => 'Adjust Test Category']);
        $subcat = Subcategory::create(['subcategory' => 'Adjust Subcategory', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'Adjust Brand']);
        $item = StockItem::create(['name' => 'Adjustable Item', 'code' => 'ADJ-001', 'subcategories_id' => $subcat->id]);
        $grn = Grn::create(['at_time' => now()]);

        $stock = Stock::create([
            'stock_items_id' => $item->id,
            'brands_id' => $brand->id,
            'qty' => 100,
            'price' => 250.00,
            'buy' => 200.00,
            'grn_id' => $grn->id,
            'add_date' => now(),
        ]);

        // 1. Adjust up (ADD: 100 -> 105)
        $responseAdd = $this->postJson("/api/v1/inventory/stocks/{$stock->id}/adjust", [
            'stock_id' => $stock->id,
            'adjustment_type' => 'ADD',
            'new_qty' => 105,
            'qty' => 5,
            'reason' => 'New Inflow / Restock',
            'remarks' => 'Found 5 extra units during audit',
        ]);

        $responseAdd->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.qty', 105);

        $this->assertDatabaseHas('stock', [
            'id' => $stock->id,
            'qty' => 105,
        ]);

        $this->assertDatabaseHas('stock_movements', [
            'stock_id' => $stock->id,
            'stock_movements_types_id' => 3,
            'qty' => 5,
        ]);

        // 2. Adjust down (DEDUCT: 105 -> 95)
        $responseDeduct = $this->postJson("/api/v1/inventory/stocks/{$stock->id}/adjust", [
            'stock_id' => $stock->id,
            'adjustment_type' => 'DEDUCT',
            'new_qty' => 95,
            'qty' => 10,
            'reason' => 'Damaged / Wasted',
            'remarks' => 'Damaged during storage',
        ]);

        $responseDeduct->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.qty', 95);

        $this->assertDatabaseHas('stock', [
            'id' => $stock->id,
            'qty' => 95,
        ]);

        $this->assertDatabaseHas('stock_movements', [
            'stock_id' => $stock->id,
            'stock_movements_types_id' => 6,
            'qty' => 10,
        ]);

        // 3. Adjust via direct endpoint
        $responseDirect = $this->postJson('/api/v1/inventory/stocks/adjust', [
            'stock_id' => $stock->id,
            'adjustment_type' => 'ADD',
            'new_qty' => 120,
            'qty' => 25,
            'reason' => 'Physical Count Mismatch',
        ]);

        $responseDirect->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.qty', 120);

        $this->assertDatabaseHas('stock', [
            'id' => $stock->id,
            'qty' => 120,
        ]);
    }

    public function test_can_receive_bulk_stock_items_for_grn(): void
    {
        $category = Category::create(['category' => 'Raw Materials']);
        $subcat = Subcategory::create(['subcategory' => 'Vinyl', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'Avery']);
        $item1 = StockItem::create(['name' => 'Gloss Vinyl', 'code' => 'VIN-001', 'subcategories_id' => $subcat->id]);
        $item2 = StockItem::create(['name' => 'Matte Vinyl', 'code' => 'VIN-002', 'subcategories_id' => $subcat->id]);
        $existingBatchForItem2 = ItemBatch::create(['stock_items_id' => $item2->id]);
        $grn = Grn::create([
            'at_time' => now(),
            'grn_statuses_id' => GrnStatus::STATUS_PENDING_STOCK,
        ]);

        $payload = [
            'grn_id' => $grn->id,
            'add_date' => now()->toDateString(),
            'items' => [
                [
                    'stock_items_id' => $item1->id,
                    'brands_id' => $brand->id,
                    'qty' => 50,
                    'buy' => 120.00,
                    'price' => 180.00,
                    'batch_id' => null,
                    'create_new_batch' => true,
                ],
                [
                    'stock_items_id' => $item2->id,
                    'brands_id' => $brand->id,
                    'qty' => 30,
                    'buy' => 140.00,
                    'price' => 210.00,
                    'batch_id' => $existingBatchForItem2->id,
                    'create_new_batch' => false,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/inventory/stocks', $payload);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('stock', [
            'stock_items_id' => $item1->id,
            'brands_id' => $brand->id,
            'qty' => 50,
            'grn_id' => $grn->id,
        ]);

        $this->assertDatabaseHas('stock', [
            'stock_items_id' => $item2->id,
            'brands_id' => $brand->id,
            'qty' => 30,
            'grn_id' => $grn->id,
        ]);

        // Verify item2 used its existing batch ID while item1 generated a new batch
        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $grn->id,
            'item_batches_id' => $existingBatchForItem2->id,
            'qty' => 30,
        ]);

        $newBatchForItem1 = ItemBatch::where('stock_items_id', $item1->id)->first();
        $this->assertNotNull($newBatchForItem1);
        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $grn->id,
            'item_batches_id' => $newBatchForItem1->id,
            'qty' => 50,
        ]);

        $this->assertDatabaseHas('stock_movements', [
            'source_id' => $grn->id,
            'stock_movements_types_id' => 1,
            'qty' => 50,
        ]);

        $this->assertDatabaseHas('stock_movements', [
            'source_id' => $grn->id,
            'stock_movements_types_id' => 1,
            'qty' => 30,
        ]);
    }

    public function test_rejects_adding_stock_when_grn_is_not_in_pending_stock_status(): void
    {
        $category = Category::create(['category' => 'Validation Cat']);
        $subcat = Subcategory::create(['subcategory' => 'Validation Sub', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'Validation Brand']);
        $item = StockItem::create(['name' => 'Test Media', 'code' => 'VAL-001', 'subcategories_id' => $subcat->id]);

        $pendingGrn = Grn::create([
            'at_time' => now(),
            'grn_statuses_id' => GrnStatus::STATUS_PENDING,
        ]);

        $response = $this->postJson('/api/v1/inventory/stocks', [
            'grn_id' => $pendingGrn->id,
            'add_date' => now()->toDateString(),
            'items' => [
                [
                    'stock_items_id' => $item->id,
                    'brands_id' => $brand->id,
                    'qty' => 10,
                    'buy' => 100.00,
                    'price' => 150.00,
                    'batch_id' => null,
                    'create_new_batch' => true,
                ],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['grn_id']);
    }

    public function test_adds_received_qty_to_existing_batch_stock_and_creates_new_batch_stock_when_unallocated(): void
    {
        $category = Category::create(['category' => 'Batch Flow Cat']);
        $subcat = Subcategory::create(['subcategory' => 'Batch Flow Sub', 'categories_id' => $category->id]);
        $brand = Brand::create(['brand' => 'Mimaki']);
        $itemWithBatch = StockItem::create(['name' => 'Cyan Ink 1L', 'code' => 'INK-C01', 'subcategories_id' => $subcat->id]);
        $itemWithoutBatch = StockItem::create(['name' => 'Magenta Ink 1L', 'code' => 'INK-M01', 'subcategories_id' => $subcat->id]);

        // Pre-existing batch & stock for itemWithBatch (qty = 20)
        $previousGrn = Grn::create([
            'at_time' => now()->subDays(3),
            'grn_statuses_id' => GrnStatus::STATUS_COMPLETED,
        ]);
        $allocatedBatch = ItemBatch::create(['stock_items_id' => $itemWithBatch->id]);
        $existingBatchStock = Stock::create([
            'stock_items_id' => $itemWithBatch->id,
            'brands_id' => $brand->id,
            'qty' => 20,
            'buy' => 7500.00,
            'price' => 9500.00,
            'grn_id' => $previousGrn->id,
            'add_date' => now()->subDays(3),
        ]);
        GrmItem::create([
            'grn_id' => $previousGrn->id,
            'item_batches_id' => $allocatedBatch->id,
            'stock_id' => $existingBatchStock->id,
            'qty' => 20,
        ]);

        // New Pending Stock GRN with both items
        $status = PurchaseOrderStatus::firstOrCreate(['id' => 2], ['purchase_orders_status' => 'Approved']);
        $supplier = Supplier::create(['name' => 'Ink Supplier', 'mobile' => '0775554443']);
        $po = PurchaseOrder::create([
            'add_date' => now(),
            'suppliers_id' => $supplier->id,
            'purchase_orders_status_id' => $status->id,
        ]);
        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemWithBatch->id,
            'unit_cost' => 7800.00,
            'qty_ordered' => 15,
            'qty_received' => 0,
        ]);
        PurchaseOrderItem::create([
            'purchase_orders_id' => $po->id,
            'stock_items_id' => $itemWithoutBatch->id,
            'unit_cost' => 7800.00,
            'qty_ordered' => 10,
            'qty_received' => 0,
        ]);

        $pendingStockGrn = Grn::create([
            'at_time' => now()->subHour(),
            'grn_statuses_id' => GrnStatus::STATUS_PENDING_STOCK,
        ]);
        $pendingStockGrn->purchaseOrders()->attach($po->id, ['supplyer_invoice' => 'INV-BATCH-01']);

        // Receive both items: itemWithBatch has allocated batch, itemWithoutBatch has no batch
        $response = $this->postJson('/api/v1/inventory/stocks', [
            'grn_id' => $pendingStockGrn->id,
            'add_date' => now()->toDateString(),
            'items' => [
                [
                    'stock_items_id' => $itemWithBatch->id,
                    'brands_id' => $brand->id,
                    'qty' => 15,
                    'buy' => 7800.00,
                    'price' => 9800.00,
                    'batch_id' => $allocatedBatch->id,
                    'create_new_batch' => false,
                ],
                [
                    'stock_items_id' => $itemWithoutBatch->id,
                    'brands_id' => $brand->id,
                    'qty' => 10,
                    'buy' => 7800.00,
                    'price' => 9800.00,
                    'batch_id' => null,
                    'create_new_batch' => true,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        // 1. Existing batch stock should be incremented: 20 + 15 = 35
        $this->assertDatabaseHas('stock', [
            'id' => $existingBatchStock->id,
            'stock_items_id' => $itemWithBatch->id,
            'qty' => 35,
        ]);

        // 2. Unallocated item should get a new ItemBatch and new Stock record with qty = 10
        $newBatch = ItemBatch::where('stock_items_id', $itemWithoutBatch->id)->first();
        $this->assertNotNull($newBatch);
        $this->assertDatabaseHas('stock', [
            'stock_items_id' => $itemWithoutBatch->id,
            'grn_id' => $pendingStockGrn->id,
            'qty' => 10,
        ]);
        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $pendingStockGrn->id,
            'item_batches_id' => $newBatch->id,
            'qty' => 10,
        ]);

        // 3. Stock movements recorded for both items
        $this->assertDatabaseHas('stock_movements', [
            'stock_id' => $existingBatchStock->id,
            'source_id' => $pendingStockGrn->id,
            'qty' => 15,
        ]);
        $this->assertDatabaseHas('stock_movements', [
            'source_id' => $pendingStockGrn->id,
            'qty' => 10,
        ]);

        // 4. GRN automatically marked Completed once all items are received
        $this->assertDatabaseHas('grn', [
            'id' => $pendingStockGrn->id,
            'grn_statuses_id' => GrnStatus::STATUS_COMPLETED,
        ]);
    }
}
