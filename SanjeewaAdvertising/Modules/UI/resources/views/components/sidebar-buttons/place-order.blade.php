@php
    $url = $url ?? route('ui.place-order');
    $route = $route ?? 'place-order';
    $view = $view ?? 'form';
    $label = $label ?? 'Place Order';
    $icon = $icon ?? 'fa-solid fa-cart-plus';
    $active = $active ?? (request()->is('place-order*') && (!request()->has('view') || request('view') === 'form'));
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-view="{{ $view }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

