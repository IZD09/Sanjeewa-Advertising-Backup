<!-- ==================================================================
             MODULE: PAYMENTS MANAGEMENT HUB
             Sanjeewa Advertising Digital Printing Shop Management System
             Features:
               1. Invoice Payment (Job Payments: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
               2. GRN Payment (Stock Items & Suppliers: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
             ================================================================== -->
        <div class="app-module" id="module-payments" data-module="payments">
          <div class="payments-container">

            <!-- Top Page Header -->
            <div class="pay-header">
              <div class="pay-title-wrap">
                <h2>
                  <i class="fa-solid fa-money-bill-transfer"></i>
                  Payments &amp; Settlements Hub (ගෙවීම් කළමනාකරණය)
                </h2>
                <p class="pay-subtitle">
                  Dual-Channel Settlements: <strong>1. Invoice Payments</strong> (Job Print Orders) &amp; <strong>2. GRN Payments</strong> (Stock Item Acquisitions)
                </p>
              </div>
              <div class="pay-header-actions">
                <button type="button" class="po-btn po-btn-primary" id="btnOpenRecordPayment" style="height: 40px; font-weight: 700; border-radius: 9px;">
                  <i class="fa-solid fa-circle-plus"></i> Record Payment (නව ගෙවීමක්)
                </button>
              </div>
            </div>

            <!-- Dual Structure Explanatory Cards (Sinhala & English Bilingual Concept Guide) -->
            <div class="payments-concept-banner">
              <!-- Part 1: Invoice Payment -->
              <div class="concept-card invoice-concept">
                <div class="concept-top">
                  <div class="concept-icon-title">
                    <div class="concept-icon">
                      <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <div class="concept-heading">
                      <h3>1. Invoice Payment</h3>
                      <p>Job / Customer Print Order Payments</p>
                    </div>
                  </div>
                  <span class="concept-part-badge">Part 1</span>
                </div>
                <div class="concept-desc-box">
                  <i class="fa-solid fa-circle-info" style="color: var(--blue); margin-right: 4px;"></i>
                  <strong>Invoice payment කියන්නේ job වලට අදාල payment වලට.</strong>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                    Payments collected from clients for advertising, flex banners, vinyl printing, and corporate branding jobs.
                  </div>
                </div>
                <div class="concept-breakdown-row">
                  <div>
                    <div class="concept-group-title"><i class="fa-solid fa-flag-checkered"></i> අවස්ථා (Payment Stages)</div>
                    <div class="concept-chips">
                      <span class="concept-chip stage-complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>
                      <span class="concept-chip stage-pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>
                      <span class="concept-chip stage-advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>
                    </div>
                  </div>
                  <div>
                    <div class="concept-group-title"><i class="fa-solid fa-wallet"></i> Methods (ක්‍රමවේද)</div>
                    <div class="concept-chips">
                      <span class="concept-chip method-card"><i class="fa-solid fa-credit-card"></i> Card</span>
                      <span class="concept-chip method-cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>
                      <span class="concept-chip method-check"><i class="fa-solid fa-money-check"></i> Check</span>
                      <span class="concept-chip method-transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Part 2: GRN Payment -->
              <div class="concept-card grn-concept">
                <div class="concept-top">
                  <div class="concept-icon-title">
                    <div class="concept-icon">
                      <i class="fa-solid fa-boxes-packing"></i>
                    </div>
                    <div class="concept-heading">
                      <h3>2. GRN Payment</h3>
                      <p>Stock Item Purchases &amp; Supplier Payments</p>
                    </div>
                  </div>
                  <span class="concept-part-badge">Part 2</span>
                </div>
                <div class="concept-desc-box">
                  <i class="fa-solid fa-circle-info" style="color: #10b981; margin-right: 4px;"></i>
                  <strong>GRN payment කියන්නේ අවශ්යකරන stock items ලබා ගැනීමේ දී ආයතනය විසින් සිදු කරනු ලබන payments වලට.</strong>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
                    Commercial settlements made by the business for procuring inks, paper boards, vinyl rolls, and display hardware.
                  </div>
                </div>
                <div class="concept-breakdown-row">
                  <div>
                    <div class="concept-group-title"><i class="fa-solid fa-flag-checkered"></i> අවස්ථා (Payment Stages)</div>
                    <div class="concept-chips">
                      <span class="concept-chip stage-complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>
                      <span class="concept-chip stage-pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>
                      <span class="concept-chip stage-advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>
                    </div>
                  </div>
                  <div>
                    <div class="concept-group-title"><i class="fa-solid fa-wallet"></i> Methods (ක්‍රමවේද)</div>
                    <div class="concept-chips">
                      <span class="concept-chip method-card"><i class="fa-solid fa-credit-card"></i> Card</span>
                      <span class="concept-chip method-cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>
                      <span class="concept-chip method-check"><i class="fa-solid fa-money-check"></i> Check</span>
                      <span class="concept-chip method-transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Tabs Switcher -->
            <div class="payments-tab-nav">
              <button type="button" class="pay-tab-btn active" data-tab="invoice">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                1. Invoice Payments (Job Invoices)
                <span class="tab-count" id="tabBadgeInvoiceCount">0</span>
              </button>
              <button type="button" class="pay-tab-btn grn-tab" data-tab="grn">
                <i class="fa-solid fa-boxes-packing"></i>
                2. GRN Payments (Stock Items)
                <span class="tab-count" id="tabBadgeGrnCount">0</span>
              </button>
              <button type="button" class="pay-tab-btn" data-tab="overview">
                <i class="fa-solid fa-scale-balanced"></i>
                Reconciliation &amp; Overview
              </button>
            </div>

            <!-- TAB PANE 1: INVOICE PAYMENTS -->
            <div id="payTabPaneInvoice" class="pay-tab-pane">
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="pay-metric-grid">
                  <div class="pay-metric-card metric-blue">
                    <div class="pay-metric-label">
                      <span>Total Jobs Invoiced</span>
                      <i class="fa-solid fa-file-invoice" style="color: var(--blue);"></i>
                    </div>
                    <div class="pay-metric-value" id="kpiInvTotalBilled">Rs. 0.00</div>
                    <div class="pay-metric-sub">Gross billed job revenue</div>
                  </div>

                  <div class="pay-metric-card metric-green">
                    <div class="pay-metric-label">
                      <span>Total Collected Revenue</span>
                      <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
                    </div>
                    <div class="pay-metric-value" id="kpiInvTotalCollected" style="color: #10b981;">Rs. 0.00</div>
                    <div class="pay-metric-sub">Settled &amp; realized customer funds</div>
                  </div>

                  <div class="pay-metric-card metric-amber">
                    <div class="pay-metric-label">
                      <span>Pending Receivables</span>
                      <i class="fa-solid fa-clock-rotate-left" style="color: #f59e0b;"></i>
                    </div>
                    <div class="pay-metric-value" id="kpiInvTotalPending" style="color: #ef4444;">Rs. 0.00</div>
                    <div class="pay-metric-sub">Balance due from clients on collection</div>
                  </div>

                  <div class="pay-metric-card metric-purple">
                    <div class="pay-metric-label">
                      <span>Payment Stages Breakdown</span>
                      <i class="fa-solid fa-chart-pie" style="color: #8b5cf6;"></i>
                    </div>
                    <div class="pay-metric-sub" id="kpiInvStageCounts" style="font-size: 13px; color: var(--text); margin-top: 6px;">
                      <strong>0</strong> Complete | <strong>0</strong> Advance | <strong>0</strong> Pending
                    </div>
                    <div class="pay-metric-sub" style="font-size: 10.5px; margin-top: auto;">Complete / Advance / Pending</div>
                  </div>
                </div>

                <div class="methods-bar-card">
                  <div class="methods-bar-top">
                    <span><i class="fa-solid fa-wallet" style="margin-right: 6px; color: var(--blue);"></i> Realized Collections by Payment Method</span>
                    <span style="font-size: 11px; color: var(--text-muted);">Card • Cash • Check • Bank Transfer</span>
                  </div>
                  <div class="methods-badges-row">
                    <div class="method-stat-box card-box">
                      <i class="fa-solid fa-credit-card"></i>
                      <div class="method-stat-meta">
                        <span>Card Collections</span>
                        <strong id="invMethodCardTotal">Rs. 0</strong>
                      </div>
                    </div>
                    <div class="method-stat-box cash-box">
                      <i class="fa-solid fa-money-bill-wave"></i>
                      <div class="method-stat-meta">
                        <span>Cash Payments</span>
                        <strong id="invMethodCashTotal">Rs. 0</strong>
                      </div>
                    </div>
                    <div class="method-stat-box check-box">
                      <i class="fa-solid fa-money-check"></i>
                      <div class="method-stat-meta">
                        <span>Cheque Deposits</span>
                        <strong id="invMethodCheckTotal">Rs. 0</strong>
                      </div>
                    </div>
                    <div class="method-stat-box transfer-box">
                      <i class="fa-solid fa-building-columns"></i>
                      <div class="method-stat-meta">
                        <span>Bank Transfers</span>
                        <strong id="invMethodTransferTotal">Rs. 0</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pay-filter-bar">
                  <div class="pay-search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="payInvoiceSearch" class="pay-search-input" placeholder="Search by Job #, Invoice #, Customer or Ref...">
                  </div>
                  <div class="pay-filter-group">
                    <select id="payInvoiceStatusFilter" class="pay-select" aria-label="Filter by Stage">
                      <option value="ALL">All Stages (සියලු අවස්ථා)</option>
                      <option value="Complete Payment">Complete Payment (සම්පූර්ණ ගෙවීම්)</option>
                      <option value="Pending Payment">Pending Payment (පොරොත්තු ගෙවීම්)</option>
                      <option value="Advance Payment">Advance Payment (අත්තිකාරම් ගෙවීම්)</option>
                    </select>
                    <select id="payInvoiceMethodFilter" class="pay-select" aria-label="Filter by Method">
                      <option value="ALL">All Methods (සියලු ක්‍රමවේද)</option>
                      <option value="Card">Card (කාඩ්පත්)</option>
                      <option value="Cash">Cash (මුදල්)</option>
                      <option value="Check">Check (චෙක්පත්)</option>
                      <option value="Bank Transfer">Bank Transfer (බැංකු හුවමාරු)</option>
                    </select>
                    <button type="button" class="pay-btn-reset" id="payInvoiceResetFilters">
                      <i class="fa-solid fa-rotate-left"></i> Reset
                    </button>
                  </div>
                </div>

                <div class="pay-table-card">
                  <div class="pay-table-wrapper">
                    <table class="pay-table">
                      <thead>
                        <tr>
                          <th>Invoice / Date</th>
                          <th>Customer / Ref</th>
                          <th>Payment Stage</th>
                          <th>Method</th>
                          <th>Total Bill</th>
                          <th>Paid Amount</th>
                          <th>Balance Due</th>
                          <th>Narration</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody id="payInvoiceTableBody">
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB PANE 2: GRN PAYMENTS -->
            <div id="payTabPaneGrn" class="pay-tab-pane" style="display: none;">
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="pay-metric-grid">
                  <div class="pay-metric-card metric-green">
                    <div class="pay-metric-label">
                      <span>Total GRN Stock Billed</span>
                      <i class="fa-solid fa-boxes-packing" style="color: #10b981;"></i>
                    </div>
                    <div class="pay-metric-value" id="kpiGrnTotalBilled">Rs. 0.00</div>
                    <div class="pay-metric-sub">Total inventory consignments received</div>
                  </div>

                  <div class="pay-metric-card metric-blue">
                    <div class="pay-metric-label">
                      <span>Paid to Suppliers</span>
                      <i class="fa-solid fa-circle-check" style="color: var(--blue);"></i>
                    </div>
                    <div class="pay-metric-value" id="kpiGrnTotalPaid" style="color: var(--blue);">Rs. 0.00</div>
                    <div class="pay-metric-sub">Company disbursements cleared</div>
                  </div>

                  <div class="pay-metric-card metric-amber">
                    <div class="pay-metric-label">
                      <span>Outstanding Payables</span>
                      <i class="fa-solid fa-hand-holding-dollar" style="color: #f59e0b;"></i>
                    </div>
                    <div class="pay-metric-value" id="kpiGrnTotalDue" style="color: #ef4444;">Rs. 0.00</div>
                    <div class="pay-metric-sub">Credit terms due to suppliers</div>
                  </div>

                  <div class="pay-metric-card metric-purple">
                    <div class="pay-metric-label">
                      <span>Payment Stages Breakdown</span>
                      <i class="fa-solid fa-chart-pie" style="color: #8b5cf6;"></i>
                    </div>
                    <div class="pay-metric-sub" id="kpiGrnStageCounts" style="font-size: 13px; color: var(--text); margin-top: 6px;">
                      <strong>0</strong> Complete | <strong>0</strong> Advance | <strong>0</strong> Pending
                    </div>
                    <div class="pay-metric-sub" style="font-size: 10.5px; margin-top: auto;">Complete / Advance / Pending</div>
                  </div>
                </div>

                <div class="methods-bar-card">
                  <div class="methods-bar-top">
                    <span><i class="fa-solid fa-wallet" style="margin-right: 6px; color: #10b981;"></i> Supplier Disbursements by Payment Method</span>
                    <span style="font-size: 11px; color: var(--text-muted);">Card • Cash • Check • Bank Transfer</span>
                  </div>
                  <div class="methods-badges-row">
                    <div class="method-stat-box card-box">
                      <i class="fa-solid fa-credit-card"></i>
                      <div class="method-stat-meta">
                        <span>Corporate Card</span>
                        <strong id="grnMethodCardTotal">Rs. 0</strong>
                      </div>
                    </div>
                    <div class="method-stat-box cash-box">
                      <i class="fa-solid fa-money-bill-wave"></i>
                      <div class="method-stat-meta">
                        <span>Petty Cash / COD</span>
                        <strong id="grnMethodCashTotal">Rs. 0</strong>
                      </div>
                    </div>
                    <div class="method-stat-box check-box">
                      <i class="fa-solid fa-money-check"></i>
                      <div class="method-stat-meta">
                        <span>Company Cheques</span>
                        <strong id="grnMethodCheckTotal">Rs. 0</strong>
                      </div>
                    </div>
                    <div class="method-stat-box transfer-box">
                      <i class="fa-solid fa-building-columns"></i>
                      <div class="method-stat-meta">
                        <span>Bank Transfers</span>
                        <strong id="grnMethodTransferTotal">Rs. 0</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pay-filter-bar">
                  <div class="pay-search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="payGrnSearch" class="pay-search-input" placeholder="Search by GRN #, PO #, Supplier, Ref or Stock item...">
                  </div>
                  <div class="pay-filter-group">
                    <select id="payGrnStatusFilter" class="pay-select" aria-label="Filter by Stage">
                      <option value="ALL">All Stages (සියලු අවස්ථා)</option>
                      <option value="Complete Payment">Complete Payment (සම්පූර්ණ ගෙවීම්)</option>
                      <option value="Pending Payment">Pending Payment (පොරොත්තු ගෙවීම්)</option>
                      <option value="Advance Payment">Advance Payment (අත්තිකාරම් ගෙවීම්)</option>
                    </select>
                    <select id="payGrnMethodFilter" class="pay-select" aria-label="Filter by Method">
                      <option value="ALL">All Methods (සියලු ක්‍රමවේද)</option>
                      <option value="Card">Card (කාඩ්පත්)</option>
                      <option value="Cash">Cash (මුදල්)</option>
                      <option value="Check">Check (චෙක්පත්)</option>
                      <option value="Bank Transfer">Bank Transfer (බැංකු හුවමාරු)</option>
                    </select>
                    <button type="button" class="pay-btn-reset" id="payGrnResetFilters">
                      <i class="fa-solid fa-rotate-left"></i> Reset
                    </button>
                  </div>
                </div>

                <div class="pay-table-card">
                  <div class="pay-table-wrapper">
                    <table class="pay-table">
                      <thead>
                        <tr>
                          <th>GRN # / Date</th>
                          <th>Supplier / Category</th>
                          <th>Payment Stage</th>
                          <th>Method</th>
                          <th>Bill Total</th>
                          <th>Paid Amount</th>
                          <th>Balance Due</th>
                          <th>Narration</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody id="payGrnTableBody">
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB PANE 3: OVERVIEW -->
            <div id="payTabPaneOverview" class="pay-tab-pane" style="display: none;">
              <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="pay-metric-grid">
                  <div class="pay-metric-card" style="border-bottom: 3px solid #2563eb;">
                    <div class="pay-metric-label">
                      <span>Job Cash Inflow (Invoice Payments)</span>
                      <i class="fa-solid fa-arrow-down-left" style="color: #2563eb;"></i>
                    </div>
                    <div class="pay-metric-value" id="ovJobCashInflow" style="color: #2563eb;">Rs. 0.00</div>
                    <div class="pay-metric-sub">Money collected from printing jobs</div>
                  </div>

                  <div class="pay-metric-card" style="border-bottom: 3px solid #ef4444;">
                    <div class="pay-metric-label">
                      <span>Stock Cash Outflow (GRN Payments)</span>
                      <i class="fa-solid fa-arrow-up-right" style="color: #ef4444;"></i>
                    </div>
                    <div class="pay-metric-value" id="ovGrnCashOutflow" style="color: #ef4444;">Rs. 0.00</div>
                    <div class="pay-metric-sub">Money paid for stock materials &amp; supplies</div>
                  </div>

                  <div class="pay-metric-card" style="border-bottom: 3px solid #10b981;">
                    <div class="pay-metric-label">
                      <span>Net Operating Cash Position</span>
                      <i class="fa-solid fa-vault" style="color: #10b981;"></i>
                    </div>
                    <div class="pay-metric-value" id="ovNetOperatingCash" style="color: #10b981;">Rs. 0.00</div>
                    <div class="pay-metric-sub">Inflow minus Outflow surplus</div>
                  </div>

                  <div class="pay-metric-card" style="border-bottom: 3px solid #8b5cf6;">
                    <div class="pay-metric-label">
                      <span>Pending Receivables vs Payables</span>
                      <i class="fa-solid fa-scale-balanced" style="color: #8b5cf6;"></i>
                    </div>
                    <div class="pay-metric-sub" style="font-size: 12px; margin-top: 6px;">
                      Receivable: <strong id="ovReceivablesTotal">Rs. 0</strong><br>
                      Payable: <strong id="ovPayablesTotal" style="color: #ef4444;">Rs. 0</strong>
                    </div>
                  </div>
                </div>

                <div class="pay-table-card" style="padding: 24px;">
                  <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 800; color: var(--text);">
                    <i class="fa-solid fa-file-contract" style="color: var(--blue); margin-right: 8px;"></i>
                    Financial Settlement Policy &amp; Dual Architecture Summary
                  </h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px; line-height: 1.6; color: var(--text);">
                    <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; border: 1px solid var(--border);">
                      <h4 style="margin: 0 0 8px; color: var(--blue); font-size: 14px;"><i class="fa-solid fa-circle-dot"></i> Channel 1: Invoice Payments (Customer Jobs)</h4>
                      <ul style="margin: 0; padding-left: 20px; color: var(--text-muted);">
                        <li><strong>Complete Payment:</strong> Customers who have fully cleared the bill on collection.</li>
                        <li><strong>Pending Payment:</strong> Corporate accounts on 30-day invoice terms or orders waiting for collection.</li>
                        <li><strong>Advance Payment:</strong> Upfront token deposit (typically 50%) before initiating printing and finishing.</li>
                        <li><strong>Supported Channels:</strong> Card (POS), Cash on counter, Cross cheques, and BOC bank transfer.</li>
                      </ul>
                    </div>
                    <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; border: 1px solid var(--border);">
                      <h4 style="margin: 0 0 8px; color: #10b981; font-size: 14px;"><i class="fa-solid fa-circle-dot"></i> Channel 2: GRN Payments (Stock Items &amp; Suppliers)</h4>
                      <ul style="margin: 0; padding-left: 20px; color: var(--text-muted);">
                        <li><strong>Complete Payment:</strong> Consignment bills fully paid upon receiving inspected materials.</li>
                        <li><strong>Pending Payment:</strong> Raw materials received under 14 to 45 days credit credit facilities.</li>
                        <li><strong>Advance Payment:</strong> Advance purchase order deposits paid to overseas or local importers.</li>
                        <li><strong>Supported Channels:</strong> Commercial cheques, corporate online transfers, petty cash, or corporate card.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Modals for Payments Hub -->
        <div class="pay-modal-backdrop" id="recordPaymentModal">
          <div class="pay-modal-card">
            <div class="pay-modal-header">
              <h3><i class="fa-solid fa-file-invoice-dollar" style="color: var(--blue);"></i> Record Payment Transaction</h3>
              <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="pay-modal-body">
              <div class="pay-field">
                <label class="pay-label">1. Payment Category / Channel *</label>
                <div class="pay-type-selector">
                  <label class="pay-type-option invoice-option selected">
                    <input type="radio" name="modalPayType" id="modalRadioInvoice" value="invoice" checked>
                    <div class="pay-type-meta">
                      <strong>1. Invoice Payment</strong>
                      <span>Job / Customer Print Order Payment</span>
                    </div>
                  </label>
                  <label class="pay-type-option grn-option">
                    <input type="radio" name="modalPayType" id="modalRadioGrn" value="grn">
                    <div class="pay-type-meta">
                      <strong>2. GRN Payment</strong>
                      <span>Stock Items / Supplier Procurement</span>
                    </div>
                  </label>
                </div>
              </div>

              <div class="pay-field">
                <label class="pay-label" id="modalPayRefLabel">Select Customer Job / Invoice *</label>
                <select id="modalPayRefSelect" class="pay-select-field">
                </select>
              </div>

              <div class="pay-modal-balance-box">
                <div class="bal-item">
                  <span>Bill Total:</span>
                  <strong id="modalBalTotal">Rs. 0</strong>
                </div>
                <div class="bal-item">
                  <span>Previously Paid:</span>
                  <strong id="modalBalPaid" style="color: #10b981;">Rs. 0</strong>
                </div>
                <div class="bal-item">
                  <span>Current Balance:</span>
                  <strong id="modalBalRemaining" style="color: #ef4444;">Rs. 0</strong>
                </div>
              </div>

              <div class="pay-form-grid">
                <div class="pay-field">
                  <label class="pay-label">Payment Amount (Rs.) *</label>
                  <input type="number" id="modalPayAmount" class="pay-input" placeholder="0.00" min="0" step="100" required>
                </div>
                <div class="pay-field">
                  <label class="pay-label">Payment Stage (අවස්ථාව) *</label>
                  <select id="modalPayStageSelect" class="pay-select-field">
                    <option value="Complete Payment">Complete Payment (සම්පූර්ණ ගෙවීම්)</option>
                    <option value="Advance Payment">Advance Payment (අත්තිකාරම් ගෙවීම්)</option>
                    <option value="Pending Payment">Pending Payment (පොරොත්තු ගෙවීම්)</option>
                  </select>
                </div>
              </div>

              <div class="pay-field">
                <label class="pay-label">Payment Method (ක්‍රමවේදය) *</label>
                <div class="pay-method-selector">
                  <div class="method-choice selected" data-method="Cash">
                    <i class="fa-solid fa-money-bill-wave"></i>
                    <span>Cash</span>
                  </div>
                  <div class="method-choice" data-method="Card">
                    <i class="fa-solid fa-credit-card"></i>
                    <span>Card</span>
                  </div>
                  <div class="method-choice" data-method="Check">
                    <i class="fa-solid fa-money-check"></i>
                    <span>Check</span>
                  </div>
                  <div class="method-choice" data-method="Bank Transfer">
                    <i class="fa-solid fa-building-columns"></i>
                    <span>Bank Transfer</span>
                  </div>
                </div>
              </div>

              <div id="modalMethodSpecificFields">
              </div>

              <div class="pay-form-grid">
                <div class="pay-field">
                  <label class="pay-label">Payment Date</label>
                  <input type="date" id="modalPayDate" class="pay-input">
                </div>
                <div class="pay-field">
                  <label class="pay-label">Authorized Officer</label>
                  <input type="text" class="pay-input" value="Admin User" readonly style="opacity: 0.8;">
                </div>
              </div>

              <div class="pay-field">
                <label class="pay-label">Narration / Internal Remarks</label>
                <input type="text" id="modalPayNotes" class="pay-input" placeholder="E.g. Paid in full upon pickup / advance for vinyl rolls">
              </div>
            </div>

            <div class="pay-modal-footer">
              <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
              <button type="button" class="po-btn po-btn-primary" id="btnSaveNewPayment">
                <i class="fa-solid fa-check"></i> Save &amp; Generate Voucher
              </button>
            </div>
          </div>
        </div>

        <div class="pay-modal-backdrop" id="printableReceiptModal">
          <div class="pay-modal-card" style="max-width: 580px;">
            <div class="pay-modal-header">
              <h3><i class="fa-solid fa-receipt"></i> Official Payment Voucher</h3>
              <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="pay-modal-body">
              <div id="receiptPrintContainer">
              </div>
            </div>
            <div class="pay-modal-footer">
              <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Close</button>
              <button type="button" class="po-btn po-btn-primary" id="btnPrintReceipt">
                <i class="fa-solid fa-print"></i> Print Voucher
              </button>
            </div>
          </div>
