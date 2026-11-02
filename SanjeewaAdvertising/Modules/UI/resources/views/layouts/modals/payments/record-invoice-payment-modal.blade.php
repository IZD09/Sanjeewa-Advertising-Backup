<div class="pay-modal-backdrop" id="modalRecordInvoicePayment">
    <div class="pay-modal-card" style="max-width: 740px;">
      <div class="pay-modal-header pay-modal-header-invoice">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 9px; background: rgba(37, 99, 235, 0.12); color: #2563eb; display: grid; place-items: center; font-size: 18px;">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text);">Record Invoice Payment</h3>
            <p style="margin: 2px 0 0; font-size: 11px; color: var(--text-muted);">Customer &amp; Multi-Job Print Settlements (එකම Invoice එක සඳහා Print Jobs කිහිපයක්)</p>
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
            <label class="pay-label" for="invModalJobIdInput" style="margin: 0; font-weight: 700;">
              <i class="fa-solid fa-folder-plus" style="color: #2563eb; margin-right: 4px;"></i> Add Print Jobs to this Invoice (Job ID type කර Add කරන්න) *
            </label>
            <span class="inv-job-badge" id="invModalJobCountPill">0 Jobs Selected</span>
          </div>

          <div class="inv-add-job-controls" style="display: flex; gap: 10px; align-items: center;">
            <!-- Type Job ID directly -->
            <div style="flex: 1; position: relative;">
              <i class="fa-solid fa-barcode" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; pointer-events: none;"></i>
              <input type="text" id="invModalJobIdInput" class="pay-input" placeholder="Type Job ID (e.g. ORD-2026-1048 or 1048)..." style="height: 44px; font-weight: 700; font-size: 13.5px; padding-left: 38px; width: 100%; border-radius: 9px;" autocomplete="off" list="invJobsDatalist">
              <datalist id="invJobsDatalist"></datalist>
            </div>

            <!-- Add Job Button -->
            <button type="button" class="po-btn pay-action-btn pay-btn-invoice" id="btnAddJobToInvoice" style="height: 44px; white-space: nowrap; padding: 0 22px; font-weight: 700; border-radius: 9px;">
              <i class="fa-solid fa-plus"></i> Add Job
            </button>
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-keyboard" style="color: var(--blue);"></i>
            <span>Job ID එක type කර <kbd style="background: var(--surface); border: 1px solid var(--border); padding: 1px 5px; border-radius: 4px; font-size: 10.5px; font-weight: 600;">Enter</kbd> ඔබන්න, නැතහොත් <strong>Add Job</strong> button එක click කරන්න. (Barcode scanner සහාය දක්වයි)</span>
          </div>

          <!-- Included Print Jobs Table -->
          <div style="margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                Included Print Jobs on this Invoice:
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">
                Allocations can be customized per job
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
                      No print jobs added to this invoice yet. Select a job above and click "+ Add Job".
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
            <input type="number" id="invModalAmount" class="pay-input" placeholder="0.00" min="0" step="50" required>
          </div>
          <div class="pay-field">
            <label class="pay-label" for="invModalStageSelect">
              <i class="fa-solid fa-flag-checkered" style="color: #8b5cf6; margin-right: 4px;"></i> Payment Stage (අවස්ථාව) *
            </label>
            <select id="invModalStageSelect" class="pay-select-field">
              <option value="Complete Payment">Complete Payment (සම්පූර්ණ ගෙවීම්)</option>
              <option value="Advance Payment">Advance Payment (අත්තිකාරම් ගෙවීම්)</option>
              <option value="Pending Payment">Pending Payment (පොරොත්තු ගෙවීම්)</option>
            </select>
          </div>
        </div>

        <!-- 4. Payment Method -->
        <div class="pay-field">
          <label class="pay-label">
            <i class="fa-solid fa-wallet" style="color: #2563eb; margin-right: 4px;"></i> Payment Method (ක්‍රමවේදය) *
          </label>
          <div class="pay-method-selector" id="invModalMethodSelector">
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

        <!-- 5. Dynamic Method Details Container -->
        <div id="invModalMethodFields">
          <!-- Dynamically populated via js/payments.js -->
        </div>

        <!-- 6. Payment Date -->
        <div class="pay-field">
          <label class="pay-label" for="invModalDate">Payment Date (ගෙවූ දිනය)</label>
          <input type="date" id="invModalDate" class="pay-input">
        </div>

        <!-- 7. Narration -->
        <div class="pay-field">
          <label class="pay-label" for="invModalNotes">Narration / Internal Remarks (සටහන්)</label>
          <input type="text" id="invModalNotes" class="pay-input" placeholder="E.g. Full settlement upon pickup / multi-job corporate print invoice">
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
