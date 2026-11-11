<!-- Payments, Cash Flow & Operating Expenses: Table View -->
<div class="rep-view-section rep-table-section active" data-section-mode="table">
    <!-- Section 1: Unified 3-Channel Cash Flow & Operating Expenses Ledger -->
    <div class="rep-tab-toolbar">
        <div class="rep-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="rep-table-search" data-target-table="cashFlowTable" placeholder="Search transaction ID, operating expense, channel, or method...">
        </div>
        <div class="rep-toolbar-controls">
            <select class="rep-filter-select" data-target-table="cashFlowTable" aria-label="Filter Cash Flow Channel">
                <option value="all">All Channels (Inflow, Expenses &amp; GRN)</option>
                <option value="operating expense">Operating Expenses Only</option>
                <option value="customer inflow">Customer Inflows Only</option>
                <option value="grn supplier">GRN Supplier Outflows Only</option>
            </select>
            <div class="rep-sort-group">
                <span class="rep-sort-label"><i class="fa-solid fa-arrow-up-wide-short"></i> Sort:</span>
                <select class="rep-sort-select" data-target-table="cashFlowTable">
                    <option value="4:desc:date">Date (Newest First)</option>
                    <option value="4:asc:date">Date (Oldest First)</option>
                    <option value="6:desc:number">Amount (High to Low)</option>
                    <option value="6:asc:number">Amount (Low to High)</option>
                    <option value="1:asc:text">Channel Type (A - Z)</option>
                    <option value="3:asc:text">Payment Method (A - Z)</option>
                </select>
            </div>
            <button type="button" class="rep-btn-reset-table" data-target-table="cashFlowTable" title="Reset Sort & Search">
                <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
            <div class="rep-stats-badges">
                <span class="rep-stat-chip chip-green"><i class="fa-solid fa-arrow-down"></i> Inflow: Rs. {{ number_format($totalCollected ?? 0, 2) }}</span>
                <span class="rep-stat-chip chip-orange"><i class="fa-solid fa-receipt"></i> Operating Expenses: Rs. {{ number_format($totalExpenses ?? 0, 2) }}</span>
                <span class="rep-stat-chip chip-blue"><i class="fa-solid fa-boxes-packing"></i> GRN Outflow: Rs. {{ number_format($totalGrnPayments ?? 0, 2) }}</span>
            </div>
        </div>
    </div>

    <div class="rep-table-wrap" style="margin-bottom: 24px;">
        <table class="rep-table" id="cashFlowTable">
            <thead>
                <tr>
                    <th class="rep-sortable" data-sort-col="0" data-sort-type="text">Transaction ID <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="1" data-sort-type="text">Channel / Category <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="2" data-sort-type="text">Reference / Expense Type <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="3" data-sort-type="text">Payment Method / Staff <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="4" data-sort-type="date">Transaction Date <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="5" data-sort-type="text">Status <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="6" data-sort-type="number">Amount (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                </tr>
            </thead>
            <tbody id="cashFlowTableBody">
                @forelse($initialTables['payments']['data'] ?? [] as $tx)
                    @php
                        $isInflow = ($tx['direction'] ?? 'inflow') === 'inflow';
                        $channelClass = str_contains(strtolower($tx['channel'] ?? ''), 'expense')
                            ? 'badge-overdue'
                            : (str_contains(strtolower($tx['channel'] ?? ''), 'grn') ? 'badge-pending' : 'badge-paid');
                        $icon = str_contains(strtolower($tx['channel'] ?? ''), 'expense')
                            ? 'fa-receipt'
                            : (str_contains(strtolower($tx['channel'] ?? ''), 'grn') ? 'fa-truck-ramp-box' : 'fa-arrow-down');
                        $amountColor = $isInflow ? '#059669' : (str_contains(strtolower($tx['channel'] ?? ''), 'expense') ? '#dc2626' : '#d97706');
                        $amountPrefix = $isInflow ? '+ Rs. ' : '- Rs. ';
                    @endphp
                    <tr>
                        <td><strong>{{ $tx['transactionId'] ?? '—' }}</strong></td>
                        <td><span class="rep-badge {{ $channelClass }}"><i class="fa-solid {{ $icon }}"></i> {{ $tx['channel'] ?? '—' }}</span></td>
                        <td><strong>{{ $tx['reference'] ?? '—' }}</strong></td>
                        <td>{{ $tx['method'] ?? '—' }}</td>
                        <td>{{ $tx['date'] ?? '—' }}</td>
                        <td><span class="rep-badge {{ ($tx['status'] ?? '') === 'Completed' || ($tx['status'] ?? '') === 'Paid' ? 'badge-paid' : 'badge-pending' }}">{{ $tx['status'] ?? 'Completed' }}</span></td>
                        <td class="num-col" style="color: {{ $amountColor }}; font-weight: 700;">{{ $amountPrefix }}{{ number_format($tx['amount'] ?? 0, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No cash flow transactions recorded yet.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Cash Flow Pagination Controls -->
    <div class="rep-pagination-wrap" style="margin-bottom: 24px;">
        <span class="rep-pagination-info" id="cashFlowPaginationInfo"></span>
        <div class="rep-pagination-controls" id="cashFlowPaginationControls"></div>
    </div>

    <!-- Section 2: Dedicated Operating Expenses Detailed Breakdown Table -->
    <div class="rep-chart-card" style="padding: 18px 20px;">
        <div class="rep-chart-header" style="margin-bottom: 4px;">
            <span class="rep-chart-title">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                Operating Expenses &amp; Utility Bills Breakdown (ආයතනික වියදම් විස්තරය)
            </span>
            <div class="rep-stats-badges">
                <span class="rep-stat-chip chip-blue"><i class="fa-solid fa-coins"></i> Total: Rs. {{ number_format($totalExpenses ?? 0, 2) }}</span>
                <span class="rep-stat-chip chip-green"><i class="fa-solid fa-circle-check"></i> Paid: Rs. {{ number_format($paidExpensesTotal ?? 0, 2) }}</span>
                <span class="rep-stat-chip chip-orange"><i class="fa-solid fa-clock"></i> Pending: Rs. {{ number_format($pendingExpensesTotal ?? 0, 2) }}</span>
            </div>
        </div>

        <div class="rep-tab-toolbar" style="margin-bottom: 6px;">
            <div class="rep-search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" class="rep-table-search" data-target-table="operatingExpensesTable" placeholder="Search expense category (Rent, Electricity, Water...), staff, or status...">
            </div>
            <div class="rep-toolbar-controls">
                <select class="rep-filter-select" data-target-table="operatingExpensesTable" aria-label="Filter Operating Expense Status">
                    <option value="all">All Expense Statuses</option>
                    <option value="paid">Paid Bills Only</option>
                    <option value="pending">Pending Bills Only</option>
                </select>
                <div class="rep-sort-group">
                    <span class="rep-sort-label"><i class="fa-solid fa-arrow-up-wide-short"></i> Sort:</span>
                    <select class="rep-sort-select" data-target-table="operatingExpensesTable">
                        <option value="7:desc:number">Expense Amount (High to Low)</option>
                        <option value="7:asc:number">Expense Amount (Low to High)</option>
                        <option value="4:desc:date">Bill Date (Newest First)</option>
                        <option value="4:asc:date">Bill Date (Oldest First)</option>
                        <option value="1:asc:text">Expense Category (A - Z)</option>
                        <option value="6:asc:text">Settlement Status (A - Z)</option>
                    </select>
                </div>
                <button type="button" class="rep-btn-reset-table" data-target-table="operatingExpensesTable" title="Reset Operating Expenses Table">
                    <i class="fa-solid fa-rotate-left"></i> Reset
                </button>
            </div>
        </div>

        <div class="rep-table-wrap">
            <table class="rep-table" id="operatingExpensesTable">
                <thead>
                    <tr>
                        <th class="rep-sortable" data-sort-col="0" data-sort-type="text">Expense ID <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                        <th class="rep-sortable" data-sort-col="1" data-sort-type="text">Expense Category / Utility Bill <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                        <th class="rep-sortable" data-sort-col="2" data-sort-type="text">Added By <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                        <th class="rep-sortable" data-sort-col="3" data-sort-type="text">Paid By <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                        <th class="rep-sortable" data-sort-col="4" data-sort-type="date">Bill Added Date <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                        <th class="rep-sortable" data-sort-col="5" data-sort-type="date">Paid Date <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                        <th class="rep-sortable" data-sort-col="6" data-sort-type="text">Settlement Status <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                        <th class="num-col rep-sortable" data-sort-col="7" data-sort-type="number">Expense Amount (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    </tr>
                </thead>
                <tbody id="operatingExpensesTableBody">
                    @forelse($expensesList ?? [] as $exp)
                        @php
                            $isObj = is_object($exp);
                            $id = $isObj ? $exp->id : ($exp['id'] ?? 1);
                            $expType = $isObj ? ($exp->expencesess_type ?? 'Operating Overhead') : ($exp['expense_type'] ?? 'Operating Overhead');
                            $addedBy = $isObj ? ($exp->added_by_name ?? 'System Admin') : ($exp['added_by_name'] ?? 'System Admin');
                            $paidBy = $isObj ? ($exp->paid_by_name ?? '—') : ($exp['paid_by_name'] ?? '—');
                            $addDate = $isObj ? ($exp->add_date ?? '—') : ($exp['add_date'] ?? '—');
                            $payAt = $isObj ? ($exp->pay_at ?? 'Not Paid Yet') : ($exp['pay_at'] ?? 'Not Paid Yet');
                            $status = $isObj ? ($exp->expencesess_status ?? 'Pending') : ($exp['status'] ?? 'Pending');
                            $price = $isObj ? ($exp->price ?? 0) : ($exp['price'] ?? 0);
                        @endphp
                        <tr>
                            <td><strong>#EXP-{{ str_pad($id, 4, '0', STR_PAD_LEFT) }}</strong></td>
                            <td><strong>{{ $expType }}</strong></td>
                            <td>{{ $addedBy }}</td>
                            <td>{{ $paidBy }}</td>
                            <td>{{ $addDate ? date('Y-m-d H:i', strtotime($addDate)) : '—' }}</td>
                            <td>{{ $payAt && $payAt !== 'Not Paid Yet' ? date('Y-m-d H:i', strtotime($payAt)) : 'Not Paid Yet' }}</td>
                            <td>
                                <span class="rep-badge {{ $status === 'Paid' ? 'badge-paid' : 'badge-pending' }}">
                                    <i class="fa-solid {{ $status === 'Paid' ? 'fa-check' : 'fa-clock' }}"></i>
                                    {{ $status }}
                                </span>
                            </td>
                            <td class="num-col" style="color: #dc2626; font-weight: 700;">Rs. {{ number_format($price, 2) }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">No operating expenses recorded yet.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Operating Expenses Pagination Controls -->
        <div class="rep-pagination-wrap">
            <span class="rep-pagination-info" id="operatingExpensesPaginationInfo"></span>
            <div class="rep-pagination-controls" id="operatingExpensesPaginationControls"></div>
        </div>
    </div>
</div>
