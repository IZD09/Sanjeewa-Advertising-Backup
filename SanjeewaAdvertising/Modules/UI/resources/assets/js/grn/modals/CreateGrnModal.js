/**
 * SanjeewaAdvertising - Create Goods Received Note (GRN) Modal
 *
 * Multi-Purchase Order (Multi-PO) Support:
 * - Search selector for active (Pending / Partial) Purchase Orders
 * - Separate Section 1: Linked Purchase Orders table with editable invoice refs & removal
 * - Separate Section 2: Received Material Items table loaded dynamically from linked POs
 * - Live real-time calculations (line total, sub total, discount, net total)
 * - Database synchronization via backend GrnService
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";

export class CreateGrnModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getPurchaseOrders
   * @param {Function} [context.setPurchaseOrders]
   * @param {Function} [context.getSuppliers]
   * @param {Function} [context.generateNextGrnNumber]
   * @param {Function} context.formatCurrency
   * @param {Function} [context.loadAndRenderGRN]
   * @param {Function} [context.loadAndRenderPO]
   * @param {Function} [context.viewGRN]
   * @param {Function} [context.showToast]
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-grn-modal]", "[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;
    this.http = new RequestHandler();

    // Multi-PO State
    this.selectedPurchaseOrders = [];
    this.grnItems = [];
    this.allPurchaseOrders = [];
    this.poListLoaded = false;
    this.activeSupplierFilter = null;

    this.bindEvents();
  }

  bindEvents() {
    const headerCreateBtn = document.getElementById("grnHeaderCreateBtn");
    if (headerCreateBtn) {
      headerCreateBtn.addEventListener("click", () => this.openCreateGrnModal());
    }

    const discountInput = document.getElementById("grnModalDiscount");
    if (discountInput) {
      discountInput.addEventListener("input", () => this.calculateFinancials());
    }

    const saveBtn = document.getElementById("saveNewGrnModalBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveGrn());
    }

    // Active PO Search Input
    const poSearchInput = document.getElementById("grnModalPoSearchInput");
    if (poSearchInput && !poSearchInput._poSearchBound) {
      poSearchInput._poSearchBound = true;
      poSearchInput.addEventListener("focus", () => {
        this.searchAndRenderActivePOs(poSearchInput.value);
      });

      poSearchInput.addEventListener("input", (e) => {
        this.searchAndRenderActivePOs(e.target.value);
      });

      poSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleManualAddPoItem();
        }
      });
    }

    // Add GRN Item Button (placed at right side inside search input container)
    const addPoItemBtn = document.getElementById("grnModalAddPoItemBtn");
    if (addPoItemBtn && !addPoItemBtn._grnAddPoItemBound) {
      addPoItemBtn._grnAddPoItemBound = true;
      addPoItemBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleManualAddPoItem();
      });
    }

    // Close search dropdown on click outside
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("grnModalPoSearchDropdown");
      const searchInput = document.getElementById("grnModalPoSearchInput");
      const addPoBtn = document.getElementById("grnModalAddPoItemBtn");
      if (
        dropdown &&
        searchInput &&
        !searchInput.contains(e.target) &&
        !dropdown.contains(e.target) &&
        (!addPoBtn || !addPoBtn.contains(e.target))
      ) {
        dropdown.style.display = "none";
      }
    });
  }

  /**
   * Handle clicking the "Add GRN Item" button or pressing Enter in the search input.
   * Links the selected/typed Purchase Order and automatically populates its line items.
   */
  handleManualAddPoItem() {
    const searchInput = document.getElementById("grnModalPoSearchInput");
    const dropdown = document.getElementById("grnModalPoSearchDropdown");
    const query = (searchInput?.value || "").trim().toLowerCase();

    // Available unlinked active POs
    const selectedNumbers = this.selectedPurchaseOrders.map((p) => p.po_number);
    let availablePOs = this.allPurchaseOrders.filter(
      (po) => po.status !== "Completed" && po.status !== "Cancelled" && !selectedNumbers.includes(po.po_number)
    );

    if (query) {
      // 1. Exact match on PO Number (e.g. "PO-0001" or "0001" or "1")
      let match = availablePOs.find(
        (po) => po.po_number.toLowerCase() === query ||
                String(po.id) === query ||
                po.po_number.toLowerCase().replace(/\D+/g, "") === query.replace(/\D+/g, "")
      );

      // 2. If already linked, warn user
      if (!match && this.selectedPurchaseOrders.some(
        (po) => po.po_number.toLowerCase() === query ||
                po.po_number.toLowerCase().replace(/\D+/g, "") === query.replace(/\D+/g, "")
      )) {
        this.showToast("Purchase Order is already linked to this GRN.", "warning");
        if (dropdown) dropdown.style.display = "none";
        return;
      }

      // 3. Match by supplier name if single active PO exists
      if (!match) {
        const supplierMatches = availablePOs.filter(
          (po) => po.supplier_name && po.supplier_name.toLowerCase().includes(query)
        );
        if (supplierMatches.length === 1) {
          match = supplierMatches[0];
        } else if (supplierMatches.length > 1) {
          this.searchAndRenderActivePOs(query);
          return;
        }
      }

      if (match) {
        this.addPurchaseOrder(match);
        if (searchInput) searchInput.value = "";
        if (dropdown) dropdown.style.display = "none";
        return;
      }
    }

    // If active supplier filter is present and has only 1 available PO
    if (this.activeSupplierFilter) {
      const supPOs = availablePOs.filter(
        (po) => (po.supplier_name && po.supplier_name.toLowerCase() === this.activeSupplierFilter.toLowerCase()) ||
                String(po.suppliers_id) === String(this.activeSupplierFilter)
      );
      if (supPOs.length === 1) {
        this.addPurchaseOrder(supPOs[0]);
        if (searchInput) searchInput.value = "";
        if (dropdown) dropdown.style.display = "none";
        return;
      }
    }

    // If only 1 available PO overall and query is empty
    if (availablePOs.length === 1 && !query) {
      this.addPurchaseOrder(availablePOs[0]);
      if (searchInput) searchInput.value = "";
      if (dropdown) dropdown.style.display = "none";
      return;
    }

    // Otherwise show dropdown so user can pick
    if (availablePOs.length > 0) {
      if (searchInput) searchInput.focus();
      this.searchAndRenderActivePOs(query || (this.activeSupplierFilter || ""));
    } else {
      this.showToast(
        this.activeSupplierFilter
          ? `No active un-GRNed Purchase Orders available for "${this.activeSupplierFilter}".`
          : "No active un-GRNed Purchase Orders available to link.",
        "warning"
      );
      if (dropdown) dropdown.style.display = "none";
    }
  }

  /**
   * Open the Create GRN Modal and initialize fields.
   *
   * @param {string|null} [targetPoNumber=null]
   * @param {string|null} [targetSupplier=null]
   */
  async openCreateGrnModal(targetPoNumber = null, targetSupplier = null) {
    // Reset state
    this.selectedPurchaseOrders = [];
    this.grnItems = [];
    this.activeSupplierFilter = targetSupplier ? String(targetSupplier).trim() : null;

    const grnNoInput = document.getElementById("grnModalNumber");
    const dateInput = document.getElementById("grnCreateModalDate") || document.getElementById("grnModalDate");
    const remarksInput = document.getElementById("grnModalRemarks");
    const discountInput = document.getElementById("grnModalDiscount");
    const receivedByInput = document.getElementById("grnModalReceivedBy");
    const poSearchInput = document.getElementById("grnModalPoSearchInput");
    const poSearchDropdown = document.getElementById("grnModalPoSearchDropdown");
    const poSearchHint = document.getElementById("grnModalPoSearchHint");

    if (grnNoInput) {
      grnNoInput.value = this.ctx.generateNextGrnNumber
        ? this.ctx.generateNextGrnNumber()
        : `GRN-${Date.now().toString().slice(-4)}`;
    }
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
    if (remarksInput) remarksInput.value = "";
    if (discountInput) discountInput.value = "0.00";
    if (receivedByInput) receivedByInput.value = "Admin User";
    if (poSearchDropdown) poSearchDropdown.style.display = "none";

    // Load active purchase orders fresh from database
    await this.loadActivePurchaseOrders(true);

    // If a target PO was specified (e.g. from PO table action), auto-add it
    if (targetPoNumber) {
      const po = this.allPurchaseOrders.find(
        (p) => p.po_number === targetPoNumber || String(p.id) === String(targetPoNumber)
      );
      if (po) {
        this.addPurchaseOrder(po);
      }
      if (poSearchInput) poSearchInput.value = "";
      if (poSearchDropdown) poSearchDropdown.style.display = "none";
    } else if (this.activeSupplierFilter) {
      // Find un-GRNed POs for this specific supplier (Supplier Directory Card path)
      const supPOs = this.allPurchaseOrders.filter(
        (p) => p.status !== "Completed" && p.status !== "Cancelled" && (
          (p.supplier_name && p.supplier_name.toLowerCase() === this.activeSupplierFilter.toLowerCase()) ||
          String(p.suppliers_id) === String(this.activeSupplierFilter)
        )
      );

      if (poSearchInput) {
        if (supPOs.length === 1) {
          poSearchInput.value = supPOs[0].po_number;
        } else {
          poSearchInput.value = this.activeSupplierFilter;
        }
      }

      if (poSearchHint) {
        poSearchHint.textContent = `${supPOs.length} un-GRNed Purchase Order(s) for "${this.activeSupplierFilter}". Click 'Add GRN Item' or select PO below.`;
      }

      // Open dropdown showing un-GRNed POs strictly for this supplier
      this.searchAndRenderActivePOs(this.activeSupplierFilter);
    } else {
      // Top "+ Create New GRN" button path: Independent flow across ALL suppliers
      this.activeSupplierFilter = null;
      if (poSearchInput) poSearchInput.value = "";

      const allActivePOs = this.allPurchaseOrders.filter(
        (p) => p.status !== "Completed" && p.status !== "Cancelled"
      );

      if (poSearchHint) {
        poSearchHint.textContent = `${allActivePOs.length} un-GRNed Purchase Order(s) available across all suppliers. Select a PO or click 'Add GRN Item'.`;
      }

      // Open dropdown showing ALL un-GRNed POs across all suppliers
      this.searchAndRenderActivePOs("");
    }

    this.renderSelectedPOs();
    this.renderGrnItems();
    this.calculateFinancials();

    this.openModal("createGrnModal");
  }

  /**
   * Fetch active purchase orders from backend or cache.
   *
   * @param {boolean} [forceRefresh=false]
   */
  async loadActivePurchaseOrders(forceRefresh = false) {
    const loadingEl = document.getElementById("grnModalPoSearchLoading");
    const hintEl = document.getElementById("grnModalPoSearchHint");

    let purchaseOrders = [];

    if (!this.allPurchaseOrders || this.allPurchaseOrders.length === 0 || forceRefresh) {
      if (loadingEl) loadingEl.style.display = "inline-block";
      if (hintEl) hintEl.textContent = "Loading active purchase orders from database...";

      try {
        const response = await this.http.get("/api/v1/purchase-orders/data", { per_page: 100 });
        const data = response?.data || response;
        purchaseOrders = data?.purchase_orders ?? data?.orders ?? (Array.isArray(data) ? data : []);
        if (this.ctx.setPurchaseOrders && Array.isArray(purchaseOrders)) {
          this.ctx.setPurchaseOrders(purchaseOrders);
        }
      } catch (err) {
        console.warn("[CreateGrnModal] Failed to fetch purchase orders:", err);
        purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
      } finally {
        if (loadingEl) loadingEl.style.display = "none";
      }
    } else {
      purchaseOrders = this.allPurchaseOrders;
    }

    this.allPurchaseOrders = purchaseOrders;
    this.poListLoaded = true;

    // Filter active POs (Pending / Partial)
    const activeCount = this.allPurchaseOrders.filter((p) => p.status !== "Completed" && p.status !== "Cancelled").length;
    if (hintEl && !this.activeSupplierFilter) {
      hintEl.textContent = `${activeCount} un-GRNed Purchase Order(s) available across all suppliers. Search or click to link POs.`;
    }

    return this.allPurchaseOrders;
  }

  /**
   * Search active purchase orders and render the dropdown.
   *
   * @param {string} query
   */
  searchAndRenderActivePOs(query = "") {
    const dropdown = document.getElementById("grnModalPoSearchDropdown");
    if (!dropdown) return;

    const term = (query || "").toLowerCase().trim();

    // Active POs not yet completed and not already selected in this GRN
    const selectedNumbers = this.selectedPurchaseOrders.map((p) => p.po_number);
    let availablePOs = this.allPurchaseOrders.filter(
      (po) => po.status !== "Completed" && po.status !== "Cancelled" && !selectedNumbers.includes(po.po_number)
    );

    // 1. If activeSupplierFilter is present (Supplier Directory Card path), restrict strictly to this supplier
    if (this.activeSupplierFilter) {
      const supFilter = this.activeSupplierFilter.toLowerCase().trim();
      availablePOs = availablePOs.filter(
        (po) => (po.supplier_name && po.supplier_name.toLowerCase() === supFilter) ||
                String(po.suppliers_id) === String(this.activeSupplierFilter)
      );
    }

    // 2. If a search term is provided (e.g. PO number, supplier name, material item name)
    if (term && (!this.activeSupplierFilter || term !== this.activeSupplierFilter.toLowerCase().trim())) {
      availablePOs = availablePOs.filter((po) => {
        const matchNumber = (po.po_number || "").toLowerCase().includes(term);
        const matchSupplier = (po.supplier_name || "").toLowerCase().includes(term);
        const matchItems = Array.isArray(po.items) && po.items.some((itm) => (itm.item_name || "").toLowerCase().includes(term));
        return matchNumber || matchSupplier || matchItems;
      });
    }

    dropdown.innerHTML = "";

    if (availablePOs.length === 0) {
      const emptyMessage = this.activeSupplierFilter
        ? `No matching un-GRNed Purchase Orders found for supplier "${this.activeSupplierFilter}".`
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

    // Dropdown Header
    const header = document.createElement("div");
    header.style.cssText =
      "padding: 7px 12px; background: #f0f7ff; font-size: 11px; font-weight: 700; color: #1677ff; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 2;";
    const filterTitle = this.activeSupplierFilter ? `for "${this.activeSupplierFilter}"` : "across all suppliers";
    header.innerHTML = `
      <span><i class="fa-solid fa-clipboard-list"></i> Active Purchase Orders (${availablePOs.length}) ${filterTitle}</span>
      <span style="font-size: 10.5px; font-weight: 500; color: var(--text-muted);">Click a PO to link &amp; load order items</span>
    `;
    dropdown.appendChild(header);

    availablePOs.forEach((po) => {
      const row = document.createElement("div");
      row.style.cssText =
        "padding: 9px 12px; cursor: pointer; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease;";
      row.onmouseenter = () => (row.style.background = "rgba(22, 119, 255, 0.08)");
      row.onmouseleave = () => (row.style.background = "transparent");

      const poTotalFormatted = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(po.total_amount || 0)
        : `Rs. ${Number(po.total_amount || 0).toFixed(2)}`;

      const statusBadge =
        po.status === "Partial"
          ? `<span class="grn-status-badge partial" style="font-size: 10px; padding: 1px 6px;">Partial</span>`
          : `<span class="grn-status-badge pending" style="font-size: 10px; padding: 1px 6px;">Pending</span>`;

      const itemCount = Array.isArray(po.items) ? po.items.length : 0;

      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span style="font-size: 12.5px; font-weight: 700; color: #1677ff; font-family: ui-monospace;">${po.po_number}</span>
          <span style="font-weight: 600; font-size: 13px; color: var(--text);">${po.supplier_name || "Supplier"}</span>
          <span style="font-size: 11px; color: var(--text-muted);">(${itemCount} items &bull; ${po.order_date || ""})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text);">${poTotalFormatted}</span>
          ${statusBadge}
          <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" style="font-size: 11px; height: 24px; padding: 0 8px; pointer-events: none;">
            <i class="fa-solid fa-plus"></i> Load Items
          </button>
        </div>
      `;

      row.addEventListener("click", () => {
        this.addPurchaseOrder(po);
        dropdown.style.display = "none";
        const input = document.getElementById("grnModalPoSearchInput");
        if (input) input.value = "";
      });

      dropdown.appendChild(row);
    });

    dropdown.style.display = "block";
  }

  /**
   * Add a Purchase Order to this GRN.
   * Auto-populates its line items into the GRN items list.
   *
   * @param {Object} po
   */
  addPurchaseOrder(po) {
    if (!po) return;

    // Check if already selected
    if (this.selectedPurchaseOrders.some((p) => p.po_number === po.po_number)) {
      this.showToast(`Purchase Order ${po.po_number} is already linked.`, "warning");
      return;
    }

    const defaultInvoice = `INV-${po.po_number.replace(/\D+/g, "") || Date.now().toString().slice(-4)}`;

    const poEntry = {
      id: po.id,
      po_number: po.po_number,
      supplier_name: po.supplier_name || "Supplier",
      supplier_contact: po.supplier_contact || "",
      order_date: po.order_date || "",
      total_amount: po.total_amount || 0,
      status: po.status || "Pending",
      supplier_invoice: defaultInvoice,
      items: po.items || []
    };

    this.selectedPurchaseOrders.push(poEntry);

    // Auto-load this PO's items into the GRN line items table
    if (Array.isArray(po.items) && po.items.length > 0) {
      po.items.forEach((item) => {
        const qtyOrdered = parseInt(item.qty_ordered, 10) || 0;
        const qtyReceived = parseInt(item.qty_received, 10) || 0;
        const remainingQty = Math.max(1, qtyOrdered - qtyReceived);
        const unitCost = parseFloat(item.unit_cost) || 0;

        this.grnItems.push({
          po_id: po.id,
          po_number: po.po_number,
          stock_items_id: item.stock_items_id || item.item_id,
          item_id: item.stock_items_id || item.item_id,
          item_code: item.item_id || item.code || `ITM-${item.stock_items_id}`,
          item_name: item.item_name || item.name || `Material #${item.stock_items_id}`,
          unit: item.unit || "Units",
          qty_ordered: qtyOrdered,
          qty_received_prev: qtyReceived,
          receiving_qty: remainingQty,
          unit_cost: unitCost,
          total: remainingQty * unitCost,
          brands_id: item.brands_id || 10
        });
      });
    }

    this.renderSelectedPOs();
    this.renderGrnItems();
    this.calculateFinancials();

    const itemsCount = po.items ? po.items.length : 0;
    this.showToast(`Linked ${po.po_number} (${itemsCount} items added to GRN).`, "success");
  }

  /**
   * Remove a Purchase Order and its items from this GRN.
   *
   * @param {string} poNumber
   */
  removePurchaseOrder(poNumber) {
    const initialPoCount = this.selectedPurchaseOrders.length;
    this.selectedPurchaseOrders = this.selectedPurchaseOrders.filter((p) => p.po_number !== poNumber);

    if (this.selectedPurchaseOrders.length < initialPoCount) {
      // Remove all items belonging to this PO
      this.grnItems = this.grnItems.filter((itm) => itm.po_number !== poNumber);

      this.renderSelectedPOs();
      this.renderGrnItems();
      this.calculateFinancials();

      this.showToast(`Removed Purchase Order ${poNumber} and its items.`, "info");
    }
  }

  /**
   * Update invoice reference for an individual PO.
   *
   * @param {number} index
   * @param {string} value
   */
  updatePoInvoice(index, value) {
    if (this.selectedPurchaseOrders[index]) {
      this.selectedPurchaseOrders[index].supplier_invoice = value.trim();
    }
  }

  /**
   * Render Section 1: Selected / Linked Purchase Orders table.
   */
  renderSelectedPOs() {
    const tbody = document.getElementById("grnModalPoTableBody");
    const countBadge = document.getElementById("grnModalPoCount");

    if (countBadge) {
      countBadge.textContent = this.selectedPurchaseOrders.length;
    }

    if (!tbody) return;

    tbody.innerHTML = "";

    if (this.selectedPurchaseOrders.length === 0) {
      tbody.innerHTML = `
        <tr id="grnModalPoEmptyRow">
          <td colspan="7" style="text-align: center; padding: 26px 16px; background: rgba(0, 0, 0, 0.015); border-radius: 6px;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(22, 119, 255, 0.08); display: flex; align-items: center; justify-content: center; color: #1677ff; font-size: 17px;">
                <i class="fa-solid fa-clipboard-list"></i>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text);">
                No Purchase Orders Linked Yet
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted); max-width: 380px; line-height: 1.4;">
                Use the search selector above to search and select one or more active Purchase Orders.
              </div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    this.selectedPurchaseOrders.forEach((po, index) => {
      const tr = document.createElement("tr");

      const poTotalFormatted = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(po.total_amount || 0)
        : `Rs. ${Number(po.total_amount || 0).toFixed(2)}`;

      const statusBadge =
        po.status === "Partial"
          ? `<span class="grn-status-badge partial" style="font-size: 10px; padding: 2px 6px;">Partial</span>`
          : `<span class="grn-status-badge pending" style="font-size: 10px; padding: 2px 6px;">Pending</span>`;

      tr.innerHTML = `
        <td>
          <strong style="color: #1677ff; font-family: ui-monospace; font-size: 12.5px;">${po.po_number}</strong>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px; color: var(--text);">${po.supplier_name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${po.supplier_contact || "No Contact"}</div>
        </td>
        <td style="font-size: 12px; color: var(--text-muted);">${po.order_date || "-"}</td>
        <td class="text-right" style="font-weight: 600; font-size: 12.5px;">${poTotalFormatted}</td>
        <td>${statusBadge}</td>
        <td>
          <input type="text"
                 id="grnPoInvoice_${index}"
                 name="po_invoice[${po.id || index}]"
                 aria-label="Supplier invoice number for Purchase Order ${po.po_number}"
                 class="grn-inline-input grn-po-invoice-input"
                 data-po-index="${index}"
                 value="${po.supplier_invoice || ''}"
                 placeholder="E.g. INV-${po.po_number.replace(/\D+/g, "")}"
                 style="height: 30px; font-size: 12px; padding: 0 8px; width: 100%;">
        </td>
        <td class="text-center">
          <button type="button"
                  class="ant-btn-action text-danger grn-remove-po-btn"
                  data-po-number="${po.po_number}"
                  title="Remove this Purchase Order and its items from GRN"
                  style="border-color: #ffccc7; color: #ff4d4f; background: #fff1f0; height: 28px; width: 28px; padding: 0;">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Wire invoice input changes
    tbody.querySelectorAll(".grn-po-invoice-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.poIndex, 10);
        this.updatePoInvoice(idx, e.target.value);
      });
    });

    // Wire remove PO buttons
    tbody.querySelectorAll(".grn-remove-po-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const poNum = e.currentTarget.dataset.poNumber;
        this.removePurchaseOrder(poNum);
      });
    });
  }

  /**
   * Render Section 2: Received Material Items table rows.
   */
  renderGrnItems() {
    const tbody = document.getElementById("grnModalItemsTbody");
    const countBadge = document.getElementById("grnModalItemCount");
    const hint = document.getElementById("grnModalItemHint");

    if (countBadge) {
      countBadge.textContent = this.grnItems.length;
    }

    if (!tbody) return;

    tbody.innerHTML = "";

    if (this.grnItems.length === 0) {
      tbody.innerHTML = `
        <tr id="grnModalEmptyRow">
          <td colspan="9" style="text-align: center; padding: 32px 16px; background: rgba(0, 0, 0, 0.015); border-radius: 6px;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(22, 119, 255, 0.08); display: flex; align-items: center; justify-content: center; color: #1677ff; font-size: 18px;">
                <i class="fa-solid fa-boxes-stacked"></i>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text);">
                No Materials Loaded Yet
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted); max-width: 400px; line-height: 1.4;">
                Link one or more Purchase Orders above to automatically populate material line items and pending quantities.
              </div>
            </div>
          </td>
        </tr>
      `;
      if (hint) {
        hint.textContent = "Select active Purchase Orders above to automatically populate received materials.";
      }
      return;
    }

    if (hint) {
      hint.textContent = `${this.grnItems.length} items loaded from ${this.selectedPurchaseOrders.length} linked Purchase Orders. Adjust receiving quantities or costs.`;
    }

    this.grnItems.forEach((item, index) => {
      const tr = document.createElement("tr");

      const isFullyDelivered = item.qty_ordered > 0 && item.qty_received_prev >= item.qty_ordered;

      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--text); font-size: 12.5px;">${item.item_name}</div>
          <div style="font-size: 11px; color: var(--text-muted); font-family: ui-monospace;">SKU: ${item.item_code}</div>
        </td>
        <td>
          <span class="grn-status-badge info" style="font-size: 11px; font-family: ui-monospace; font-weight: 600; padding: 2px 6px;">
            ${item.po_number}
          </span>
        </td>
        <td>
          <span class="grn-unit-badge" style="background: var(--surface-2); border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px; font-size: 11px;">
            ${item.unit}
          </span>
        </td>
        <td class="text-right" style="font-weight: 600; color: var(--text-muted); font-size: 12px;">
          ${item.qty_ordered}
        </td>
        <td class="text-right" style="color: ${isFullyDelivered ? '#52c41a' : '#faad14'}; font-weight: 600; font-size: 12px;">
          ${item.qty_received_prev}
        </td>
        <td class="text-right">
          <input type="number"
                 id="grnItemQty_${index}"
                 name="grn_items[${index}][qty]"
                 aria-label="Receiving quantity for ${item.item_name}"
                 class="grn-inline-input text-right grn-modal-qty-input"
                 data-item-index="${index}"
                 min="1"
                 step="1"
                 value="${item.receiving_qty}"
                 style="width: 90px; height: 30px; font-weight: 700; color: #1677ff; text-align: right; font-size: 12.5px;"
                 required>
        </td>
        <td class="text-right">
          <input type="number"
                 id="grnItemCost_${index}"
                 name="grn_items[${index}][cost]"
                 aria-label="Unit purchase cost for ${item.item_name}"
                 class="grn-inline-input text-right grn-modal-cost-input"
                 data-item-index="${index}"
                 min="0"
                 step="0.01"
                 value="${item.unit_cost.toFixed(2)}"
                 style="width: 100px; height: 30px; font-weight: 600; text-align: right; font-size: 12px;"
                 required>
        </td>
        <td class="text-right" style="font-weight: 700; color: var(--text); font-size: 12.5px;">
          <span class="grn-modal-row-total" id="grnModalRowTotal_${index}">
            ${this.ctx.formatCurrency ? this.ctx.formatCurrency(item.total) : `Rs. ${item.total.toFixed(2)}`}
          </span>
        </td>
        <td class="text-center">
          <button type="button"
                  class="ant-btn-action text-danger grn-modal-remove-item-btn"
                  data-item-index="${index}"
                  title="Remove this item from GRN"
                  style="border-color: #ffccc7; color: #ff4d4f; background: #fff1f0; height: 26px; width: 26px; padding: 0;">
            <i class="fa-solid fa-trash-can" style="font-size: 11px;"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Wire quantity and cost inputs
    tbody.querySelectorAll(".grn-modal-qty-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        this.onQtyChange(idx, e.target.value);
      });
    });

    tbody.querySelectorAll(".grn-modal-cost-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        this.onCostChange(idx, e.target.value);
      });
    });

    tbody.querySelectorAll(".grn-modal-remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.dataset.itemIndex, 10);
        this.removeItem(idx);
      });
    });
  }

  /**
   * Handle receiving quantity changes on a line item.
   *
   * @param {number} index
   * @param {string|number} value
   */
  onQtyChange(index, value) {
    if (!this.grnItems[index]) return;
    const qty = parseFloat(value) || 0;
    this.grnItems[index].receiving_qty = qty;
    this.grnItems[index].total = qty * this.grnItems[index].unit_cost;

    this.updateRowTotalDisplay(index);
    this.calculateFinancials();
  }

  /**
   * Handle unit cost changes on a line item.
   *
   * @param {number} index
   * @param {string|number} value
   */
  onCostChange(index, value) {
    if (!this.grnItems[index]) return;
    const cost = parseFloat(value) || 0;
    this.grnItems[index].unit_cost = cost;
    this.grnItems[index].total = this.grnItems[index].receiving_qty * cost;

    this.updateRowTotalDisplay(index);
    this.calculateFinancials();
  }

  /**
   * Update the line total cell text.
   *
   * @param {number} index
   */
  updateRowTotalDisplay(index) {
    const totalSpan = document.getElementById(`grnModalRowTotal_${index}`);
    if (totalSpan && this.grnItems[index]) {
      totalSpan.textContent = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(this.grnItems[index].total)
        : `Rs. ${this.grnItems[index].total.toFixed(2)}`;
    }
  }

  /**
   * Remove an individual item line from the GRN.
   *
   * @param {number} index
   */
  removeItem(index) {
    if (this.grnItems[index]) {
      this.grnItems.splice(index, 1);
      this.renderGrnItems();
      this.calculateFinancials();
    }
  }

  /**
   * Automatically calculate Sub Total, Discount, and Net Total in real-time.
   */
  calculateFinancials() {
    const subTotal = this.grnItems.reduce((acc, itm) => acc + (parseFloat(itm.total) || 0), 0);
    const discountInput = document.getElementById("grnModalDiscount");
    const discount = parseFloat(discountInput?.value) || 0;
    const netTotal = Math.max(0, subTotal - discount);

    const subTotalElem = document.getElementById("grnModalSubTotal");
    const netTotalElem = document.getElementById("grnModalNetTotal");

    if (subTotalElem) {
      subTotalElem.textContent = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(subTotal)
        : `Rs. ${subTotal.toFixed(2)}`;
    }

    if (netTotalElem) {
      netTotalElem.textContent = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(netTotal)
        : `Rs. ${netTotal.toFixed(2)}`;
    }

    return { subTotal, discount, netTotal };
  }

  /**
   * Save and finalize the Goods Received Note.
   * Sends POST request to /api/v1/grns, linking multiple purchase orders and updating stocks.
   */
  async saveGrn() {
    const receivedDate = (document.getElementById("grnCreateModalDate") || document.getElementById("grnModalDate"))?.value;
    const remarks = document.getElementById("grnModalRemarks")?.value?.trim() || "";

    if (!this.selectedPurchaseOrders || this.selectedPurchaseOrders.length === 0) {
      this.showToast("Please search and link at least one Purchase Order to this GRN", "error");
      return;
    }

    if (!receivedDate) {
      this.showToast("Please specify the Received Date", "error");
      return;
    }

    if (!this.grnItems || this.grnItems.length === 0) {
      this.showToast("Please link Purchase Orders that contain material items to receive", "error");
      return;
    }

    for (const item of this.grnItems) {
      if (!item.receiving_qty || item.receiving_qty <= 0) {
        this.showToast(`Please enter a valid receiving quantity for "${item.item_name}"`, "error");
        return;
      }
    }

    const saveBtn = document.getElementById("saveNewGrnModalBtn");
    const originalBtnText = saveBtn ? saveBtn.innerHTML : "";

    try {
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving GRN...';
      }

      // Collect multiple purchase orders with their individual supplier invoice refs
      const purchaseOrdersPayload = this.selectedPurchaseOrders.map((po) => ({
        id: po.id,
        supplyer_invoice: po.supplier_invoice || `INV-${po.po_number.replace(/\D+/g, "") || Date.now().toString().slice(-4)}`
      }));

      const primaryPo = this.selectedPurchaseOrders[0];

      const payload = {
        at_time: receivedDate ? `${receivedDate} ${new Date().toTimeString().split(" ")[0]}` : null,
        purchase_orders: purchaseOrdersPayload,
        purchase_orders_id: primaryPo.id,
        supplyer_invoice: primaryPo.supplier_invoice,
        stocks: this.grnItems.map((item) => ({
          stock_items_id: parseInt(item.stock_items_id, 10),
          purchase_orders_id: item.po_id,
          brands_id: parseInt(item.brands_id, 10) || 10,
          qty: Math.round(item.receiving_qty),
          buy: parseFloat(item.unit_cost) || 0,
          price: parseFloat((item.unit_cost * 1.25).toFixed(2))
        }))
      };

      const response = await this.http.post("/api/v1/grns", payload);
      const createdGrn = response?.data || response;
      const grnCode = createdGrn?.grn_number || createdGrn?.grn_id || `GRN-${Date.now().toString().slice(-4)}`;

      this.showToast(
        `Goods Received Note ${grnCode} created successfully! ${this.selectedPurchaseOrders.length} POs linked and stock updated.`,
        "success"
      );

      // Close modal
      this.closeModal("createGrnModal");

      // Refresh GRN records, Purchase Orders, and Suppliers
      if (this.ctx.loadAndRenderGRN) {
        await this.ctx.loadAndRenderGRN(true);
      }
      if (this.ctx.loadAndRenderPO) {
        await this.ctx.loadAndRenderPO(true);
      }
      if (this.ctx.loadAndRenderSuppliers) {
        await this.ctx.loadAndRenderSuppliers(true);
      } else if (this.ctx.dataLoader?.fetchSuppliers) {
        await this.ctx.dataLoader.fetchSuppliers({}, true);
        if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();
      } else if (this.ctx.renderSuppliersGrid) {
        this.ctx.renderSuppliersGrid();
      }

      // Optionally open View GRN document for the newly created GRN
      if (createdGrn?.id && this.ctx.viewGRN) {
        setTimeout(() => {
          this.ctx.viewGRN(grnCode);
        }, 350);
      }
    } catch (err) {
      console.error("[CreateGrnModal] Error saving GRN:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to create GRN. Please check your inputs.";
      this.showToast(errMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
      }
    }
  }
}

export default CreateGrnModal;
