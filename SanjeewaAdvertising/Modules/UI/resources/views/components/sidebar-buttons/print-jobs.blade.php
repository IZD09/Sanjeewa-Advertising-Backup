@php
    $url = $url ?? route('ui.print-jobs');
    $route = $route ?? 'print-jobs';
    $label = $label ?? 'Print Jobs';
    $icon = $icon ?? 'fa-solid fa-print';
    $active = $active ?? (request()->is('print-jobs*') && request('view') !== 'design');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>

