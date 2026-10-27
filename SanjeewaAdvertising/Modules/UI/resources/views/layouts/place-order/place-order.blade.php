<!-- ==================================================================
             MODULE 2: PLACE ORDER (Order Creation, Orders Panel, Installments)
             ================================================================== -->
        <div class="app-module" id="module-place-order" data-module="place-order">
          <div class="po-container">

            <!-- Banner with KPIs -->
            <div class="po-header-banner">
              <div class="po-banner-content">
                <h2>
                  <span class="badge-icon"><i class="fa-solid fa-cart-plus"></i></span>
                  Place New Printing Order
                </h2>
                <p>Create custom printing orders, configure square-footage pricing, and manage installment payments.</p>
              </div>

              <div class="po-kpi-row">
                <div class="po-kpi-pill">
                  <i class="fa-solid fa-layer-group" style="color: var(--blue);"></i>
                  <div>
                    <div class="kpi-num" id="kpiTotalOrders">0</div>
                    <div class="kpi-label">Total Orders</div>
                  </div>
                </div>
                <div class="po-kpi-pill orange-pill">
                  <i class="fa-solid fa-spinner" style="color: var(--po-orange);"></i>
                  <div>
                    <div class="kpi-num" id="kpiPendingOrders">0</div>
                    <div class="kpi-label">In Production</div>
                  </div>
                </div>
                <div class="po-kpi-pill">
                  <i class="fa-solid fa-wallet" style="color: var(--green);"></i>
                  <div>
                    <div class="kpi-num" id="kpiTotalRevenue">Rs. 0</div>
                    <div class="kpi-label">Total Volume</div>
                  </div>
                </div>
                <div class="po-kpi-pill">
                  <i class="fa-solid fa-hand-holding-dollar" style="color: var(--red);"></i>
                  <div>
                    <div class="kpi-num" id="kpiOutstandingBalance" style="color: var(--red);">Rs. 0</div>
                    <div class="kpi-label">Outstanding</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Place Order Form Card -->
            <section class="po-card">
              <div class="po-card-header">
                <h2 class="po-card-title">
                  <i class="fa-solid fa-pen-fancy"></i> Order Creation Form
                </h2>
                <span style="font-size: 11px; color: var(--text-muted);">
                  Fields with <strong style="color: var(--red);">*</strong> are mandatory
                </span>
              </div>

              <div class="po-card-body">
                <form id="placeOrderForm" autocomplete="off">
                  <div class="po-form-grid">

                    <!-- Column 1: Customer & Product Details -->
                    <div class="po-section-card">
                      <div class="po-section-header">
                        <span class="step-badge">1</span>
                        <h3>Customer & Product Details</h3>
                      </div>

                      <!-- 1. Customer Selection with Autocomplete -->
                      <div class="po-field customer-search-wrap">
                        <label class="po-label" for="customerSearchInput">
                          <span>Select Customer <span class="req">*</span></span>
                          <span class="hint">Search by Mobile or Name</span>
                        </label>

                        <div class="customer-search-input-group" id="customerSearchGroup">
                          <i class="fa-solid fa-magnifying-glass search-icon"></i>
                          <input type="text" id="customerSearchInput" class="po-input" placeholder="Enter mobile no (e.g. 077...)" autocomplete="off">
                          <button type="button" class="add-cust-btn" id="openAddCustBtn" title="Register New Customer">
                            <i class="fa-solid fa-user-plus"></i> New
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

                      <!-- 2. Printing Type / Product -->
                      <div class="po-field">
                        <label class="po-label" for="poProductType">
                          <span>Printing Type / Product <span class="req">*</span></span>
                        </label>
                        <select id="poProductType" class="po-select">
                          <optgroup label="Flex & Banners (Area Based)">
                            <option value="flex_normal" selected>Flex Banner (Normal 280gsm) — Rs. 95/sq.ft</option>
                            <option value="flex_star">Flex Banner (Star / Heavy 380gsm) — Rs. 135/sq.ft</option>
                            <option value="rollup_banner">Rollup Banner Display (Complete 2.5ft × 6ft) — Rs. 6,500/unit</option>
                          </optgroup>
                          <optgroup label="Stickers & Vinyls (Area Based)">
                            <option value="sticker_glossy">Vinyl Sticker (Glossy) — Rs. 140/sq.ft</option>
                            <option value="sticker_matte">Vinyl Sticker (Matte) — Rs. 155/sq.ft</option>
                            <option value="sticker_clear">Clear / Transparent Vinyl — Rs. 175/sq.ft</option>
                            <option value="oneway_vision">One-Way Vision Perforated Film — Rs. 210/sq.ft</option>
                          </optgroup>
                          <optgroup label="Cards & Leaflets (Unit / Quantity Based)">
                            <option value="business_card_std">Business Cards (Standard 350gsm) — Rs. 12/card</option>
                            <option value="business_card_lux">Business Cards (Matte + Spot UV) — Rs. 22/card</option>
                            <option value="flyer_a5">Flyers / Leaflets (A5 Full Color) — Rs. 15/leaflet</option>
                            <option value="flyer_a4">Flyers / Leaflets (A4 Full Color) — Rs. 25/leaflet</option>
                          </optgroup>
                          <optgroup label="Rigid Signage & Backlit">
                            <option value="foam_board">Foam Board Sign (5mm) — Rs. 280/sq.ft</option>
                            <option value="acrylic_sign">Acrylic Sign Board & Lettering — Rs. 650/sq.ft</option>
                            <option value="backlit_film">Lightbox Backlit Film — Rs. 240/sq.ft</option>
                          </optgroup>
                        </select>
                      </div>

                      <!-- 8. Design Status -->
                      <div class="po-field">
                        <label class="po-label" for="poDesignStatus">
                          <span>Design Status <span class="req">*</span></span>
                        </label>
                        <select id="poDesignStatus" class="po-select">
                          <option value="Customer Provides Design" selected>Customer Provides Design (Print Ready)</option>
                          <option value="Shop Creates Design">Shop Creates Design (+Rs. 500 charge)</option>
                        </select>
                        <span id="liveDesignFeeNotice" style="display: none; font-size: 10px; color: var(--po-orange); font-weight: 700; margin-top: 2px;">
                          <i class="fa-solid fa-circle-info"></i> Rs. 500.00 design artwork charge added
                        </span>
                      </div>

                      <!-- Notes -->
                      <div class="po-field">
                        <label class="po-label" for="poNotes">
                          <span>Order Notes / Finishing Requirements</span>
                        </label>
                        <textarea id="poNotes" class="po-textarea" placeholder="E.g. Eyelets every 2 feet, matte lamination, folding, die cut..."></textarea>
                      </div>
                    </div>

                    <!-- Column 2: Dimensions, Quantity & Pricing -->
                    <div class="po-section-card">
                      <div class="po-section-header">
                        <span class="step-badge">2</span>
                        <h3>Dimensions & Measurement</h3>
                      </div>

                      <!-- 3 & 4. Width and Height -->
                      <div class="po-field-row">
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
                      </div>

                      <!-- 5. Measurement Unit & 6. Quantity -->
                      <div class="po-field-row">
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

                      <!-- 7. Unit Price (Rs.) -->
                      <div class="po-field">
                        <label class="po-label" for="poUnitPrice">
                          <span>Unit Price (Rs.) <span class="req">*</span></span>
                          <span class="hint">Per sq.ft or per unit</span>
                        </label>
                        <input type="number" id="poUnitPrice" class="po-input" value="95.00" min="0" step="0.5" required>
                      </div>

                      <!-- Live Area Calculation Callout -->
                      <div class="area-calc-pill">
                        <span><i class="fa-solid fa-calculator" style="color: var(--po-orange); margin-right: 6px;"></i> Computed Area:</span>
                        <span class="area-val" id="liveAreaVal">40.00 sq.ft</span>
                      </div>

                      <!-- Delivery Details -->
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

                      <!-- 11. Delivery Method -->
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

                    <!-- Column 3: Payment Details & Live Summary -->
                    <div class="po-section-card">
                      <div class="po-section-header">
                        <span class="step-badge">3</span>
                        <h3>Payment & Billing Details</h3>
                      </div>

                      <!-- 13. Paid Amount (Initial Advance Deposit) -->
                      <div class="po-field">
                        <label class="po-label" for="poPaidAmount">
                          <span>Advance Deposit Paid (Rs.)</span>
                          <span class="hint">Default Rs. 0.00</span>
                        </label>
                        <input type="number" id="poPaidAmount" class="po-input" value="0.00" min="0" step="100">
                      </div>

                      <!-- Real-Time Financial Summary Card -->
                      <div class="payment-summary-box">
                        <div class="summary-line">
                          <span style="color: var(--text-muted);">12. Total Amount:</span>
                          <strong id="liveTotalAmount" style="font-size: 15px; color: var(--text);">Rs. 3,800.00</strong>
                        </div>
                        <div class="summary-line">
                          <span style="color: var(--text-muted);">13. Initial Paid:</span>
                          <strong id="livePaidAmount" style="color: var(--green);">Rs. 0.00</strong>
                        </div>
                        <div class="summary-line highlight balance-line">
                          <span>14. Remaining Balance:</span>
                          <span id="liveBalanceAmount">Rs. 3,800.00</span>
                        </div>
                        <div class="summary-line" style="margin-top: 4px;">
                          <span style="color: var(--text-muted);">15. Payment Status:</span>
                          <span class="status-badge unpaid" id="livePaymentStatus">Unpaid</span>
                        </div>
                      </div>

                      <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4; padding: 6px 2px;">
                        <i class="fa-solid fa-shield-halved" style="color: var(--po-orange); margin-right: 4px;"></i>
                        Orders with an advance deposit will immediately log Installment #1 with an auto-generated payment voucher.
                      </div>

                      <!-- Form Action Buttons -->
                      <div class="po-form-actions">
                        <button type="button" class="po-btn po-btn-secondary" id="resetOrderFormBtn">
                          <i class="fa-solid fa-rotate-left"></i> Reset
                        </button>
                        <button type="submit" class="po-btn po-btn-primary" id="reviewPlaceOrderBtn">
                          <i class="fa-solid fa-check"></i> Review & Place Order
                        </button>
                      </div>

                    </div>

                  </div>
                </form>
              </div>
            </section>

            <!-- Order Management Panel -->
            <section class="po-card">
              <div class="po-card-header">
                <h2 class="po-card-title">
                  <i class="fa-solid fa-list-check"></i> Orders Management Panel
                </h2>
                <div style="font-size: 11.5px; color: var(--text-muted);">
                  Manage existing printing jobs, view audit details, record multiple installments, and print receipts
                </div>
              </div>

              <!-- Table Search & Filter Toolbar -->
              <div class="po-table-toolbar">
                <div class="po-search-box">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <input type="text" id="orderSearchInput" placeholder="Search by Order ID, Customer, Phone, Product...">
                </div>

                <div class="po-filter-group">
                  <select id="orderStatusFilter" class="po-filter-select" aria-label="Filter by order status">
                    <option value="ALL">All Order Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select id="orderPaymentFilter" class="po-filter-select" aria-label="Filter by payment status">
                    <option value="ALL">All Payment Statuses</option>
                    <option value="Paid">Fully Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <!-- Responsive Order Table -->
              <div class="po-table-responsive">
                <table class="po-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Mobile Number</th>
                      <th>Product & Specs</th>
                      <th>Qty</th>
                      <th>Total (Rs.)</th>
                      <th>Paid (Rs.)</th>
                      <th>Balance (Rs.)</th>
                      <th>Payment Status</th>
                      <th>Deadline</th>
                      <th>Order Status</th>
                      <th>Assigned</th>
                      <th style="text-align: center;">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="ordersTableBody">
                    <!-- Dynamically populated rows -->
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="po-pagination">
                <div id="paginationInfo">Showing 1-10 orders</div>
                <div class="pagination-controls" id="paginationControls"></div>
              </div>
            </section>

          </div>
        </div>
