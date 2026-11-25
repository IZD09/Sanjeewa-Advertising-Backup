<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Modules\Admin\Database\Seeders\AdminStatusSeeder;
use Modules\Admin\Database\Seeders\AdminTypeSeeder;
use Modules\Admin\Database\Seeders\DefaultAdminSeeder;
use Modules\Admin\Models\Admin;
use Modules\Core\Services\RequestPriorityService;
use Modules\User\Database\Seeders\SystemModuleSeeder;
use Modules\User\Database\Seeders\UserStatusSeeder;
use Tests\TestCase;

class RequestPriorityTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(UserStatusSeeder::class);
        $this->seed(AdminStatusSeeder::class);
        $this->seed(AdminTypeSeeder::class);
        $this->seed(SystemModuleSeeder::class);
        $this->seed(DefaultAdminSeeder::class);

        $this->admin = Admin::where('username', 'admin')->firstOrFail();

        app(RequestPriorityService::class)->resetActiveHighCount();
        RateLimiter::clear("req_priority:high:{$this->admin->id}");
        RateLimiter::clear("req_priority:normal:{$this->admin->id}");
        RateLimiter::clear("req_priority:low:{$this->admin->id}");
    }

    public function test_requests_receive_server_assigned_priority_headers(): void
    {
        // LOW priority: LiveSync version check
        $lowRes = $this->actingAs($this->admin, 'admin')
            ->getJson('/advertising/live-sync/versions');
        $lowRes->assertStatus(200)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_LOW);

        // NORMAL priority: Standard listing endpoint
        $normalRes = $this->actingAs($this->admin, 'admin')
            ->getJson('/advertising/customers');
        $normalRes->assertStatus(200)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_NORMAL);

        // HIGH priority: Mutating write request (creating customer)
        $highRes = $this->actingAs($this->admin, 'admin')
            ->postJson('/advertising/customers', [
                'name' => 'Priority Test Customer',
                'mobile' => '0771234567',
            ]);
        $highRes->assertStatus(201)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_HIGH);

        // High slot must be cleanly released after completion
        $this->assertSame(0, app(RequestPriorityService::class)->getActiveHighCount());
    }

    public function test_low_priority_requests_shed_load_with_503_when_high_concurrency_threshold_reached(): void
    {
        config()->set('core.request_priority.high_concurrency_threshold', 3);
        config()->set('core.request_priority.retry_after_seconds', 2);

        // Simulate 3 active in-flight HIGH priority transactions
        Cache::put(RequestPriorityService::ACTIVE_HIGH_CACHE_KEY, 3, now()->addSeconds(30));

        // 1. LOW priority request must be shed immediately with 503 + Retry-After + X-Load-Shed
        $shedRes = $this->actingAs($this->admin, 'admin')
            ->getJson('/advertising/live-sync/versions');

        $shedRes->assertStatus(503)
            ->assertHeader('Retry-After', '2')
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_LOW)
            ->assertHeader('X-Load-Shed', '1')
            ->assertJsonPath('success', false)
            ->assertJsonPath('retry_after', 2);

        // 2. NORMAL priority request must still be allowed
        $normalRes = $this->actingAs($this->admin, 'admin')
            ->getJson('/advertising/customers');
        $normalRes->assertStatus(200)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_NORMAL);

        // 3. HIGH priority write request must still succeed without being shed
        $highRes = $this->actingAs($this->admin, 'admin')
            ->postJson('/advertising/customers', [
                'name' => 'Rush Hour Customer',
                'mobile' => '0779876543',
            ]);
        $highRes->assertStatus(201)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_HIGH);

        // 4. Once active HIGH count drops below threshold, LOW priority succeeds again
        app(RequestPriorityService::class)->resetActiveHighCount();

        $recoveredRes = $this->actingAs($this->admin, 'admin')
            ->getJson('/advertising/live-sync/versions');
        $recoveredRes->assertStatus(200)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_LOW);
    }

    public function test_low_priority_rate_limit_does_not_block_high_priority_requests(): void
    {
        config()->set('core.request_priority.rate_limits.low', 10);

        $limiterKey = "req_priority:low:{$this->admin->id}";
        for ($i = 0; $i < 10; $i++) {
            RateLimiter::hit($limiterKey, 60);
        }

        // LOW priority bucket is exhausted -> 429 Too Many Requests
        $throttledLow = $this->actingAs($this->admin, 'admin')
            ->getJson('/advertising/live-sync/versions');
        $throttledLow->assertStatus(429)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_LOW);

        // HIGH priority bucket is isolated -> still succeeds with 201!
        $highRes = $this->actingAs($this->admin, 'admin')
            ->postJson('/advertising/customers', [
                'name' => 'Protected High Priority Customer',
                'mobile' => '0712223344',
            ]);
        $highRes->assertStatus(201)
            ->assertHeader('X-Request-Priority', RequestPriorityService::PRIORITY_HIGH);
    }
}
