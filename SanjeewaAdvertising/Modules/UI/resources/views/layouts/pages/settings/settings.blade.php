@extends('ui::layouts.master')

@section('title', 'Settings & Preferences')
@section('page_title', 'System Preferences & Settings')
@section('breadcrumb')Workspace / Management / <span>Settings</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/modules.css') }}
    {{ module_vite('build-ui', 'resources/assets/css/place-order.css') }}
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

<!-- ==================================================================
             MODULE 7: SETTINGS & SHOP PREFERENCES
             ================================================================== -->
        <div class="app-module" id="module-settings" data-module="settings">
          <div class="module-container">
            <div class="po-header-banner">
              <div class="po-banner-content">
                <h2><span class="badge-icon" style="background: var(--text);"><i class="fa-solid fa-gear"></i></span> System Preferences & Shop Config</h2>
                <p>Customize company profile details, receipt footers, tax rates, and default units.</p>
              </div>
            </div>

            <div class="settings-form-layout">
              <div class="settings-nav">
                <div class="settings-nav-item active">Shop Profile & Contact</div>
                <div class="settings-nav-item">Pricing & Square Foot Rules</div>
                <div class="settings-nav-item">Receipt & Tax Header</div>
                <div class="settings-nav-item">Staff & Cashier Permissions</div>
              </div>

              <div class="po-section-card">
                <h3 style="font-size: 14px; margin: 0 0 10px; color: var(--text);">Printing Shop Details</h3>
                <div class="po-field">
                  <label class="po-label">Shop Name</label>
                  <input type="text" class="po-input" value="Sanjeewa Advertising & Printing">
                </div>
                <div class="po-field">
                  <label class="po-label">Address</label>
                  <input type="text" class="po-input" value="No. 42 Main Street, Colombo 03, Sri Lanka">
                </div>
                <div class="po-field-row">
                  <div class="po-field">
                    <label class="po-label">Hotline Phone</label>
                    <input type="text" class="po-input" value="+94 11 234 5678">
                  </div>
                  <div class="po-field">
                    <label class="po-label">Currency Symbol</label>
                    <input type="text" class="po-input" value="Rs. (Sri Lankan Rupees)">
                  </div>
                </div>
                <button type="button" class="po-btn po-btn-primary" style="align-self: flex-start; margin-top: 10px;">
                  <i class="fa-solid fa-floppy-disk"></i> Save Preferences
                </button>
              </div>
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
@endpush

