<!-- ==========================================================================
     3. ADD / RECEIVE STOCK SHIPMENT MODAL (Database Aligned)
     ========================================================================== -->
<div class="po-modal-overlay" id="addStockModal" style="overflow-x: hidden;">
  <div class="po-modal po-modal-large" style="max-width: 980px; width: 95vw; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden;">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-boxes-packing" style="color: #1677ff;"></i> <span id="addStockModalTitle">Receive &amp; Add Material Stock</span></h3>
      <button type="button" class="modal-close-btn" data-close-inv-modal="addStockModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="display: flex; flex-direction: column; gap: 16px; padding: 20px 24px; max-height: calc(92vh - 130px); overflow-y: auto !important; overflow-x: hidden !important; width: 100%; box-sizing: border-box;">
      <!-- 1. GRN Reference Selection (Step 1) -->
      <div class="po-field" style="margin: 0; width: 100%; box-sizing: border-box;">
        <label class="po-label" for="addStockGrnSelect" style="margin-bottom: 6px; display: block; font-size: 12px; font-weight: 700;">
          <span>Select GRN Reference <span class="req" style="color: #ff4d4f;">*</span></span>
          <span class="hint" id="addStockGrnHint" style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Select a GRN to filter Purchase Order items</span>
        </label>
        <div style="display: flex; gap: 8px; align-items: center; width: 100%; box-sizing: border-box;">
          <select id="addStockGrnSelect" name="add_stock_grn" class="inv-select" style="flex: 1; min-width: 0; height: 38px; box-sizing: border-box;">
            <option value="">-- Select GRN Reference --</option>
          </select>
          <button type="button" id="btnViewSelectedGrn" class="ant-btn ant-btn-default" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 14px; height: 38px; font-weight: 600; white-space: nowrap; border-radius: 6px; color: #1677ff; border-color: #91caff; flex-shrink: 0;" title="View selected GRN details" disabled>
            <i class="fa-solid fa-eye"></i> <span>View GRN</span>
          </button>
        </div>
      </div>

      <!-- 2. Material Stock Item with Interactive Select (Step 2) -->
      <div class="po-field" style="margin: 0; position: relative; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
          <label class="po-label" for="addStockItemSelect" style="margin: 0; font-size: 12px; font-weight: 700;">
            <span>Select Material Item (SKU) <span class="req" style="color: #ff4d4f;">*</span></span>
            <span class="hint" id="addStockItemHint" style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Pending Purchase Order items for this GRN</span>
          </label>
          <span id="stagedQueueBadge" style="display: none; font-size: 11px; font-weight: 700; color: #1677ff; background: #e6f4ff; border: 1px solid #91caff; padding: 1px 8px; border-radius: 10px;">
            <i class="fa-solid fa-list-check"></i> <span id="stagedQueueCount">0</span> in queue
          </span>
        </div>
        <input type="hidden" id="addStockSelectedItemId" name="add_stock_item_id" value="">
        
        <div style="display: flex; gap: 8px; align-items: center; width: 100%; box-sizing: border-box;">
          <select id="addStockItemSelect" name="add_stock_item_select" class="inv-select" style="flex: 1; min-width: 0; height: 38px; box-sizing: border-box;">
            <option value="">-- Select Material Item (SKU) --</option>
          </select>
          <button type="button" id="btnAddStockItemToTable" class="ant-btn ant-btn-primary" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 16px; height: 38px; font-weight: 600; white-space: nowrap; border-radius: 6px; flex-shrink: 0;" title="Add selected item to queue table">
            <i class="fa-solid fa-plus"></i> <span>Add</span>
          </button>
          <button type="button" id="btnAddAllStockItemsToTable" class="ant-btn ant-btn-default" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 12px; height: 38px; font-weight: 600; white-space: nowrap; border-radius: 6px; color: #1677ff; border-color: #91caff; flex-shrink: 0;" title="Add all pending items from this GRN to queue table">
            <i class="fa-solid fa-list-check"></i> <span>Add All</span>
          </button>
        </div>

        <!-- Staged Items Table (Queue) -->
        <div id="addStockStagedContainer" style="display: block; margin-top: 10px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: #fff; width: 100%; box-sizing: border-box;">
          <div style="background: var(--surface-2, #fafafa); padding: 8px 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 11.5px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-cart-flatbed" style="color: #1677ff;"></i>
              <span>Queued Stock Items to Receive</span>
              <span class="ant-tag ant-tag-blue" id="addStockStagedItemsBadge" style="font-size: 10.5px; padding: 0 6px; border-radius: 8px; margin: 0;">0 items</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">
              <span>Queued Cost: </span><strong id="addStockStagedTotalCost" style="color: #1677ff;">Rs. 0.00</strong>
            </div>
          </div>
          <div class="staged-table-scroll-wrap" style="max-height: 220px; overflow-y: auto; overflow-x: auto; width: 100%; box-sizing: border-box;">
            <table class="inv-table" style="width: 100%; font-size: 12px; margin: 0; border-collapse: collapse;">
              <thead>
                <tr style="background: #fafafa; border-bottom: 1px solid var(--border);">
                  <th style="padding: 7px 8px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px;">Material Item / SKU</th>
                  <th style="padding: 7px 8px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 100px;">Category</th>
                  <th style="padding: 7px 8px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 105px;">Subcategory</th>
                  <th style="padding: 7px 8px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 90px;">Brand</th>
                  <th style="padding: 7px 8px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 115px;">Batch Allocation</th>
                  <th style="padding: 7px 8px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 55px;">Qty</th>
                  <th style="padding: 7px 8px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 75px;">Received</th>
                  <th style="padding: 7px 8px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 45px;">Action</th>
                </tr>
              </thead>
              <tbody id="addStockStagedTbody">
                <tr>
                  <td colspan="8" style="padding: 24px 12px; text-align: center; color: var(--text-muted, #8c8c8c); font-size: 12px;">
                    <i class="fa-solid fa-cart-plus" style="font-size: 18px; color: #bfbfbf; display: block; margin-bottom: 6px;"></i>
                    No items queued yet. Please select a GRN and click <strong>Add</strong> or <strong>Add All</strong> to add items.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 3. Received Date -->
      <div class="po-field" style="margin: 0; max-width: 240px; width: 100%; box-sizing: border-box;">
        <label class="po-label" for="addStockDate" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700;">
          <span>Received Date <span class="req" style="color: #ff4d4f;">*</span></span>
        </label>
        <input type="date" id="addStockDate" name="add_stock_date" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%; height: 38px; box-sizing: border-box;">
      </div>

      <div id="addStockUpdateQtyIndicator" style="display: none; text-align: center; font-size: 12px; color: var(--text); background: rgba(82, 196, 26, 0.1); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(82, 196, 26, 0.3); width: 100%; box-sizing: border-box;">
        <span style="color: #52c41a; font-weight: 700;">Stock Increment:</span>
        <span id="addStockUpdateQtyCalc">0 + 0 = 0 Units</span>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="addStockModal">Cancel</button>
      <button type="button" class="ant-btn ant-btn-primary" id="saveNewStockBtn">
        <i class="fa-solid fa-plus"></i> <span id="saveStockBtnLabel">Save Stock Shipment</span>
      </button>
    </div>
  </div>
</div>
