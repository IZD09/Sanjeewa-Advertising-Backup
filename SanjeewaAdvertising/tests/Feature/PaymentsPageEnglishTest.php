<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Modules\User\Models\SystemModule;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class PaymentsPageEnglishTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_payments_page_renders_in_english_without_sinhala_characters(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $user = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'mobile' => '0771111111',
            'register_at' => now(),
            'username' => 'admin_test',
            'password' => Hash::make('password123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::create(['id' => 1, 'system_module' => 'Payments & Financials']);
        $user->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $response = $this->actingAs($user, 'web')->get('/payments');

        $response->assertOk();
        $response->assertSee('Payments &amp; Settlements Hub', false);
        $response->assertSee('Operating Expenses');
        $response->assertSee('Monthly Operating Bills');

        $content = $response->getContent();

        // Verify no Sinhala unicode characters are present anywhere in the rendered HTML output
        $this->assertDoesNotMatchRegularExpression('/[\x{0D80}-\x{0DFF}]/u', $content);

        // Verify Multi-Job Invoice Modal structure exists with direct selector
        $response->assertSee('invModalJobSelect');
        $response->assertSee('invModalSelectedJobsBody');
        $response->assertSee('Customer &amp; Multi-Job Print Settlements', false);
        $response->assertDontSee('btnAddJobToInvoice');

        // Verify Multi-Purchase Order GRN Modal structure exists with direct selector
        $response->assertSee('grnModalRefSelect');
        $response->assertSee('grnModalSelectedPoBody');
        $response->assertSee('btnGrnPayFull');
        $response->assertSee('Stock Acquisition &amp; Multi-Purchase Order Disbursements', false);
        $response->assertSee('Select Purchase Orders to Add to this GRN');
        $response->assertDontSee('btnAddPoToGrn');

        // Verify Tab Tables Pagination Bars exist
        $response->assertSee('payInvoicePaginationInfo');
        $response->assertSee('payInvoicePaginationControls');
        $response->assertSee('payGrnPaginationInfo');
        $response->assertSee('payGrnPaginationControls');
        $response->assertSee('payExpensePaginationInfo');
        $response->assertSee('payExpensePaginationControls');
    }

    public function test_available_print_jobs_and_purchase_orders_api_endpoints_work(): void
    {
        $responseJobs = $this->getJson('/api/v1/invoices/available-jobs');
        $responseJobs->assertOk();
        $responseJobs->assertJsonStructure([
            'success',
            'message',
            'data',
        ]);

        $responsePos = $this->getJson('/api/v1/grn-payments/available-pos');
        $responsePos->assertOk();
        $responsePos->assertJsonStructure([
            'success',
            'message',
            'data',
        ]);
    }
}
