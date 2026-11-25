<?php

namespace Modules\Core\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RequestPriorityService
{
    public const PRIORITY_HIGH = 'high';

    public const PRIORITY_NORMAL = 'normal';

    public const PRIORITY_LOW = 'low';

    public const ACTIVE_HIGH_CACHE_KEY = 'sanjeewa:request_priority:active_high_count';

    public const DEFAULT_HIGH_CONCURRENCY_THRESHOLD = 5;

    public const DEFAULT_RETRY_AFTER_SECONDS = 2;

    /**
     * Classify an incoming HTTP request into high, normal, or low priority.
     * Classification is determined server-side from HTTP method and path so
     * clients cannot spoof high priority for background/report endpoints.
     */
    public function classify(Request $request): string
    {
        $method = strtoupper($request->method());
        $path = strtolower(trim($request->path(), '/'));

        if ($this->isLowPriorityPath($path)) {
            return self::PRIORITY_LOW;
        }

        if (
            in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true) ||
            $this->isHighPriorityPath($path)
        ) {
            return self::PRIORITY_HIGH;
        }

        return self::PRIORITY_NORMAL;
    }

    /**
     * Determine whether a path represents background/analytics low-priority traffic.
     */
    protected function isLowPriorityPath(string $path): bool
    {
        return str_contains($path, 'live-sync/') ||
            str_contains($path, 'notifications') ||
            str_contains($path, 'dashboard/data') ||
            str_contains($path, 'dashboard/stream') ||
            str_starts_with($path, 'reports/') ||
            str_contains($path, 'advertising/reports') ||
            str_contains($path, 'advertising/activities');
    }

    /**
     * Determine whether a path is always critical high-priority traffic.
     */
    protected function isHighPriorityPath(string $path): bool
    {
        return str_contains($path, 'login') ||
            str_contains($path, 'logout') ||
            str_contains($path, 'auth/') ||
            str_contains($path, 'session/');
    }

    /**
     * Get the configured active high-request threshold for load shedding.
     */
    public function getHighConcurrencyThreshold(): int
    {
        return max(1, (int) config('core.request_priority.high_concurrency_threshold', self::DEFAULT_HIGH_CONCURRENCY_THRESHOLD));
    }

    /**
     * Get the Retry-After duration (seconds) returned when shedding low-priority load.
     */
    public function getRetryAfterSeconds(): int
    {
        return max(1, (int) config('core.request_priority.retry_after_seconds', self::DEFAULT_RETRY_AFTER_SECONDS));
    }

    /**
     * Get the per-minute rate limit for a priority tier.
     */
    public function getRateLimitForPriority(string $priority): int
    {
        $defaults = [
            self::PRIORITY_HIGH => 180,
            self::PRIORITY_NORMAL => 120,
            self::PRIORITY_LOW => 60,
        ];

        return max(10, (int) config("core.request_priority.rate_limits.{$priority}", $defaults[$priority] ?? 120));
    }

    /**
     * Get the current count of in-flight high-priority requests.
     */
    public function getActiveHighCount(): int
    {
        return max(0, (int) Cache::get(self::ACTIVE_HIGH_CACHE_KEY, 0));
    }

    /**
     * Increment the active high-priority concurrency counter with a safety TTL.
     */
    public function acquireHighSlot(): int
    {
        $current = $this->getActiveHighCount() + 1;
        Cache::put(self::ACTIVE_HIGH_CACHE_KEY, $current, now()->addSeconds(30));

        return $current;
    }

    /**
     * Decrement the active high-priority concurrency counter safely (never below 0).
     */
    public function releaseHighSlot(): int
    {
        $next = max(0, $this->getActiveHighCount() - 1);
        if ($next === 0) {
            Cache::forget(self::ACTIVE_HIGH_CACHE_KEY);
        } else {
            Cache::put(self::ACTIVE_HIGH_CACHE_KEY, $next, now()->addSeconds(30));
        }

        return $next;
    }

    /**
     * Check whether incoming low-priority traffic should be shed right now.
     */
    public function shouldShedLowPriority(): bool
    {
        return $this->getActiveHighCount() >= $this->getHighConcurrencyThreshold();
    }

    /**
     * Reset the active high-priority counter (primarily for tests/diagnostics).
     */
    public function resetActiveHighCount(): void
    {
        Cache::forget(self::ACTIVE_HIGH_CACHE_KEY);
    }
}
