<!-- Reusable Sidebar Component -->
<div id="sidebarContainer">
  <aside class="sidebar" id="sidebar" aria-label="Main Navigation">
    <div class="brand">
      <div class="brand-logo"><i class="fa-solid fa-print"></i></div>
      <div class="brand-text">
        <strong>Sanjeewa</strong>
        <span>ADVERTISING</span>
      </div>
      <button class="icon-button sidebar-close" id="sidebarClose" aria-label="Close sidebar" title="Close sidebar">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="workspace-label">WORKSPACE</div>

    <nav class="navigation" id="mainNavigation">
      <button type="button" class="nav-link {{ request()->is('dashboard*') || request()->is('/') ? 'active' : '' }}" data-route="dashboard">
        <i class="fa-solid fa-gauge-high"></i><span>Dashboard</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('reports*') ? 'active' : '' }}" data-route="reports">
        <i class="fa-solid fa-chart-line"></i><span>Sales & Revenue</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('print-jobs*') ? 'active' : '' }}" data-route="print-jobs">
        <i class="fa-solid fa-print"></i><span>Print Jobs</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('print-jobs*') ? 'active' : '' }}" data-route="print-jobs">
        <i class="fa-solid fa-pen-ruler"></i><span>Design Management</span>
      </button>

      <div class="nav-section">SALES & ORDERS</div>
      <button type="button" class="nav-link {{ request()->is('place-order*') && !request()->has('view') ? 'active' : '' }}" data-route="place-order" data-view="form">
        <i class="fa-solid fa-cart-plus"></i><span>Place Order</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('customers*') ? 'active' : '' }}" data-route="customers">
        <i class="fa-solid fa-users"></i><span>Customers</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('place-order*') && request('view') === 'orders' ? 'active' : '' }}" data-route="place-order" data-view="orders">
        <i class="fa-solid fa-file-invoice"></i><span>Quotations & Invoices</span>
      </button>

      <div class="nav-dropdown {{ request()->is('payments*') ? 'expanded' : '' }}" id="paymentsDropdown">
        <button type="button" class="nav-link nav-dropdown-toggle {{ request()->is('payments*') ? 'active' : '' }}" data-route="payments" id="navLinkPayments">
          <i class="fa-solid fa-money-bill-transfer"></i>
          <span>Payments</span>
          <span class="nav-pill-badge">3 Parts</span>
          <i class="fa-solid fa-chevron-down nav-caret"></i>
        </button>
        <div class="nav-submenu" id="paymentsSubmenu">
          <button type="button" class="nav-sublink {{ request()->is('payments*') && request('view', 'invoice-payment') === 'invoice-payment' ? 'active' : '' }}" data-route="payments" data-view="invoice-payment">
            <i class="fa-solid fa-file-invoice-dollar"></i>
            <span>Invoice Payment</span>
            <span class="sub-badge job-badge">Job</span>
          </button>
          <button type="button" class="nav-sublink {{ request()->is('payments*') && request('view') === 'grn-payment' ? 'active' : '' }}" data-route="payments" data-view="grn-payment">
            <i class="fa-solid fa-boxes-packing"></i>
            <span>GRN Payment</span>
            <span class="sub-badge stock-badge">Stock</span>
          </button>
          <button type="button" class="nav-sublink {{ request()->is('payments*') && (request('view') === 'expenses' || request('view') === 'expense') ? 'active' : '' }}" data-route="payments" data-view="expenses">
            <i class="fa-solid fa-bolt-lightning"></i>
            <span>Operating Expenses</span>
            <span class="sub-badge expense-badge">Bills</span>
          </button>
        </div>
      </div>

      <div class="nav-section">INVENTORY</div>
      <button type="button" class="nav-link {{ request()->is('inventory*') && !request()->has('view') ? 'active' : '' }}" data-route="inventory">
        <i class="fa-solid fa-boxes-stacked"></i><span>Stock Management</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('grn*') && request('view') === 'po' ? 'active' : '' }}" data-route="grn" data-view="po">
        <i class="fa-solid fa-clipboard-list"></i><span>Purchase Orders (PO)</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('grn*') && request('view') !== 'po' ? 'active' : '' }}" data-route="grn">
        <i class="fa-solid fa-file-invoice-dollar"></i><span>Goods Received (GRN)</span>
      </button>

      <div class="nav-section">MANAGEMENT</div>
      <button type="button" class="nav-link {{ request()->is('reports*') ? 'active' : '' }}" data-route="reports">
        <i class="fa-solid fa-chart-pie"></i><span>Reports</span>
      </button>
      <button type="button" class="nav-link {{ request()->is('settings*') ? 'active' : '' }}" data-route="settings">
        <i class="fa-solid fa-gear"></i><span>Settings</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="avatar">SA</div>
      <div class="user-details">
        <strong>Admin User</strong>
        <span>Administrator</span>
      </div>
      <i class="fa-solid fa-ellipsis"></i>
    </div>
  </aside>
</div>
