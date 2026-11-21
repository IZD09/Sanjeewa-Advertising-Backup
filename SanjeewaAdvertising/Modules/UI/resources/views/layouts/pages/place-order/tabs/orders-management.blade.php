<!-- Order Management Panel -->
<section class="po-card">
  <div class="po-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
    <div>
      <h2 class="po-card-title">
        <i class="fa-solid fa-list-check"></i> Orders Management Panel
      </h2>
      <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
        Manage existing printing jobs, view audit details, record multiple installments, and print receipts
      </div>
    </div>
    <button type="button" class="po-btn po-btn-primary" id="openCreateOrderModalBtn" onclick="window.placeOrderApp?.openModal('createOrderModal')" style="display: inline-flex; align-items: center; gap: 8px; height: 38px; font-size: 12.5px;">
      <i class="fa-solid fa-plus"></i> Create New Order
    </button>
  </div>

  <!-- Table Search & Filter Toolbar -->
  <div class="po-table-toolbar">
    <div class="po-search-box">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input type="text" id="orderSearchInput" placeholder="Search by Order ID, Customer, Phone, Product, or Date/Time...">
    </div>

    <div class="po-filter-group">
      <select id="orderStatusFilter" class="po-filter-select" aria-label="Filter by order status">
        <option value="ALL">All Order Statuses</option>
        @php
          $filterStatuses = \Modules\PrintJob\Models\PrintJobStatus::query()->orderBy('id')->get();
        @endphp
        @forelse($filterStatuses as $st)
          @php
            $stName = data_get($st, 'print_job_states') ?? data_get($st, 'name');
          @endphp
          <option value="{{ $stName }}">{{ $stName }}</option>
        @empty
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        @endforelse
      </select>

      <select id="orderPaymentFilter" class="po-filter-select" aria-label="Filter by payment status">
        <option value="ALL">All Payment Statuses</option>
        <option value="Paid">Fully Paid (Paid)</option>
        <option value="Partially Paid">Partially Paid</option>
        <option value="Unpaid">Unpaid (Pending)</option>
      </select>
    </div>
  </div>

  <!-- Responsive Order Table -->
  <div class="po-table-responsive">
    <table class="po-table">
      <thead>
        <tr>
          <th style="cursor: pointer;" data-sort="id">Order ID <i class="fa-solid fa-sort" style="font-size: 10px; opacity: 0.6; margin-left: 3px;"></i></th>
          <th style="cursor: pointer;" data-sort="customerName">Customer Name <i class="fa-solid fa-sort" style="font-size: 10px; opacity: 0.6; margin-left: 3px;"></i></th>
          <th>Product & Specs</th>
          <th style="cursor: pointer;" data-sort="quantity">Qty <i class="fa-solid fa-sort" style="font-size: 10px; opacity: 0.6; margin-left: 3px;"></i></th>
          <th style="cursor: pointer;" data-sort="totalAmount">Total (Rs.) <i class="fa-solid fa-sort" style="font-size: 10px; opacity: 0.6; margin-left: 3px;"></i></th>
          <th style="cursor: pointer;" data-sort="paymentStatus">Payment Status <i class="fa-solid fa-sort" style="font-size: 10px; opacity: 0.6; margin-left: 3px;"></i></th>
          <th style="cursor: pointer;" data-sort="requiredDate">Deadline <i class="fa-solid fa-sort" style="font-size: 10px; opacity: 0.6; margin-left: 3px;"></i></th>
          <th style="cursor: pointer;" data-sort="orderStatus">Order Status <i class="fa-solid fa-sort" style="font-size: 10px; opacity: 0.6; margin-left: 3px;"></i></th>
          <th>Assigned</th>
          <th style="text-align: center;">Actions</th>
        </tr>
      </thead>
      <tbody id="ordersTableBody">
        <!-- Dynamically populated rows -->
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="po-pagination">
    <div id="paginationInfo">Showing 1-10 orders</div>
    <div class="pagination-controls" id="paginationControls"></div>
  </div>
</section>
