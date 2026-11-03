@php
    $isAdmin = $isAdmin ?? ($role === 'admin' ?? (auth('admin')->check() || session('active_portal') === 'admin'));
    $currentUser = $isAdmin ? (auth('admin')->user() ?? auth('web')->user()) : (auth('web')->user() ?? auth('admin')->user());
    
    $defaultName = $isAdmin ? 'Admin User' : 'Staff Member';
    $userName = $userName ?? ($currentUser ? ($currentUser->name ?? $currentUser->username ?? $defaultName) : $defaultName);
    $userRole = $userRole ?? ($isAdmin ? 'Administrator' : ($currentUser->role ?? 'Staff'));
    
    // Generate initials (e.g. SA, ST)
    $words = explode(' ', trim($userName));
    $initials = '';
    foreach (array_slice($words, 0, 2) as $w) {
        $initials .= strtoupper(substr($w, 0, 1));
    }
    $initials = $initials ?: ($isAdmin ? 'AU' : 'SM');
@endphp
<div class="sidebar-footer">
    <div class="avatar">{{ $initials }}</div>
    <div class="user-details">
        <strong>{{ $userName }}</strong>
        <span>{{ $userRole }}</span>
    </div>
    <i class="fa-solid fa-ellipsis"></i>
</div>
