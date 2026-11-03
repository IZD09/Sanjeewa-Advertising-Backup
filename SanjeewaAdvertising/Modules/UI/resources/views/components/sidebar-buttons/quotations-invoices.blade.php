@php
    $url = $url ?? (route('ui.place-order') . '?view=orders');
    $route = $route ?? 'place-order';
    $view = $view ?? 'orders';
    $label = $label ?? 'Quotations & Invoices';
    $icon = $icon ?? 'fa-solid fa-file-invoice';
    $active = $active ?? (request()->is('place-order*') && request('view') === 'orders');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-view="{{ $view }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

