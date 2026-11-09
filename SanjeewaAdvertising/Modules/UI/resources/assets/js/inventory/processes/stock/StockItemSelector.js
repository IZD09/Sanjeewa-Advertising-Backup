/**
 * SanjeewaAdvertising - Stock Item Selector
 *
 * Handles SKU selection, interactive search dropdown, category/subcategory cascading,
 * and compatible brand resolution in the Add Stock Modal.
 */

export class StockItemSelector {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getItems] - Returns stock items list
   * @param {Function} [options.getCategories] - Returns categories list
   * @param {Function} [options.onItemSelected] - Callback when an item is chosen
   * @param {Function} [options.onItemCleared] - Callback when selection is cleared
   * @param {Function} [options.onCategoryChanged] - Callback when category is changed
   */
  constructor(options = {}) {
    this.getItems = options.getItems || (() => []);
    this.getCategories = options.getCategories || (() => []);
    this.onItemSelected = options.onItemSelected || (() => {});
    this.onItemCleared = options.onItemCleared || (() => {});
    this.onCategoryChanged = options.onCategoryChanged || (() => {});

    this.selectedItem = null;
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
   * Filter and render items in the searchable dropdown.
   * @param {string} query
   */
  searchAndRender(query = "") {
    const dropdown = document.getElementById("addStockItemResultsDropdown");
    if (!dropdown) return;

    const term = (query || "").toLowerCase().trim();
    const catId = document.getElementById("addStockCategorySelect")?.value;
    const subcatId = document.getElementById("addStockSubcategorySelect")?.value;

    let matches = this.getItems();
    if (catId) matches = matches.filter((it) => String(it.category_id) === String(catId));
    if (subcatId) matches = matches.filter((it) => String(it.subcategories_id) === String(subcatId));
    if (term) {
      matches = matches.filter(
        (it) => (it.name && it.name.toLowerCase().includes(term)) || (it.code && it.code.toLowerCase().includes(term))
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
        <span class="inv-cat-pill" style="font-size: 10px; padding: 2px 6px;">${item.category_name || "General"}</span>
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
   * Set the active item SKU and update displays.
   * @param {Object} item
   */
  selectItem(item) {
    if (!item) return;
    this.selectedItem = item;

    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = String(item.id);

    const searchWrap = document.getElementById("addStockItemSearchBoxWrap");
    const displayWrap = document.getElementById("addStockSelectedItemDisplay");
    const codeEl = document.getElementById("addStockPickedCode");
    const nameEl = document.getElementById("addStockPickedName");
    const catEl = document.getElementById("addStockPickedCategory");

    if (searchWrap) searchWrap.style.display = "none";
    if (displayWrap) displayWrap.style.display = "flex";
    if (codeEl) codeEl.textContent = item.code || "";
    if (nameEl) nameEl.textContent = item.name || "";
    if (catEl) catEl.textContent = `${item.category_name || "General"} / ${item.subcategory_name || "General"}`;

    // Auto-select Category & Subcategory in dropdowns
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect && item.category_id) {
      catSelect.value = String(item.category_id);
      this.handleCategoryChange(item.category_id);
      const subcatSelect = document.getElementById("addStockSubcategorySelect");
      if (subcatSelect && item.subcategories_id) {
        subcatSelect.value = String(item.subcategories_id);
      }
    }

    // Auto-populate Brand dropdown with compatible brands
    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect && Array.isArray(item.compatible_brands) && item.compatible_brands.length > 0) {
      brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
      item.compatible_brands.forEach((b) => {
        brandSelect.insertAdjacentHTML("beforeend", `<option value="${b.id}">${b.brand}</option>`);
      });
      brandSelect.value = String(item.compatible_brands[0].id);
    }

    this.onItemSelected(item);
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
    const catSelect = document.getElementById("addStockCategorySelect");
    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (catSelect) catSelect.value = "";
    if (subcatSelect) {
      subcatSelect.value = "";
      subcatSelect.disabled = true;
    }
  }
}

export default StockItemSelector;
