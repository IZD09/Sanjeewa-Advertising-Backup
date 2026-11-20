<!-- VIEW DETAILS MODAL -->
<div class="po-modal-overlay" id="viewStockDetailsModal">
  <div class="po-modal po-modal-large" style="max-width: 860px; max-height: 90vh;">
    <div class="po-modal-header">
      <h3 id="invViewModalTitle"><i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> Stock Details</h3>
      <button type="button" class="modal-close-btn" data-close-inv-modal="viewStockDetailsModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="gap: 18px;">
      <!-- Top Section Highlight Cards -->
      <div class="inv-modal-highlight-row">
        <div class="inv-stat-highlight">
          <span>Total Available Quantity</span>
          <strong id="invViewTotalQty" style="color: #1677ff;">-</strong>
        </div>
        <div class="inv-stat-highlight">
          <span>Total Stock Value</span>
          <strong id="invViewTotalVal" style="color: #52c41a;">-</strong>
        </div>
      </div>

      <!-- Middle Section: Batch Breakdown Table -->
      <div>
        <h4 class="inv-modal-section-title">
          <i class="fa-solid fa-layer-group"></i> Batch Breakdown
        </h4>
        <div class="inv-table-responsive" style="border: 1px solid var(--border); border-radius: 6px;">
          <table class="ant-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Received Date</th>
                <th class="text-right">Unit Cost</th>
                <th class="text-right">Initial Qty</th>
                <th class="text-right">Available Qty</th>
                <th class="text-right">Batch Value</th>
              </tr>
            </thead>
            <tbody id="invViewBatchTbody">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Section: Recent Transactions Timeline -->
      <div>
        <h4 class="inv-modal-section-title">
          <i class="fa-solid fa-clock-rotate-left"></i> Recent Transactions
        </h4>
        <div class="inv-timeline" id="invViewTimeline">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-inv-modal="viewStockDetailsModal">Close</button>
    </div>
  </div>
</div>
