<div class="pay-modal-backdrop" id="modalRecordGrnPayment">
    <div class="pay-modal-card">
      <div class="pay-modal-header pay-modal-header-grn">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 9px; background: rgba(16, 185, 129, 0.12); color: #10b981; display: grid; place-items: center; font-size: 18px;">
            <i class="fa-solid fa-boxes-packing"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text);">Record GRN Payment</h3>
            <p style="margin: 2px 0 0; font-size: 11px; color: var(--text-muted);">Stock Acquisition &amp; Supplier Disbursements (Stock බඩු ගෙවීම්)</p>
          </div>
        </div>
        <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="pay-modal-body">
        <!-- 1. Select Supplier GRN / Stock Acquisition -->
        <div class="pay-field">
          <label class="pay-label" for="grnModalRefSelect">
            <i class="fa-solid fa-truck-ramp-box" style="color: #10b981; margin-right: 4px;"></i> Select Supplier GRN / Stock Bill *
          </label>
          <select id="grnModalRefSelect" class="pay-select-field">
            <!-- Dynamically populated in js/payments.js -->
          </select>
        </div>

        <!-- Live Balance Display -->
        <div class="pay-modal-balance-box">
          <div class="bal-item">
            <span>Consignment Bill Total:</span>
            <strong id="grnModalBalTotal">Rs. 0</strong>
          </div>
          <div class="bal-item">
            <span>Previously Disbursed:</span>
            <strong id="grnModalBalPaid" style="color: var(--blue);">Rs. 0</strong>
          </div>
          <div class="bal-item">
            <span>Outstanding Payable:</span>
            <strong id="grnModalBalRemaining" style="color: #ef4444;">Rs. 0</strong>
          </div>
        </div>

        <!-- 2. Payment Amount & Stage -->
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label" for="grnModalAmount">
              <i class="fa-solid fa-money-bill" style="color: #10b981; margin-right: 4px;"></i> Payment Amount (Rs.) *
            </label>
            <input type="number" id="grnModalAmount" class="pay-input" placeholder="0.00" min="0" step="100" required>
          </div>
          <div class="pay-field">
            <label class="pay-label" for="grnModalStageSelect">
              <i class="fa-solid fa-flag-checkered" style="color: #8b5cf6; margin-right: 4px;"></i> Payment Stage (අවස්ථාව) *
            </label>
            <select id="grnModalStageSelect" class="pay-select-field">
              <option value="Complete Payment">Complete Payment (සම්පූර්ණ ගෙවීම්)</option>
              <option value="Advance Payment">Advance Payment (අත්තිකාරම් ගෙවීම්)</option>
              <option value="Pending Payment">Pending Payment (පොරොත්තු ගෙවීම්)</option>
            </select>
          </div>
        </div>

        <!-- 3. Payment Method -->
        <div class="pay-field">
          <label class="pay-label">
            <i class="fa-solid fa-wallet" style="color: #10b981; margin-right: 4px;"></i> Payment Method (ක්‍රමවේදය) *
          </label>
          <div class="pay-method-selector" id="grnModalMethodSelector">
            <div class="method-choice selected" data-method="Cash">
              <i class="fa-solid fa-money-bill-wave"></i>
              <span>Cash / Petty</span>
            </div>
            <div class="method-choice" data-method="Card">
              <i class="fa-solid fa-credit-card"></i>
              <span>Corporate Card</span>
            </div>
            <div class="method-choice" data-method="Check">
              <i class="fa-solid fa-money-check"></i>
              <span>Company Check</span>
            </div>
            <div class="method-choice" data-method="Bank Transfer">
              <i class="fa-solid fa-building-columns"></i>
              <span>Bank Transfer</span>
            </div>
          </div>
        </div>

        <!-- 4. Dynamic Method Details Container -->
        <div id="grnModalMethodFields">
          <!-- Dynamically populated via js/payments.js -->
        </div>

        <!-- 5. Date & Officer -->
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label" for="grnModalDate">Disbursement Date (ගෙවූ දිනය)</label>
            <input type="date" id="grnModalDate" class="pay-input">
          </div>
          <div class="pay-field">
            <label class="pay-label">Procurement Officer</label>
            <input type="text" class="pay-input" value="Procurement Manager" readonly style="opacity: 0.85;">
          </div>
        </div>

        <!-- 6. Narration -->
        <div class="pay-field">
          <label class="pay-label" for="grnModalNotes">Narration / Cheque Details / Remarks</label>
          <input type="text" id="grnModalNotes" class="pay-input" placeholder="E.g. Full settlement upon paper delivery / advance for flex container">
        </div>
      </div>

      <div class="pay-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
        <button type="button" class="po-btn pay-action-btn pay-btn-grn" id="btnConfirmSaveGrnPayment">
          <i class="fa-solid fa-check"></i> Save GRN Payment &amp; Generate Voucher
        </button>
      </div>
    </div>
  </div>