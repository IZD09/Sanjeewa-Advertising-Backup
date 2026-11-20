<?php

namespace Tests\Feature;

use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\GrmItem;
use Modules\Inventory\Models\GrnItem;
use Modules\Inventory\Models\ItemBatch;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;
use Tests\TestCase;

class InventoryItemBatchAndGrnItemTest extends TestCase
{
    protected StockItem $stockItem;

    protected Brand $brand;

    protected Grn $grn;

    protected Stock $stock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $category = Category::firstOrCreate(['category' => 'Testing Category '.uniqid()]);
        $subcategory = Subcategory::firstOrCreate([
            'subcategory' => 'Testing Subcategory '.uniqid(),
            'categories_id' => $category->id,
        ]);

        $this->stockItem = StockItem::create([
            'name' => 'Testing Item '.uniqid(),
            'code' => 'SKU-'.strtoupper(uniqid()),
            'subcategories_id' => $subcategory->id,
        ]);

        $this->brand = Brand::firstOrCreate(['brand' => 'Test Brand '.uniqid()]);

        $this->grn = Grn::create([
            'at_time' => now(),
        ]);

        $this->stock = Stock::create([
            'stock_items_id' => $this->stockItem->id,
            'add_date' => now(),
            'qty' => 50,
            'price' => 120.00,
            'buy' => 80.00,
            'grn_id' => $this->grn->id,
            'brands_id' => $this->brand->id,
        ]);
    }

    public function test_can_create_and_retrieve_item_batch(): void
    {
        $response = $this->postJson('/api/v1/inventory/item-batches', [
            'stock_items_id' => $this->stockItem->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.stock_items_id', $this->stockItem->id);

        $batchId = $response->json('data.id');
        $this->assertNotNull($batchId);
        $this->assertDatabaseHas('item_batches', [
            'id' => $batchId,
            'stock_items_id' => $this->stockItem->id,
        ]);

        $showResponse = $this->getJson("/api/v1/inventory/item-batches/{$batchId}");
        $showResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $batchId);

        $listResponse = $this->getJson('/api/v1/inventory/item-batches');
        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_can_create_and_retrieve_grn_item(): void
    {
        $batch = ItemBatch::create([
            'stock_items_id' => $this->stockItem->id,
        ]);

        $response = $this->postJson('/api/v1/inventory/grn-items', [
            'grn_id' => $this->grn->id,
            'item_batches_id' => $batch->id,
            'stock_id' => $this->stock->id,
            'qty' => 25,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.grn_id', $this->grn->id)
            ->assertJsonPath('data.item_batches_id', $batch->id)
            ->assertJsonPath('data.stock_id', $this->stock->id)
            ->assertJsonPath('data.qty', 25);

        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $this->grn->id,
            'item_batches_id' => $batch->id,
            'stock_id' => $this->stock->id,
            'qty' => 25,
        ]);

        $grnItemsResponse = $this->getJson("/api/v1/inventory/grn-items/grn/{$this->grn->id}");
        $grnItemsResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_eloquent_relationships_between_batch_stock_item_and_grn(): void
    {
        $batch = ItemBatch::create([
            'stock_items_id' => $this->stockItem->id,
        ]);

        $grmItem = GrmItem::create([
            'grn_id' => $this->grn->id,
            'item_batches_id' => $batch->id,
            'stock_id' => $this->stock->id,
            'qty' => 10,
        ]);

        // 1. Batch belongsTo StockItem
        $this->assertEquals($this->stockItem->id, $batch->stockItem->id);

        // 2. StockItem hasMany batches
        $this->assertTrue($this->stockItem->batches->contains('id', $batch->id));

        // 3. Batch hasMany grmItems
        $this->assertTrue($batch->grmItems->contains(function ($item) use ($grmItem) {
            return $item->grn_id === $grmItem->grn_id && $item->item_batches_id === $grmItem->item_batches_id;
        }));

        // 4. Batch belongsToMany Grn
        $this->assertTrue($batch->grns->contains('id', $this->grn->id));

        // 5. Grn belongsToMany ItemBatches
        $this->assertTrue($this->grn->itemBatches->contains('id', $batch->id));

        // 6. GrnItem alias works
        $grnItem = GrnItem::where('grn_id', $this->grn->id)->first();
        $this->assertNotNull($grnItem);
        $this->assertEquals($batch->id, $grnItem->item_batches_id);
    }

    public function test_can_delete_grn_item_and_item_batch(): void
    {
        $batch = ItemBatch::create([
            'stock_items_id' => $this->stockItem->id,
        ]);

        GrmItem::create([
            'grn_id' => $this->grn->id,
            'item_batches_id' => $batch->id,
            'stock_id' => $this->stock->id,
            'qty' => 15,
        ]);

        // Delete GRN item via API
        $delItemRes = $this->deleteJson("/api/v1/inventory/grn-items/{$this->grn->id}/{$batch->id}/{$this->stock->id}");
        $delItemRes->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseMissing('grm_items', [
            'grn_id' => $this->grn->id,
            'item_batches_id' => $batch->id,
            'stock_id' => $this->stock->id,
        ]);

        // Delete Batch via API
        $delBatchRes = $this->deleteJson("/api/v1/inventory/item-batches/{$batch->id}");
        $delBatchRes->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseMissing('item_batches', [
            'id' => $batch->id,
        ]);
    }
}
