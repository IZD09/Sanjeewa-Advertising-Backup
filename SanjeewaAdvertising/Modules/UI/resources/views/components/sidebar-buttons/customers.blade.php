@php
    $url = $url ?? route('ui.customers');
    $route = $route ?? 'customers';
    $label = $label ?? 'Customers';
    $icon = $icon ?? 'fa-solid fa-users';
    $active = $active ?? request()->is('customers*');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

