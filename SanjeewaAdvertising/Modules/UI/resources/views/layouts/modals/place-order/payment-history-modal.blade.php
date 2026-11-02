<!-- ==========================================================================
     PAYMENT HISTORY MODAL (#paymentHistoryModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="paymentHistoryModal">
  <div class="po-modal po-modal-large">
    <div class="po-modal-header">
      <h3 id="histModalTitle"><i class="fa-solid fa-clock-rotate-left"></i> Payment History</h3>
      <button type="button" class="modal-close-btn" data-close-modal="paymentHistoryModal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="po-modal-body">
      <div id="histOrderInfo" style="font-size: 12px; color: var(--text-muted); background: var(--surface-2); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);"></div>

      <div class="po-table-responsive">
        <table class="history-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Inst #</th>
              <th>Date</th>
              <th>Amount (Rs.)</th>
              <th>Method</th>
              <th>Received By</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="historyTableBody"></tbody>
        </table>
      </div>
    </div>
    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-modal="paymentHistoryModal">Close</button>
    </div>
  </div>
</div>

