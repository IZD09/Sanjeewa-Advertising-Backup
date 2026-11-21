<!-- ==========================================================================
     CREATE NEW GRN MODAL (Multi-PO Support)
     ========================================================================== -->
<div class="po-modal-overlay" id="createGrnModal">
  <div class="po-modal po-modal-large" style="max-width: 1180px; max-height: 94vh;">
    <!-- Modal Header -->
    <div class="po-modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(22, 119, 255, 0.1); color: #1677ff; display: flex; align-items: center; justify-content: center; font-size: 17px;">
          <i class="fa-solid fa-file-circle-plus"></i>
        </div>
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Receive &amp; Create Goods Received Note (GRN)</h3>
          <span style="font-size: 11.5px; color: var(--text-muted);">Link one or more active Purchase Orders, record received quantities, and update stock</span>
        </div>
      </div>
      <button type="button" class="modal-close-btn" data-close-grn-modal="createGrnModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Modal Body -->
    @php
      $grnAuthUser = Auth::guard('admin')->check()
        ? Auth::guard('admin')->user()
        : (Auth::guard('web')->user() ?? Auth::guard('admin')->user());
      $grnReceivedByName = $grnAuthUser
        ? trim(($grnAuthUser->first_name ?? '') . ' ' . ($grnAuthUser->last_name ?? ''))
        : '';
      if (empty($grnReceivedByName)) {
        $grnReceivedByName = $grnAuthUser->username ?? $grnAuthUser->name ?? 'Administrator';
      }
    @endphp
    <div class="po-modal-body" style="gap: 16px; padding: 18px 24px; max-height: calc(94vh - 130px); overflow-y: auto;">
      
      <!-- Top Row: Supplier Search Selector & Received By (Logged-in User) -->
      <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; align-items: start; background: var(--surface-2, #fafafa); padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border);">
        <!-- Searchable Supplier Selector -->
        <div class="po-field" style="margin: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="po-label" for="grnCreateSuppSearchInput" style="margin: 0; font-weight: 700;">
              <i class="fa-solid fa-truck-field" style="color: #1677ff; margin-right: 4px;"></i>
              <span>Select Supplier / Vendor <span class="req" style="color: #ff4d4f;">*</span></span>
            </label>
            <span class="hint" style="font-size: 11px; color: var(--text-muted);">Search to load supplier's Approved POs</span>
          </div>

          <div id="grnCreateSuppSearchGroup" style="position: relative;">
            <div style="position: relative; display: flex; align-items: center;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; color: var(--text-muted); font-size: 12.5px; z-index: 2; pointer-events: none;"></i>
              <input type="text" id="grnCreateSuppSearchInput" name="grn_supplier_search" class="grn-inline-input" placeholder="Search supplier by name or phone (or click to browse)..." autocomplete="off" style="padding-left: 34px; padding-right: 36px; height: 40px; width: 100%; border-radius: 8px;">
              <input type="hidden" id="grnCreateSelectedSupplierId" value="">
              <button type="button" id="grnCreateToggleSuppDropdownBtn" style="position: absolute; right: 6px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; z-index: 2;" title="Browse suppliers">
                <i class="fa-solid fa-chevron-down" id="grnCreateSuppDropdownIcon"></i>
              </button>
            </div>
            <div id="grnCreateSuppDropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 1050; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></div>
          </div>

          <!-- Selected Supplier Card -->
          <div id="grnCreateSelectedSupplierCard" style="display: none; align-items: center; justify-content: space-between; background: var(--surface, #fff); border: 1.5px solid #1677ff; border-radius: 8px; padding: 6px 10px; min-height: 40px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(22, 119, 255, 0.12); color: #1677ff; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">
                <i class="fa-solid fa-truck-fast"></i>
              </div>
              <div style="min-width: 0;">
                <div id="grnCreateSelectedSuppName" style="font-weight: 700; font-size: 13px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Supplier Name</div>
                <div id="grnCreateSelectedSuppMeta" style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">077 123 4567 • 0 Approved POs</div>
              </div>
            </div>
            <button type="button" id="grnCreateClearSupplierBtn" class="ant-btn ant-btn-default ant-btn-sm" style="height: 26px; font-size: 11px; padding: 0 8px; flex-shrink: 0;">
              <i class="fa-solid fa-rotate"></i> Change
            </button>
          </div>
        </div>

        <!-- Received By / Stock Custodian (Logged-in User) -->
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="grnModalReceivedBy" style="margin-bottom: 6px; font-weight: 700; display: block;">
            <i class="fa-solid fa-user-shield" style="color: #1677ff; margin-right: 4px;"></i>
            <span>Received By / Stock Custodian</span>
          </label>
          <input type="text" id="grnModalReceivedBy" name="received_by" class="grn-inline-input" style="height: 40px; border-radius: 8px; font-weight: 600; opacity: 0.9;" value="{{ $grnReceivedByName }}" data-logged-user="{{ $grnReceivedByName }}" readonly>
        </div>
      </div>

      <!-- SECTION 1: LINK APPROVED PURCHASE ORDERS -->
      <div style="border-top: 1px solid var(--border); padding-top: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 13.5px; font-weight: 700; color: var(--text);">
            <i class="fa-solid fa-clipboard-list" style="color: #1677ff;"></i> 1. Linked Purchase Orders (PO) <span class="tab-count-badge" id="grnModalPoCount" style="margin-left: 6px;">0</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" id="grnCreateAddAllApprovedPoBtn" class="ant-btn ant-btn-default ant-btn-sm" style="display: none; height: 26px; font-size: 11px; color: #1677ff; border-color: rgba(22,119,255,0.35);">
              <i class="fa-solid fa-check-double"></i> Add All Approved POs
            </button>
            <span style="font-size: 11.5px; color: var(--text-muted);">
              Only Approved POs for the selected supplier can be linked
            </span>
          </div>
        </div>

        <!-- Approved PO Selector for Selected Supplier -->
        <div style="margin-bottom: 12px;">
          <label class="po-label" for="grnModalApprovedPoSelect" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
            <span><i class="fa-solid fa-file-circle-check" style="color: #1677ff;"></i> Select Approved Purchase Order <span class="req" style="color: #ff4d4f;">*</span></span>
            <span class="hint" id="grnModalPoSearchHint" style="font-size: 11px; color: var(--text-muted);">Select a supplier above to view their Approved Purchase Orders</span>
          </label>
          <select id="grnModalApprovedPoSelect" name="approved_po_select" class="grn-inline-input" style="height: 40px; width: 100%; border-radius: 8px; font-weight: 600;" disabled>
            <option value="">-- Please select a supplier above first --</option>
          </select>
          <div id="grnCreateApprovedPoChips" style="display: none; flex-wrap: wrap; gap: 8px; margin-top: 8px;"></div>
        </div>

        <!-- Table of Currently Linked Purchase Orders -->
        <div class="inv-table-responsive" style="margin-bottom: 8px;">
          <table class="ant-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th style="width: 130px;">PO Number</th>
                <th style="min-width: 180px;">Supplier / Vendor</th>
                <th style="width: 110px;">Order Date</th>
                <th class="text-right" style="width: 130px;">PO Value (Rs.)</th>
                <th style="width: 100px;">Status</th>
                <th style="width: 180px;">Supplier Invoice #</th>
                <th class="text-center" style="width: 70px;">Action</th>
              </tr>
            </thead>
            <tbody id="grnModalPoTableBody">
              <!-- Dynamically populated via CreateGrnModal.js -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 2: RECEIVED MATERIAL ITEMS LIST -->
      <div style="border-top: 1px solid var(--border); padding-top: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: gap: 8px;">
            <div style="font-size: 13.5px; font-weight: 700; color: var(--text);">
              <i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> 2. Received Material Items List <span class="tab-count-badge" id="grnModalItemCount" style="margin-left: 6px;">0</span>
            </div>
            <span id="grnRemovedBadge" style="display: none; font-size: 11px; font-weight: 600; color: #d46b08; background: #fffbe6; border: 1px solid #ffe58f; padding: 1px 8px; border-radius: 10px;">
              <i class="fa-solid fa-rotate-left"></i> <span id="grnRemovedBadgeCount">0</span> removed
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" id="grnHeaderReaddAllBtn" class="ant-btn ant-btn-default ant-btn-sm" style="display: none; height: 26px; font-size: 11px; color: #52c41a; border-color: rgba(82, 196, 26, 0.4); background: rgba(82, 196, 26, 0.06); font-weight: 600;">
              <i class="fa-solid fa-rotate-left"></i> Re-add All (<span id="grnHeaderReaddCount">0</span>)
            </button>
            <span style="font-size: 11.5px; color: var(--text-muted);" id="grnModalItemHint">
              Items auto-loaded from linked Purchase Orders. Adjust receiving quantities or unit costs.
            </span>
          </div>
        </div>

        <!-- Removed / Excluded Items Panel (Visible when items have been removed from this table) -->
        <div id="grnRemovedItemsSection" style="display: none; margin-bottom: 12px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 10px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 12px; font-weight: 700; color: #d46b08; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-clock-rotate-left"></i>
              <span>Removed Items from Linked POs (<span id="grnRemovedItemsListCount">0</span>)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; color: #873800;">Click <strong>+ Re-add</strong> on an item or:</span>
              <button type="button" id="grnReaddAllRemovedBtn" class="ant-btn ant-btn-default ant-btn-sm" style="height: 24px; font-size: 11px; padding: 0 8px; color: #52c41a; border-color: rgba(82, 196, 26, 0.4); background: #fff; font-weight: 600;">
                <i class="fa-solid fa-rotate-left"></i> Re-add All Items
              </button>
            </div>
          </div>
          <!-- Dropdown & Quick Add row -->
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <select id="grnModalReaddSelect" class="grn-inline-input" style="height: 30px; font-size: 12px; border-radius: 6px; flex: 1; max-width: 420px;">
              <option value="">-- Select Removed Item to Re-add --</option>
            </select>
            <button type="button" id="grnModalReaddSelectBtn" class="ant-btn ant-btn-primary ant-btn-sm" style="height: 30px; font-size: 11.5px; padding: 0 12px; font-weight: 600;">
              <i class="fa-solid fa-plus"></i> Re-add Selected
            </button>
          </div>
          <div id="grnRemovedItemsChipsContainer" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <!-- Populated dynamically via CreateGrnModal.js -->
          </div>
        </div>

        <div class="inv-table-responsive">
          <table class="grn-items-table">
            <thead>
              <tr>
                <th style="min-width: 185px;">Material Item</th>
                <th style="width: 100px;">Linked PO</th>
                <th style="min-width: 135px;">Brand <span class="req" style="color: #ff4d4f;">*</span></th>
                <th style="min-width: 175px;">Stock / Batch <span class="req" style="color: #ff4d4f;">*</span></th>
                <th style="width: 65px;">Unit</th>
                <th class="text-right" style="width: 75px;">Ordered</th>
                <th class="text-right" style="width: 75px;">Prev Rec.</th>
                <th class="text-right" style="width: 105px;">Receiving Qty <span class="req" style="color: #ff4d4f;">*</span></th>
                <th class="text-right" style="width: 115px;">Unit Cost (Rs.) <span class="req" style="color: #ff4d4f;">*</span></th>
                <th class="text-right" style="width: 115px;">Line Total (Rs.)</th>
                <th class="text-center" style="width: 50px;">Action</th>
              </tr>
            </thead>
            <tbody id="grnModalItemsTbody">
              <!-- Dynamically populated via CreateGrnModal.js -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 3: FINANCIAL CALCULATION SUMMARY & NOTES -->
      <div style="display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: stretch; border-top: 1px solid var(--border); padding-top: 14px;">
        <div style="display: flex; flex-direction: column;">
          <div class="po-field" style="margin: 0; display: flex; flex-direction: column; height: 100%;">
            <label class="po-label" for="grnModalRemarks" style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span><i class="fa-solid fa-comment-dots" style="color: #1677ff; margin-right: 4px;"></i> Delivery Remarks &amp; Storage Notes</span>
              <span class="hint" style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Vehicle no, condition of packages, location</span>
            </label>
            <textarea id="grnModalRemarks"
                      name="delivery_remarks"
                      class="po-textarea grn-textarea"
                      rows="4"
                      placeholder="Condition of bundles/rolls, vehicle number, batch notes, warehouse rack/shelf location..."
                      style="width: 100%; min-height: 108px; flex: 1; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-2); font-family: inherit; font-size: 12.5px; line-height: 1.5; color: var(--text); resize: vertical; box-sizing: border-box; outline: none;"></textarea>
          </div>
        </div>

        <div class="grn-financial-summary-box" style="margin: 0; padding: 14px 18px; border-radius: 8px;">
          <div class="grn-fin-row">
            <span>Sub Total:</span>
            <strong id="grnModalSubTotal">Rs. 0.00</strong>
          </div>
          <div class="grn-fin-row">
            <label for="grnModalDiscount" style="cursor: pointer; font-size: 13px;">Discount (LKR):</label>
            <div style="width: 130px;">
              <input type="number" id="grnModalDiscount" name="grn_discount" aria-label="GRN Discount" class="grn-inline-input text-right" min="0" step="0.01" value="0.00" style="height: 30px; font-weight: 600;">
            </div>
          </div>
          <div class="grn-fin-row net-total" style="border-top: 2px solid #1677ff; margin-top: 8px; padding-top: 8px;">
            <span style="font-weight: 700; color: #1677ff; font-size: 14px;">Net Total:</span>
            <strong id="grnModalNetTotal" style="color: #1677ff; font-size: 17px;">Rs. 0.00</strong>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal Footer -->
    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="createGrnModal">Cancel</button>
      <button type="button" class="ant-btn ant-btn-primary" id="saveNewGrnModalBtn">
        <i class="fa-solid fa-circle-check"></i> Complete &amp; Save GRN
      </button>
    </div>

  </div>
</div>
