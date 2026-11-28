@php
    $url = $url ?? route('admin.transport');
    $route = $route ?? 'transport';
    $label = $label ?? 'Transport';
    $icon = $icon ?? 'fa-solid fa-truck-fast';
    $active = $active ?? (request()->is('admin/transport*') || request()->is('transport*'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>
