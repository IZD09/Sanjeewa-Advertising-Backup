<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Supplier\Models\PurchaseOrder;
use Modules\Supplier\Models\PurchaseOrderStatus;
use Modules\Supplier\Models\Supplier;
use Tests\TestCase;

class PurchaseOrderApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->artisan('db:seed', ['--class' => 'Modules\Supplier\Database\Seeders\PurchaseOrderStatusSeeder']);
    }

    public function test_can_approve_purchase_order_with_status_string(): void
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Test',
            'mobile' => '0771234567',
        ]);

        $po = PurchaseOrder::create([
            'suppliers_id' => $supplier->id,
            'add_date' => now(),
            'purchase_orders_status_id' => PurchaseOrderStatus::STATUS_PENDING,
        ]);

        $this->assertEquals(PurchaseOrderStatus::STATUS_PENDING, $po->purchase_orders_status_id);

        $response = $this->patchJson("/api/v1/purchase-orders/{$po->id}", [
            'status' => 'Approved',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $po->refresh();
        $this->assertEquals(PurchaseOrderStatus::STATUS_APPROVED, $po->purchase_orders_status_id);
        $this->assertEquals('Approved', $po->status->purchase_orders_status);
        $this->assertDatabaseHas('purchase_orders', [
            'id' => $po->id,
            'purchase_orders_status_id' => PurchaseOrderStatus::STATUS_APPROVED,
        ]);
    }

    public function test_can_approve_purchase_order_with_status_id(): void
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Test 2',
            'mobile' => '0777654321',
        ]);

        $po = PurchaseOrder::create([
            'suppliers_id' => $supplier->id,
            'add_date' => now(),
            'purchase_orders_status_id' => PurchaseOrderStatus::STATUS_PENDING,
        ]);

        $response = $this->patchJson("/api/v1/purchase-orders/{$po->id}", [
            'purchase_orders_status_id' => PurchaseOrderStatus::STATUS_APPROVED,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $po->refresh();
        $this->assertEquals(PurchaseOrderStatus::STATUS_APPROVED, $po->purchase_orders_status_id);
        $this->assertEquals('Approved', $po->status->purchase_orders_status);
    }
}
