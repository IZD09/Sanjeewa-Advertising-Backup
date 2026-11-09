<?php

namespace Tests\Feature;

use Database\Seeders\StockMovementSeeder;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\Subcategory;
use Tests\TestCase;

class InventoryCategoriesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->seed(StockMovementSeeder::class);
    }

    public function test_can_retrieve_combined_categories_tab_data(): void
    {
        $response = $this->getJson('/api/v1/inventory/categories/data');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'categories' => [
                        '*' => [
                            'id',
                            'category',
                            'subcategories_count',
                            'subcategories',
                        ],
                    ],
                    'subcategories' => [
                        '*' => [
                            'id',
                            'subcategory',
                            'categories_id',
                            'stock_items_count',
                            'category',
                        ],
                    ],
                    'stats' => [
                        'total_categories',
                        'total_subcategories',
                        'total_items',
                    ],
                ],
            ]);
    }

    public function test_can_list_categories(): void
    {
        $response = $this->getJson('/api/v1/inventory/categories');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'category',
                        'subcategories_count',
                        'subcategories',
                    ],
                ],
            ]);
    }

    public function test_can_create_category(): void
    {
        $payload = [
            'category' => 'Speciality Media '.uniqid(),
        ];

        $response = $this->postJson('/api/v1/inventory/categories', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.category', $payload['category']);
    }

    public function test_validates_category_creation(): void
    {
        $response = $this->postJson('/api/v1/inventory/categories', [
            'category' => 'A',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    public function test_can_list_and_filter_subcategories(): void
    {
        $category = Category::first();

        $response = $this->getJson('/api/v1/inventory/subcategories?category_id='.$category->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'subcategory',
                        'categories_id',
                        'category',
                    ],
                ],
            ]);
    }

    public function test_can_create_subcategory(): void
    {
        $category = Category::first();
        $payload = [
            'subcategory' => 'Matte Canvas '.uniqid(),
            'categories_id' => $category->id,
        ];

        $response = $this->postJson('/api/v1/inventory/subcategories', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subcategory', $payload['subcategory'])
            ->assertJsonPath('data.categories_id', $category->id);
    }

    public function test_validates_subcategory_creation(): void
    {
        $response = $this->postJson('/api/v1/inventory/subcategories', [
            'subcategory' => '',
            'categories_id' => 999999,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['subcategory', 'categories_id']);
    }

    public function test_can_paginate_subcategories_when_category_has_more_than_20_subcategories(): void
    {
        $category = Category::create([
            'category' => 'Bulk Pagination Category '.uniqid(),
        ]);

        for ($i = 1; $i <= 25; $i++) {
            Subcategory::create([
                'subcategory' => sprintf('Paginated Subcat %02d %s', $i, uniqid()),
                'categories_id' => $category->id,
            ]);
        }

        $page1Response = $this->getJson('/api/v1/inventory/subcategories?category_id='.$category->id.'&page=1&per_page=20');
        $page1Response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('pagination.current_page', 1)
            ->assertJsonPath('pagination.per_page', 20)
            ->assertJsonPath('pagination.total', 25)
            ->assertJsonPath('pagination.last_page', 2);

        $page2Response = $this->getJson('/api/v1/inventory/subcategories?category_id='.$category->id.'&page=2&per_page=20');
        $page2Response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('pagination.current_page', 2)
            ->assertJsonPath('pagination.total', 25);
    }
}
