<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Administrator Sign in - Sanjeewa Advertising</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    {{-- Admin Login Dedicated Stylesheet (Matches Project Design System) --}}
    {{ module_vite('build-ui', 'resources/assets/css/admin-login.css') }}
</head>
<body>
<main class="page">
    {{-- Left Brand Section --}}
    <section class="brand" aria-label="Administrator portal introduction">
        <div class="deco" aria-hidden="true">
            <div class="c2"></div>
            <svg viewBox="0 0 560 560" fill="none">
                <circle cx="300" cy="300" r="250" stroke="#1677ff" stroke-opacity=".18" stroke-width="1.5"/>
                <circle cx="300" cy="300" r="180" stroke="#1677ff" stroke-opacity=".25" stroke-width="1.5"/>
                <circle cx="300" cy="300" r="110" fill="#1677ff" fill-opacity=".12"/>
                <path d="M40 420C160 330 260 470 400 340S520 240 560 260" stroke="#1677ff" stroke-opacity=".4" stroke-width="1.5"/>
            </svg>
        </div>

        <div class="logo">
            <span class="logo-mark" aria-hidden="true">
                <i class="fa-solid fa-shield-halved"></i>
            </span>
            <span>Sanjeewa Advertising</span>
        </div>

        <div class="brand-body">
            <div class="admin-badge">
                <span class="pulse-dot" aria-hidden="true"></span>
                <span>System Secure &bull; TLS 1.3</span>
            </div>

            <h1>System Control & Administration.</h1>
            <p class="lead">Centralized governance for digital printing workflows, employee oversight, inventory management, and audit tracking.</p>

            <ul class="feats">
                <li>
                    <span class="ico">
                        <i class="fa-solid fa-user-shield"></i>
                    </span>
                    Role-based privilege management & security controls
                </li>
                <li>
                    <span class="ico">
                        <i class="fa-solid fa-sliders"></i>
                    </span>
                    Centralized system oversight, stock & cashflow auditing
                </li>
                <li>
                    <span class="ico">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </span>
                    Encrypted session tracking and security audit logs
                </li>
            </ul>
        </div>

        <div class="foot">&copy; <span id="adminCopyrightYear">{{ date('Y') }}</span> Sanjeewa Advertising. Enterprise Administration.</div>
    </section>

    {{-- Right Form Section --}}
    <section class="side">
        <div class="card">
            <h2>Administrator Sign In</h2>
            <p class="sub">Enter your administrative credentials to continue.</p>

            <form id="adminLoginForm" method="POST" action="{{ route('admin.login.submit', [], false) }}" data-redirect="{{ route('ui.dashboard') }}" novalidate autocomplete="off">
                @csrf

                {{-- Admin Identifier Field --}}
                <div class="f" id="adminUsernameField">
                    <label for="adminUsername">
                        <span>Admin Identifier / Email</span>
                    </label>
                    <div class="wrap">
                        <i class="fa-solid fa-user-shield lead-ico" aria-hidden="true"></i>
                        <input 
                            id="adminUsername" 
                            name="username" 
                            type="text" 
                            autocomplete="username" 
                            placeholder="Username, email or mobile" 
                            value="{{ old('username') }}" 
                            required 
                            autofocus 
                            aria-describedby="adminUsernameError"
                        >
                    </div>
                    <div class="err" id="adminUsernameError" role="alert">Enter a valid administrator username or email.</div>
                </div>

                {{-- Admin Password Field --}}
                <div class="f" id="adminPasswordField">
                    <label for="adminPassword">
                        <span>Password / Security Key</span>
                    </label>
                    <div class="wrap">
                        <i class="fa-solid fa-lock lead-ico" aria-hidden="true"></i>
                        <input 
                            id="adminPassword" 
                            name="password" 
                            type="password" 
                            autocomplete="current-password" 
                            placeholder="Enter administrative password" 
                            required 
                            aria-describedby="adminPasswordError"
                        >
                        <button type="button" class="eye" id="adminPasswordToggle" aria-label="Toggle password visibility" aria-pressed="false">
                            <i class="fa-solid fa-eye" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="err" id="adminPasswordError" role="alert">Enter your administrator password.</div>
                </div>

                {{-- Remember Me & Forgot Password --}}
                <div class="row">
                    <label class="chk">
                        <input type="checkbox" id="adminRemember" name="remember" {{ old('remember') ? 'checked' : '' }}>
                        <span>Remember admin session</span>
                    </label>
                    <a href="mailto:support@sanjeewaadvertising.com?subject=Admin%20Password%20Reset%20Request">Forgot key?</a>
                </div>

                {{-- Submit Button --}}
                <button class="btn" id="adminSubmitBtn" type="submit">
                    <span class="spin" aria-hidden="true"></span>
                    <i class="fa-solid fa-arrow-right-to-bracket btn-icon" aria-hidden="true"></i>
                    <span id="adminSubmitLabel">Authenticate & Enter Console</span>
                </button>

                {{-- Status / Error Message Container --}}
                <p class="status" id="adminStatusBanner" role="status" aria-live="polite"></p>

                {{-- Switch to Staff Portal --}}
                <div class="alt">
                    Looking for Staff / POS Portal? <a href="{{ route('login') }}">Switch to Staff Login &rarr;</a>
                </div>
            </form>
        </div>
    </section>
</main>

{{-- Admin Login Dedicated JavaScript --}}
{{ module_vite('build-ui', 'resources/assets/js/admin/login.js') }}
</body>
</html>
