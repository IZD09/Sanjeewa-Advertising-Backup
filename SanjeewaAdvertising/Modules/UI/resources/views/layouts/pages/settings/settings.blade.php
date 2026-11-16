@extends('ui::layouts.master')

@section('title', 'System Preferences & Shop Config')
@section('page_title', 'System Preferences & Shop Config')
@section('breadcrumb')Workspace / Management / <span>Settings</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/modules.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/place-order.css') }}

    <style>
        /* ==========================================================================
           System Preferences & Shop Config Stylesheet
           ========================================================================== */
        .settings-container {
            padding: 24px 32px 60px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
        }

        .settings-header-banner {
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 14px;
            padding: 24px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .settings-header-content {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .settings-header-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: var(--blue, #2563eb);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .settings-header-text h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: var(--text, #0f172a);
            letter-spacing: -0.3px;
        }

        .settings-header-text p {
            margin: 4px 0 0;
            font-size: 13px;
            color: var(--text-muted, #64748b);
        }

        .settings-header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        /* 2-Column Responsive Layout */
        .settings-grid-layout {
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 24px;
            align-items: start;
        }

        @media (max-width: 1080px) {
            .settings-grid-layout {
                grid-template-columns: 1fr;
            }
        }

        /* Left Column: Live Shop Preview Card */
        .settings-preview-card {
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            gap: 20px;
            position: sticky;
            top: 24px;
        }

        .preview-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .preview-card-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text, #0f172a);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .live-badge {
            background: #dcfce7;
            color: #15803d;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        [data-theme="dark"] .live-badge {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
        }

        .live-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #16a34a;
            display: inline-block;
            animation: pulseDot 1.8s infinite;
        }

        @keyframes pulseDot {
            0% { transform: scale(0.9); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.8; }
        }

        /* Mock Business Identity Card */
        .mock-identity-card {
            border-radius: 12px;
            border: 1px solid var(--border, #e2e8f0);
            background: linear-gradient(180deg, var(--surface-2, #f8fafc) 0%, var(--surface, #ffffff) 100%);
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            overflow: hidden;
            position: relative;
        }

        .mock-identity-top {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .mock-logo-box {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            background: var(--blue-subtle, rgba(37, 99, 235, 0.08));
            border: 2px solid var(--blue, #2563eb);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
            color: var(--blue, #2563eb);
            font-size: 24px;
            transition: all 0.2s ease;
        }

        .mock-logo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .mock-brand-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .mock-shop-name {
            font-size: 16px;
            font-weight: 800;
            color: var(--text, #0f172a);
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
        }

        .mock-shop-sub {
            font-size: 11.5px;
            font-weight: 600;
            color: var(--blue, #2563eb);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }

        .mock-contact-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-top: 10px;
            border-top: 1px dashed var(--border, #e2e8f0);
            font-size: 12px;
            color: var(--text, #334155);
        }

        .mock-contact-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            word-break: break-word;
        }

        .mock-contact-item i {
            color: var(--blue, #2563eb);
            margin-top: 2px;
            width: 14px;
            flex-shrink: 0;
        }

        /* Mock Receipt Sample */
        .mock-sample-receipt {
            background: var(--surface-2, #f8fafc);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 10px;
            padding: 14px;
            font-size: 12px;
        }

        .mock-receipt-header {
            display: flex;
            justify-content: space-between;
            font-weight: 600;
            color: var(--text-muted, #64748b);
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .mock-receipt-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
            color: var(--text, #0f172a);
            font-weight: 500;
        }

        .mock-receipt-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 8px;
            margin-top: 8px;
            border-top: 1px solid var(--border, #e2e8f0);
            font-weight: 700;
            font-size: 13px;
            color: var(--text, #0f172a);
        }

        .mock-receipt-total .amount {
            color: var(--blue, #2563eb);
            font-size: 14px;
            font-weight: 800;
        }

        /* Theme Preview Badge */
        .preview-theme-status {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            border-radius: 8px;
            background: var(--surface-2, #f1f5f9);
            font-size: 12px;
            font-weight: 600;
            color: var(--text, #0f172a);
        }

        .theme-pill-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            padding: 3px 8px;
            border-radius: 6px;
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #cbd5e1);
        }

        .theme-color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--blue, #2563eb);
            display: inline-block;
        }

        /* Right Column Form Cards */
        .settings-form-column {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .settings-card {
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .settings-card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .settings-card-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: var(--blue-subtle, rgba(37, 99, 235, 0.08));
            color: var(--blue, #2563eb);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .settings-card-title h3 {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: var(--text, #0f172a);
        }

        .settings-card-title p {
            margin: 2px 0 0;
            font-size: 12px;
            color: var(--text-muted, #64748b);
        }

        /* Form Inputs */
        .po-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .po-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text, #334155);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .po-label .required {
            color: #ef4444;
            font-size: 12px;
        }

        .po-input-group {
            position: relative;
            display: flex;
            align-items: center;
        }

        .po-input-group i {
            position: absolute;
            left: 14px;
            color: var(--text-muted, #64748b);
            font-size: 14px;
            pointer-events: none;
        }

        .po-input-group .po-input {
            padding-left: 38px;
            width: 100%;
        }

        .po-field-hint {
            font-size: 11px;
            color: var(--text-muted, #64748b);
            margin: 0;
        }

        .po-field-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        @media (max-width: 640px) {
            .po-field-row {
                grid-template-columns: 1fr;
            }
        }

        /* Currency Presets */
        .currency-presets {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
        }

        .currency-pill {
            padding: 4px 10px;
            border-radius: 6px;
            background: var(--surface-2, #f1f5f9);
            border: 1px solid var(--border, #cbd5e1);
            font-size: 11.5px;
            font-weight: 600;
            color: var(--text, #334155);
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .currency-pill:hover,
        .currency-pill.active {
            background: var(--blue, #2563eb);
            border-color: var(--blue, #2563eb);
            color: #ffffff;
        }

        /* Logo Upload Section */
        .logo-upload-container {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 16px;
            background: var(--surface-2, #f8fafc);
            border: 1px dashed var(--border, #cbd5e1);
            border-radius: 12px;
            flex-wrap: wrap;
        }

        .logo-preview-box {
            width: 80px;
            height: 80px;
            border-radius: 12px;
            background: var(--surface, #ffffff);
            border: 2px solid var(--border, #e2e8f0);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: var(--blue, #2563eb);
            overflow: hidden;
            position: relative;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            flex-shrink: 0;
        }

        .logo-preview-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .logo-upload-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            min-width: 200px;
        }

        .logo-action-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        /* Icon Picker Grid */
        .icon-picker-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text, #334155);
            margin: 12px 0 6px;
        }

        .icon-picker-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
            gap: 10px;
        }

        .icon-choice-btn {
            height: 50px;
            border-radius: 10px;
            border: 1px solid var(--border, #cbd5e1);
            background: var(--surface, #ffffff);
            color: var(--text, #334155);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.18s ease;
        }

        .icon-choice-btn:hover {
            border-color: var(--blue, #2563eb);
            color: var(--blue, #2563eb);
            background: var(--blue-subtle, rgba(37, 99, 235, 0.05));
            transform: translateY(-2px);
        }

        .icon-choice-btn.active {
            border-color: var(--blue, #2563eb);
            background: var(--blue, #2563eb);
            color: #ffffff;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
        }

        /* Color Theme ("Color Teem") Section */
        .theme-mode-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
        }

        @media (max-width: 600px) {
            .theme-mode-grid {
                grid-template-columns: 1fr;
            }
        }

        .theme-mode-card {
            border: 2px solid var(--border, #e2e8f0);
            background: var(--surface-2, #f8fafc);
            border-radius: 10px;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .theme-mode-card:hover {
            border-color: var(--blue, #2563eb);
            background: var(--surface, #ffffff);
        }

        .theme-mode-card.active {
            border-color: var(--blue, #2563eb);
            background: var(--blue-subtle, rgba(37, 99, 235, 0.08));
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
        }

        .theme-mode-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #cbd5e1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: var(--text, #0f172a);
            flex-shrink: 0;
        }

        .theme-mode-card.active .theme-mode-icon {
            background: var(--blue, #2563eb);
            color: #ffffff;
            border-color: var(--blue, #2563eb);
        }

        .theme-mode-text h4 {
            margin: 0;
            font-size: 13px;
            font-weight: 700;
            color: var(--text, #0f172a);
        }

        .theme-mode-text p {
            margin: 2px 0 0;
            font-size: 11px;
            color: var(--text-muted, #64748b);
        }

        /* Swatches Grid */
        .color-palette-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text, #334155);
            margin: 14px 0 8px;
        }

        .color-swatches-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
        }

        .color-swatch-btn {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 3px solid transparent;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 13px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        }

        .color-swatch-btn:hover {
            transform: scale(1.15);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .color-swatch-btn.active {
            border-color: #ffffff;
            outline: 2px solid var(--text, #0f172a);
            transform: scale(1.12);
        }

        .custom-color-picker-wrap {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid var(--border, #cbd5e1);
            background: var(--surface, #ffffff);
        }

        .custom-color-picker-wrap input[type="color"] {
            border: none;
            width: 26px;
            height: 26px;
            border-radius: 6px;
            cursor: pointer;
            background: none;
            padding: 0;
        }

        .custom-color-picker-wrap input[type="text"] {
            width: 85px;
            border: none;
            background: none;
            font-size: 12px;
            font-weight: 600;
            color: var(--text, #0f172a);
            outline: none;
            text-transform: uppercase;
        }

        /* Bottom Action Bar */
        .settings-bottom-bar {
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 14px;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .save-status-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12.5px;
            font-weight: 600;
            color: var(--text-muted, #64748b);
        }

        .save-status-info.saved {
            color: #16a34a;
        }

        .save-status-info.unsaved {
            color: #ea580c;
        }
    </style>
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

                <div class="app-module" id="module-settings" data-module="settings">
                    <div class="settings-container">

                        <!-- Header Banner -->
                        <div class="settings-header-banner">
                            <div class="settings-header-content">
                                <div class="settings-header-icon">
                                    <i class="fa-solid fa-gear"></i>
                                </div>
                                <div class="settings-header-text">
                                    <h2>System Preferences & Shop Config</h2>
                                    <p>Configure company profile, contact details, currency symbol, logo branding, and visual color theme.</p>
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
                                            <h3 class="mock-shop-name" id="mockShopName">{{ $settings['shop_name'] ?? 'Sanjeewa Advertising & Printing' }}</h3>
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

                                <div style="font-size: 11.5px; color: var(--text-muted, #64748b); line-height: 1.5; padding: 10px; background: var(--surface-2, #f8fafc); border-radius: 8px; border: 1px solid var(--border, #e2e8f0);">
                                    <i class="fa-solid fa-circle-info" style="color: var(--blue, #2563eb); margin-right: 4px;"></i>
                                    Preferences saved here synchronize with the sidebar brand, invoice receipts, print layouts, and overall interface color palette.
                                </div>
                            </aside>

                            <!-- Right Column: Settings Configuration Form -->
                            <form id="settingsForm" class="settings-form-column" method="POST" action="{{ route('ui.settings.update') }}" enctype="multipart/form-data">
                                @csrf

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
                                            <input type="text" id="settingShopName" name="shop_name" class="po-input" value="{{ $settings['shop_name'] ?? 'Sanjeewa Advertising & Printing' }}" placeholder="e.g. Sanjeewa Advertising & Printing" required autocomplete="organization">
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

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('settingsForm');
            const shopNameInput = document.getElementById('settingShopName');
            const shopAddressInput = document.getElementById('settingShopAddress');
            const shopPhoneInput = document.getElementById('settingShopPhone');
            const currencySymbolInput = document.getElementById('settingCurrencySymbol');
            const currencyPresets = document.querySelectorAll('.currency-pill');

            const mockShopName = document.getElementById('mockShopName');
            const mockAddress = document.getElementById('mockAddress');
            const mockPhone = document.getElementById('mockPhone');
            const previewCurrencySymbols = document.querySelectorAll('.preview-currency-sym');

            const logoFileInput = document.getElementById('settingLogoFile');
            const btnChooseLogo = document.getElementById('btnChooseLogo');
            const btnRemoveLogo = document.getElementById('btnRemoveLogo');
            const removeLogoFlag = document.getElementById('removeLogoFlag');
            const logoUploadPreviewBox = document.getElementById('logoUploadPreviewBox');
            const mockLogoBox = document.getElementById('mockLogoBox');
            const settingLogoIconInput = document.getElementById('settingLogoIcon');
            const iconChoiceBtns = document.querySelectorAll('.icon-choice-btn');

            const themeModeCards = document.querySelectorAll('.theme-mode-card');
            const themeModeInput = document.getElementById('settingThemeMode');
            const colorSwatchBtns = document.querySelectorAll('.color-swatch-btn');
            const customColorPicker = document.getElementById('settingCustomColorPicker');
            const themeColorInput = document.getElementById('settingThemeColor');
            const previewColorDot = document.getElementById('previewColorDot');
            const previewColorHex = document.getElementById('previewColorHex');

            const btnSaveTop = document.getElementById('btnSaveSettingsTop');
            const btnSaveBottom = document.getElementById('btnSaveSettingsBottom');
            const btnResetTop = document.getElementById('btnResetSettingsTop');
            const btnResetBottom = document.getElementById('btnResetSettingsBottom');
            const saveStatusInfo = document.getElementById('saveStatusInfo');
            const saveStatusText = document.getElementById('saveStatusText');

            // Default fallback values
            const defaultSettings = {
                shop_name: 'Sanjeewa Advertising & Printing',
                shop_address: 'No. 42 Main Street, Colombo 03, Sri Lanka',
                shop_phone: '+94 11 234 5678',
                currency_symbol: 'Rs.',
                logo_url: null,
                logo_icon: 'fa-solid fa-print',
                theme_mode: 'light',
                theme_color: '#2563eb'
            };

            // 1. Live Input Sync
            function markUnsaved() {
                if (saveStatusInfo) {
                    saveStatusInfo.className = 'save-status-info unsaved';
                    saveStatusInfo.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <span>Unsaved changes</span>';
                }
            }

            shopNameInput?.addEventListener('input', (e) => {
                const val = e.target.value.trim() || 'Sanjeewa Advertising & Printing';
                if (mockShopName) mockShopName.textContent = val;
                const sidebarBrandName = document.getElementById('sidebarBrandName');
                if (sidebarBrandName) {
                    const parts = val.split(' ');
                    sidebarBrandName.textContent = parts[0] || val;
                }
                markUnsaved();
            });

            shopAddressInput?.addEventListener('input', (e) => {
                const val = e.target.value.trim() || 'No. 42 Main Street, Colombo 03, Sri Lanka';
                if (mockAddress) mockAddress.textContent = val;
                markUnsaved();
            });

            shopPhoneInput?.addEventListener('input', (e) => {
                const val = e.target.value.trim() || '+94 11 234 5678';
                if (mockPhone) mockPhone.textContent = val;
                markUnsaved();
            });

            currencySymbolInput?.addEventListener('input', (e) => {
                const val = e.target.value.trim() || 'Rs.';
                previewCurrencySymbols.forEach(el => el.textContent = val);
                currencyPresets.forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-val') === val);
                });
                markUnsaved();
            });

            currencyPresets.forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.getAttribute('data-val');
                    if (currencySymbolInput) currencySymbolInput.value = val;
                    previewCurrencySymbols.forEach(el => el.textContent = val);
                    currencyPresets.forEach(b => b.classList.toggle('active', b === btn));
                    markUnsaved();
                });
            });

            // 2. Logo Upload & Remove Handling
            btnChooseLogo?.addEventListener('click', () => {
                logoFileInput?.click();
            });

            logoFileInput?.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                    alert('Logo image must be smaller than 2MB.');
                    logoFileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    renderLogoImage(dataUrl);
                    if (removeLogoFlag) removeLogoFlag.value = '0';
                    if (btnRemoveLogo) btnRemoveLogo.style.display = 'inline-flex';
                    markUnsaved();
                };
                reader.readAsDataURL(file);
            });

            btnRemoveLogo?.addEventListener('click', () => {
                if (logoFileInput) logoFileInput.value = '';
                if (removeLogoFlag) removeLogoFlag.value = '1';
                const settingLogoUrl = document.getElementById('settingLogoUrl');
                if (settingLogoUrl) settingLogoUrl.value = '';
                const activeIcon = settingLogoIconInput ? settingLogoIconInput.value : 'fa-solid fa-print';
                renderLogoIcon(activeIcon);
                if (btnRemoveLogo) btnRemoveLogo.style.display = 'none';
                markUnsaved();
            });

            function renderLogoImage(src) {
                if (logoUploadPreviewBox) {
                    logoUploadPreviewBox.innerHTML = `<img src="${src}" alt="Logo" style="width:100%;height:100%;object-fit:cover;">`;
                }
                if (mockLogoBox) {
                    mockLogoBox.innerHTML = `<img src="${src}" alt="Logo" style="width:100%;height:100%;object-fit:cover;">`;
                }
                const sidebarBrandLogo = document.getElementById('sidebarBrandLogo');
                if (sidebarBrandLogo) {
                    sidebarBrandLogo.innerHTML = `<img src="${src}" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`;
                }
            }

            function renderLogoIcon(iconClass) {
                if (logoUploadPreviewBox) {
                    logoUploadPreviewBox.innerHTML = `<i class="${iconClass}"></i>`;
                }
                if (mockLogoBox) {
                    mockLogoBox.innerHTML = `<i class="${iconClass}"></i>`;
                }
                const sidebarBrandLogo = document.getElementById('sidebarBrandLogo');
                if (sidebarBrandLogo) {
                    sidebarBrandLogo.innerHTML = `<i class="${iconClass}"></i>`;
                }
            }

            // 3. Fallback Brand Icon Picker
            iconChoiceBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    iconChoiceBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const chosenIcon = btn.getAttribute('data-icon');
                    if (settingLogoIconInput) settingLogoIconInput.value = chosenIcon;

                    // If no uploaded image is active, update mock and preview boxes
                    if (removeLogoFlag && removeLogoFlag.value === '1' || (!logoFileInput.files.length && !document.getElementById('settingLogoUrl').value)) {
                        renderLogoIcon(chosenIcon);
                    }
                    markUnsaved();
                });
            });

            // 4. Theme Mode (Light / Dark)
            themeModeCards.forEach(card => {
                card.addEventListener('click', () => {
                    themeModeCards.forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    const mode = card.getAttribute('data-mode');
                    if (themeModeInput) themeModeInput.value = mode;

                    document.documentElement.dataset.theme = mode;
                    localStorage.setItem('sa-dashboard-theme', mode);

                    const topbarToggle = document.getElementById('themeToggle');
                    if (topbarToggle) {
                        topbarToggle.innerHTML = mode === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
                    }
                    markUnsaved();
                });
            });

            // 5. Brand Accent / Color Theme ("Color Teem")
            function applyThemeColor(hex) {
                if (!hex) return;
                hex = hex.trim();
                if (!hex.startsWith('#')) hex = '#' + hex;
                if (!/^#[0-9a-fA-F]{6}$/i.test(hex)) return;

                if (themeColorInput) themeColorInput.value = hex;
                if (customColorPicker) customColorPicker.value = hex;
                if (previewColorDot) previewColorDot.style.backgroundColor = hex;
                if (previewColorHex) previewColorHex.textContent = hex.toUpperCase();

                // Live dynamic root CSS property update
                document.documentElement.style.setProperty('--blue', hex);
                document.documentElement.style.setProperty('--blue-dark', hex);
                document.documentElement.style.setProperty('--sidebar-item-active-border', hex);

                if (mockLogoBox) {
                    mockLogoBox.style.borderColor = hex;
                    mockLogoBox.style.color = hex;
                }

                colorSwatchBtns.forEach(btn => {
                    const btnColor = btn.getAttribute('data-color').toLowerCase();
                    const isMatch = btnColor === hex.toLowerCase();
                    btn.classList.toggle('active', isMatch);
                    btn.innerHTML = isMatch ? '<i class="fa-solid fa-check"></i>' : '';
                });

                markUnsaved();
            }

            colorSwatchBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const color = btn.getAttribute('data-color');
                    applyThemeColor(color);
                });
            });

            customColorPicker?.addEventListener('input', (e) => {
                applyThemeColor(e.target.value);
            });

            themeColorInput?.addEventListener('input', (e) => {
                if (/^#[0-9a-fA-F]{6}$/i.test(e.target.value.trim())) {
                    applyThemeColor(e.target.value.trim());
                }
            });

            // 6. Form Submission & Persistence
            function showToastNotification(message, type = 'success') {
                const toastContainer = document.getElementById('poToastContainer');
                if (!toastContainer) return;

                const toast = document.createElement('div');
                toast.className = `po-toast ${type}`;
                toast.style.cssText = `
                    background: ${type === 'success' ? '#16a34a' : '#dc2626'};
                    color: #ffffff;
                    padding: 12px 20px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
                    margin-bottom: 10px;
                    animation: fadeIn 0.3s ease;
                `;
                toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> <span>${message}</span>`;
                toastContainer.appendChild(toast);

                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-10px)';
                    toast.style.transition = 'all 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }, 3500);
            }

            form?.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitBtn = btnSaveBottom;
                const originalHtml = submitBtn ? submitBtn.innerHTML : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                }
                if (btnSaveTop) {
                    btnSaveTop.disabled = true;
                    btnSaveTop.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                }

                try {
                    const formData = new FormData(form);
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Accept': 'application/json'
                        }
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        // Persist to localStorage for client-wide synchronous access
                        localStorage.setItem('sa_shop_settings', JSON.stringify(result.data));

                        if (saveStatusInfo) {
                            saveStatusInfo.className = 'save-status-info saved';
                            saveStatusInfo.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Preferences saved successfully!</span>';
                        }
                        showToastNotification('System preferences & shop config saved successfully!', 'success');
                    } else {
                        throw new Error(result.message || 'Failed to save settings.');
                    }
                } catch (err) {
                    console.error('Settings save error:', err);
                    showToastNotification(err.message || 'An error occurred while saving.', 'error');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalHtml;
                    }
                    if (btnSaveTop) {
                        btnSaveTop.disabled = false;
                        btnSaveTop.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Preferences';
                    }
                }
            });

            btnSaveTop?.addEventListener('click', () => {
                form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            });

            // 7. Reset Defaults Handler
            function resetToDefaults() {
                if (!confirm('Are you sure you want to reset all preferences to their default settings?')) {
                    return;
                }

                if (shopNameInput) shopNameInput.value = defaultSettings.shop_name;
                if (shopAddressInput) shopAddressInput.value = defaultSettings.shop_address;
                if (shopPhoneInput) shopPhoneInput.value = defaultSettings.shop_phone;
                if (currencySymbolInput) currencySymbolInput.value = defaultSettings.currency_symbol;

                if (mockShopName) mockShopName.textContent = defaultSettings.shop_name;
                if (mockAddress) mockAddress.textContent = defaultSettings.shop_address;
                if (mockPhone) mockPhone.textContent = defaultSettings.shop_phone;
                previewCurrencySymbols.forEach(el => el.textContent = defaultSettings.currency_symbol);

                currencyPresets.forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-val') === defaultSettings.currency_symbol);
                });

                if (btnRemoveLogo) btnRemoveLogo.click();

                iconChoiceBtns.forEach(btn => {
                    const isDefault = btn.getAttribute('data-icon') === defaultSettings.logo_icon;
                    btn.classList.toggle('active', isDefault);
                    if (isDefault) btn.click();
                });

                const lightCard = document.querySelector('.theme-mode-card[data-mode="light"]');
                if (lightCard) lightCard.click();

                applyThemeColor(defaultSettings.theme_color);

                showToastNotification('Preferences reset to default values. Click "Save Preferences" to persist.', 'info');
                markUnsaved();
            }

            btnResetTop?.addEventListener('click', resetToDefaults);
            btnResetBottom?.addEventListener('click', resetToDefaults);

            // 8. Apply saved settings on load if present in localStorage
            try {
                const savedJson = localStorage.getItem('sa_shop_settings');
                if (savedJson) {
                    const saved = JSON.parse(savedJson);
                    if (saved.theme_color) {
                        document.documentElement.style.setProperty('--blue', saved.theme_color);
                        document.documentElement.style.setProperty('--blue-dark', saved.theme_color);
                    }
                }
            } catch (_) {}
        });
    </script>
@endpush
