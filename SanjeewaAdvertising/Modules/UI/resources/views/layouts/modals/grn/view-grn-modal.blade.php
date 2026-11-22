<!-- ==========================================================================
     VIEW / PRINT GRN VOUCHER MODAL
     ========================================================================== -->
<div class="po-modal-overlay" id="viewGrnModal" style="z-index: 1050;">
  <div class="po-modal po-modal-large" style="max-width: 820px; max-height: 90vh;">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-file-invoice"></i> Goods Received Note (GRN) Document</h3>
      <button type="button" class="modal-close-btn" data-close-grn-modal="viewGrnModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="background: var(--surface-2); padding: 18px;">
      <div id="grnPrintArea" class="grn-voucher-sheet">
        @php
          $grnVoucherSettings = \Modules\UI\Http\Controllers\SettingsController::getAppSettings();
          $grnBrandParts = explode(' ', trim($grnVoucherSettings['shop_name'] ?? 'Sanjeewa Advertising'), 2);
        @endphp
        <!-- Header -->
        <div class="grn-voucher-header">
          <div class="grn-voucher-brand">
            <strong>{{ $grnBrandParts[0] ?? 'Sanjeewa' }}</strong>
            <span>{{ strtoupper($grnBrandParts[1] ?? 'ADVERTISING & PRINTING') }}</span>
            <div style="font-size: 11px; color: #666; margin-top: 3px;">
              {{ $grnVoucherSettings['shop_address'] ?? 'No. 42 Main Street, Colombo 03, Sri Lanka' }} &bull; Tel: {{ $grnVoucherSettings['shop_phone'] ?? '+94 11 234 5678' }}
            </div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 18px; color: #1677ff; text-transform: uppercase;">Goods Received Note</h2>
            <div style="font-size: 14px; font-weight: bold; margin-top: 4px;" id="grnDocNumber">GRN-2610-001</div>
            <div style="margin-top: 6px;"><span class="grn-status-badge completed" id="grnDocStatus">Completed</span></div>
          </div>
        </div>

        <!-- Meta Table -->
        <table class="grn-voucher-meta-table">
          <tr>
            <td style="width: 15%; color: #666;"><strong>Supplier:</strong></td>
            <td style="width: 35%; font-weight: bold;" id="grnDocSupplier">-</td>
            <td style="width: 15%; color: #666;"><strong>Received Date:</strong></td>
            <td style="width: 35%; font-weight: bold;" id="grnDocDate">-</td>
          </tr>
          <tr>
            <td style="color: #666;"><strong>Supplier Contact:</strong></td>
            <td style="font-weight: bold;" id="grnDocContact">-</td>
            <td style="color: #666;"><strong>Purchase Order:</strong></td>
            <td style="font-weight: bold;" id="grnDocPO">-</td>
          </tr>
          <tr>
            <td style="color: #666;"><strong>Received By:</strong></td>
            <td style="font-weight: bold;" id="grnDocReceivedBy">-</td>
            <td style="color: #666;"><strong>Status:</strong></td>
            <td style="font-weight: bold;"><span id="grnDocStatusTable" class="grn-status-badge completed">Completed</span></td>
          </tr>
        </table>

        <!-- Items Table -->
        <table class="grn-voucher-items-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Item Description</th>
              <th style="width: 120px;">Batch ID</th>
              <th style="width: 80px;">Unit</th>
              <th class="text-right" style="width: 90px;">Qty</th>
              <th class="text-right" style="width: 110px;">Unit Cost</th>
              <th class="text-right" style="width: 120px;">Total (LKR)</th>
            </tr>
          </thead>
          <tbody id="grnDocItemsTbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>

        <!-- Financial Summary -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 14px;">
          <div style="max-width: 55%; font-size: 12px; color: #555;">
            <strong>Remarks:</strong>
            <p id="grnDocRemarks" style="margin: 4px 0 0; font-style: italic;">Consignment inspected upon receipt.</p>
          </div>
          <div style="min-width: 250px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
              <span>Sub Total:</span>
              <strong id="grnDocSubTotal">Rs. 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
              <span>Discount:</span>
              <strong id="grnDocDiscount">Rs. 0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px; font-weight: bold; border-top: 2px solid #1677ff; margin-top: 4px; color: #1677ff;">
              <span>Net Total:</span>
              <strong id="grnDocNetTotal">Rs. 0.00</strong>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="grn-voucher-signatures">
          <div class="grn-sig-box">Storekeeper / Received By</div>
          <div class="grn-sig-box">Stock Auditor / Inspected By</div>
          <div class="grn-sig-box">Authorized Officer Approval</div>
        </div>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="viewGrnModal">Close</button>
      <button type="button" class="ant-btn ant-btn-primary" id="printGrnDocBtn">
        <i class="fa-solid fa-print"></i> Print GRN Voucher
      </button>
    </div>
  </div>
</div>
