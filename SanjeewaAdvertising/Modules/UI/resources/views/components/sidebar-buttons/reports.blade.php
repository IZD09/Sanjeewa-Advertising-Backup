@php
    $url = $url ?? route('ui.reports');
    $route = $route ?? 'reports';
    $label = $label ?? 'Reports';
    $icon = $icon ?? 'fa-solid fa-chart-pie';
    $active = $active ?? (request()->is('reports*') && !request()->has('type'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

