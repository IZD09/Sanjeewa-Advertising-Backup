/**
 * SanjeewaAdvertising - Stock Item Selector
 *
 * Handles SKU selection, item dropdown rendering, category/subcategory cascading,
 * and compatible brand resolution in the Add Stock Modal.
 * Aligned with GRN-first workflow: automatically loads un-stocked Purchase Order items
 * under the selected GRN, loads financial data, and removes stocked items.
 */

export class StockItemSelector {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getItems] - Returns all stock items list
   * @param {Function} [options.getCategories] - Returns categories list
   * @param {Function} [options.getBrands] - Returns brands list
   * @param {Function} [options.onItemSelected] - Callback when an item is chosen
   * @param {Function} [options.onItemCleared] - Callback when selection is cleared
   * @param {Function} [options.onCategoryChanged] - Callback when category is changed
   * @param {Function} [options.onCalculate] - Callback to recalculate live financials
   */
  constructor(options = {}) {
    this.getItems = options.getItems || (() => []);
    this.getCategories = options.getCategories || (() => []);
    this.getBrands = options.getBrands || (() => []);
    this.onItemSelected = options.onItemSelected || (() => {});
    this.onItemCleared = options.onItemCleared || (() => {});
    this.onCategoryChanged = options.onCategoryChanged || (() => {});
    this.onCalculate = options.onCalculate || (() => {});
    this.onGrnAllStocked = options.onGrnAllStocked || (() => {});

    this.selectedItem = null;
    this.activeGrn = null;
    this.activeGrnItems = [];
  }

  /**
   * Bind event listeners for SKU select, category select, and clear button.
   */
  bindEvents() {
    // Select dropdown change
    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect) {
      itemSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!val) {
          this.clearSelection();
          return;
        }
        const item =
          this.activeGrnItems.find((it) => String(it.id) === String(val)) ||
          this.getItems().find((it) => String(it.id) === String(val));
        if (item) {
          this.selectItem(item);
        }
      });
    }

    // Category change cascading
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => this.handleCategoryChange(e.target.value));
    }
  }

  /**
   * Set active GRN context, populate un-stocked items into Select Material Item (SKU),
   * and automatically select the first un-stocked item with its financial calculations.
   *
   * @param {Object|null} grn
   */
  setGrnContext(grn) {
    this.activeGrn = grn || null;
    this.activeGrnItems = grn?.items && Array.isArray(grn.items) ? [...grn.items] : [];

    const itemSelect = document.getElementById("addStockItemSelect");
    const itemHint = document.getElementById("addStockItemHint");
    const idInput = document.getElementById("addStockSelectedItemId");

    if (!itemSelect) return;

    itemSelect.innerHTML = "";

    if (!this.activeGrn) {
      itemSelect.innerHTML = '<option value="">-- Select a GRN Reference above first --</option>';
      itemSelect.disabled = true;
      if (itemHint) itemHint.textContent = "Please select a GRN Reference above first.";
      if (idInput) idInput.value = "";
      this.clearSelection();
      return;
    }

    itemSelect.disabled = false;

    if (this.activeGrnItems.length > 0) {
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = `-- Select Material Item (${this.activeGrnItems.length} pending) --`;
      itemSelect.appendChild(defaultOpt);

      this.activeGrnItems.forEach((item) => {
        const poBadge = item.po_id ? `[PO #${item.po_id}] ` : "";
        const costText = item.unit_cost !== undefined ? ` | Cost: Rs. ${Number(item.unit_cost).toFixed(2)}` : "";
        const qtyText = item.qty !== undefined ? ` | Qty: ${item.qty}` : "";
        const opt = document.createElement("option");
        opt.value = String(item.id);
        opt.textContent = `${poBadge}${item.code} - ${item.name} (${item.category_name || "General"}${qtyText}${costText})`;
        itemSelect.appendChild(opt);
      });

      if (itemHint) {
        const poText = this.activeGrn.po_numbers ? ` (${this.activeGrn.po_numbers})` : "";
        const supText = this.activeGrn.supplier_name ? ` - Supplier: ${this.activeGrn.supplier_name}` : "";
        itemHint.textContent = `${this.activeGrnItems.length} unstocked Purchase Order item(s) available for this GRN${poText}${supText}`;
      }

      // Automatically select and load the first un-stocked item!
      const firstItem = this.activeGrnItems[0];
      itemSelect.value = String(firstItem.id);
      this.selectItem(firstItem);
    } else {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "-- All items under this GRN already added to stock --";
      itemSelect.appendChild(opt);

      if (itemHint) {
        itemHint.textContent = "All Purchase Order items under this GRN have already been added to stock.";
      }
      if (idInput) idInput.value = "";
      this.clearSelection();
    }
  }

  /**
   * Cascade Subcategories when Category is selected.
   * @param {string|number} catId
   */
  handleCategoryChange(catId) {
    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (!subcatSelect) return;

    subcatSelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
    if (!catId) {
      subcatSelect.disabled = true;
      this.onCategoryChanged(null);
      return;
    }

    const categories = this.getCategories();
    const cat = categories.find((c) => String(c.id) === String(catId));
    (cat?.subcategories || []).forEach((sub) => {
      subcatSelect.insertAdjacentHTML("beforeend", `<option value="${sub.id}">${sub.subcategory}</option>`);
    });
    subcatSelect.disabled = false;
    this.onCategoryChanged(catId);
  }

  /**
   * Set the active item SKU and automatically select its Category, Subcategory, Brand,
   * populate Quantity Received, Unit Purchase Cost, Standard Selling Price,
   * and trigger live financial calculations.
   *
   * @param {Object} item
   */
  selectItem(item) {
    if (!item) return;

    const masterItems = this.getItems();
    const fullItem = masterItems.find((it) => Number(it.id) === Number(item.id)) || item;
    this.selectedItem = fullItem;

    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = String(fullItem.id);

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect && itemSelect.value !== String(fullItem.id)) {
      itemSelect.value = String(fullItem.id);
    }

    // 1. Automatically select Category & Subcategory
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect && fullItem.category_id) {
      catSelect.value = String(fullItem.category_id);
      this.handleCategoryChange(fullItem.category_id);
      const subcatSelect = document.getElementById("addStockSubcategorySelect");
      if (subcatSelect && fullItem.subcategories_id) {
        subcatSelect.value = String(fullItem.subcategories_id);
      }
    }

    // 2. Automatically select Brand (from compatible brands)
    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect) {
      const compatible =
        Array.isArray(fullItem.compatible_brands) && fullItem.compatible_brands.length > 0
          ? fullItem.compatible_brands
          : this.getBrands();

      if (compatible.length > 0) {
        brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
        compatible.forEach((b) => {
          brandSelect.insertAdjacentHTML("beforeend", `<option value="${b.id}">${b.brand}</option>`);
        });
        brandSelect.value = String(compatible[0].id);
      }
    }

    // 3. Automatically populate Quantity Received
    const qtyInput = document.getElementById("addStockQty");
    const qtyVal = item.qty || item.qty_received || item.qty_ordered || 1;
    if (qtyInput) {
      qtyInput.value = qtyVal;
    }

    // 4. Automatically populate Unit Purchase Cost (LKR)
    const unitCostInput = document.getElementById("addStockUnitCost");
    const purchaseCost = item.unit_cost !== undefined ? item.unit_cost : (fullItem.unit_cost || 0);
    if (unitCostInput) {
      unitCostInput.value = Number(purchaseCost).toFixed(2);
    }

    // 5. Automatically populate Standard Selling Price (LKR)
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    if (sellingPriceInput) {
      const sellPrice =
        item.selling_price !== undefined
          ? item.selling_price
          : fullItem.selling_price || (purchaseCost > 0 ? Number(purchaseCost) * 1.25 : 0);
      sellingPriceInput.value = Number(sellPrice).toFixed(2);
    }

    // 6. Notify callbacks and calculate financials immediately
    this.onItemSelected(fullItem);
    this.onCalculate();
  }

  /**
   * Remove an item from the active GRN pool once it has been added to stock.
   *
   * @param {string|number} itemId
   */
  removeItemFromGrn(itemId) {
    if (!itemId) return;
    this.activeGrnItems = this.activeGrnItems.filter((it) => Number(it.id) !== Number(itemId));

    const itemSelect = document.getElementById("addStockItemSelect");
    const itemHint = document.getElementById("addStockItemHint");

    if (!itemSelect) return;

    itemSelect.innerHTML = "";

    if (this.activeGrnItems.length > 0) {
      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = `-- Select Material Item (${this.activeGrnItems.length} pending) --`;
      itemSelect.appendChild(defaultOpt);

      this.activeGrnItems.forEach((item) => {
        const poBadge = item.po_id ? `[PO #${item.po_id}] ` : "";
        const costText = item.unit_cost !== undefined ? ` | Cost: Rs. ${Number(item.unit_cost).toFixed(2)}` : "";
        const qtyText = item.qty !== undefined ? ` | Qty: ${item.qty}` : "";
        const opt = document.createElement("option");
        opt.value = String(item.id);
        opt.textContent = `${poBadge}${item.code} - ${item.name} (${item.category_name || "General"}${qtyText}${costText})`;
        itemSelect.appendChild(opt);
      });

      if (itemHint) {
        itemHint.textContent = `${this.activeGrnItems.length} unstocked Purchase Order item(s) pending for this GRN`;
      }

      // Auto-select the next un-stocked item!
      const nextItem = this.activeGrnItems[0];
      itemSelect.value = String(nextItem.id);
      this.selectItem(nextItem);
    } else {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "-- All items under this GRN already added to stock --";
      itemSelect.appendChild(opt);

      if (itemHint) {
        itemHint.textContent = "All Purchase Order items under this GRN have already been added to stock.";
      }
      this.clearSelection();

      if (typeof this.onGrnAllStocked === "function" && this.activeGrn) {
        this.onGrnAllStocked(this.activeGrn);
      }
    }
  }

  /**
   * Clear active SKU selection and reset inputs.
   */
  clearSelection() {
    this.selectedItem = null;
    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = "";

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect && (!itemSelect.value || this.activeGrnItems.length === 0)) {
      itemSelect.value = "";
    }

    if (this.activeGrnItems.length === 0) {
      const qtyInput = document.getElementById("addStockQty");
      const unitCostInput = document.getElementById("addStockUnitCost");
      const sellingPriceInput = document.getElementById("addStockSellingPrice");

      if (qtyInput) qtyInput.value = "";
      if (unitCostInput) unitCostInput.value = "";
      if (sellingPriceInput) sellingPriceInput.value = "";
    }

    this.onItemCleared();
    this.onCalculate();
  }

  /**
   * Reset the selector state completely.
   */
  reset() {
    this.clearSelection();
    this.activeGrn = null;
    this.activeGrnItems = [];

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect) {
      itemSelect.innerHTML = '<option value="">-- Select Material Item (SKU) --</option>';
      itemSelect.value = "";
    }

    const catSelect = document.getElementById("addStockCategorySelect");
    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (catSelect) catSelect.value = "";
    if (subcatSelect) {
      subcatSelect.value = "";
      subcatSelect.disabled = true;
    }

    const itemHint = document.getElementById("addStockItemHint");
    if (itemHint) itemHint.textContent = "Pending Purchase Order items for this GRN";
  }
}

export default StockItemSelector;
