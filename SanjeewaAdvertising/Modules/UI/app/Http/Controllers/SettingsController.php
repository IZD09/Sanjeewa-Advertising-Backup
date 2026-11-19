<?php

namespace Modules\UI\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Http\Controllers\BaseApiController;

class SettingsController extends BaseApiController
{
    /**
     * Determine whether the current authenticated actor is an administrator.
     */
    protected function isAdministrator(): bool
    {
        if (Auth::guard('admin')->check()) {
            return true;
        }

        $webUser = Auth::guard('web')->user();

        return $webUser && ($webUser->username ?? null) === 'admin';
    }

    /**
     * Retrieve merged application settings statically for Blade layouts and components.
     *
     * @return array<string, mixed>
     */
    public static function getAppSettings(): array
    {
        $defaults = [
            'shop_name' => 'Visual Line Advertising',
            'shop_address' => 'No. 42 Main Street, Colombo 03, Sri Lanka',
            'shop_phone' => '+94 11 234 5678',
            'currency_symbol' => 'Rs.',
            'logo_url' => '/uploads/branding/visual_line_advertising_logo.png',
            'logo_icon' => 'fa-solid fa-print',
            'theme_mode' => 'light',
            'theme_color' => '#2563eb',
        ];

        $filePath = storage_path('app/settings.json');
        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            if ($content !== false) {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    return array_merge($defaults, $decoded);
                }
            }
        }

        return $defaults;
    }

    /**
     * Build a favicon href (uploaded logo URL or SVG data URI matching logo_icon & theme_color).
     *
     * @param  array<string, mixed>|null  $settings
     */
    public static function getFaviconHref(?array $settings = null): string
    {
        $settings = $settings ?? self::getAppSettings();

        if (! empty($settings['logo_url'])) {
            return (string) $settings['logo_url'];
        }

        $bg = preg_match('/^#[0-9A-Fa-f]{6}$/', (string) ($settings['theme_color'] ?? ''))
            ? $settings['theme_color']
            : '#2563eb';

        $icon = (string) ($settings['logo_icon'] ?? 'fa-solid fa-print');
        $paths = match ($icon) {
            'fa-solid fa-store' => '<path d="M3 9l1-4h16l1 4M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M9 20v-6h6v6"/>',
            'fa-solid fa-palette' => '<path d="M12 3a9 9 0 100 18 1.5 1.5 0 001.5-1.5c0-.4-.1-.8-.4-1.1-.3-.3-.4-.6-.4-1a1.5 1.5 0 011.5-1.5H16a5 5 0 005-5c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
            'fa-solid fa-wand-magic-sparkles' => '<path d="M15 4l5 5L8 21l-5-5L15 4zM12 7l5 5M5 3v4M3 5h4M19 15v4M17 17h4"/>',
            'fa-solid fa-layer-group' => '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>',
            'fa-solid fa-bullhorn' => '<path d="M3 11v2a1 1 0 001 1h2l4 5h2l-2-5h5l5 3V7l-5 3H4a1 1 0 00-1 1z"/>',
            'fa-solid fa-brush' => '<path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08M7 15a4 4 0 00-4 4c0 1.1-.9 2-2 2 1.5 1.5 4 2 6 2a4 4 0 000-8z"/>',
            'fa-solid fa-shapes' => '<polygon points="12 3 19 14 5 14 12 3"/><circle cx="17" cy="18" r="3"/><rect x="4" y="16" width="6" height="5" rx="1"/>',
            default => '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        };

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
            . '<rect width="32" height="32" rx="8" fill="' . $bg . '"/>'
            . '<g transform="translate(4,4)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            . $paths
            . '</g></svg>';

        return 'data:image/svg+xml,' . rawurlencode($svg);
    }

    /**
     * Storage path for application settings file.
     */
    protected function getSettingsFilePath(): string
    {
        return storage_path('app/settings.json');
    }

    /**
     * Retrieve default shop preferences and configuration.
     *
     * @return array<string, mixed>
     */
    protected function getDefaultSettings(): array
    {
        return [
            'shop_name' => 'Visual Line Advertising',
            'shop_address' => 'No. 42 Main Street, Colombo 03, Sri Lanka',
            'shop_phone' => '+94 11 234 5678',
            'currency_symbol' => 'Rs.',
            'logo_url' => '/uploads/branding/visual_line_advertising_logo.png',
            'logo_icon' => 'fa-solid fa-print',
            'theme_mode' => 'light',
            'theme_color' => '#2563eb',
        ];
    }

    /**
     * Load current settings merged with default fallbacks.
     *
     * @return array<string, mixed>
     */
    protected function loadSettings(): array
    {
        $filePath = $this->getSettingsFilePath();
        $defaults = $this->getDefaultSettings();

        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            if ($content !== false) {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    return array_merge($defaults, $decoded);
                }
            }
        }

        return $defaults;
    }

    /**
     * Persist settings to JSON file.
     *
     * @param  array<string, mixed>  $settings
     */
    protected function saveSettings(array $settings): bool
    {
        $filePath = $this->getSettingsFilePath();
        $directory = dirname($filePath);

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        return file_put_contents($filePath, json_encode($settings, JSON_PRETTY_PRINT)) !== false;
    }

    /**
     * Display the System Preferences & Shop Config view.
     */
    public function index(): View
    {
        $settings = $this->loadSettings();

        return view('ui::layouts.pages.settings.settings', [
            'settings' => $settings,
            'isAdmin' => $this->isAdministrator(),
        ]);
    }

    /**
     * Retrieve settings as a JSON response.
     */
    public function getSettings(): JsonResponse
    {
        $settings = $this->loadSettings();

        return $this->success($settings, 'Settings retrieved successfully.');
    }

    /**
     * Update system preferences and shop configuration.
     */
    public function update(Request $request): JsonResponse|RedirectResponse
    {
        $isAdmin = $this->isAdministrator();

        $rules = [
            'theme_mode' => 'nullable|string|in:light,dark,auto',
            'theme_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
        ];

        if ($isAdmin) {
            $rules = array_merge($rules, [
                'shop_name' => 'required|string|max:120',
                'shop_address' => 'required|string|max:255',
                'shop_phone' => 'required|string|max:50',
                'currency_symbol' => 'required|string|max:30',
                'logo_icon' => 'nullable|string|max:50',
                'logo_url' => 'nullable|string|max:500',
                'remove_logo' => 'nullable|boolean',
                'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            ]);
        }

        $validated = $request->validate($rules);

        $settings = $this->loadSettings();

        if ($isAdmin) {
            $settings['shop_name'] = trim($validated['shop_name']);
            $settings['shop_address'] = trim($validated['shop_address']);
            $settings['shop_phone'] = trim($validated['shop_phone']);
            $settings['currency_symbol'] = trim($validated['currency_symbol']);
            $settings['logo_icon'] = ! empty($validated['logo_icon']) ? trim($validated['logo_icon']) : 'fa-solid fa-print';

            if ($request->hasFile('logo_file')) {
                $file = $request->file('logo_file');
                $filename = 'shop_logo_' . time() . '.' . $file->getClientOriginalExtension();
                $destinationPath = public_path('uploads/branding');

                if (! is_dir($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }

                $file->move($destinationPath, $filename);
                $settings['logo_url'] = '/uploads/branding/' . $filename;
            } elseif ($request->boolean('remove_logo')) {
                $settings['logo_url'] = null;
            } elseif ($request->filled('logo_url')) {
                $settings['logo_url'] = $request->input('logo_url');
            }
        }

        $settings['theme_mode'] = ! empty($validated['theme_mode']) ? $validated['theme_mode'] : 'light';
        $settings['theme_color'] = ! empty($validated['theme_color']) ? strtolower($validated['theme_color']) : '#2563eb';

        $this->saveSettings($settings);

        if ($request->wantsJson() || $request->ajax()) {
            return $this->success($settings, 'System preferences and shop config saved successfully.');
        }

        return redirect()->route('ui.settings')->with('success', 'System preferences and shop config saved successfully.');
    }
}
