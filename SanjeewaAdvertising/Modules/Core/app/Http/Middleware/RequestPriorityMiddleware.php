<?php

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Modules\Core\Services\RequestPriorityService;
use Symfony\Component\HttpFoundation\Response;

class RequestPriorityMiddleware
{
    public function __construct(
        protected RequestPriorityService $priorityService
    ) {}

    /**
     * Enforce server-side request prioritization, tiered rate limiting,
     * and automatic load shedding for low-priority traffic under high load.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldManageRequest($request)) {
            return $next($request);
        }

        $priority = $this->priorityService->classify($request);
        $request->attributes->set('request_priority', $priority);

        // 1. Enterprise Load Shedding: protect critical writes when server is busy
        if ($priority === RequestPriorityService::PRIORITY_LOW && $this->priorityService->shouldShedLowPriority()) {
            $retryAfter = $this->priorityService->getRetryAfterSeconds();

            return response()->json([
                'success' => false,
                'message' => 'Server is prioritizing critical transactions. Retrying shortly.',
                'retry_after' => $retryAfter,
                'priority' => $priority,
            ], 503, [
                'Retry-After' => (string) $retryAfter,
                'X-Request-Priority' => $priority,
                'X-Load-Shed' => '1',
            ]);
        }

        // 2. Tiered Per-User / Per-IP Rate Limiting (isolated per priority tier)
        $limiterKey = $this->buildRateLimiterKey($request, $priority);
        $maxAttempts = $this->priorityService->getRateLimitForPriority($priority);

        if (RateLimiter::tooManyAttempts($limiterKey, $maxAttempts)) {
            $retryAfter = max(1, RateLimiter::availableIn($limiterKey));

            return response()->json([
                'success' => false,
                'message' => 'Too many requests for this priority tier. Please wait a moment.',
                'retry_after' => $retryAfter,
                'priority' => $priority,
            ], 429, [
                'Retry-After' => (string) $retryAfter,
                'X-Request-Priority' => $priority,
                'X-RateLimit-Limit' => (string) $maxAttempts,
                'X-RateLimit-Remaining' => '0',
            ]);
        }

        RateLimiter::hit($limiterKey, 60);

        // 3. Track in-flight HIGH priority requests so LOW requests shed automatically if busy
        $acquiredHighSlot = false;
        if ($priority === RequestPriorityService::PRIORITY_HIGH) {
            $this->priorityService->acquireHighSlot();
            $acquiredHighSlot = true;
        }

        try {
            $response = $next($request);
        } finally {
            if ($acquiredHighSlot) {
                $this->priorityService->releaseHighSlot();
            }
        }

        $response->headers->set('X-Request-Priority', $priority);

        return $response;
    }

    /**
     * Only apply priority queuing/throttling to API, AJAX, report, and dashboard data requests
     * so standard HTML page loads are never throttled.
     */
    protected function shouldManageRequest(Request $request): bool
    {
        return $request->is('advertising/*') ||
            $request->is('dashboard/data') ||
            $request->is('reports/data') ||
            $request->is('reports/kpis') ||
            $request->is('reports/table/*') ||
            $request->ajax() ||
            $request->expectsJson();
    }

    /**
     * Build an isolated rate-limiter key per user/IP and priority tier.
     */
    protected function buildRateLimiterKey(Request $request, string $priority): string
    {
        $actor = $request->user('admin')?->getAuthIdentifier()
            ?? $request->user('web')?->getAuthIdentifier()
            ?? $request->ip()
            ?? 'guest';

        return "req_priority:{$priority}:{$actor}";
    }
}
