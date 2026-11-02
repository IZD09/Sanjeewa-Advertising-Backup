<div class="pay-modal-backdrop" id="modalRecordBillPayment">
    <div class="pay-modal-card">
      <div class="pay-modal-header pay-modal-header-bill">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 9px; background: rgba(245, 158, 11, 0.12); color: #f59e0b; display: grid; place-items: center; font-size: 18px;">
            <i class="fa-solid fa-bolt-lightning"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--text);">Record Bill Payment</h3>
            <p style="margin: 2px 0 0; font-size: 11px; color: var(--text-muted);">Monthly Operating &amp; Overhead Utility Settlements (මෙහෙයුම් බිල්පත් ගෙවීම)</p>
          </div>
        </div>
        <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="pay-modal-body">
        <!-- 1. Select Bill Mode -->
        <div class="pay-field">
          <label class="pay-label" for="billModalSelectExisting">
            <i class="fa-solid fa-receipt" style="color: #f59e0b; margin-right: 4px;"></i> Select Bill to Settle (ගෙවිය යුතු බිල්පත තෝරන්න) *
          </label>
          <select id="billModalSelectExisting" class="pay-select-field">
            <!-- Dynamically populated with pending bills and '+ New Bill' option -->
          </select>
        </div>

        <!-- Selected Bill Live Info Box (shown if existing bill selected) -->
        <div id="billModalExistingInfoBox" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; display: none;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div>
              <span class="exp-badge" id="billModalInfoCatBadge" style="font-size: 11px; margin-bottom: 4px; display: inline-block;">Category</span>
              <div id="billModalInfoTitle" style="font-size: 14px; font-weight: 800; color: var(--text);">-</div>
              <div id="billModalInfoMeta" style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">Provider • Account #</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Amount Due</span>
              <div id="billModalInfoDueAmount" style="font-size: 17px; font-weight: 900; color: #ef4444; margin-top: 2px;">Rs. 0.00</div>
            </div>
          </div>
        </div>

        <!-- Direct / New Bill Fields (shown if user selects '+ Direct Overhead Bill') -->
        <div id="billModalDirectFields" style="display: none; flex-direction: column; gap: 14px; background: var(--surface-2); border: 1px dashed var(--border); border-radius: 10px; padding: 14px 16px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #f59e0b; text-transform: uppercase;">
            <i class="fa-solid fa-plus-circle"></i> Direct Utility / Overhead Bill Details
          </div>
          <div class="pay-form-grid">
            <div class="pay-field">
              <label class="pay-label" for="billModalDirectCategory">Expense Category *</label>
              <select id="billModalDirectCategory" class="pay-select-field">
                <option value="Electricity">⚡ Electricity (විදුලි බිල)</option>
                <option value="Water Board">💧 Water Board (ජල බිල)</option>
                <option value="Internet & Fiber">📶 Internet &amp; Fiber (අන්තර්ජාල)</option>
                <option value="Shop Rent">🏢 Shop Rent (කුලිය)</option>
                <option value="Mobile & Telephone">📱 Mobile &amp; Telephone</option>
                <option value="Maintenance & Other">🔧 Maintenance &amp; Other</option>
              </select>
            </div>
            <div class="pay-field">
              <label class="pay-label" for="billModalDirectMonth">Billing Month *</label>
              <input type="month" id="billModalDirectMonth" class="pay-input" value="2026-10">
            </div>
          </div>
          <div class="pay-form-grid">
            <div class="pay-field">
              <label class="pay-label" for="billModalDirectTitle">Bill / Service Title *</label>
              <input type="text" id="billModalDirectTitle" class="pay-input" placeholder="E.g. CEB Factory Electricity">
            </div>
            <div class="pay-field">
              <label class="pay-label" for="billModalDirectAccount">Provider / Account No</label>
              <input type="text" id="billModalDirectAccount" class="pay-input" placeholder="E.g. CEB / A/C 042-881-9921">
            </div>
          </div>
        </div>

        <!-- 2. Paid Amount & Date -->
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label" for="billModalPaidAmount">
              <i class="fa-solid fa-money-bill" style="color: #10b981; margin-right: 4px;"></i> Paid Amount (Rs.) *
            </label>
            <input type="number" id="billModalPaidAmount" class="pay-input" placeholder="0.00" min="1" step="50" required>
          </div>
          <div class="pay-field">
            <label class="pay-label" for="billModalPaidDate">
              <i class="fa-solid fa-calendar-day" style="color: #f59e0b; margin-right: 4px;"></i> Payment Date (ගෙවූ දිනය) *
            </label>
            <input type="date" id="billModalPaidDate" class="pay-input" required>
          </div>
        </div>

        <!-- 3. Payment Method -->
        <div class="pay-field">
          <label class="pay-label" for="billModalPaidMethod">
            <i class="fa-solid fa-wallet" style="color: #f59e0b; margin-right: 4px;"></i> Payment Method (ගෙවූ ක්‍රමවේදය) *
          </label>
          <select id="billModalPaidMethod" class="pay-select-field">
            <option value="Bank Transfer" selected>🏦 Bank Transfer / Online Banking (බැංකු හුවමාරු)</option>
            <option value="Cash">💵 Cash (මුදල්)</option>
            <option value="Online / QR">📱 Online / LankaQR (ඔන්ලයින්)</option>
            <option value="Card">💳 Corporate Debit / Credit Card (කාඩ්පත්)</option>
            <option value="Check">🧾 Cheque (චෙක්පත්)</option>
          </select>
        </div>

        <!-- 4. Reference and Note -->
        <div class="pay-field">
          <label class="pay-label" for="billModalPaidRef">Transaction Ref / Slip # (ස්ලිප් / Ref අංකය)</label>
          <input type="text" id="billModalPaidRef" class="pay-input" placeholder="E.g. BOC-TXN-99812 / SLT-SLIP-4521">
        </div>

        <div class="pay-field">
          <label class="pay-label" for="billModalPaidNotes">Settlement Narration / Notes (සටහන්)</label>
          <input type="text" id="billModalPaidNotes" class="pay-input" placeholder="E.g. Paid online via Commercial Bank app">
        </div>
      </div>

      <div class="pay-modal-footer">
        <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
        <button type="button" class="po-btn pay-action-btn pay-btn-bill" id="btnConfirmSaveBillPayment">
          <i class="fa-solid fa-check-double"></i> Confirm Bill Payment (ගෙවීම තහවුරු කරන්න)
        </button>
      </div>
    </div>
  </div>