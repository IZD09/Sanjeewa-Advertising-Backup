<!-- ==========================================================================
     3. ADD / RECEIVE STOCK SHIPMENT MODAL (Database Aligned)
     ========================================================================== -->
<div class="po-modal-overlay" id="addStockModal">
  <div class="po-modal po-modal-large" style="max-width: 840px; max-height: 92vh;">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-boxes-packing" style="color: #1677ff;"></i> <span id="addStockModalTitle">Receive &amp; Add Material Stock</span></h3>
      <button type="button" class="modal-close-btn" data-close-inv-modal="addStockModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="gap: 16px; max-height: calc(92vh - 140px); overflow-y: auto;">
      <!-- 0. Stock Action Mode Selection (New Stock vs Update Existing Stock) -->
      <div style="background: var(--surface-2, #f5f5f5); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
          <i class="fa-solid fa-layer-group" style="color: #1677ff;"></i> Stock Action Type
        </div>
        <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: center;">
          <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
            <input type="radio" name="addStockMode" id="addStockModeNew" value="NEW" checked>
            <span><i class="fa-solid fa-plus-circle" style="color: #1677ff;"></i> Receive as New Stock Record</span>
          </label>
          <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
            <input type="radio" name="addStockMode" id="addStockModeUpdate" value="UPDATE">
            <span><i class="fa-solid fa-arrows-rotate" style="color: #52c41a;"></i> Update / Add to Existing Stock Entry</span>
          </label>
        </div>

        <!-- Existing Stock Dropdown (Visible only in UPDATE mode or when item has existing stocks) -->
        <div id="addStockExistingSelectWrap" style="display: none; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border);">
          <label class="po-label" for="addStockExistingSelect" style="margin-bottom: 6px;">
            <span>Select Existing Stock Record to Update <span class="req" style="color: #ff4d4f;">*</span></span>
            <span class="hint">Choose which stock record's quantity will be incremented</span>
          </label>
          <select id="addStockExistingSelect" name="add_stock_existing_item" class="inv-select" style="width: 100%;">
            <option value="">-- Choose Existing Stock Record --</option>
          </select>
        </div>
      </div>

      <!-- 1. GRN Reference Selection (Step 1) -->
      <div class="po-field" style="margin: 0;">
        <label class="po-label" for="addStockGrnSelect" style="margin-bottom: 6px; display: block; font-size: 12px; font-weight: 700;">
          <span>Select GRN Reference <span class="req" style="color: #ff4d4f;">*</span></span>
          <span class="hint" id="addStockGrnHint" style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Select a GRN to filter Purchase Order items</span>
        </label>
        <select id="addStockGrnSelect" name="add_stock_grn" class="inv-select" style="width: 100%;">
          <option value="">-- Select GRN Reference --</option>
        </select>
      </div>

      <!-- 2. Material Stock Item with Interactive Select (Step 2) -->
      <div class="po-field" style="margin: 0; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <label class="po-label" for="addStockItemSelect" style="margin: 0; font-size: 12px; font-weight: 700;">
            <span>Select Material Item (SKU) <span class="req" style="color: #ff4d4f;">*</span></span>
            <span class="hint" id="addStockItemHint" style="font-size: 11px; color: var(--text-muted); font-weight: normal; margin-left: 8px;">Pending Purchase Order items for this GRN</span>
          </label>
          <span id="stagedQueueBadge" style="display: none; font-size: 11px; font-weight: 700; color: #1677ff; background: #e6f4ff; border: 1px solid #91caff; padding: 1px 8px; border-radius: 10px;">
            <i class="fa-solid fa-list-check"></i> <span id="stagedQueueCount">0</span> in queue
          </span>
        </div>
        <input type="hidden" id="addStockSelectedItemId" name="add_stock_item_id" value="">
        
        <div style="display: flex; gap: 8px; align-items: center;">
          <select id="addStockItemSelect" name="add_stock_item_select" class="inv-select" style="flex: 1; height: 38px;">
            <option value="">-- Select Material Item (SKU) --</option>
          </select>
          <button type="button" id="btnAddStockItemToTable" class="ant-btn ant-btn-primary" style="display: inline-flex; align-items: center; gap: 6px; padding: 0 16px; height: 38px; font-weight: 600; white-space: nowrap; border-radius: 6px;" title="Add selected item to queue table">
            <i class="fa-solid fa-plus"></i> <span>Add</span>
          </button>
          <button type="button" id="btnAddAllStockItemsToTable" class="ant-btn ant-btn-default" style="display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; height: 38px; font-weight: 600; white-space: nowrap; border-radius: 6px; color: #1677ff; border-color: #91caff;" title="Add all pending items from this GRN to queue table">
            <i class="fa-solid fa-list-check"></i> <span>Add All</span>
          </button>
        </div>

        <!-- Staged Items Table (Queue) -->
        <div id="addStockStagedContainer" style="display: none; margin-top: 10px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: #fff;">
          <div style="background: var(--surface-2, #fafafa); padding: 8px 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11.5px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-cart-flatbed" style="color: #1677ff;"></i>
              <span>Queued Stock Items to Receive</span>
              <span class="ant-tag ant-tag-blue" id="addStockStagedItemsBadge" style="font-size: 10.5px; padding: 0 6px; border-radius: 8px; margin: 0;">0 items</span>
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">
              <span>Queued Cost: </span><strong id="addStockStagedTotalCost" style="color: #1677ff;">Rs. 0.00</strong>
            </div>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="inv-table" style="width: 100%; font-size: 12px; margin: 0; border-collapse: collapse;">
              <thead>
                <tr style="background: #fafafa; border-bottom: 1px solid var(--border);">
                  <th style="padding: 7px 10px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px;">Material Item / SKU</th>
                  <th style="padding: 7px 10px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 11px;">Brand</th>
                  <th style="padding: 7px 10px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 85px;">Qty</th>
                  <th style="padding: 7px 10px; text-align: right; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 95px;">Unit Cost</th>
                  <th style="padding: 7px 10px; text-align: right; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 95px;">Sell Price</th>
                  <th style="padding: 7px 10px; text-align: right; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 105px;">Subtotal</th>
                  <th style="padding: 7px 10px; text-align: center; font-weight: 600; color: var(--text-muted); font-size: 11px; width: 50px;">Action</th>
                </tr>
              </thead>
              <tbody id="addStockStagedTbody">
                <!-- Populated dynamically via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 3. Classification & Brand Selectors (Auto-selected on Item pick) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="addStockCategorySelect">
            <span>Category <span class="req" style="color: #ff4d4f;">*</span></span>
          </label>
          <select id="addStockCategorySelect" name="add_stock_category" class="inv-select" style="width: 100%;">
            <option value="">-- Select Category --</option>
          </select>
        </div>
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="addStockSubcategorySelect">
            <span>Subcategory <span class="req" style="color: #ff4d4f;">*</span></span>
          </label>
          <select id="addStockSubcategorySelect" name="add_stock_subcategory" class="inv-select" style="width: 100%;" disabled>
            <option value="">-- Choose Category First --</option>
          </select>
        </div>
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="addStockBrandSelect">
            <span>Brand <span class="req" style="color: #ff4d4f;">*</span></span>
          </label>
          <select id="addStockBrandSelect" name="add_stock_brand" class="inv-select" style="width: 100%;">
            <option value="">-- Select Brand --</option>
          </select>
        </div>
      </div>

      <!-- 4. Batch Number Selection (Existing Batch vs New Batch) -->
      <div style="background: var(--surface-2, #f5f5f5); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">
          <i class="fa-solid fa-barcode" style="color: #722ed1;"></i> Batch Number Allocation
        </div>
        <div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: center; margin-bottom: 10px;">
          <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
            <input type="radio" name="addStockBatchOption" id="addStockBatchOptNew" value="NEW" checked>
            <span>Generate New Batch</span>
          </label>
          <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px;">
            <input type="radio" name="addStockBatchOption" id="addStockBatchOptExisting" value="EXISTING">
            <span>Select Existing Batch</span>
          </label>
        </div>

        <div id="addStockExistingBatchWrap" style="display: none;">
          <label class="po-label" for="addStockBatchSelect" style="margin-bottom: 4px;">
            <span>Existing Batch Number</span>
          </label>
          <select id="addStockBatchSelect" name="add_stock_batch" class="inv-select" style="width: 100%;">
            <option value="">-- Select Existing Batch No --</option>
          </select>
        </div>
      </div>

      <!-- 5. Received Date, Quantity & Pricing (4 Fields with Red Asterisks) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start;">
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="addStockDate" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700;">
            <span>Received Date <span class="req" style="color: #ff4d4f;">*</span></span>
          </label>
          <input type="date" id="addStockDate" name="add_stock_date" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;">
        </div>
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="addStockQty" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700; white-space: nowrap;">
            <span>Quantity Received <span class="req" style="color: #ff4d4f;">*</span></span>
          </label>
          <input type="number" id="addStockQty" name="add_stock_qty" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;" min="1" step="1" placeholder="Enter quantity">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start;">
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="addStockUnitCost" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700; white-space: nowrap;">
            <span>Unit Purchase Cost (LKR) <span class="req" style="color: #ff4d4f;">*</span></span>
          </label>
          <input type="number" id="addStockUnitCost" name="add_stock_unit_cost" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="addStockSellingPrice" style="margin-bottom: 6px; display: block; font-size: 11.5px; font-weight: 700; white-space: nowrap;">
            <span>Standard Selling Price (LKR) <span class="req" style="color: #ff4d4f;">*</span></span>
          </label>
          <input type="number" id="addStockSellingPrice" name="add_stock_selling_price" class="inv-search-input" style="padding-left: 12px; padding-right: 12px; width: 100%;" min="0" step="0.01" placeholder="0.00">
        </div>
      </div>

      <!-- 6. Live Financial & Stock Calculation Summary Box -->
      <div class="inv-impact-box" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase;">Total Shipment Purchase Cost:</span>
          <div id="addStockTotalCost" style="font-size: 16px; font-weight: 800; color: #1677ff; margin-top: 2px;">Rs. 0.00</div>
        </div>
        <div id="addStockUpdateQtyIndicator" style="display: none; text-align: center; font-size: 12px; color: var(--text); background: rgba(82, 196, 26, 0.1); padding: 4px 12px; border-radius: 4px; border: 1px solid rgba(82, 196, 26, 0.3);">
          <span style="color: #52c41a; font-weight: 700;">Stock Increment:</span>
          <span id="addStockUpdateQtyCalc">0 + 0 = 0 Units</span>
        </div>
        <div style="text-align: right;">
          <span style="color: var(--text-muted); font-size: 11px; font-weight: 700; text-transform: uppercase;">Estimated Retail Value:</span>
          <div id="addStockTotalValue" style="font-size: 16px; font-weight: 800; color: #52c41a; margin-top: 2px;">Rs. 0.00</div>
        </div>
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
