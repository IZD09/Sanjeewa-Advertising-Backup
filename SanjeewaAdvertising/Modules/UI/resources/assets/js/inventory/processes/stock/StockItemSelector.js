/**
 * SanjeewaAdvertising - Stock Item Selector
 *
 * Handles SKU selection, interactive search dropdown, category/subcategory cascading,
 * and compatible brand resolution in the Add Stock Modal.
 * Aligned with GRN-first workflow: filters items based on selected GRN / Purchase Orders.
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
   */
  constructor(options = {}) {
    this.getItems = options.getItems || (() => []);
    this.getCategories = options.getCategories || (() => []);
    this.getBrands = options.getBrands || (() => []);
    this.onItemSelected = options.onItemSelected || (() => {});
    this.onItemCleared = options.onItemCleared || (() => {});
    this.onCategoryChanged = options.onCategoryChanged || (() => {});

    this.selectedItem = null;
    this.activeGrn = null;
    this.activeGrnItems = [];
  }

  /**
   * Bind event listeners for SKU search input, category select, and clear button.
   */
  bindEvents() {
    // Search input
    const searchInput = document.getElementById("addStockItemSearch");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => this.searchAndRender(e.target.value));
      searchInput.addEventListener("focus", (e) => this.searchAndRender(e.target.value));
    }

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("addStockItemResultsDropdown");
      const searchBox = document.getElementById("addStockItemSearchBoxWrap");
      if (dropdown && searchBox && !searchBox.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    // Category change cascading
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => this.handleCategoryChange(e.target.value));
    }

    // Clear / Change selected item button
    const changeBtn = document.getElementById("addStockChangeItemBtn");
    if (changeBtn) {
      changeBtn.addEventListener("click", () => this.clearSelection());
    }
  }

  /**
   * Set active GRN context and update filterable item pool.
   * @param {Object|null} grn
   */
  setGrnContext(grn) {
    this.activeGrn = grn || null;
    this.activeGrnItems = (grn?.items && Array.isArray(grn.items)) ? grn.items : [];

    const searchInput = document.getElementById("addStockItemSearch");
    const itemHint = document.getElementById("addStockItemHint");

    // If currently selected item does not belong to newly selected GRN, clear it
    if (this.selectedItem && this.activeGrnItems.length > 0) {
      const existsInGrn = this.activeGrnItems.some(
        (it) => Number(it.id) === Number(this.selectedItem.id)
      );
      if (!existsInGrn) {
        this.clearSelection();
      }
    }

    if (!this.activeGrn) {
      if (searchInput) searchInput.placeholder = "Select a GRN Reference above first...";
      if (itemHint) itemHint.textContent = "Please select a GRN Reference above first.";
    } else if (this.activeGrnItems.length > 0) {
      const count = this.activeGrnItems.length;
      if (searchInput) {
        searchInput.placeholder = `Click to choose or type to search ${count} item(s) in this GRN...`;
      }
      if (itemHint) {
        const poText = this.activeGrn.po_numbers ? ` (${this.activeGrn.po_numbers})` : "";
        const supText = this.activeGrn.supplier_name ? ` - Supplier: ${this.activeGrn.supplier_name}` : "";
        itemHint.textContent = `${count} Purchase Order item(s) available for this GRN${poText}${supText}`;
      }
    } else {
      if (searchInput) {
        searchInput.placeholder = "No PO items found for this GRN. Search all master items...";
      }
      if (itemHint) {
        itemHint.textContent = "No specific PO items linked to this GRN. All inventory items are available.";
      }
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
   * Filter and render items in the searchable dropdown based on active GRN.
   * @param {string} query
   */
  searchAndRender(query = "") {
    const dropdown = document.getElementById("addStockItemResultsDropdown");
    if (!dropdown) return;

    const term = (query || "").toLowerCase().trim();

    // Use items linked to this GRN if available; otherwise use all master items
    const pool = (this.activeGrn && this.activeGrnItems && this.activeGrnItems.length > 0)
      ? this.activeGrnItems
      : this.getItems();

    let matches = pool;
    if (term) {
      matches = pool.filter(
        (it) => (it.name && it.name.toLowerCase().includes(term)) || (it.code && it.code.toLowerCase().includes(term))
      );
    }

    dropdown.innerHTML = "";
    if (matches.length === 0) {
      const msg = (this.activeGrn && this.activeGrnItems.length > 0)
        ? "No matching items found in this GRN's Purchase Orders"
        : "No matching items found";
      dropdown.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12px;">${msg}</div>`;
      dropdown.style.display = "block";
      return;
    }

    // Add section header if showing GRN-specific items
    if (this.activeGrn && this.activeGrnItems.length > 0) {
      const header = document.createElement("div");
      header.style.cssText = "padding: 6px 12px; background: rgba(22, 119, 255, 0.06); font-size: 11px; font-weight: 700; color: #1677ff; border-bottom: 1px solid var(--border);";
      header.innerHTML = `<i class="fa-solid fa-list-check"></i> Items from ${this.activeGrn.po_numbers || `GRN #${this.activeGrn.id}`}`;
      dropdown.appendChild(header);
    }

    matches.slice(0, 15).forEach((item) => {
      const row = document.createElement("div");
      row.style.cssText = "padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;";

      const poBadge = item.po_id ? `<span style="font-size: 10px; background: rgba(22,119,255,0.1); color: #1677ff; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">PO #${item.po_id}</span>` : "";
      const costBadge = (item.unit_cost && item.unit_cost > 0)
        ? `<span style="font-size: 11px; font-weight: 600; color: #52c41a; margin-right: 8px;">Rs. ${Number(item.unit_cost).toFixed(2)}</span>`
        : "";

      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span class="inv-item-code" style="font-size: 11px; font-weight: 700; color: #1677ff;">${item.code}</span>
          <span style="font-weight: 600; font-size: 12px; color: var(--text);">${item.name}</span>
          ${poBadge}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          ${costBadge}
          <span class="inv-cat-pill" style="font-size: 10px; padding: 2px 6px;">${item.category_name || "General"}</span>
        </div>
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
   * Set the active item SKU and automatically select its Category, Subcategory, and Brand.
   * @param {Object} item
   */
  selectItem(item) {
    if (!item) return;

    // Resolve complete master item record if item is from GRN summary
    const masterItems = this.getItems();
    const fullItem = masterItems.find((it) => Number(it.id) === Number(item.id)) || item;
    this.selectedItem = fullItem;

    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = String(fullItem.id);

    const searchWrap = document.getElementById("addStockItemSearchBoxWrap");
    const displayWrap = document.getElementById("addStockSelectedItemDisplay");
    const codeEl = document.getElementById("addStockPickedCode");
    const nameEl = document.getElementById("addStockPickedName");
    const catEl = document.getElementById("addStockPickedCategory");

    if (searchWrap) searchWrap.style.display = "none";
    if (displayWrap) displayWrap.style.display = "flex";
    if (codeEl) codeEl.textContent = fullItem.code || "";
    if (nameEl) nameEl.textContent = fullItem.name || "";
    if (catEl) catEl.textContent = `${fullItem.category_name || "General"} / ${fullItem.subcategory_name || "General"}`;

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
      const compatible = Array.isArray(fullItem.compatible_brands) && fullItem.compatible_brands.length > 0
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

    // 3. Automatically populate Unit Purchase Cost from PO if available
    const unitCostInput = document.getElementById("addStockUnitCost");
    const purchaseCost = item.unit_cost || fullItem.unit_cost || 0;
    if (unitCostInput && purchaseCost > 0) {
      unitCostInput.value = Number(purchaseCost).toFixed(2);

      // Auto-populate suggested Standard Selling Price if empty (e.g. 25% markup)
      const sellingPriceInput = document.getElementById("addStockSellingPrice");
      if (sellingPriceInput && (!sellingPriceInput.value || parseFloat(sellingPriceInput.value) === 0)) {
        const markup = (Number(purchaseCost) * 1.25).toFixed(2);
        sellingPriceInput.value = markup;
      }
    }

    // 4. Automatically populate Quantity Received if pending PO quantity exists
    const qtyInput = document.getElementById("addStockQty");
    if (qtyInput && (!qtyInput.value || parseInt(qtyInput.value, 10) === 0)) {
      if (item.qty_ordered) {
        const remaining = Math.max(1, (item.qty_ordered || 0) - (item.qty_received || 0));
        qtyInput.value = remaining;
      }
    }

    this.onItemSelected(fullItem);
  }

  /**
   * Clear the active SKU and revert to search input.
   */
  clearSelection() {
    this.selectedItem = null;
    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = "";

    const searchWrap = document.getElementById("addStockItemSearchBoxWrap");
    const displayWrap = document.getElementById("addStockSelectedItemDisplay");
    const searchInput = document.getElementById("addStockItemSearch");

    if (displayWrap) displayWrap.style.display = "none";
    if (searchWrap) searchWrap.style.display = "block";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    this.onItemCleared();
  }

  /**
   * Reset the selector state completely.
   */
  reset() {
    this.clearSelection();
    this.activeGrn = null;
    this.activeGrnItems = [];

    const catSelect = document.getElementById("addStockCategorySelect");
    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (catSelect) catSelect.value = "";
    if (subcatSelect) {
      subcatSelect.value = "";
      subcatSelect.disabled = true;
    }

    const itemHint = document.getElementById("addStockItemHint");
    if (itemHint) itemHint.textContent = "Search or select items under this GRN's Purchase Orders";
  }
}

export default StockItemSelector;
