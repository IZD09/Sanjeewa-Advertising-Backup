@php
    $url = $url ?? (route('ui.payments') . '?view=expenses');
    $route = $route ?? 'payments';
    $view = $view ?? 'expenses';
    $label = $label ?? 'Operating Expenses';
    $icon = $icon ?? 'fa-solid fa-bolt-lightning';
    $badge = $badge ?? 'Bills';
    $badgeClass = $badgeClass ?? 'sub-badge expense-badge';
    $active = $active ?? (request()->is('payments*') && (request('view') === 'expenses' || request('view') === 'expense'));
@endphp
<a href="{{ $url }}" class="nav-sublink {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-view="{{ $view }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
    @if(!empty($badge))
        <span class="{{ $badgeClass }}">{{ $badge }}</span>
    @endif
</a>

