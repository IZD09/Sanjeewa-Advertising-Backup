/**
 * SanjeewaAdvertising - Add Stock Process (Orchestrator)
 *
 * Coordinates the Receive & Add Stock Shipment process by delegating to focused subclasses:
 * - StockItemSelector: Searchable SKU dropdown, category/subcategory cascading, brand resolution
 * - StockModeManager: New Stock vs Update Existing Stock mode, existing stocks dropdown, batch options
 * - StockFinancialCalculator: Live purchase cost, selling valuation, and stock increment calculations
 * - StockFormValidator: Payload validation rules for new and update shipments
 */

import { RequestHandler } from "../../core/RequestHandler.js";
import {
  StockItemSelector,
  StockModeManager,
  StockFinancialCalculator,
  StockFormValidator,
} from "./stock/index.js";

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
    this.isSubmitting = false;

    // 1. Financial & Quantity Calculator Subclass
    this.calculator = new StockFinancialCalculator({
      getCurrentStockQty: () => this.modeManager.selectedStock?.qty || 0,
    });

    // 2. Mode & Batch Options Subclass
    this.modeManager = new StockModeManager({
      onModeChanged: () => this.calculator.calculate(),
      onStockSelected: (foundStock) => {
        if (this.itemSelector.selectedItem?.id !== foundStock.stock_items_id) {
          const item = this.stockItems.find((it) => it.id === foundStock.stock_items_id);
          if (item) this.itemSelector.selectItem(item);
        }
        this.calculator.calculate();
      },
      onStockCleared: () => this.calculator.calculate(),
    });

    // 3. Item SKU Selector & Cascading Subclass
    this.itemSelector = new StockItemSelector({
      getItems: () => this.stockItems,
      getCategories: () => this.categories,
      onItemSelected: (item) => {
        this.modeManager.populateExistingBatches(item.existing_batches || []);
        this.modeManager.populateExistingStocks(item.existing_stocks || []);
      },
      onItemCleared: () => {
        this.modeManager.populateExistingBatches([]);
        this.modeManager.populateExistingStocks([]);
      },
      onCategoryChanged: () => {
        if (this.itemSelector.selectedItem) {
          this.modeManager.populateExistingStocks(this.itemSelector.selectedItem.existing_stocks || []);
        }
      },
    });

    // 4. Form Validator Subclass
    this.validator = new StockFormValidator();
  }

  /**
   * Bind event listeners across subclasses and modal controls.
   */
  bindEvents() {
    this.itemSelector.bindEvents();
    this.modeManager.bindEvents();
    this.calculator.bindEvents();

    // Cascading brand change update
    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect) {
      brandSelect.addEventListener("change", () => {
        if (this.itemSelector.selectedItem) {
          this.modeManager.populateExistingStocks(this.itemSelector.selectedItem.existing_stocks || []);
        }
      });
    }

    // Save button trigger
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
   * Fetch master dropdown data from backend API.
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
   * Open the Add Stock modal with optional prefill data.
   * @param {Object} [prefill={}]
   */
  async openModal(prefill = {}) {
    this.resetForm();
    await this.loadMasterData();

    if (prefill.stock_id) {
      const modeRadio = document.getElementById("addStockModeUpdate");
      if (modeRadio) {
        modeRadio.checked = true;
        this.modeManager.setMode("UPDATE");
      }
      this.modeManager.handleStockSelection(prefill.stock_id, this.stockItems);
      const select = document.getElementById("addStockExistingSelect");
      if (select) select.value = String(prefill.stock_id);
    } else if (prefill.item_id) {
      const item = this.stockItems.find((it) => it.id === Number(prefill.item_id));
      if (item) this.itemSelector.selectItem(item);
    } else if (prefill.item_code) {
      const item = this.stockItems.find((it) => it.code === prefill.item_code);
      if (item) this.itemSelector.selectItem(item);
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
   * Reset form and delegates to initial state.
   */
  resetForm() {
    this.modeManager.reset();
    this.itemSelector.reset();
    this.calculator.reset();

    const fields = [
      ["addStockBrandSelect", ""],
      ["addStockQty", ""],
      ["addStockUnitCost", ""],
      ["addStockSellingPrice", ""],
    ];

    fields.forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });

    const dateInput = document.getElementById("addStockDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
  }

  /**
   * Collect payload and execute shipment submission.
   */
  async execute() {
    if (this.isSubmitting) return;

    const isUpdate = this.modeManager.mode === "UPDATE" || !!this.modeManager.selectedStock;
    const stockId = this.modeManager.selectedStock?.id || Number(document.getElementById("addStockExistingSelect")?.value) || null;
    const itemId = this.itemSelector.selectedItem?.id || Number(document.getElementById("addStockSelectedItemId")?.value) || null;
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

    const validation = this.validator.validate(payload, isUpdate);
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
