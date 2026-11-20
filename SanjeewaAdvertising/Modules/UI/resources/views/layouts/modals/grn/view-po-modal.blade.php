<!-- ==================================================================
     VIEW PURCHASE ORDER (PO) MODAL
     ================================================================== -->
<div class="po-modal-overlay" id="viewPOModal">
  <div class="po-modal po-modal-large" style="max-width: 820px; max-height: 90vh;">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-file-invoice"></i> Purchase Order Document</h3>
      <button type="button" class="modal-close-btn" data-close-grn-modal="viewPOModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="background: var(--surface-2); padding: 18px;">
      <div id="poPrintArea" class="grn-voucher-sheet">
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
            <h2 style="margin: 0; font-size: 18px; color: #1677ff; text-transform: uppercase;">Purchase Order</h2>
            <div style="font-size: 14px; font-weight: bold; margin-top: 4px;" id="poDocNumber">PO-2026-088</div>
            <div style="margin-top: 6px;"><span class="grn-status-badge pending" id="poDocStatus">Pending</span></div>
          </div>
        </div>

        <!-- Meta Table -->
        <table class="grn-voucher-meta-table">
          <tr>
            <td style="width: 15%; color: #666;"><strong>Supplier:</strong></td>
            <td style="width: 35%; font-weight: bold;" id="poDocSupplier">-</td>
            <td style="width: 15%; color: #666;"><strong>Order Date:</strong></td>
            <td style="width: 35%; font-weight: bold;" id="poDocDate">-</td>
          </tr>
          <tr>
            <td style="color: #666;"><strong>Supplier Contact:</strong></td>
            <td style="font-weight: bold;" id="poDocContact">-</td>
            <td style="color: #666;"><strong>Expected Date:</strong></td>
            <td style="font-weight: bold;" id="poDocExpectedDate">-</td>
          </tr>
          <tr>
            <td style="color: #666;"><strong>Created By:</strong></td>
            <td style="font-weight: bold;" id="poDocCreatedBy">Admin User</td>
            <td style="color: #666;"><strong>Instructions:</strong></td>
            <td style="font-style: italic;" id="poDocRemarks">-</td>
          </tr>
        </table>

        <!-- Items Table -->
        <table class="grn-voucher-items-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Material Description</th>
              <th style="width: 80px;">Unit</th>
              <th class="text-right" style="width: 110px;">Ordered Qty</th>
              <th class="text-right" style="width: 110px;">Received Qty</th>
              <th class="text-right" style="width: 120px;">Unit Cost</th>
              <th class="text-right" style="width: 130px;">Total (LKR)</th>
            </tr>
          </thead>
          <tbody id="poDocItemsTbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>

        <!-- Financial Summary -->
        <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
          <div style="min-width: 260px;">
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 15px; font-weight: bold; border-top: 2px solid #1677ff; color: #1677ff;">
              <span>Total PO Amount:</span>
              <strong id="poDocTotal">Rs. 0.00</strong>
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="grn-voucher-signatures">
          <div class="grn-sig-box">Prepared By (Purchasing)</div>
          <div class="grn-sig-box">Authorized Officer Approval</div>
          <div class="grn-sig-box">Supplier Acceptance</div>
        </div>
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="viewPOModal">Close</button>
      <button type="button" class="ant-btn ant-btn-default" id="printPoDocBtn">
        <i class="fa-solid fa-print"></i> Print Purchase Order
      </button>
      <button type="button" class="ant-btn ant-btn-primary" id="poCreateGrnActionBtn">
        <i class="fa-solid fa-truck-ramp-box"></i> Create GRN for this PO
      </button>
    </div>
  </div>
</div>
