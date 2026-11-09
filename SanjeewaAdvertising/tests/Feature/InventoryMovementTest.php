<?php

namespace Tests\Feature;

use Database\Seeders\StockMovementSeeder;
use Tests\TestCase;

class InventoryMovementTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->seed(StockMovementSeeder::class);
    }

    public function test_can_retrieve_paginated_stock_movements(): void
    {
        $response = $this->getJson('/api/v1/inventory/movements?per_page=10');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'movement_code',
                        'date',
                        'item_code',
                        'item_name',
                        'type_id',
                        'type_name',
                        'direction',
                        'qty',
                        'unit_price',
                        'total_value',
                        'source_id',
                        'source_label',
                    ],
                ],
                'pagination' => [
                    'total',
                    'per_page',
                    'current_page',
                    'last_page',
                ],
            ]);
    }

    public function test_can_retrieve_stock_movements_stats(): void
    {
        $response = $this->getJson('/api/v1/inventory/movements/stats');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_movements',
                    'inward_qty',
                    'outward_qty',
                    'adjustment_count',
                ],
            ]);
    }

    public function test_can_filter_movements_by_direction(): void
    {
        $response = $this->getJson('/api/v1/inventory/movements?direction=IN');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $items = $response->json('data');
        if (! empty($items)) {
            $this->assertEquals('IN', $items[0]['direction']);
        }
    }
}
