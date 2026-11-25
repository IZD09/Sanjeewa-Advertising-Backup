<?php

namespace Tests\Feature;

use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\Subcategory;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\Supplier;
use Modules\User\Models\SystemModule;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
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
        $response = $this->postJson('/advertising/suppliers', [
            'name' => 'Acme Supplies',
            'mobile' => $mobile,
            'email' => $email,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Acme Supplies');

        $supplierId = $response->json('data.id');

        // 2. List, All, Search
        $this->getJson('/advertising/suppliers')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/advertising/suppliers/all')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/advertising/suppliers/search?q=Acme')->assertStatus(200);

        // 3. Show
        $this->getJson("/advertising/suppliers/{$supplierId}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $supplierId);

        // 4. Update
        $this->putJson("/advertising/suppliers/{$supplierId}", [
            'name' => 'Acme Supplies Updated',
        ])->assertStatus(200)->assertJsonPath('data.name', 'Acme Supplies Updated');

        // 5. Purchase orders sub-resource
        $this->getJson("/advertising/suppliers/{$supplierId}/purchase-orders")->assertStatus(200);

        // 6. Delete (disables supplier)
        $this->deleteJson("/advertising/suppliers/{$supplierId}")->assertStatus(200);
        $this->assertDatabaseHas('suppliers', ['id' => $supplierId, 'status' => 'Disabled']);
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
        $response = $this->postJson('/advertising/purchase-orders', [
            'suppliers_id' => $supplier->id,
            'add_date' => now()->toDateString(),
        ]);

        $response->assertStatus(201)->assertJsonPath('data.suppliers_id', $supplier->id);
        $poId = $response->json('data.id');

        // List & All
        $this->getJson('/advertising/purchase-orders')->assertStatus(200);
        $this->getJson('/advertising/purchase-orders/all')->assertStatus(200);

        // Show
        $this->getJson("/advertising/purchase-orders/{$poId}")->assertStatus(200);

        // Update
        $this->putJson("/advertising/purchase-orders/{$poId}", [
            'add_date' => now()->toDateString(),
        ])->assertStatus(200);

        // Delete
        $this->deleteJson("/advertising/purchase-orders/{$poId}")->assertStatus(200);
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
        $response = $this->postJson('/advertising/grns', [
            'at_time' => now()->toDateTimeString(),
            'purchase_orders_id' => $po->id,
            'supplyer_invoice' => 'INV-TEST-001',
        ]);

        $response->assertStatus(201);
        $grnId = $response->json('data.id');
        $this->assertDatabaseHas('grn', [
            'id' => $grnId,
            'grn_statuses_id' => 5,
        ]);

        // Cannot complete a GRN before it is Approved
        $this->patchJson("/advertising/grns/{$grnId}/status", [
            'status' => 'Completed',
        ])->assertStatus(422);

        // Approve GRN via grn_statuses_id
        $this->patchJson("/advertising/grns/{$grnId}/status", [
            'status' => 'Approved',
        ])->assertStatus(200)
            ->assertJsonPath('data.status', 'Approved')
            ->assertJsonPath('data.grn_statuses_id', 2);

        $this->assertDatabaseHas('grn', [
            'id' => $grnId,
            'grn_statuses_id' => 2,
        ]);

        // Now can complete the Approved GRN
        $this->patchJson("/advertising/grns/{$grnId}/status", [
            'status' => 'Completed',
        ])->assertStatus(200)
            ->assertJsonPath('data.status', 'Completed')
            ->assertJsonPath('data.grn_statuses_id', 3);

        // Can cancel GRN
        $this->patchJson("/advertising/grns/{$grnId}/status", [
            'status' => 'Cancelled',
        ])->assertStatus(200)
            ->assertJsonPath('data.status', 'Cancelled')
            ->assertJsonPath('data.grn_statuses_id', 4);

        // List & All
        $this->getJson('/advertising/grns')->assertStatus(200);
        $this->getJson('/advertising/grns/all')->assertStatus(200);

        // Show
        $this->getJson("/advertising/grns/{$grnId}")->assertStatus(200);

        // Delete
        $this->deleteJson("/advertising/grns/{$grnId}")->assertStatus(200);
        $this->assertDatabaseMissing('grn', ['id' => $grnId]);
    }

    public function test_completing_grn_moves_to_pending_stock_without_updating_stock_and_notifies_inventory_users(): void
    {
        UserStatus::firstOrCreate(['id' => 1], ['user_status' => 'Active']);
        $inventoryModule = SystemModule::firstOrCreate(['system_module' => 'Inventory']);

        $inventoryUser = User::create([
            'first_name' => 'Stock',
            'last_name' => 'Manager',
            'mobile' => '077'.rand(1000000, 9999999),
            'register_at' => now(),
            'username' => 'stockmgr_'.uniqid(),
            'password' => 'password123',
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        SystemModuleUser::create([
            'users_id' => $inventoryUser->id,
            'system_modules_id' => $inventoryModule->id,
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 0,
            'export' => 0,
        ]);

        $otherUser = User::create([
            'first_name' => 'Sales',
            'last_name' => 'Staff',
            'mobile' => '077'.rand(1000000, 9999999),
            'register_at' => now(),
            'username' => 'sales_'.uniqid(),
            'password' => 'password123',
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        $category = Category::create(['category' => 'Print Media '.uniqid()]);
        $subcategory = Subcategory::create([
            'categories_id' => $category->id,
            'subcategory' => 'Vinyl '.uniqid(),
        ]);
        $stockItem = StockItem::create([
            'subcategories_id' => $subcategory->id,
            'code' => 'STK-'.uniqid(),
            'name' => 'Test Vinyl Roll',
            'low_stock_qty' => 5,
            'reorder_qty' => 10,
        ]);

        $supplier = Supplier::create([
            'name' => 'Stock Check Supplier',
            'mobile' => '077'.rand(1000000, 9999999),
            'email' => 'stksup_'.uniqid().'@example.com',
            'register_at' => now(),
        ]);

        $po = PurchaseOrder::create([
            'suppliers_id' => $supplier->id,
            'add_date' => now(),
        ]);

        $createRes = $this->postJson('/advertising/grns', [
            'at_time' => now()->toDateTimeString(),
            'purchase_orders_id' => $po->id,
            'supplyer_invoice' => 'INV-STK-001',
            'stocks' => [
                [
                    'stock_items_id' => $stockItem->id,
                    'qty' => 15,
                    'buy' => 1200,
                    'price' => 1500,
                ],
            ],
        ]);

        $createRes->assertStatus(201);
        $grnId = $createRes->json('data.id');

        $this->assertSame(1, Stock::where('grn_id', $grnId)->count());
        $this->assertDatabaseHas('grm_items', [
            'grn_id' => $grnId,
            'qty' => 15,
        ]);

        $this->patchJson("/advertising/grns/{$grnId}/status", [
            'status' => 'Pending Stock',
        ])->assertStatus(422);

        $this->patchJson("/advertising/grns/{$grnId}/status", [
            'status' => 'Approved',
        ])->assertStatus(200);

        $completeRes = $this->patchJson("/advertising/grns/{$grnId}/status", [
            'status' => 'Pending Stock',
        ]);

        $completeRes->assertStatus(200)
            ->assertJsonPath('data.status', 'Pending Stock')
            ->assertJsonPath('data.grn_statuses_id', 6);

        $this->assertSame(1, Stock::where('grn_id', $grnId)->count());
        $this->assertSame(1, $inventoryUser->notifications()->count());
        $this->assertSame(0, $otherUser->notifications()->count());
    }

    public function test_grn_and_po_data_endpoints_load_from_database_with20_rows_pagination(): void
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
        $grnPage1 = $this->getJson('/advertising/grns/data?page=1&per_page=20')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.per_page', 20)
            ->assertJsonPath('data.pagination.current_page', 1);

        $this->assertCount(20, $grnPage1->json('data.grns'));
        $this->assertGreaterThanOrEqual(25, $grnPage1->json('data.pagination.total'));

        // Page 2 of GRN data should return the remaining rows without reload
        $grnPage2 = $this->getJson('/advertising/grns/data?page=2&per_page=20')
            ->assertStatus(200)
            ->assertJsonPath('data.pagination.current_page', 2);

        $this->assertNotEmpty($grnPage2->json('data.grns'));

        // Page 1 of Purchase Orders data should return max 20 rows
        $poPage1 = $this->getJson('/advertising/purchase-orders/data?page=1&per_page=20')
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
        $response = $this->postJson('/advertising/purchase-orders', [
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
        $responseNewSup = $this->postJson('/advertising/purchase-orders', [
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
