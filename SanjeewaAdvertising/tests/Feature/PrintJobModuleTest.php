<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintCost;
use Modules\Design\Models\PrintCostType;
use Modules\Design\Models\PrintType;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\StockUnit;
use Modules\Inventory\Models\Subcategory;
use Modules\PrintJob\Models\DeliveryMethod;
use Modules\PrintJob\Models\PrintJob;
use Modules\PrintJob\Models\PrintJobStatus;
use Modules\PrintJob\Models\Unit;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\GrnStatus;
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

        $response = $this->postJson('/advertising/print-jobs', $payload);

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

    public function test_can_create_print_job_with_delivery_date_and_deadline(): void
    {
        $targetDate = now()->addDays(3)->format('Y-m-d');

        $payload = [
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'qty' => 2,
            'delivery_date' => $targetDate,
            'deadline' => $targetDate,
        ];

        $response = $this->postJson('/advertising/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Print job created successfully.',
            ])
            ->assertJsonPath('data.deadline', $targetDate);

        $this->assertDatabaseHas('print_jobs', [
            'customer_id' => $this->customer->id,
            'qty' => 2,
            'delivery_date' => $targetDate,
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

        $response = $this->getJson('/advertising/print-jobs');

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

        $response = $this->getJson('/advertising/print-jobs/all');

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

        $response = $this->getJson("/advertising/print-jobs/{$job->id}");

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

        $response = $this->putJson("/advertising/print-jobs/{$job->id}", [
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

        $response = $this->deleteJson("/advertising/print-jobs/{$job->id}");

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

        $response = $this->patchJson("/advertising/print-jobs/{$job->id}/status", [
            'print_job_statuses_id' => $newStatus->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.current_status.id', $newStatus->id);

        $historyResponse = $this->getJson("/advertising/print-jobs/{$job->id}/status-history");
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

        $response = $this->putJson("/advertising/print-jobs/{$job->id}/cost", [
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

        $response = $this->getJson('/advertising/print-jobs/search?q=Test Customer');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_manage_print_job_statuses(): void
    {
        // 1. Create status
        $response = $this->postJson('/advertising/print-job-statuses', [
            'print_job_states' => 'Archived_'.uniqid(),
        ]);

        $response->assertStatus(201);
        $statusId = $response->json('data.id');

        // 2. Show status
        $showResponse = $this->getJson("/advertising/print-job-statuses/{$statusId}");
        $showResponse->assertStatus(200);

        // 3. Update status
        $updateResponse = $this->putJson("/advertising/print-job-statuses/{$statusId}", [
            'print_job_states' => 'ReadyForDelivery_'.uniqid(),
        ]);
        $updateResponse->assertStatus(200);

        // 4. Delete status
        $deleteResponse = $this->deleteJson("/advertising/print-job-statuses/{$statusId}");
        $deleteResponse->assertStatus(200);
    }

    public function test_can_retrieve_place_order_demo_data(): void
    {
        $response = $this->getJson('/advertising/print-jobs/place-order-data');

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

        $response = $this->postJson('/advertising/print-jobs', $payload);

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

        $response = $this->postJson('/advertising/print-jobs', $payload);

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
            'discription' => 'Urgent vinyl banner with grommets',
        ];

        $response = $this->postJson('/advertising/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.delivery_method_id', $deliveryMethod->id)
            ->assertJsonPath('data.discription', 'Urgent vinyl banner with grommets');

        $job = PrintJob::where('customer_id', $this->customer->id)->where('qty', 5)->latest('id')->first();
        $this->assertNotNull($job);
        $this->assertEquals($deliveryMethod->id, $job->delivery_method_id);
        $this->assertEquals('Urgent vinyl banner with grommets', $job->discription);
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

        $response = $this->postJson('/advertising/print-jobs', $payload);
        $response->assertStatus(201);

        $jobId = $response->json('data.id');
        $this->assertDatabaseMissing('payments', [
            'print_jobs_id' => $jobId,
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

        $response = $this->postJson('/advertising/print-jobs', $payload);
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

        $response = $this->postJson('/advertising/print-jobs', $payload);
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

        $response = $this->postJson('/advertising/print-jobs', $payload);
        $response->assertStatus(201);

        $jobId = $response->json('data.id');
        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $jobId,
            'payment' => 500.00,
            'payment_statuses_id' => 2,
        ]);
    }

    public function test_can_create_multiple_orders_for_same_customer_with_advance_payment_allocation(): void
    {
        $unit = Unit::firstOrCreate(['id' => 1], ['simble' => 'ft', 'name' => 'Feet']);
        $deliveryMethod = DeliveryMethod::firstOrCreate(['id' => 1], ['methord' => 'Customer Pickup']);
        $deadline = now()->addDays(3)->format('Y-m-d');

        $payload = [
            'customer_id' => $this->customer->id,
            'paid_amount' => 5000.00,
            'payment_amount' => 5000.00,
            'payment_types_id' => 1,
            'orders' => [
                [
                    'users_id' => $this->user->id,
                    'print_types_id' => $this->printType->id,
                    'wtdth' => 10,
                    'hight' => 4,
                    'unit_id' => $unit->id,
                    'delivery_method_id' => $deliveryMethod->id,
                    'qty' => 1,
                    'unit_price' => 100.00,
                    'discount' => 0,
                    'design_status' => 'Customer Provides Design',
                    'total_amount' => 4000.00,
                    'delivery_date' => $deadline,
                    'deadline' => $deadline,
                    'discription' => 'Banner 1',
                ],
                [
                    'users_id' => $this->user->id,
                    'print_types_id' => $this->printType->id,
                    'wtdth' => 10,
                    'hight' => 6,
                    'unit_id' => $unit->id,
                    'delivery_method_id' => $deliveryMethod->id,
                    'qty' => 1,
                    'unit_price' => 100.00,
                    'discount' => 0,
                    'design_status' => 'Customer Provides Design',
                    'total_amount' => 6000.00,
                    'delivery_date' => $deadline,
                    'deadline' => $deadline,
                    'discription' => 'Banner 2',
                ],
            ],
        ];

        $response = $this->postJson('/advertising/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => '2 print jobs created successfully.',
            ])
            ->assertJsonPath('data.count', 2)
            ->assertJsonCount(2, 'data.orders');

        $firstJobId = $response->json('data.orders.0.id');
        $secondJobId = $response->json('data.orders.1.id');

        $this->assertDatabaseHas('print_jobs', [
            'id' => $firstJobId,
            'customer_id' => $this->customer->id,
            'discription' => 'Banner 1',
        ]);
        $this->assertDatabaseHas('print_jobs', [
            'id' => $secondJobId,
            'customer_id' => $this->customer->id,
            'discription' => 'Banner 2',
        ]);

        // Order 1 fully covered (4000 / 4000 -> Completed status 2)
        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $firstJobId,
            'payment' => 4000.00,
            'payment_types_id' => 1,
            'payment_statuses_id' => 2,
        ]);

        // Order 2 receives remaining advance (1000 / 6000 -> Partial status 3)
        $this->assertDatabaseHas('payments', [
            'print_jobs_id' => $secondJobId,
            'payment' => 1000.00,
            'payment_types_id' => 1,
            'payment_statuses_id' => 3,
        ]);
    }

    public function test_can_create_multiple_orders_without_advance_payment(): void
    {
        $unit = Unit::firstOrCreate(['id' => 1], ['simble' => 'ft', 'name' => 'Feet']);
        $deliveryMethod = DeliveryMethod::firstOrCreate(['id' => 1], ['methord' => 'Customer Pickup']);
        $deadline = now()->addDays(2)->format('Y-m-d');

        $payload = [
            'customer_id' => $this->customer->id,
            'paid_amount' => 0,
            'orders' => [
                [
                    'users_id' => $this->user->id,
                    'print_types_id' => $this->printType->id,
                    'wtdth' => 5,
                    'hight' => 3,
                    'unit_id' => $unit->id,
                    'delivery_method_id' => $deliveryMethod->id,
                    'qty' => 2,
                    'unit_price' => 100.00,
                    'deadline' => $deadline,
                ],
                [
                    'users_id' => $this->user->id,
                    'print_types_id' => $this->printType->id,
                    'wtdth' => 4,
                    'hight' => 2,
                    'unit_id' => $unit->id,
                    'delivery_method_id' => $deliveryMethod->id,
                    'qty' => 1,
                    'unit_price' => 120.00,
                    'deadline' => $deadline,
                ],
            ],
        ];

        $response = $this->postJson('/advertising/print-jobs', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.count', 2);

        $firstJobId = $response->json('data.orders.0.id');
        $secondJobId = $response->json('data.orders.1.id');

        $this->assertDatabaseMissing('payments', ['print_jobs_id' => $firstJobId]);
        $this->assertDatabaseMissing('payments', ['print_jobs_id' => $secondJobId]);
    }

    public function test_batch_order_creation_validates_empty_orders_and_missing_payment_method(): void
    {
        $emptyResponse = $this->postJson('/advertising/print-jobs', [
            'customer_id' => $this->customer->id,
            'orders' => [],
        ]);

        $emptyResponse->assertStatus(422)
            ->assertJsonValidationErrors(['orders']);

        $unit = Unit::firstOrCreate(['id' => 1], ['simble' => 'ft', 'name' => 'Feet']);
        $deliveryMethod = DeliveryMethod::firstOrCreate(['id' => 1], ['methord' => 'Customer Pickup']);

        $missingPaymentMethodResponse = $this->postJson('/advertising/print-jobs', [
            'customer_id' => $this->customer->id,
            'paid_amount' => 500.00,
            'orders' => [
                [
                    'users_id' => $this->user->id,
                    'print_types_id' => $this->printType->id,
                    'wtdth' => 5,
                    'hight' => 5,
                    'unit_id' => $unit->id,
                    'delivery_method_id' => $deliveryMethod->id,
                    'qty' => 1,
                    'unit_price' => 100.00,
                    'deadline' => now()->addDays(2)->format('Y-m-d'),
                ],
            ],
        ]);

        $missingPaymentMethodResponse->assertStatus(422)
            ->assertJsonValidationErrors(['payment_types_id']);
    }

    public function test_can_assign_fractional_stock_and_deduct_decimal_quantity_on_printing(): void
    {
        $category = Category::firstOrCreate(['category' => 'Inks & Solvents']);
        $subcategory = Subcategory::firstOrCreate(
            ['subcategory' => 'Eco Solvent Ink', 'categories_id' => $category->id]
        );
        $brand = Brand::firstOrCreate(['brand' => 'Epson']);
        $stockUnit = StockUnit::firstOrCreate(
            ['symble' => 'L'],
            ['unit' => 'Liters']
        );
        DB::table('stock_movements_types')->insertOrIgnore([
            'id' => 2,
            'stock_movements_type' => 'Job Usage / Issue',
        ]);

        $stockItem = StockItem::create([
            'name' => 'Cyan Eco Solvent Ink',
            'code' => 'INK-CYN-01',
            'subcategories_id' => $subcategory->id,
            'low_stock_qty' => 0.500,
            'reorder_qty' => 2.000,
            'stock_units_id' => $stockUnit->id,
        ]);

        $grnStatus = GrnStatus::firstOrCreate(['id' => 1], ['grn_status' => 'Completed']);
        $grn = Grn::create([
            'at_time' => now(),
            'grn_statuses_id' => $grnStatus->id,
        ]);

        $stock = Stock::create([
            'stock_items_id' => $stockItem->id,
            'brands_id' => $brand->id,
            'grn_id' => $grn->id,
            'qty' => 2.000,
            'price' => 4500.00,
            'buy' => 3600.00,
            'add_date' => now(),
        ]);

        $job = PrintJob::create([
            'users_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'print_types_id' => $this->printType->id,
            'add_date' => now(),
            'qty' => 3,
        ]);

        // Allocate 0.25 L (250 ml) and update to 0.34 L via batch sync
        $assignResponse = $this->postJson("/advertising/print-jobs/{$job->id}/stock-items", [
            'stock_items' => [
                [
                    'stock_id' => $stock->id,
                    'qty' => 0.34,
                ],
            ],
        ]);

        $assignResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.materials.0.qty', 0.34);

        // Move job to Finishing status (ID 5) -> triggers automatic fractional stock deduction
        DB::table('print_job_statuses')->insertOrIgnore([
            'id' => 5,
            'print_job_states' => 'Finishing',
        ]);
        $statusResponse = $this->patchJson("/advertising/print-jobs/{$job->id}/status", [
            'print_job_statuses_id' => 5,
        ]);

        $statusResponse->assertStatus(200);

        $stock->refresh();
        $this->assertEquals(1.66, $stock->qty);

        $this->assertDatabaseHas('stock_movements', [
            'stock_id' => $stock->id,
            'stock_movements_types_id' => 2,
            'source_id' => $job->id,
            'qty' => 0.340,
        ]);
    }
}
