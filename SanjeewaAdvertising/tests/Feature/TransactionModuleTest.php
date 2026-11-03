<?php

namespace Tests\Feature;

use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintType;
use Modules\PrintJob\Models\PrintJob;
use Modules\Supplier\Models\Grn;
use Modules\Transaction\Models\Expencesess;
use Modules\Transaction\Models\ExpencesessStatus;
use Modules\Transaction\Models\ExpencesessType;
use Modules\Transaction\Models\PaymentStatus;
use Modules\Transaction\Models\PaymentType;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class TransactionModuleTest extends TestCase
{
    private PaymentType $paymentType;

    private PaymentStatus $paymentStatus;

    private PrintJob $printJob;

    private Grn $grn;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $this->paymentType = PaymentType::firstOrCreate(['payment_type' => 'Cash']);
        $this->paymentStatus = PaymentStatus::firstOrCreate(['payment_status' => 'Completed']);

        $userStatus = UserStatus::firstOrCreate(['user_status' => 'Active']);
        $user = User::firstOrCreate(
            ['username' => 'tx_user'],
            [
                'first_name' => 'Tx',
                'last_name' => 'User',
                'mobile' => '0770009999',
                'password' => bcrypt('password'),
                'register_at' => now(),
                'is_login' => 0,
                'user_statuses_id' => $userStatus->id,
            ]
        );

        $customer = Customer::firstOrCreate(
            ['mobile' => '0778881111'],
            ['name' => 'Tx Customer', 'email' => 'tx_cust@example.com', 'register_at' => now()]
        );

        $printType = PrintType::firstOrCreate(['print_type' => 'Digital Banner']);

        $this->printJob = PrintJob::create([
            'users_id' => $user->id,
            'customer_id' => $customer->id,
            'print_types_id' => $printType->id,
            'add_date' => now(),
            'qty' => 5,
        ]);

        $this->grn = Grn::create([
            'at_time' => now(),
        ]);
    }

    public function test_can_manage_customer_payments(): void
    {
        // 1. Create Payment
        $response = $this->postJson('/api/v1/payments', [
            'payment' => 1500.00,
            'print_jobs_id' => $this->printJob->id,
            'payment_types_id' => $this->paymentType->id,
            'payment_statuses_id' => $this->paymentStatus->id,
            'pay_date' => now()->toDateString(),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.payment', 1500)
            ->assertJsonPath('data.print_jobs_id', $this->printJob->id);

        $paymentId = $response->json('data.id');

        // 2. List, All, Types, Statuses
        $this->getJson('/api/v1/payments')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/api/v1/payments/all')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/api/v1/payments/types')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/api/v1/payments/statuses')->assertStatus(200)->assertJsonStructure(['data']);

        // 3. Show
        $this->getJson("/api/v1/payments/{$paymentId}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $paymentId);

        // 4. Update
        $this->putJson("/api/v1/payments/{$paymentId}", [
            'payment' => 2000.00,
        ])->assertStatus(200)->assertJsonPath('data.payment', 2000);

        // 5. Delete
        $this->deleteJson("/api/v1/payments/{$paymentId}")->assertStatus(200);
        $this->assertDatabaseMissing('payments', ['id' => $paymentId]);
    }

    public function test_can_manage_grn_payments(): void
    {
        // 1. Create GRN Payment
        $response = $this->postJson('/api/v1/grn-payments', [
            'payment' => 5000.00,
            'grn_id' => $this->grn->id,
            'payment_types_id' => $this->paymentType->id,
            'payment_statuses_id' => $this->paymentStatus->id,
            'pay_date' => now()->toDateString(),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.payment', 5000)
            ->assertJsonPath('data.grn_id', $this->grn->id);

        $paymentId = $response->json('data.id');

        // 2. List & All
        $this->getJson('/api/v1/grn-payments')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/api/v1/grn-payments/all')->assertStatus(200)->assertJsonStructure(['data']);

        // 3. Show
        $this->getJson("/api/v1/grn-payments/{$paymentId}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $paymentId);

        // 4. Update
        $this->putJson("/api/v1/grn-payments/{$paymentId}", [
            'payment' => 6000.00,
        ])->assertStatus(200)->assertJsonPath('data.payment', 6000);

        // 5. Delete
        $this->deleteJson("/api/v1/grn-payments/{$paymentId}")->assertStatus(200);
        $this->assertDatabaseMissing('grn_payments', ['id' => $paymentId]);
    }

    public function test_can_manage_expenses_tables_and_models(): void
    {
        $type = ExpencesessType::create([
            'expencesess_type' => 'Electricity Utility',
        ]);

        $status = ExpencesessStatus::create([
            'expencesess_status' => 'Pending Approval',
        ]);

        $user = User::first();

        $expense = Expencesess::create([
            'expencesess_types_id' => $type->id,
            'price' => 12500.50,
            'expencesess_statuses_id' => $status->id,
            'add_by' => $user->id,
            'pay_by' => $user->id,
            'add_date' => now(),
            'pay_at' => now(),
        ]);

        $this->assertDatabaseHas('expencesess_types', ['id' => $type->id, 'expencesess_type' => 'Electricity Utility']);
        $this->assertDatabaseHas('expencesess_statuses', ['id' => $status->id, 'expencesess_status' => 'Pending Approval']);
        $this->assertDatabaseHas('expencesess', ['id' => $expense->id, 'price' => 12500.50]);

        $this->assertEquals($type->id, $expense->type->id);
        $this->assertEquals($status->id, $expense->status->id);
        $this->assertEquals($user->id, $expense->addedBy->id);
        $this->assertEquals($user->id, $expense->paidBy->id);
        $this->assertCount(1, $type->expencesess);
        $this->assertCount(1, $status->expencesess);
    }

    public function test_can_manage_expenses_via_api_endpoints(): void
    {
        $user = User::first();

        // 1. Create Expense Type
        $typeRes = $this->postJson('/api/v1/expense-types', [
            'expencesess_type' => 'Internet & Phone',
        ])->assertStatus(201);
        $typeId = $typeRes->json('data.id');

        // 2. Create Expense Status
        $statusRes = $this->postJson('/api/v1/expense-statuses', [
            'expencesess_status' => 'Paid in Full',
        ])->assertStatus(201);
        $statusId = $statusRes->json('data.id');

        // 3. Create Expense
        $expenseRes = $this->postJson('/api/v1/expenses', [
            'expencesess_types_id' => $typeId,
            'price' => 7500.00,
            'expencesess_statuses_id' => $statusId,
            'add_by' => $user->id,
            'pay_by' => $user->id,
            'add_date' => now()->toDateString(),
            'pay_at' => now()->toDateString(),
        ])->assertStatus(201)
            ->assertJsonPath('data.price', 7500)
            ->assertJsonPath('data.expencesess_types_id', $typeId);

        $expenseId = $expenseRes->json('data.id');

        // 4. List & All & KPIs
        $this->getJson('/api/v1/expenses')->assertStatus(200)->assertJsonStructure(['data', 'pagination']);
        $this->getJson('/api/v1/expenses/all')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/api/v1/expenses/types')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/api/v1/expenses/statuses')->assertStatus(200)->assertJsonStructure(['data']);
        $this->getJson('/api/v1/expenses/data')->assertStatus(200)->assertJsonStructure(['data' => ['expenses', 'kpis']]);

        // 5. Show
        $this->getJson("/api/v1/expenses/{$expenseId}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $expenseId);

        // 6. Update
        $this->putJson("/api/v1/expenses/{$expenseId}", [
            'price' => 8200.00,
        ])->assertStatus(200)->assertJsonPath('data.price', 8200);

        // 7. Delete
        $this->deleteJson("/api/v1/expenses/{$expenseId}")->assertStatus(200);
        $this->assertDatabaseMissing('expencesess', ['id' => $expenseId]);
    }
}
