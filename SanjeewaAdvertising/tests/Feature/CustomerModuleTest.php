<?php

namespace Tests\Feature;

use Modules\Customer\Models\Customer;
use Tests\TestCase;

class CustomerModuleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_create_customer(): void
    {
        $payload = [
            'name' => 'John Doe',
            'mobile' => '0779998877',
            'email' => 'johndoe@example.com',
        ];

        $response = $this->postJson('/api/v1/customers', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Customer created successfully.',
            ])
            ->assertJsonPath('data.name', 'John Doe')
            ->assertJsonPath('data.mobile', '0779998877');

        $this->assertDatabaseHas('customer', [
            'mobile' => '0779998877',
            'email' => 'johndoe@example.com',
        ]);
    }

    public function test_can_list_customers(): void
    {
        Customer::firstOrCreate(
            ['mobile' => '0771112233'],
            ['name' => 'Alice', 'email' => 'alice@example.com', 'register_at' => now()]
        );

        $response = $this->getJson('/api/v1/customers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'pagination' => ['current_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_get_all_customers(): void
    {
        Customer::firstOrCreate(
            ['mobile' => '0772223344'],
            ['name' => 'Bob', 'email' => 'bob@example.com', 'register_at' => now()]
        );

        $response = $this->getJson('/api/v1/customers/all');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'All customers retrieved successfully.',
            ])
            ->assertJsonStructure(['data']);
    }

    public function test_can_search_customers(): void
    {
        Customer::firstOrCreate(
            ['mobile' => '0773334455'],
            ['name' => 'Charlie Chaplin', 'email' => 'charlie@example.com', 'register_at' => now()]
        );

        $response = $this->getJson('/api/v1/customers/search?q=Charlie');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_can_show_and_update_and_delete_customer(): void
    {
        $customer = Customer::create([
            'name' => 'David',
            'mobile' => '0774445566',
            'email' => 'david@example.com',
            'register_at' => now(),
        ]);

        // Show
        $showResponse = $this->getJson("/api/v1/customers/{$customer->id}");
        $showResponse->assertStatus(200)
            ->assertJsonPath('data.id', $customer->id);

        // Update
        $updateResponse = $this->putJson("/api/v1/customers/{$customer->id}", [
            'name' => 'David Updated',
        ]);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.name', 'David Updated');

        // Delete
        $deleteResponse = $this->deleteJson("/api/v1/customers/{$customer->id}");
        $deleteResponse->assertStatus(200)
            ->assertJsonPath('message', 'Customer deleted successfully.');

        $this->assertDatabaseMissing('customer', ['id' => $customer->id]);
    }

    public function test_can_retrieve_customer_print_jobs(): void
    {
        $customer = Customer::create([
            'name' => 'Customer With Jobs',
            'mobile' => '0775556677',
            'email' => 'jobs@example.com',
            'register_at' => now(),
        ]);

        $response = $this->getJson("/api/v1/customers/{$customer->id}/print-jobs");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'pagination',
            ]);
    }
}
