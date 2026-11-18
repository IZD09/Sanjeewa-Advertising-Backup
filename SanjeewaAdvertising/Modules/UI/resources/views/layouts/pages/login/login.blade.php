@php
    $appSettings = \Modules\UI\Http\Controllers\SettingsController::getAppSettings();
    $appShopName = $appSettings['shop_name'] ?? 'Sanjeewa Advertising';
    $appFaviconHref = \Modules\UI\Http\Controllers\SettingsController::getFaviconHref($appSettings);
    $appThemeColor = $appSettings['theme_color'] ?? '#2563EB';
    $appLogoUrl = $appSettings['logo_url'] ?? null;
    $appLogoIcon = $appSettings['logo_icon'] ?? 'fa-solid fa-print';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="turbo-cache-control" content="no-cache">

    <title>Sign in - {{ $appShopName }}</title>
    <link id="appFavicon" rel="icon" href="{{ $appFaviconHref }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    {{-- Separated Login Stylesheet --}}
    {{ module_vite('build-ui', 'resources/assets/css/login.css') }}
    <style>:root { --blue: {{ $appThemeColor }}; }</style>
</head>
<body>
<script>
    (function () {
        document.querySelectorAll('head link[rel="stylesheet"]').forEach(function (link) {
            var href = link.getAttribute('href') || '';
            if (href && !href.includes('login') && !href.includes('fonts.googleapis.com') && !href.includes('font-awesome')) {
                link.disabled = true;
                link.remove();
            }
        });
        document.body.className = '';
        if (window.appRouter) {
            window.location.reload();
        }
    })();
</script>
<main class="page">
    {{-- Left Brand Section --}}
    <section class="brand" aria-label="Product introduction">
        <div class="deco" aria-hidden="true">
            <div class="c2"></div>
            <svg viewBox="0 0 560 560" fill="none">
                <circle cx="300" cy="300" r="250" stroke="#2563EB" stroke-opacity=".18" stroke-width="1.5"/>
                <circle cx="300" cy="300" r="180" stroke="#2563EB" stroke-opacity=".25" stroke-width="1.5"/>
                <circle cx="300" cy="300" r="110" fill="#2563EB" fill-opacity=".12"/>
                <path d="M40 420C160 330 260 470 400 340S520 240 560 260" stroke="#2563EB" stroke-opacity=".4" stroke-width="1.5"/>
            </svg>
        </div>

        <div class="logo">
            <span class="logo-mark" aria-hidden="true" style="overflow: hidden; color: #fff;">
                @if(!empty($appLogoUrl))
                    <img src="{{ $appLogoUrl }}" alt="{{ $appShopName }}" style="width: 100%; height: 100%; object-fit: cover;">
                @else
                    <i class="{{ $appLogoIcon }}"></i>
                @endif
            </span>
            <span>{{ $appShopName }}</span>
        </div>

        <div class="brand-body">
            <h1>Pick up right where you left off.</h1>
            <p class="lead">Sign in to see your latest work, print jobs, and updates in one place.</p>
            <ul class="feats">
                <li>
                    <span class="ico">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.500-8-9V6z"/>
                            <path d="M9 12l2 2 4-4"/>
                        </svg>
                    </span>
                    Secure and reliable access
                </li>
                <li>
                    <span class="ico">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                        </svg>
                    </span>
                    Manage everything in one place
                </li>
                <li>
                    <span class="ico">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2L4 14h7l-1 8 9-12h-7z"/>
                        </svg>
                    </span>
                    Fast and seamless experience
                </li>
            </ul>
        </div>

        <div class="foot">&copy; <span id="yr">{{ date('Y') }}</span> {{ $appShopName }}. All rights reserved.</div>
    </section>

    {{-- Right Form Section --}}
    <section class="side">
        <div class="card">
            <h2>Welcome Back</h2>
            <p class="sub">Sign in to continue to your account.</p>

            <form id="form" method="POST" action="{{ route('user.auth.login') }}" data-redirect="{{ route('ui.dashboard') }}" data-turbo="false" novalidate>
                @csrf

                {{-- Username / Email Field --}}
                <div class="f" id="fe">
                    <label for="email">Username or Email</label>
                    <div class="wrap">
                        <svg class="lead-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2.500"/>
                            <path d="M3 7l9 6 9-6"/>
                        </svg>
                        <input id="email" name="username" type="text" autocomplete="username" placeholder="name@company.com or username" value="{{ old('username') }}" required aria-describedby="email-err">
                    </div>
                    <div class="err" id="email-err" role="alert">Enter a valid username or email address.</div>
                </div>

                {{-- Password Field --}}
                <div class="f" id="fp">
                    <label for="pw">Password</label>
                    <div class="wrap">
                        <svg class="lead-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <rect x="4" y="11" width="16" height="10" rx="2.500"/>
                            <path d="M8 11V8a4 4 0 018 0v3"/>
                        </svg>
                        <input id="pw" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required aria-describedby="pw-err">
                        <button type="button" class="eye" id="eye" aria-label="Show password" aria-pressed="false">
                            <svg id="eye-i" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                    <div class="err" id="pw-err" role="alert">Enter your password.</div>
                </div>

                {{-- Remember Me & Forgot Password --}}
                <div class="row">
                    <label class="chk">
                        <input type="checkbox" id="rem" name="remember" {{ old('remember') ? 'checked' : '' }}> Remember me
                    </label>
                    <a href="#forgot">Forgot password?</a>
                </div>

                {{-- Submit Button --}}
                <button class="btn" id="go" type="submit">
                    <span class="spin" aria-hidden="true"></span>
                    <span id="lbl">Sign in</span>
                </button>

                {{-- Status / Error Message Container --}}
                <p class="status" id="status" role="status" aria-live="polite"></p>

                <div class="portal-switch">
                    <a href="{{ route('admin.login') }}" class="portal-switch-btn" data-turbo="false" title="Switch to Administrator Login">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>Admin Login</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M5 12h14M13 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>

                <div class="alt">
                    Need help? <a href="mailto:support@sanjeewaadvertising.com">Contact Support</a>
                </div>
            </form>
        </div>
    </section>
</main>

{{-- Separated Login JavaScript --}}
{{ module_vite('build-ui', 'resources/assets/js/login.js') }}
</body>
</html>

