/**
 * SanjeewaAdvertising - Create GRN Modal UI Handler
 *
 * Manages DOM rendering, dropdowns, tables, and interactive row wiring
 * for the Create Goods Received Note (GRN) modal using CreateGrnPoRowBuilder
 * and CreateGrnItemRowBuilder.
 */

import { CreateGrnPoRowBuilder } from "../builders/CreateGrnPoRowBuilder.js";
import { CreateGrnItemRowBuilder } from "../builders/CreateGrnItemRowBuilder.js";

export class CreateGrnHandler {
  /**
   * @param {Object} options
   * @param {import("../processes/CreateGrnProcess.js").CreateGrnProcess} options.process
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
   * Reset Supplier & Approved PO selector UI elements.
   */
  resetSupplierUI() {
    const searchGroup = document.getElementById("grnCreateSuppSearchGroup");
    const searchInput = document.getElementById("grnCreateSuppSearchInput");
    const card = document.getElementById("grnCreateSelectedSupplierCard");
    const hiddenId = document.getElementById("grnCreateSelectedSupplierId");
    const dropdown = document.getElementById("grnCreateSuppDropdown");
    const poSelect = document.getElementById("grnModalApprovedPoSelect");
    const addAllBtn = document.getElementById("grnCreateAddAllApprovedPoBtn");
    const chips = document.getElementById("grnCreateApprovedPoChips");
    const hint = document.getElementById("grnModalPoSearchHint");

    if (searchGroup) searchGroup.style.display = "block";
    if (searchInput) searchInput.value = "";
    if (card) card.style.display = "none";
    if (hiddenId) hiddenId.value = "";
    if (dropdown) dropdown.style.display = "none";
    if (addAllBtn) addAllBtn.style.display = "none";
    if (chips) {
      chips.style.display = "none";
      chips.innerHTML = "";
    }
    if (poSelect) {
      poSelect.innerHTML = '<option value="">-- Please select a supplier above first --</option>';
      poSelect.disabled = true;
    }
    if (hint) {
      hint.textContent = "Select a supplier above to view their Approved Purchase Orders";
    }
  }

  /**
   * Toggle supplier dropdown visibility.
   */
  toggleSupplierDropdown() {
    const dropdown = document.getElementById("grnCreateSuppDropdown");
    if (!dropdown) return;

    if (dropdown.style.display === "block") {
      this.hideSupplierDropdown();
    } else {
      const searchInput = document.getElementById("grnCreateSuppSearchInput");
      this.renderSupplierDropdown(searchInput ? searchInput.value : "");
    }
  }

  /**
   * Hide supplier dropdown.
   */
  hideSupplierDropdown() {
    const dropdown = document.getElementById("grnCreateSuppDropdown");
    const icon = document.getElementById("grnCreateSuppDropdownIcon");
    if (dropdown) dropdown.style.display = "none";
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }

