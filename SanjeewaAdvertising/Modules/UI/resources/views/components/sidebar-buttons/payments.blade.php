@php
    $dropdownRoute = $route ?? 'payments';
    $dropdownLabel = $label ?? 'Payments';
    $dropdownIcon = $icon ?? 'fa-solid fa-money-bill-transfer';
    $dropdownBadge = $badge ?? '3 Parts';
    $isExpanded = $isExpanded ?? request()->is('payments*');
    $isActive = $isActive ?? request()->is('payments*');
    unset($label, $icon, $badge, $route, $view, $active);
@endphp
<div class="nav-dropdown {{ $isExpanded ? 'expanded' : '' }}" id="paymentsDropdown">
    <button type="button" class="nav-link nav-dropdown-toggle {{ $isActive ? 'active' : '' }}" data-route="{{ $dropdownRoute }}" id="navLinkPayments" title="{{ $dropdownLabel }}">
        <i class="{{ $dropdownIcon }}"></i>
        <span>{{ $dropdownLabel }}</span>
        @if(!empty($dropdownBadge))
            <span class="nav-pill-badge">{{ $dropdownBadge }}</span>
        @endif
        <i class="fa-solid fa-chevron-down nav-caret"></i>
    </button>
    <div class="nav-submenu" id="paymentsSubmenu">
        @include('ui::components.sidebar-buttons.invoice-payment')
        @include('ui::components.sidebar-buttons.grn-payment')
        @include('ui::components.sidebar-buttons.operating-expenses')
    </div>
</div>

