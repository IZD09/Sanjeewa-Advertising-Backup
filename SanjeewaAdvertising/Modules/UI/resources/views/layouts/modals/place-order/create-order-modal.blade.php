@php
    $customers = $customers ?? \Modules\Customer\Models\Customer::query()->orderBy('name')->get();
    $printTypes = $printTypes ?? \Modules\Design\Models\PrintType::query()->orderBy('id')->get();
    $units = $units ?? \Modules\PrintJob\Models\Unit::query()->orderBy('id')->get();
    $paymentTypes = $paymentTypes ?? \Modules\Transaction\Models\PaymentType::query()->orderBy('id')->get();
    $statuses = $statuses ?? \Modules\PrintJob\Models\PrintJobStatus::query()->orderBy('id')->get();
    $deliveryMethods = $deliveryMethods ?? \Modules\PrintJob\Models\DeliveryMethod::query()->orderBy('id')->get();
    $users = $users ?? \Modules\User\Models\User::query()->orderBy('first_name')->get();
    $paymentStatuses = $paymentStatuses ?? \Modules\Transaction\Models\PaymentStatus::query()->orderBy('id')->get();
@endphp

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
                <h3>Customer & Job Specifications</h3>
                <span class="po-section-subtitle">Select customer, choose print type category, and define workflow stage</span>
              </div>
            </div>

            <!-- 1. Unified Search + Dropdown Customer Selector -->
            <div class="po-field customer-search-wrap">
              <label class="po-label" for="customerSearchInput">
                <span>Select Customer <span class="req">*</span></span>
                <span class="hint" id="customerSearchHint">Click to browse list or type to search</span>
              </label>

              <!-- Single Integrated Search + Dropdown Box -->
              <div class="customer-search-input-group" id="customerSearchGroup">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="customerSearchInput" class="po-input" placeholder="Search customer by name or mobile (or click to browse)..." autocomplete="off">
                <input type="hidden" id="selectedCustomerId" value="">

                <div class="combo-actions">
                  <button type="button" class="combo-arrow-btn" id="toggleCustomerDropdownBtn" title="Show All Customers">
                    <i class="fa-solid fa-chevron-down" id="customerDropdownIcon"></i>
                  </button>
                  <button type="button" class="add-cust-btn" id="openAddCustBtn" title="Register New Customer">
                    <i class="fa-solid fa-user-plus"></i> New
                  </button>
                </div>
              </div>

              <!-- Unified Autocomplete & Dropdown Menu List -->
              <div class="customer-dropdown-menu" id="customerDropdown"></div>

              <!-- Selected Customer Chip -->
              <div class="selected-customer-card" id="selectedCustomerCard" style="display: none; margin-top: 6px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--po-primary-subtle); color: var(--po-primary); display: flex; align-items: center; justify-content: center; font-size: 13px;">
                    <i class="fa-solid fa-user-check"></i>
                  </div>
                  <div>
                    <div class="cust-name" id="selectedCustName" style="font-weight: 700; color: var(--text);">Customer Name</div>
                    <div class="cust-mobile" id="selectedCustMobile" style="font-size: 11px; color: var(--text-muted);">0771234567</div>
                  </div>
                </div>
                <button type="button" class="clear-cust-btn" id="clearCustomerBtn" title="Change Customer">
                  <i class="fa-solid fa-rotate"></i> Change Customer
                </button>
              </div>

              <!-- Embedded Initial Database Customers Data for Instant Hydration -->
              <script id="serverCustomersData" type="application/json">
                {!! json_encode(collect($customers)->map(fn($c) => [
                    'id' => (int) data_get($c, 'id'),
                    'name' => data_get($c, 'name'),
                    'mobile' => data_get($c, 'mobile'),
                    'email' => data_get($c, 'email', ''),
                ])->values()->all()) !!}
              </script>

              <!-- Embedded Initial Database Master Data for Dropdowns -->
              <script id="serverOrderFormData" type="application/json">
                {!! json_encode([
                    'printTypes' => collect($printTypes)->map(fn($pt) => ['id' => (int) data_get($pt, 'id'), 'name' => data_get($pt, 'print_type') ?? data_get($pt, 'name')])->values()->all(),
                    'statuses' => collect($statuses)->map(fn($st) => ['id' => (int) data_get($st, 'id'), 'name' => data_get($st, 'print_job_states') ?? data_get($st, 'name')])->values()->all(),
                    'units' => collect($units)->map(fn($u) => ['id' => (int) data_get($u, 'id'), 'simble' => data_get($u, 'simble'), 'name' => data_get($u, 'name')])->values()->all(),
                    'deliveryMethods' => collect($deliveryMethods)->map(fn($dm) => ['id' => (int) data_get($dm, 'id'), 'name' => data_get($dm, 'methord') ?? data_get($dm, 'name')])->values()->all(),
                    'paymentTypes' => collect($paymentTypes)->map(fn($pm) => ['id' => (int) data_get($pm, 'id'), 'name' => data_get($pm, 'payment_type') ?? data_get($pm, 'name')])->values()->all(),
                    'users' => collect($users)->map(fn($u) => ['id' => (int) data_get($u, 'id'), 'name' => trim(data_get($u, 'first_name') . ' ' . data_get($u, 'last_name')) ?: (data_get($u, 'username') ?? 'User #' . data_get($u, 'id'))])->values()->all(),
                    'paymentStatuses' => collect($paymentStatuses)->map(fn($ps) => ['id' => (int) data_get($ps, 'id'), 'name' => data_get($ps, 'payment_status') ?? data_get($ps, 'name')])->values()->all(),
                ]) !!}
              </script>
            </div>

            <!-- 2. Dropdowns: Printing Type, Job Status & Assigned Staff (Loaded from Database) -->
            <div class="po-field-row-3">
              <!-- Dropdown 1: Printing Type (database) -->
              <div class="po-field">
                <label class="po-label" for="poPrintingType">
                  <span>Printing Type <span class="req">*</span></span>
                  <span class="hint">Database: print_types</span>
                </label>
                <select id="poPrintingType" class="po-select" required>
                  @forelse($printTypes as $pt)
                    @php
                      $ptId = data_get($pt, 'id');
                      $ptName = data_get($pt, 'print_type') ?? data_get($pt, 'name');
                    @endphp
                    <option value="{{ $ptId }}" {{ $loop->first ? 'selected' : '' }}>
                      {{ $ptName }}
                    </option>
                  @empty
                    <option value="1">Flex Banner</option>
                    <option value="2">Sticker / Vinyl</option>
                  @endforelse
                </select>
              </div>

              <!-- Dropdown 2: Initial Job Status (database) -->
              <div class="po-field">
                <label class="po-label" for="poJobStatus">
                  <span>Initial Status <span class="req">*</span></span>
                  <span class="hint">Database: print_job_statuses</span>
                </label>
                <select id="poJobStatus" class="po-select" required>
                  @forelse($statuses as $st)
                    @php
                      $stId = data_get($st, 'id');
                      $stName = data_get($st, 'print_job_states') ?? data_get($st, 'name');
                    @endphp
                    <option value="{{ $stId }}" {{ (int) $stId === 1 ? 'selected' : '' }}>
                      {{ $stName }}
                    </option>
                  @empty
                    <option value="1" selected>Pending</option>
                    <option value="2">Designing</option>
                  @endforelse
                </select>
              </div>

              <!-- Dropdown 3: Assigned Staff / Operator (database) -->
              <div class="po-field">
                <label class="po-label" for="poUser">
                  <span>Assigned Staff <span class="req">*</span></span>
                  <span class="hint">Database: users</span>
                </label>
                <select id="poUser" class="po-select" required>
                  @forelse($users as $u)
                    @php
                      $uId = data_get($u, 'id');
                      $uName = trim(data_get($u, 'first_name') . ' ' . data_get($u, 'last_name'));
                      if (empty($uName)) $uName = data_get($u, 'username') ?? ('Staff #' . $uId);
                    @endphp
                    <option value="{{ $uId }}" {{ $loop->first ? 'selected' : '' }}>
                      {{ $uName }}
                    </option>
                  @empty
                    <option value="1" selected>System Admin</option>
                  @endforelse
                </select>
              </div>
            </div>

            <!-- 3. Design Status & Notes -->
            <div class="po-field-row">
              <div class="po-field">
                <label class="po-label" for="poDesignStatus">
                  <span>Artwork / Design Status <span class="req">*</span></span>
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
                <textarea id="poNotes" class="po-textarea" placeholder="E.g. Eyelets every 2 feet, matte lamination, folding, die cut, special border..."></textarea>
              </div>
            </div>

          </div>

          <!-- Section 2: Dimensions & Measurement -->
          <div class="po-section-card">
            <div class="po-section-header">
              <span class="step-badge">2</span>
              <div>
                <h3>Dimensions, Quantity & Pricing</h3>
                <span class="po-section-subtitle">Set width, height, unit of measurement, quantity, unit rate, and discount</span>
              </div>
            </div>

            <!-- Row 1: Width, Height, Unit (Database), Quantity -->
            <div class="po-field-row-4">
              <div class="po-field">
                <label class="po-label" for="poWidth">
                  <span>Width <span class="req">*</span></span>
                </label>
                <input type="number" id="poWidth" class="po-input" value="10" min="0.1" step="any" required>
              </div>

              <div class="po-field">
                <label class="po-label" for="poHeight">
                  <span>Height <span class="req">*</span></span>
                </label>
                <input type="number" id="poHeight" class="po-input" value="4" min="0.1" step="any" required>
              </div>

              <!-- Unit Dropdown (from database unit table) -->
              <div class="po-field">
                <label class="po-label" for="poUnit">
                  <span>Unit <span class="req">*</span></span>
                  <span class="hint">Database: unit</span>
                </label>
                <select id="poUnit" class="po-select" required>
                  @forelse($units as $u)
                    @php
                      $uId = data_get($u, 'id');
                      $uSymbol = data_get($u, 'simble');
                      $uName = data_get($u, 'name');
                    @endphp
                    <option value="{{ $uId }}" data-symbol="{{ $uSymbol }}" {{ $uSymbol === 'ft' || $loop->first ? 'selected' : '' }}>
                      {{ $uName }} ({{ $uSymbol }})
                    </option>
                  @empty
                    <option value="1" data-symbol="ft" selected>Feet (ft)</option>
                    <option value="2" data-symbol="in">Inches (in)</option>
                  @endforelse
                </select>
              </div>

              <div class="po-field">
                <label class="po-label" for="poQty">
                  <span>Quantity <span class="req">*</span></span>
                </label>
                <input type="number" id="poQty" class="po-input" value="1" min="1" step="1" required>
              </div>
            </div>

            <!-- Row 2: Unit Price, Computed Area, Discount, Delivery Method -->
            <div class="po-field-row-4">
              <div class="po-field">
                <label class="po-label" for="poUnitPrice">
                  <span>Unit Price (Rs.) <span class="req">*</span></span>
                  <span class="hint">Per sq.ft or per unit</span>
                </label>
                <input type="number" id="poUnitPrice" class="po-input" value="95.00" min="0" step="any" required>
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
                <label class="po-label" for="poDiscount">
                  <span>Discount (Rs.)</span>
                  <span class="hint">Optional deduction</span>
                </label>
                <input type="number" id="poDiscount" class="po-input" value="0.00" min="0" step="any" placeholder="0.00">
              </div>

              <div class="po-field">
                <label class="po-label" for="poDeliveryMethod">
                  <span>Delivery Method <span class="req">*</span></span>
                </label>
                <select id="poDeliveryMethod" class="po-select">
                  @forelse($deliveryMethods as $dm)
                    @php
                      $dmId = data_get($dm, 'id');
                      $dmName = data_get($dm, 'methord') ?? data_get($dm, 'name');
                    @endphp
                    <option value="{{ $dmId }}" {{ (int) $dmId === 1 ? 'selected' : '' }}>
                      {{ $dmName }}
                    </option>
                  @empty
                    <option value="1" selected>Customer Pickup</option>
                    <option value="2">Courier Delivery</option>
                  @endforelse
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
                  <span>Required Deadline <span class="req">*</span></span>
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
                <span class="po-section-subtitle">Record advance deposit, select payment method, and review balance calculation</span>
              </div>
            </div>

            <div class="po-payment-split">
              <div class="po-payment-left">
                <!-- Advance Deposit Input -->
                <div class="po-field">
                  <label class="po-label" for="poPaidAmount">
                    <span>Initial Advance Paid (Rs.)</span>
                    <span class="hint">Optional advance</span>
                  </label>
                  <input type="number" id="poPaidAmount" class="po-input" value="0.00" min="0" step="any" placeholder="0.00">
                </div>

                <!-- Row: Payment Method & Payment Status (Database loaded) -->
                <div class="po-field-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <!-- Payment Method Dropdown (Database loaded, required when paid > 0) -->
                  <div class="po-field" id="poPaymentMethodGroup">
                    <label class="po-label" for="poPaymentMethod">
                      <span>Payment Method <span class="req" id="poPaymentMethodReq" style="display: none;">*</span></span>
                      <span class="hint" id="poPaymentMethodHint">Database: payment_types</span>
                    </label>
                    <select id="poPaymentMethod" class="po-select">
                      @forelse($paymentTypes as $pm)
                        @php
                          $pmId = data_get($pm, 'id');
                          $pmType = data_get($pm, 'payment_type') ?? data_get($pm, 'name');
                        @endphp
                        <option value="{{ $pmId }}" {{ $pmType === 'Cash' || $loop->first ? 'selected' : '' }}>
                          {{ $pmType }}
                        </option>
                      @empty
                        <option value="1" selected>Cash</option>
                        <option value="2">Bank Transfer</option>
                      @endforelse
                    </select>
                  </div>

                  <!-- Payment Status Dropdown (Database loaded: payment_statuses) -->
                  <div class="po-field" id="poPaymentStatusGroup">
                    <label class="po-label" for="poPaymentStatus">
                      <span>Payment Status <span class="req">*</span></span>
                      <span class="hint">Database: payment_statuses</span>
                    </label>
                    <select id="poPaymentStatus" class="po-select">
                      @forelse($paymentStatuses as $ps)
                        @php
                          $psId = data_get($ps, 'id');
                          $psStatus = data_get($ps, 'payment_status') ?? data_get($ps, 'name');
                        @endphp
                        <option value="{{ $psId }}" {{ (int) $psId === 1 || $loop->first ? 'selected' : '' }}>
                          {{ $psStatus }}
                        </option>
                      @empty
                        <option value="1" selected>Pending</option>
                        <option value="2">Completed</option>
                        <option value="3">Partial</option>
                      @endforelse
                    </select>
                  </div>
                </div>

                <div class="po-payment-notice" id="poPaymentNotice" style="display: none;">
                  <i class="fa-solid fa-shield-halved" style="color: var(--po-orange); font-size: 15px; margin-top: 2px;"></i>
                  <div>
                    An advance deposit will record an initial payment under the selected <strong>Payment Method</strong> in the database.
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
