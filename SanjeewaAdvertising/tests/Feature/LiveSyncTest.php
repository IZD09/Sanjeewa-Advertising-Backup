<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Modules\Core\Services\LiveSyncService;
use Tests\TestCase;

class LiveSyncTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::forget(LiveSyncService::CACHE_KEY);
    }

    public function test_can_fetch_all_live_sync_channel_versions(): void
    {
        $response = $this->getJson('/api/v1/live-sync/versions');

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'versions' => [
                        'dashboard',
                        'orders',
                        'print_jobs',
                        'payments',
                        'inventory',
                        'grn',
                        'customers',
                        'hr',
                        'users',
                        'reports',
                    ],
                    'server_time',
                ],
            ]);
    }

    public function test_can_filter_live_sync_versions_by_channels(): void
    {
        $response = $this->getJson('/api/v1/live-sync/versions?channels=orders,dashboard');

        $response->assertOk();
        $versions = $response->json('data.versions');

        $this->assertSame(['orders', 'dashboard'], array_keys($versions));
    }

    public function test_bumping_operational_channel_also_bumps_dashboard_and_reports(): void
    {
        $service = app(LiveSyncService::class);
        $before = $service->getVersions(['orders', 'dashboard', 'reports', 'hr']);

        $after = $service->bump('orders');

        $this->assertGreaterThan($before['orders'], $after['orders']);
        $this->assertGreaterThan($before['dashboard'], $after['dashboard']);
        $this->assertGreaterThan($before['reports'], $after['reports']);
        $this->assertSame($before['hr'], $after['hr']);
    }

    public function test_middleware_bumps_versions_and_sets_header_on_successful_mutation(): void
    {
        $this->artisan('migrate');

        $before = app(LiveSyncService::class)->getVersions(['customers', 'orders', 'dashboard']);

        $response = $this->postJson('/api/v1/customers', [
            'name' => 'Live Sync Customer',
            'mobile' => '077'.random_int(1000000, 9999999),
            'register_at' => now()->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(201);
        $this->assertStringContainsString('customers', (string) $response->headers->get('X-Live-Sync-Channels'));

        $after = app(LiveSyncService::class)->getVersions(['customers', 'orders', 'dashboard']);
        $this->assertGreaterThan($before['customers'], $after['customers']);
        $this->assertGreaterThan($before['orders'], $after['orders']);
        $this->assertGreaterThan($before['dashboard'], $after['dashboard']);
    }
}
