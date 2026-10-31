<?php

namespace Tests\Feature;

use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_dashboard_page_loads_successfully(): void
    {
        $response = $this->get('/dashboard');

        $response->assertStatus(200);
        $response->assertSee('id="module-dashboard"', false);
        $response->assertSee('data-sse-url', false);
    }

    public function test_dashboard_data_endpoint_returns_json_resource(): void
    {
        $response = $this->getJson('/dashboard/data');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Dashboard data retrieved successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'overview' => [
                        'totalSales',
                        'activeJobs',
                        'newCustomers',
                        'pendingInvoices',
                        'revenueTrend',
                        'ordersBreakdown',
                    ],
                    'revenue' => [
                        'categories',
                        'paymentMethods',
                    ],
                    'jobs' => [
                        'weeklyOutput',
                        'materialUsage',
                    ],
                    'stock' => [
                        'health',
                        'levels',
                    ],
                    'finance' => [
                        'totalRevenue',
                        'totalExpenses',
                        'netProfit',
                        'profitMargin',
                        'supplierPayables',
                        'comparison',
                    ],
                    'meta' => [
                        'generated_at',
                        'status',
                    ],
                ],
            ]);
    }

    public function test_dashboard_stream_endpoint_returns_sse_stream(): void
    {
        $response = $this->get('/dashboard/stream');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/event-stream', (string) $response->headers->get('Content-Type'));
        $this->assertStringContainsString('no-cache', (string) $response->headers->get('Cache-Control'));

        // Verify SSE payload structure
        $content = $response->streamedContent();
        $this->assertStringContainsString('retry: 5000', $content);
        $this->assertStringContainsString('event: message', $content);
        $this->assertStringContainsString('data: {"overview":', $content);
    }

    public function test_api_dashboard_endpoints(): void
    {
        $response = $this->getJson('/api/v1/dashboard/data');
        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
