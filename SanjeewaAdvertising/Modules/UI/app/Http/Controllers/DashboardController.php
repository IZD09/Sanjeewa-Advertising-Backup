<?php

namespace Modules\UI\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\UI\Http\Requests\DashboardRequest;
use Modules\UI\Services\DashboardService;
use Modules\UI\Transformers\DashboardResource;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends BaseApiController
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Display the main interactive dashboard view with initial backend data.
     */
    public function index(): View
    {
        $dashboardData = (new DashboardResource($this->dashboardService->getDashboardData()))->resolve();

        return view('ui::layouts.pages.dashboard.dashboard', [
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Retrieve dashboard metrics as a single JSON response matching the required schema.
     */
    public function data(DashboardRequest $request): JsonResponse
    {
        $data = $this->dashboardService->getDashboardData($request->validated());

        return response()->json(
            new DashboardResource($data)
        );
    }

    /**
     * Stream real-time dashboard data using Server-Sent Events (SSE).
     * Dispatches updates once every 1 minute (60 seconds) by default.
     */
    public function stream(DashboardRequest $request): StreamedResponse
    {
        $response = new StreamedResponse(function () use ($request) {
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

            // Instruct EventSource client to retry automatically after 5 seconds on disconnect
            $retryMs = (int) $request->input('retry', 5000);
            $retryMs = max(3000, min(60000, $retryMs));
            echo "retry: {$retryMs}\n\n";
            flush();

            // Send initial immediate payload upon connection
            $rawData = $this->dashboardService->getDashboardData($request->validated());
            $resourceData = (new DashboardResource($rawData))->resolve();
            echo $this->dashboardService->formatEventStreamMessage($resourceData);
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

                $rawData = $this->dashboardService->getDashboardData($request->validated());
                $resourceData = (new DashboardResource($rawData))->resolve();
                echo $this->dashboardService->formatEventStreamMessage($resourceData);
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
