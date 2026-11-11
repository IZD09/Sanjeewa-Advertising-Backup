<div class="pay-modal-backdrop" id="modalRecordGrnPayment">
    <div class="pay-modal-card" style="max-width: 740px;">
      <div class="pay-modal-header pay-modal-header-grn">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 9px; background: rgba(16, 185, 129, 0.12); color: #10b981; display: grid; place-items: center; font-size: 18px;">
            <i class="fa-solid fa-boxes-packing"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text);">Record GRN Payment</h3>
            <p style="margin: 2px 0 0; font-size: 11px; color: var(--text-muted);">Stock Acquisition &amp; Multi-Purchase Order Disbursements</p>
          </div>
        </div>
        <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="pay-modal-body">
        <!-- 1. Select & Add Purchase Orders to GRN -->
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="pay-label" for="grnModalRefSelect" style="margin: 0; font-weight: 700;">
              <i class="fa-solid fa-cart-flatbed" style="color: #10b981; margin-right: 4px;"></i> Select Purchase Orders to Add to this GRN *
            </label>
            <span class="grn-po-badge" id="grnModalPoCountPill">0 Purchase Orders Selected</span>
          </div>

          <div class="grn-add-po-controls" style="display: flex; gap: 10px; align-items: center;">
            <div style="flex: 1; position: relative;">
              <select id="grnModalRefSelect" class="pay-select-field" style="height: 44px; font-weight: 700; font-size: 13.5px; width: 100%; border-radius: 9px;">
                <option value="">-- Select Purchase Order / Consignment to Add --</option>
              </select>
            </div>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
            <span>Select a purchase order from the selector dropdown to immediately add it to this GRN. Multiple purchase orders can be consolidated into this single GRN.</span>
          </div>

          <!-- Included Purchase Orders Table -->
          <div style="margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                Included Purchase Orders on this GRN:
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">
                Allocations can be customized per purchase order
              </span>
            </div>
            <div class="grn-po-table-wrap">
              <table class="pay-table grn-po-table" style="width: 100%; font-size: 12.5px; margin: 0;">
                <thead>
                  <tr style="background: var(--surface-2); font-size: 11px;">
                    <th style="padding: 8px 12px;">PO # / Supplier Inv</th>
                    <th style="padding: 8px 10px;">Supplier</th>
                    <th style="padding: 8px 10px; text-align: right;">Total (Rs.)</th>
                    <th style="padding: 8px 10px; text-align: right;">Due (Rs.)</th>
                    <th style="padding: 8px 10px; text-align: right; width: 120px;">Pay Alloc (Rs.)</th>
                    <th style="padding: 8px 8px; text-align: center; width: 44px;">Action</th>
                  </tr>
                </thead>
                <tbody id="grnModalSelectedPoBody">
                  <tr class="empty-po-row">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">
                      <i class="fa-solid fa-circle-info" style="color: #10b981; margin-right: 6px;"></i>
                      No purchase orders added to this GRN consignment yet. Select a purchase order from the dropdown above.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 2. Combined Live Balance Display -->
        <div class="pay-modal-balance-box" style="margin-top: 14px;">
          <div class="bal-item">
            <span>Combined PO Total:</span>
            <strong id="grnModalBalTotal">Rs. 0</strong>
          </div>
          <div class="bal-item">
            <span>Previously Disbursed:</span>
            <strong id="grnModalBalPaid" style="color: var(--blue);">Rs. 0</strong>
          </div>
          <div class="bal-item">
            <span>Total Balance Due:</span>
            <strong id="grnModalBalRemaining" style="color: #ef4444;">Rs. 0</strong>
          </div>
        </div>

        <!-- 3. Payment Amount & Stage -->
        <div class="pay-form-grid" style="margin-top: 14px;">
          <div class="pay-field">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="pay-label" for="grnModalAmount" style="margin: 0;">
                <i class="fa-solid fa-money-bill" style="color: #10b981; margin-right: 4px;"></i> Total Payment Amount (Rs.) *
              </label>
              <button type="button" id="btnGrnPayFull" class="po-btn-link" style="font-size: 11px; color: #10b981; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0;">
                Pay Full Balance
              </button>
            </div>
            <input type="number" id="grnModalAmount" class="pay-input" placeholder="0.00" min="0" step="100" required>
          </div>
          <div class="pay-field">
            <label class="pay-label" for="grnModalStageSelect">
              <i class="fa-solid fa-flag-checkered" style="color: #8b5cf6; margin-right: 4px;"></i> Payment Stage *
            </label>
            <select id="grnModalStageSelect" class="pay-select-field">
              <option value="Complete Payment">Complete Payment</option>
              <option value="Advance Payment">Advance Payment</option>
              <option value="Pending Payment">Pending Payment</option>
            </select>
          </div>
        </div>

        <!-- 4. Payment Method -->
        <div class="pay-field">
          <label class="pay-label">
            <i class="fa-solid fa-wallet" style="color: #10b981; margin-right: 4px;"></i> Payment Method *
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
            <div class="method-choice" data-method="Online / QR">
              <i class="fa-solid fa-qrcode"></i>
              <span>Online / QR</span>
            </div>
          </div>
        </div>

        <!-- 5. Dynamic Method Details Container -->
        <div id="grnModalMethodFields">
          <!-- Dynamically populated via js/payments.js -->
        </div>

        <!-- 6. Date & Officer -->
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label" for="grnModalDate">Disbursement Date</label>
            <input type="date" id="grnModalDate" class="pay-input">
          </div>
          <div class="pay-field">
            <label class="pay-label">Procurement Officer</label>
            <input type="text" class="pay-input" value="Procurement Manager" readonly style="opacity: 0.85;">
          </div>
        </div>

        <!-- 7. Narration -->
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
