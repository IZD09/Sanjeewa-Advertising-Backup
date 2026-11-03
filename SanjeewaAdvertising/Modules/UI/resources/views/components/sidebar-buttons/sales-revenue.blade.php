@php
    $url = $url ?? (route('admin.dashboard') . '?slide=1');
    $route = $route ?? 'sales-revenue';
    $label = $label ?? 'Sales & Revenue';
    $icon = $icon ?? 'fa-solid fa-chart-line';
    $active = $active ?? ((request()->is('admin/dashboard*') || request()->is('dashboard*')) && request('slide') == '1');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-slide="1" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

