<!-- ==========================================================================
     REGISTER NEW CUSTOMER MODAL (#addCustomerModal)
     ========================================================================== -->
<div class="po-modal-overlay" id="addCustomerModal">
  <div class="po-modal" style="max-width: 480px;">
    <div class="po-modal-header">
      <h3><i class="fa-solid fa-user-plus"></i> Register New Customer</h3>
      <button type="button" class="modal-close-btn" data-close-modal="addCustomerModal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="po-modal-body">
      <div class="po-field">
        <label class="po-label" for="newCustName"><span>Customer Name <span class="req">*</span></span></label>
        <input type="text" id="newCustName" class="po-input" placeholder="E.g. Mahela Jayawardena" required>
      </div>
      <div class="po-field">
        <label class="po-label" for="newCustMobile"><span>Mobile Number <span class="req">*</span></span></label>
        <input type="text" id="newCustMobile" class="po-input" placeholder="E.g. 0771234567" required>
      </div>
      <div class="po-field">
        <label class="po-label" for="newCustAddress">Address / City</label>
        <input type="text" id="newCustAddress" class="po-input" placeholder="E.g. Colombo 05">
      </div>
      <div class="po-field">
        <label class="po-label" for="newCustType">Customer Category</label>
        <select id="newCustType" class="po-select">
          <option value="Regular" selected>Regular Walk-in</option>
          <option value="Corporate">Corporate / Agency</option>
          <option value="VIP">VIP Client</option>
        </select>
      </div>
    </div>
    <div class="po-modal-footer">
      <button type="button" class="po-btn po-btn-secondary" data-close-modal="addCustomerModal">Cancel</button>
      <button type="button" class="po-btn po-btn-primary" id="saveNewCustomerBtn">
        <i class="fa-solid fa-user-check"></i> Register Customer
      </button>
    </div>
  </div>
</div>

