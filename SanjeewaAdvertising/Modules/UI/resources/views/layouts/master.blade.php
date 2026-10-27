<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>SanjeewaAdvertising | Management System</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="{{ asset('dashboard.css') }}">
  <link rel="stylesheet" href="{{ asset('css/sidebar.css') }}">
  <link rel="stylesheet" href="{{ asset('css/place-order.css') }}">
  <link rel="stylesheet" href="{{ asset('css/modules.css') }}">
  <link rel="stylesheet" href="{{ asset('css/inventory.css') }}">
  <link rel="stylesheet" href="{{ asset('css/grn.css') }}">
  <link rel="stylesheet" href="{{ asset('css/payments.css') }}">
</head>

<body>
  <div class="app" id="app">

    {{-- Sidebar Component --}}
    @include('ui::components.sidebar')

    <!-- Sidebar Backdrop Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Main Content Area with Shared Topbar & Viewport -->
    <main class="main-area" id="mainArea">

      {{-- Topbar Component --}}
      @include('ui::components.topbar')

      <!-- Dynamic Main Content Viewport -->
      <div class="main-content-viewport" id="mainContentViewport">
        {{ $slot }}
      </div>
    </main>
  </div>

  {{-- Shared Modals Container --}}
  @include('ui::layouts.modals.modals')

  <!-- Toast Container -->
  <div class="po-toast-container" id="poToastContainer"></div>

  <!-- Application Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js"></script>
  <script src="{{ asset('dashboard.js') }}"></script>
  <script src="{{ asset('js/sidebar.js') }}"></script>
  <script src="{{ asset('js/components/topbar.js') }}"></script>
  <script src="{{ asset('js/place-order.js') }}"></script>
  <script src="{{ asset('js/inventory.js') }}"></script>
  <script src="{{ asset('js/grn.js') }}"></script>
  <script src="{{ asset('js/payments.js') }}"></script>
  <script src="{{ asset('js/app.js') }}"></script>
</body>

</html>
