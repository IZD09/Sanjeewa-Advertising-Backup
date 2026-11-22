/**
 * SanjeewaAdvertising - Create Purchase Order (PO) Modal UI Handler
 *
 * Manages DOM rendering, supplier search dropdown, category/subcategory filters,
 * database catalog items dropdown, and PO items table rows using CreatePoItemRowBuilder.
 */

import { CreatePoItemRowBuilder } from "../builders/CreatePoItemRowBuilder.js";

export class CreatePoHandler {
  /**
   * @param {Object} options
   * @param {import("../processes/CreatePoProcess.js").CreatePoProcess} options.process
   * @param {Object} options.ctx
   * @param {Object} options.callbacks
   */
  constructor({ process, ctx = {}, callbacks = {} }) {
    this.process = process;
    this.ctx = ctx;
    this.callbacks = callbacks;
  }

  /**
   * Escape HTML helper
   * @param {*} str
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Populate Category filter select (#newPoItemCategoryFilter) and cascade subcategory filter.
   */
  populateCategoryFilters() {
    const catSelect = document.getElementById("newPoItemCategoryFilter");
    if (!catSelect) return;

    let optionsHtml = '<option value="ALL">All Categories</option>';
    if (Array.isArray(this.process.dbCategories) && this.process.dbCategories.length > 0) {
      optionsHtml += this.process.dbCategories
        .map(c => `<option value="${this.escapeHtml(String(c.id))}">${this.escapeHtml(c.category)}</option>`)
        .join("");
    } else {
      const categories = Array.from(
        new Set((this.process.catalogItems || []).map(it => it.category).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b));
      optionsHtml += categories
        .map(c => `<option value="${this.escapeHtml(c)}">${this.escapeHtml(c)}</option>`)
        .join("");
    }

    catSelect.innerHTML = optionsHtml;
    catSelect.value = this.process.selectedCategory || "ALL";

    this.populateSubcategoryFilter();
  }

  /**
   * Populate Subcategory filter select (#newPoItemSubcategoryFilter) based on selectedCategory.
   */
  populateSubcategoryFilter() {
    const subcatSelect = document.getElementById("newPoItemSubcategoryFilter");
    if (!subcatSelect) return;

    if (!this.process.selectedCategory || this.process.selectedCategory === "ALL") {
      subcatSelect.innerHTML = '<option value="ALL">-- Select Category First --</option>';
      subcatSelect.value = "ALL";
      subcatSelect.disabled = true;
      subcatSelect.style.opacity = "0.6";
      subcatSelect.style.cursor = "not-allowed";
      this.process.selectedSubcategory = "ALL";
      return;
    }

    subcatSelect.disabled = false;
    subcatSelect.style.opacity = "1";
    subcatSelect.style.cursor = "pointer";

    let subOptions = [];
    if (Array.isArray(this.process.dbCategories) && this.process.dbCategories.length > 0) {
      const matchedCat = this.process.dbCategories.find(
        c => String(c.id) === String(this.process.selectedCategory) || c.category === this.process.selectedCategory
      );
      if (matchedCat && Array.isArray(matchedCat.subcategories)) {
        subOptions = matchedCat.subcategories.map(sc => ({
          value: String(sc.id),
          label: sc.subcategory
        }));
      }
    } else {
      const items = (this.process.catalogItems || []).filter(it => it.category === this.process.selectedCategory);
      subOptions = Array.from(new Set(items.map(it => it.subcategory).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b))
        .map(sc => ({ value: sc, label: sc }));
    }

    subcatSelect.innerHTML =
      '<option value="ALL">All Subcategories</option>' +
      subOptions.map(sc => `<option value="${this.escapeHtml(sc.value)}">${this.escapeHtml(sc.label)}</option>`).join("");

    const hasCurrent = subOptions.some(sc => sc.value === String(this.process.selectedSubcategory));
    subcatSelect.value = hasCurrent ? String(this.process.selectedSubcategory) : "ALL";
    this.process.selectedSubcategory = subcatSelect.value;
  }

