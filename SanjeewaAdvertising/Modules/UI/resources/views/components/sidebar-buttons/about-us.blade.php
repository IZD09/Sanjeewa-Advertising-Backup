@php
    $url = $url ?? route('ui.about-us');
    $route = $route ?? 'about-us';
    $label = $label ?? 'About Us';
    $icon = $icon ?? 'fa-solid fa-circle-info';
    $active = $active ?? request()->is('about-us*');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>
