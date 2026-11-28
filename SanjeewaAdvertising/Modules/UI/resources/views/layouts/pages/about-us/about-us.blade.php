@extends('ui::layouts.master')

@section('title', 'About Us')
@section('page_title', 'About Us')
@section('breadcrumb')Workspace / <span>About Us</span>@endsection

@push('styles')
    {{ module_vite('build-ui', 'resources/assets/css/core.css') }}
    <style>
        .about-container {
            padding: 24px 32px 60px;
            display: flex;
            flex-direction: column;
            gap: 22px;
            width: 100%;
            max-width: 1120px;
            box-sizing: border-box;
        }
        .about-hero {
            background: linear-gradient(135deg, rgba(22, 119, 255, 0.12), rgba(14, 165, 233, 0.06));
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 16px;
            padding: 28px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }
        .about-hero-left {
            display: flex;
            align-items: center;
            gap: 18px;
            min-width: 0;
        }
        .about-hero-icon {
            width: 60px;
            height: 60px;
            border-radius: 15px;
            background: #1677ff;
            color: #ffffff;
            display: grid;
            place-items: center;
            font-size: 26px;
            flex-shrink: 0;
            box-shadow: 0 8px 20px rgba(22, 119, 255, 0.25);
        }
        .about-hero h2 {
            margin: 0;
            font-size: 23px;
            font-weight: 800;
            color: var(--text, #0f172a);
        }
        .about-hero p {
            margin: 5px 0 0;
            font-size: 13.5px;
            color: var(--text-muted, #64748b);
            max-width: 640px;
            line-height: 1.55;
        }
        .about-version-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 14px;
            border-radius: 999px;
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            font-size: 12px;
            font-weight: 700;
            color: #1677ff;
        }
        .about-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
        }
        .about-card {
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 14px;
            padding: 22px 24px;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .about-card h3 {
            margin: 0 0 10px;
            font-size: 15.5px;
            font-weight: 700;
            color: var(--text, #0f172a);
            display: flex;
            align-items: center;
            gap: 9px;
        }
        .about-card h3 i {
            color: #1677ff;
        }
        .about-card p {
            margin: 0;
            font-size: 13px;
            color: var(--text-muted, #64748b);
            line-height: 1.65;
        }
        .about-features-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-top: 14px;
        }
        .about-feature-item {
            padding: 14px 16px;
            border-radius: 10px;
            background: var(--surface-2, #f8fafc);
            border: 1px solid var(--border, #e2e8f0);
        }
        .about-feature-item strong {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--text, #0f172a);
            margin-bottom: 5px;
        }
        .about-feature-item strong i {
            color: #1677ff;
        }
        .about-feature-item span {
            font-size: 12px;
            color: var(--text-muted, #64748b);
            line-height: 1.45;
            display: block;
        }
        .about-footer-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px 22px;
            border-radius: 12px;
            background: var(--surface, #ffffff);
            border: 1px solid var(--border, #e2e8f0);
            font-size: 12.5px;
            color: var(--text-muted, #64748b);
        }
        @media (max-width: 900px) {
            .about-grid,
            .about-features-grid {
                grid-template-columns: 1fr;
            }
            .about-container {
                padding: 16px 14px 40px;
            }
        }
    </style>
@endpush

@section('content')
    <div class="app-layout app" id="app">

        @include('ui::components.sidebar')

        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <main class="main-area" id="mainArea">

            @include('ui::components.topbar')

            <div class="main-content-viewport" id="mainContentViewport">
                <div class="app-module" id="module-about-us" data-module="about-us">
                    <div class="about-container">

                        <div class="about-hero">
                            <div class="about-hero-left">
                                <div class="about-hero-icon">
                                    <i class="fa-solid fa-layer-group"></i>
                                </div>
                                <div>
                                    <h2>Digital Printing Management Platform</h2>
                                    <p>An all-in-one operational workspace built for Visual Line / Sanjeewa Advertising to streamline print production, raw stock control, supplier procurement, financials, HR, and fleet transport.</p>
                                </div>
                            </div>
                            <span class="about-version-pill">
                                <i class="fa-solid fa-code-branch"></i> Powered by Orytingo
                            </span>
                        </div>

                        <div class="about-grid">
                            <div class="about-card">
                                <h3><i class="fa-solid fa-building"></i> About Our Business</h3>
                                <p>
                                    We deliver high-precision large-format digital printing, flex banners, shop signage, lightboxes, and promotional branding solutions. This platform coordinates every order from customer intake and design prepress through printing, finishing, billing, and final vehicle delivery.
                                </p>
                            </div>

                            <div class="about-card" style="display: flex; gap: 18px; align-items: center;">
                                <img src="{{ asset('uploads/branding/orytingo_logo.jpg') }}" alt="Orytingo Logo" style="width: 78px; height: 78px; border-radius: 14px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border, #e2e8f0);">
                                <div>
                                    <h3><i class="fa-solid fa-laptop-code"></i> Developed by Orytingo</h3>
                                    <p>
                                        Engineered and maintained by <strong>Orytingo</strong> (<em>Code. Innovate. Elevate</em>) with a focus on speed, data accuracy, role-based access security, real-time workspace synchronization, and clean day-to-day usability.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="about-card">
                            <h3><i class="fa-solid fa-cubes"></i> Core System Modules</h3>
                            <div class="about-features-grid">
                                <div class="about-feature-item">
                                    <strong><i class="fa-solid fa-print"></i> Orders &amp; Print Jobs</strong>
                                    <span>End-to-end job tracking across Prepress, Printing, Finishing, Ready, and Completed stages.</span>
                                </div>
                                <div class="about-feature-item">
                                    <strong><i class="fa-solid fa-boxes-stacked"></i> Inventory &amp; Procurement</strong>
                                    <span>Fractional stock control (L/ml, kg/g, m/cm), batch tracking, Purchase Orders, and GRN receipts.</span>
                                </div>
                                <div class="about-feature-item">
                                    <strong><i class="fa-solid fa-wallet"></i> Payments &amp; Reports</strong>
                                    <span>Customer settlements, supplier GRN payables, shop expenses, and live executive analytics.</span>
                                </div>
                                <div class="about-feature-item">
                                    <strong><i class="fa-solid fa-truck-fast"></i> Transport &amp; Fleet</strong>
                                    <span>Company vehicle registry, driver assignment, odometer mileage, and diesel cost tracking.</span>
                                </div>
                                <div class="about-feature-item">
                                    <strong><i class="fa-solid fa-people-group"></i> HR &amp; Payroll</strong>
                                    <span>Employee directory, base salary management, and daily wage disbursement logs.</span>
                                </div>
                                <div class="about-feature-item">
                                    <strong><i class="fa-solid fa-shield-halved"></i> Access &amp; Live Sync</strong>
                                    <span>Granular module permissions, activity auditing, and automatic multi-tab live synchronization.</span>
                                </div>
                            </div>
                        </div>

                        <div class="about-footer-bar">
                            <span>&copy; {{ date('Y') }} <strong>Orytingo</strong> &middot; All rights reserved.</span>
                            <span>Laravel {{ app()->version() }} &middot; PHP {{ PHP_VERSION }}</span>
                        </div>

                    </div>
                </div>
            </div>

        </main>
    </div>
@endsection

@push('scripts')
    {{ module_vite('build-ui', 'resources/assets/js/core.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/sidebar.js') }}
    {{ module_vite('build-ui', 'resources/assets/js/components/topbar.js') }}
@endpush
