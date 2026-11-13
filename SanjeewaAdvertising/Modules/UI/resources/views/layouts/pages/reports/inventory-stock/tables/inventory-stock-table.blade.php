<!-- Inventory & Stock: Table View -->
<div class="rep-view-section rep-table-section active" data-section-mode="table">
    <div class="rep-tab-toolbar">
        <div class="rep-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="searchInventoryTable" name="searchInventoryTable" class="rep-table-search" data-target-table="inventoryTable" placeholder="Search material name or code..." aria-label="Search material name or code">
        </div>
        <div class="rep-toolbar-controls">
            <div class="rep-sort-group">
                <span class="rep-sort-label"><i class="fa-solid fa-arrow-up-wide-short"></i> Sort:</span>
                <select id="sortInventoryTable" name="sortInventoryTable" class="rep-sort-select" data-target-table="inventoryTable" aria-label="Sort Inventory">
                    <option value="6:desc:number">Valuation (High to Low)</option>
                    <option value="6:asc:number">Valuation (Low to High)</option>
                    <option value="2:asc:number">In-Stock Qty (Low Stock First)</option>
                    <option value="2:desc:number">In-Stock Qty (Highest First)</option>
                    <option value="4:desc:number">Selling Price (High to Low)</option>
                    <option value="1:asc:text">Material Name (A - Z)</option>
                </select>
            </div>
            <button type="button" class="rep-btn-reset-table" data-target-table="inventoryTable" title="Reset Sort & Search">
                <i class="fa-solid fa-rotate-left"></i> Reset
            </button>
            <div class="rep-stats-badges">
                <span class="rep-stat-chip chip-blue"><i class="fa-solid fa-boxes-stacked"></i> Stock Value: Rs. {{ number_format($stockValue ?? 0, 2) }}</span>
            </div>
        </div>
    </div>

    <div class="rep-table-wrap">
        <table class="rep-table" id="inventoryTable">
            <thead>
                <tr>
                    <th class="rep-sortable" data-sort-col="0" data-sort-type="text">Item Code <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="1" data-sort-type="text">Material / Item Name <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="2" data-sort-type="number">In-Stock Qty <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="3" data-sort-type="number">Buy Cost (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="4" data-sort-type="number">Selling Price (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="rep-sortable" data-sort-col="5" data-sort-type="text">Reorder Alert <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                    <th class="num-col rep-sortable" data-sort-col="6" data-sort-type="number">Total Valuation (Rs.) <i class="fa-solid fa-sort rep-sort-icon"></i></th>
                </tr>
            </thead>
            <tbody id="inventoryTableBody">
                @php
                    $inventoryRows = $stockItems ?? [];
                    if (isset($inventoryRows['data']) && is_iterable($inventoryRows['data'])) {
                        $inventoryRows = $inventoryRows['data'];
                    }
                @endphp
                @forelse($inventoryRows as $stock)
                    @php
                        $isObj = is_object($stock);
                        $code = $isObj ? ($stock->item_code ?? $stock->code ?? ('STK-'.($stock->id ?? ''))) : ($stock['item_code'] ?? $stock['code'] ?? ('STK-'.($stock['id'] ?? '')));
                        $name = $isObj ? ($stock->item_name ?? 'Raw Material') : ($stock['item_name'] ?? 'Raw Material');
                        $qty = (float) ($isObj ? ($stock->quantity ?? $stock->qty ?? 0) : ($stock['quantity'] ?? $stock['qty'] ?? 0));
                        $buy = (float) ($isObj ? ($stock->buy_price ?? $stock->buy ?? 0) : ($stock['buy_price'] ?? $stock['buy'] ?? 0));
                        $price = (float) ($isObj ? ($stock->sell_price ?? $stock->price ?? 0) : ($stock['sell_price'] ?? $stock['price'] ?? 0));
                        $val = (float) ($isObj ? ($stock->valuation ?? ($qty * $buy)) : ($stock['valuation'] ?? ($qty * $buy)));
                        $health = $isObj ? ($stock->health_status ?? '') : ($stock['health_status'] ?? '');
                        $isLow = $health ? ($health === 'Low Stock' || $health === 'Out of Stock') : ($qty <= ($isObj ? ($stock->low_stock_qty ?? 15) : ($stock['low_stock_qty'] ?? 15)));
                    @endphp
                    <tr>
                        <td><strong>{{ $code }}</strong></td>
                        <td>{{ $name }}</td>
                        <td class="num-col"><strong>{{ number_format($qty) }}</strong></td>
                        <td class="num-col">Rs. {{ number_format($buy, 2) }}</td>
                        <td class="num-col">Rs. {{ number_format($price, 2) }}</td>
                        <td>
                            @if($isLow)
                                <span class="rep-badge badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>
                            @else
                                <span class="rep-badge badge-paid"><i class="fa-solid fa-check"></i> Sufficient</span>
                            @endif
                        </td>
                        <td class="num-col" style="font-weight: 700;">Rs. {{ number_format($val, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center" style="padding: 24px; color: #64748b;">No inventory stock records found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Inventory Pagination Controls -->
    <div class="rep-pagination-wrap">
        <span class="rep-pagination-info" id="inventoryPaginationInfo"></span>
        <div class="rep-pagination-controls" id="inventoryPaginationControls"></div>
    </div>
</div>
