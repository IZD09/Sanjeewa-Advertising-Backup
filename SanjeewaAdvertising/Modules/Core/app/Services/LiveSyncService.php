<?php

namespace Modules\Core\Services;

use Illuminate\Support\Facades\Cache;

class LiveSyncService
{
    public const CACHE_KEY = 'sanjeewa:live_sync:versions';

    /**
     * All supported live-sync channels across the application.
     *
     * @var list<string>
     */
    public const CHANNELS = [
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
    ];

    /**
     * Operational channels that automatically invalidate dashboard & reports views.
     *
     * @var list<string>
     */
    protected const DASHBOARD_TRIGGERS = [
        'orders',
        'print_jobs',
        'payments',
        'inventory',
        'grn',
        'customers',
        'hr',
    ];

    /**
     * Bump version numbers for one or more channels.
     *
     * @param  string|list<string>  $channels
     * @return array<string, int>
     */
    public function bump(string|array $channels): array
    {
        $channelList = is_array($channels) ? $channels : [$channels];
        $normalized = array_values(array_unique(array_filter(
            array_map(static fn (string $c): string => strtolower(trim($c)), $channelList),
            static fn (string $c): bool => in_array($c, self::CHANNELS, true)
        )));

        if ($normalized === []) {
            return $this->getVersions();
        }

        if (array_intersect($normalized, self::DASHBOARD_TRIGGERS) !== []) {
            if (! in_array('dashboard', $normalized, true)) {
                $normalized[] = 'dashboard';
            }
            if (! in_array('reports', $normalized, true)) {
                $normalized[] = 'reports';
            }
        }

        $versions = $this->readVersionMap();
        $nowMs = (int) round(microtime(true) * 1000);

        foreach ($normalized as $channel) {
            $current = (int) ($versions[$channel] ?? 0);
            $versions[$channel] = max($nowMs, $current + 1);
        }

        Cache::forever(self::CACHE_KEY, $versions);

        // Invalidate shared dashboard snapshot cache immediately when dashboard channel bumps
        if (in_array('dashboard', $normalized, true)) {
            Cache::forget('ui:dashboard:shared_snapshot');
        }

        return $versions;
    }

    /**
     * Retrieve current version numbers for all or selected channels.
     *
     * @param  list<string>|null  $channels
     * @return array<string, int>
     */
    public function getVersions(?array $channels = null): array
    {
        $versions = $this->readVersionMap();

        if ($channels === null || $channels === []) {
            return $versions;
        }

        $filtered = [];
        foreach ($channels as $channel) {
            $key = strtolower(trim($channel));
            if (in_array($key, self::CHANNELS, true)) {
                $filtered[$key] = (int) ($versions[$key] ?? 1);
            }
        }

        return $filtered;
    }

    /**
     * Map a mutated request path to the affected live-sync channels.
     *
     * @return list<string>
     */
    public function resolveChannelsForPath(string $path): array
    {
        $clean = strtolower(trim($path, '/'));

        if (
            str_contains($clean, 'login') ||
            str_contains($clean, 'logout') ||
            str_contains($clean, 'session/') ||
            str_contains($clean, 'live-sync') ||
            str_contains($clean, 'notifications')
        ) {
            return [];
        }

        $channels = [];

        if (str_contains($clean, 'print-job') || str_contains($clean, 'printjob') || str_contains($clean, 'place-order')) {
            $channels[] = 'orders';
            $channels[] = 'print_jobs';
        }

        if (
            str_contains($clean, 'payment') ||
            str_contains($clean, 'invoice') ||
            str_contains($clean, 'expense') ||
            str_contains($clean, 'bill')
        ) {
            $channels[] = 'payments';
            $channels[] = 'orders';
            $channels[] = 'grn';
        }

        if (
            str_contains($clean, 'stock') ||
            str_contains($clean, 'inventory') ||
            str_contains($clean, 'categor') ||
            str_contains($clean, 'brand')
        ) {
            $channels[] = 'inventory';
            $channels[] = 'print_jobs';
        }

        if (
            str_contains($clean, 'grn') ||
            str_contains($clean, 'purchase-order') ||
            str_contains($clean, 'supplier')
        ) {
            $channels[] = 'grn';
            $channels[] = 'inventory';
            $channels[] = 'payments';
        }

        if (str_contains($clean, 'customer')) {
            $channels[] = 'customers';
            $channels[] = 'orders';
        }

        if (
            str_contains($clean, 'hr') ||
            str_contains($clean, 'attendance') ||
            str_contains($clean, 'salary') ||
            str_contains($clean, 'payroll') ||
            str_contains($clean, 'employee')
        ) {
            $channels[] = 'hr';
        }

        if (str_contains($clean, 'user') || str_contains($clean, 'role') || str_contains($clean, 'permission')) {
            $channels[] = 'users';
        }

        return array_values(array_unique($channels));
    }

    /**
     * Read the full channel version map from cache, initializing defaults if absent.
     *
     * @return array<string, int>
     */
    protected function readVersionMap(): array
    {
        $stored = Cache::get(self::CACHE_KEY);
        if (! is_array($stored)) {
            $stored = [];
        }

        $map = [];
        foreach (self::CHANNELS as $channel) {
            $map[$channel] = isset($stored[$channel]) ? (int) $stored[$channel] : 1;
        }

        return $map;
    }
}
