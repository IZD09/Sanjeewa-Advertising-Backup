<?php

namespace Tests\Feature;

use Modules\Customer\Models\Customer;
use Tests\TestCase;

class InvoiceModuleTest extends TestCase
{
    private Customer $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $this->customer = Customer::firstOrCreate(
            ['mobile' => '0776665544'],
            ['name' => 'Invoice Customer', 'email' => 'inv_cust@example.com', 'register_at' => now()]
        );
    }

    public function test_can_manage_invoices(): void
    {
        // 1. Create Invoice
        $response = $this->postJson('/api/v1/invoices', [
            'customer_id' => $this->customer->id,
            'invoice_at' => now()->toDateString(),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.customer_id', $this->customer->id);

        $invoiceId = $response->json('data.id');

        // 2. List & All
        $this->getJson('/api/v1/invoices')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/api/v1/invoices/all')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson("/api/v1/invoices/search?customer_id={$this->customer->id}")->assertStatus(200);

        // 3. Show
        $this->getJson("/api/v1/invoices/{$invoiceId}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $invoiceId);

        // 4. Update
        $this->putJson("/api/v1/invoices/{$invoiceId}", [
            'due_date' => now()->addDays(7)->toDateString(),
        ])->assertStatus(200);

        // 5. Delete
        $this->deleteJson("/api/v1/invoices/{$invoiceId}")->assertStatus(200);
        $this->assertDatabaseMissing('invoice', ['id' => $invoiceId]);
    }
}
