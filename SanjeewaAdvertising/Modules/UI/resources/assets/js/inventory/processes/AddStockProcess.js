/**
 * SanjeewaAdvertising - Add Stock Process
 *
 * Handles the Receive & Add Stock Shipment process:
 * - Loads Category, Subcategory, Brand, Stock Item, Batch, and GRN master data.
 * - Manages cascading category/subcategory and interactive searchable item selector.
 * - Distinguishes between New Stock creation and Existing Stock increment based on stock selection.
 * - Validates input fields and submits requests via RequestHandler.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

export class AddStockProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.showToast]
   * @param {Function} [options.onSuccess]
   */
  constructor(options = {}) {
    this.http = new RequestHandler();
    this.showToast = options.showToast || ((msg, type) => console.log(`[Toast ${type}]: ${msg}`));
    this.onSuccess = options.onSuccess || (() => {});

    this.categories = [];
    this.brands = [];
    this.stockItems = [];
    this.grns = [];

    this.selectedItemId = null;
    this.selectedStockId = null;
    this.isSubmitting = false;
  }

  /**
   * Bind event listeners for modal controls.
   */
  bindEvents() {
    // Mode toggle (NEW vs UPDATE)
    document.querySelectorAll('input[name="addStockMode"]').forEach((radio) => {
      radio.addEventListener("change", (e) => this.handleModeChange(e.target.value));
    });

    // Existing stock selector
    const existingStockSelect = document.getElementById("addStockExistingSelect");
    if (existingStockSelect) {
      existingStockSelect.addEventListener("change", (e) => this.handleExistingStockSelection(e.target.value));
    }

    // Cascading Category & Subcategory selects
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => this.handleCategoryChange(e.target.value));
    }

    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (subcatSelect) {
      subcatSelect.addEventListener("change", () => this.updateExistingStocksList());
    }

    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect) {
      brandSelect.addEventListener("change", () => this.updateExistingStocksList());
    }

    // Item searchable input
    const searchInput = document.getElementById("addStockItemSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.searchAndRenderItems(e.target.value));
      searchInput.addEventListener("focus", (e) => this.searchAndRenderItems(e.target.value));
    }

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("addStockItemResultsDropdown");
      const searchBox = document.getElementById("addStockItemSearchBoxWrap");
      if (dropdown && searchBox && !searchBox.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    // Change selected item
    const changeItemBtn = document.getElementById("addStockChangeItemBtn");
    if (changeItemBtn) {
      changeItemBtn.addEventListener("click", () => this.clearSelectedItem());
    }

    // Batch Option radios
    document.querySelectorAll('input[name="addStockBatchOption"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const wrap = document.getElementById("addStockExistingBatchWrap");
        if (wrap) wrap.style.display = e.target.value === "EXISTING" ? "block" : "none";
      });
    });

    // Live financial inputs
    ["addStockQty", "addStockUnitCost", "addStockSellingPrice"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => this.updateFinancialCalculations());
    });

    // Save button
    const saveBtn = document.getElementById("saveNewStockBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.execute());
    }

    // Close modal triggers
    document.querySelectorAll('[data-close-inv-modal="addStockModal"]').forEach((btn) => {
      btn.addEventListener("click", () => this.closeModal());
    });
  }

  /**
   * Fetch master dropdown data from the backend.
   */
  async loadMasterData() {
    try {
      const response = await this.http.get("/api/v1/inventory/stocks/form-data");
      if (response && response.success && response.data) {
        this.categories = response.data.categories || [];
        this.brands = response.data.brands || [];
        this.stockItems = response.data.stock_items || [];
        this.grns = response.data.grns || [];
        this.populateMasterDropdowns();
      }
    } catch (err) {
      console.error("Failed to load stock form master data:", err);
      this.showToast("Could not load master inventory datasets", "error");
    }
  }

  /**
   * Populate Category, Brand, and GRN options.
   */
  populateMasterDropdowns() {
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect) {
      catSelect.innerHTML = '<option value="">-- Select Category --</option>';
      this.categories.forEach((cat) => {
        catSelect.insertAdjacentHTML("beforeend", `<option value="${cat.id}">${cat.category}</option>`);
      });
    }

    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect) {
      brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
      this.brands.forEach((b) => {
        brandSelect.insertAdjacentHTML("beforeend", `<option value="${b.id}">${b.brand}</option>`);
      });
    }

    const grnSelect = document.getElementById("addStockGrnSelect");
    if (grnSelect) {
      grnSelect.innerHTML = '<option value="">-- Select GRN Reference --</option>';
      this.grns.forEach((grn) => {
        grnSelect.insertAdjacentHTML("beforeend", `<option value="${grn.id}">${grn.label || `GRN #${grn.id}`}</option>`);
      });
      if (this.grns.length > 0) grnSelect.value = String(this.grns[0].id);
    }
  }

  /**
   * Toggle between NEW stock record and UPDATE existing stock entry.
   * @param {"NEW"|"UPDATE"} mode
   */
  handleModeChange(mode) {
    const wrap = document.getElementById("addStockExistingSelectWrap");
    const saveLabel = document.getElementById("saveStockBtnLabel");
    const title = document.getElementById("addStockModalTitle");

    if (mode === "UPDATE") {
      if (wrap) wrap.style.display = "block";
      if (saveLabel) saveLabel.textContent = "Update Existing Stock Entry";
      if (title) title.textContent = "Receive Additional Items to Existing Stock";
      this.updateExistingStocksList();
    } else {
      if (wrap) wrap.style.display = "none";
      if (saveLabel) saveLabel.textContent = "Save New Stock Record";
      if (title) title.textContent = "Receive & Add Material Stock";
      this.selectedStockId = null;
      const existingSelect = document.getElementById("addStockExistingSelect");
      if (existingSelect) existingSelect.value = "";
      const indicator = document.getElementById("addStockUpdateQtyIndicator");
      if (indicator) indicator.style.display = "none";
    }
  }

  /**
   * Populate Subcategories when Category changes.
   * @param {string|number} catId
   */
  handleCategoryChange(catId) {
    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (!subcatSelect) return;

    subcatSelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
    if (!catId) {
      subcatSelect.disabled = true;
      return;
    }

    const cat = this.categories.find((c) => String(c.id) === String(catId));
    (cat?.subcategories || []).forEach((sub) => {
      subcatSelect.insertAdjacentHTML("beforeend", `<option value="${sub.id}">${sub.subcategory}</option>`);
    });
    subcatSelect.disabled = false;
  }

  /**
   * Search and render matching items in dropdown.
   * @param {string} query
   */
  searchAndRenderItems(query = "") {
    const dropdown = document.getElementById("addStockItemResultsDropdown");
    if (!dropdown) return;

    const term = (query || "").toLowerCase().trim();
    const catId = document.getElementById("addStockCategorySelect")?.value;
    const subcatId = document.getElementById("addStockSubcategorySelect")?.value;

    let matches = this.stockItems;
    if (catId) matches = matches.filter((it) => String(it.category_id) === String(catId));
    if (subcatId) matches = matches.filter((it) => String(it.subcategories_id) === String(subcatId));
    if (term) {
      matches = matches.filter(
        (it) => it.name.toLowerCase().includes(term) || it.code.toLowerCase().includes(term)
      );
    }

    dropdown.innerHTML = "";
    if (matches.length === 0) {
      dropdown.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 12px;">No matching items found</div>';
      dropdown.style.display = "block";
      return;
    }

    matches.slice(0, 10).forEach((item) => {
      const row = document.createElement("div");
      row.style.cssText = "padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;";
      row.innerHTML = `
        <div>
          <span class="inv-item-code" style="font-size: 11px; font-weight: 700; color: #1677ff; margin-right: 6px;">${item.code}</span>
          <span style="font-weight: 600; font-size: 12px;">${item.name}</span>
        </div>
        <span class="inv-cat-pill" style="font-size: 10px; padding: 2px 6px;">${item.category_name}</span>
      `;
      row.addEventListener("mouseenter", () => (row.style.background = "var(--surface-2, #f5f5f5)"));
      row.addEventListener("mouseleave", () => (row.style.background = "transparent"));
      row.addEventListener("click", () => {
        this.selectItem(item);
        dropdown.style.display = "none";
      });
      dropdown.appendChild(row);
    });

    dropdown.style.display = "block";
  }

  /**
   * Set selected stock item SKU.
   * @param {Object} item
   */
  selectItem(item) {
    if (!item) return;
    this.selectedItemId = item.id;
    document.getElementById("addStockSelectedItemId").value = String(item.id);

    const searchWrap = document.getElementById("addStockItemSearchBoxWrap");
    const displayWrap = document.getElementById("addStockSelectedItemDisplay");
    const codeEl = document.getElementById("addStockPickedCode");
    const nameEl = document.getElementById("addStockPickedName");
    const catEl = document.getElementById("addStockPickedCategory");

    if (searchWrap) searchWrap.style.display = "none";
    if (displayWrap) displayWrap.style.display = "flex";
    if (codeEl) codeEl.textContent = item.code;
    if (nameEl) nameEl.textContent = item.name;
    if (catEl) catEl.textContent = `${item.category_name} / ${item.subcategory_name}`;

    // Cascade Category & Subcategory
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect && item.category_id) {
      catSelect.value = String(item.category_id);
      this.handleCategoryChange(item.category_id);
      const subcatSelect = document.getElementById("addStockSubcategorySelect");
      if (subcatSelect && item.subcategories_id) subcatSelect.value = String(item.subcategories_id);
    }

    // Populate Brand select
    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect && Array.isArray(item.compatible_brands) && item.compatible_brands.length > 0) {
      brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
      item.compatible_brands.forEach((b) => {
        brandSelect.insertAdjacentHTML("beforeend", `<option value="${b.id}">${b.brand}</option>`);
      });
      brandSelect.value = String(item.compatible_brands[0].id);
    }

    // Populate Existing Batches
    this.populateExistingBatches(item.existing_batches || []);
    this.updateExistingStocksList();
  }

  /**
   * Reset selected item back to search input.
   */
  clearSelectedItem() {
    this.selectedItemId = null;
    document.getElementById("addStockSelectedItemId").value = "";

    const searchWrap = document.getElementById("addStockItemSearchBoxWrap");
    const displayWrap = document.getElementById("addStockSelectedItemDisplay");
    const searchInput = document.getElementById("addStockItemSearch");

    if (displayWrap) displayWrap.style.display = "none";
    if (searchWrap) searchWrap.style.display = "block";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    this.populateExistingBatches([]);
    this.updateExistingStocksList();
  }

  /**
   * Populate batches dropdown for chosen item.
   * @param {Array} batches
   */
  populateExistingBatches(batches = []) {
    const batchSelect = document.getElementById("addStockBatchSelect");
    if (!batchSelect) return;

    batchSelect.innerHTML = '<option value="">-- Select Existing Batch No --</option>';
    if (batches.length === 0) {
      batchSelect.insertAdjacentHTML("beforeend", '<option value="" disabled>(No existing batches - a new batch will be generated)</option>');
      return;
    }

    batches.forEach((b) => {
      batchSelect.insertAdjacentHTML("beforeend", `<option value="${b.id}">${b.batch_no || `Batch #${b.id}`}</option>`);
    });
  }

  /**
   * Refresh the existing stock records dropdown for update mode.
   */
  updateExistingStocksList() {
    const select = document.getElementById("addStockExistingSelect");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Existing Stock Record to Receive More --</option>';
    if (!this.selectedItemId) return;

    const item = this.stockItems.find((it) => it.id === this.selectedItemId);
    (item?.existing_stocks || []).forEach((st) => {
      select.insertAdjacentHTML(
        "beforeend",
        `<option value="${st.id}">Stock #${st.id} — Brand: ${st.brand_name} | Qty: ${st.qty.toLocaleString()} Units | Buy: Rs. ${st.buy.toFixed(2)} | Sell: Rs. ${st.price.toFixed(2)} (GRN #${st.grn_id})</option>`
      );
    });
  }

  /**
   * Auto-fill fields when selecting an existing stock record.
   * @param {string} stockId
   */
  handleExistingStockSelection(stockId) {
    if (!stockId) {
      this.selectedStockId = null;
      const indicator = document.getElementById("addStockUpdateQtyIndicator");
      if (indicator) indicator.style.display = "none";
      return;
    }

    this.selectedStockId = Number(stockId);
    let foundStock = null;

    for (const item of this.stockItems) {
      const st = (item.existing_stocks || []).find((s) => Number(s.id) === this.selectedStockId);
      if (st) {
        foundStock = st;
        if (this.selectedItemId !== item.id) this.selectItem(item);
        break;
      }
    }

    if (!foundStock) return;

    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect && foundStock.brands_id) brandSelect.value = String(foundStock.brands_id);

    const buyInput = document.getElementById("addStockUnitCost");
    const sellInput = document.getElementById("addStockSellingPrice");
    if (buyInput) buyInput.value = foundStock.buy.toFixed(2);
    if (sellInput) sellInput.value = foundStock.price.toFixed(2);

    const grnSelect = document.getElementById("addStockGrnSelect");
    if (grnSelect && foundStock.grn_id) grnSelect.value = String(foundStock.grn_id);

    this.updateFinancialCalculations();
  }

  /**
   * Live calculation of totals and stock increment indicators.
   */
  updateFinancialCalculations() {
    const qty = parseFloat(document.getElementById("addStockQty")?.value) || 0;
    const buy = parseFloat(document.getElementById("addStockUnitCost")?.value) || 0;
    const sell = parseFloat(document.getElementById("addStockSellingPrice")?.value) || 0;

    const costEl = document.getElementById("addStockTotalCost");
    const valEl = document.getElementById("addStockTotalValue");
    const indicator = document.getElementById("addStockUpdateQtyIndicator");
    const calcEl = document.getElementById("addStockUpdateQtyCalc");

    if (costEl) costEl.textContent = `Rs. ${(qty * buy).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (valEl) valEl.textContent = `Rs. ${(qty * sell).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (this.selectedStockId) {
      let currentQty = 0;
      for (const item of this.stockItems) {
        const st = (item.existing_stocks || []).find((s) => Number(s.id) === this.selectedStockId);
        if (st) {
          currentQty = st.qty;
          break;
        }
      }
      if (indicator && calcEl) {
        calcEl.textContent = `${currentQty.toLocaleString()} + ${qty.toLocaleString()} = ${(currentQty + qty).toLocaleString()} Units`;
        indicator.style.display = "block";
      }
    } else if (indicator) {
      indicator.style.display = "none";
    }
  }

  /**
   * Open the Add Stock modal.
   * @param {Object} [prefill={}]
   */
  async openModal(prefill = {}) {
    this.resetForm();
    await this.loadMasterData();

    if (prefill.stock_id) {
      const modeRadio = document.getElementById("addStockModeUpdate");
      if (modeRadio) {
        modeRadio.checked = true;
        this.handleModeChange("UPDATE");
      }
      this.handleExistingStockSelection(String(prefill.stock_id));
      const select = document.getElementById("addStockExistingSelect");
      if (select) select.value = String(prefill.stock_id);
    } else if (prefill.item_id) {
      const item = this.stockItems.find((it) => it.id === prefill.item_id);
      if (item) this.selectItem(item);
    }

    const modal = document.getElementById("addStockModal");
    if (modal) modal.classList.add("open");
  }

  /**
   * Close the Add Stock modal.
   */
  closeModal() {
    const modal = document.getElementById("addStockModal");
    if (modal) modal.classList.remove("open");
    this.resetForm();
  }

  /**
   * Reset form to initial state.
   */
  resetForm() {
    this.selectedItemId = null;
    this.selectedStockId = null;

    const modeNewRadio = document.getElementById("addStockModeNew");
    if (modeNewRadio) modeNewRadio.checked = true;
    this.handleModeChange("NEW");

    this.clearSelectedItem();

    const fields = [
      ["addStockCategorySelect", ""],
      ["addStockBrandSelect", ""],
      ["addStockExistingSelect", ""],
      ["addStockBatchSelect", ""],
      ["addStockQty", ""],
      ["addStockUnitCost", ""],
      ["addStockSellingPrice", ""],
    ];

    fields.forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });

    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (subcatSelect) {
      subcatSelect.value = "";
      subcatSelect.disabled = true;
    }

    const batchOptNew = document.getElementById("addStockBatchOptNew");
    if (batchOptNew) batchOptNew.checked = true;

    const dateInput = document.getElementById("addStockDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    const batchWrap = document.getElementById("addStockExistingBatchWrap");
    if (batchWrap) batchWrap.style.display = "none";

    this.updateFinancialCalculations();
  }

  /**
   * Validate form fields.
   */
  validate(data, isUpdate) {
    if (isUpdate && !data.stock_id) return { isValid: false, error: "Please select an existing stock record to update." };
    if (!isUpdate && !data.stock_items_id) return { isValid: false, error: "Please select a material item SKU." };
    if (!isUpdate && !data.brands_id) return { isValid: false, error: "Please select a brand." };
    if (!data.grn_id) return { isValid: false, error: "Please select a valid GRN reference." };
    if (!data.qty || isNaN(data.qty) || Number(data.qty) <= 0) return { isValid: false, error: "Quantity received must be a positive number (min 1)." };
    if (data.buy === undefined || isNaN(data.buy) || Number(data.buy) < 0) return { isValid: false, error: "Unit purchase cost cannot be negative." };
    if (data.price === undefined || isNaN(data.price) || Number(data.price) < 0) return { isValid: false, error: "Selling price cannot be negative." };
    if (data.use_existing_batch && !data.batch_id) return { isValid: false, error: "Please select an existing batch number or generate a new batch." };
    return { isValid: true, error: null };
  }

  /**
   * Execute Add Stock Shipment submission.
   */
  async execute() {
    if (this.isSubmitting) return;

    const modeVal = document.querySelector('input[name="addStockMode"]:checked')?.value || "NEW";
    const existingVal = document.getElementById("addStockExistingSelect")?.value;
    const isUpdate = modeVal === "UPDATE" || !!existingVal;

    const stockId = existingVal ? Number(existingVal) : this.selectedStockId;
    const itemId = this.selectedItemId || Number(document.getElementById("addStockSelectedItemId")?.value);
    const brandId = Number(document.getElementById("addStockBrandSelect")?.value) || null;
    const grnId = Number(document.getElementById("addStockGrnSelect")?.value) || null;
    const qty = parseInt(document.getElementById("addStockQty")?.value, 10);
    const buy = parseFloat(document.getElementById("addStockUnitCost")?.value);
    const price = parseFloat(document.getElementById("addStockSellingPrice")?.value);
    const addDate = document.getElementById("addStockDate")?.value || null;

    const batchOption = document.querySelector('input[name="addStockBatchOption"]:checked')?.value || "NEW";
    const batchId = batchOption === "EXISTING" ? Number(document.getElementById("addStockBatchSelect")?.value) || null : null;

    const payload = {
      stock_id: isUpdate ? stockId : null,
      stock_items_id: itemId,
      brands_id: brandId,
      grn_id: grnId,
      qty: qty,
      buy: isNaN(buy) ? 0 : buy,
      price: isNaN(price) ? 0 : price,
      add_date: addDate,
      batch_id: batchId,
      create_new_batch: batchOption === "NEW" || !batchId,
      use_existing_batch: batchOption === "EXISTING",
    };

    const validation = this.validate(payload, isUpdate);
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      return;
    }

    const saveBtn = document.getElementById("saveNewStockBtn");
    const originalBtnHtml = saveBtn?.innerHTML || "";
    this.isSubmitting = true;

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const response = isUpdate && stockId
        ? await this.http.put(`/api/v1/inventory/stocks/${stockId}`, payload)
        : await this.http.post("/api/v1/inventory/stocks", payload);

      if (response && response.success) {
        const msg = isUpdate
          ? `Stock #${stockId} successfully updated with +${qty.toLocaleString()} units.`
          : `New Stock record successfully created with ${qty.toLocaleString()} units.`;

        this.showToast(msg, "success");
        this.closeModal();

        if (typeof this.onSuccess === "function") {
          await this.onSuccess(response.data);
        }
      } else {
        this.showToast(response?.message || "Failed to save stock shipment.", "error");
      }
    } catch (err) {
      console.error("Error executing Add Stock Process:", err);
      this.showToast(err.response?.data?.message || "Server error while saving stock shipment.", "error");
    } finally {
      this.isSubmitting = false;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnHtml;
      }
    }
  }
}

export default AddStockProcess;
