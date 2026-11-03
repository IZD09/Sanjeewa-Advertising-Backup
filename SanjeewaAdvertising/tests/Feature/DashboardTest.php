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
        $response->assertDontSee('id="modalRecordInvoicePayment"', false);
        $response->assertDontSee('id="createOrderModal"', false);
    }

    public function test_dashboard_data_endpoint_returns_json_resource(): void
    {
        $response = $this->getJson('/dashboard/data');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'overview' => [
                    'states' => [
                        'articles' => [
                            'article1' => ['value', 'trendState', 'trend', 'bars'],
                            'article2' => ['value', 'trendState', 'trend', 'bars'],
                            'article3' => ['value', 'trendState', 'trend', 'bars'],
                            'article4' => ['value', 'trendState', 'trend', 'bars'],
                        ],
                        'chartTitle',
                        'jobStatas' => ['completed', 'printing', 'designing', 'pending'],
                    ],
                    'revenueTrend' => ['labels', 'values'],
                    'ordersBreakdown' => ['completed', 'printing', 'designing', 'pending', 'values'],
                ],
                'revenue' => [
                    'states',
                    'income' => ['labels', 'currentYear', 'previousYear', 'currentYearData', 'previousYearData'],
                    'paymentMethods' => ['labels', 'values'],
                ],
                'jobs' => [
                    'states',
                    'weeklyOutput' => ['labels', 'values', 'colors'],
                    'materialUsage' => ['labels', 'values'],
                ],
                'stock' => [
                    'states',
                    'health' => [
                        '*' => ['name', 'value', 'percentage', 'color'],
                    ],
                    'levels' => ['labels', 'values', 'colors'],
                ],
                'finance' => [
                    'states',
                    'totalRevenue',
                    'totalExpenses',
                    'netProfit',
                    'profitMargin',
                    'supplierPayables',
                    'comparison' => ['labels', 'revenue', 'expenses'],
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
            ->assertJsonStructure([
                'overview',
                'revenue',
                'jobs',
                'stock',
                'finance',
            ]);
    }
}