  /**
   * Render supplier dropdown showing only suppliers with Approved Purchase Orders.
   * @param {string} [query=""]
   */
  renderSupplierDropdown(query = "") {
    const dropdown = document.getElementById("grnCreateSuppDropdown");
    const icon = document.getElementById("grnCreateSuppDropdownIcon");
    if (!dropdown) return;

    const cleanQuery = String(query || "").trim().toLowerCase();
    let matches = (this.process.suppliers || []).filter(
      s => this.process.getApprovedPOsForSupplier(s).length > 0
    );

    if (cleanQuery) {
      matches = matches.filter(s =>
        String(s.name || "").toLowerCase().includes(cleanQuery) ||
        String(s.mobile || s.phone || "").toLowerCase().includes(cleanQuery) ||
        String(s.code || "").toLowerCase().includes(cleanQuery)
      );
    }

    matches.sort(
      (a, b) => this.process.getApprovedPOsForSupplier(b).length - this.process.getApprovedPOsForSupplier(a).length
    );

    dropdown.innerHTML = CreateGrnPoRowBuilder.buildSupplierDropdownHtml(
      matches,
      query,
      (s) => this.process.getApprovedPOsForSupplier(s).length,
      (str) => this.escapeHtml(str)
    );

    dropdown.querySelectorAll(".grn-create-supp-item").forEach(item => {
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
   * Render the selected supplier card UI.
   * @param {Object} supplier
   */
  renderSelectedSupplierCard(supplier) {
    if (!supplier) return;
    const searchGroup = document.getElementById("grnCreateSuppSearchGroup");
    const card = document.getElementById("grnCreateSelectedSupplierCard");
    const nameEl = document.getElementById("grnCreateSelectedSuppName");
    const metaEl = document.getElementById("grnCreateSelectedSuppMeta");
    const hiddenId = document.getElementById("grnCreateSelectedSupplierId");

    const approvedPOs = this.process.getApprovedPOsForSupplier(supplier);
    const phone = supplier.mobile || supplier.phone || "No Phone";

    if (searchGroup) searchGroup.style.display = "none";
    if (card) card.style.display = "flex";
    if (nameEl) nameEl.textContent = supplier.name;
    if (metaEl) metaEl.textContent = `${phone} • ${approvedPOs.length} Approved PO${approvedPOs.length === 1 ? "" : "s"}`;
    if (hiddenId) hiddenId.value = supplier.id || "";
  }

  /**
   * Populate Approved PO selector dropdown and quick-add chips for the selected supplier.
   */
  populateApprovedPoSelector() {
    const poSelect = document.getElementById("grnModalApprovedPoSelect");
    const addAllBtn = document.getElementById("grnCreateAddAllApprovedPoBtn");
    const chipsContainer = document.getElementById("grnCreateApprovedPoChips");
    const hintEl = document.getElementById("grnModalPoSearchHint");

    const supplier = this.process.selectedSupplier;
    if (!supplier) {
      this.resetSupplierUI();
      return;
    }

    const approvedPOs = this.process.getApprovedPOsForSupplier(supplier);
    const selectedNumbers = this.process.selectedPurchaseOrders.map(p => p.po_number);
    const available = approvedPOs.filter(po => !selectedNumbers.includes(po.po_number));

    if (poSelect) {
      poSelect.disabled = false;
      if (available.length === 0) {
        poSelect.innerHTML = approvedPOs.length === 0
          ? `<option value="">No Approved Purchase Orders found for ${this.escapeHtml(supplier.name)}</option>`
          : `<option value="">All Approved POs for ${this.escapeHtml(supplier.name)} are linked (${this.process.selectedPurchaseOrders.length} linked)</option>`;
      } else {
        poSelect.innerHTML =
          `<option value="">-- Select Approved PO to Add (${available.length} available) --</option>` +
          available.map(po => {
            const itemCount = po.items ? po.items.length : 0;
            const totalFmt = this.ctx.formatCurrency
              ? this.ctx.formatCurrency(po.total_amount)
              : `Rs. ${Number(po.total_amount || 0).toFixed(2)}`;
            return `<option value="${this.escapeHtml(po.po_number)}">${this.escapeHtml(po.po_number)} • ${po.order_date || ""} (${itemCount} items | ${totalFmt})</option>`;
          }).join("");
      }
    }

    if (addAllBtn) {
      addAllBtn.style.display = available.length > 1 ? "inline-flex" : "none";
    }

    if (hintEl) {
      hintEl.textContent = approvedPOs.length > 0
        ? `Showing ${approvedPOs.length} Approved PO(s) for ${supplier.name}. Select to link & auto-load items.`
        : `No Approved Purchase Orders found for ${supplier.name}.`;
    }

    if (chipsContainer) {
      if (available.length === 0) {
        chipsContainer.style.display = "none";
        chipsContainer.innerHTML = "";
      } else {
        chipsContainer.style.display = "flex";
        chipsContainer.innerHTML = CreateGrnPoRowBuilder.buildApprovedPoChipsHtml(
          available,
          (str) => this.escapeHtml(str)
        );
      }
    }
  }

  /**
   * Search active purchase orders and render the dropdown (#grnModalPoSearchDropdown).
   * @param {string} [query=""]
   */
  searchAndRenderActivePOs(query = "") {
    const dropdown = document.getElementById("grnModalPoSearchDropdown");
    if (!dropdown) return;

    const term = (query || "").toLowerCase().trim();
    const selectedNumbers = this.process.selectedPurchaseOrders.map((p) => p.po_number);
    let availablePOs = this.process.allPurchaseOrders.filter(
      (po) => String(po.status || "").trim().toLowerCase() === "approved" && !selectedNumbers.includes(po.po_number)
    );

    if (this.process.activeSupplierFilter) {
      const supFilter = this.process.activeSupplierFilter.toLowerCase().trim();
      availablePOs = availablePOs.filter(
        (po) => (po.supplier_name && po.supplier_name.toLowerCase() === supFilter) ||
                String(po.suppliers_id) === String(this.process.activeSupplierFilter)
      );
    }

    if (term && (!this.process.activeSupplierFilter || term !== this.process.activeSupplierFilter.toLowerCase().trim())) {
      availablePOs = availablePOs.filter((po) => {
        const matchNumber = (po.po_number || "").toLowerCase().includes(term);
        const matchSupplier = (po.supplier_name || "").toLowerCase().includes(term);
        const matchItems = Array.isArray(po.items) && po.items.some((itm) => (itm.item_name || "").toLowerCase().includes(term));
        return matchNumber || matchSupplier || matchItems;
      });
    }

    dropdown.innerHTML = "";

    if (availablePOs.length === 0) {
      const emptyMessage = this.process.activeSupplierFilter
        ? `No matching un-GRNed Purchase Orders found for supplier "${this.process.activeSupplierFilter}".`
        : (term ? `No matching active Purchase Orders found for "${term}".` : "All active Purchase Orders are already linked or none pending.");

      dropdown.innerHTML = `
        <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-circle-info" style="margin-right: 6px; color: #1677ff;"></i>
          ${emptyMessage}
        </div>
      `;
      dropdown.style.display = "block";
      return;
    }

    const header = document.createElement("div");
    header.style.cssText =
      "padding: 7px 12px; background: #f0f7ff; font-size: 11px; font-weight: 700; color: #1677ff; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 2;";
    const filterTitle = this.process.activeSupplierFilter ? `for "${this.process.activeSupplierFilter}"` : "across all suppliers";
    header.innerHTML = `
      <span><i class="fa-solid fa-clipboard-list"></i> Active Purchase Orders (${availablePOs.length}) ${filterTitle}</span>
      <span style="font-size: 10.5px; font-weight: 500; color: var(--text-muted);">Click a PO to link &amp; load order items</span>
    `;
    dropdown.appendChild(header);

    availablePOs.forEach((po) => {
      const row = CreateGrnPoRowBuilder.buildActivePoDropdownRow(
        po,
        this.ctx.formatCurrency,
        (selectedPo) => {
          if (typeof this.callbacks.onAddPurchaseOrder === "function") {
            this.callbacks.onAddPurchaseOrder(selectedPo);
          }
          dropdown.style.display = "none";
          const input = document.getElementById("grnModalPoSearchInput");
          if (input) input.value = "";
        }
      );
      dropdown.appendChild(row);
    });

    dropdown.style.display = "block";
  }

  /**
   * Render Section 1: Linked Purchase Orders table (#grnModalPoTableBody).
   */
  renderSelectedPOs() {
    const tbody = document.getElementById("grnModalPoTableBody");
    const countBadge = document.getElementById("grnModalPoCount");

    if (countBadge) {
      countBadge.textContent = this.process.selectedPurchaseOrders.length;
    }

    if (!tbody) return;
    tbody.innerHTML = "";

    if (this.process.selectedPurchaseOrders.length === 0) {
      tbody.innerHTML = CreateGrnPoRowBuilder.buildEmptyRowHtml();
      return;
    }

    this.process.selectedPurchaseOrders.forEach((po, index) => {
      const entity = new CreateGrnPoRowBuilder(po)
        .setIndex(index)
        .setCurrencyFormatter(this.ctx.formatCurrency)
        .build();
      tbody.appendChild(entity.render());
    });

    tbody.querySelectorAll(".grn-po-invoice-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.poIndex, 10);
        this.process.updatePoInvoice(idx, e.target.value);
      });
    });

    tbody.querySelectorAll(".grn-remove-po-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const poNum = e.currentTarget.dataset.poNumber;
        if (typeof this.callbacks.onRemovePurchaseOrder === "function") {
          this.callbacks.onRemovePurchaseOrder(poNum);
        }
      });
    });
  }

  /**
   * Render Section 2: Received Material Items table (#grnModalItemsTbody).
   */
  renderGrnItems() {
    const tbody = document.getElementById("grnModalItemsTbody");
    const countBadge = document.getElementById("grnModalItemCount");
    const hint = document.getElementById("grnModalItemHint");

    if (countBadge) {
      countBadge.textContent = this.process.grnItems.length;
    }

    if (!tbody) return;
    tbody.innerHTML = "";

    if (this.process.grnItems.length === 0) {
      const removedCount = this.process.removedGrnItems ? this.process.removedGrnItems.length : 0;
      tbody.innerHTML = CreateGrnItemRowBuilder.buildEmptyRowHtml(removedCount);

      if (hint) {
        hint.textContent = removedCount > 0
          ? `${removedCount} item(s) currently removed. You can re-add them above.`
          : "Select active Purchase Orders above to automatically populate received materials.";
      }
      return;
    }

    if (hint) {
      hint.textContent = `${this.process.grnItems.length} items loaded from ${this.process.selectedPurchaseOrders.length} linked Purchase Orders. Adjust receiving quantities or costs.`;
    }

    this.process.grnItems.forEach((item, index) => {
      const availableBrands = this.process.getBrandsForItem(item.stock_items_id, item.item_code);
      const existingBatches = this.process.getExistingBatchesForItem(item.stock_items_id, item.item_code);

      if (!item.brands_id && availableBrands.length > 0) {
        item.brands_id = availableBrands[0].id;
      }

      if (item.batch_mode === "EXISTING" && existingBatches.length > 0 && !item.batch_id) {
        item.batch_id = existingBatches[0].id;
      }

      const entity = new CreateGrnItemRowBuilder(item)
        .setIndex(index)
        .setAvailableBrands(availableBrands)
        .setExistingBatches(existingBatches)
        .setCurrencyFormatter(this.ctx.formatCurrency)
        .build();

      tbody.appendChild(entity.render());
    });

    // Wire brand, batch mode, and existing batch selectors
    tbody.querySelectorAll(".grn-modal-brand-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        this.process.updateItemBrand(idx, e.target.value);
      });
    });

    tbody.querySelectorAll(".grn-modal-batch-mode-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        this.process.updateItemBatchMode(idx, e.target.value);
        this.renderGrnItems();
      });
    });

    tbody.querySelectorAll(".grn-modal-batch-id-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        this.process.updateItemBatchId(idx, e.target.value);
      });
    });

    // Wire quantity and cost inputs
    tbody.querySelectorAll(".grn-modal-qty-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        if (typeof this.callbacks.onQtyChange === "function") {
          this.callbacks.onQtyChange(idx, e.target.value);
        }
      });
    });

    tbody.querySelectorAll(".grn-modal-cost-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        if (typeof this.callbacks.onCostChange === "function") {
          this.callbacks.onCostChange(idx, e.target.value);
        }
      });
    });

    tbody.querySelectorAll(".grn-modal-remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.dataset.itemIndex, 10);
        if (typeof this.callbacks.onRemoveItem === "function") {
          this.callbacks.onRemoveItem(idx);
        }
      });
    });
  }

  /**
   * Update the line total display cell for a specific item row.
   * @param {number} index
   */
  updateRowTotalDisplay(index) {
    const totalSpan = document.getElementById(`grnModalRowTotal_${index}`);
    const item = this.process.grnItems[index];
    if (totalSpan && item) {
      totalSpan.textContent = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(item.total)
        : `Rs. ${item.total.toFixed(2)}`;
    }
  }

  /**
   * Render Section 2.1: Removed / Excluded Items container, chips, and dropdown options.
   */
  renderRemovedGrnItems() {
    const section = document.getElementById("grnRemovedItemsSection");
    const container = document.getElementById("grnRemovedItemsChipsContainer");
    const select = document.getElementById("grnModalReaddSelect");
    const badge = document.getElementById("grnRemovedBadge");
    const badgeCount = document.getElementById("grnRemovedBadgeCount");
    const headerReaddAllBtn = document.getElementById("grnHeaderReaddAllBtn");
    const headerReaddCount = document.getElementById("grnHeaderReaddCount");
    const listCount = document.getElementById("grnRemovedItemsListCount");

    if (!section || !container) return;

    const count = this.process.removedGrnItems.length;

    if (count === 0) {
      section.style.display = "none";
      container.innerHTML = "";
      if (select) {
        select.innerHTML = '<option value="">-- Select Removed Item to Re-add --</option>';
      }
      if (badge) badge.style.display = "none";
      if (headerReaddAllBtn) headerReaddAllBtn.style.display = "none";
      return;
    }

    section.style.display = "block";
    if (badge) badge.style.display = "inline-flex";
    if (badgeCount) badgeCount.textContent = count;
    if (headerReaddAllBtn) headerReaddAllBtn.style.display = "inline-flex";
    if (headerReaddCount) headerReaddCount.textContent = count;
    if (listCount) listCount.textContent = count;

    if (select) {
      select.innerHTML =
        '<option value="">-- Select Removed Item to Re-add --</option>' +
        this.process.removedGrnItems
          .map(
            (itm, idx) =>
              `<option value="${idx}">[${this.escapeHtml(itm.po_number)}] ${this.escapeHtml(itm.item_name)} (${itm.receiving_qty} ${this.escapeHtml(itm.unit)})</option>`
          )
          .join("");
    }

    container.innerHTML = "";
    this.process.removedGrnItems.forEach((item, index) => {
      const chip = CreateGrnItemRowBuilder.buildRemovedItemChip(
        item,
        index,
        this.ctx.formatCurrency,
        (str) => this.escapeHtml(str)
      );
      container.appendChild(chip);
    });

    container.querySelectorAll(".grn-readd-single-item-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute("data-removed-index"), 10);
        if (typeof this.callbacks.onReaddItem === "function") {
          this.callbacks.onReaddItem(idx);
        }
      });
    });
  }

  /**
   * Calculate and update Sub Total, Discount, and Net Total DOM elements.
   * @returns {{subTotal: number, discount: number, netTotal: number}}
   */
  calculateFinancials() {
    const discountInput = document.getElementById("grnModalDiscount");
    const totals = this.process.calculateTotals(discountInput?.value || 0);

    const subTotalElem = document.getElementById("grnModalSubTotal");
    const netTotalElem = document.getElementById("grnModalNetTotal");

    if (subTotalElem) {
      subTotalElem.textContent = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(totals.subTotal)
        : `Rs. ${totals.subTotal.toFixed(2)}`;
    }

    if (netTotalElem) {
      netTotalElem.textContent = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(totals.netTotal)
        : `Rs. ${totals.netTotal.toFixed(2)}`;
    }

    return totals;
  }
}

export default CreateGrnHandler;
