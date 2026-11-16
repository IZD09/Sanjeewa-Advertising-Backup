<div class="pay-modal-backdrop" id="modalRecordGrnPayment">
    <div class="pay-modal-card" style="max-width: 860px; border-radius: 14px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);">
      <!-- Modal Header -->
      <div class="pay-modal-header pay-modal-header-grn" style="padding: 16px 22px; background: var(--surface); border-bottom: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(16, 185, 129, 0.12); color: #10b981; display: grid; place-items: center; font-size: 20px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);">
            <i class="fa-solid fa-boxes-packing"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16.5px; font-weight: 800; color: var(--text); letter-spacing: -0.2px;">Record GRN Payment</h3>
            <p style="margin: 2px 0 0; font-size: 11.5px; color: var(--text-muted);">Stock Acquisition &amp; Multi-Purchase Order Disbursements</p>
          </div>
        </div>
        <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="pay-modal-body" style="padding: 20px 22px; gap: 16px; max-height: calc(88vh - 130px); overflow-y: auto;">

        <!-- ==================================================================
             STEP 1: Supplier Search Selector (Searchable Dropdown)
             ================================================================== -->
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="pay-label" for="grnSuppSearchInput" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text);">
              <i class="fa-solid fa-truck-field" style="color: #10b981; margin-right: 5px;"></i> Step 1: Select Supplier
            </label>
            <span class="hint" id="grnSuppSearchHint" style="font-size: 11px; color: var(--text-muted);">Click a supplier to view their pending POs, or pick a PO directly below</span>
          </div>

          <!-- Supplier Search Input with Integrated Dropdown -->
          <div class="supplier-search-input-group" id="grnSuppSearchGroup" style="position: relative;">
            <div style="position: relative; display: flex; align-items: center;">
              <i class="fa-solid fa-magnifying-glass search-icon" style="position: absolute; left: 14px; color: var(--text-muted); font-size: 13px; z-index: 2; pointer-events: none;"></i>
              <input type="text" id="grnSuppSearchInput" class="pay-input" placeholder="Search supplier by name or phone number (or click to browse list)..." autocomplete="off" style="padding-left: 38px; padding-right: 40px; height: 42px; border-radius: 8px; font-size: 13px; width: 100%;">
              <input type="hidden" id="grnSelectedSupplierId" value="">
              <button type="button" class="combo-arrow-btn" id="grnToggleSuppDropdownBtn" style="position: absolute; right: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; z-index: 2;" title="Show all suppliers">
                <i class="fa-solid fa-chevron-down" id="grnSuppDropdownIcon"></i>
              </button>
            </div>

            <!-- Supplier Search Results Dropdown -->
            <div class="supplier-dropdown-menu" id="grnSuppDropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 1050; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></div>
          </div>

          <!-- Selected Supplier Chip / Card -->
          <div class="selected-supplier-card" id="grnSelectedSupplierCard" style="display: none; align-items: center; justify-content: space-between; background: var(--surface); border: 1.5px solid #10b981; border-radius: 8px; padding: 10px 14px; margin-top: 6px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); color: #10b981; display: grid; place-items: center; font-size: 15px; flex-shrink: 0;">
                <i class="fa-solid fa-truck-fast"></i>
              </div>
              <div style="min-width: 0;">
                <div style="font-weight: 800; font-size: 13.5px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="grnSelectedSuppName">Supplier Name</div>
                <div style="font-size: 11.5px; color: var(--text-muted);" id="grnSelectedSuppMobile">0771234567 • SUP-001</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <span class="status-badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 700; font-size: 11px;" id="grnSelectedSuppPendingBadge">0 Pending POs</span>
              <button type="button" class="po-btn po-btn-secondary" id="grnClearSupplierBtn" style="height: 30px; font-size: 11px; padding: 0 10px; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fa-solid fa-rotate"></i> Change Supplier
              </button>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             STEP 2: Select & Add Pending Purchase Orders to this GRN
             ================================================================== -->
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="pay-label" for="grnModalRefSelect" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text);">
              <i class="fa-solid fa-cart-flatbed" style="color: #10b981; margin-right: 5px;"></i> Step 2: Select Pending Purchase Orders to Add to this GRN <span class="req" style="color: #ef4444; font-weight: 800;">*</span>
            </label>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" class="po-btn po-btn-secondary" id="grnBtnAddAllPos" style="display: none; height: 28px; font-size: 11px; padding: 0 10px; color: #10b981; font-weight: 700;">
                <i class="fa-solid fa-check-double"></i> Add All Pending POs
              </button>
              <span class="grn-po-badge" id="grnModalPoCountPill">0 Purchase Orders Selected</span>
            </div>
          </div>

          <div class="grn-add-po-controls" style="display: flex; gap: 10px; align-items: center;">
            <div style="flex: 1; position: relative;">
              <select id="grnModalRefSelect" name="grn_modal_ref_select" class="pay-select-field" style="height: 44px; font-weight: 700; font-size: 13px; width: 100%; border-radius: 8px;">
                <option value="">-- Select Pending Purchase Order to Add --</option>
              </select>
            </div>
          </div>
          <div id="grnPoSelectHelpText" style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-circle-info" style="color: #10b981;"></i>
            <span id="grnPoSelectHelpMsg">Select a pending purchase order above (auto-selects its supplier) or choose a supplier first to filter their pending POs.</span>
          </div>

          <!-- Quick-click Pending POs list when a supplier is selected -->
          <div id="grnPendingPoQuickList" style="display: none; flex-wrap: wrap; gap: 8px; margin-top: 10px;"></div>

          <!-- Included Purchase Orders Table -->
          <div style="margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11.5px; font-weight: 800; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px;">
                Included Purchase Orders on this GRN:
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">
                Allocations can be customized per purchase order
              </span>
            </div>
            <div class="grn-po-table-wrap" style="border: 1px solid var(--border); border-radius: 8px; overflow-x: auto; background: var(--surface);">
              <table class="pay-table grn-po-table" style="width: 100%; font-size: 12.5px; margin: 0; min-width: 620px;">
                <thead>
                  <tr style="background: var(--surface-2); font-size: 11px;">
                    <th style="padding: 9px 12px;">PO # / GRN</th>
                    <th style="padding: 9px 10px;">Supplier</th>
                    <th style="padding: 9px 10px; text-align: right;">Total (Rs.)</th>
                    <th style="padding: 9px 10px; text-align: right;">Due (Rs.)</th>
                    <th style="padding: 9px 10px; text-align: right; width: 130px;">Pay Alloc (Rs.)</th>
                    <th style="padding: 9px 8px; text-align: center; width: 44px;">Action</th>
                  </tr>
                </thead>
                <tbody id="grnModalSelectedPoBody">
                  <tr class="empty-po-row">
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 22px;">
                      <i class="fa-solid fa-circle-info" style="color: #10b981; margin-right: 6px;"></i>
                      No purchase orders added to this GRN consignment yet. Select a supplier or choose a pending PO above.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             STEP 3: Combined Live Balance Display
             ================================================================== -->
        <div class="pay-modal-balance-box" style="margin-top: 4px;">
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

        <!-- ==================================================================
             STEP 4: Payment Amount & Stage
             ================================================================== -->
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div class="pay-field">
              <div style="display: flex; justify-content: space-between; align-items: center; height: 24px; margin-bottom: 6px;">
                <label for="grnModalAmount" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text); display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-money-bill" style="color: #10b981;"></i>
                  <span>Total Payment Amount (Rs.) <span class="req" style="color: #ef4444; font-weight: 800;">*</span></span>
                </label>
                <button type="button" id="btnGrnPayFull" class="po-btn po-btn-secondary" style="height: 24px; padding: 0 10px; font-size: 11px; font-weight: 700; color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.08); border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-bolt"></i> Pay Full Balance
                </button>
              </div>
              <div style="position: relative; display: flex; align-items: center;">
                <span style="position: absolute; left: 14px; font-weight: 800; font-size: 13px; color: var(--text-muted); pointer-events: none; z-index: 2;">Rs.</span>
                <input type="number" id="grnModalAmount" name="grn_modal_amount" class="pay-input" placeholder="0.00" min="0" step="100" required style="height: 44px; padding-left: 42px; padding-right: 14px; border-radius: 8px; font-size: 15px; font-weight: 800; color: var(--text); background: var(--surface); border: 1.5px solid var(--border); width: 100%; box-sizing: border-box;">
              </div>
            </div>

            <div class="pay-field">
              <div style="display: flex; justify-content: space-between; align-items: center; height: 24px; margin-bottom: 6px;">
                <label for="grnModalStageSelect" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text); display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-flag-checkered" style="color: #8b5cf6;"></i>
                  <span>Payment Stage <span class="req" style="color: #ef4444; font-weight: 800;">*</span></span>
                </label>
                <span style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">Auto-computed</span>
              </div>
              <div style="position: relative; display: flex; align-items: center;">
                <select id="grnModalStageSelect" name="grn_modal_stage_select" class="pay-select-field" style="height: 44px; padding: 0 36px 0 14px; border-radius: 8px; font-size: 13px; font-weight: 700; color: var(--text); background: var(--surface); border: 1.5px solid var(--border); width: 100%; appearance: none; cursor: pointer; box-sizing: border-box;">
                  <option value="Complete Payment">Complete Payment</option>
                  <option value="Advance Payment">Advance Payment</option>
                  <option value="Pending Payment">Pending Payment</option>
                </select>
                <i class="fa-solid fa-chevron-down" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 12px; pointer-events: none;"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================================================================
             STEP 5: Payment Method Selector (Same as Record Invoice Payment)
             ================================================================== -->
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div class="pay-label" id="grnModalMethodLabel" style="margin: 0; font-weight: 800; font-size: 12.5px; color: var(--text); display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-wallet" style="color: #10b981;"></i>
              <span>Payment Method <span class="req" style="color: #ef4444; font-weight: 800;">*</span></span>
            </div>
            <span class="hint" style="font-size: 11px; color: var(--text-muted);">Database: payment_types</span>
          </div>

          <input type="hidden" id="grnPaymentTypeId" name="payment_types_id" value="1">

          <div class="pay-method-selector" id="grnModalMethodSelector" role="group" aria-labelledby="grnModalMethodLabel" aria-label="Payment Method Options" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
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

        <!-- Dynamic Method Details Container -->
        <div id="grnModalMethodFields">
          <!-- Dynamically populated via RecordGrnPaymentModal.js -->
        </div>

        <!-- ==================================================================
             STEP 6: Date, Officer & Narration
             ================================================================== -->
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label" for="grnModalDate" style="font-weight: 700;">Disbursement Date</label>
            <input type="date" id="grnModalDate" name="grn_disbursement_date" class="pay-input">
          </div>
          <div class="pay-field">
            <label class="pay-label" for="grnModalProcurementOfficer" style="font-weight: 700;">Procurement Officer</label>
            <input type="text" id="grnModalProcurementOfficer" name="grn_procurement_officer" class="pay-input" value="Procurement Manager" readonly style="opacity: 0.85;">
          </div>
        </div>

        <div class="pay-field">
          <label class="pay-label" for="grnModalNotes" style="font-weight: 700;">Narration / Cheque Details / Remarks</label>
          <input type="text" id="grnModalNotes" name="grn_modal_notes" class="pay-input" placeholder="E.g. Full settlement upon paper delivery / advance for flex container">
        </div>
      </div>

      <div class="pay-modal-footer" style="padding: 14px 22px; background: var(--surface); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
        <button type="button" class="po-btn pay-action-btn pay-btn-grn" id="btnConfirmSaveGrnPayment">
          <i class="fa-solid fa-check"></i> Save GRN Payment &amp; Generate Voucher
        </button>
      </div>
    </div>
  </div>
