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
     * Display the main interactive dashboard view.
     */
    public function index(): View
    {
        return view('ui::layouts.pages.dashboard.dashboard');
    }

    /**
     * Retrieve dashboard metrics as a single JSON response.
     */
    public function data(DashboardRequest $request): JsonResponse
    {
        $data = $this->dashboardService->getDashboardData($request->validated());

        return $this->success(
            new DashboardResource($data),
            'Dashboard data retrieved successfully.'
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

            // Flush any existing output buffering outside testing
            if (! app()->environment('testing')) {
                while (ob_get_level() > 0) {
                    ob_end_flush();
                }
            }

            // Stream interval: default 60 seconds (1 minute)
            $interval = (int) $request->input('stream_interval', 60);
            $interval = max(5, min(300, $interval));

            // Instruct EventSource client to retry after 5 seconds on disconnect
            echo "retry: 5000\n\n";
            flush();

            // Send initial immediate payload upon connection
            $data = $this->dashboardService->getDashboardData($request->validated());
            echo $this->dashboardService->formatEventStreamMessage($data);
            flush();

            // Exit early if running in automated test suite or requested once
            if (app()->runningUnitTests() || app()->environment('testing') || $request->boolean('once')) {
                return;
            }

            $maxCycles = 120; // 120 cycles * 60 seconds = 2 hours max continuous stream
            $cycle = 0;

            while (! connection_aborted() && $cycle < $maxCycles) {
                // Sleep for 1 minute (60 seconds)
                sleep($interval);

                if (connection_aborted()) {
                    break;
                }

                $data = $this->dashboardService->getDashboardData($request->validated());
                echo $this->dashboardService->formatEventStreamMessage($data);
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
