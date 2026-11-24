<?php

namespace Modules\Core\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Modules\Core\Services\LiveSyncService;
use Symfony\Component\HttpFoundation\Response;

class BroadcastLiveSyncVersion
{
    public function __construct(
        protected LiveSyncService $liveSyncService
    ) {}

    /**
     * Automatically bump live-sync channel versions after any successful mutating request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $response;
        }

        $status = $response->getStatusCode();
        if ($status < 200 || $status >= 300) {
            return $response;
        }

        $channels = $this->liveSyncService->resolveChannelsForPath($request->path());
        if ($channels === []) {
            return $response;
        }

        $this->liveSyncService->bump($channels);
        $response->headers->set('X-Live-Sync-Channels', implode(',', $channels));

        return $response;
    }
}
