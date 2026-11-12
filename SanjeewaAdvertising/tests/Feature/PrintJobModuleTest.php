<?php

namespace Tests\Feature;

use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintCost;
use Modules\Design\Models\PrintCostType;
use Modules\Design\Models\PrintType;
use Modules\PrintJob\Models\DeliveryMethod;
use Modules\PrintJob\Models\PrintJob;
use Modules\PrintJob\Models\PrintJobStatus;
use Modules\PrintJob\Models\Unit;
use Modules\Transaction\Models\PaymentStatus;
use Modules\Transaction\Models\PaymentType;
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

        PaymentType::firstOrCreate(['id' => 1], ['payment_type' => 'Cash']);
        PaymentStatus::firstOrCreate(['id' => 1], ['payment_status' => 'Pending']);
        PaymentStatus::firstOrCreate(['id' => 2], ['payment_status' => 'Completed']);
        PaymentStatus::firstOrCreate(['id' => 3], ['payment_status' => 'Partial']);
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

    public function test_can_retrieve_place_order_demo_data(): void
    {
        $response = $this->getJson('/api/v1/print-jobs/place-order-data');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Place order data retrieved successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'orders' => [
                        '*' => [
                            'id',
                            'customerName',
                            'productName',
                            'quantity',
                            'totalAmount',
                            'paidAmount',
                            'balanceAmount',
                            'paymentStatus',
                            'orderStatus',
                        ],
                    ],
                    'payments',
                    'kpis' => [
                        'totalOrders',
                        'inProduction',
                        'totalRevenue',
                        'outstandingBalance',
                    ],
                ],
            ]);
    }

    public function test_can_create_print_job_with_dimensions_and_unit(): void
    {
        $unit = Unit::firstOrCreate(
            ['id' => 1],
            ['simble' => 'ft', 'name' => 'Feet']
        );

        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 3,
            'wtdth' => 12,
            'hight' => 8,
            'unit_id' => $unit->id,
            'print_job_statuses_id' => $this->status->id,
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Print job created successfully.',
            ]);

        $this->assertDatabaseHas('print_jobs', [
            'customer_id' => $this->customer->id,
            'qty' => 3,
            'wtdth' => 12,
            'hight' => 8,
            'unit_id' => $unit->id,
        ]);

        $job = PrintJob::where('customer_id', $this->customer->id)->where('qty', 3)->latest('id')->first();
        $this->assertNotNull($job);
        $this->assertEquals(12, $job->wtdth);
        $this->assertEquals(8, $job->hight);
        $this->assertEquals('ft', $job->unit->simble);
    }

    public function test_can_create_order_with_advance_payment_and_payment_method(): void
    {
        PaymentStatus::firstOrCreate(
            ['id' => 2],
            ['payment_status' => 'Completed']
        );

        $unit = Unit::firstOrCreate(
            ['id' => 1],
            ['simble' => 'ft', 'name' => 'Feet']
        );

        $paymentType = PaymentType::firstOrCreate(
            ['id' => 1],
            ['payment_type' => 'Cash']
        );

        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 2,
            'wtdth' => 10,
            'hight' => 4,
            'unit_id' => $unit->id,
            'unit_price' => 150.00,
            'discount' => 100.00,
            'paid_amount' => 500.00,
            'payment_types_id' => $paymentType->id,
            'print_job_statuses_id' => $this->status->id,
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Print job created successfully.',
            ]);

        $job = PrintJob::where('customer_id', $this->customer->id)->where('qty', 2)->latest('id')->first();
        $this->assertNotNull($job);
        $this->assertEquals(10, $job->wtdth);
        $this->assertEquals(4, $job->hight);

        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $job->id,
            'payment' => 500.00,
            'payment_types_id' => $paymentType->id,
        ]);
    }

    public function test_can_create_order_with_delivery_method(): void
    {
        $deliveryMethod = DeliveryMethod::firstOrCreate(
            ['id' => 2],
            ['methord' => 'Courier Delivery']
        );

        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 5,
            'wtdth' => 8,
            'hight' => 4,
            'delivery_method_id' => $deliveryMethod->id,
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.delivery_method_id', $deliveryMethod->id);

        $job = PrintJob::where('customer_id', $this->customer->id)->where('qty', 5)->latest('id')->first();
        $this->assertNotNull($job);
        $this->assertEquals($deliveryMethod->id, $job->delivery_method_id);
        $this->assertEquals('Courier Delivery', $job->deliveryMethod->methord);
    }

    public function test_order_creation_saves_pending_payment_status_when_unpaid(): void
    {
        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 1,
            'wtdth' => 10,
            'hight' => 4,
            'unit_price' => 100.00,
            'paid_amount' => 0.00,
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);
        $response->assertStatus(201);

        $jobId = $response->json('data.id');
        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $jobId,
            'payment' => 0.00,
            'payment_statuses_id' => 1, // Pending
        ]);
    }

    public function test_order_creation_saves_partial_payment_status_when_partially_paid(): void
    {
        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 1,
            'wtdth' => 10,
            'hight' => 4,
            'unit_price' => 100.00,
            'total_amount' => 4000.00,
            'paid_amount' => 1000.00,
            'payment_types_id' => 1,
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);
        $response->assertStatus(201);

        $jobId = $response->json('data.id');
        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $jobId,
            'payment' => 1000.00,
            'payment_statuses_id' => 3, // Partial
        ]);
    }

    public function test_order_creation_saves_completed_payment_status_when_fully_paid(): void
    {
        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 1,
            'wtdth' => 10,
            'hight' => 4,
            'unit_price' => 100.00,
            'total_amount' => 4000.00,
            'paid_amount' => 4000.00,
            'payment_types_id' => 1,
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);
        $response->assertStatus(201);

        $jobId = $response->json('data.id');
        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $jobId,
            'payment' => 4000.00,
            'payment_statuses_id' => 2, // Completed
        ]);
    }

    public function test_order_creation_saves_explicit_payment_status(): void
    {
        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 1,
            'wtdth' => 10,
            'hight' => 4,
            'unit_price' => 100.00,
            'total_amount' => 4000.00,
            'paid_amount' => 500.00,
            'payment_types_id' => 1,
            'payment_statuses_id' => 2, // Manually marked as completed
        ];

        $response = $this->postJson('/api/v1/print-jobs', $payload);
        $response->assertStatus(201);

        $jobId = $response->json('data.id');
        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $jobId,
            'payment' => 500.00,
            'payment_statuses_id' => 2,
        ]);
    }
}
