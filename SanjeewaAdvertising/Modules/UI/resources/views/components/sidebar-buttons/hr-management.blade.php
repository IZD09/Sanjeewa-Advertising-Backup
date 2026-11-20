@php
    $url = $url ?? route('admin.hr-management');
    $route = $route ?? 'hr-management';
    $label = $label ?? 'HR & Payroll';
    $icon = $icon ?? 'fa-solid fa-people-group';
    $active = $active ?? (request()->is('admin/hr-management*') || request()->is('hr-management*'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>
