<!-- ==========================================================================
     VIEW ORDER MODAL (100% Read-Only) (#viewOrderModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="viewOrderModal" aria-hidden="true" role="dialog" aria-labelledby="viewModalTitle">
  <div class="po-modal po-modal-large" style="max-width: 840px; border-radius: 14px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);">
    <!-- Modal Header -->
    <div class="po-modal-header" style="align-items: center; padding: 18px 24px; background: var(--surface);">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, rgba(22, 119, 255, 0.12) 0%, rgba(22, 119, 255, 0.24) 100%); color: var(--po-orange, #1677ff); display: grid; place-items: center; font-size: 20px; box-shadow: 0 4px 14px rgba(22, 119, 255, 0.15);">
          <i class="fa-solid fa-file-invoice"></i>
        </div>
        <div>
          <h3 id="viewModalTitle" style="margin: 0; font-size: 16.5px; font-weight: 800; color: var(--text); letter-spacing: -0.2px;">Order Details</h3>
          <p style="margin: 3px 0 0; font-size: 11.5px; color: var(--text-muted);">View complete order specifications, customer information &amp; payment breakdown</p>
        </div>
      </div>
      <button type="button" class="modal-close-btn" data-close-modal="viewOrderModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="po-modal-body" style="padding: 20px 24px; gap: 16px; max-height: calc(88vh - 140px); overflow-y: auto;">

      <!-- 1. Top Order Context Banner -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">Order ID:</span>
            <span id="voId" style="font-size: 13.5px; font-weight: 800; color: var(--po-orange, #1677ff); background: rgba(22, 119, 255, 0.08); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(22, 119, 255, 0.2); font-family: monospace;">-</span>
          </div>
          <span style="color: var(--border); font-size: 14px;">|</span>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted);">
            <i class="fa-regular fa-calendar" style="color: var(--po-orange, #1677ff);"></i>
            <span>Placed On:</span>
            <strong id="voDate" style="color: var(--text); font-weight: 700;">-</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="voInvoiceBadge" style="font-size: 11px; font-weight: 700; color: #1677ff; background: rgba(22, 119, 255, 0.08); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(22, 119, 255, 0.2); display: inline-flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-file-invoice"></i> <span id="voInvoiceNo">-</span>
          </span>
          <span id="voOrderStatus" class="status-badge pending">-</span>
          <span id="voPaymentStatus" class="status-badge unpaid">-</span>
        </div>
      </div>

      <!-- 2. Customer & Logistics Details Card (Uniform 2x2 Grid) -->
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--po-orange, #1677ff); letter-spacing: 0.6px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-user-circle"></i>
          <span>Customer &amp; Logistics Details</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;">
          <!-- 1. Customer Name & Mobile -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div id="voCustAvatar" style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%); color: #fff; font-size: 13.5px; font-weight: 800; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(22, 119, 255, 0.25);">
              C
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Customer Name &amp; Mobile</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                <strong id="voCustName" style="font-size: 13.5px; font-weight: 800; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">-</strong>
                <a id="voCustMobileLink" href="#" style="font-size: 11px; color: var(--po-orange, #1677ff); text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; background: rgba(22, 119, 255, 0.08); padding: 2px 8px; border-radius: 4px; white-space: nowrap;">
                  <i class="fa-solid fa-phone" style="font-size: 9.5px;"></i>
                  <span id="voCustMobile">-</span>
                </a>
              </div>
            </div>
          </div>

          <!-- 2. Required Deadline -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-regular fa-clock"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Required Deadline</span>
              <strong class="info-value" id="voDeadline" style="font-size: 13.5px; font-weight: 800; color: #ef4444;">-</strong>
            </div>
          </div>

          <!-- 3. Assigned Staff -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(22, 119, 255, 0.1); color: var(--po-orange, #1677ff); font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-user-gear"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Assigned Staff</span>
              <strong class="info-value" id="voAssigned" style="font-size: 13.5px; font-weight: 700; color: var(--text);">-</strong>
            </div>
          </div>

          <!-- 4. Delivery Method -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-truck-fast"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Method</span>
              <strong class="info-value" id="voDeliveryMethod" style="font-size: 13.5px; font-weight: 700; color: var(--text);">-</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Product Specifications & Printing Dimensions (Uniform 3x2 Grid) -->
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #ff6b00; letter-spacing: 0.6px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-print"></i>
          <span>Printing Specifications &amp; Sizing</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;">
          <!-- Product Name -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(255, 107, 0, 0.1); color: #ff6b00; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Product / Material</span>
              <strong class="info-value" id="voProduct" style="font-size: 13px; font-weight: 800; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">-</strong>
            </div>
          </div>

          <!-- Dimensions -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(255, 107, 0, 0.1); color: #ff6b00; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-ruler-combined"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Dimensions (W × H)</span>
              <strong class="info-value" id="voDimensions" style="font-size: 13px; font-weight: 800; color: #ff6b00; font-family: monospace;">-</strong>
            </div>
          </div>

          <!-- Area -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-chart-area"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Print Area</span>
              <strong class="info-value" id="voArea" style="font-size: 13px; font-weight: 700; color: var(--text);">-</strong>
            </div>
          </div>

          <!-- Quantity -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(100, 116, 139, 0.1); color: var(--text); font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-hashtag"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Quantity</span>
              <strong class="info-value" id="voQuantity" style="font-size: 13.5px; font-weight: 800; color: var(--text);">-</strong>
            </div>
          </div>

          <!-- Unit Price -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-tag"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Unit Rate</span>
              <strong class="info-value" id="voUnitPrice" style="font-size: 13px; font-weight: 700; color: var(--text);">-</strong>
            </div>
          </div>

          <!-- Design Status -->
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; min-height: 64px; box-sizing: border-box;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(147, 51, 234, 0.1); color: #9333ea; font-size: 15px; display: grid; place-items: center; flex-shrink: 0;">
              <i class="fa-solid fa-pen-nib"></i>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
              <span class="info-label" style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Design Status</span>
              <strong class="info-value" id="voDesignStatus" style="font-size: 12.5px; font-weight: 700; color: var(--text);">-</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Financial Breakdown & Payment Status (Uniform 3x1 Grid) -->
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 16px 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #10b981; letter-spacing: 0.6px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-wallet"></i>
            <span>Financial Breakdown</span>
          </div>
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); background: var(--surface); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border);">Currency: LKR (Rs.)</span>
        </div>

        <!-- 3 Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px;">
          <!-- Order Total -->
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); min-height: 72px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <span class="info-label" style="font-size: 10.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Total Order Amount</span>
            <strong class="info-value" id="voTotal" style="font-size: 16px; font-weight: 900; color: var(--text); display: block;">Rs. 0.00</strong>
          </div>

          <!-- Total Paid -->
          <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 12px 14px; text-align: center; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <span class="info-label" style="font-size: 10.5px; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Total Paid</span>
            <strong class="info-value" id="voPaid" style="font-size: 16px; font-weight: 900; color: #10b981; display: block;">Rs. 0.00</strong>
          </div>

          <!-- Remaining Balance -->
          <div id="voBalanceBox" style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.28); border-radius: 8px; padding: 12px 14px; text-align: center; min-height: 72px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
            <span class="info-label" style="font-size: 10.5px; color: #ef4444; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Remaining Balance</span>
            <strong class="info-value" id="voBalance" style="font-size: 16px; font-weight: 900; color: #ef4444; display: block;">Rs. 0.00</strong>
          </div>
        </div>

        <!-- Visual Payment Progress Bar -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11.5px;">
            <span style="font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px;">Payment Settlement Progress</span>
            <span id="voPaymentPercent" style="font-weight: 800; color: var(--text);">0%</span>
          </div>
          <div style="width: 100%; height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden; border: 1px solid var(--border);">
            <div id="voPaymentProgress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #10b981 0%, #059669 100%); border-radius: 4px; transition: width 0.4s ease;"></div>
          </div>
        </div>
      </div>

      <!-- 5. Order Notes & Special Instructions -->
      <div style="background: var(--surface); border: 1px dashed var(--border); border-radius: 10px; padding: 12px 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-regular fa-comment-dots" style="color: #ff6b00;"></i>
          <span>Special Instructions / Remarks</span>
        </div>
        <p id="voNotes" style="margin: 0; font-size: 12.5px; color: var(--text); line-height: 1.5; font-style: italic; white-space: pre-wrap;">No additional notes or instructions provided.</p>
      </div>

    </div>

    <!-- Modal Footer -->
    <div class="po-modal-footer" style="padding: 14px 24px; background: var(--surface); justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <button type="button" id="voBtnHistory" class="po-btn po-btn-secondary" style="height: 34px; padding: 0 14px; font-size: 12px; font-weight: 700; border-radius: 6px;">
          <i class="fa-solid fa-clock-rotate-left"></i> Payment History
        </button>
        <button type="button" id="voBtnAddPayment" class="po-btn" style="height: 34px; padding: 0 14px; font-size: 12px; font-weight: 700; border-radius: 6px; background: #10b981; color: #fff; border: 1px solid #059669;">
          <i class="fa-solid fa-plus"></i> Add Payment
        </button>
        <button type="button" id="voBtnEditOrder" class="po-btn po-btn-secondary" style="height: 34px; padding: 0 14px; font-size: 12px; font-weight: 700; border-radius: 6px;">
          <i class="fa-solid fa-pen-to-square"></i> Edit Order
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" class="po-btn po-btn-secondary" data-close-modal="viewOrderModal" style="height: 34px; padding: 0 18px; font-size: 12px; font-weight: 700; border-radius: 6px;">
          Close
        </button>
      </div>
    </div>
  </div>
</div>
