<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockMovementType;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;
use Tests\TestCase;

class InventoryStockReceiptTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        StockMovementType::firstOrCreate(
            ['id' => 1],
            ['stock_movements_type' => 'GRN / Purchase Receipt']
        );
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
        $grn = Grn::create(['at_time' => now()]);

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
}
