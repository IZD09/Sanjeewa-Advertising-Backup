<!-- ==================================================================
     VIEW B: PURCHASE ORDERS (PO) DIRECTORY & TRACKING VIEW
     ================================================================== -->
<div id="grnPOView" @if(request('view') !== 'po') style="display: none;" @endif>
  <div class="grn-card">
    <!-- PO Toolbar Controls -->
    <div class="grn-toolbar">
      <div class="grn-toolbar-left">
        <!-- Search Bar -->
        <div class="grn-search-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="poSearchInput" name="po_search" aria-label="Search Purchase Orders" class="grn-search-input" placeholder="Search by PO #, supplier, materials...">
        </div>

        <!-- Supplier Filter -->
        <select id="poSupplierFilter" name="po_supplier_filter" class="grn-select" aria-label="Filter by Supplier">
          <option value="ALL">All Suppliers</option>
        </select>

        <!-- Status Filter -->
        <select id="poStatusFilter" name="po_status_filter" class="grn-select" aria-label="Filter by Status">
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending (Awaiting GRN)</option>
          <option value="Partial">Partial (Partially Received)</option>
          <option value="Completed">Completed (Fully Received)</option>
        </select>
      </div>

      <div class="grn-toolbar-right">
        <button type="button" class="ant-btn ant-btn-primary" id="poToolbarCreateBtn">
          <i class="fa-solid fa-plus"></i> + Create Purchase Order
        </button>
      </div>
    </div>

    <!-- PO Table -->
    <div class="inv-table-responsive">
      <table class="ant-table">
        <thead>
          <tr>
            <th style="width: 140px;">PO Number</th>
            <th style="width: 120px;">Order Date</th>
            <th style="width: 130px;">Expected Date</th>
            <th style="width: 180px;">Supplier / Vendor</th>
            <th style="min-width: 220px; max-width: 320px;">Ordered Materials</th>
            <th class="text-right" style="width: 140px;">Estimated Total</th>
            <th style="width: 120px;">Status</th>
            <th class="text-center" style="width: 190px;">Actions</th>
          </tr>
        </thead>
        <tbody id="poTableBody">
          <!-- Dynamically populated via js/grn.js -->
        </tbody>
      </table>
    </div>

    <!-- PO Table Pagination (Visible only when results > 20) -->
    <div class="grn-pagination-bar" id="poPaginationBar" style="display: none;">
      <div class="grn-pagination-info" id="poPaginationInfo"></div>
      <div class="grn-pagination-controls" id="poPaginationControls"></div>
    </div>
  </div>
</div>
