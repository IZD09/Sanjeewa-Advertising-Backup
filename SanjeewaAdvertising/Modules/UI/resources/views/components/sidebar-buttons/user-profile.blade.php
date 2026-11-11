@php
    $url = $url ?? route('ui.user-profile');
    $route = $route ?? 'user-profile';
    $label = $label ?? 'User Profile';
    $icon = $icon ?? 'fa-solid fa-user';
    $active = $active ?? (request()->is('profile*') || request()->is('user/profile*'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}" style="color: #0284c7;"></i>
    <span>{{ $label }}</span>
</a>
