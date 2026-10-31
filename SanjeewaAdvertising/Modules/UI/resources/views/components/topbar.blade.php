@php
  $currentUser = auth()->user();
  $displayName = $currentUser ? trim(($currentUser->first_name ?? '') . ' ' . ($currentUser->last_name ?? '')) : '';
  if (empty($displayName)) {
      $displayName = $currentUser->username ?? 'Admin User';
  }
  $initials = strtoupper(substr($displayName, 0, 2));
@endphp

<!-- Desktop Hover-Sensitive Zone to Reveal Auto-Hidden Top Bar -->
<div class="topbar-hover-zone" id="topbarHoverZone" aria-hidden="true"></div>

<!-- Shared Top Navigation Bar -->
<header class="topbar" id="topbar">
  <div class="topbar-left">
    <button class="icon-button menu-toggle" id="menuToggle" aria-label="Toggle sidebar" title="Toggle sidebar" aria-expanded="true" aria-controls="sidebar">
      <i class="fa-solid fa-bars"></i>
    </button>
    <div>
      <div class="breadcrumb" id="breadcrumbArea">@hasSection('breadcrumb')@yield('breadcrumb')@else Workspace / <span id="breadcrumbTitle">Dashboard</span>@endif</div>
      <h1 id="pageTitle">@hasSection('page_title')@yield('page_title')@else Business Overview @endif</h1>
    </div>
  </div>

  <div class="topbar-right">
    <div class="date-label"><i class="fa-regular fa-calendar"></i> <span id="todayDate"></span></div>
    <button class="icon-button topbar-pin-btn" id="topbarPinToggle" title="Pin Topbar (Keep permanently visible)" aria-label="Pin Topbar">
      <i class="fa-solid fa-thumbtack"></i>
    </button>
    <button class="icon-button" id="themeToggle" title="Toggle theme" aria-label="Toggle theme">
      <i class="fa-solid fa-moon"></i>
    </button>

    {{-- User Profile Dropdown --}}
    <div class="profile-dropdown-wrapper" id="profileDropdownWrapper">
      <button class="profile-button" id="profileDropdownToggle" type="button" aria-expanded="false" aria-haspopup="true" title="User Profile">
        <span class="avatar small-avatar">{{ $initials }}</span>
        <span class="profile-name">{{ $displayName }}</span>
        <i class="fa-solid fa-chevron-down" id="profileChevron"></i>
      </button>
      <div class="profile-dropdown-menu" id="profileDropdownMenu" aria-hidden="true">
        <div class="profile-dropdown-header">
          <div class="avatar small-avatar">{{ $initials }}</div>
          <div class="profile-dropdown-meta">
            <strong class="profile-dropdown-username">{{ $displayName }}</strong>
            <span class="profile-dropdown-role">Administrator</span>
          </div>
        </div>
        <div class="profile-dropdown-divider"></div>
        <form method="POST" action="{{ route('logout') }}" class="profile-dropdown-logout-form">
          @csrf
          <button type="submit" class="profile-dropdown-logout-btn">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </form>
      </div>
    </div>

    {{-- Direct Quick Logout Button --}}
    <form method="POST" action="{{ route('logout') }}" class="topbar-logout-form" id="topbarLogoutForm">
      @csrf
      <button type="submit" class="icon-button topbar-logout-btn" id="topbarLogoutBtn" title="Log Out" aria-label="Log Out">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    </form>
  </div>
</header>

<!-- Desktop Floating Peek Pill Indicator when Topbar is Hidden -->
<button class="topbar-peek-pill" id="topbarPeekPill" title="Click to reveal and pin topbar" aria-label="View Topbar">
  <i class="fa-solid fa-chevron-down"></i> <span>View Topbar</span>
</button>
