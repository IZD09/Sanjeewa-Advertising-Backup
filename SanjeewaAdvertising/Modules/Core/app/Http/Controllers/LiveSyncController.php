<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Modules\Core\Services\LiveSyncService;

class LiveSyncController extends BaseApiController
{
    public function __construct(
        protected LiveSyncService $liveSyncService
    ) {}

    /**
     * Return lightweight per-channel version numbers from cache for live client synchronization.
     * Supports ETag / If-None-Match (304 Not Modified) and optional ?since= timestamp checks.
     */
    public function versions(Request $request): JsonResponse|Response
    {
        $rawChannels = $request->query('channels');
        $channels = null;

        if (is_string($rawChannels) && trim($rawChannels) !== '' && strtolower(trim($rawChannels)) !== 'all') {
            $channels = array_values(array_filter(array_map('trim', explode(',', $rawChannels))));
        } elseif (is_array($rawChannels)) {
            $channels = array_values(array_filter(array_map('strval', $rawChannels)));
        }

        $versions = $this->liveSyncService->getVersions($channels);
        $etag = '"ls-'.md5((string) json_encode($versions)).'"';

        $clientEtag = trim((string) $request->header('If-None-Match', ''));
        if ($clientEtag !== '' && $clientEtag === $etag) {
            return response('', 304, [
                'ETag' => $etag,
                'Cache-Control' => 'no-cache, private',
            ]);
        }

        $since = $request->query('since');
        $hasUpdates = true;
        $changed = [];

        if ($since !== null && is_numeric($since)) {
            $sinceVersion = (int) $since;
            foreach ($versions as $channel => $version) {
                if ((int) $version > $sinceVersion) {
                    $changed[] = $channel;
                }
            }
            $hasUpdates = $changed !== [];
        }

        $response = $this->success([
            'has_updates' => $hasUpdates,
            'changed' => $changed,
            'versions' => $versions,
            'server_time' => now()->timestamp,
        ], $hasUpdates ? 'Live sync updates available.' : 'No live sync updates.');

        return $response
            ->header('ETag', $etag)
            ->header('Cache-Control', 'no-cache, private');
    }
}
