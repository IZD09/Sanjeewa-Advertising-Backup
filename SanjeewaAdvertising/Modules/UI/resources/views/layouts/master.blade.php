<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="turbo-cache-control" content="no-preview">

    <title>@yield('title', 'Dashboard') - SanjeewaAdvertising</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    {{-- UI module assets --}}
    {{ module_vite('build-ui', 'resources/assets/sass/app.scss') }}
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js"></script>
    {{ module_vite('build-ui', 'resources/assets/js/app.js') }}

    <style>
        .turbo-progress-bar {
            height: 3px !important;
            background-color: #1677ff !important;
            box-shadow: 0 0 10px rgba(22, 119, 255, 0.7) !important;
            z-index: 999999 !important;
        }
    </style>

    @stack('styles')
</head>

<body>
    @yield('content')

    @stack('scripts')
</body>

</html>
