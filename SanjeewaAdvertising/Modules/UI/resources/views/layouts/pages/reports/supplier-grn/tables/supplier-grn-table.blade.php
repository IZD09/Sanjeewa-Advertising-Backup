<!-- Supplier & GRN: Table View -->
<div class="rep-view-section rep-table-section active" data-section-mode="table">
    <div class="rep-tab-toolbar">
        <div class="rep-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="rep-table-search" data-target-table="suppliersTable" placeholder="Search supplier name or phone...">
        </div>
        <div class="rep-toolbar-controls">
            <div class="rep-sort-group">
                <span class="rep-sort-label"><i class="fa-solid fa-arrow-up-wide-short"></i> Sort:</span>
                <select class="rep-sort-select" data-target-table="suppliersTable">
                    <option value="6:desc:number">Pending Payable (High to Low)</option>
                    <option value="6:asc:number">Pending Payable (Low to High)</option>
                    <option value="4:desc:number">GRN Purchases (High to Low)</option>
                    <option value="5:desc:number">Total Paid (High to Low)</option>
                    <option value="1:asc:text">Supplier Name (A - Z)</option>
                </select>
            </div>
            <button type="button" class="rep-btn-reset-table" data-target-table="suppliersTable" title="Reset Sort & Search">
                <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
        </div>
    </div>

    <div class="rep-table-wrap">
        <table class="rep-table" id="suppliersTable">
            <thead>
                <tr>
                    <th class="rep-sortable" data-sort-col="0" data-sort-type="text">Supplier ID <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="1" data-sort-type="text">Supplier / Vendor Name <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="2" data-sort-type="text">Contact Phone <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="3" data-sort-type="text">Email Address <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="4" data-sort-type="number">GRN Purchases <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="5" data-sort-type="number">Total Paid <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="6" data-sort-type="number">Pending Payable (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                </tr>
            </thead>
            <tbody id="suppliersTableBody">
                @php
                    $supRows = $suppliers ?? [];
                    if (isset($supRows['data']) && is_iterable($supRows['data'])) {
                        $supRows = $supRows['data'];
                    }
                @endphp
                @forelse($supRows as $sIdx => $sup)
                    @php
                        $isObj = is_object($sup);
                        $supId = $isObj ? ($sup->id ?? ($sIdx + 1)) : ($sup['id'] ?? ($sIdx + 1));
                        $supName = $isObj ? ($sup->name ?? $sup->supplier_name ?? '—') : ($sup['supplier_name'] ?? $sup['name'] ?? '—');
                        $supMobile = $isObj ? ($sup->mobile ?? '—') : ($sup['mobile'] ?? '—');
                        $supEmail = $isObj ? ($sup->email ?? '—') : ($sup['email'] ?? '—');
                        $supPurchases = (float) ($isObj ? ($sup->total_purchases ?? 0) : ($sup['total_purchases'] ?? 0));
                        $supPaid = (float) ($isObj ? ($sup->amount_paid ?? 0) : ($sup['amount_paid'] ?? 0));
                        $supPayable = (float) ($isObj ? ($sup->pending_payable ?? max(0, $supPurchases - $supPaid)) : ($sup['pending_payable'] ?? max(0, $supPurchases - $supPaid)));
                    @endphp
                    <tr>
                        <td><strong>#SUP-{{ str_pad((string)$supId, 3, '0', STR_PAD_LEFT) }}</strong></td>
                        <td><strong>{{ $supName }}</strong></td>
                        <td>{{ $supMobile ?: '—' }}</td>
                        <td>{{ $supEmail ?: '—' }}</td>
                        <td class="num-col">Rs. {{ number_format($supPurchases, 2) }}</td>
                        <td class="num-col">Rs. {{ number_format($supPaid, 2) }}</td>
                        <td class="num-col" style="color: {{ $supPayable > 0 ? '#dc2626' : '#059669' }}; font-weight: 700;">Rs. {{ number_format($supPayable, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center" style="padding: 24px; color: #64748b;">No supplier & GRN records found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Supplier & GRN Pagination Controls -->
    <div class="rep-pagination-wrap">
        <span class="rep-pagination-info" id="suppliersPaginationInfo"></span>
        <div class="rep-pagination-controls" id="suppliersPaginationControls"></div>
    </div>
</div>
