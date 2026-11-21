<!-- TAB PANE 4: OVERVIEW -->
<div id="payTabPaneOverview" class="pay-tab-pane" style="display: none;">
  <div style="display: flex; flex-direction: column; gap: 22px;">
    <!-- Top Reconciliation KPI Grid -->
    <div class="pay-metric-grid">
      <div class="pay-metric-card ov-kpi-card" style="border-bottom: 3px solid #2563eb;">
        <div class="pay-metric-label">
          <span>Job Cash Inflow (Invoice)</span>
          <span class="ov-kpi-icon" style="background: rgba(37, 99, 235, 0.12); color: #2563eb;">
            <i class="fa-solid fa-arrow-down-left"></i>
          </span>
        </div>
        <div class="pay-metric-value" id="ovJobCashInflow" style="color: #2563eb;">Rs. 0.00</div>
        <div class="pay-metric-sub">Money collected from printing jobs</div>
      </div>

      <div class="pay-metric-card ov-kpi-card" style="border-bottom: 3px solid #ef4444;">
        <div class="pay-metric-label">
          <span>Stock Cash Outflow (GRN)</span>
          <span class="ov-kpi-icon" style="background: rgba(239, 68, 68, 0.12); color: #ef4444;">
            <i class="fa-solid fa-arrow-up-right"></i>
          </span>
        </div>
        <div class="pay-metric-value" id="ovGrnCashOutflow" style="color: #ef4444;">Rs. 0.00</div>
        <div class="pay-metric-sub">Money paid for stock materials &amp; supplies</div>
      </div>

      <div class="pay-metric-card ov-kpi-card" style="border-bottom: 3px solid #10b981;">
        <div class="pay-metric-label">
          <span>Net Operating Cash Position</span>
          <span class="ov-kpi-icon" style="background: rgba(16, 185, 129, 0.12); color: #10b981;">
            <i class="fa-solid fa-vault"></i>
          </span>
        </div>
        <div class="pay-metric-value" id="ovNetOperatingCash" style="color: #10b981;">Rs. 0.00</div>
        <div class="pay-metric-sub">Inflow minus Outflow surplus</div>
      </div>

      <div class="pay-metric-card ov-kpi-card" style="border-bottom: 3px solid #8b5cf6;">
        <div class="pay-metric-label">
          <span>Receivables vs Payables</span>
          <span class="ov-kpi-icon" style="background: rgba(139, 92, 246, 0.12); color: #8b5cf6;">
            <i class="fa-solid fa-scale-balanced"></i>
          </span>
        </div>
        <div class="ov-balance-split">
          <div class="ov-split-row">
            <span class="ov-split-label"><i class="fa-solid fa-circle-arrow-down" style="color: #10b981;"></i> Receivable</span>
            <strong id="ovReceivablesTotal" style="color: #10b981;">Rs. 0</strong>
          </div>
          <div class="ov-split-row">
            <span class="ov-split-label"><i class="fa-solid fa-circle-arrow-up" style="color: #ef4444;"></i> Payable</span>
            <strong id="ovPayablesTotal" style="color: #ef4444;">Rs. 0</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Cashflow Reconciliation Progress Bar Card -->
    <div class="ov-reconcile-card">
      <div class="ov-reconcile-header">
        <div>
          <h3 style="margin: 0; font-size: 14.5px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-chart-simple" style="color: #2563eb;"></i>
            Inflow vs Outflow Reconciliation Balance
          </h3>
          <p style="margin: 3px 0 0; font-size: 11.5px; color: var(--text-muted);">
            Live comparison between collected customer invoice payments and supplier GRN disbursements
          </p>
        </div>
        <div class="ov-reconcile-pills">
          <span class="ov-rec-pill inflow">Inflow: <strong id="overviewTotalInflow">Rs. 0.00</strong></span>
          <span class="ov-rec-pill outflow">Outflow: <strong id="overviewTotalOutflow">Rs. 0.00</strong></span>
          <span class="ov-rec-pill net">Net: <strong id="overviewNetCashPosition">Rs. 0.00</strong></span>
        </div>
      </div>
      <div class="ov-reconcile-bar">
        <div id="barInflowShare" class="ov-bar-inflow" style="width: 50%;"></div>
        <div id="barOutflowShare" class="ov-bar-outflow" style="width: 50%;"></div>
      </div>
    </div>

    <!-- Explanatory Cards (Tri-Channel Financial Architecture Guide) -->
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
          <strong>Invoice payments refer to settlements received for customer print jobs.</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
            Customer print orders (flex banners, vinyl stickers, lightboxes, leaflets) payments collected from clients.
          </div>
        </div>
        <div class="concept-breakdown-row">
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-flag-checkered"></i> Payment Stages — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip stage-complete" data-filter-type="stage" data-filter-val="Complete Payment" data-target="invoice" title="Filter by Complete Payment">
                <i class="fa-solid fa-circle-check"></i> Complete Payment
              </span>
              <span class="concept-chip stage-pending" data-filter-type="stage" data-filter-val="Pending Payment" data-target="invoice" title="Filter by Pending Payment">
                <i class="fa-solid fa-clock"></i> Pending Payment
              </span>
              <span class="concept-chip stage-advance" data-filter-type="stage" data-filter-val="Advance Payment" data-target="invoice" title="Filter by Advance Payment">
                <i class="fa-solid fa-hourglass-half"></i> Advance Payment
              </span>
            </div>
          </div>
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-wallet"></i> Payment Methods — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip method-card" data-filter-type="method" data-filter-val="Card" data-target="invoice" title="Filter by Card">
                <i class="fa-solid fa-credit-card"></i> Card
              </span>
              <span class="concept-chip method-cash" data-filter-type="method" data-filter-val="Cash" data-target="invoice" title="Filter by Cash">
                <i class="fa-solid fa-money-bill-wave"></i> Cash
              </span>
              <span class="concept-chip method-check" data-filter-type="method" data-filter-val="Check" data-target="invoice" title="Filter by Cheque">
                <i class="fa-solid fa-money-check"></i> Check
              </span>
              <span class="concept-chip method-transfer" data-filter-type="method" data-filter-val="Bank Transfer" data-target="invoice" title="Filter by Bank Transfer">
                <i class="fa-solid fa-building-columns"></i> Bank Transfer
              </span>
            </div>
          </div>
        </div>
        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <button type="button" class="po-btn pay-action-btn pay-btn-invoice" style="height: 34px; font-size: 12px;" data-action="record-invoice">
            <i class="fa-solid fa-file-invoice-dollar"></i> Record invoice payment
          </button>
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
          <strong>GRN payments refer to disbursements made by the business for purchasing stock items and raw materials.</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
            Commercial procurement settlements made by the business for procuring inks, paper boards, vinyl rolls, and display hardware.
          </div>
        </div>
        <div class="concept-breakdown-row">
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-flag-checkered"></i> Payment Stages — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip stage-complete" data-filter-type="stage" data-filter-val="Complete Payment" data-target="grn" title="Filter by Complete Payment">
                <i class="fa-solid fa-circle-check"></i> Complete Payment
              </span>
              <span class="concept-chip stage-pending" data-filter-type="stage" data-filter-val="Pending Payment" data-target="grn" title="Filter by Pending Payment">
                <i class="fa-solid fa-clock"></i> Pending Payment
              </span>
              <span class="concept-chip stage-advance" data-filter-type="stage" data-filter-val="Advance Payment" data-target="grn" title="Filter by Advance Payment">
                <i class="fa-solid fa-hourglass-half"></i> Advance Payment
              </span>
            </div>
          </div>
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-wallet"></i> Payment Methods — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip method-card" data-filter-type="method" data-filter-val="Card" data-target="grn" title="Filter by Card">
                <i class="fa-solid fa-credit-card"></i> Card
              </span>
              <span class="concept-chip method-cash" data-filter-type="method" data-filter-val="Cash" data-target="grn" title="Filter by Cash">
                <i class="fa-solid fa-money-bill-wave"></i> Cash
              </span>
              <span class="concept-chip method-check" data-filter-type="method" data-filter-val="Check" data-target="grn" title="Filter by Cheque">
                <i class="fa-solid fa-money-check"></i> Check
              </span>
              <span class="concept-chip method-transfer" data-filter-type="method" data-filter-val="Bank Transfer" data-target="grn" title="Filter by Bank Transfer">
                <i class="fa-solid fa-building-columns"></i> Bank Transfer
              </span>
            </div>
          </div>
        </div>
        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <button type="button" class="po-btn pay-action-btn pay-btn-grn" style="height: 34px; font-size: 12px;" data-action="record-grn">
            <i class="fa-solid fa-boxes-packing"></i> Record grn payment
          </button>
        </div>
      </div>

      <!-- Part 3: Operating Expenses -->
      <div class="concept-card expense-concept">
        <div class="concept-top">
          <div class="concept-icon-title">
            <div class="concept-icon" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
              <i class="fa-solid fa-bolt-lightning"></i>
            </div>
            <div class="concept-heading">
              <h3>3. Operating Expenses</h3>
              <p>Utility &amp; Monthly Overhead Bills (Electricity, Water, Internet, Rent)</p>
            </div>
          </div>
          <span class="concept-part-badge" style="background: rgba(245, 158, 11, 0.12); color: #d97706; border-color: rgba(245, 158, 11, 0.3);">Part 3</span>
        </div>
        <div class="concept-desc-box">
          <i class="fa-solid fa-circle-info" style="color: #f59e0b; margin-right: 4px;"></i>
          <strong>Operating expenses represent monthly operational overhead bills due at month-end.</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">
            Review all utility bills payable at month-end (Electricity, Water, Internet/Fiber, Rent) and mark status as <strong>Paid</strong> once settled.
          </div>
        </div>
        <div class="concept-breakdown-row">
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-tags"></i> Bill Categories — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Electricity" data-target="expenses" title="Filter by Electricity Bills">
                <i class="fa-solid fa-bolt-lightning" style="color: #f59e0b;"></i> Electricity
              </span>
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Water Board" data-target="expenses" title="Filter by Water Board Bills">
                <i class="fa-solid fa-droplet" style="color: #0284c7;"></i> Water Board
              </span>
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Internet & Fiber" data-target="expenses" title="Filter by Internet & Fiber Bills">
                <i class="fa-solid fa-wifi" style="color: #8b5cf6;"></i> Internet / SLT
              </span>
              <span class="concept-chip" data-filter-type="expense-category" data-filter-val="Shop Rent" data-target="expenses" title="Filter by Shop Rent">
                <i class="fa-solid fa-building" style="color: #ec4899;"></i> Shop Rent
              </span>
            </div>
          </div>
          <div>
            <div class="concept-group-title"><i class="fa-solid fa-clock-rotate-left"></i> Payment Status — Click to Filter</div>
            <div class="concept-chips">
              <span class="concept-chip stage-pending" data-filter-type="expense-status" data-filter-val="Pending" data-target="expenses" title="Filter by Pending Bills due at Month-End">
                <i class="fa-solid fa-hourglass-start"></i> Pending
              </span>
              <span class="concept-chip stage-complete" data-filter-type="expense-status" data-filter-val="Paid" data-target="expenses" title="Filter by Paid Bills">
                <i class="fa-solid fa-circle-check"></i> Paid
              </span>
            </div>
          </div>
        </div>
        <div style="margin-top: 4px; display: flex; justify-content: flex-end;">
          <button type="button" class="po-btn pay-action-btn pay-btn-bill" style="height: 34px; font-size: 12px;" data-action="record-bill">
            <i class="fa-solid fa-bolt-lightning"></i> Record bill payment
          </button>
        </div>
      </div>
    </div>

    <div class="pay-table-card" style="padding: 24px;">
      <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 800; color: var(--text);">
        <i class="fa-solid fa-file-contract" style="color: var(--blue); margin-right: 8px;"></i>
        Financial Settlement Policy &amp; Tri-Channel Architecture Summary
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; font-size: 13px; line-height: 1.6; color: var(--text);">
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
            <li><strong>Pending Payment:</strong> Raw materials received under 14 to 45 days credit facilities.</li>
            <li><strong>Advance Payment:</strong> Advance purchase order deposits paid to overseas or local importers.</li>
            <li><strong>Supported Channels:</strong> Commercial cheques, corporate online transfers, petty cash, or corporate card.</li>
          </ul>
        </div>
        <div style="background: var(--surface-2); padding: 16px; border-radius: 10px; border: 1px solid var(--border);">
          <h4 style="margin: 0 0 8px; color: #f59e0b; font-size: 14px;"><i class="fa-solid fa-circle-dot"></i> Channel 3: Operating Expenses (Monthly Overhead Bills)</h4>
          <ul style="margin: 0; padding-left: 20px; color: var(--text-muted);">
            <li><strong>Pending Bills:</strong> Monthly operational overheads due at month-end (Electricity, Water, Internet, Rent).</li>
            <li><strong>Paid / Settled:</strong> Utility bills settled and marked Paid with reference number and receipt date.</li>
            <li><strong>Billing Cycle:</strong> Organized on a monthly basis with real-time settlement progress tracking.</li>
            <li><strong>Supported Providers:</strong> CEB / LECO, NWSDB, SLT Fibre, Dialog, and commercial property rent.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
