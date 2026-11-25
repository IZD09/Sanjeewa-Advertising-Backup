<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\PurchaseOrderStatus;
use Modules\Supplier\Models\Supplier;
use Tests\TestCase;

class SupplierApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_supplier_with_name_mobile_and_email(): void
    {
        $payload = [
            'name' => 'Apex Graphic Materials',
            'mobile' => '0779911223',
            'email' => 'sales@apexgraphics.lk',
        ];

        $response = $this->postJson('/advertising/suppliers', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Apex Graphic Materials')
            ->assertJsonPath('data.mobile', '0779911223')
            ->assertJsonPath('data.email', 'sales@apexgraphics.lk');

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Apex Graphic Materials',
            'mobile' => '0779911223',
            'email' => 'sales@apexgraphics.lk',
        ]);
    }

    public function test_can_create_supplier_without_email(): void
    {
        $payload = [
            'name' => 'Colombo Board Supplies',
            'mobile' => '0718822334',
        ];

        $response = $this->postJson('/advertising/suppliers', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Colombo Board Supplies')
            ->assertJsonPath('data.mobile', '0718822334');

        $this->assertDatabaseHas('suppliers', [
            'name' => 'Colombo Board Supplies',
            'mobile' => '0718822334',
        ]);
    }

    public function test_validation_fails_when_name_or_mobile_missing(): void
    {
        $response = $this->postJson('/advertising/suppliers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'mobile']);
    }

    public function test_cannot_create_duplicate_supplier_with_same_name(): void
    {
        $this->postJson('/advertising/suppliers', [
            'name' => 'Universal Ink Lanka',
            'mobile' => '0771122334',
            'email' => 'info@universalink.lk',
        ])->assertStatus(201);

        $duplicate = $this->postJson('/advertising/suppliers', [
            'name' => 'Universal Ink Lanka',
            'mobile' => '0779988776',
            'email' => 'different@universalink.lk',
        ]);

        $duplicate->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_cannot_create_duplicate_supplier_with_same_mobile(): void
    {
        $this->postJson('/advertising/suppliers', [
            'name' => 'First Sign Supplies',
            'mobile' => '0775566778',
            'email' => 'first@signsupplies.lk',
        ])->assertStatus(201);

        $duplicate = $this->postJson('/advertising/suppliers', [
            'name' => 'Second Sign Supplies',
            'mobile' => '0775566778',
            'email' => 'second@signsupplies.lk',
        ]);

        $duplicate->assertStatus(422)
            ->assertJsonValidationErrors(['mobile']);
    }

    public function test_cannot_create_duplicate_supplier_with_same_email(): void
    {
        $this->postJson('/advertising/suppliers', [
            'name' => 'Alpha Paper Lanka',
            'mobile' => '0712233445',
            'email' => 'contact@alphapaper.lk',
        ])->assertStatus(201);

        $duplicate = $this->postJson('/advertising/suppliers', [
            'name' => 'Beta Paper Lanka',
            'mobile' => '0719988776',
            'email' => 'contact@alphapaper.lk',
        ]);

        $duplicate->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_can_fetch_purchase_orders_data_across_all_suppliers_and_filtered_by_supplier(): void
    {
        $statusPending = PurchaseOrderStatus::firstOrCreate(
            ['id' => 1],
            ['purchase_orders_status' => 'Pending']
        );

        $supplierA = Supplier::create(['name' => 'Supplier Alpha', 'mobile' => '0771111111']);
        $supplierB = Supplier::create(['name' => 'Supplier Beta', 'mobile' => '0772222222']);

        $poA = PurchaseOrder::create([
            'suppliers_id' => $supplierA->id,
            'purchase_orders_status_id' => $statusPending->id,
            'add_date' => now(),
        ]);

        $poB = PurchaseOrder::create([
            'suppliers_id' => $supplierB->id,
            'purchase_orders_status_id' => $statusPending->id,
            'add_date' => now(),
        ]);

        // 1. Fetching across ALL suppliers (e.g. + Create New GRN path)
        $allResponse = $this->getJson('/advertising/purchase-orders/data?per_page=100');
        $allResponse->assertOk()
            ->assertJsonPath('success', true);

        $orders = $allResponse->json('data.purchase_orders');
        $this->assertCount(2, $orders);

        $poIds = collect($orders)->pluck('id')->all();
        $this->assertContains($poA->id, $poIds);
        $this->assertContains($poB->id, $poIds);

        // 2. Fetching filtered to Supplier Alpha only (Supplier Directory Card path)
        $filteredResponse = $this->getJson('/advertising/purchase-orders/data?suppliers_id='.$supplierA->id);
        $filteredResponse->assertOk();

        $filteredOrders = $filteredResponse->json('data.purchase_orders');
        $this->assertCount(1, $filteredOrders);
        $this->assertEquals($poA->id, $filteredOrders[0]['id']);
        $this->assertEquals('Supplier Alpha', $filteredOrders[0]['supplier_name']);
    }
}
