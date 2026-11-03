@php
    $url = $url ?? (route('ui.payments') . '?view=grn-payment');
    $route = $route ?? 'payments';
    $view = $view ?? 'grn-payment';
    $label = $label ?? 'GRN Payment';
    $icon = $icon ?? 'fa-solid fa-boxes-packing';
    $badge = $badge ?? 'Stock';
    $badgeClass = $badgeClass ?? 'sub-badge stock-badge';
    $active = $active ?? (request()->is('payments*') && request('view') === 'grn-payment');
@endphp
<a href="{{ $url }}" class="nav-sublink {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-view="{{ $view }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
    @if(!empty($badge))
        <span class="{{ $badgeClass }}">{{ $badge }}</span>
    @endif
</a>

