<?php

namespace Tests\Feature;

use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\Supplier;
use Tests\TestCase;

class SupplierModuleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_manage_suppliers(): void
    {
        // 1. Create Supplier
        $mobile = '077'.rand(1000000, 9999999);
        $email = 'sup_'.uniqid().'@example.com';
        $response = $this->postJson('/api/v1/suppliers', [
            'name' => 'Acme Supplies',
            'mobile' => $mobile,
            'email' => $email,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Acme Supplies');

        $supplierId = $response->json('data.id');

        // 2. List, All, Search
        $this->getJson('/api/v1/suppliers')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/api/v1/suppliers/all')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/api/v1/suppliers/search?q=Acme')->assertStatus(200);

        // 3. Show
        $this->getJson("/api/v1/suppliers/{$supplierId}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $supplierId);

        // 4. Update
        $this->putJson("/api/v1/suppliers/{$supplierId}", [
            'name' => 'Acme Supplies Updated',
        ])->assertStatus(200)->assertJsonPath('data.name', 'Acme Supplies Updated');

        // 5. Purchase orders sub-resource
        $this->getJson("/api/v1/suppliers/{$supplierId}/purchase-orders")->assertStatus(200);

        // 6. Delete
        $this->deleteJson("/api/v1/suppliers/{$supplierId}")->assertStatus(200);
        $this->assertDatabaseMissing('suppliers', ['id' => $supplierId]);
    }

    public function test_can_manage_purchase_orders(): void
    {
        $supplier = Supplier::create([
            'name' => 'PO Supplier',
            'mobile' => '077'.rand(1000000, 9999999),
            'email' => 'posup_'.uniqid().'@example.com',
            'register_at' => now(),
        ]);

        // Create PO
        $response = $this->postJson('/api/v1/purchase-orders', [
            'suppliers_id' => $supplier->id,
            'add_date' => now()->toDateString(),
        ]);

        $response->assertStatus(201)->assertJsonPath('data.suppliers_id', $supplier->id);
        $poId = $response->json('data.id');

        // List & All
        $this->getJson('/api/v1/purchase-orders')->assertStatus(200);
        $this->getJson('/api/v1/purchase-orders/all')->assertStatus(200);

        // Show
        $this->getJson("/api/v1/purchase-orders/{$poId}")->assertStatus(200);

        // Update
        $this->putJson("/api/v1/purchase-orders/{$poId}", [
            'add_date' => now()->toDateString(),
        ])->assertStatus(200);

        // Delete
        $this->deleteJson("/api/v1/purchase-orders/{$poId}")->assertStatus(200);
        $this->assertDatabaseMissing('purchase_orders', ['id' => $poId]);
    }

    public function test_can_manage_grns(): void
    {
        $supplier = Supplier::create([
            'name' => 'GRN Supplier',
            'mobile' => '077'.rand(1000000, 9999999),
            'email' => 'grnsup_'.uniqid().'@example.com',
            'register_at' => now(),
        ]);

        $po = PurchaseOrder::create([
            'suppliers_id' => $supplier->id,
            'add_date' => now(),
        ]);

        // Create GRN
        $response = $this->postJson('/api/v1/grns', [
            'at_time' => now()->toDateTimeString(),
            'purchase_orders_id' => $po->id,
            'supplyer_invoice' => 'INV-TEST-001',
        ]);

        $response->assertStatus(201);
        $grnId = $response->json('data.id');

        // List & All
        $this->getJson('/api/v1/grns')->assertStatus(200);
        $this->getJson('/api/v1/grns/all')->assertStatus(200);

        // Show
        $this->getJson("/api/v1/grns/{$grnId}")->assertStatus(200);

        // Delete
        $this->deleteJson("/api/v1/grns/{$grnId}")->assertStatus(200);
        $this->assertDatabaseMissing('grn', ['id' => $grnId]);
    }

    public function test_grn_and_po_data_endpoints_load_from_database_with_20_rows_pagination(): void
    {
        $supplier = Supplier::create([
            'name' => 'Paginated Supplier',
            'mobile' => '077'.rand(1000000, 9999999),
            'email' => 'pagsup_'.uniqid().'@example.com',
        ]);

        for ($i = 1; $i <= 25; $i++) {
            $po = PurchaseOrder::create([
                'suppliers_id' => $supplier->id,
                'add_date' => now(),
            ]);

            Grn::create([
                'at_time' => now(),
            ])->purchaseOrders()->attach($po->id, ['supplyer_invoice' => "INV-{$i}"]);
        }

        // Page 1 of GRN data should return max 20 rows
        $grnPage1 = $this->getJson('/api/v1/grns/data?page=1&per_page=20')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.per_page', 20)
            ->assertJsonPath('data.pagination.current_page', 1);

        $this->assertCount(20, $grnPage1->json('data.grns'));
        $this->assertGreaterThanOrEqual(25, $grnPage1->json('data.pagination.total'));

        // Page 2 of GRN data should return the remaining rows without reload
        $grnPage2 = $this->getJson('/api/v1/grns/data?page=2&per_page=20')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.current_page', 2);

        $this->assertNotEmpty($grnPage2->json('data.grns'));

        // Page 1 of Purchase Orders data should return max 20 rows
        $poPage1 = $this->getJson('/api/v1/purchase-orders/data?page=1&per_page=20')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.per_page', 20)
            ->assertJsonPath('data.pagination.current_page', 1);

        $this->assertCount(20, $poPage1->json('data.purchase_orders'));
    }

    public function test_can_place_and_save_purchase_order_with_items_and_supplier_name_or_id(): void
    {
        $cat = Category::firstOrCreate(['category' => 'Paper & Boards']);
        $subcat = Subcategory::firstOrCreate(['subcategory' => 'Art Paper', 'categories_id' => $cat->id]);
        $stock1 = StockItem::firstOrCreate(
            ['code' => 'PAP-001'],
            ['name' => '300gsm Art Board SRA3', 'subcategories_id' => $subcat->id]
        );
        $stock2 = StockItem::firstOrCreate(
            ['code' => 'PAP-002'],
            ['name' => '250gsm Ivory Board A3', 'subcategories_id' => $subcat->id]
        );
        $stock3 = StockItem::firstOrCreate(
            ['code' => 'FLX-001'],
            ['name' => 'Frontlit Flex 380gsm', 'subcategories_id' => $subcat->id]
        );

        $supplier = Supplier::create([
            'name' => 'Apex Raw Materials Ltd',
            'mobile' => '0778899001',
            'email' => 'sales@apexraw.lk',
            'register_at' => now(),
        ]);

        // Place PO using suppliers_id and line items
        $response = $this->postJson('/api/v1/purchase-orders', [
            'suppliers_id' => $supplier->id,
            'add_date' => now()->toDateString(),
            'expected_date' => now()->addDays(5)->toDateString(),
            'remarks' => 'Urgent batch for banner production',
            'items' => [
                [
                    'stock_items_id' => $stock1->id,
                    'qty_ordered' => 20,
                    'unit_cost' => 1500.00,
                ],
                [
                    'stock_items_id' => $stock2->id,
                    'qty_ordered' => 10,
                    'unit_cost' => 2200.00,
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.suppliers_id', $supplier->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'po_number',
                    'suppliers_id',
                    'formatted' => [
                        'po_number',
                        'supplier_name',
                        'total_amount',
                        'items',
                    ],
                ],
            ]);

        $poId = $response->json('data.id');
        $this->assertDatabaseHas('purchase_orders', [
            'id' => $poId,
            'suppliers_id' => $supplier->id,
        ]);

        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_orders_id' => $poId,
            'stock_items_id' => $stock1->id,
            'qty_ordered' => 20,
            'unit_cost' => 1500.00,
        ]);

        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_orders_id' => $poId,
            'stock_items_id' => $stock2->id,
            'qty_ordered' => 10,
            'unit_cost' => 2200.00,
        ]);

        // Place PO using auto-created supplier name
        $newSupplierName = 'Direct Imported Flex Hub';
        $responseNewSup = $this->postJson('/api/v1/purchase-orders', [
            'supplier_name' => $newSupplierName,
            'supplier_contact' => '0719988776',
            'items' => [
                [
                    'id' => $stock3->id,
                    'qty' => 15,
                    'cost' => 850.00,
                ],
            ],
        ]);

        $responseNewSup->assertStatus(201);
        $newPoId = $responseNewSup->json('data.id');

        $this->assertDatabaseHas('suppliers', [
            'name' => $newSupplierName,
            'mobile' => '0719988776',
        ]);

        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_orders_id' => $newPoId,
            'stock_items_id' => $stock3->id,
            'qty_ordered' => 15,
            'unit_cost' => 850.00,
        ]);
    }
}
