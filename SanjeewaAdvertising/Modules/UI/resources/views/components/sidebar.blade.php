<!-- Reusable Sidebar Component (Defined in components/sidebar.html) -->
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
          <a href="#dashboard" class="nav-link active" data-route="dashboard">
            <i class="fa-solid fa-gauge-high"></i><span>Dashboard</span>
          </a>
          <a href="#reports" class="nav-link" data-route="reports">
            <i class="fa-solid fa-chart-line"></i><span>Sales & Revenue</span>
          </a>
          <a href="#print-jobs" class="nav-link" data-route="print-jobs">
            <i class="fa-solid fa-print"></i><span>Print Jobs</span>
          </a>
          <a href="#print-jobs" class="nav-link" data-route="print-jobs">
            <i class="fa-solid fa-pen-ruler"></i><span>Design Management</span>
          </a>

          <div class="nav-section">SALES & ORDERS</div>
          <a href="#place-order" class="nav-link" data-route="place-order" data-view="form">
            <i class="fa-solid fa-cart-plus"></i><span>Place Order</span>
          </a>
          <a href="#customers" class="nav-link" data-route="customers">
            <i class="fa-solid fa-users"></i><span>Customers</span>
          </a>
          <a href="#place-order" class="nav-link" data-route="place-order" data-view="orders">
            <i class="fa-solid fa-file-invoice"></i><span>Quotations & Invoices</span>
          </a>
          <div class="nav-dropdown" id="paymentsDropdown">
            <a href="#payments" class="nav-link nav-dropdown-toggle" data-route="payments" id="navLinkPayments">
              <i class="fa-solid fa-money-bill-transfer"></i>
              <span>Payments</span>
              <span class="nav-pill-badge">2 Parts</span>
              <i class="fa-solid fa-chevron-down nav-caret"></i>
            </a>
            <div class="nav-submenu" id="paymentsSubmenu">
              <a href="#payments" class="nav-sublink" data-route="payments" data-view="invoice-payment">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>1. Invoice Payment</span>
                <span class="sub-badge job-badge">Job</span>
              </a>
              <a href="#payments" class="nav-sublink" data-route="payments" data-view="grn-payment">
                <i class="fa-solid fa-boxes-packing"></i>
                <span>2. GRN Payment</span>
                <span class="sub-badge stock-badge">Stock</span>
              </a>
            </div>
          </div>

          <div class="nav-section">INVENTORY</div>
          <a href="#inventory" class="nav-link" data-route="inventory">
            <i class="fa-solid fa-boxes-stacked"></i><span>Stock Management</span>
          </a>
          <a href="#grn" class="nav-link" data-route="grn" data-view="po">
            <i class="fa-solid fa-clipboard-list"></i><span>Purchase Orders (PO)</span>
          </a>
          <a href="#grn" class="nav-link" data-route="grn">
            <i class="fa-solid fa-file-invoice-dollar"></i><span>Goods Received (GRN)</span>
          </a>
          <a href="#inventory" class="nav-link" data-route="inventory">
            <i class="fa-solid fa-tags"></i><span>Categories</span>
          </a>
          <a href="#grn" class="nav-link" data-route="grn" data-view="suppliers">
            <i class="fa-solid fa-truck-field"></i><span>Suppliers</span>
          </a>

          <div class="nav-section">MANAGEMENT</div>
          <a href="#reports" class="nav-link" data-route="reports">
            <i class="fa-solid fa-chart-pie"></i><span>Reports</span>
          </a>
          <a href="#settings" class="nav-link" data-route="settings">
            <i class="fa-solid fa-gear"></i><span>Settings</span>
          </a>
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
