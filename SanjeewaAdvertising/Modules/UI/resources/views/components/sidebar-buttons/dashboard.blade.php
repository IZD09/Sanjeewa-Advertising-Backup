@php
    $url = $url ?? route('admin.dashboard');
    $route = $route ?? 'dashboard';
    $label = $label ?? 'Dashboard';
    $icon = $icon ?? 'fa-solid fa-gauge-high';
    $active = $active ?? ((request()->is('dashboard*') || request()->is('/') || request()->is('admin/dashboard*')) && (!request()->has('slide') || request('slide') == '0'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-slide="0" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

