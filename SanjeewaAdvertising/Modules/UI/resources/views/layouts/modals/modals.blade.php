<!-- ==========================================================================
       SHARED MODALS CONTAINER
       ========================================================================== -->

  <!-- 1. Order Summary Confirmation Modal -->
  <div class="po-modal-overlay" id="orderConfirmationModal">
    <div class="po-modal">
      <div class="po-modal-header">
        <h3><i class="fa-solid fa-clipboard-check"></i> Confirm Order Placement</h3>
        <button type="button" class="modal-close-btn" data-close-modal="orderConfirmationModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="po-modal-body">
        <p style="margin: 0; font-size: 12.5px; color: var(--text-muted);">
          Please review the order details and billing breakdown before saving.
        </p>

        <div class="info-summary-grid">
          <div class="info-item"><span class="info-label">Customer Name</span><span class="info-value" id="confCustName">-</span></div>
          <div class="info-item"><span class="info-label">Mobile Number</span><span class="info-value" id="confCustMobile">-</span></div>
          <div class="info-item"><span class="info-label">Product / Job</span><span class="info-value" id="confProduct">-</span></div>
          <div class="info-item"><span class="info-label">Dimensions & Quantity</span><span class="info-value" id="confSpecs">-</span></div>
          <div class="info-item"><span class="info-label">Total Amount</span><span class="info-value" id="confTotal" style="color: var(--text);">-</span></div>
          <div class="info-item"><span class="info-label">Advance Deposit</span><span class="info-value" id="confPaid" style="color: var(--green);">-</span></div>
          <div class="info-item"><span class="info-label">Remaining Balance</span><span class="info-value" id="confBalance" style="color: var(--po-orange);">-</span></div>
          <div class="info-item"><span class="info-label">Payment Status</span><span class="info-value" id="confStatus">-</span></div>
          <div class="info-item"><span class="info-label">Required Deadline</span><span class="info-value" id="confDeadline">-</span></div>
        </div>
      </div>
      <div class="po-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="orderConfirmationModal">Cancel</button>
        <button type="button" class="po-btn po-btn-primary" id="confirmPlaceOrderBtn">
          <i class="fa-solid fa-check-double"></i> Confirm & Save Order
        </button>
      </div>
    </div>
  </div>

  <!-- 2. View Order Modal (100% Read-Only) -->
  <div class="po-modal-overlay" id="viewOrderModal">
    <div class="po-modal po-modal-large">
      <div class="po-modal-header">
        <h3 id="viewModalTitle"><i class="fa-solid fa-eye"></i> Order Details</h3>
        <button type="button" class="modal-close-btn" data-close-modal="viewOrderModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="po-modal-body">
        <div class="info-summary-grid">
          <div class="info-item"><span class="info-label">Order ID</span><span class="info-value" id="voId" style="color: var(--po-orange);">-</span></div>
          <div class="info-item"><span class="info-label">Order Date</span><span class="info-value" id="voDate">-</span></div>
          <div class="info-item"><span class="info-label">Customer Name</span><span class="info-value" id="voCustName">-</span></div>
          <div class="info-item"><span class="info-label">Customer Mobile</span><span class="info-value" id="voCustMobile">-</span></div>
          <div class="info-item"><span class="info-label">Printing Type / Product</span><span class="info-value" id="voProduct">-</span></div>
          <div class="info-item"><span class="info-label">Dimensions & Unit</span><span class="info-value" id="voDimensions">-</span></div>
          <div class="info-item"><span class="info-label">Quantity</span><span class="info-value" id="voQuantity">-</span></div>
          <div class="info-item"><span class="info-label">Unit Price</span><span class="info-value" id="voUnitPrice">-</span></div>
          <div class="info-item"><span class="info-label">Total Amount</span><span class="info-value" id="voTotal">-</span></div>
          <div class="info-item"><span class="info-label">Paid Amount</span><span class="info-value" id="voPaid" style="color: var(--green);">-</span></div>
          <div class="info-item"><span class="info-label">Balance Amount</span><span class="info-value" id="voBalance" style="color: var(--po-orange);">-</span></div>
          <div class="info-item"><span class="info-label">Payment Status</span><span class="info-value" id="voPaymentStatus">-</span></div>
          <div class="info-item"><span class="info-label">Required Date / Deadline</span><span class="info-value" id="voDeadline">-</span></div>
          <div class="info-item"><span class="info-label">Order Status</span><span class="info-value" id="voOrderStatus">-</span></div>
          <div class="info-item"><span class="info-label">Assigned Employee</span><span class="info-value" id="voAssigned">-</span></div>
        </div>
      </div>
      <div class="po-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="viewOrderModal">Close</button>
      </div>
    </div>
  </div>

  <!-- 3. Edit Order Modal (Full Details & Live Recalculation) -->
  <div class="po-modal-overlay" id="editOrderModal">
    <div class="po-modal po-modal-large" style="max-width: 880px; max-height: 92vh;">
      <div class="po-modal-header">
        <h3 id="editModalTitle"><i class="fa-solid fa-pen-to-square"></i> Edit Order Details</h3>
        <button type="button" class="modal-close-btn" data-close-modal="editOrderModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="po-modal-body" style="gap: 16px;">
        <!-- Order Meta Summary Bar -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: var(--surface-2); padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border); gap: 10px;">
          <div>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Order ID: </span>
            <strong id="eoId" style="color: var(--po-orange); font-size: 13.5px;">-</strong>
          </div>
          <div>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Placed On: </span>
            <span id="eoDate" style="font-size: 12px; font-weight: 600; color: var(--text);">-</span>
          </div>
          <div>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Payment Status: </span>
            <span id="eoPaymentStatus" class="status-badge status-paid">-</span>
          </div>
        </div>

        <!-- Section 1: Customer Details -->
        <div>
          <h4 style="margin: 0 0 10px 0; font-size: 12.5px; font-weight: 800; color: var(--blue); text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-user"></i> Customer Details
          </h4>
          <div class="po-field-row">
            <div class="po-field">
              <label class="po-label" for="eoCustNameInput"><span>Customer Name <span class="req">*</span></span></label>
              <input type="text" id="eoCustNameInput" class="po-input" placeholder="Full name" required>
            </div>
            <div class="po-field">
              <label class="po-label" for="eoCustMobileInput"><span>Mobile Number <span class="req">*</span></span></label>
              <input type="text" id="eoCustMobileInput" class="po-input" placeholder="0771234567" required>
            </div>
          </div>
        </div>

        <!-- Section 2: Product Specifications & Dimensions -->
        <div>
          <h4 style="margin: 0 0 10px 0; font-size: 12.5px; font-weight: 800; color: var(--po-orange); text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-print"></i> Product Specifications & Dimensions
          </h4>

          <div class="po-field" style="margin-bottom: 12px;">
            <label class="po-label" for="eoProductSelect"><span>Printing Type / Product <span class="req">*</span></span></label>
            <select id="eoProductSelect" class="po-select">
              <optgroup label="Flex & Banners (Area Based)">
                <option value="flex_normal">Flex Banner (Normal 280gsm) — Rs. 95/sq.ft</option>
                <option value="flex_star">Flex Banner (Star / Heavy 380gsm) — Rs. 135/sq.ft</option>
                <option value="rollup_banner">Rollup Banner Display (Complete 2.5ft × 6ft) — Rs. 6,500/unit</option>
              </optgroup>
              <optgroup label="Stickers & Vinyls (Area Based)">
                <option value="sticker_glossy">Vinyl Sticker (Glossy) — Rs. 140/sq.ft</option>
                <option value="sticker_matte">Vinyl Sticker (Matte) — Rs. 155/sq.ft</option>
                <option value="sticker_clear">Clear / Transparent Vinyl — Rs. 175/sq.ft</option>
                <option value="oneway_vision">One-Way Vision Perforated Film — Rs. 210/sq.ft</option>
              </optgroup>
              <optgroup label="Cards & Leaflets (Quantity Based)">
                <option value="business_card_std">Business Cards (Standard 350gsm) — Rs. 12/card</option>
                <option value="business_card_lux">Business Cards (Matte + Spot UV) — Rs. 22/card</option>
                <option value="flyer_a5">Flyers / Leaflets (A5 Full Color) — Rs. 15/leaflet</option>
                <option value="flyer_a4">Flyers / Leaflets (A4 Full Color) — Rs. 25/leaflet</option>
              </optgroup>
              <optgroup label="Rigid Signage & Backlit">
                <option value="foam_board">Foam Board Sign (5mm) — Rs. 280/sq.ft</option>
                <option value="acrylic_sign">Acrylic Lettering Sign — Rs. 650/sq.in</option>
                <option value="backlit_film">Lightbox Backlit Film — Rs. 240/sq.ft</option>
              </optgroup>
            </select>
          </div>

          <div class="po-field-row" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
            <div class="po-field">
              <label class="po-label" for="eoWidthInput"><span>Width</span></label>
              <input type="number" id="eoWidthInput" class="po-input" min="0.1" step="0.1">
            </div>
            <div class="po-field">
              <label class="po-label" for="eoHeightInput"><span>Height</span></label>
              <input type="number" id="eoHeightInput" class="po-input" min="0.1" step="0.1">
            </div>
            <div class="po-field">
              <label class="po-label" for="eoUnitSelect"><span>Unit</span></label>
              <select id="eoUnitSelect" class="po-select">
                <option value="feet">Feet (ft)</option>
                <option value="inches">Inches (in)</option>
                <option value="mm">Millimeters</option>
              </select>
            </div>
            <div class="po-field">
              <label class="po-label" for="eoQuantityInput"><span>Qty <span class="req">*</span></span></label>
              <input type="number" id="eoQuantityInput" class="po-input" min="1" step="1" required>
            </div>
            <div class="po-field">
              <label class="po-label" for="eoUnitPriceInput"><span>Unit Price (Rs.)</span></label>
              <input type="number" id="eoUnitPriceInput" class="po-input" min="0" step="0.5" required>
            </div>
          </div>
        </div>

        <!-- Section 3: Workflow, Deadline & Delivery -->
        <div>
          <h4 style="margin: 0 0 10px 0; font-size: 12.5px; font-weight: 800; color: var(--purple); text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fa-solid fa-truck-ramp-box"></i> Workflow, Deadline & Staff
          </h4>
          <div class="po-field-row">
            <div class="po-field">
              <label class="po-label" for="eoDesignStatusSelect"><span>Design Status</span></label>
              <select id="eoDesignStatusSelect" class="po-select">
                <option value="Customer Provides Design">Customer Provides Design</option>
                <option value="Shop Creates Design">Shop Creates Design (+Rs. 500)</option>
                <option value="Design Approved">Design Approved</option>
              </select>
            </div>
            <div class="po-field">
              <label class="po-label" for="eoDeliverySelect"><span>Delivery Method</span></label>
              <select id="eoDeliverySelect" class="po-select">
                <option value="Pickup">Pickup at Counter</option>
                <option value="Delivery">Delivery Service (+Rs. 350)</option>
              </select>
            </div>
          </div>

          <div class="po-field-row" style="margin-top: 10px;">
            <div class="po-field">
              <label class="po-label" for="eoDeadlineInput"><span>Required Delivery Date <span class="req">*</span></span></label>
              <input type="date" id="eoDeadlineInput" class="po-input" required>
            </div>
            <div class="po-field">
              <label class="po-label" for="eoStatusSelect"><span>Production Status <span class="req">*</span></span></label>
              <select id="eoStatusSelect" class="po-select">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div class="po-field">
              <label class="po-label" for="eoEmployeeSelect"><span>Assigned Staff <span class="req">*</span></span></label>
              <select id="eoEmployeeSelect" class="po-select">
                <option value="Admin User">Admin User</option>
                <option value="Kasun Perera">Kasun Perera</option>
                <option value="Nuwan Silva">Nuwan Silva</option>
                <option value="Dilshan Fernando">Dilshan Fernando</option>
                <option value="Chamara Bandara">Chamara Bandara</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 4: Live Recalculated Financial Summary -->
        <div style="background: var(--surface-2); padding: 14px 18px; border-radius: 10px; border: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted);"><i class="fa-solid fa-calculator"></i> Real-time Financial Breakdown</span>
            <span id="eoAreaCalc" style="font-size: 11.5px; font-weight: 600; color: var(--text-muted);">Area: 0.00 sq.ft</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            <div style="background: var(--surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);">
              <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Order Amount</span>
              <div id="eoTotal" style="font-size: 16px; font-weight: 800; color: var(--text); margin-top: 2px;">Rs. 0.00</div>
            </div>
            <div style="background: var(--surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);">
              <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Paid to Date</span>
              <div id="eoPaid" style="font-size: 16px; font-weight: 800; color: var(--green); margin-top: 2px;">Rs. 0.00</div>
            </div>
            <div style="background: var(--surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);">
              <span style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Remaining Balance</span>
              <div id="eoBalance" style="font-size: 16px; font-weight: 800; color: var(--po-orange); margin-top: 2px;">Rs. 0.00</div>
            </div>
          </div>
        </div>

        <!-- Section 5: Order Notes -->
        <div class="po-field">
          <label class="po-label" for="eoNotesInput"><span>Job Notes & Finishing Instructions</span></label>
          <textarea id="eoNotesInput" class="po-textarea" rows="2" placeholder="Reinforced borders, eyelets, packaging notes..."></textarea>
        </div>
      </div>

      <div class="po-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="editOrderModal">Cancel</button>
        <button type="button" class="po-btn po-btn-primary" id="saveEditOrderBtn">
          <i class="fa-solid fa-floppy-disk"></i> Save & Update Order
        </button>
      </div>
    </div>
  </div>

  <!-- 4. Add Payment Installment Modal -->
  <div class="po-modal-overlay" id="addPaymentModal">
    <div class="po-modal">
      <div class="po-modal-header">
        <h3><i class="fa-solid fa-credit-card"></i> Add Payment Installment</h3>
        <button type="button" class="modal-close-btn" data-close-modal="addPaymentModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="po-modal-body">
        <div class="area-calc-pill" style="margin-bottom: 4px;">
          <span>Outstanding Remaining Balance:</span>
          <span class="area-val" id="pmRemainingBalance" style="color: var(--red); font-size: 13px;">Rs. 0.00</span>
        </div>

        <div class="po-field-row">
          <div class="po-field"><label class="po-label" for="pmPaymentId">Payment ID</label><input type="text" id="pmPaymentId" class="po-input" readonly></div>
          <div class="po-field"><label class="po-label" for="pmOrderId">Order ID</label><input type="text" id="pmOrderId" class="po-input" readonly></div>
        </div>

        <div class="po-field-row">
          <div class="po-field"><label class="po-label" for="pmInstallmentNo">Installment Number</label><input type="text" id="pmInstallmentNo" class="po-input" readonly></div>
          <div class="po-field"><label class="po-label" for="pmDate">Payment Date</label><input type="date" id="pmDate" class="po-input" required></div>
        </div>

        <div class="po-field-row">
          <div class="po-field">
            <label class="po-label" for="pmAmount"><span>Payment Amount (Rs.) <span class="req">*</span></span></label>
            <input type="number" id="pmAmount" class="po-input" min="1" step="10" required>
          </div>
          <div class="po-field">
            <label class="po-label" for="pmMethod"><span>Payment Method <span class="req">*</span></span></label>
            <select id="pmMethod" class="po-select">
              <option value="Cash" selected>Cash</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Bank Transfer">Bank Transfer / Deposit</option>
              <option value="Online / QR">Online / LankaQR</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="po-field-row">
          <div class="po-field"><label class="po-label" for="pmRef">Transaction Reference (Optional)</label><input type="text" id="pmRef" class="po-input" placeholder="Slip / TXN / Cheque No"></div>
          <div class="po-field"><label class="po-label" for="pmReceivedBy">Received By</label><input type="text" id="pmReceivedBy" class="po-input" readonly></div>
        </div>

        <div class="po-field">
          <label class="po-label" for="pmNote">Payment Note (Optional)</label>
          <input type="text" id="pmNote" class="po-input" placeholder="E.g. Final balance settlement, partial advance">
        </div>
      </div>
      <div class="po-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="addPaymentModal">Cancel</button>
        <button type="button" class="po-btn po-btn-primary" id="submitAddPaymentBtn"><i class="fa-solid fa-check"></i> Record Payment & Generate Receipt</button>
      </div>
    </div>
  </div>

  <!-- 5. Payment History Modal -->
  <div class="po-modal-overlay" id="paymentHistoryModal">
    <div class="po-modal po-modal-large">
      <div class="po-modal-header">
        <h3 id="histModalTitle"><i class="fa-solid fa-clock-rotate-left"></i> Payment History</h3>
        <button type="button" class="modal-close-btn" data-close-modal="paymentHistoryModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="po-modal-body">
        <div id="histOrderInfo" style="font-size: 12px; color: var(--text-muted); background: var(--surface-2); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);"></div>

        <div class="po-table-responsive">
          <table class="history-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Inst #</th>
                <th>Date</th>
                <th>Amount (Rs.)</th>
                <th>Method</th>
                <th>Received By</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="historyTableBody"></tbody>
          </table>
        </div>
      </div>
      <div class="po-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="paymentHistoryModal">Close</button>
      </div>
    </div>
  </div>

  <!-- 6. Print Payment Receipt Modal -->
  <div class="po-modal-overlay" id="receiptModal">
    <div class="po-modal" style="max-width: 580px;">
      <div class="po-modal-header">
        <h3><i class="fa-solid fa-print"></i> Official Payment Receipt</h3>
        <button type="button" class="modal-close-btn" data-close-modal="receiptModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="po-modal-body" style="background: var(--surface-2); padding: 16px;">
        <div class="receipt-paper" id="printableReceipt">
          <div class="receipt-header">
            <h2>SANJEEWA ADVERTISING</h2>
            <p>Digital Large Format & Offset Printing Solutions</p>
            <p>No. 42 Main Street, Colombo 03, Sri Lanka &bull; Tel: +94 11 234 5678</p>
            <span class="receipt-badge-title">OFFICIAL PAYMENT RECEIPT</span>
          </div>

          <table class="receipt-details-table">
            <tr><td><strong>Receipt No:</strong></td><td class="strong" id="rcptPaymentId">-</td></tr>
            <tr><td><strong>Order ID:</strong></td><td class="strong" id="rcptOrderId">-</td></tr>
            <tr><td><strong>Date:</strong></td><td class="strong" id="rcptDate">-</td></tr>
            <tr><td><strong>Customer Name:</strong></td><td class="strong" id="rcptCustName">-</td></tr>
            <tr><td><strong>Mobile No:</strong></td><td class="strong" id="rcptCustMobile">-</td></tr>
            <tr><td><strong>Product & Specs:</strong></td><td class="strong" id="rcptProduct">-</td></tr>
            <tr><td><strong>Installment:</strong></td><td class="strong" id="rcptInstallment">-</td></tr>
            <tr><td><strong>Payment Method:</strong></td><td class="strong" id="rcptMethod">-</td></tr>
            <tr><td><strong>Received By:</strong></td><td class="strong" id="rcptReceivedBy">-</td></tr>
          </table>

          <div class="receipt-financials">
            <div class="receipt-fin-row"><span>Total Order Value:</span><strong id="rcptTotalAmount">Rs. 0.00</strong></div>
            <div class="receipt-fin-row major"><span>Amount Received (This Installment):</span><span id="rcptPaidThis">Rs. 0.00</span></div>
            <div class="receipt-fin-row" style="color: var(--red); font-weight: 700; margin-top: 4px;"><span>Remaining Balance:</span><span id="rcptRemainingBalance">Rs. 0.00</span></div>
          </div>

          <div class="receipt-signatures">
            <div class="receipt-sig-line">Customer Signature</div>
            <div class="receipt-sig-line">Authorized Cashier</div>
          </div>

          <div class="receipt-footer">
            Thank you for your business! Please keep this receipt for collection.
          </div>
        </div>
      </div>
      <div class="po-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="receiptModal">Close</button>
        <button type="button" class="po-btn po-btn-primary" onclick="window.placeOrderApp.triggerPrintReceipt()">
          <i class="fa-solid fa-print"></i> Print Receipt Now
        </button>
      </div>
    </div>
  </div>

  <!-- 7. Quick Add Customer Modal -->
  <div class="po-modal-overlay" id="addCustomerModal">
    <div class="po-modal" style="max-width: 480px;">
      <div class="po-modal-header">
        <h3><i class="fa-solid fa-user-plus"></i> Register New Customer</h3>
        <button type="button" class="modal-close-btn" data-close-modal="addCustomerModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="po-modal-body">
        <div class="po-field">
          <label class="po-label" for="newCustName"><span>Customer Name <span class="req">*</span></span></label>
          <input type="text" id="newCustName" class="po-input" placeholder="E.g. Mahela Jayawardena" required>
        </div>
        <div class="po-field">
          <label class="po-label" for="newCustMobile"><span>Mobile Number <span class="req">*</span></span></label>
          <input type="text" id="newCustMobile" class="po-input" placeholder="E.g. 0771234567" required>
        </div>
        <div class="po-field">
          <label class="po-label" for="newCustAddress">Address / City</label>
          <input type="text" id="newCustAddress" class="po-input" placeholder="E.g. Colombo 05">
        </div>
        <div class="po-field">
          <label class="po-label" for="newCustType">Customer Category</label>
          <select id="newCustType" class="po-select">
            <option value="Regular" selected>Regular Walk-in</option>
            <option value="Corporate">Corporate / Agency</option>
            <option value="VIP">VIP Client</option>
          </select>
        </div>
      </div>
      <div class="po-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="addCustomerModal">Cancel</button>
        <button type="button" class="po-btn po-btn-primary" id="saveNewCustomerBtn">
          <i class="fa-solid fa-user-check"></i> Register Customer
        </button>
      </div>
    </div>
  </div>
