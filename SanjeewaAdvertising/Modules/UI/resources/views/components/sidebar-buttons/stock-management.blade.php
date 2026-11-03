@php
    $url = $url ?? route('ui.inventory');
    $route = $route ?? 'inventory';
    $label = $label ?? 'Stock Management';
    $icon = $icon ?? 'fa-solid fa-boxes-stacked';
    $active = $active ?? (request()->is('inventory*') && !request()->has('view'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

