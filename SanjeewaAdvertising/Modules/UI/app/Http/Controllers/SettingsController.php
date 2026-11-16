<?php

namespace Modules\UI\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;

class SettingsController extends BaseApiController
{
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
            'shop_name' => 'Sanjeewa Advertising & Printing',
            'shop_address' => 'No. 42 Main Street, Colombo 03, Sri Lanka',
            'shop_phone' => '+94 11 234 5678',
            'currency_symbol' => 'Rs.',
            'logo_url' => null,
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
        $validated = $request->validate([
            'shop_name' => 'required|string|max:120',
            'shop_address' => 'required|string|max:255',
            'shop_phone' => 'required|string|max:50',
            'currency_symbol' => 'required|string|max:30',
            'logo_icon' => 'nullable|string|max:50',
            'logo_url' => 'nullable|string|max:500',
            'remove_logo' => 'nullable|boolean',
            'theme_mode' => 'nullable|string|in:light,dark,auto',
            'theme_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $settings = $this->loadSettings();

        $settings['shop_name'] = trim($validated['shop_name']);
        $settings['shop_address'] = trim($validated['shop_address']);
        $settings['shop_phone'] = trim($validated['shop_phone']);
        $settings['currency_symbol'] = trim($validated['currency_symbol']);
        $settings['logo_icon'] = ! empty($validated['logo_icon']) ? trim($validated['logo_icon']) : 'fa-solid fa-print';
        $settings['theme_mode'] = ! empty($validated['theme_mode']) ? $validated['theme_mode'] : 'light';
        $settings['theme_color'] = ! empty($validated['theme_color']) ? strtolower($validated['theme_color']) : '#2563eb';

        if ($request->hasFile('logo_file')) {
            $file = $request->file('logo_file');
            $filename = 'shop_logo_'.time().'.'.$file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/branding');

            if (! is_dir($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);
            $settings['logo_url'] = '/uploads/branding/'.$filename;
        } elseif ($request->boolean('remove_logo')) {
            $settings['logo_url'] = null;
        } elseif ($request->filled('logo_url')) {
            $settings['logo_url'] = $request->input('logo_url');
        }

        $this->saveSettings($settings);

        if ($request->wantsJson() || $request->ajax()) {
            return $this->success($settings, 'System preferences and shop config saved successfully.');
        }

        return redirect()->route('ui.settings')->with('success', 'System preferences and shop config saved successfully.');
    }
}

