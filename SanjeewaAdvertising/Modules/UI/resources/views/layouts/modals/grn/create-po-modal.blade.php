<!-- ==================================================================
     CREATE NEW PURCHASE ORDER (PO) MODAL
     ================================================================== -->
<div class="po-modal-overlay" id="createPOModal">
  <div class="po-modal po-modal-large" style="max-width: 840px; max-height: 90vh;">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-cart-arrow-down" style="color: #1677ff;"></i> Create New Purchase Order (PO)</h3>
      <button type="button" class="modal-close-btn" data-close-grn-modal="createPOModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="gap: 16px;">
      <!-- Header Info Grid: Supplier Search Selector & Expected Delivery -->
      <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; align-items: start; background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px;">
        <!-- Supplier / Vendor Searchable Selector -->
        <div class="po-field" style="margin: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="po-label" for="newPoSuppSearchInput" style="margin: 0; font-weight: 700;">
              <i class="fa-solid fa-truck-field" style="color: #1677ff; margin-right: 4px;"></i>
              <span>Supplier / Vendor <span class="req">*</span></span>
            </label>
            <button type="button" id="poQuickAddSupplierBtn" style="background: none; border: none; color: #1677ff; font-size: 11.5px; font-weight: 700; cursor: pointer; padding: 0;" title="Register a new supplier">
              <i class="fa-solid fa-user-plus"></i> + New
            </button>
          </div>

          <div id="newPoSuppSearchGroup" style="position: relative;">
            <div style="position: relative; display: flex; align-items: center;">
              <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; color: var(--text-muted); font-size: 12.5px; z-index: 2; pointer-events: none;"></i>
              <input type="text" id="newPoSuppSearchInput" name="po_supplier_search" class="grn-inline-input" placeholder="Search supplier by name or phone (or click to browse)..." autocomplete="off" style="padding-left: 34px; padding-right: 36px; height: 40px; width: 100%; border-radius: 8px;">
              <input type="hidden" id="newPoSupplier" name="po_supplier" value="">
              <input type="hidden" id="newPoSupplierId" name="po_supplier_id" value="">
              <button type="button" id="newPoToggleSuppDropdownBtn" style="position: absolute; right: 6px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; z-index: 2;" title="Browse suppliers">
                <i class="fa-solid fa-chevron-down" id="newPoSuppDropdownIcon"></i>
              </button>
            </div>
            <div id="newPoSuppDropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 1050; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></div>
          </div>

          <!-- Selected Supplier Card -->
          <div id="newPoSelectedSupplierCard" style="display: none; align-items: center; justify-content: space-between; background: var(--surface, #fff); border: 1.5px solid #1677ff; border-radius: 8px; padding: 6px 10px; min-height: 40px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(22, 119, 255, 0.12); color: #1677ff; display: grid; place-items: center; font-size: 12px; flex-shrink: 0;">
                <i class="fa-solid fa-truck-fast"></i>
              </div>
              <div style="min-width: 0;">
                <div id="newPoSelectedSuppName" style="font-weight: 700; font-size: 13px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Supplier Name</div>
                <div id="newPoSelectedSuppMeta" style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">077 123 4567 • SUP-001</div>
              </div>
            </div>
            <button type="button" id="newPoClearSupplierBtn" class="ant-btn ant-btn-default ant-btn-sm" style="height: 26px; font-size: 11px; padding: 0 8px; flex-shrink: 0;">
              <i class="fa-solid fa-rotate"></i> Change
            </button>
          </div>
        </div>

        <!-- Expected Delivery Date -->
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="newPoExpectedDate" style="margin-bottom: 6px; font-weight: 700; display: block;">
            <i class="fa-solid fa-calendar-check" style="color: #1677ff; margin-right: 4px;"></i>
            <span>Expected Delivery <span class="req">*</span></span>
          </label>
          <input type="date" id="newPoExpectedDate" name="po_expected_date" class="grn-inline-input" style="height: 40px; width: 100%; border-radius: 8px;" required>
        </div>
      </div>

      <!-- Order Instructions / Notes -->
      <div class="po-field" style="margin: 0;">
        <label class="po-label" for="newPoRemarks" style="font-weight: 700;">
          <i class="fa-solid fa-note-sticky" style="color: #1677ff; margin-right: 4px;"></i>
          <span>Order Instructions / Notes</span>
        </label>
        <input type="text" id="newPoRemarks" name="po_remarks" maxlength="255" class="grn-inline-input" style="height: 38px; border-radius: 8px;" placeholder="Urgent order, standard packaging, batch requirement...">
      </div>

      <!-- Materials to Order Table -->
      <div style="border-top: 1px solid var(--border); padding-top: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--text);">
            <i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> Materials to Order
          </div>
          <span style="font-size: 11.5px; color: var(--text-muted);">
            Search and select items from database, then adjust quantity or cost
          </span>
        </div>

        <!-- Category & Subcategory Filters for Easy Material Item Search -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div class="po-field" style="margin: 0;">
            <label class="po-label" for="newPoItemCategoryFilter" style="margin-bottom: 4px; font-size: 11.5px; font-weight: 700;">
              <i class="fa-solid fa-layer-group" style="color: #1677ff; margin-right: 4px;"></i> Category
            </label>
            <select id="newPoItemCategoryFilter" name="po_item_category_filter" class="grn-inline-input" style="height: 36px; width: 100%; border-radius: 6px; font-size: 12.5px;">
              <option value="ALL">All Categories</option>
            </select>
          </div>
          <div class="po-field" style="margin: 0;">
            <label class="po-label" for="newPoItemSubcategoryFilter" style="margin-bottom: 4px; font-size: 11.5px; font-weight: 700;">
              <i class="fa-solid fa-tags" style="color: #1677ff; margin-right: 4px;"></i> Subcategory
            </label>
            <select id="newPoItemSubcategoryFilter" name="po_item_subcategory_filter" class="grn-inline-input" style="height: 36px; width: 100%; border-radius: 6px; font-size: 12.5px; opacity: 0.6; cursor: not-allowed;" disabled>
              <option value="ALL">-- Select Category First --</option>
            </select>
          </div>
        </div>

        <!-- Database Item Search & Add Selector -->
        <div style="margin-bottom: 12px; position: relative;">
          <label class="po-label" for="newPoItemSearchInput" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
            <span><i class="fa-solid fa-magnifying-glass" style="color: #1677ff;"></i> Search &amp; Add Material Item <span class="req" style="color: #ff4d4f;">*</span></span>
            <span class="hint" id="newPoItemSearchHint" style="font-size: 11px; color: var(--text-muted);">Type SKU code or material name to load &amp; add directly</span>
          </label>
          <div style="position: relative; display: flex; align-items: center;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 11px; color: var(--text-muted); font-size: 13px; z-index: 2;"></i>
            <input type="text" id="newPoItemSearchInput" name="po_item_search" aria-label="Search material items from database" class="grn-inline-input" style="padding-left: 34px; padding-right: 145px; width: 100%; height: 38px; border-radius: 6px;" placeholder="Search material item from database by SKU code or name..." autocomplete="off">
            <span id="newPoItemSearchLoading" style="display: none; position: absolute; right: 150px; top: 11px; color: #1677ff; font-size: 13px; z-index: 2;">
              <i class="fa-solid fa-spinner fa-spin"></i>
            </span>
            <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="newPoAddRowBtn" style="position: absolute; right: 4px; top: 4px; bottom: 4px; height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; font-size: 12px; font-weight: 600; border-radius: 4px; z-index: 3;" title="View items & add item line">
              <i class="fa-solid fa-plus"></i> Add Item Line
            </button>
            <!-- Live Match Results Dropdown -->
            <div id="newPoItemSearchDropdown" style="display: none; position: absolute; left: 0; right: 0; top: 100%; z-index: 1050; background: var(--surface, #fff); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-height: 240px; overflow-y: auto; margin-top: 4px;">
            </div>
          </div>
        </div>

        <div class="inv-table-responsive">
          <table class="grn-items-table">
            <thead>
              <tr>
                <th>Material Item</th>
                <th style="width: 100px;">Unit</th>
                <th class="text-right" style="width: 120px;">Order Qty</th>
                <th class="text-right" style="width: 140px;">Est. Unit Cost (Rs.)</th>
                <th class="text-right" style="width: 150px;">Total (Rs.)</th>
                <th class="text-center" style="width: 60px;">Action</th>
              </tr>
            </thead>
            <tbody id="newPoItemsTbody">
              <tr id="newPoEmptyStateRow">
                <td colspan="6" style="text-align: center; padding: 36px 20px; background: rgba(0, 0, 0, 0.015); border-radius: 8px;">
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(22, 119, 255, 0.08); display: flex; align-items: center; justify-content: center; color: #1677ff; font-size: 22px;">
                      <i class="fa-solid fa-boxes-stacked"></i>
                    </div>
                    <div>
                      <div style="font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
                        No Materials Added Yet
                      </div>
                      <div style="font-size: 12px; color: var(--text-muted); max-width: 380px; line-height: 1.5;">
                        Click the <strong>"Add Item Line"</strong> button above to select material items, enter quantities, and specify estimated unit costs.
                      </div>
                    </div>
                    <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="margin-top: 4px;" onclick="window.grnManager.addNewPoRow()">
                      <i class="fa-solid fa-plus"></i> Add First Item
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Financial Summary -->
      <div style="display: flex; justify-content: flex-end; padding: 12px 16px; background: var(--surface-2); border-radius: 8px; border: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 20px;">
          <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Total Estimated PO Value:</span>
          <span id="newPoTotalDisplay" style="font-size: 18px; font-weight: 800; color: #1677ff;">Rs. 0.00</span>
        </div>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="createPOModal">Cancel</button>
      <button type="button" class="ant-btn ant-btn-primary" id="saveNewPoBtn">
        <i class="fa-solid fa-check"></i> Place & Save Purchase Order
      </button>
    </div>
  </div>
</div>
