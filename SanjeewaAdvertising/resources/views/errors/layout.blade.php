@php
    $appSettings = class_exists(\Modules\UI\Http\Controllers\SettingsController::class)
        ? \Modules\UI\Http\Controllers\SettingsController::getAppSettings()
        : [];
    $appShopName = $appSettings['shop_name'] ?? 'Sanjeewa Advertising';
    $appThemeColor = $appSettings['theme_color'] ?? '#2563eb';
    $appPhone = $appSettings['shop_phone'] ?? '+94 11 234 5678';
    $errorCode = $__env->yieldContent('code', '500');
    $errorRef = 'ERR-' . strtoupper(dechex(time())) . '-' . strtoupper(substr(md5((string) microtime()), 0, 4));
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('code', '500') - @yield('title', 'Error') | {{ $appShopName }}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    <script>
        (function() {
            try {
                var theme = localStorage.getItem('sa-dashboard-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {}
        })();
    </script>

    <style>
        :root {
            --bg-base: #f8fafc;
            --bg-card: #ffffff;
            --border-color: #e2e8f0;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --text-sub: #475569;
            --accent-blue: #2563eb;
            --accent-blue-hover: #1d4ed8;
            --accent-color: @yield('accent_color', '#ef4444');
            --card-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
        }

        html[data-theme="dark"] {
            --bg-base: #0b1120;
            --bg-card: #1e293b;
            --border-color: #334155;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-sub: #cbd5e1;
            --card-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-base);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            line-height: 1.5;
            transition: background-color 0.2s, color 0.2s;
            position: relative;
            overflow-x: hidden;
        }

        /* Subtle background glow */
        .ambient-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, var(--accent-color) 0%, rgba(37, 99, 235, 0) 70%);
            opacity: 0.07;
            top: 5%;
            left: 50%;
            transform: translateX(-50%);
            pointer-events: none;
            z-index: 0;
        }

        /* Top Header */
        .error-header {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            padding: 24px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 10;
        }

        .brand-link {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: var(--text-main);
            font-weight: 700;
            font-size: 16px;
        }

        .brand-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }

        .theme-toggle-btn {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            width: 38px;
            height: 38px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            transition: all 0.2s;
        }

        .theme-toggle-btn:hover {
            color: var(--text-main);
            border-color: var(--accent-blue);
        }

        /* Main Container */
        .error-main {
            width: 100%;
            max-width: 740px;
            margin: auto;
            padding: 20px;
            position: relative;
            z-index: 10;
        }

        .error-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            box-shadow: var(--card-shadow);
            padding: 44px 36px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .error-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, var(--accent-color), #2563eb);
        }

        /* Error Badge & Code */
        .error-badge-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            position: relative;
        }

        .error-icon-box {
            width: 84px;
            height: 84px;
            border-radius: 22px;
            background: rgba(239, 68, 68, 0.08);
            border: 2px solid rgba(239, 68, 68, 0.2);
            color: var(--accent-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38px;
            margin-bottom: 8px;
            animation: pulse-icon 2s infinite ease-in-out;
        }

        @keyframes pulse-icon {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.04); }
        }

        .error-code-badge {
            display: inline-block;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 4px 14px;
            border-radius: 20px;
            background: rgba(239, 68, 68, 0.1);
            color: var(--accent-color);
            border: 1px solid rgba(239, 68, 68, 0.25);
            margin-bottom: 14px;
        }

        .error-heading {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: var(--text-main);
            margin-bottom: 12px;
        }

        .error-message {
            font-size: 15px;
            color: var(--text-muted);
            max-width: 540px;
            margin: 0 auto 28px;
            line-height: 1.6;
        }

        /* Actions */
        .error-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            height: 44px;
            padding: 0 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid transparent;
        }

        .btn-primary {
            background: var(--accent-blue);
            color: #ffffff;
            border-color: var(--accent-blue);
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
        }

        .btn-primary:hover {
            background: var(--accent-blue-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(37, 99, 235, 0.35);
        }

        .btn-secondary {
            background: var(--bg-base);
            color: var(--text-main);
            border-color: var(--border-color);
        }

        .btn-secondary:hover {
            border-color: var(--text-muted);
            background: var(--border-color);
            transform: translateY(-1px);
        }

        /* Diagnostics & Reference Box */
        .error-ref-box {
            padding: 12px 18px;
            background: var(--bg-base);
            border: 1px dashed var(--border-color);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            font-size: 12.5px;
            color: var(--text-muted);
            margin-top: 14px;
            flex-wrap: wrap;
        }

        .error-ref-code {
            font-family: monospace;
            font-weight: 700;
            color: var(--text-main);
            background: rgba(0, 0, 0, 0.05);
            padding: 2px 6px;
            border-radius: 4px;
        }

        html[data-theme="dark"] .error-ref-code {
            background: rgba(255, 255, 255, 0.08);
        }

        /* Collapsible Technical Details (for 500 server errors or debug mode) */
        .tech-details {
            margin-top: 18px;
            text-align: left;
        }

        .tech-details summary {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 6px;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            user-select: none;
            transition: all 0.15s;
        }

        .tech-details summary:hover {
            color: var(--text-main);
            border-color: var(--accent-blue);
        }

        .tech-details-content {
            margin-top: 8px;
            padding: 14px;
            background: #0f172a;
            color: #38bdf8;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.5;
            max-height: 220px;
            overflow-y: auto;
            word-break: break-all;
            white-space: pre-wrap;
        }

        /* Quick Navigation shortcuts */
        .quick-nav {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
        }

        .quick-nav-title {
            font-size: 12.5px;
            font-weight: 600;
            color: var(--text-muted);
        }

        .quick-nav-link {
            font-size: 13px;
            color: var(--accent-blue);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-weight: 500;
            transition: color 0.15s;
        }

        .quick-nav-link:hover {
            text-decoration: underline;
        }

        /* Footer */
        .error-footer {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            font-size: 12.5px;
            color: var(--text-muted);
            position: relative;
            z-index: 10;
        }

        @media (max-width: 640px) {
            .error-card {
                padding: 32px 20px;
            }
            .error-heading {
                font-size: 22px;
            }
            .error-actions {
                flex-direction: column;
                width: 100%;
            }
            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="ambient-glow"></div>

    <!-- Header -->
    <header class="error-header">
        <a href="{{ url('/') }}" class="brand-link" title="Return to Home">
            <div class="brand-icon">
                <i class="fa-solid fa-print"></i>
            </div>
            <span>{{ $appShopName }}</span>
        </a>
        <button type="button" class="theme-toggle-btn" id="btnThemeToggle" title="Toggle Light/Dark Theme">
            <i class="fa-solid fa-moon"></i>
        </button>
    </header>

    <!-- Main Content -->
    <main class="error-main">
        <div class="error-card">
            <div class="error-badge-wrap">
                <div class="error-icon-box" style="background: @yield('icon_bg', 'rgba(239, 68, 68, 0.08)'); border-color: @yield('icon_border', 'rgba(239, 68, 68, 0.25)'); color: var(--accent-color);">
                    <i class="@yield('icon', 'fa-solid fa-triangle-exclamation')"></i>
                </div>
            </div>

            <div class="error-code-badge" style="background: @yield('badge_bg', 'rgba(239, 68, 68, 0.1)'); color: var(--accent-color); border-color: @yield('badge_border', 'rgba(239, 68, 68, 0.25)');">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 10px; margin-right: 4px;"></i> HTTP @yield('code', '500') ERROR
            </div>

            <h1 class="error-heading">@yield('heading', 'Something Went Wrong')</h1>

            <p class="error-message">
                @yield('message', 'An unexpected error occurred on the server while processing your request.')
            </p>

            <!-- Action Buttons -->
            <div class="error-actions">
                <button type="button" class="btn btn-primary" onclick="window.location.reload();">
                    <i class="fa-solid fa-arrow-rotate-right"></i> Reload Page
                </button>
                <button type="button" class="btn btn-secondary" onclick="if (window.history.length > 1) { window.history.back(); } else { window.location.href = '{{ url('/') }}'; }">
                    <i class="fa-solid fa-arrow-left"></i> Go Back
                </button>
                <a href="{{ url('/') }}" class="btn btn-secondary">
                    <i class="fa-solid fa-house"></i> Home / Dashboard
                </a>
            </div>

            @yield('extra_content')

            <!-- Error Reference & Support Line -->
            <div class="error-ref-box">
                <div>
                    <span>Error Reference:</span>
                    <span class="error-ref-code">{{ $errorRef }}</span>
                </div>
                <div>
                    <i class="fa-solid fa-phone" style="font-size: 11px; margin-right: 4px;"></i>
                    Support: <strong style="color: var(--text-main);">{{ $appPhone }}</strong>
                </div>
            </div>

            <!-- Technical details for developers/admins if exception exists or debug mode -->
            @if(isset($exception) && $exception instanceof \Throwable && ($exception->getMessage() || config('app.debug')))
                <details class="tech-details">
                    <summary><i class="fa-solid fa-code" style="margin-right: 6px;"></i> Technical Diagnostics (Debug Information)</summary>
                    <div class="tech-details-content"><strong>Exception:</strong> {{ get_class($exception) }}
@if($exception->getMessage())<strong>Message:</strong> {{ $exception->getMessage() }}
@endif
@if(config('app.debug'))<strong>Location:</strong> {{ $exception->getFile() }}:{{ $exception->getLine() }}

<strong>Stack Trace:</strong>
{{ $exception->getTraceAsString() }}
@endif</div>
                </details>
            @endif

            <!-- Quick Navigation Shortcuts -->
            <div class="quick-nav">
                <span class="quick-nav-title">Quick Links:</span>
                <a href="{{ url('/place-order') }}" class="quick-nav-link"><i class="fa-solid fa-cart-plus"></i> Place Order</a>
                <a href="{{ url('/print-jobs') }}" class="quick-nav-link"><i class="fa-solid fa-print"></i> Print Jobs</a>
                <a href="{{ url('/customers') }}" class="quick-nav-link"><i class="fa-solid fa-users"></i> Customers</a>
                <a href="{{ url('/inventory') }}" class="quick-nav-link"><i class="fa-solid fa-boxes-stacked"></i> Inventory</a>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="error-footer">
        &copy; {{ date('Y') }} {{ $appShopName }}. Digital Printing Management System. All rights reserved.
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var btnToggle = document.getElementById('btnThemeToggle');
            if (!btnToggle) return;

            var updateThemeIcon = function(theme) {
                var icon = btnToggle.querySelector('i');
                if (icon) {
                    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                }
            };

            var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            updateThemeIcon(currentTheme);

            btnToggle.addEventListener('click', function () {
                var current = document.documentElement.getAttribute('data-theme') || 'light';
                var next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                try {
                    localStorage.setItem('sa-dashboard-theme', next);
                } catch(e) {}
                updateThemeIcon(next);
            });
        });
    </script>
</body>
</html>
