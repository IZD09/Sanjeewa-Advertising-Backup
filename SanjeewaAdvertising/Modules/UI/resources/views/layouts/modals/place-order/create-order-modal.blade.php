<!-- ==========================================================================
     ORDER CREATION MODAL (#createOrderModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="createOrderModal">
  <div class="po-modal po-modal-xl">
    <div class="po-modal-header">
      <h3>
        <i class="fa-solid fa-pen-fancy"></i> Order Creation Form
      </h3>
      <button type="button" class="modal-close-btn" data-close-modal="createOrderModal" title="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="padding: 22px; max-height: calc(92vh - 65px); overflow-y: auto;">
      <form id="placeOrderForm" autocomplete="off">
        <div class="po-form-grid po-form-vertical">

          <!-- Section 1: Customer & Product Details -->
          <div class="po-section-card">
            <div class="po-section-header">
              <span class="step-badge">1</span>
              <div>
                <h3>Customer & Product Details</h3>
                <span class="po-section-subtitle">Select customer, choose printing type and material, and specify artwork requirements</span>
              </div>
            </div>

            <!-- 1. Customer Selection with Autocomplete -->
            <div class="po-field customer-search-wrap">
              <label class="po-label" for="customerSearchInput">
                <span>Select Customer <span class="req">*</span></span>
                <span class="hint">Search by Mobile or Name</span>
              </label>

              <div class="customer-search-input-group" id="customerSearchGroup">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="customerSearchInput" class="po-input" placeholder="Enter mobile no (e.g. 077...) or customer name" autocomplete="off">
                <button type="button" class="add-cust-btn" id="openAddCustBtn" title="Register New Customer">
                  <i class="fa-solid fa-user-plus"></i> New Customer
                </button>
              </div>

              <!-- Autocomplete Dropdown List -->
              <div class="customer-dropdown-menu" id="customerDropdown"></div>

              <!-- Selected Customer Chip -->
              <div class="selected-customer-card" id="selectedCustomerCard" style="display: none;">
                <div>
                  <div class="cust-name" id="selectedCustName">Customer Name</div>
                  <div class="cust-mobile" id="selectedCustMobile">0771234567</div>
                </div>
                <button type="button" class="clear-cust-btn" id="clearCustomerBtn" title="Change Customer">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <!-- 2. Split Dropdowns: Printing Type & Product / Material -->
            <div class="po-field-row">
              <!-- Dropdown 1: Printing Type -->
              <div class="po-field">
                <label class="po-label" for="poPrintingType">
                  <span>Printing Type <span class="req">*</span></span>
                  <span class="hint">Category</span>
                </label>
                <select id="poPrintingType" class="po-select">
                  <option value="flex" selected>Flex & Banners (Area Based)</option>
                  <option value="sticker">Stickers & Vinyls (Area Based)</option>
                  <option value="commercial">Cards & Leaflets (Unit / Quantity Based)</option>
                  <option value="signage">Rigid Signage & Backlit</option>
                </select>
              </div>

              <!-- Dropdown 2: Product / Material -->
              <div class="po-field">
                <label class="po-label" for="poProductType">
                  <span>Product / Material <span class="req">*</span></span>
                  <span class="hint">Material & Rate</span>
                </label>
                <select id="poProductType" class="po-select">
                  <option value="flex_normal" selected>Flex Banner (Normal 280gsm) — Rs. 95/sq.ft</option>
                  <option value="flex_star">Flex Banner (Star / Heavy 380gsm) — Rs. 135/sq.ft</option>
                  <option value="rollup_banner">Rollup Banner Display (Complete Set) — Rs. 6,500/unit</option>
                </select>
              </div>
            </div>

            <!-- 3. Design Status & Notes -->
            <div class="po-field-row">
              <div class="po-field">
                <label class="po-label" for="poDesignStatus">
                  <span>Design Status <span class="req">*</span></span>
                </label>
                <select id="poDesignStatus" class="po-select">
                  <option value="Customer Provides Design" selected>Customer Provides Design (Print Ready)</option>
                  <option value="Shop Creates Design">Shop Creates Design (+Rs. 500 charge)</option>
                </select>
                <span id="liveDesignFeeNotice" style="display: none; font-size: 11px; color: var(--po-orange); font-weight: 700; margin-top: 4px;">
                  <i class="fa-solid fa-circle-info"></i> Rs. 500.00 design artwork charge added
                </span>
              </div>

              <div class="po-field">
                <label class="po-label" for="poNotes">
                  <span>Order Notes / Finishing Requirements</span>
                  <span class="hint">Optional</span>
                </label>
                <textarea id="poNotes" class="po-textarea" placeholder="E.g. Eyelets every 2 feet, matte lamination, folding, die cut..."></textarea>
              </div>
            </div>

          </div>

          <!-- Section 2: Dimensions & Measurement -->
          <div class="po-section-card">
            <div class="po-section-header">
              <span class="step-badge">2</span>
              <div>
                <h3>Dimensions & Measurement</h3>
                <span class="po-section-subtitle">Set width, height, unit of measurement, quantity, unit price, and delivery schedule</span>
              </div>
            </div>

            <!-- Row 1: Width, Height, Unit, Quantity -->
            <div class="po-field-row-4">
              <div class="po-field">
                <label class="po-label" for="poWidth">
                  <span>Width <span class="req">*</span></span>
                </label>
                <input type="number" id="poWidth" class="po-input" value="10" min="0.1" step="0.1" required>
              </div>

              <div class="po-field">
                <label class="po-label" for="poHeight">
                  <span>Height <span class="req">*</span></span>
                </label>
                <input type="number" id="poHeight" class="po-input" value="4" min="0.1" step="0.1" required>
              </div>

              <div class="po-field">
                <label class="po-label" for="poUnit">
                  <span>Unit <span class="req">*</span></span>
                </label>
                <select id="poUnit" class="po-select">
                  <option value="feet" selected>Feet (ft)</option>
                  <option value="inches">Inches (in)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="mm">Millimeters (mm)</option>
                </select>
              </div>

              <div class="po-field">
                <label class="po-label" for="poQty">
                  <span>Quantity <span class="req">*</span></span>
                </label>
                <input type="number" id="poQty" class="po-input" value="1" min="1" step="1" required>
              </div>
            </div>

            <!-- Row 2: Unit Price, Computed Area, Delivery Method -->
            <div class="po-field-row-3">
              <div class="po-field">
                <label class="po-label" for="poUnitPrice">
                  <span>Unit Price (Rs.) <span class="req">*</span></span>
                  <span class="hint">Per sq.ft or per unit</span>
                </label>
                <input type="number" id="poUnitPrice" class="po-input" value="95.00" min="0" step="0.5" required>
              </div>

              <div class="po-field">
                <label class="po-label">
                  <span>Computed Area</span>
                  <span class="hint">Auto Calculated</span>
                </label>
                <div class="area-calc-pill" style="height: var(--input-height);">
                  <span><i class="fa-solid fa-calculator" style="color: var(--po-orange); margin-right: 6px;"></i> Area:</span>
                  <span class="area-val" id="liveAreaVal">40.00 sq.ft</span>
                </div>
              </div>

              <div class="po-field">
                <label class="po-label" for="poDeliveryMethod">
                  <span>Delivery Method <span class="req">*</span></span>
                </label>
                <select id="poDeliveryMethod" class="po-select">
                  <option value="Pickup" selected>Store Pickup (Customer Collects)</option>
                  <option value="Delivery">Delivery / Courier (Colombo & Outstation)</option>
                </select>
              </div>
            </div>

            <!-- Row 3: Order Date & Deadline -->
            <div class="po-field-row">
              <div class="po-field">
                <label class="po-label" for="poOrderDate">
                  <span>Order Date</span>
                </label>
                <input type="date" id="poOrderDate" class="po-input" readonly>
              </div>

              <div class="po-field">
                <label class="po-label" for="poRequiredDate">
                  <span>Deadline <span class="req">*</span></span>
                </label>
                <input type="date" id="poRequiredDate" class="po-input" required>
              </div>
            </div>

          </div>

          <!-- Section 3: Payment & Billing Details -->
          <div class="po-section-card">
            <div class="po-section-header">
              <span class="step-badge">3</span>
              <div>
                <h3>Payment & Billing Details</h3>
                <span class="po-section-subtitle">Record advance deposit, check real-time calculations & balance, and place order</span>
              </div>
            </div>

            <div class="po-payment-split">
              <div class="po-payment-left">
                <div class="po-field">
                  <label class="po-label" for="poPaidAmount">
                    <span>Advance Deposit Paid (Rs.)</span>
                    <span class="hint">Optional advance</span>
                  </label>
                  <input type="number" id="poPaidAmount" class="po-input" value="0.00" min="0" step="100">
                </div>

                <div class="po-payment-notice">
                  <i class="fa-solid fa-shield-halved" style="color: var(--po-orange); font-size: 15px; margin-top: 2px;"></i>
                  <div>
                    Orders with an advance deposit will automatically create <strong>Installment #1</strong> with an auto-generated payment voucher.
                  </div>
                </div>
              </div>

              <div class="po-payment-right">
                <!-- Real-Time Financial Summary Card -->
                <div class="payment-summary-box">
                  <div class="summary-line">
                    <span style="color: var(--text-muted);">Total Amount:</span>
                    <strong id="liveTotalAmount" style="font-size: 15px; color: var(--text);">Rs. 3,800.00</strong>
                  </div>
                  <div class="summary-line">
                    <span style="color: var(--text-muted);">Initial Paid:</span>
                    <strong id="livePaidAmount" style="color: var(--green);">Rs. 0.00</strong>
                  </div>
                  <div class="summary-line highlight balance-line">
                    <span>Remaining Balance:</span>
                    <span id="liveBalanceAmount">Rs. 3,800.00</span>
                  </div>
                  <div class="summary-line" style="margin-top: 4px;">
                    <span style="color: var(--text-muted);">Payment Status:</span>
                    <span class="status-badge unpaid" id="livePaymentStatus">Unpaid</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Action Buttons -->
            <div class="po-form-actions">
              <button type="button" class="po-btn po-btn-secondary" data-close-modal="createOrderModal">
                <i class="fa-solid fa-xmark"></i> Cancel
              </button>
              <button type="button" class="po-btn po-btn-secondary" id="resetOrderFormBtn">
                <i class="fa-solid fa-rotate-left"></i> Reset Form
              </button>
              <button type="submit" class="po-btn po-btn-primary" id="reviewPlaceOrderBtn">
                <i class="fa-solid fa-check"></i> Review & Place Order
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  </div>
</div>

