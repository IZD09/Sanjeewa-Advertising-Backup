<?php

namespace Tests\Feature;

use Database\Seeders\StockMovementSeeder;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\Subcategory;
use Tests\TestCase;

class InventoryStockItemsCatalogTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->seed(StockMovementSeeder::class);
    }

    public function test_can_retrieve_stock_items_data_payload(): void
    {
        $response = $this->getJson('/api/v1/inventory/stock-items/data');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'stock_items',
                    'brands',
                    'categories',
                    'stats' => [
                        'total_items',
                        'total_brands',
                        'mapped_categories',
                        'mapped_subcategories',
                    ],
                ],
            ]);
    }

    public function test_can_create_and_update_brand(): void
    {
        $brandName = 'Oracal Premium '.uniqid();

        // 1. Create brand
        $createRes = $this->postJson('/api/v1/inventory/brands', [
            'brand' => $brandName,
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.brand', $brandName);

        $brandId = $createRes->json('data.id');
        $this->assertNotNull($brandId);

        // 2. Update brand
        $updatedName = $brandName.' Updated';
        $updateRes = $this->putJson("/api/v1/inventory/brands/{$brandId}", [
            'brand' => $updatedName,
        ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.brand', $updatedName);

        $this->assertDatabaseHas('brands', [
            'id' => $brandId,
            'brand' => $updatedName,
        ]);
    }

    public function test_validates_brand_creation(): void
    {
        $res = $this->postJson('/api/v1/inventory/brands', [
            'brand' => 'A',
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['brand']);
    }

    public function test_can_create_and_update_stock_item(): void
    {
        $subcategory = Subcategory::first();
        $brand = Brand::first();
        $sku = strtoupper('TEST-'.uniqid());
        $name = 'High Gloss Vinyl 150gsm';

        // 1. Create stock item
        $createRes = $this->postJson('/api/v1/inventory/stock-items', [
            'name' => $name,
            'code' => $sku,
            'subcategories_id' => $subcategory->id,
            'brands' => [$brand->id],
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', $sku)
            ->assertJsonPath('data.name', $name)
            ->assertJsonPath('data.subcategories_id', $subcategory->id);

        $itemId = $createRes->json('data.id');

        // 2. Update stock item
        $updatedName = 'High Gloss Vinyl 180gsm (Upgraded)';
        $updateRes = $this->putJson("/api/v1/inventory/stock-items/{$itemId}", [
            'name' => $updatedName,
            'code' => $sku,
            'subcategories_id' => $subcategory->id,
            'brands' => [$brand->id],
        ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', $updatedName);

        $this->assertDatabaseHas('stock_items', [
            'id' => $itemId,
            'name' => $updatedName,
        ]);
    }

    public function test_can_create_stock_item_with_low_stock_and_reorder_qty(): void
    {
        $subcategory = Subcategory::first();
        $brand = Brand::first();
        $sku = strtoupper('TEST-QTY-'.uniqid());

        $createRes = $this->postJson('/api/v1/inventory/stock-items', [
            'name' => 'Custom Qty Item',
            'code' => $sku,
            'subcategories_id' => $subcategory->id,
            'brands' => [$brand->id],
            'low_stock_qty' => 15,
            'reorder_qty' => 50,
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.low_stock_qty', 15)
            ->assertJsonPath('data.reorder_qty', 50);

        $this->assertDatabaseHas('stock_items', [
            'code' => $sku,
            'low_stock_qty' => 15,
            'reorder_qty' => 50,
        ]);
    }

    public function test_validates_stock_item_creation(): void
    {
        $res = $this->postJson('/api/v1/inventory/stock-items', [
            'name' => '',
            'subcategories_id' => 999999,
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'subcategories_id', 'brands']);
    }

    public function test_can_auto_generate_stock_item_code_if_omitted(): void
    {
        $subcategory = Subcategory::first();
        $brand = Brand::first();

        $res = $this->postJson('/api/v1/inventory/stock-items', [
            'name' => 'Auto Code Material',
            'subcategories_id' => $subcategory->id,
            'brands' => [$brand->id],
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('success', true);

        $code = $res->json('data.code');
        $this->assertNotEmpty($code);
        $this->assertStringStartsWith('ITM-', $code);
    }

    public function test_can_paginate_stock_items(): void
    {
        $subcategory = Subcategory::first();
        for ($i = 1; $i <= 25; $i++) {
            StockItem::create([
                'name' => sprintf('Bulk Test Item %02d', $i),
                'code' => sprintf('BLK-%03d-%s', $i, uniqid()),
                'subcategories_id' => $subcategory->id,
            ]);
        }

        $response = $this->getJson('/api/v1/inventory/stock-items?page=1&per_page=20');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('pagination.per_page', 20)
            ->assertJsonPath('pagination.current_page', 1);
    }
}
