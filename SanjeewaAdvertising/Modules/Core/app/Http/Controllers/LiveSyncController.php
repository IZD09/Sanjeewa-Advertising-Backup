<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Services\LiveSyncService;

class LiveSyncController extends BaseApiController
{
    public function __construct(
        protected LiveSyncService $liveSyncService
    ) {}

    /**
     * Return lightweight per-channel version numbers from cache for live client synchronization.
     */
    public function versions(Request $request): JsonResponse
    {
        $rawChannels = $request->query('channels');
        $channels = null;

        if (is_string($rawChannels) && trim($rawChannels) !== '') {
            $channels = array_values(array_filter(array_map('trim', explode(',', $rawChannels))));
        } elseif (is_array($rawChannels)) {
            $channels = array_values(array_filter(array_map('strval', $rawChannels)));
        }

        return $this->success([
            'versions' => $this->liveSyncService->getVersions($channels),
            'server_time' => now()->timestamp,
        ], 'Live sync versions retrieved.');
    }
}
