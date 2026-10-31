/**
 * SanjeewaAdvertising - Customer Handler
 * Manages customer autocomplete search, dropdown interaction,
 * selection binding, and quick customer registration modal.
 */

export class CustomerHandler {
  /**
   * @param {Object} options
   * @param {Array} options.customers
   * @param {Function} options.onCustomerSelected
   * @param {Function} options.onCustomerCreated
   * @param {Function} options.showToast
   * @param {Function} options.openModal
   * @param {Function} options.closeModal
   * @param {Function} options.saveCustomers
   */
  constructor(options = {}) {
    this.customers = options.customers || [];
    this.selectedCustomer = null;
    this.onCustomerSelected = options.onCustomerSelected || (() => {});
    this.onCustomerCreated = options.onCustomerCreated || (() => {});
    this.showToast = options.showToast || (() => {});
    this.openModal = options.openModal || (() => {});
    this.closeModal = options.closeModal || (() => {});
    this.saveCustomers = options.saveCustomers || (() => {});

    this.bindEvents();
  }

  setCustomers(customers) {
    this.customers = customers || [];
  }

  getSelectedCustomer() {
    return this.selectedCustomer;
  }

  bindEvents() {
    // Customer Search Autocomplete
    const custSearchInput = document.getElementById("customerSearchInput");
    const custDropdown = document.getElementById("customerDropdown");
    if (custSearchInput && custDropdown) {
      custSearchInput.addEventListener("input", (e) => this.handleCustomerSearch(e.target.value));
      custSearchInput.addEventListener("focus", () => this.handleCustomerSearch(custSearchInput.value));
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".customer-search-wrap")) {
          custDropdown.classList.remove("open");
        }
      });
    }

    // Clear selected customer button
    const clearCustBtn = document.getElementById("clearCustomerBtn");
    if (clearCustBtn) {
      clearCustBtn.addEventListener("click", () => this.clearSelectedCustomer());
    }

    // New Customer Quick Modal triggers
    const openAddCustBtn = document.getElementById("openAddCustBtn");
    if (openAddCustBtn) {
      openAddCustBtn.addEventListener("click", () => this.openModal("addCustomerModal"));
    }
    const saveNewCustBtn = document.getElementById("saveNewCustomerBtn");
    if (saveNewCustBtn) {
      saveNewCustBtn.addEventListener("click", () => this.handleSaveNewCustomer());
    }
  }

  handleCustomerSearch(query) {
    const q = (query || "").trim().toLowerCase();
    const dropdown = document.getElementById("customerDropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    const filtered = (this.customers || []).filter(c =>
      (c.mobile && c.mobile.includes(q)) || (c.name && c.name.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 11.5px;">
          No customer found for "${query}".<br>
          <button type="button" class="po-btn po-btn-secondary" style="height: 30px; font-size: 11px; margin-top: 8px;" id="dropdownAddCustomerBtn">
            <i class="fa-solid fa-user-plus"></i> Add New Customer
          </button>
        </div>
      `;
      const btn = dropdown.querySelector("#dropdownAddCustomerBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          dropdown.classList.remove("open");
          this.openModal("addCustomerModal");
        });
      }
    } else {
      filtered.forEach(cust => {
        const item = document.createElement("div");
        item.className = "customer-dropdown-item";
        item.innerHTML = `
          <div class="cust-item-info">
            <strong>${cust.name}</strong>
            <span><i class="fa-solid fa-phone"></i> ${cust.mobile} &bull; ${cust.address || "Sri Lanka"}</span>
          </div>
          <span class="cust-item-badge">${cust.type || "Regular"}</span>
        `;
        item.addEventListener("click", () => this.selectCustomer(cust));
        dropdown.appendChild(item);
      });
    }

    dropdown.classList.add("open");
  }

  selectCustomer(cust) {
    this.selectedCustomer = cust;
    const searchWrap = document.getElementById("customerSearchGroup");
    const selectedCard = document.getElementById("selectedCustomerCard");
    const nameElem = document.getElementById("selectedCustName");
    const mobileElem = document.getElementById("selectedCustMobile");
    const dropdown = document.getElementById("customerDropdown");

    if (nameElem) nameElem.textContent = cust.name;
    if (mobileElem) mobileElem.textContent = `${cust.mobile} (${cust.address || "Sri Lanka"})`;
    if (searchWrap) searchWrap.style.display = "none";
    if (selectedCard) selectedCard.style.display = "flex";
    if (dropdown) dropdown.classList.remove("open");

    this.onCustomerSelected(cust);
  }

  clearSelectedCustomer() {
    this.selectedCustomer = null;
    const searchWrap = document.getElementById("customerSearchGroup");
    const selectedCard = document.getElementById("selectedCustomerCard");
    const searchInput = document.getElementById("customerSearchInput");

    if (searchWrap) searchWrap.style.display = "flex";
    if (selectedCard) selectedCard.style.display = "none";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    this.onCustomerSelected(null);
  }

  handleSaveNewCustomer() {
    const nameInput = document.getElementById("newCustName");
    const mobileInput = document.getElementById("newCustMobile");
    const addressInput = document.getElementById("newCustAddress");
    const typeSelect = document.getElementById("newCustType");

    if (!nameInput || !mobileInput) return;

    const name = nameInput.value.trim();
    const mobile = mobileInput.value.trim();
    const address = addressInput ? addressInput.value.trim() || "Sri Lanka" : "Sri Lanka";
    const type = typeSelect ? typeSelect.value : "Regular";

    if (!name || !mobile) {
      this.showToast("Please enter customer name and mobile number", "error");
      return;
    }

    // Check duplicate mobile
    const existing = (this.customers || []).find(c => c.mobile === mobile);
    if (existing) {
      this.showToast(`Customer with mobile ${mobile} already exists (${existing.name})`, "warning");
      this.selectCustomer(existing);
      this.closeModal("addCustomerModal");
      return;
    }

    const newCust = {
      id: `CUST-${String((this.customers || []).length + 1).padStart(3, "0")}`,
      name,
      mobile,
      address,
      type
    };

    this.customers.unshift(newCust);
    this.saveCustomers(this.customers);
    this.selectCustomer(newCust);
    this.closeModal("addCustomerModal");
    this.showToast(`Customer "${name}" added successfully!`, "success");

    // Clear form
    nameInput.value = "";
    mobileInput.value = "";
    if (addressInput) addressInput.value = "";

    this.onCustomerCreated(newCust, this.customers);
  }
}

export default CustomerHandler;
