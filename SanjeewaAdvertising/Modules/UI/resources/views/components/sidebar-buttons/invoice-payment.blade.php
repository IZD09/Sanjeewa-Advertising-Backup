@php
    $url = $url ?? (route('ui.payments') . '?view=invoice-payment');
    $route = $route ?? 'payments';
    $view = $view ?? 'invoice-payment';
    $label = $label ?? 'Invoice Payment';
    $icon = $icon ?? 'fa-solid fa-file-invoice-dollar';
    $badge = $badge ?? 'Job';
    $badgeClass = $badgeClass ?? 'sub-badge job-badge';
    $active = $active ?? (request()->is('payments*') && request('view', 'invoice-payment') === 'invoice-payment');
@endphp
<a href="{{ $url }}" class="nav-sublink {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-view="{{ $view }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
    @if(!empty($badge))
        <span class="{{ $badgeClass }}">{{ $badge }}</span>
    @endif
</a>

