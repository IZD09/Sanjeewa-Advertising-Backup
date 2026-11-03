@php
    $url = $url ?? (route('ui.print-jobs') . '?view=design');
    $route = $route ?? 'print-jobs';
    $view = $view ?? 'design';
    $label = $label ?? 'Design Management';
    $icon = $icon ?? 'fa-solid fa-pen-ruler';
    $active = $active ?? (request()->is('print-jobs*') && request('view') === 'design');
@endphp
<a href="{{ $url }}" class="nav-link {{ $active ? 'active' : '' }}" data-route="{{ $route }}" data-view="{{ $view }}" title="{{ $label }}">
    <i class="{{ $icon }}"></i>
    <span>{{ $label }}</span>
</a>
