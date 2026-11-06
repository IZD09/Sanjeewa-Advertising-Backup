@php
    $url = $url ?? route('admin.profile.view');
    $route = $route ?? 'admin-profile';
    $label = $label ?? 'Admin Profile';
    $icon = $icon ?? 'fa-solid fa-user-gear';
    $active = $active ?? (request()->is('admin/profile*'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}" style="color: #a855f7;"></i>
    <span>{{ $label }}</span>
</a>

