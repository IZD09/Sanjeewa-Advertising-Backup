<!-- ==================================================================
     REGISTER NEW SUPPLIER MODAL
     ================================================================== -->
<div class="po-modal-overlay" id="registerSupplierModal">
  <div class="po-modal" style="max-width: 520px; max-height: 90vh;">
    <div class="po-modal-header">
      <h3 id="registerSupplierModalTitle"><i class="fa-solid fa-truck-field" style="color: #1677ff;"></i> Register New Supplier / Vendor</h3>
      <button type="button" class="modal-close-btn" data-close-grn-modal="registerSupplierModal" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="gap: 14px;">
      <!-- Supplier / Company Name -->
      <div class="po-field" style="margin: 0;">
        <label class="po-label" for="newSupName">
          <span>Company / Business Name <span class="req">*</span></span>
        </label>
        <input type="text" id="newSupName" name="name" maxlength="100" autocomplete="organization" class="grn-inline-input" placeholder="E.g. PrintCare Lanka (Pvt) Ltd" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <!-- Phone Number / Mobile -->
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="newSupPhone">
            <span>Mobile / Phone No <span class="req">*</span></span>
          </label>
          <input type="text" id="newSupPhone" name="mobile" maxlength="15" autocomplete="tel" class="grn-inline-input" placeholder="E.g. 0771234567" required>
        </div>

        <!-- Email -->
        <div class="po-field" style="margin: 0;">
          <label class="po-label" for="newSupEmail">
            <span>Email Address</span>
          </label>
          <input type="email" id="newSupEmail" name="email" maxlength="100" autocomplete="email" class="grn-inline-input" placeholder="E.g. orders@supplier.lk">
        </div>
      </div>

      <!-- Bank Account -->
      <div class="po-field" style="margin: 0;">
        <label class="po-label" for="newSupBankAccount">
          <span>Bank Account Details</span>
        </label>
        <input type="text" id="newSupBankAccount" name="bank_account" maxlength="50" class="grn-inline-input" placeholder="E.g. BOC - 0019283746 (Colombo 03)">
      </div>
    </div>

    <div class="po-modal-footer">
      <button type="button" class="ant-btn ant-btn-default" data-close-grn-modal="registerSupplierModal">Cancel</button>
      <button type="button" class="ant-btn ant-btn-primary" id="saveNewSupplierBtn">
        <i class="fa-solid fa-user-check"></i> Save & Register Supplier
      </button>
    </div>
  </div>
</div>
