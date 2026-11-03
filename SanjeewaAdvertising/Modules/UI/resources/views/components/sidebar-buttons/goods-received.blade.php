@php
    $url = $url ?? route('ui.grn');
    $route = $route ?? 'grn';
    $label = $label ?? 'Goods Received (GRN)';
    $icon = $icon ?? 'fa-solid fa-file-invoice-dollar';
    $active = $active ?? (request()->is('grn*') && request('view') !== 'po');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

