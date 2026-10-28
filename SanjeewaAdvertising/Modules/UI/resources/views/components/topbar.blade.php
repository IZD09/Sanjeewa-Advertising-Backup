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
          <button class="profile-button">
            <span class="avatar small-avatar">SA</span>
            <span class="profile-name">Admin User</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
      </header>

      <!-- Desktop Floating Peek Pill Indicator when Topbar is Hidden -->
      <button class="topbar-peek-pill" id="topbarPeekPill" title="Click to reveal and pin topbar" aria-label="View Topbar">
        <i class="fa-solid fa-chevron-down"></i> <span>View Topbar</span>
      </button>
