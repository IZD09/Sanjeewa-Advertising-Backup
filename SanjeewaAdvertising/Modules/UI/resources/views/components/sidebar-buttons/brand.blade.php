@php
    $brandName = $brandName ?? 'Sanjeewa';
    $brandSubtitle = $brandSubtitle ?? 'ADVERTISING';
    $brandIcon = $brandIcon ?? 'fa-solid fa-print';
@endphp
<div class="brand">
    <div class="brand-logo"><i class="{{ $brandIcon }}"></i></div>
    <div class="brand-text">
        <strong>{{ $brandName }}</strong>
        <span>{{ $brandSubtitle }}</span>
    </div>
    <button class="icon-button sidebar-close" id="sidebarClose" aria-label="Close sidebar" title="Close sidebar">
        <i class="fa-solid fa-xmark"></i>
    </button>
</div>

