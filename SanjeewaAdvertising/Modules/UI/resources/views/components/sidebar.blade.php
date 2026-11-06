<!-- Reusable Sidebar Component with Dynamic Content & Role-Based Navigation -->
@php
    /**
     * Determine whether the current view is for Admin or User (Staff).
     * Priority:
     * 1. Explicit variable $role ('admin'|'user') or $isAdmin (true|false)
     * 2. Query param '?role=admin|user' or '?portal=admin|user'
     * 3. Authenticated guard (auth('admin')->check())
     * 4. Explicit Admin route check (request()->is('admin*') || request()->routeIs('admin.*'))
     * 5. Definitively user routes (request()->is('place-order*') || request()->is('print-jobs*'))
     * 6. Definitively admin routes (request()->is('dashboard*') || request()->is('reports*') || request()->is('payments*') || request()->is('inventory*') || request()->is('grn*') || request()->is('/'))
     * 7. Cookie or session 'sa_portal' / 'active_portal' (for shared pages like /customers and /settings)
     * 8. Regular user authentication check
     */
    if (isset($role)) {
        $isAdmin = ($role === 'admin');
    } elseif (isset($isAdmin)) {
        $isAdmin = (bool) $isAdmin;
    } elseif (request()->has('role')) {
        $isAdmin = (request('role') === 'admin');
    } elseif (request()->has('portal')) {
        $isAdmin = (request('portal') === 'admin');
    } elseif (auth('admin')->check()) {
        $isAdmin = true;
    } elseif (request()->is('admin*') || request()->routeIs('admin.*')) {
        $isAdmin = true;
    } elseif (request()->is('place-order*') || request()->is('print-jobs*')) {
        $isAdmin = false;
        if (session()->isStarted()) {
            session(['active_portal' => 'user']);
        }
    } elseif (request()->is('dashboard*') || request()->is('reports*') || request()->is('payments*') || request()->is('inventory*') || request()->is('grn*') || request()->is('user-control*') || request()->is('admin/user-control*') || request()->is('/')) {
        $isAdmin = true;
        if (session()->isStarted()) {
            session(['active_portal' => 'admin']);
        }
    } elseif (request()->cookie('sa_portal') === 'user' || (session()->isStarted() && session('active_portal') === 'user')) {
        $isAdmin = false;
    } elseif (auth('web')->check() && !auth('admin')->check()) {
        $isAdmin = false;
    } else {
        $isAdmin = true;
        if (session()->isStarted()) {
            session(['active_portal' => 'admin']);
        }
    }

    $currentRole = $isAdmin ? 'admin' : 'user';
    $workspaceLabel = $workspaceLabel ?? ($isAdmin ? 'ADMIN WORKSPACE' : 'STAFF WORKSPACE');

    /**
     * Admin Navigation:
     * admin[dashboard, sales-revenue, customers, payments, reports, purchase-orders, stock-management, goods-received, settings]
     */
    $adminNavigation = [
        [
            'type' => 'group',
            'items' => [
                ['component' => 'dashboard'],
                ['component' => 'sales-revenue'],
            ],
        ],
        [
            'type' => 'group',
            'section' => 'SALES & ORDERS',
            'items' => [
                ['component' => 'customers'],
                ['component' => 'payments'],
                ['component' => 'reports'],
            ],
        ],
        [
            'type' => 'group',
            'section' => 'INVENTORY',
            'items' => [
                ['component' => 'purchase-orders'],
                ['component' => 'stock-management'],
                ['component' => 'goods-received'],
            ],
        ],
        [
            'type' => 'group',
            'section' => 'MANAGEMENT',
            'items' => [
                ['component' => 'user-control'],
                ['component' => 'admin-profile'],
                ['component' => 'settings'],
            ],
        ],
    ];

    /**
     * User Navigation:
     * user[print-jobs, design-management, place-order, customers, quotations-invoices, settings]
     */
    $userNavigation = [
        [
            'type' => 'group',
            'items' => [
                ['component' => 'print-jobs'],
                ['component' => 'design-management'],
            ],
        ],
        [
            'type' => 'group',
            'section' => 'SALES & ORDERS',
            'items' => [
                ['component' => 'place-order'],
                ['component' => 'customers'],
                ['component' => 'quotations-invoices'],
            ],
        ],
        [
            'type' => 'group',
            'section' => 'MANAGEMENT',
            'items' => [
                ['component' => 'settings'],
            ],
        ],
    ];

    // Filter staff navigation based on database permissions
    if (! $isAdmin && ($authUser = auth('web')->user())) {
        $componentModuleMap = [
            'print-jobs' => 'Print Jobs',
            'design-management' => 'Design Management',
            'place-order' => 'Place Order',
            'customers' => 'Customers',
            'quotations-invoices' => 'Quotations & Invoices',
            'settings' => 'Settings',
            'dashboard' => 'Dashboard',
            'inventory' => 'Inventory',
            'goods-received' => 'GRN & Purchase Orders',
            'purchase-orders' => 'GRN & Purchase Orders',
            'payments' => 'Payments & Financials',
            'reports' => 'Reports',
            'user-control' => 'User Control',
        ];

        $filteredUserNav = [];
        foreach ($userNavigation as $group) {
            $filteredItems = [];
            foreach ($group['items'] ?? [] as $item) {
                $comp = $item['component'] ?? '';
                $modName = $componentModuleMap[$comp] ?? $comp;
                if ($authUser->canAccessModule($modName)) {
                    $filteredItems[] = $item;
                }
            }
            if (! empty($filteredItems)) {
                $group['items'] = $filteredItems;
                $filteredUserNav[] = $group;
            }
        }
        $userNavigation = $filteredUserNav;
    }

    // Allow overriding from layout via $sidebarNavigation or $navigation
    $sidebarNavigation = $sidebarNavigation ?? $navigation ?? ($isAdmin ? $adminNavigation : $userNavigation);
@endphp

<div id="sidebarContainer">
  <aside class="sidebar" id="sidebar" data-portal="{{ $currentRole }}" aria-label="Main Navigation">
    @include('ui::components.sidebar-buttons.brand', [
        'brandSubtitle' => $isAdmin ? 'ADMINISTRATOR' : 'ADVERTISING'
    ])

    <div class="workspace-label">{{ $workspaceLabel }}</div>

    <nav class="navigation" id="mainNavigation">
      @foreach($sidebarNavigation as $group)
        @if(!empty($group['section']))
          @include('ui::components.sidebar-buttons.section', ['title' => $group['section']])
        @endif

        @if(!empty($group['items']) && is_array($group['items']))
          @foreach($group['items'] as $item)
            @if(isset($item['component']))
              @include('ui::components.sidebar-buttons.' . $item['component'], $item['props'] ?? [])
            @elseif(isset($item['route']))
              @include('ui::components.sidebar-buttons.button', $item)
            @endif
          @endforeach
        @endif
      @endforeach

      @isset($extraButtons)
        {{ $extraButtons }}
      @endisset
    </nav>

    @include('ui::components.sidebar-buttons.footer', [
        'isAdmin' => $isAdmin,
        'role' => $currentRole
    ])
  </aside>
</div>
