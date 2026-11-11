<!-- Profit & Loss Statement: Table View -->
<div class="rep-view-section rep-table-section active" data-section-mode="table">
    <div class="rep-pl-statement">
        <table class="rep-table" id="profitLossTable">
            <thead>
                <tr style="background: #1677ff; color: #ffffff;">
                    <th style="color: #ffffff; padding: 16px 20px; font-size: 14px;">Financial Performance Statement</th>
                    <th class="num-col" style="color: #ffffff; padding: 16px 20px; font-size: 14px;">Amount (Rs.)</th>
                </tr>
            </thead>
            <tbody id="profitLossTableBody">
                @php
                    $pl = $profitLossData ?? ($initialTables['profitLoss'] ?? []);
                    $plGrossRev = (float) ($pl['grossRevenue'] ?? ($totalSales ?? 0));
                    $plDiscounts = (float) ($pl['tradeDiscounts'] ?? 0);
                    $plNetRev = (float) ($pl['netRevenue'] ?? ($plGrossRev - $plDiscounts));
                    $plRawMat = (float) ($pl['rawMaterialsCost'] ?? (($totalGrnPayments ?? 0) * 0.7));
                    $plInks = (float) ($pl['inksConsumablesCost'] ?? (($totalGrnPayments ?? 0) * 0.3));
                    $plCogs = (float) ($pl['cogs'] ?? ($totalGrnPayments ?? 0));
                    $plGrossProfit = (float) ($pl['grossProfit'] ?? max(0, $plNetRev - $plCogs));
                    $plCategories = $pl['expenseCategories'] ?? [];
                    if (empty($plCategories) && !empty($expensesList)) {
                        $expItems = isset($expensesList['data']) ? $expensesList['data'] : $expensesList;
                        foreach ($expItems as $item) {
                            $isO = is_object($item);
                            $plCategories[] = [
                                'category' => $isO ? ($item->expense_type ?? $item->expencesess_type ?? 'Overhead') : ($item['expense_type'] ?? $item['expencesess_type'] ?? 'Overhead'),
                                'amount' => (float) ($isO ? ($item->price ?? 0) : ($item['price'] ?? 0)),
                            ];
                        }
                    }
                    $plTotalExp = (float) ($pl['totalExpenses'] ?? ($totalExpenses ?? 0));
                    $plNetProfit = (float) ($pl['netProfit'] ?? ($netProfit ?? ($plGrossProfit - $plTotalExp)));
                    $plMargin = $pl['marginPercent'] ?? ($marginPercent ?? 0);
                @endphp

                <!-- Operating Revenue -->
                <tr class="pl-section-head">
                    <td>1. Operating Revenue (Sales Billings)</td>
                    <td class="num-col"></td>
                </tr>
                <tr class="pl-sub-row" data-pl-field="grossRevenue">
                    <td>Gross Print Job Sales Billings</td>
                    <td class="num-col">Rs. {{ number_format($plGrossRev, 2) }}</td>
                </tr>
                <tr class="pl-sub-row" data-pl-field="tradeDiscounts">
                    <td>Less: Customer Trade Discounts</td>
                    <td class="num-col" style="color: #64748b;">(Rs. {{ number_format($plDiscounts, 2) }})</td>
                </tr>
                <tr class="pl-total-row" data-pl-field="netRevenue">
                    <td>Net Operating Revenue</td>
                    <td class="num-col" style="font-weight: 700;">Rs. {{ number_format($plNetRev, 2) }}</td>
                </tr>

                <!-- Cost of Goods Sold -->
                <tr class="pl-section-head">
                    <td>2. Cost of Goods Sold (COGS)</td>
                    <td class="num-col"></td>
                </tr>
                <tr class="pl-sub-row" data-pl-field="rawMaterialsCost">
                    <td>Direct Raw Materials (Flex Banners, Vinyl, Boards)</td>
                    <td class="num-col">Rs. {{ number_format($plRawMat, 2) }}</td>
                </tr>
                <tr class="pl-sub-row" data-pl-field="inksConsumablesCost">
                    <td>Printing Inks &amp; Consumables</td>
                    <td class="num-col">Rs. {{ number_format($plInks, 2) }}</td>
                </tr>
                <tr class="pl-total-row" data-pl-field="cogs">
                    <td>Total Cost of Goods Sold (COGS)</td>
                    <td class="num-col" style="color: #dc2626; font-weight: 700;">(Rs. {{ number_format($plCogs, 2) }})</td>
                </tr>

                <!-- Gross Profit -->
                <tr class="pl-section-head" data-pl-field="grossProfit" style="background: rgba(16, 185, 129, 0.08);">
                    <td style="color: #059669; font-weight: 700;">3. Gross Operating Profit</td>
                    <td class="num-col" style="color: #059669; font-weight: 800;">Rs. {{ number_format($plGrossProfit, 2) }}</td>
                </tr>

                <!-- Operating Expenses -->
                <tr class="pl-section-head">
                    <td>4. Operating Overhead Expenses</td>
                    <td class="num-col"></td>
                </tr>
                <tbody id="plExpenseCategoriesList" style="display: contents;">
                    @forelse($plCategories as $expCat)
                        <tr class="pl-sub-row pl-exp-cat-row">
                            <td>{{ $expCat['category'] }}</td>
                            <td class="num-col">Rs. {{ number_format($expCat['amount'], 2) }}</td>
                        </tr>
                    @empty
                        <tr class="pl-sub-row pl-exp-cat-row">
                            <td style="color: #64748b; font-style: italic;">No specific overhead expense items recorded</td>
                            <td class="num-col">Rs. 0.00</td>
                        </tr>
                    @endforelse
                </tbody>
                <tr class="pl-total-row" data-pl-field="totalExpenses">
                    <td>Total Operating Expenses</td>
                    <td class="num-col" style="color: #dc2626; font-weight: 700;">(Rs. {{ number_format($plTotalExp, 2) }})</td>
                </tr>

                <!-- Net Operating Profit -->
                <tr class="pl-net-row" data-pl-field="netProfit">
                    <td>Net Operating Profit (Before Tax)</td>
                    <td class="num-col" style="font-weight: 800;">Rs. {{ number_format($plNetProfit, 2) }}</td>
                </tr>
                <tr data-pl-field="marginPercent">
                    <td style="padding-left: 20px; font-weight: 700; color: var(--text-muted);">Net Profit Margin</td>
                    <td class="num-col" style="color: #1677ff; font-weight: 800;">{{ $plMargin }}%</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
