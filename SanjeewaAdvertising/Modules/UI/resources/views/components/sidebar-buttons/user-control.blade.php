@php
    $url = $url ?? route('admin.user-control');
    $route = $route ?? 'user-control';
    $label = $label ?? 'User Control';
    $icon = $icon ?? 'fa-solid fa-user-shield';
    $active = $active ?? (request()->is('admin/user-control*') || request()->is('user-control*'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

