<div class="pay-modal-backdrop" id="modalAddExpenseBill">
  <div class="pay-modal-card">
    <div class="pay-modal-header">
      <h3><i class="fa-solid fa-bolt-lightning" style="color: #f59e0b;"></i> Add Operating Expense Bill</h3>
      <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="pay-modal-body">
      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label" for="modalExpCategory">Expense Category *</label>
          <select id="modalExpCategory" name="exp_category" class="pay-select-field" required>
            <option value="1" data-name="Electricity Utility" selected>⚡ Electricity Utility</option>
            <option value="2" data-name="Water Utility">💧 Water Utility</option>
            <option value="3" data-name="Internet & Telephone">📶 Internet &amp; Telephone</option>
            <option value="4" data-name="Shop Rent / Lease">🏢 Shop Rent / Lease</option>
            <option value="5" data-name="Machine Maintenance & Parts">🔧 Machine Maintenance &amp; Parts</option>
            <option value="6" data-name="Staff Salary & Wages">👥 Staff Salary &amp; Wages</option>
            <option value="7" data-name="Office Supplies & Stationery">📦 Office Supplies &amp; Stationery</option>
            <option value="8" data-name="Transportation & Fuel">🚗 Transportation &amp; Fuel</option>
            <option value="9" data-name="Marketing & Advertising">📢 Marketing &amp; Advertising</option>
            <option value="10" data-name="Refreshments & Welfare">☕ Refreshments &amp; Welfare</option>
            <option value="11" data-name="Municipal Taxes & Licenses">🏛️ Municipal Taxes &amp; Licenses</option>
            <option value="12" data-name="Other Operating Expenses">📋 Other Operating Expenses</option>
          </select>
        </div>
        <div class="pay-field">
          <label class="pay-label" for="modalExpMonth">Billing Month *</label>
          <input type="month" id="modalExpMonth" name="exp_month" class="pay-input" value="2026-10" required>
        </div>
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label" for="modalExpTitle">Bill / Service Title *</label>
          <input type="text" id="modalExpTitle" name="exp_title" class="pay-input" placeholder="E.g. CEB 3-Phase Workshop Electricity" required>
        </div>
        <div class="pay-field">
          <label class="pay-label" for="modalExpProvider">Provider / Institution</label>
          <input type="text" id="modalExpProvider" name="exp_provider" class="pay-input" placeholder="E.g. Ceylon Electricity Board">
        </div>
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label" for="modalExpAccountNo">Account / Connection Number</label>
          <input type="text" id="modalExpAccountNo" name="exp_account_no" class="pay-input" placeholder="E.g. 042-881-9921">
        </div>
        <div class="pay-field">
          <label class="pay-label" for="modalExpDueDate">Due Date *</label>
          <input type="date" id="modalExpDueDate" name="exp_due_date" class="pay-input" required>
        </div>
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label" for="modalExpAmount">Bill Amount (Rs.) *</label>
          <input type="number" id="modalExpAmount" name="exp_amount" class="pay-input" min="1" step="50" placeholder="0.00" required>
        </div>
        <div class="pay-field">
          <label class="pay-label" for="modalExpInitialStatus">Initial Status *</label>
          <select id="modalExpInitialStatus" name="exp_initial_status" class="pay-select-field">
            <option value="Pending" selected>Pending (Due at month-end)</option>
            <option value="Paid">Paid (Already settled)</option>
          </select>
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-label" for="modalExpNotes">Notes / Meter Reading</label>
        <input type="text" id="modalExpNotes" name="exp_notes" class="pay-input" placeholder="E.g. Meter reading 45,210 units / Press room AC bill">
      </div>
    </div>
    <div class="pay-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="btnSaveExpenseBill" style="background: linear-gradient(135deg, #f59e0b, #d97706); border-color: #d97706;">
        <i class="fa-solid fa-save"></i> Save Bill
      </button>
    </div>
  </div>
</div>