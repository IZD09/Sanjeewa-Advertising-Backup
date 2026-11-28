<!-- STOCK ADJUSTMENT MODAL -->
<div class="po-modal-overlay" id="adjustStockModal">
  <div class="po-modal" style="max-width: 600px;">
    <div class="po-modal-header">
      <h3 id="invAdjustModalTitle"><i class="fa-solid fa-sliders" style="color: #faad14;"></i> Adjust Stock</h3>
      <button type="button" class="modal-close-btn" data-close-inv-modal="adjustStockModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="gap: 16px;">
      <!-- 1. Item Name Input (Read-only / Editable False) -->
      <div class="po-field">
        <label class="po-label" for="adjItemNameInput">
          <span>Item Name <span class="req">*</span></span>
          <span class="hint">Selected material item from detailed stock batches</span>
        </label>
        <input type="text" id="adjItemNameInput" name="adj_item_name" class="inv-search-input" readonly style="background-color: #f5f5f5; cursor: not-allowed; font-weight: 600;" placeholder="Material Item Name">
        <input type="hidden" id="adjStockId" name="adj_stock_id" value="">
        <input type="hidden" id="adjBatchSelect" name="adj_batch" value="">
      </div>

      <!-- 2. Adjustment Type: (+) Add or (-) Deduct -->
      <div class="po-field">
        <div class="po-label"><span>Adjustment Type <span class="req">*</span></span></div>
        <div class="inv-segmented-group">
          <div class="inv-segmented-option active add" id="adjTypeAdd">
            <i class="fa-solid fa-plus"></i> (+) Add Stock
          </div>
          <div class="inv-segmented-option" id="adjTypeDeduct">
            <i class="fa-solid fa-minus"></i> (-) Deduct Stock
          </div>
        </div>
      </div>

      <!-- 3. Quantity Number Input -->
      <div class="po-field">
        <label class="po-label" for="adjQtyInput"><span>Adjustment Quantity <span class="req">*</span></span></label>
        <input type="number" id="adjQtyInput" name="adj_qty" class="inv-search-input" min="0" step="any" placeholder="Enter quantity to adjust">
      </div>

      <!-- 4. Read-Only Financial Impact Value -->
      <div class="inv-impact-box">
        <span style="color: var(--text-muted); font-weight: 600;">Financial Impact Value:</span>
        <span id="adjImpactValue">
          <strong>Rs. 0.00</strong>
        </span>
      </div>

      <!-- 5. Reason Dropdown -->
      <div class="po-field">
        <label class="po-label" for="adjReasonSelect"><span>Reason for Adjustment <span class="req">*</span></span></label>
        <select id="adjReasonSelect" name="adj_reason" class="inv-select" style="width: 100%;">
          <option value="Physical Count Mismatch">Physical Count Mismatch</option>
          <option value="Damaged / Wasted">Damaged / Wasted</option>
          <option value="Lost">Lost</option>
          <option value="Production Scrap">Production Scrap</option>
          <option value="Supplier Return">Supplier Return</option>
          <option value="New Inflow / Restock">New Inflow / Restock</option>
        </select>
      </div>

      <!-- 6. Remarks Textarea -->
      <div class="po-field">
        <label class="po-label" for="adjRemarksInput"><span>Remarks / Extra Notes</span></label>
        <textarea id="adjRemarksInput" name="adj_remarks" class="po-textarea" rows="2" placeholder="Additional audit notes or incident explanation..."></textarea>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="adjustStockModal">Cancel</button>
      <button type="button" class="ant-btn ant-btn-primary" id="saveStockAdjustmentBtn">
        <i class="fa-solid fa-check"></i> Save Adjustment
      </button>
    </div>
  </div>
</div>
