<?php

namespace Tests\Feature;

use Modules\Design\Models\PrintCost;
use Modules\Design\Models\PrintCostType;
use Modules\Design\Models\PrintType;
use Tests\TestCase;

class DesignModuleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_can_manage_print_types(): void
    {
        // 1. Create
        $response = $this->postJson('/api/v1/print-types', [
            'print_type' => 'Laser Engraving ' . uniqid(),
        ]);
        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $typeId = $response->json('data.id');

        // 2. List & All
        $this->getJson('/api/v1/print-types')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/api/v1/print-types/all')->assertStatus(200)->assertJsonStructure(['data']);

        // 3. Show
        $this->getJson("/api/v1/print-types/{$typeId}")->assertStatus(200)->assertJsonPath('data.id', $typeId);

        // 4. Update
        $this->putJson("/api/v1/print-types/{$typeId}", [
            'print_type' => 'Laser Cut Updated ' . uniqid(),
        ])->assertStatus(200);

        // 5. Delete
        $this->deleteJson("/api/v1/print-types/{$typeId}")->assertStatus(200);
        $this->assertDatabaseMissing('print_types', ['id' => $typeId]);
    }

    public function test_can_manage_print_costs(): void
    {
        $printType = PrintType::firstOrCreate(['print_type' => 'Sublimation ' . uniqid()]);
        $costType = PrintCostType::firstOrCreate([
            'cost_type' => 'Paper Cost ' . uniqid(),
            'print_types_id' => $printType->id,
        ]);

        // 1. Create PrintCost
        $createResponse = $this->postJson('/api/v1/print-costs', [
            'print_cost_type_id' => $costType->id,
            'price' => 150.50,
        ]);
        $createResponse->assertStatus(201)->assertJsonPath('data.price', 150.5);

        $costId = $createResponse->json('data.id');

        // 2. List & All
        $this->getJson('/api/v1/print-costs')->assertStatus(200);
        $this->getJson('/api/v1/print-costs/all')->assertStatus(200);

        // 3. Show
        $this->getJson("/api/v1/print-costs/{$costId}")->assertStatus(200)->assertJsonPath('data.id', $costId);

        // 4. Update
        $this->putJson("/api/v1/print-costs/{$costId}", [
            'price' => 200.00,
        ])->assertStatus(200)->assertJsonPath('data.price', 200);

        // 5. Delete
        $this->deleteJson("/api/v1/print-costs/{$costId}")->assertStatus(200);
        $this->assertDatabaseMissing('print_cost', ['id' => $costId]);
    }

    public function test_can_retrieve_print_type_costs_and_cost_types(): void
    {
        $printType = PrintType::firstOrCreate(['print_type' => 'UV Printing ' . uniqid()]);
        $costType = PrintCostType::firstOrCreate([
            'cost_type' => 'Ink Cost ' . uniqid(),
            'print_types_id' => $printType->id,
        ]);

        PrintCost::create([
            'print_cost_type_id' => $costType->id,
            'price' => 75.00,
            'add_at' => now(),
        ]);

        $this->getJson("/api/v1/print-types/{$printType->id}/costs")
            ->assertStatus(200)
            ->assertJsonStructure(['data']);

        $this->getJson('/api/v1/print-costs/types/all')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }
}
