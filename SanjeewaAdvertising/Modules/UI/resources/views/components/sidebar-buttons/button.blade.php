@php
    $route = $route ?? '';
    $view = $view ?? null;
    $label = $label ?? '';
    $icon = $icon ?? '';
    $badge = $badge ?? null;
    $badgeClass = $badgeClass ?? 'nav-pill-badge';
    $customClass = $class ?? '';
    $active = $active ?? false;
    
    // Resolve URL if possible
    $url = $url ?? ($route ? (
        $route === 'dashboard' ? route('admin.dashboard') :
        ($route === 'user-control' ? route('admin.user-control') :
        (Route::has('ui.' . $route) ? route('ui.' . $route, !empty($view) ? ['view' => $view] : []) : '/' . $route))
    ) : null);
@endphp
@if(!empty($url))
<a href="{{ $url }}" 
   class="nav-link {{ $active ? 'active' : '' }} {{ $customClass }}" 
   data-route="{{ $route }}" 
   @if(!empty($view)) data-view="{{ $view }}" @endif 
   title="{{ $label }}">
    @if(!empty($icon))
        <i class="{{ $icon }}"></i>
    @endif
    <span>{{ $label }}</span>
    @if(!empty($badge))
        <span class="{{ $badgeClass }}">{{ $badge }}</span>
    @endif
</a>
@else
<button type="button" 
        class="nav-link {{ $active ? 'active' : '' }} {{ $customClass }}" 
        data-route="{{ $route }}" 
        @if(!empty($view)) data-view="{{ $view }}" @endif 
        title="{{ $label }}">
    @if(!empty($icon))
        <i class="{{ $icon }}"></i>
    @endif
    <span>{{ $label }}</span>
    @if(!empty($badge))
        <span class="{{ $badgeClass }}">{{ $badge }}</span>
    @endif
</button>
@endif

