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
import { ViewGRNModal } from "../../grn/modals/ViewGRNModal.js";
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
    this.showToast = options.showToast || (() => {});
    this.onSuccess = options.onSuccess || (() => {});

    this.categories = [];
    this.brands = [];
    this.stockItems = [];
    this.grns = [];
    this.isSubmitting = false;
    this.viewGrnModal = null;

    // 1. Financial & Quantity Calculator Subclass
    this.calculator = new StockFinancialCalculator({
      getCurrentStockQty: () => this.modeManager.selectedStock?.qty || 0,
      getStagedItems: () => this.itemSelector?.stagedItems || [],
      getSelectedItemQty: () => this.itemSelector?.selectedItem?.qty || 0,
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
      getBrands: () => this.brands,
      showToast: (msg, type) => this.showToast(msg, type),
      onItemSelected: (item) => {
        this.modeManager.populateExistingBatches(item.existing_batches || []);
        this.modeManager.populateExistingStocks(item.existing_stocks || []);
        this.calculator.calculate();
      },
      onItemCleared: () => {
        this.modeManager.populateExistingBatches([]);
        this.modeManager.populateExistingStocks([]);
        this.calculator.calculate();
      },
      onCategoryChanged: () => {
        if (this.itemSelector.selectedItem) {
          this.modeManager.populateExistingStocks(this.itemSelector.selectedItem.existing_stocks || []);
        }
      },
      onCalculate: () => {
        this.calculator.calculate();
      },
      onGrnAllStocked: (grn) => {
        this.handleGrnAllStocked(grn);
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

    // GRN change update (Step 1 -> Step 2)
    const grnSelect = document.getElementById("addStockGrnSelect");
    if (grnSelect) {
      grnSelect.addEventListener("change", (e) => {
        this.handleGrnChange(e.target.value);
      });
    }

    // View Selected GRN Button trigger
    const viewGrnBtn = document.getElementById("btnViewSelectedGrn");
    if (viewGrnBtn) {
      viewGrnBtn.addEventListener("click", () => {
        const select = document.getElementById("addStockGrnSelect");
        const selectedGrnId = select ? select.value : null;
        if (!selectedGrnId) {
          this.showToast("Please select a GRN reference first", "warning");
          return;
        }
        this.viewGrn(selectedGrnId);
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
      const response = await this.http.get("/advertising/inventory/stocks/form-data");
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
   * Handle GRN change to update item selector context and filter items.
   * @param {string|number} grnId
   */
  handleGrnChange(grnId) {
    const viewBtn = document.getElementById("btnViewSelectedGrn");
    if (viewBtn) {
      viewBtn.disabled = !grnId;
    }

    if (!grnId) {
      this.itemSelector.setGrnContext(null);
      this.calculator.calculate();
      return;
    }
    const grn = this.grns.find((g) => String(g.id) === String(grnId));
    this.itemSelector.setGrnContext(grn || null);
    this.calculator.calculate();
  }

  /**
   * View details of selected GRN inside #viewGrnModal.
   * @param {string|number} grnId
   */
  async viewGrn(grnId) {
    if (!grnId) return;

    if (!this.viewGrnModal) {
      this.viewGrnModal = new ViewGRNModal({
        getGrnRecords: () => this.grns,
        formatCurrency: (amt) => {
          const val = Number(amt) || 0;
          return "Rs. " + val.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
      });
    }

    try {
      await this.viewGrnModal.viewGRN(grnId);
    } catch (err) {
      console.error("Failed to view GRN:", err);
      this.showToast("Could not display GRN details", "error");
    }
  }

  /**
   * Handle when all items for a GRN have been added to stock.
   * Removes the GRN from the Select GRN Reference dropdown.
   * @param {Object} grn
   */
  handleGrnAllStocked(grn) {
    if (!grn) return;
    this.removeGrnFromDropdown(grn.id);
  }

  /**
   * Remove a GRN from in-memory list and from the #addStockGrnSelect dropdown.
   * @param {string|number} grnId
   */
  removeGrnFromDropdown(grnId) {
    if (!grnId) return;
    this.grns = (this.grns || []).filter((g) => Number(g.id) !== Number(grnId));

    const grnSelect = document.getElementById("addStockGrnSelect");
    if (grnSelect) {
      const optToRemove = grnSelect.querySelector(`option[value="${grnId}"]`);
      if (optToRemove) {
        optToRemove.remove();
      }

      // Check remaining GRNs with unstocked items
      const remainingGrns = (this.grns || []).filter(
        (g) => (g.pending_count === undefined || g.pending_count > 0) && g.items && g.items.length > 0
      );

      if (remainingGrns.length > 0) {
        if (String(grnSelect.value) === String(grnId) || !grnSelect.value) {
          grnSelect.value = "";
          this.handleGrnChange("");
        }
      } else {
        grnSelect.innerHTML = '<option value="">-- No Pending GRNs to Stock --</option>';
        grnSelect.value = "";
        this.handleGrnChange("");
      }
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
      const availableGrns = (this.grns || []).filter(
        (g) => (g.pending_count === undefined || g.pending_count > 0) && g.items && g.items.length > 0
      );

      if (availableGrns.length > 0) {
        availableGrns.forEach((grn) => {
          grnSelect.insertAdjacentHTML("beforeend", `<option value="${grn.id}">${grn.label || `GRN #${grn.id}`}</option>`);
        });
        grnSelect.value = "";
        this.handleGrnChange("");
      } else {
        grnSelect.innerHTML = '<option value="">-- No Pending GRNs to Stock --</option>';
        grnSelect.value = "";
        this.handleGrnChange("");
      }
    }
  }

  /**
   * Open the Add Stock modal with optional prefill data.
   * @param {Object} [prefill={}]
   */
  async openModal(prefill = {}) {
    this.resetForm();
    await this.loadMasterData();

    if (prefill.grn_id) {
      const grnSelect = document.getElementById("addStockGrnSelect");
      if (grnSelect) {
        grnSelect.value = String(prefill.grn_id);
        this.handleGrnChange(prefill.grn_id);
      }
    }

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

    const grnSelect = document.getElementById("addStockGrnSelect");
    if (grnSelect) {
      grnSelect.value = "";
      this.handleGrnChange("");
    }
  }

  /**
   * Collect payload and execute Receive & Add Stock shipment submission.
   * 1. Verifies selected GRN is in Pending Stock status.
   * 2. Validates queued items and their Received quantities (> 0).
   * 3. Submits items with allocated batch_id (to increment batch stock) or null (to create new batch & stock).
   */
  async execute() {
    if (this.isSubmitting) return;

    const stagedItems = this.itemSelector.stagedItems || [];
    const grnId = Number(document.getElementById("addStockGrnSelect")?.value) || null;
    const addDate = document.getElementById("addStockDate")?.value || null;

    if (!grnId) {
      this.showToast("Please select a GRN Reference first.", "error");
      return;
    }

    const selectedGrn = this.grns.find((g) => Number(g.id) === Number(grnId)) || null;
    if (!selectedGrn) {
      this.showToast("Selected GRN could not be found. Please refresh and try again.", "error");
      return;
    }

    const isPendingStock =
      Number(selectedGrn.grn_statuses_id) === 6 ||
      String(selectedGrn.status || "").trim().toLowerCase() === "pending stock";
    if (!isPendingStock) {
      this.showToast(
        `Selected GRN is in '${selectedGrn.status || "Unknown"}' status. Only GRNs in 'Pending Stock' status can be added to stock.`,
        "error"
      );
      return;
    }

    if (stagedItems.length === 0) {
      this.showToast("Please add at least one item to the Queued Stock Items to Receive table.", "warning");
      return;
    }

    const validationPayload = {
      grn_id: grnId,
      grn: selectedGrn,
      add_date: addDate,
      items: stagedItems.map((item) => ({
        stock_items_id: Number(item.id),
        item_code: item.code,
        item_name: item.name,
        brands_id: Number(item.brand_id),
        grn_qty: Number(item.grn_qty) || null,
        qty: Number((parseFloat(item.qty) || 0).toFixed(3)),
        buy: parseFloat(item.unit_cost) || 0,
        price: parseFloat(item.selling_price) || 0,
        batch_id: item.batch_id ? Number(item.batch_id) : null,
        create_new_batch: !item.batch_id,
      })),
    };

    const validation = this.validator.validate(validationPayload, false);
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      return;
    }

    const payload = {
      grn_id: grnId,
      add_date: addDate,
      items: validationPayload.items.map(({ item_code, item_name, grn_qty, ...rest }) => rest),
    };

    const saveBtn = document.getElementById("saveNewStockBtn");
    const originalBtnHtml = saveBtn?.innerHTML || "";
    this.isSubmitting = true;

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    }

    try {
      const response = await this.http.post("/advertising/inventory/stocks", payload);

      if (response && response.success) {
        const msg = response.message || `Successfully received ${stagedItems.length} item(s) into stock for GRN #${grnId}.`;

        this.itemSelector.clearStaged();

        // Update in-memory GRNs and remove GRN if all items are stocked
        const stockedIds = new Set(payload.items.map((it) => Number(it.stock_items_id)));
        if (Array.isArray(selectedGrn.items)) {
          selectedGrn.items = selectedGrn.items.filter((it) => !stockedIds.has(Number(it.id)));
          selectedGrn.pending_count = selectedGrn.items.length;
          if (selectedGrn.items.length === 0) {
            this.removeGrnFromDropdown(grnId);
          }
        }

        this.showToast(msg, "success");
        this.closeModal();

        // Reload master datasets and refresh Stock Management & Movements tables
        await this.loadMasterData();

        if (typeof this.onSuccess === "function") {
          await this.onSuccess(response.data);
        }
      } else {
        this.showToast(response?.message || "Failed to save stock shipment.", "error");
      }
    } catch (err) {
      console.error("Error executing Add Stock Process:", err);
      const errData = err?.response?.data || err?.data || null;
      let errMsg = errData?.message || err?.message || "Server error while saving stock shipment.";
      if (errData?.errors && typeof errData.errors === "object") {
        const firstKey = Object.keys(errData.errors)[0];
        if (firstKey && Array.isArray(errData.errors[firstKey]) && errData.errors[firstKey][0]) {
          errMsg = errData.errors[firstKey][0];
        }
      }
      this.showToast(errMsg, "error");
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
