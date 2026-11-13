<div class="pay-modal-backdrop" id="modalRecordInvoicePayment">
    <div class="pay-modal-card" style="max-width: 760px;">
      <div class="pay-modal-header pay-modal-header-invoice">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 9px; background: rgba(37, 99, 235, 0.12); color: #2563eb; display: grid; place-items: center; font-size: 18px;">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text);">Record Invoice Payment</h3>
            <p style="margin: 2px 0 0; font-size: 11px; color: var(--text-muted);">Customer &amp; Multi-Job Print Settlements</p>
          </div>
        </div>
        <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="pay-modal-body">
        <!-- 1. Select & Add Print Jobs to Invoice -->
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="pay-label" for="invModalJobSelect" style="margin: 0; font-weight: 700;">
              <i class="fa-solid fa-folder-plus" style="color: #2563eb; margin-right: 4px;"></i> Select Print Jobs to Add to this Invoice *
            </label>
            <span class="inv-job-badge" id="invModalJobCountPill">0 Print Jobs Selected</span>
          </div>

          <div class="inv-add-job-controls" style="display: flex; gap: 10px; align-items: center;">
            <div style="flex: 1; position: relative;">
              <select id="invModalJobSelect" name="inv_job_select" class="pay-select-field" style="height: 44px; font-weight: 700; font-size: 13.5px; width: 100%; border-radius: 9px;">
                <option value="">-- Select Print Job to Add to this Invoice --</option>
              </select>
            </div>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-check" style="color: var(--blue);"></i>
            <span>Select a print job from the selector dropdown to immediately add it to this invoice. Multiple jobs can be consolidated into this single invoice.</span>
          </div>

          <!-- Included Print Jobs Table -->
          <div style="margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                Included Print Jobs on this Invoice:
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">
                Allocations can be customized per print job
              </span>
            </div>
            <div class="inv-jobs-table-wrap">
              <table class="pay-table inv-jobs-table" style="width: 100%; font-size: 12.5px; margin: 0;">
                <thead>
                  <tr style="background: var(--surface-2); font-size: 11px;">
                    <th style="padding: 8px 12px;">Job # / Details</th>
                    <th style="padding: 8px 10px;">Customer</th>
                    <th style="padding: 8px 10px; text-align: right;">Total (Rs.)</th>
                    <th style="padding: 8px 10px; text-align: right;">Due (Rs.)</th>
                    <th style="padding: 8px 10px; text-align: right; width: 120px;">Pay Alloc (Rs.)</th>
                    <th style="padding: 8px 8px; text-align: center; width: 44px;">Action</th>
                  </tr>
                </thead>
                <tbody id="invModalSelectedJobsBody">
                  <tr class="empty-jobs-row">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">
                      <i class="fa-solid fa-circle-info" style="color: #2563eb; margin-right: 6px;"></i>
                      No print jobs added to this invoice yet. Select a print job from the dropdown above.
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
            <span>Combined Total:</span>
            <strong id="invModalBalTotal">Rs. 0</strong>
          </div>
          <div class="bal-item">
            <span>Previously Paid:</span>
            <strong id="invModalBalPaid" style="color: #10b981;">Rs. 0</strong>
          </div>
          <div class="bal-item">
            <span>Total Balance Due:</span>
            <strong id="invModalBalRemaining" style="color: #ef4444;">Rs. 0</strong>
          </div>
        </div>

        <!-- 3. Payment Amount & Stage -->
        <div class="pay-form-grid" style="margin-top: 14px;">
          <div class="pay-field">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="pay-label" for="invModalAmount" style="margin: 0;">
                <i class="fa-solid fa-money-bill" style="color: #10b981; margin-right: 4px;"></i> Total Payment Amount (Rs.) *
              </label>
              <button type="button" id="btnInvPayFull" class="po-btn-link" style="font-size: 11px; color: var(--blue); text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0;">
                Pay Full Balance
              </button>
            </div>
            <input type="number" id="invModalAmount" name="inv_modal_amount" class="pay-input" placeholder="0.00" min="0" step="50" required>
          </div>
          <div class="pay-field">
            <label class="pay-label" for="invModalStageSelect">
              <i class="fa-solid fa-flag-checkered" style="color: #8b5cf6; margin-right: 4px;"></i> Payment Stage *
            </label>
            <select id="invModalStageSelect" name="inv_stage_select" class="pay-select-field">
              <option value="Complete Payment">Complete Payment</option>
              <option value="Advance Payment">Advance Payment</option>
              <option value="Pending Payment">Pending Payment</option>
            </select>
          </div>
        </div>

        <!-- 4. Payment Method -->
        <div class="pay-field">
          <div class="pay-label" id="invModalMethodLabel">
            <i class="fa-solid fa-wallet" style="color: #2563eb; margin-right: 4px;"></i> Payment Method *
          </div>
          <div class="pay-method-selector" id="invModalMethodSelector" role="group" aria-labelledby="invModalMethodLabel">
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
            <div class="method-choice" data-method="Online / QR">
              <i class="fa-solid fa-qrcode"></i>
              <span>Online / QR</span>
            </div>
          </div>
        </div>

        <!-- 5. Dynamic Method Details Container -->
        <div id="invModalMethodFields">
          <!-- Dynamically populated via js/payments.js -->
        </div>

        <!-- 6. Payment Date & Authorized Officer -->
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label" for="invModalDate">Payment Date</label>
            <input type="date" id="invModalDate" name="inv_payment_date" class="pay-input">
          </div>
          <div class="pay-field">
            <label class="pay-label" for="invModalAuthorizedOfficer">Authorized Officer</label>
            <input type="text" id="invModalAuthorizedOfficer" name="inv_authorized_officer" class="pay-input" value="Cashier / Admin User" readonly style="opacity: 0.85;">
          </div>
        </div>

        <!-- 7. Narration -->
        <div class="pay-field">
          <label class="pay-label" for="invModalNotes">Narration / Internal Remarks</label>
          <input type="text" id="invModalNotes" name="inv_modal_notes" class="pay-input" placeholder="E.g. Full settlement upon pickup / multi-job corporate print invoice">
        </div>
      </div>

      <div class="pay-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
        <button type="button" class="po-btn pay-action-btn pay-btn-invoice" id="btnConfirmSaveInvoicePayment">
          <i class="fa-solid fa-check"></i> <span id="btnConfirmSaveInvoiceText">Save Invoice Payment &amp; Generate Voucher</span>
        </button>
      </div>
    </div>
  </div>
