<!-- ==========================================================================
     OFFICIAL PAYMENT RECEIPT MODAL (#receiptModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="receiptModal">
  <div class="po-modal" style="max-width: 580px;">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-print"></i> Official Payment Receipt</h3>
      <button type="button" class="modal-close-btn" data-close-modal="receiptModal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="po-modal-body" style="background: var(--surface-2); padding: 16px;">
      <div class="receipt-paper" id="printableReceipt">
        <div class="receipt-header">
          <h2>SANJEEWA ADVERTISING</h2>
          <p>Digital Large Format & Offset Printing Solutions</p>
          <p>No. 42 Main Street, Colombo 03, Sri Lanka &bull; Tel: +94 11 234 5678</p>
          <span class="receipt-badge-title">OFFICIAL PAYMENT RECEIPT</span>
        </div>

        <table class="receipt-details-table">
          <tr><td><strong>Receipt No:</strong></td><td class="strong" id="rcptPaymentId">-</td></tr>
          <tr><td><strong>Order ID:</strong></td><td class="strong" id="rcptOrderId">-</td></tr>
          <tr><td><strong>Date:</strong></td><td class="strong" id="rcptDate">-</td></tr>
          <tr><td><strong>Customer Name:</strong></td><td class="strong" id="rcptCustName">-</td></tr>
          <tr><td><strong>Mobile No:</strong></td><td class="strong" id="rcptCustMobile">-</td></tr>
          <tr><td><strong>Product & Specs:</strong></td><td class="strong" id="rcptProduct">-</td></tr>
          <tr><td><strong>Installment:</strong></td><td class="strong" id="rcptInstallment">-</td></tr>
          <tr><td><strong>Payment Method:</strong></td><td class="strong" id="rcptMethod">-</td></tr>
          <tr><td><strong>Received By:</strong></td><td class="strong" id="rcptReceivedBy">-</td></tr>
        </table>

        <div class="receipt-financials">
          <div class="receipt-fin-row"><span>Total Order Value:</span><strong id="rcptTotalAmount">Rs. 0.00</strong></div>
          <div class="receipt-fin-row major"><span>Amount Received (This Installment):</span><span id="rcptPaidThis">Rs. 0.00</span></div>
          <div class="receipt-fin-row" style="color: var(--red); font-weight: 700; margin-top: 4px;"><span>Remaining Balance:</span><span id="rcptRemainingBalance">Rs. 0.00</span></div>
        </div>

        <div class="receipt-signatures">
          <div class="receipt-sig-line">Customer Signature</div>
          <div class="receipt-sig-line">Authorized Cashier</div>
        </div>

        <div class="receipt-footer">
          Thank you for your business! Please keep this receipt for collection.
        </div>
      </div>
    </div>
    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-modal="receiptModal">Close</button>
      <button type="button" class="po-btn po-btn-primary" onclick="window.placeOrderApp.triggerPrintReceipt()">
        <i class="fa-solid fa-print"></i> Print Receipt Now
      </button>
    </div>
  </div>
</div>

