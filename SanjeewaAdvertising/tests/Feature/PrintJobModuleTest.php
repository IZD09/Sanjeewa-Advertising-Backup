<?php

namespace Tests\Feature;

use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintCost;
use Modules\Design\Models\PrintCostType;
use Modules\Design\Models\PrintType;
use Modules\PrintJob\Models\PrintJob;
use Modules\PrintJob\Models\PrintJobStatus;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class PrintJobModuleTest extends TestCase
{
    private User $user;

    private Customer $customer;

    private PrintType $printType;

    private PrintJobStatus $status;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate');

        $userStatus = UserStatus::firstOrCreate(['user_status' => 'Active']);

        $this->user = User::firstOrCreate(
            ['username' => 'test_operator'],
            [
                'first_name' => 'Operator',
                'last_name' => 'User',
                'mobile' => '0771234567',
                'password' => bcrypt('password'),
                'register_at' => now(),
                'is_login' => 0,
                'user_statuses_id' => $userStatus->id,
            ]
        );

        $this->customer = Customer::firstOrCreate(
            ['mobile' => '0719876543'],
            [
                'name' => 'Test Customer',
                'email' => 'customer@example.com',
                'register_at' => now(),
            ]
        );

        $this->printType = PrintType::firstOrCreate(
            ['print_type' => 'Flex Banner Printing']
        );

        $this->status = PrintJobStatus::firstOrCreate(
            ['print_job_states' => 'Designing']
        );
    }

    public function test_can_create_print_job(): void
    {
        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 5,
            'print_job_statuses_id' => $this->status->id,
            'discount' => 100.00,
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Print job created successfully.',
            ])
            ->assertJsonPath('data.customer_id', $this->customer->id)
            ->assertJsonPath('data.qty', 5);

        $this->assertDatabaseHas('print_jobs', [
            'customer_id' => $this->customer->id,
            'qty' => 5,
        ]);
    }

    public function test_can_list_print_jobs_with_pagination(): void
    {
        PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 10,
        ]);

        $response = $this->getJson('/api/v1/print-jobs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'pagination' => [
                    'current_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_can_retrieve_all_print_jobs(): void
    {
        PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 12,
        ]);

        $response = $this->getJson('/api/v1/print-jobs/all');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'All print jobs retrieved successfully.',
            ])
            ->assertJsonStructure(['data']);
    }

    public function test_can_show_single_print_job(): void
    {
        $job = PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 8,
        ]);

        $response = $this->getJson("/api/v1/print-jobs/{$job->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonPath('data.id', $job->id)
            ->assertJsonPath('data.qty', 8);
    }

    public function test_can_update_print_job(): void
    {
        $job = PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 3,
        ]);

        $response = $this->putJson("/api/v1/print-jobs/{$job->id}", [
            'qty' => 15,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.qty', 15);

        $this->assertDatabaseHas('print_jobs', [
            'id' => $job->id,
            'qty' => 15,
        ]);
    }

    public function test_can_delete_print_job(): void
    {
        $job = PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 4,
        ]);

        $response = $this->deleteJson("/api/v1/print-jobs/{$job->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Print job deleted successfully.',
            ]);

        $this->assertDatabaseMissing('print_jobs', ['id' => $job->id]);
    }

    public function test_can_update_status_and_read_status_history(): void
    {
        $job = PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 2,
        ]);

        $newStatus = PrintJobStatus::firstOrCreate(['print_job_states' => 'Completed']);

        $response = $this->patchJson("/api/v1/print-jobs/{$job->id}/status", [
            'print_job_statuses_id' => $newStatus->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.current_status.id', $newStatus->id);

        $historyResponse = $this->getJson("/api/v1/print-jobs/{$job->id}/status-history");
        $historyResponse->assertStatus(200)
            ->assertJsonStructure(['data' => [['print_jobs_id', 'print_job_statuses_id']]]);
    }

    public function test_can_manage_print_job_cost(): void
    {
        $job = PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 5,
        ]);

        $costType = PrintCostType::firstOrCreate(
            ['cost_type' => 'Lamination'],
            ['print_types_id' => $this->printType->id]
        );

        $printCost = PrintCost::create([
            'print_cost_type_id' => $costType->id,
            'price' => 500.00,
            'add_at' => now(),
        ]);

        $response = $this->putJson("/api/v1/print-jobs/{$job->id}/cost", [
            'discount' => 50.00,
            'print_cost_ids' => [$printCost->id],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.discount', 50)
            ->assertJsonPath('data.print_costs.0.id', $printCost->id);
    }

    public function test_can_search_print_jobs(): void
    {
        PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 77,
        ]);

        $response = $this->getJson('/api/v1/print-jobs/search?q=Test Customer');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_manage_print_job_statuses(): void
    {
        // 1. Create status
        $response = $this->postJson('/api/v1/print-job-statuses', [
            'print_job_states' => 'Archived_'.uniqid(),
        ]);

        $response->assertStatus(201);
        $statusId = $response->json('data.id');

        // 2. Show status
        $showResponse = $this->getJson("/api/v1/print-job-statuses/{$statusId}");
        $showResponse->assertStatus(200);

        // 3. Update status
        $updateResponse = $this->putJson("/api/v1/print-job-statuses/{$statusId}", [
            'print_job_states' => 'ReadyForDelivery_'.uniqid(),
        ]);
        $updateResponse->assertStatus(200);

        // 4. Delete status
        $deleteResponse = $this->deleteJson("/api/v1/print-job-statuses/{$statusId}");
        $deleteResponse->assertStatus(200);
    }
}
