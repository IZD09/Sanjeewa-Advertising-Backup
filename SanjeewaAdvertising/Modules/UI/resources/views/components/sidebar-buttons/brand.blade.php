@php
    $settingsPath = storage_path('app/settings.json');
    $shopSettings = [];
    if (file_exists($settingsPath)) {
        $saved = json_decode((string) file_get_contents($settingsPath), true);
        if (is_array($saved)) {
            $shopSettings = $saved;
        }
    }
    $shopName = $shopSettings['shop_name'] ?? 'Sanjeewa Advertising';
    $shopLogoUrl = $shopSettings['logo_url'] ?? null;
    $shopLogoIcon = $shopSettings['logo_icon'] ?? 'fa-solid fa-print';

    $brandNameParts = explode(' ', $shopName, 2);
    $brandName = $brandName ?? ($brandNameParts[0] ?? 'Sanjeewa');
    $brandSubtitle = $brandSubtitle ?? ($brandNameParts[1] ?? ($isAdmin ?? false ? 'ADMINISTRATOR' : 'ADVERTISING'));
    $brandIcon = $brandIcon ?? $shopLogoIcon;
@endphp
<div class="brand">
    <div class="brand-logo" id="sidebarBrandLogo">
        @if(!empty($shopLogoUrl))
            <img src="{{ $shopLogoUrl }}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
        @else
            <i class="{{ $brandIcon }}"></i>
        @endif
    </div>
    <div class="brand-text">
        <strong id="sidebarBrandName">{{ $brandName }}</strong>
        <span id="sidebarBrandSub">{{ $brandSubtitle }}</span>
    </div>
    <button class="icon-button sidebar-close" id="sidebarClose" aria-label="Close sidebar" title="Close sidebar">
        <i class="fa-solid fa-xmark"></i>
    </button>
</div>

