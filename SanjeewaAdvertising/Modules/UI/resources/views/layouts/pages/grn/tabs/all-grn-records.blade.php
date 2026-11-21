<!-- ======================================================================
     VIEW A: ALL GRN DIRECTORY & TABLE VIEW
     ====================================================================== -->
<div id="grnListView" @if(request()->has('view') && request('view') !== 'list') style="display: none;" @endif>
  <div class="grn-card">
    <!-- Toolbar Controls -->
    <div class="grn-toolbar">
      <div class="grn-toolbar-left">
        <!-- Search Bar -->
        <div class="grn-search-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="grnSearchInput" name="grn_search" aria-label="Search GRN records" class="grn-search-input" placeholder="Search by GRN #, PO #, supplier, contact...">
        </div>

        <!-- Supplier Filter -->
        <select id="grnSupplierFilter" name="grn_supplier_filter" class="grn-select" aria-label="Filter by Supplier">
          <option value="ALL">All Suppliers</option>
        </select>

        <!-- Status Filter -->
        <select id="grnStatusFilter" name="grn_status_filter" class="grn-select" aria-label="Filter by Status">
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div class="grn-toolbar-right">
        <span id="grnTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
          Showing GRNs...
        </span>
      </div>
    </div>

    <!-- Main GRN Data Table -->
    <div class="inv-table-responsive">
      <table class="ant-table">
        <thead>
          <tr>
            <th style="width: 140px;">GRN No</th>
            <th style="width: 180px;">Supplier</th>
            <th style="width: 160px;">Supplier Contact</th>
            <th style="width: 130px;">Received Date</th>
            <th style="width: 150px;">Purchase Order</th>
            <th class="text-right" style="width: 150px;">Net Total</th>
            <th style="width: 130px;">Received By</th>
            <th style="width: 130px;">Status</th>
            <th class="text-center" style="width: 140px;">Actions</th>
          </tr>
        </thead>
        <tbody id="grnTableBody">
          <!-- Dynamically populated via js/grn.js -->
        </tbody>
      </table>
    </div>

    <!-- GRN Table Pagination (Visible only when results > 20) -->
    <div class="grn-pagination-bar" id="grnPaginationBar" style="display: none;">
      <div class="grn-pagination-info" id="grnPaginationInfo"></div>
      <div class="grn-pagination-controls" id="grnPaginationControls"></div>
    </div>
  </div>
</div>
