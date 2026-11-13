<!-- Sales & Orders: Table View -->
<div class="rep-view-section rep-table-section active" data-section-mode="table">
    <!-- Table Toolbar -->
    <div class="rep-tab-toolbar">
        <div class="rep-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="searchSalesTable" name="searchSalesTable" class="rep-table-search" data-target-table="salesTable" placeholder="Search customer, order #, or print type..." aria-label="Search Sales Orders">
        </div>
        <div class="rep-toolbar-controls">
            <select id="filterSalesPrintType" name="filterSalesPrintType" class="rep-filter-select" data-target-table="salesTable" aria-label="Filter Print Type">
                <option value="all">All Print Types</option>
                <option value="banner">Flex Banner</option>
                <option value="vinyl">Vinyl Sticker</option>
                <option value="flyer">Leaflets &amp; Flyers</option>
                <option value="custom">Custom Printing</option>
            </select>
            <div class="rep-sort-group">
                <span class="rep-sort-label"><i class="fa-solid fa-arrow-up-wide-short"></i> Sort:</span>
                <select id="sortSalesTable" name="sortSalesTable" class="rep-sort-select" data-target-table="salesTable" aria-label="Sort Sales Table">
                    <option value="0:desc:text">Order # (Newest First)</option>
                    <option value="0:asc:text">Order # (Oldest First)</option>
                    <option value="7:desc:number">Total Amount (High to Low)</option>
                    <option value="7:asc:number">Total Amount (Low to High)</option>
                    <option value="4:desc:number">Quantity (High to Low)</option>
                    <option value="4:asc:number">Quantity (Low to High)</option>
                    <option value="1:asc:text">Customer Name (A - Z)</option>
                    <option value="5:desc:date">Order Date (Newest)</option>
                    <option value="6:asc:text">Order Status (A - Z)</option>
                </select>
            </div>
            <button type="button" class="rep-btn-reset-table" data-target-table="salesTable" title="Reset Sort & Filters">
                <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
            <div class="rep-stats-badges">
                <span class="rep-stat-chip chip-blue"><i class="fa-solid fa-list-check"></i> {{ is_countable($orders ?? null) ? count($orders) : 0 }} Recent Orders</span>
            </div>
        </div>
    </div>

    <!-- Data Table -->
    <div class="rep-table-wrap">
        <table class="rep-table" id="salesTable">
            <thead>
                <tr>
                    <th class="rep-sortable" data-sort-col="0" data-sort-type="text">Order # <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="1" data-sort-type="text">Customer Name <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="2" data-sort-type="text">Mobile Contact <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="3" data-sort-type="text">Print Category <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="4" data-sort-type="number">Quantity <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="5" data-sort-type="date">Order Date <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="6" data-sort-type="text">Status <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="7" data-sort-type="number">Total (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                </tr>
            </thead>
            <tbody id="salesTableBody">
                @forelse($orders ?? [] as $idx => $order)
                    @php
                        $isObj = is_object($order);
                        $id = $isObj ? $order->id : ($order['id'] ?? $idx);
                        $custName = $isObj ? ($order->customer_name ?? 'Walk-in Customer') : ($order['customer_name'] ?? 'Walk-in Customer');
                        $mobile = $isObj ? ($order->mobile ?? '—') : ($order['mobile'] ?? '—');
                        $printType = $isObj ? ($order->print_type ?? 'Custom Print') : ($order['print_category'] ?? 'Custom Print');
                        $qty = $isObj ? ($order->qty ?? 1) : ($order['quantity'] ?? 1);
                        $addDate = $isObj ? ($order->add_date ?? now()) : ($order['order_date'] ?? now());
                        $status = $isObj ? ($order->live_status ?? $order->status ?? 'Pending') : ($order['status'] ?? $order['live_status'] ?? 'Pending');
                        $estTotal = (float) ($isObj ? ($order->total_amount ?? $order->payment ?? ($qty * 650)) : ($order['total_amount'] ?? $order['payment'] ?? ($qty * 650)));
                        $badgeClass = in_array(strtolower($status), ['completed', 'delivered', 'paid', 'approved']) ? 'badge-paid' : (in_array(strtolower($status), ['printing', 'designing']) ? 'badge-info' : 'badge-pending');
                    @endphp
                    <tr>
                        <td><strong>#PJ-{{ str_pad($id, 4, '0', STR_PAD_LEFT) }}</strong></td>
                        <td>{{ $custName }}</td>
                        <td>{{ $mobile }}</td>
                        <td><span class="rep-badge badge-info">{{ $printType }}</span></td>
                        <td class="num-col">{{ number_format($qty) }} pcs</td>
                        <td>{{ date('Y-m-d', strtotime($addDate)) }}</td>
                        <td><span class="rep-badge {{ $badgeClass }}">{{ $status }}</span></td>
                        <td class="num-col">Rs. {{ number_format($estTotal, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">No sales orders recorded yet.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Pagination Controls -->
    <div class="rep-pagination-wrap">
        <span class="rep-pagination-info" id="salesPaginationInfo"></span>
        <div class="rep-pagination-controls" id="salesPaginationControls"></div>
    </div>
</div>
