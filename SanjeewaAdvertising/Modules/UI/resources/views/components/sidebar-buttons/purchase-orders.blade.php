@php
    $url = $url ?? (route('ui.grn') . '?view=po');
    $route = $route ?? 'grn';
    $view = $view ?? 'po';
    $label = $label ?? 'Purchase Orders (PO)';
    $icon = $icon ?? 'fa-solid fa-clipboard-list';
    $active = $active ?? (request()->is('grn*') && request('view') === 'po');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-view="{{ $view }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

