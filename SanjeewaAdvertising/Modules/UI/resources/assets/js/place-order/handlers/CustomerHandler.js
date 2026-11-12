/**
 * SanjeewaAdvertising - Customer Handler
 * Manages customer autocomplete search, dropdown interaction,
 * selection binding, and quick customer registration modal.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

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

    this.http = new RequestHandler();

    // Load initial server-rendered customers if available
    this.hydrateServerCustomers();

    this.bindEvents();
  }

  hydrateServerCustomers() {
    if (!Array.isArray(this.customers) || this.customers.length === 0) {
      const serverEl = document.getElementById("serverCustomersData");
      if (serverEl && serverEl.textContent) {
        try {
          const parsed = JSON.parse(serverEl.textContent);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.customers = parsed;
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }

  setCustomers(customers) {
    this.customers = customers || [];
    this.hydrateServerCustomers();
  }

  getSelectedCustomer() {
    return this.selectedCustomer;
  }

  bindEvents() {
    const custSearchInput = document.getElementById("customerSearchInput");
    const custDropdown = document.getElementById("customerDropdown");
    const toggleBtn = document.getElementById("toggleCustomerDropdownBtn");

    if (custSearchInput && custDropdown) {
      // Typing in input filters dropdown
      custSearchInput.addEventListener("input", (e) => {
        this.handleCustomerSearch(e.target.value);
        this.openDropdown();
      });

      // Clicking or focusing input opens dropdown
      custSearchInput.addEventListener("focus", () => {
        this.handleCustomerSearch(custSearchInput.value);
        this.openDropdown();
      });

      custSearchInput.addEventListener("click", () => {
        this.handleCustomerSearch(custSearchInput.value);
        this.openDropdown();
      });

      // Escape key closes dropdown
      custSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeDropdown();
        }
      });

      // Click outside closes dropdown
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".customer-search-wrap")) {
          this.closeDropdown();
        }
      });
    }

    // Toggle arrow button
    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
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
      openAddCustBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeDropdown();
        this.openModal("addCustomerModal");
      });
    }

    const saveNewCustBtn = document.getElementById("saveNewCustomerBtn");
    if (saveNewCustBtn) {
      saveNewCustBtn.addEventListener("click", () => this.handleSaveNewCustomer());
    }
  }

  openDropdown() {
    const dropdown = document.getElementById("customerDropdown");
    const icon = document.getElementById("customerDropdownIcon");
    if (dropdown) dropdown.classList.add("open");
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  }

  closeDropdown() {
    const dropdown = document.getElementById("customerDropdown");
    const icon = document.getElementById("customerDropdownIcon");
    if (dropdown) dropdown.classList.remove("open");
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }

  toggleDropdown() {
    const dropdown = document.getElementById("customerDropdown");
    const searchInput = document.getElementById("customerSearchInput");
    if (dropdown && dropdown.classList.contains("open")) {
      this.closeDropdown();
    } else {
      this.handleCustomerSearch(searchInput?.value || "");
      this.openDropdown();
      if (searchInput) searchInput.focus();
    }
  }

  handleCustomerSearch(query) {
    this.hydrateServerCustomers();
    const q = (query || "").trim().toLowerCase();
    const dropdown = document.getElementById("customerDropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";
    const list = this.customers || [];
    const filtered = q
      ? list.filter((c) =>
          (c.mobile && c.mobile.includes(q)) ||
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
        )
      : list;

    if (filtered.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 11.5px;">
          <i class="fa-solid fa-user-slash" style="font-size: 20px; color: var(--text-muted); margin-bottom: 6px; display: block;"></i>
          No customer found matching "${query}".<br>
          <button type="button" class="po-btn po-btn-primary" style="height: 30px; font-size: 11px; margin-top: 10px; display: inline-flex; align-items: center; gap: 6px;" id="dropdownAddCustomerBtn">
            <i class="fa-solid fa-user-plus"></i> Register New Customer
          </button>
        </div>
      `;
      const btn = dropdown.querySelector("#dropdownAddCustomerBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          this.closeDropdown();
          this.openModal("addCustomerModal");
        });
      }
    } else {
      // Dropdown Header with count
      const header = document.createElement("div");
      header.className = "customer-dropdown-header";
      header.innerHTML = `
        <span><i class="fa-solid fa-users" style="color: var(--po-primary); margin-right: 5px;"></i> ${q ? 'Search Results' : 'Registered Customers'} (${filtered.length})</span>
        <span style="font-size: 10px; color: var(--text-muted);"><i class="fa-solid fa-arrow-pointer"></i> Click to select</span>
      `;
      dropdown.appendChild(header);

      filtered.forEach((cust) => {
        const item = document.createElement("div");
        item.className = "customer-dropdown-item";
        item.innerHTML = `
          <div class="cust-item-info">
            <strong><i class="fa-solid fa-user" style="color: var(--po-primary); font-size: 11px; margin-right: 6px;"></i>${cust.name}</strong>
            <span><i class="fa-solid fa-phone" style="font-size: 10px; margin-right: 4px;"></i>${cust.mobile} ${cust.email ? '&bull; <i class="fa-solid fa-envelope" style="font-size: 10px; margin-right: 2px;"></i>' + cust.email : ''}</span>
          </div>
          <span class="cust-item-badge">#${cust.id}</span>
        `;
        item.addEventListener("click", () => this.selectCustomer(cust));
        dropdown.appendChild(item);
      });
    }
  }

  selectCustomer(cust) {
    this.selectedCustomer = cust;
    const searchWrap = document.getElementById("customerSearchGroup");
    const selectedCard = document.getElementById("selectedCustomerCard");
    const nameElem = document.getElementById("selectedCustName");
    const mobileElem = document.getElementById("selectedCustMobile");
    const idInput = document.getElementById("selectedCustomerId");
    const searchInput = document.getElementById("customerSearchInput");

    if (nameElem) nameElem.textContent = cust.name;
    if (mobileElem) mobileElem.textContent = `${cust.mobile} ${cust.email ? '• ' + cust.email : ''}`;
    if (idInput) idInput.value = cust.id;
    if (searchInput) searchInput.value = `${cust.name} (${cust.mobile})`;

    if (searchWrap) searchWrap.style.display = "none";
    if (selectedCard) selectedCard.style.display = "flex";
    this.closeDropdown();

    this.onCustomerSelected(cust);
  }

  clearSelectedCustomer() {
    this.selectedCustomer = null;
    const searchWrap = document.getElementById("customerSearchGroup");
    const selectedCard = document.getElementById("selectedCustomerCard");
    const searchInput = document.getElementById("customerSearchInput");
    const idInput = document.getElementById("selectedCustomerId");

    if (idInput) idInput.value = "";
    if (searchWrap) searchWrap.style.display = "flex";
    if (selectedCard) selectedCard.style.display = "none";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    this.handleCustomerSearch("");
    this.openDropdown();
    this.onCustomerSelected(null);
  }

  async handleSaveNewCustomer() {
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
    const existing = (this.customers || []).find((c) => c.mobile === mobile);
    if (existing) {
      this.showToast(`Customer with mobile ${mobile} already exists (${existing.name})`, "warning");
      this.selectCustomer(existing);
      this.closeModal("addCustomerModal");
      return;
    }

    const saveBtn = document.getElementById("saveNewCustomerBtn");
    const origText = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const response = await this.http.post("/api/v1/customers", {
        name,
        mobile,
        email: null,
        register_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      });

      const created = response?.data || response;
      const newCust = {
        id: created.id,
        name: created.name || name,
        mobile: created.mobile || mobile,
        address,
        type,
      };

      this.customers.unshift(newCust);
      this.saveCustomers(this.customers);
      this.selectCustomer(newCust);
      this.closeModal("addCustomerModal");
      this.showToast(`Customer "${name}" registered successfully via Customer Module!`, "success");

      // Clear form
      nameInput.value = "";
      mobileInput.value = "";
      if (addressInput) addressInput.value = "";

      this.onCustomerCreated(newCust, this.customers);
    } catch (err) {
      console.error("[CustomerHandler] API registration error:", err);
      const errMsg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        err?.message ||
        "Failed to register customer in Customer Module.";
      this.showToast(errMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origText;
      }
    }
  }
}

export default CustomerHandler;

