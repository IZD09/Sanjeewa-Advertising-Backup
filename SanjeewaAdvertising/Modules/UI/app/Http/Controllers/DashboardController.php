<?php

namespace Modules\UI\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\UI\Http\Requests\DashboardRequest;
use Modules\UI\Services\DashboardService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends BaseApiController
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {
    }

    /**
     * Display the main interactive dashboard view with initial shared backend data.
     */
    public function index(): View
    {
        $snapshot = $this->dashboardService->getSharedDashboardSnapshot();

        return view('ui::layouts.admin.pages.dashboard.dashboard', [
            'dashboardData' => $snapshot['data'],
        ]);
    }

    /**
     * Retrieve shared dashboard metrics as a single JSON response matching the required schema.
     */
    public function data(DashboardRequest $request): JsonResponse|Response
    {
        $validated = $request->validated();
        $forceRefresh = $request->boolean('refresh');
        $snapshot = $this->dashboardService->getSharedDashboardSnapshot($validated, $forceRefresh);

        return response($snapshot['json'], 200, [
            'Content-Type' => 'application/json',
            'ETag' => '"' . $snapshot['hash'] . '"',
        ]);
    }

    /**
     * Stream shared real-time dashboard data using Server-Sent Events (SSE).
     * Serves the identical cached snapshot to all connected Users and Admins to minimize server load.
     */
    public function stream(DashboardRequest $request): StreamedResponse
    {
        $validated = $request->validated();
        $forceRefresh = $request->boolean('refresh');
        $lastEventId = $request->header('Last-Event-ID');

        $response = new StreamedResponse(function () use ($request, $validated, $forceRefresh, $lastEventId) {
            // Prevent PHP execution timeout for long-running streaming
            if (! app()->runningUnitTests()) {
                @set_time_limit(0);
            }

            // Release session lock so concurrent requests from this user aren't blocked
            if (session_status() === PHP_SESSION_ACTIVE) {
                session_write_close();
            }

            // Flush any existing output buffering outside testing
            if (! app()->environment('testing')) {
                while (ob_get_level() > 0) {
                    ob_end_flush();
                }
            }

            // Instruct EventSource client to retry automatically after configured ms on disconnect
            $retryMs = (int) $request->input('retry', 5000);
            $retryMs = max(3000, min(60000, $retryMs));
            echo "retry: {$retryMs}\n\n";
            flush();

            // Send initial shared payload upon connection (skip full JSON if client already has current hash)
            $snapshot = $this->dashboardService->getSharedDashboardSnapshot($validated, $forceRefresh);
            $lastSentHash = $lastEventId;

            if ($lastSentHash !== null && $lastSentHash === $snapshot['hash']) {
                echo ": unchanged\n\n";
            } else {
                echo "id: {$snapshot['hash']}\nevent: message\ndata: {$snapshot['json']}\n\n";
                $lastSentHash = $snapshot['hash'];
            }
            flush();

            // Only enter continuous blocking loop if explicitly requested (e.g. continuous=1) and not in testing.
            // On standard development servers (single-process php artisan serve), completing each burst
            // allows the browser's native EventSource to auto-reconnect via retry without monopolizing the single server worker.
            if (! $request->boolean('continuous') || app()->runningUnitTests() || app()->environment('testing') || $request->boolean('once')) {
                return;
            }

            $interval = (int) $request->input('stream_interval', 15);
            $interval = max(5, min(300, $interval));
            $maxCycles = 120; // 120 cycles max continuous stream
            $cycle = 0;

            while (! connection_aborted() && $cycle < $maxCycles) {
                // Sleep in 1-second increments so client disconnect is detected immediately
                for ($s = 0; $s < $interval; $s++) {
                    if (connection_aborted()) {
                        break 2;
                    }
                    sleep(1);
                }

                if (connection_aborted()) {
                    break;
                }

                $snapshot = $this->dashboardService->getSharedDashboardSnapshot($validated);
                if ($lastSentHash !== $snapshot['hash']) {
                    echo "id: {$snapshot['hash']}\nevent: message\ndata: {$snapshot['json']}\n\n";
                    $lastSentHash = $snapshot['hash'];
                } else {
                    echo ": heartbeat\n\n";
                }
                flush();

                $cycle++;
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache, no-transform');
        $response->headers->set('Connection', 'keep-alive');
        $response->headers->set('X-Accel-Buffering', 'no');

        return $response;
    }
}
