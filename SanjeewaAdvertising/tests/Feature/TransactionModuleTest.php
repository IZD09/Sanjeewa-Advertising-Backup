<?php

namespace Tests\Feature;

use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintType;
use Modules\PrintJob\Models\PrintJob;
use Modules\Supplier\Models\Grn;
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
}
