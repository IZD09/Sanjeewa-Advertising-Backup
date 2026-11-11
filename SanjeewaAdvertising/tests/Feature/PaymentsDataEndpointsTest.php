<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentsDataEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->artisan('db:seed', ['--class' => 'Database\\Seeders\\PaymentsModuleDataSeeder']);
    }

    public function test_invoice_payments_data_endpoint_returns_successful_response(): void
    {
        $response = $this->getJson('/api/v1/invoices/data');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'invoices',
                'kpis' => [
                    'total_billed',
                    'total_collected',
                    'total_pending',
                    'counts' => [
                        'complete',
                        'advance',
                        'pending',
                        'total',
                    ],
                ],
            ],
        ]);
    }

    public function test_grn_payments_data_endpoint_returns_successful_response(): void
    {
        $response = $this->getJson('/api/v1/grn-payments/data');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'grn_payments',
                'kpis' => [
                    'total_billed',
                    'total_disbursed',
                    'total_pending',
                    'counts' => [
                        'complete',
                        'advance',
                        'pending',
                        'total',
                    ],
                ],
            ],
        ]);
    }

    public function test_expenses_data_endpoint_returns_successful_response(): void
    {
        $response = $this->getJson('/api/v1/expenses/data');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'expenses',
                'kpis' => [
                    'total_billed',
                    'total_paid',
                    'total_pending',
                    'total_count',
                ],
            ],
        ]);
    }
}
