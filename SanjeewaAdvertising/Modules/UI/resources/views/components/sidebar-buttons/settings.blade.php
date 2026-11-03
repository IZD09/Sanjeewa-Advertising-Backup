@php
    $url = $url ?? route('ui.settings');
    $route = $route ?? 'settings';
    $label = $label ?? 'Settings';
    $icon = $icon ?? 'fa-solid fa-gear';
    $active = $active ?? request()->is('settings*');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

