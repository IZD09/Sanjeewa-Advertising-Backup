<!-- Customer Receivables: Table View -->
<div class="rep-view-section rep-table-section active" data-section-mode="table">
    <div class="rep-tab-toolbar">
        <div class="rep-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="rep-table-search" data-target-table="receivablesTable" placeholder="Search customer name or phone...">
        </div>
        <div class="rep-toolbar-controls">
            <div class="rep-sort-group">
                <span class="rep-sort-label"><i class="fa-solid fa-arrow-up-wide-short"></i> Sort:</span>
                <select class="rep-sort-select" data-target-table="receivablesTable">
                    <option value="7:desc:number">Balance Due (High to Low)</option>
                    <option value="7:asc:number">Balance Due (Low to High)</option>
                    <option value="5:desc:number">Total Invoiced (High to Low)</option>
                    <option value="6:desc:number">Amount Paid (High to Low)</option>
                    <option value="1:asc:text">Customer Name (A - Z)</option>
                    <option value="3:desc:date">Registered Date (Newest)</option>
                </select>
            </div>
            <button type="button" class="rep-btn-reset-table" data-target-table="receivablesTable" title="Reset Sort & Search">
                <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
        </div>
    </div>

    <div class="rep-table-wrap">
        <table class="rep-table" id="receivablesTable">
            <thead>
                <tr>
                    <th class="rep-sortable" data-sort-col="0" data-sort-type="text">Customer ID <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="1" data-sort-type="text">Customer Name <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="2" data-sort-type="text">Mobile Phone <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="3" data-sort-type="date">Registered Date <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="4" data-sort-type="text">Aging Status <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="5" data-sort-type="number">Total Invoiced <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="6" data-sort-type="number">Amount Paid <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="7" data-sort-type="number">Balance Due (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                </tr>
            </thead>
            <tbody id="receivablesTableBody">
                @php
                    $custRows = $customers ?? [];
                    if (isset($custRows['data']) && is_iterable($custRows['data'])) {
                        $custRows = $custRows['data'];
                    }
                @endphp
                @forelse($custRows as $i => $cust)
                    @php
                        $isObj = is_object($cust);
                        $custId = $isObj ? ($cust->id ?? ($i + 1)) : ($cust['id'] ?? ($i + 1));
                        $custName = $isObj ? ($cust->name ?? $cust->customer_name ?? '—') : ($cust['customer_name'] ?? $cust['name'] ?? '—');
                        $custMobile = $isObj ? ($cust->mobile ?? '—') : ($cust['mobile'] ?? '—');
                        $custDate = $isObj ? ($cust->last_invoice_date ?? $cust->register_at ?? '—') : ($cust['last_invoice_date'] ?? $cust['register_at'] ?? '—');
                        $custInvoiced = (float) ($isObj ? ($cust->total_invoiced ?? 0) : ($cust['total_invoiced'] ?? 0));
                        $custPaid = (float) ($isObj ? ($cust->amount_paid ?? 0) : ($cust['amount_paid'] ?? 0));
                        $due = (float) ($isObj ? ($cust->outstanding_balance ?? max(0, $custInvoiced - $custPaid)) : ($cust['outstanding_balance'] ?? max(0, $custInvoiced - $custPaid)));
                        $aging = $due <= 0 ? 'Cleared' : ($isObj ? ($cust->status ?? '1-30 Days') : ($cust['status'] ?? '1-30 Days'));
                        if ($aging === 'Pending') { $aging = '1-30 Days'; }
                        $badge = $due <= 0 ? 'badge-paid' : ($aging === '1-30 Days' ? 'badge-pending' : 'badge-overdue');
                    @endphp
                    <tr>
                        <td><strong>#CUST-{{ str_pad((string)$custId, 4, '0', STR_PAD_LEFT) }}</strong></td>
                        <td><strong>{{ $custName }}</strong></td>
                        <td>{{ $custMobile ?: '—' }}</td>
                        <td>{{ $custDate ?: '—' }}</td>
                        <td><span class="rep-badge {{ $badge }}">{{ $aging }}</span></td>
                        <td class="num-col">Rs. {{ number_format($custInvoiced, 2) }}</td>
                        <td class="num-col">Rs. {{ number_format($custPaid, 2) }}</td>
                        <td class="num-col" style="color: {{ $due > 0 ? '#dc2626' : '#059669' }}; font-weight: 700;">
                            Rs. {{ number_format($due, 2) }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center" style="padding: 24px; color: #64748b;">No customer receivables records found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Receivables Pagination Controls -->
    <div class="rep-pagination-wrap">
        <span class="rep-pagination-info" id="receivablesPaginationInfo"></span>
        <div class="rep-pagination-controls" id="receivablesPaginationControls"></div>
    </div>
</div>
