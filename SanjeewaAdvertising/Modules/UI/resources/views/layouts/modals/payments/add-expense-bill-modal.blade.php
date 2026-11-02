<div class="pay-modal-backdrop" id="modalAddExpenseBill">
  <div class="pay-modal-card">
    <div class="pay-modal-header">
      <h3><i class="fa-solid fa-bolt-lightning" style="color: #f59e0b;"></i> Add Operating Expense Bill (නව බිල්පතක්)</h3>
      <button type="button" class="pay-modal-close" data-close-pay-modal aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="pay-modal-body">
      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label">Expense Category (වියදම් වර්ගය) *</label>
          <select id="modalExpCategory" class="pay-select-field" required>
            <option value="Electricity" selected>⚡ Electricity (CEB / LECO විදුලි බිල)</option>
            <option value="Water Board">💧 Water Board (NWSDB ජල බිල)</option>
            <option value="Internet & Fiber">📶 Internet &amp; Fiber (SLT / Dialog අන්තර්ජාල)</option>
            <option value="Shop Rent">🏢 Shop / Factory Rent (කුලිය)</option>
            <option value="Mobile & Telephone">📱 Mobile &amp; Telephone (දුරකථන)</option>
            <option value="Maintenance & Other">🔧 Machine Maintenance / Other (නඩත්තු)</option>
          </select>
        </div>
        <div class="pay-field">
          <label class="pay-label">Billing Month (අදාළ මාසය) *</label>
          <input type="month" id="modalExpMonth" class="pay-input" value="2026-10" required>
        </div>
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label">Bill / Service Title (බිල්පතේ නම) *</label>
          <input type="text" id="modalExpTitle" class="pay-input" placeholder="E.g. CEB 3-Phase Workshop Electricity" required>
        </div>
        <div class="pay-field">
          <label class="pay-label">Provider / Institution (ආයතනය)</label>
          <input type="text" id="modalExpProvider" class="pay-input" placeholder="E.g. Ceylon Electricity Board">
        </div>
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label">Account / Connection Number (ගිණුම් අංකය)</label>
          <input type="text" id="modalExpAccountNo" class="pay-input" placeholder="E.g. 042-881-9921">
        </div>
        <div class="pay-field">
          <label class="pay-label">Due Date (ගෙවිය යුතු අවසන් දිනය) *</label>
          <input type="date" id="modalExpDueDate" class="pay-input" required>
        </div>
      </div>

      <div class="pay-form-grid">
        <div class="pay-field">
          <label class="pay-label">Bill Amount (බිල්පත් මුදල - Rs.) *</label>
          <input type="number" id="modalExpAmount" class="pay-input" min="1" step="50" placeholder="0.00" required>
        </div>
        <div class="pay-field">
          <label class="pay-label">Initial Status (තත්ත්වය) *</label>
          <select id="modalExpInitialStatus" class="pay-select-field">
            <option value="Pending" selected>Pending (මාසේ අන්තිමට ගෙවීමට ඇති)</option>
            <option value="Paid">Paid (දැනටමත් ගෙවා අවසන්)</option>
          </select>
        </div>
      </div>

      <div class="pay-field">
        <label class="pay-label">Notes / Meter Reading (සටහන්)</label>
        <input type="text" id="modalExpNotes" class="pay-input" placeholder="E.g. Meter reading 45,210 units / Press room AC bill">
      </div>
    </div>
    <div class="pay-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-pay-modal>Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="btnSaveExpenseBill" style="background: linear-gradient(135deg, #f59e0b, #d97706); border-color: #d97706;">
        <i class="fa-solid fa-save"></i> Save Bill (බිල්පත සුරකින්න)
      </button>
    </div>
  </div>
</div>