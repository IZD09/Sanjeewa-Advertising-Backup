<div class="pay-modal-backdrop" id="modalRecordInvoicePayment">
    <div class="pay-modal-card" style="max-width: 860px; border-radius: 14px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);">
      <!-- Modal Header -->
      <div class="pay-modal-header pay-modal-header-invoice" style="padding: 16px 22px; background: var(--surface); border-bottom: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(37, 99, 235, 0.12); color: #2563eb; display: grid; place-items: center; font-size: 20px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16.5px; font-weight: 800; color: var(--text); letter-spacing: -0.2px;">Record Invoice Payment</h3>
            <p style="margin: 2px 0 0; font-size: 11.5px; color: var(--text-muted);">Customer Settlement &amp; Multi-Job Invoice Consolidation</p>
          </div>
        </div>
        <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="pay-modal-body" style="padding: 20px 22px; gap: 16px; max-height: calc(88vh - 130px); overflow-y: auto;">

        <!-- ==================================================================
             STEP 1: Customer Search Selector (Searchable Dropdown)
             ================================================================== -->
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="pay-label" for="invCustSearchInput" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text);">
              <i class="fa-solid fa-user-tag" style="color: #2563eb; margin-right: 5px;"></i> Step 1: Select Customer <span class="req" style="color: #ef4444; font-weight: 800;">*</span>
            </label>
            <span class="hint" id="invCustSearchHint" style="font-size: 11px; color: var(--text-muted);">Type name or phone number, or click to browse</span>
          </div>

          <!-- Customer Search Input with Integrated Dropdown -->
          <div class="customer-search-input-group" id="invCustSearchGroup" style="position: relative;">
            <div style="position: relative; display: flex; align-items: center;">
              <i class="fa-solid fa-magnifying-glass search-icon" style="position: absolute; left: 14px; color: var(--text-muted); font-size: 13px; z-index: 2; pointer-events: none;"></i>
              <input type="text" id="invCustSearchInput" class="pay-input" placeholder="Search customer by name or mobile number (or click to browse list)..." autocomplete="off" style="padding-left: 38px; padding-right: 40px; height: 42px; border-radius: 8px; font-size: 13px; width: 100%;">
              <input type="hidden" id="invSelectedCustomerId" value="">
              <button type="button" class="combo-arrow-btn" id="invToggleCustDropdownBtn" style="position: absolute; right: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; z-index: 2;" title="Show all registered customers">
                <i class="fa-solid fa-chevron-down" id="invCustDropdownIcon"></i>
              </button>
            </div>

            <!-- Customer Search Results Dropdown -->
            <div class="customer-dropdown-menu" id="invCustDropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 1050; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></div>
          </div>

          <!-- Selected Customer Chip / Card -->
          <div class="selected-customer-card" id="invSelectedCustomerCard" style="display: none; align-items: center; justify-content: space-between; background: var(--surface); border: 1.5px solid #2563eb; border-radius: 8px; padding: 10px 14px; margin-top: 6px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(37, 99, 235, 0.12); color: #2563eb; display: grid; place-items: center; font-size: 15px; flex-shrink: 0;">
                <i class="fa-solid fa-user-check"></i>
              </div>
              <div style="min-width: 0;">
                <div style="font-weight: 800; font-size: 13.5px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="invSelectedCustName">Customer Name</div>
                <div style="font-size: 11.5px; color: var(--text-muted);" id="invSelectedCustMobile">0771234567 • Customer #1</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <span class="status-badge" style="background: rgba(37, 99, 235, 0.1); color: #2563eb; font-weight: 700; font-size: 11px;" id="invSelectedCustPendingBadge">0 Pending Orders</span>
              <button type="button" class="po-btn po-btn-secondary" id="invClearCustomerBtn" style="height: 30px; font-size: 11px; padding: 0 10px; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-rotate"></i> Change Customer
              </button>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             STEP 2: Select Orders with Pending Payments for this Customer
             ================================================================== -->
        <div class="pay-field" id="invPendingOrdersSection" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="pay-label" for="invModalJobSelect" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text);">
              <i class="fa-solid fa-layer-group" style="color: #2563eb; margin-right: 5px;"></i> Step 2: Select Pending Payment Orders <span class="req" style="color: #ef4444; font-weight: 800;">*</span>
            </label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" class="po-btn po-btn-secondary" id="invBtnAddAllJobs" style="display: none; height: 28px; font-size: 11px; padding: 0 10px; color: #2563eb; font-weight: 700;">
                <i class="fa-solid fa-check-double"></i> Add All Pending Orders
              </button>
              <span class="inv-job-badge" id="invModalJobCountPill">0 Orders Selected</span>
            </div>
          </div>

          <div class="inv-add-job-controls" style="display: flex; gap: 10px; align-items: center;">
            <div style="flex: 1; position: relative;">
              <select id="invModalJobSelect" name="inv_job_select" class="pay-select-field" style="height: 44px; font-weight: 700; font-size: 13px; width: 100%; border-radius: 8px;">
                <option value="">-- Please select a customer above first --</option>
              </select>
            </div>
          </div>
          <div id="invJobSelectHelpText" style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-info" style="color: #2563eb;"></i>
            <span id="invJobSelectHelpMsg">Select an order from the list above to add it to this invoice. You can include multiple orders in one settlement.</span>
          </div>

          <!-- Included Print Jobs Table -->
          <div style="margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11.5px; font-weight: 800; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px;">
                Included Print Jobs on this Invoice:
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">
                Payment allocations can be adjusted per job
              </span>
            </div>
            <div class="inv-jobs-table-wrap" style="border: 1px solid var(--border); border-radius: 8px; overflow-x: auto; background: var(--surface);">
              <table class="pay-table inv-jobs-table" style="width: 100%; font-size: 12.5px; margin: 0; min-width: 620px;">
                <thead>
                  <tr style="background: var(--surface-2); font-size: 11px;">
                    <th style="padding: 9px 12px;">Job # / Details</th>
                    <th style="padding: 9px 10px;">Customer</th>
                    <th style="padding: 9px 10px; text-align: right;">Total (Rs.)</th>
                    <th style="padding: 9px 10px; text-align: right;">Due Balance (Rs.)</th>
                    <th style="padding: 9px 10px; text-align: right; width: 130px;">Pay Alloc (Rs.)</th>
                    <th style="padding: 9px 8px; text-align: center; width: 44px;">Action</th>
                  </tr>
                </thead>
                <tbody id="invModalSelectedJobsBody">
                  <tr class="empty-jobs-row">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 22px;">
                      <i class="fa-solid fa-file-circle-exclamation" style="font-size: 22px; color: var(--text-muted); display: block; margin-bottom: 6px; opacity: 0.5;"></i>
                      No print jobs added to this invoice yet. Select a customer and choose orders above.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             STEP 3: Combined Financial Summary
             ================================================================== -->
        <div class="pay-modal-balance-box" style="margin-top: 4px;">
          <div class="bal-item">
            <span>Combined Total:</span>
            <strong id="invModalBalTotal">Rs. 0.00</strong>
          </div>
          <div class="bal-item">
            <span>Previously Paid:</span>
            <strong id="invModalBalPaid" style="color: #10b981;">Rs. 0.00</strong>
          </div>
          <div class="bal-item">
            <span>Total Balance Due:</span>
            <strong id="invModalBalRemaining" style="color: #ef4444;">Rs. 0.00</strong>
          </div>
        </div>

        <!-- ==================================================================
             STEP 4: Payment Amount & Stage
             ================================================================== -->
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <!-- Total Payment Amount Field -->
            <div class="pay-field">
              <div style="display: flex; justify-content: space-between; align-items: center; height: 24px; margin-bottom: 6px;">
                <label for="invModalAmount" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text); display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-money-bill-wave" style="color: #10b981;"></i>
                  <span>Total Payment Amount (Rs.) <span class="req" style="color: #ef4444; font-weight: 800;">*</span></span>
                </label>
                <button type="button" id="btnInvPayFull" class="po-btn po-btn-secondary" style="height: 24px; padding: 0 10px; font-size: 11px; font-weight: 700; color: #2563eb; border-color: rgba(37,99,235,0.3); background: rgba(37,99,235,0.08); border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-bolt"></i> Pay Full Balance
                </button>
              </div>
              <div style="position: relative; display: flex; align-items: center;">
                <span style="position: absolute; left: 14px; font-weight: 800; font-size: 13px; color: var(--text-muted); pointer-events: none; z-index: 2;">Rs.</span>
                <input type="number" id="invModalAmount" name="inv_modal_amount" class="pay-input" placeholder="0.00" min="0" step="50" required style="height: 44px; padding-left: 42px; padding-right: 14px; border-radius: 8px; font-size: 15px; font-weight: 800; color: var(--text); background: var(--surface); border: 1.5px solid var(--border); width: 100%; box-sizing: border-box;">
              </div>
            </div>

            <!-- Payment Stage Field -->
            <div class="pay-field">
              <div style="display: flex; justify-content: space-between; align-items: center; height: 24px; margin-bottom: 6px;">
                <label for="invModalStageSelect" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text); display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-flag-checkered" style="color: #8b5cf6;"></i>
                  <span>Payment Stage <span class="req" style="color: #ef4444; font-weight: 800;">*</span></span>
                </label>
                <span style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">Auto-computed</span>
              </div>
              <div style="position: relative; display: flex; align-items: center;">
                <select id="invModalStageSelect" name="inv_stage_select" class="pay-select-field" style="height: 44px; padding: 0 36px 0 14px; border-radius: 8px; font-size: 13px; font-weight: 700; color: var(--text); background: var(--surface); border: 1.5px solid var(--border); width: 100%; appearance: none; cursor: pointer; box-sizing: border-box;">
                  <option value="Complete Payment">Complete Payment (Full Settlement)</option>
                  <option value="Advance Payment">Advance Payment (Partial Installment)</option>
                  <option value="Partial Payment">Partial Payment (Balance Remaining)</option>
                </select>
                <i class="fa-solid fa-chevron-down" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 12px; pointer-events: none;"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             STEP 5: Payment Method Selector (Database: payment_types)
             ================================================================== -->
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="pay-label" id="invModalMethodLabel" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text); display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-wallet" style="color: #2563eb;"></i>
              <span>Payment Method <span class="req" style="color: #ef4444; font-weight: 800;">*</span></span>
            </div>
            <span class="hint" style="font-size: 11px; color: var(--text-muted);">Database: payment_types</span>
          </div>

          <!-- Hidden Input for Database payment_types_id -->
          <input type="hidden" id="invPaymentTypeId" name="payment_types_id" value="1">

          <!-- Interactive Method Choice Buttons with Colorful Icons -->
          <div class="pay-method-selector" id="invModalMethodSelector" role="group" aria-labelledby="invModalMethodLabel" aria-label="Payment Method Options" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
            <div class="method-choice selected" data-type-id="1" data-method="Cash" style="padding: 10px 4px; text-align: center; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; background: var(--surface); border: 1.5px solid var(--border);">
              <span style="font-size: 24px; display: block; margin-bottom: 5px; line-height: 1;">💵</span>
              <span style="font-size: 11.5px; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">Cash</span>
            </div>
            <div class="method-choice" data-type-id="2" data-method="Bank Transfer" style="padding: 10px 4px; text-align: center; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; background: var(--surface); border: 1.5px solid var(--border);">
              <span style="font-size: 24px; display: block; margin-bottom: 5px; line-height: 1;">🏦</span>
              <span style="font-size: 11.5px; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">Transfer</span>
            </div>
            <div class="method-choice" data-type-id="3" data-method="Credit Card" style="padding: 10px 4px; text-align: center; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; background: var(--surface); border: 1.5px solid var(--border);">
              <span style="font-size: 24px; display: block; margin-bottom: 5px; line-height: 1;">💳</span>
              <span style="font-size: 11.5px; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">Credit Card</span>
            </div>
            <div class="method-choice" data-type-id="4" data-method="Debit Card" style="padding: 10px 4px; text-align: center; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; background: var(--surface); border: 1.5px solid var(--border);">
              <span style="font-size: 24px; display: block; margin-bottom: 5px; line-height: 1;">💳</span>
              <span style="font-size: 11.5px; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">Debit Card</span>
            </div>
            <div class="method-choice" data-type-id="5" data-method="Cheque" style="padding: 10px 4px; text-align: center; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; background: var(--surface); border: 1.5px solid var(--border);">
              <span style="font-size: 24px; display: block; margin-bottom: 5px; line-height: 1;">📜</span>
              <span style="font-size: 11.5px; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">Cheque</span>
            </div>
            <div class="method-choice" data-type-id="6" data-method="Online / QR Payment" style="padding: 10px 4px; text-align: center; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; background: var(--surface); border: 1.5px solid var(--border);">
              <span style="font-size: 24px; display: block; margin-bottom: 5px; line-height: 1;">📱</span>
              <span style="font-size: 11.5px; font-weight: 800; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text);">Online/QR</span>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             STEP 6: Payment Date, Officer & Remarks
             ================================================================== -->
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label" for="invModalDate" style="font-weight: 700;">Payment Date</label>
            <input type="date" id="invModalDate" name="inv_payment_date" class="pay-input">
          </div>
          <div class="pay-field">
            <label class="pay-label" for="invModalAuthorizedOfficer" style="font-weight: 700;">Authorized Officer</label>
            <input type="text" id="invModalAuthorizedOfficer" name="inv_authorized_officer" class="pay-input" value="Cashier / Admin User" readonly style="opacity: 0.85;">
          </div>
        </div>

        <div class="pay-field">
          <label class="pay-label" for="invModalNotes" style="font-weight: 700;">Narration / Internal Remarks</label>
          <input type="text" id="invModalNotes" name="inv_modal_notes" class="pay-input" placeholder="E.g. Invoice payment settlement for print jobs">
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="pay-modal-footer" style="padding: 14px 22px; background: var(--surface); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
        <button type="button" class="po-btn pay-action-btn pay-btn-invoice" id="btnConfirmSaveInvoicePayment" style="background: #2563eb; border-color: #2563eb; color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-check"></i> <span id="btnConfirmSaveInvoiceText">Save Invoice Payment &amp; Generate Voucher</span>
        </button>
      </div>
    </div>
  </div>
