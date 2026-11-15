<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
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

        $response = $this->postJson('/api/v1/suppliers', $payload);

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

        $response = $this->postJson('/api/v1/suppliers', $payload);

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
        $response = $this->postJson('/api/v1/suppliers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'mobile']);
    }

    public function test_cannot_create_duplicate_supplier_with_same_name(): void
    {
        $this->postJson('/api/v1/suppliers', [
            'name' => 'Universal Ink Lanka',
            'mobile' => '0771122334',
            'email' => 'info@universalink.lk',
        ])->assertStatus(201);

        $duplicate = $this->postJson('/api/v1/suppliers', [
            'name' => 'Universal Ink Lanka',
            'mobile' => '0779988776',
            'email' => 'different@universalink.lk',
        ]);

        $duplicate->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_cannot_create_duplicate_supplier_with_same_mobile(): void
    {
        $this->postJson('/api/v1/suppliers', [
            'name' => 'First Sign Supplies',
            'mobile' => '0775566778',
            'email' => 'first@signsupplies.lk',
        ])->assertStatus(201);

        $duplicate = $this->postJson('/api/v1/suppliers', [
            'name' => 'Second Sign Supplies',
            'mobile' => '0775566778',
            'email' => 'second@signsupplies.lk',
        ]);

        $duplicate->assertStatus(422)
            ->assertJsonValidationErrors(['mobile']);
    }

    public function test_cannot_create_duplicate_supplier_with_same_email(): void
    {
        $this->postJson('/api/v1/suppliers', [
            'name' => 'Alpha Paper Lanka',
            'mobile' => '0712233445',
            'email' => 'contact@alphapaper.lk',
        ])->assertStatus(201);

        $duplicate = $this->postJson('/api/v1/suppliers', [
            'name' => 'Beta Paper Lanka',
            'mobile' => '0719988776',
            'email' => 'contact@alphapaper.lk',
        ]);

        $duplicate->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
