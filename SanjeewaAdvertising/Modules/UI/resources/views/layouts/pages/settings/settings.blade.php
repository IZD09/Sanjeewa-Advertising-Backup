@php
    $isAdmin = $isAdmin ?? (auth('admin')->check() || (auth('web')->check() && (auth('web')->user()->username ?? null) === 'admin'));
@endphp
@extends('ui::layouts.master')

@section('title', 'System Preferences & Shop Config')
@section('page_title', $isAdmin ? 'System Preferences & Shop Config' : 'Appearance & Theme Settings')
@section('breadcrumb')Workspace / Management / <span>Settings</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/modules.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/place-order.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/settings.css') }}
@endpush

@section('content')

    <div class="app-layout app" id="app">

        @include('ui::components.sidebar')

        <!-- Sidebar Backdrop Overlay -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <main class="main-area" id="mainArea">

            @include('ui::components.topbar')

            <!-- Dynamic Main Content Viewport -->
            <div class="main-content-viewport" id="mainContentViewport">

                <div class="app-module" id="module-settings" data-module="settings" data-is-admin="{{ $isAdmin ? '1' : '0' }}">
                    <div class="settings-container">

                        <!-- Header Banner -->
                        <div class="settings-header-banner">
                            <div class="settings-header-content">
                                <div class="settings-header-icon">
                                    <i class="fa-solid fa-gear"></i>
                                </div>
                                <div class="settings-header-text">
                                    <h2>{{ $isAdmin ? 'System Preferences & Shop Config' : 'Color Theme & System Appearance' }}</h2>
                                    <p>{{ $isAdmin ? 'Configure company profile, contact details, currency symbol, logo branding, and visual color theme.' : 'Customize your interface theme mode (Light/Dark) and brand accent color with live workspace preview.' }}</p>
                                </div>
                            </div>
                            <div class="settings-header-actions">
                                <button type="button" class="po-btn po-btn-secondary" id="btnResetSettingsTop">
                                    <i class="fa-solid fa-rotate-left"></i> Reset Defaults
                                </button>
                                <button type="button" class="po-btn po-btn-primary" id="btnSaveSettingsTop">
                                    <i class="fa-solid fa-floppy-disk"></i> Save Preferences
                                </button>
                            </div>
                        </div>

                        <!-- 2-Column Responsive Grid -->
                        <div class="settings-grid-layout">

                            <!-- Left Column: Live Identity Preview Card -->
                            <aside class="settings-preview-card">
                                <div class="preview-card-header">
                                    <div class="preview-card-title">
                                        <i class="fa-solid fa-eye" style="color: var(--blue, #2563eb);"></i>
                                        <span>Live Identity Preview</span>
                                    </div>
                                    <span class="live-badge">
                                        <span class="live-dot"></span> Live
                                    </span>
                                </div>

                                <!-- Mock Business Identity Card -->
                                <div class="mock-identity-card" id="mockIdentityCard">
                                    <div class="mock-identity-top">
                                        <div class="mock-logo-box" id="mockLogoBox">
                                            @if(!empty($settings['logo_url']))
                                                <img src="{{ $settings['logo_url'] }}" alt="Logo" id="mockLogoImg">
                                            @else
                                                <i class="{{ $settings['logo_icon'] ?? 'fa-solid fa-print' }}" id="mockLogoIcon"></i>
                                            @endif
                                        </div>
                                        <div class="mock-brand-info">
                                            <h3 class="mock-shop-name" id="mockShopName">{{ $settings['shop_name'] ?? 'Visual Line Advertising' }}</h3>
                                            <p class="mock-shop-sub">Advertising & Digital Printing</p>
                                        </div>
                                    </div>

                                    <div class="mock-contact-list">
                                        <div class="mock-contact-item">
                                            <i class="fa-solid fa-location-dot"></i>
                                            <span id="mockAddress">{{ $settings['shop_address'] ?? 'No. 42 Main Street, Colombo 03, Sri Lanka' }}</span>
                                        </div>
                                        <div class="mock-contact-item">
                                            <i class="fa-solid fa-phone"></i>
                                            <span id="mockPhone">{{ $settings['shop_phone'] ?? '+94 11 234 5678' }}</span>
                                        </div>
                                    </div>

                                    <!-- Sample Transaction Preview -->
                                    <div class="mock-sample-receipt">
                                        <div class="mock-receipt-header">
                                            <span>Receipt Sample</span>
                                            <span>INV-2026-0042</span>
                                        </div>
                                        <div class="mock-receipt-item">
                                            <span>Outdoor Flex Banner (10×4 ft)</span>
                                            <span class="price-val"><strong class="preview-currency-sym">{{ $settings['currency_symbol'] ?? 'Rs.' }}</strong> 3,500.00</span>
                                        </div>
                                        <div class="mock-receipt-total">
                                            <span>Total Amount:</span>
                                            <span class="amount"><strong class="preview-currency-sym">{{ $settings['currency_symbol'] ?? 'Rs.' }}</strong> 3,500.00</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Theme Preview Status -->
                                <div class="preview-theme-status">
                                    <span>Active Color Theme:</span>
                                    <span class="theme-pill-chip">
                                        <span class="theme-color-dot" id="previewColorDot" style="background: {{ $settings['theme_color'] ?? '#2563eb' }};"></span>
                                        <span id="previewColorHex">{{ strtoupper($settings['theme_color'] ?? '#2563eb') }}</span>
                                    </span>
                                </div>

                                <div class="settings-info-note">
                                    <i class="fa-solid fa-circle-info"></i>
                                    Preferences saved here synchronize with the sidebar brand, invoice receipts, print layouts, and overall interface color palette.
                                </div>
                            </aside>

                            <!-- Right Column: Settings Configuration Form -->
                            <form id="settingsForm" class="settings-form-column" method="POST" action="{{ route('ui.settings.update') }}" enctype="multipart/form-data">
                                @csrf

                                @if($isAdmin)
                                <!-- 1. Shop Identity & Contacts -->
                                <div class="settings-card">
                                    <div class="settings-card-header">
                                        <div class="settings-card-icon">
                                            <i class="fa-solid fa-store"></i>
                                        </div>
                                        <div class="settings-card-title">
                                            <h3>Shop Profile & Contact Details</h3>
                                            <p>Manage your company title, physical branch address, hotline contact, and primary billing currency.</p>
                                        </div>
                                    </div>

                                    <!-- Shop Name -->
                                    <div class="po-field">
                                        <label for="settingShopName" class="po-label">
                                            Shop Name / Company Title <span class="required">*</span>
                                        </label>
                                        <div class="po-input-group">
                                            <i class="fa-solid fa-building"></i>
                                            <input type="text" id="settingShopName" name="shop_name" class="po-input" value="{{ $settings['shop_name'] ?? 'Visual Line Advertising' }}" placeholder="e.g. Visual Line Advertising" required autocomplete="organization">
                                        </div>
                                        <p class="po-field-hint">Displayed on topbar brand, login portal, quotation banners, and receipt headers.</p>
                                    </div>

                                    <!-- Shop Address -->
                                    <div class="po-field">
                                        <label for="settingShopAddress" class="po-label">
                                            Physical Address <span class="required">*</span>
                                        </label>
                                        <div class="po-input-group">
                                            <i class="fa-solid fa-location-dot"></i>
                                            <input type="text" id="settingShopAddress" name="shop_address" class="po-input" value="{{ $settings['shop_address'] ?? 'No. 42 Main Street, Colombo 03, Sri Lanka' }}" placeholder="e.g. No. 42 Main Street, Colombo 03, Sri Lanka" required autocomplete="street-address">
                                        </div>
                                        <p class="po-field-hint">Printed on customer receipts, invoices, and delivery purchase orders.</p>
                                    </div>

                                    <!-- Hotline & Currency Row -->
                                    <div class="po-field-row">
                                        <div class="po-field">
                                            <label for="settingShopPhone" class="po-label">
                                                Hotline Phone <span class="required">*</span>
                                            </label>
                                            <div class="po-input-group">
                                                <i class="fa-solid fa-phone"></i>
                                                <input type="tel" id="settingShopPhone" name="shop_phone" class="po-input" value="{{ $settings['shop_phone'] ?? '+94 11 234 5678' }}" placeholder="e.g. +94 11 234 5678" required autocomplete="tel">
                                            </div>
                                            <p class="po-field-hint">Primary hotline for customer inquiries.</p>
                                        </div>

                                        <div class="po-field">
                                            <label for="settingCurrencySymbol" class="po-label">
                                                Currency Symbol <span class="required">*</span>
                                            </label>
                                            <div class="po-input-group">
                                                <i class="fa-solid fa-coins"></i>
                                                <input type="text" id="settingCurrencySymbol" name="currency_symbol" class="po-input" value="{{ $settings['currency_symbol'] ?? 'Rs.' }}" placeholder="e.g. Rs." required autocomplete="off">
                                            </div>
                                            <!-- Quick Presets -->
                                            <div class="currency-presets" id="currencyPresets">
                                                <button type="button" class="currency-pill {{ ($settings['currency_symbol'] ?? 'Rs.') === 'Rs.' ? 'active' : '' }}" data-val="Rs.">Rs.</button>
                                                <button type="button" class="currency-pill {{ ($settings['currency_symbol'] ?? '') === 'LKR' ? 'active' : '' }}" data-val="LKR">LKR</button>
                                                <button type="button" class="currency-pill {{ ($settings['currency_symbol'] ?? '') === '$' ? 'active' : '' }}" data-val="$">$ (USD)</button>
                                                <button type="button" class="currency-pill {{ ($settings['currency_symbol'] ?? '') === '€' ? 'active' : '' }}" data-val="€">€ (EUR)</button>
                                                <button type="button" class="currency-pill {{ ($settings['currency_symbol'] ?? '') === '£' ? 'active' : '' }}" data-val="£">£ (GBP)</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 2. Logo & Branding -->
                                <div class="settings-card">
                                    <div class="settings-card-header">
                                        <div class="settings-card-icon">
                                            <i class="fa-solid fa-image"></i>
                                        </div>
                                        <div class="settings-card-title">
                                            <h3>Shop Logo & System Icon</h3>
                                            <p>Upload a graphical brand logo or choose a clean system iconography for application headers.</p>
                                        </div>
                                    </div>

                                    <!-- Logo Upload Area -->
                                    <div class="logo-upload-container">
                                        <div class="logo-preview-box" id="logoUploadPreviewBox">
                                            @if(!empty($settings['logo_url']))
                                                <img src="{{ $settings['logo_url'] }}" alt="Logo" id="logoUploadImg">
                                            @else
                                                <i class="{{ $settings['logo_icon'] ?? 'fa-solid fa-print' }}" id="logoUploadIcon"></i>
                                            @endif
                                        </div>
                                        <div class="logo-upload-controls">
                                            <div class="logo-action-buttons">
                                                <input type="file" id="settingLogoFile" name="logo_file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display: none;">
                                                <input type="hidden" id="removeLogoFlag" name="remove_logo" value="0">
                                                <input type="hidden" id="settingLogoUrl" name="logo_url" value="{{ $settings['logo_url'] ?? '' }}">

                                                <button type="button" class="po-btn po-btn-secondary" id="btnChooseLogo">
                                                    <i class="fa-solid fa-cloud-arrow-up"></i> Upload New Logo
                                                </button>
                                                <button type="button" class="po-btn po-btn-danger" id="btnRemoveLogo" style="{{ empty($settings['logo_url']) ? 'display: none;' : '' }}">
                                                    <i class="fa-solid fa-trash-can"></i> Remove
                                                </button>
                                            </div>
                                            <p class="po-field-hint">Supports PNG, JPG, WebP, SVG with transparent background (Max 2MB, 512×512 recommended).</p>
                                        </div>
                                    </div>

                                    <!-- Fallback Brand Icon Selection -->
                                    <div>
                                        <label class="icon-picker-label">Brand Icon (Displayed when no image logo is uploaded):</label>
                                        <input type="hidden" id="settingLogoIcon" name="logo_icon" value="{{ $settings['logo_icon'] ?? 'fa-solid fa-print' }}">
                                        <div class="icon-picker-grid" id="iconPickerGrid">
                                            @php
                                                $availableIcons = [
                                                    ['icon' => 'fa-solid fa-print', 'title' => 'Printing Press'],
                                                    ['icon' => 'fa-solid fa-store', 'title' => 'Store Front'],
                                                    ['icon' => 'fa-solid fa-palette', 'title' => 'Design & Art'],
                                                    ['icon' => 'fa-solid fa-wand-magic-sparkles', 'title' => 'Creative Magic'],
                                                    ['icon' => 'fa-solid fa-layer-group', 'title' => 'Signage & Layers'],
                                                    ['icon' => 'fa-solid fa-bullhorn', 'title' => 'Advertising'],
                                                    ['icon' => 'fa-solid fa-brush', 'title' => 'Graphics & Craft'],
                                                    ['icon' => 'fa-solid fa-shapes', 'title' => 'Geometry & Print'],
                                                ];
                                                $activeIcon = $settings['logo_icon'] ?? 'fa-solid fa-print';
                                            @endphp
                                            @foreach($availableIcons as $item)
                                                <button type="button" class="icon-choice-btn {{ $activeIcon === $item['icon'] ? 'active' : '' }}" data-icon="{{ $item['icon'] }}" title="{{ $item['title'] }}">
                                                    <i class="{{ $item['icon'] }}"></i>
                                                </button>
                                            @endforeach
                                        </div>
                                    </div>
                                </div>
                                @endif

                                <!-- 3. Color Theme & Appearance ("Color Teem") -->
                                <div class="settings-card">
                                    <div class="settings-card-header">
                                        <div class="settings-card-icon">
                                            <i class="fa-solid fa-palette"></i>
                                        </div>
                                        <div class="settings-card-title">
                                            <h3>Color Theme & System Appearance</h3>
                                            <p>Select your interface theme mode (Light/Dark) and customize the brand primary accent color.</p>
                                        </div>
                                    </div>

                                    <!-- Light / Dark Mode Cards -->
                                    <input type="hidden" id="settingThemeMode" name="theme_mode" value="{{ $settings['theme_mode'] ?? 'light' }}">
                                    <div class="theme-mode-grid" id="themeModeGrid">
                                        <div class="theme-mode-card {{ ($settings['theme_mode'] ?? 'light') === 'light' ? 'active' : '' }}" data-mode="light">
                                            <div class="theme-mode-icon">
                                                <i class="fa-solid fa-sun" style="color: #f59e0b;"></i>
                                            </div>
                                            <div class="theme-mode-text">
                                                <h4>Light Theme</h4>
                                                <p>Crisp, modern, high-clarity daylight interface.</p>
                                            </div>
                                        </div>

                                        <div class="theme-mode-card {{ ($settings['theme_mode'] ?? '') === 'dark' ? 'active' : '' }}" data-mode="dark">
                                            <div class="theme-mode-icon">
                                                <i class="fa-solid fa-moon" style="color: #6366f1;"></i>
                                            </div>
                                            <div class="theme-mode-text">
                                                <h4>Dark Theme</h4>
                                                <p>Deep navy/slate low-glare nighttime interface.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Primary Color Palettes ("Color Teem") -->
                                    <div>
                                        <label class="color-palette-label">Brand Primary Color ("Color Theme"):</label>
                                        <div class="color-swatches-grid" id="colorSwatchesGrid">
                                            @php
                                                $colorPresets = [
                                                    ['color' => '#2563eb', 'name' => 'Sanjeewa Blue (Default)'],
                                                    ['color' => '#059669', 'name' => 'Emerald Green'],
                                                    ['color' => '#7c3aed', 'name' => 'Royal Violet'],
                                                    ['color' => '#ea580c', 'name' => 'Sunset Orange'],
                                                    ['color' => '#e11d48', 'name' => 'Crimson Rose'],
                                                    ['color' => '#0891b2', 'name' => 'Ocean Cyan'],
                                                    ['color' => '#334155', 'name' => 'Midnight Slate'],
                                                ];
                                                $activeColor = strtolower($settings['theme_color'] ?? '#2563eb');
                                            @endphp

                                            @foreach($colorPresets as $preset)
                                                <button type="button" class="color-swatch-btn {{ $activeColor === strtolower($preset['color']) ? 'active' : '' }}" data-color="{{ $preset['color'] }}" style="background-color: {{ $preset['color'] }};" title="{{ $preset['name'] }}">
                                                    @if($activeColor === strtolower($preset['color']))
                                                        <i class="fa-solid fa-check"></i>
                                                    @endif
                                                </button>
                                            @endforeach

                                            <!-- Custom Hex Picker -->
                                            <div class="custom-color-picker-wrap">
                                                <input type="color" id="settingCustomColorPicker" value="{{ $settings['theme_color'] ?? '#2563eb' }}" title="Pick Custom Color">
                                                <input type="text" id="settingThemeColor" name="theme_color" value="{{ $settings['theme_color'] ?? '#2563eb' }}" placeholder="#2563eb" maxlength="7">
                                            </div>
                                        </div>
                                        <p class="po-field-hint" style="margin-top: 8px;">The chosen color instantly styles buttons, active sidebar items, badges, and progress meters.</p>
                                    </div>
                                </div>

                                <!-- Bottom Save Actions -->
                                <div class="settings-bottom-bar">
                                    <div class="save-status-info" id="saveStatusInfo">
                                        <i class="fa-solid fa-circle-check"></i>
                                        <span id="saveStatusText">Preferences synchronized</span>
                                    </div>
                                    <div class="settings-header-actions">
                                        <button type="button" class="po-btn po-btn-secondary" id="btnResetSettingsBottom">
                                            <i class="fa-solid fa-rotate-left"></i> Reset Defaults
                                        </button>
                                        <button type="submit" class="po-btn po-btn-primary" id="btnSaveSettingsBottom">
                                            <i class="fa-solid fa-floppy-disk"></i> Save Preferences
                                        </button>
                                    </div>
                                </div>

                            </form>

                        </div>

                    </div>
                </div>

            </div>

        </main>

    </div>

    {{-- Shared Modals Container --}}
    @include('ui::layouts.modals.modals')

    <!-- Toast Container -->
    <div class="po-toast-container" id="poToastContainer"></div>

@endsection

@push('scripts')
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/settings.js') }}
@endpush
