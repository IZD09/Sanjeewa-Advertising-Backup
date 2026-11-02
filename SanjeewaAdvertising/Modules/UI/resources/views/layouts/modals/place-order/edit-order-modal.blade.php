<!-- ==========================================================================
     EDIT ORDER MODAL (Full Details & Live Recalculation) (#editOrderModal)
     ========================================================================== -->
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

      <!-- Section 3: Workflow, Deadline & Staff -->
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

