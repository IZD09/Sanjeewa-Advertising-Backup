@php
    $settingsPath = storage_path('app/settings.json');
    $shopSettings = [];
    if (file_exists($settingsPath)) {
        $saved = json_decode((string) file_get_contents($settingsPath), true);
        if (is_array($saved)) {
            $shopSettings = $saved;
        }
    }
    $shopName = $shopSettings['shop_name'] ?? 'Visual Line Advertising';
    $shopLogoUrl = $shopSettings['logo_url'] ?? '/uploads/branding/visual_line_advertising_logo.png';
    $shopLogoIcon = $shopSettings['logo_icon'] ?? 'fa-solid fa-print';

    $words = explode(' ', trim($shopName));
    if (count($words) >= 3 && strtolower(end($words)) === 'advertising') {
        $defaultMain = implode(' ', array_slice($words, 0, -1)); // "Visual Line"
        $defaultSub = end($words); // "Advertising"
    } elseif (count($words) === 2) {
        $defaultMain = $words[0];
        $defaultSub = $words[1];
    } else {
        $defaultMain = $shopName;
        $defaultSub = ($isAdmin ?? false) ? 'ADMINISTRATOR' : 'ADVERTISING';
    }

    $brandName = $brandName ?? $defaultMain;
    $brandSubtitle = ($isAdmin ?? false) ? 'ADMINISTRATOR' : strtoupper($defaultSub);
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

