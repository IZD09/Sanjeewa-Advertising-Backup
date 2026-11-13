@php
    $url = $url ?? route('ui.payments');
    $route = $route ?? 'payments';
    $label = $label ?? 'Payments';
    $icon = $icon ?? 'fa-solid fa-money-bill-transfer';
    $active = $active ?? request()->is('payments*');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" id="navLinkPayments" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>
