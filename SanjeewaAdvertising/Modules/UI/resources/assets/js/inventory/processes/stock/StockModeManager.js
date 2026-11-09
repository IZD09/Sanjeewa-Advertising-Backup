/**
 * SanjeewaAdvertising - Stock Mode & Batch Manager
 *
 * Manages mode switching (NEW stock vs UPDATE existing stock), existing stock selection,
 * batch options (NEW generated batch vs EXISTING batch), and autofill behaviors.
 */

export class StockModeManager {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onModeChanged] - Callback when mode changes
   * @param {Function} [options.onStockSelected] - Callback when an existing stock record is chosen
   * @param {Function} [options.onStockCleared] - Callback when stock selection is cleared
   */
  constructor(options = {}) {
    this.onModeChanged = options.onModeChanged || (() => {});
    this.onStockSelected = options.onStockSelected || (() => {});
    this.onStockCleared = options.onStockCleared || (() => {});

    this.mode = "NEW"; // 'NEW' | 'UPDATE'
    this.selectedStock = null;
  }

  /**
   * Bind event listeners for mode radio buttons, existing stock select, and batch options.
   */
  bindEvents() {
    // Mode toggle (NEW vs UPDATE)
    document.querySelectorAll('input[name="addStockMode"]').forEach((radio) => {
      radio.addEventListener("change", (e) => this.setMode(e.target.value));
    });

    // Existing stock selector
    const existingSelect = document.getElementById("addStockExistingSelect");
    if (existingSelect) {
      existingSelect.addEventListener("change", (e) => this.handleStockSelection(e.target.value));
    }

    // Batch Option radios (NEW vs EXISTING)
    document.querySelectorAll('input[name="addStockBatchOption"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const wrap = document.getElementById("addStockExistingBatchWrap");
        if (wrap) {
          wrap.style.display = e.target.value === "EXISTING" ? "block" : "none";
        }
      });
    });
  }

  /**
   * Set modal mode ('NEW' or 'UPDATE') and adjust UI state.
   * @param {"NEW"|"UPDATE"} mode
   */
  setMode(mode) {
    this.mode = mode;
    const wrap = document.getElementById("addStockExistingSelectWrap");
    const saveLabel = document.getElementById("saveStockBtnLabel");
    const title = document.getElementById("addStockModalTitle");

    if (mode === "UPDATE") {
      if (wrap) wrap.style.display = "block";
      if (saveLabel) saveLabel.textContent = "Update Existing Stock Entry";
      if (title) title.textContent = "Receive Additional Items to Existing Stock";
    } else {
      if (wrap) wrap.style.display = "none";
      if (saveLabel) saveLabel.textContent = "Save New Stock Record";
      if (title) title.textContent = "Receive & Add Material Stock";

      this.selectedStock = null;
      const existingSelect = document.getElementById("addStockExistingSelect");
      if (existingSelect) existingSelect.value = "";
      this.onStockCleared();
    }

    this.onModeChanged(mode);
  }

  /**
   * Populate existing stock entries for a chosen item SKU.
   * @param {Array} existingStocks
   */
  populateExistingStocks(existingStocks = []) {
    const select = document.getElementById("addStockExistingSelect");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Existing Stock Record to Receive More --</option>';
    if (!Array.isArray(existingStocks) || existingStocks.length === 0) {
      select.insertAdjacentHTML("beforeend", '<option value="" disabled>(No active stock records for this item - switch to "New Stock")</option>');
      return;
    }

    existingStocks.forEach((st) => {
      select.insertAdjacentHTML(
        "beforeend",
        `<option value="${st.id}">Stock #${st.id} — Brand: ${st.brand_name || "Generic"} | Qty: ${Number(st.qty || 0).toLocaleString()} Units | Buy: Rs. ${Number(st.buy || 0).toFixed(2)} | Sell: Rs. ${Number(st.price || 0).toFixed(2)} (GRN #${st.grn_id})</option>`
      );
    });
  }

  /**
   * Populate batches select options for the chosen item SKU.
   * @param {Array} batches
   */
  populateExistingBatches(batches = []) {
    const batchSelect = document.getElementById("addStockBatchSelect");
    if (!batchSelect) return;

    batchSelect.innerHTML = '<option value="">-- Select Existing Batch No --</option>';
    if (!Array.isArray(batches) || batches.length === 0) {
      batchSelect.insertAdjacentHTML("beforeend", '<option value="" disabled>(No existing batches - a new batch will be generated)</option>');
      return;
    }

    batches.forEach((b) => {
      batchSelect.insertAdjacentHTML("beforeend", `<option value="${b.id}">${b.batch_no || `Batch #${b.id}`}</option>`);
    });
  }

  /**
   * Handle existing stock dropdown selection and autofill fields.
   * @param {string|number} stockId
   * @param {Array} allItems
   */
  handleStockSelection(stockId, allItems = []) {
    if (!stockId) {
      this.selectedStock = null;
      this.onStockCleared();
      return;
    }

    const id = Number(stockId);
    let found = null;

    for (const it of allItems) {
      const st = (it.existing_stocks || []).find((s) => Number(s.id) === id);
      if (st) {
        found = { ...st, item: it };
        break;
      }
    }

    if (!found) return;

    this.selectedStock = found;

    // Autofill Brand
    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect && found.brands_id) {
      brandSelect.value = String(found.brands_id);
    }

    // Autofill Unit Cost & Selling Price
    const buyInput = document.getElementById("addStockUnitCost");
    const sellInput = document.getElementById("addStockSellingPrice");
    if (buyInput && found.buy !== undefined) buyInput.value = Number(found.buy).toFixed(2);
    if (sellInput && found.price !== undefined) sellInput.value = Number(found.price).toFixed(2);

    // Autofill GRN
    const grnSelect = document.getElementById("addStockGrnSelect");
    if (grnSelect && found.grn_id) {
      grnSelect.value = String(found.grn_id);
    }

    this.onStockSelected(found);
  }

  /**
   * Reset mode manager to default 'NEW' state.
   */
  reset() {
    this.selectedStock = null;
    const modeNewRadio = document.getElementById("addStockModeNew");
    if (modeNewRadio) modeNewRadio.checked = true;
    this.setMode("NEW");

    const batchOptNew = document.getElementById("addStockBatchOptNew");
    if (batchOptNew) batchOptNew.checked = true;

    const batchWrap = document.getElementById("addStockExistingBatchWrap");
    if (batchWrap) batchWrap.style.display = "none";

    const existingSelect = document.getElementById("addStockExistingSelect");
    if (existingSelect) existingSelect.value = "";

    const batchSelect = document.getElementById("addStockBatchSelect");
    if (batchSelect) batchSelect.innerHTML = '<option value="">-- Select Existing Batch No --</option>';
  }
}

export default StockModeManager;