  /**
   * Render loading spinner inside #newPoItemSearchDropdown.
   */
  renderCatalogLoadingDropdown() {
    const dropdown = document.getElementById("newPoItemSearchDropdown");
    if (!dropdown) return;
    dropdown.innerHTML = `
      <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
        <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px; color: #1677ff;"></i>
        Loading material stock items from database...
      </div>`;
    dropdown.style.display = "block";
  }

  /**
   * Search and render matching stock items dropdown (#newPoItemSearchDropdown).
   * @param {string} [query=""]
   */
  searchAndRenderCatalogItems(query = "") {
    const dropdown = document.getElementById("newPoItemSearchDropdown");
    if (!dropdown) return;

    const term = (query || "").toLowerCase().trim();
    let matches = this.process.catalogItems || [];

    if (this.process.selectedCategory && this.process.selectedCategory !== "ALL") {
      matches = matches.filter(it =>
        String(it.category_id) === String(this.process.selectedCategory) || it.category === this.process.selectedCategory
      );
    }

    if (this.process.selectedSubcategory && this.process.selectedSubcategory !== "ALL") {
      matches = matches.filter(it =>
        String(it.subcategory_id) === String(this.process.selectedSubcategory) || it.subcategory === this.process.selectedSubcategory
      );
    }

    if (term) {
      matches = matches.filter(
        (it) =>
          (it.name && it.name.toLowerCase().includes(term)) ||
          (it.code && it.code.toLowerCase().includes(term)) ||
          (it.category && it.category.toLowerCase().includes(term)) ||
          (it.subcategory && it.subcategory.toLowerCase().includes(term))
      );
    }

    dropdown.innerHTML = "";
    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px; color: #faad14;"></i>
          No matching material stock items found in database
        </div>`;
      dropdown.style.display = "block";
      return;
    }

    const header = document.createElement("div");
    header.style.cssText =
      "padding: 7px 12px; background: #f0f7ff; font-size: 11px; font-weight: 700; color: #1677ff; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 2;";
    header.innerHTML = `
      <span><i class="fa-solid fa-database"></i> Database Items (${matches.length})</span>
      <span style="font-size: 10.5px; font-weight: 500; color: var(--text-muted);">Click an item to add to Purchase Order</span>
    `;
    dropdown.appendChild(header);

    matches.slice(0, 50).forEach((item) => {
      const row = CreatePoItemRowBuilder.buildCatalogDropdownRow(
        item,
        (str) => this.escapeHtml(str),
        (selectedItem) => {
          if (typeof this.callbacks.onAddItemToPo === "function") {
            this.callbacks.onAddItemToPo(selectedItem);
          }
          dropdown.style.display = "none";
        }
      );
      dropdown.appendChild(row);
    });

    dropdown.style.display = "block";
  }

  /**
   * Toggle supplier dropdown visibility (#newPoSuppDropdown).
   */
  toggleSupplierDropdown() {
    const dropdown = document.getElementById("newPoSuppDropdown");
    if (!dropdown) return;

    if (dropdown.style.display === "block") {
      this.hideSupplierDropdown();
    } else {
      const searchInput = document.getElementById("newPoSuppSearchInput");
      this.renderSupplierDropdown(searchInput ? searchInput.value : "");
    }
  }

  /**
   * Hide supplier dropdown (#newPoSuppDropdown).
   */
  hideSupplierDropdown() {
    const dropdown = document.getElementById("newPoSuppDropdown");
    const icon = document.getElementById("newPoSuppDropdownIcon");
    if (dropdown) dropdown.style.display = "none";
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }

  /**
   * Render supplier search dropdown (#newPoSuppDropdown).
   * @param {string} [query=""]
   */
  renderSupplierDropdown(query = "") {
    const dropdown = document.getElementById("newPoSuppDropdown");
    const icon = document.getElementById("newPoSuppDropdownIcon");
    if (!dropdown) return;

    const suppliers = (this.ctx.getSuppliers ? this.ctx.getSuppliers() : [])
      .filter(s => (s.status || "Active").toLowerCase() !== "disabled");

    const q = String(query || "").trim().toLowerCase();
    const matches = q
      ? suppliers.filter(s =>
          String(s.name || "").toLowerCase().includes(q) ||
          String(s.mobile || s.phone || "").toLowerCase().includes(q) ||
          String(s.code || "").toLowerCase().includes(q)
        )
      : suppliers;

    dropdown.innerHTML = CreatePoItemRowBuilder.buildSupplierDropdownHtml(
      matches,
      query,
      (str) => this.escapeHtml(str)
    );

    dropdown.querySelectorAll(".newpo-supp-item").forEach(item => {
      item.addEventListener("mouseenter", () => (item.style.backgroundColor = "var(--surface-2, rgba(22,119,255,0.05))"));
      item.addEventListener("mouseleave", () => (item.style.backgroundColor = ""));
    });

    dropdown.style.display = "block";
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  }

  /**
   * Render selected supplier card in Create PO Modal.
   * @param {Object} supplier
   */
  renderSelectedSupplierCard(supplier) {
    if (!supplier) return;
    const searchGroup = document.getElementById("newPoSuppSearchGroup");
    const card = document.getElementById("newPoSelectedSupplierCard");
    const nameEl = document.getElementById("newPoSelectedSuppName");
    const metaEl = document.getElementById("newPoSelectedSuppMeta");
    const hiddenName = document.getElementById("newPoSupplier");
    const hiddenId = document.getElementById("newPoSupplierId");

    const phone = supplier.mobile || supplier.phone || "No Phone";
    const code = supplier.code || (supplier.id ? `SUP-${String(supplier.id).padStart(3, "0")}` : "SUP");

    if (searchGroup) searchGroup.style.display = "none";
    if (card) card.style.display = "flex";
    if (nameEl) nameEl.textContent = supplier.name;
    if (metaEl) metaEl.textContent = `${phone} • ${code}`;
    if (hiddenName) hiddenName.value = supplier.name;
    if (hiddenId) hiddenId.value = supplier.id || "";
  }

  /**
   * Reset selected supplier UI elements in Create PO Modal.
   */
  resetSelectedSupplierUI() {
    const searchGroup = document.getElementById("newPoSuppSearchGroup");
    const searchInput = document.getElementById("newPoSuppSearchInput");
    const card = document.getElementById("newPoSelectedSupplierCard");
    const hiddenName = document.getElementById("newPoSupplier");
    const hiddenId = document.getElementById("newPoSupplierId");

    if (searchGroup) searchGroup.style.display = "block";
    if (searchInput) searchInput.value = "";
    if (card) card.style.display = "none";
    if (hiddenName) hiddenName.value = "";
    if (hiddenId) hiddenId.value = "";
    this.hideSupplierDropdown();
  }

  /**
   * Render Purchase Order line items table (#newPoItemsTbody).
   */
  renderNewPoItems() {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (this.process.newPoItems.length === 0) {
      tbody.appendChild(CreatePoItemRowBuilder.buildEmptyRow());
      return;
    }

    this.process.newPoItems.forEach((row, index) => {
      const entity = new CreatePoItemRowBuilder(row)
        .setIndex(index)
        .setCurrencyFormatter(this.ctx.formatCurrency)
        .build();
      tbody.appendChild(entity.render());
    });
  }

  /**
   * Update the total cell display of a single row in #newPoItemsTbody.
   * @param {number} index
   */
  renderNewPoRowTotal(index) {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody || !this.process.newPoItems[index]) return;
    const tr = tbody.children[index];
    if (tr) {
      const totalTd = tr.children[4];
      if (totalTd) {
        totalTd.textContent = this.ctx.formatCurrency
          ? this.ctx.formatCurrency(this.process.newPoItems[index].total)
          : `Rs. ${(parseFloat(this.process.newPoItems[index].total) || 0).toFixed(2)}`;
      }
    }
  }

  /**
   * Update the grand total display (#newPoTotalDisplay).
   * @param {number} total
   */
  updateNewPoTotalDisplay(total) {
    const display = document.getElementById("newPoTotalDisplay");
    if (display) {
      display.textContent = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(total)
        : `Rs. ${(parseFloat(total) || 0).toFixed(2)}`;
    }
  }
}

export default CreatePoHandler;
