@php
    $appSettings = \Modules\UI\Http\Controllers\SettingsController::getAppSettings();
    $appShopName = $appSettings['shop_name'] ?? 'Sanjeewa Advertising';
    $appFaviconHref = \Modules\UI\Http\Controllers\SettingsController::getFaviconHref($appSettings);
    $appThemeColor = $appSettings['theme_color'] ?? '#2563EB';
    $appLogoUrl = $appSettings['logo_url'] ?? null;
    $appLogoIcon = $appSettings['logo_icon'] ?? 'fa-solid fa-print';
    $appSupportEmail = $appSettings['shop_email'] ?? 'support@sanjeewaadvertising.com';
    $appPhone = $appSettings['shop_phone'] ?? '+94 11 234 5678';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Access Restricted - {{ $appShopName }}</title>
    <link rel="icon" href="{{ $appFaviconHref }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
            --blue: {{ $appThemeColor }};
            --blue-d: #1d4ed8;
            --blue-subtle: #eff6ff;
            --bg-base: #f8fafc;
            --bg-card: #ffffff;
            --border-color: #e2e8f0;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --text-sub: #475569;
            --danger: #dc2626;
            --danger-subtle: #fee2e2;
            --warning: #d97706;
            --warning-subtle: #fef3c7;
            --success: #16a34a;
            --success-subtle: #dcfce7;
            --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
        }

        html[data-theme="dark"] {
            --bg-base: #0b1120;
            --bg-card: #1e293b;
            --border-color: #334155;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-sub: #cbd5e1;
            --blue-subtle: rgba(37, 99, 235, 0.15);
            --danger-subtle: rgba(220, 38, 38, 0.15);
            --warning-subtle: rgba(217, 119, 6, 0.15);
            --success-subtle: rgba(22, 163, 74, 0.15);
            --shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-base);
            color: var(--text-main);
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            line-height: 1.5;
            transition: background-color 0.25s, color 0.25s;
            position: relative;
            overflow-x: hidden;
            padding: 24px;
        }

        /* Top Brand Header */
        .page-header {
            max-width: 680px;
            margin: 0 auto 20px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            font-size: 18px;
            color: var(--text-main);
            text-decoration: none;
        }

        .brand-logo-mark {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: var(--blue);
            color: #ffffff;
            display: grid;
            place-items: center;
            font-size: 16px;
            overflow: hidden;
        }

        .theme-toggle-btn {
            width: 36px;
            height: 36px;
            border-radius: 9px;
            border: 1px solid var(--border-color);
            background: var(--bg-card);
            color: var(--text-muted);
            cursor: pointer;
            display: grid;
            place-items: center;
            font-size: 14px;
            transition: all 0.2s;
        }

        .theme-toggle-btn:hover {
            color: var(--blue);
            border-color: var(--blue);
        }

        /* Main Container */
        .main-wrapper {
            max-width: 580px;
            margin: 0 auto;
            width: 100%;
        }

        .restricted-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            box-shadow: var(--shadow);
            padding: 36px 32px;
            position: relative;
            overflow: hidden;
            text-align: center;
            animation: fadeIn .4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .top-accent-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #F59E0B, #EF4444);
        }

        /* Icon Badge */
        .icon-badge-wrap {
            width: 72px;
            height: 72px;
            border-radius: 20px;
            background: var(--warning-subtle);
            color: var(--warning);
            border: 1px solid rgba(217, 119, 6, 0.2);
            margin: 0 auto 20px;
            display: grid;
            place-items: center;
            font-size: 30px;
            box-shadow: 0 10px 20px rgba(245, 158, 11, 0.15);
        }

        .tag-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--warning-subtle);
            color: var(--warning);
            border: 1px solid rgba(217, 119, 6, 0.25);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
        }

        h1 {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-main);
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }

        .main-subtitle {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.5;
            margin-bottom: 24px;
        }

        /* User Profile Preview Box */
        .profile-box {
            display: flex;
            align-items: center;
            gap: 14px;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 14px 18px;
            text-align: left;
            margin-bottom: 20px;
        }

        .avatar-circle {
            width: 50px;
            height: 50px;
            border-radius: 14px;
            background: linear-gradient(135deg, var(--blue), var(--blue-d));
            color: #ffffff;
            font-size: 18px;
            font-weight: 800;
            display: grid;
            place-items: center;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .profile-meta {
            flex: 1;
            min-width: 0;
        }

        .profile-meta h3 {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .profile-sub-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
        }

        .user-tag {
            color: var(--text-muted);
            font-weight: 600;
        }

        .status-badge {
            background: var(--success-subtle);
            color: var(--success);
            padding: 2px 7px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        /* Module Status Panel */
        .modules-alert-box {
            background: var(--blue-subtle);
            border: 1px solid rgba(37, 99, 235, 0.2);
            border-radius: 12px;
            padding: 16px;
            text-align: left;
            margin-bottom: 26px;
        }

        .modules-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13.5px;
            font-weight: 700;
            color: var(--text-main);
        }

        .modules-count-pill {
            background: var(--danger-subtle);
            color: var(--danger);
            border: 1px solid rgba(220, 38, 38, 0.2);
            padding: 2px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 800;
        }

        .modules-desc {
            font-size: 12.5px;
            color: var(--text-sub);
            line-height: 1.5;
            margin: 0;
        }

        /* Action Buttons */
        .actions-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .btn {
            width: 100%;
            height: 46px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            text-decoration: none;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            border: none;
        }

        .btn-primary {
            background: var(--blue);
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
            background: var(--blue-d);
            transform: translateY(-1px);
        }

        .btn-primary.is-sent {
            background: #16A34A !important;
            color: #ffffff !important;
            cursor: default !important;
            transform: none !important;
            box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3) !important;
        }

        .btn-secondary {
            background: transparent;
            color: var(--text-main);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: var(--bg-base);
            border-color: var(--text-muted);
        }

        .status-alert {
            display: none;
            margin-top: 16px;
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 600;
            text-align: left;
            animation: fadeIn .3s ease;
        }

        .status-alert.show-success {
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--success-subtle);
            color: var(--success);
            border: 1px solid rgba(22, 163, 74, 0.3);
        }

        .status-alert.show-error {
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--danger-subtle);
            color: var(--danger);
            border: 1px solid rgba(220, 38, 38, 0.3);
        }

        .spin {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Footer */
        .page-footer {
            max-width: 680px;
            margin: 24px auto 0;
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
        }

        .page-footer a {
            color: var(--blue);
            text-decoration: none;
            font-weight: 600;
        }

        .page-footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <header class="page-header">
        <a href="{{ route('login') }}" class="brand-logo" title="{{ $appShopName }}">
            <span class="brand-logo-mark">
                @if(!empty($appLogoUrl))
                    <img src="{{ $appLogoUrl }}" alt="{{ $appShopName }}" style="width: 100%; height: 100%; object-fit: cover;">
                @else
                    <i class="{{ $appLogoIcon }}"></i>
                @endif
            </span>
            <span>{{ $appShopName }}</span>
        </a>
        <button class="theme-toggle-btn" id="themeToggleBtn" title="Toggle color theme" aria-label="Toggle theme">
            <i class="fa-solid fa-moon" id="themeIcon"></i>
        </button>
    </header>

    <!-- Main Restricted Card -->
    <main class="main-wrapper">
        <div class="restricted-card">
            <div class="top-accent-bar"></div>

            <div class="icon-badge-wrap">
                <i class="fa-solid fa-shield-halved"></i>
            </div>

            <div class="tag-pill">
                <i class="fa-solid fa-lock"></i>
                <span>Module Privileges Required</span>
            </div>

            <h1>Access Restricted</h1>
            <p class="main-subtitle">
                Your account is verified, but no module permissions have been assigned yet. Please contact the administrator.
            </p>

            <!-- User Profile Box -->
            <div class="profile-box">
                <div class="avatar-circle">
                    {{ $pendingUser['initials'] ?? 'U' }}
                </div>
                <div class="profile-meta">
                    <h3>{{ $pendingUser['name'] ?? 'Staff Member' }}</h3>
                    <div class="profile-sub-row">
                        <span class="user-tag">{{ '@' . ($pendingUser['username'] ?? 'username') }}</span>
                        <span class="status-badge">{{ $pendingUser['status'] ?? 'Active' }}</span>
                        @if(!empty($pendingUser['mobile']))
                            <span class="user-tag" style="margin-left: auto;"><i class="fa-solid fa-phone" style="font-size: 10px;"></i> {{ $pendingUser['mobile'] }}</span>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Modules Allocation Info -->
            <div class="modules-alert-box">
                <div class="modules-row">
                    <span><i class="fa-solid fa-layer-group" style="color: var(--blue);"></i> Assigned Modules</span>
                    <span class="modules-count-pill">0 / 12 Active</span>
                </div>
                <p class="modules-desc">
                    To maintain data confidentiality, an Administrator must explicitly grant access to at least one system module (Dashboard, Print Jobs, Place Order, Customers, etc.) before your session can be opened.
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="actions-group">
                <input type="hidden" id="pendingUserId" value="{{ $pendingUser['id'] ?? '' }}">

                <button type="button" class="btn btn-primary" id="btnSendAccessRequest">
                    <span class="spin" id="requestSpinner" style="display: none;"></span>
                    <i class="fa-solid fa-paper-plane" id="requestIcon"></i>
                    <span id="requestLabel">Request Permissions from Admin</span>
                </button>

                <a href="{{ route('login') }}" class="btn btn-secondary" id="btnReturnToLogin">
                    <i class="fa-solid fa-arrow-left"></i>
                    <span>Back to Sign In</span>
                </a>
            </div>

            <!-- Live Status Feedback Message -->
            <div class="status-alert" id="statusAlertBox" role="alert">
                <i class="fa-solid fa-circle-check" id="statusAlertIcon"></i>
                <span id="statusAlertText"></span>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="page-footer">
        <p>Need urgent help? Contact System Administrator at <a href="mailto:{{ $appSupportEmail }}">{{ $appSupportEmail }}</a> @if(!empty($appPhone)) or call {{ $appPhone }} @endif</p>
        <p style="margin-top: 6px; opacity: 0.7;">&copy; {{ date('Y') }} {{ $appShopName }}. All rights reserved.</p>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Theme toggle
            var themeBtn = document.getElementById('themeToggleBtn');
            var themeIcon = document.getElementById('themeIcon');
            var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

            function updateThemeUI(theme) {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('sa-dashboard-theme', theme);
                if (themeIcon) {
                    themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                }
            }
            updateThemeUI(currentTheme);

            if (themeBtn) {
                themeBtn.addEventListener('click', function () {
                    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                    updateThemeUI(next);
                });
            }

            // Permission Request Action
            var btnRequest = document.getElementById('btnSendAccessRequest');
            var spinner = document.getElementById('requestSpinner');
            var icon = document.getElementById('requestIcon');
            var label = document.getElementById('requestLabel');
            var alertBox = document.getElementById('statusAlertBox');
            var alertText = document.getElementById('statusAlertText');
            var alertIcon = document.getElementById('statusAlertIcon');
            var userId = document.getElementById('pendingUserId') ? document.getElementById('pendingUserId').value : '';

            if (btnRequest && userId) {
                btnRequest.addEventListener('click', async function () {
                    btnRequest.disabled = true;
                    if (spinner) spinner.style.display = 'inline-block';
                    if (icon) icon.style.display = 'none';
                    if (label) label.textContent = 'Submitting Request…';

                    try {
                        var csrfToken = document.querySelector('meta[name="csrf-token"]')
                            ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            : '';

                        var response = await fetch('/api/v1/permissions/request', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            body: JSON.stringify({ user_id: parseInt(userId, 10) })
                        });

                        var result = await response.json();

                        if (response.ok && result.success !== false) {
                            btnRequest.classList.add('is-sent');
                            if (spinner) spinner.style.display = 'none';
                            if (icon) {
                                icon.style.display = 'inline-block';
                                icon.className = 'fa-solid fa-circle-check';
                            }
                            if (label) label.textContent = 'Request Sent to Administrators!';

                            if (alertBox && alertText) {
                                alertBox.className = 'status-alert show-success';
                                if (alertIcon) alertIcon.className = 'fa-solid fa-circle-check';
                                alertText.textContent = result.message || 'Notification sent to administrators. You will be able to log in once permissions are granted.';
                            }
                        } else {
                            throw new Error(result.message || 'Failed to submit permission request.');
                        }
                    } catch (err) {
                        btnRequest.disabled = false;
                        if (spinner) spinner.style.display = 'none';
                        if (icon) icon.style.display = 'inline-block';
                        if (label) label.textContent = 'Retry Requesting Permissions';

                        if (alertBox && alertText) {
                            alertBox.className = 'status-alert show-error';
                            if (alertIcon) alertIcon.className = 'fa-solid fa-triangle-exclamation';
                            alertText.textContent = err.message || 'An error occurred while sending your request. Please contact administrator.';
                        }
                    }
                });
            }
        });
    </script>
</body>
</html>
