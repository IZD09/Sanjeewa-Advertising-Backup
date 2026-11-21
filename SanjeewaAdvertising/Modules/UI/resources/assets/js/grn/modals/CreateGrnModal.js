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
    this.removedGrnItems = [];
    this.allPurchaseOrders = [];
    this.suppliers = [];
    this.brands = [];
    this.stockItemsCatalog = [];
    this.selectedSupplier = null;
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

    // Searchable Supplier Selector inside Create GRN Modal
    const suppSearchInput = document.getElementById("grnCreateSuppSearchInput");
    if (suppSearchInput && !suppSearchInput._grnSuppSearchBound) {
      suppSearchInput._grnSuppSearchBound = true;
      suppSearchInput.addEventListener("input", (e) => this.renderSupplierDropdown(e.target.value));
      suppSearchInput.addEventListener("focus", (e) => this.renderSupplierDropdown(e.target.value));
    }

    const toggleSuppBtn = document.getElementById("grnCreateToggleSuppDropdownBtn");
    if (toggleSuppBtn && !toggleSuppBtn._grnSuppToggleBound) {
      toggleSuppBtn._grnSuppToggleBound = true;
      toggleSuppBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSupplierDropdown();
      });
    }

    const clearSuppBtn = document.getElementById("grnCreateClearSupplierBtn");
    if (clearSuppBtn && !clearSuppBtn._grnSuppClearBound) {
      clearSuppBtn._grnSuppClearBound = true;
      clearSuppBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.clearSelectedSupplier();
      });
    }

    // Approved PO Selector dropdown -> auto-add PO & its items
    const approvedPoSelect = document.getElementById("grnModalApprovedPoSelect");
    if (approvedPoSelect && !approvedPoSelect._grnApprovedPoBound) {
      approvedPoSelect._grnApprovedPoBound = true;
      approvedPoSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val) {
          this.addPurchaseOrderByNumber(val);
          approvedPoSelect.value = "";
        }
      });
    }

    // Add All Approved POs button
    const addAllBtn = document.getElementById("grnCreateAddAllApprovedPoBtn");
    if (addAllBtn && !addAllBtn._grnAddAllBound) {
      addAllBtn._grnAddAllBound = true;
      addAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.addAllApprovedPOs();
      });
    }

    // Re-add All Removed Items button (in header & in removed section)
    const headerReaddAllBtn = document.getElementById("grnHeaderReaddAllBtn");
    if (headerReaddAllBtn && !headerReaddAllBtn._grnReaddAllBound) {
      headerReaddAllBtn._grnReaddAllBound = true;
      headerReaddAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.readdAllItems();
      });
    }

    const readdAllBtn = document.getElementById("grnReaddAllRemovedBtn");
    if (readdAllBtn && !readdAllBtn._grnReaddAllBound2) {
      readdAllBtn._grnReaddAllBound2 = true;
      readdAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.readdAllItems();
      });
    }

    // Re-add selected item from dropdown button
    const readdSelectBtn = document.getElementById("grnModalReaddSelectBtn");
    if (readdSelectBtn && !readdSelectBtn._grnReaddSelectBound) {
      readdSelectBtn._grnReaddSelectBound = true;
      readdSelectBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleReaddFromDropdown();
      });
    }

    // Delegated clicks for supplier items, quick PO chips & outside close
    document.addEventListener("click", (e) => {
      const suppItem = e.target.closest(".grn-create-supp-item");
      if (suppItem) {
        e.preventDefault();
        const suppId = suppItem.getAttribute("data-supplier-id");
        const suppName = suppItem.getAttribute("data-supplier-name");
        const matched = this.suppliers.find(
          s => (suppId && String(s.id) === String(suppId)) || (suppName && s.name === suppName)
        );
        if (matched) {
          this.selectSupplier(matched);
        }
        return;
      }

      const poChip = e.target.closest(".grn-create-po-chip");
      if (poChip) {
        e.preventDefault();
        const poNum = poChip.getAttribute("data-po-number");
        if (poNum) {
          this.addPurchaseOrderByNumber(poNum);
        }
        return;
      }

      const suppGroup = document.getElementById("grnCreateSuppSearchGroup");
      const suppDropdown = document.getElementById("grnCreateSuppDropdown");
      if (suppDropdown && suppDropdown.style.display !== "none") {
        if (!suppGroup || !suppGroup.contains(e.target)) {
          this.hideSupplierDropdown();
        }
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

    // Available unlinked Approved POs
    const selectedNumbers = this.selectedPurchaseOrders.map((p) => p.po_number);
    let availablePOs = this.allPurchaseOrders.filter(
      (po) => String(po.status || "").trim().toLowerCase() === "approved" && !selectedNumbers.includes(po.po_number)
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
    this.removedGrnItems = [];
    this.selectedSupplier = null;
    this.activeSupplierFilter = targetSupplier ? String(targetSupplier).trim() : null;

    const remarksInput = document.getElementById("grnModalRemarks");
    const discountInput = document.getElementById("grnModalDiscount");
    const receivedByInput = document.getElementById("grnModalReceivedBy");

    if (remarksInput) remarksInput.value = "";
    if (discountInput) discountInput.value = "0.00";
    if (receivedByInput && receivedByInput.dataset?.loggedUser) {
      receivedByInput.value = receivedByInput.dataset.loggedUser;
    }

    this.resetSupplierUI();
    this.renderSelectedPOs();
    this.renderGrnItems();
    this.renderRemovedGrnItems();
    this.calculateFinancials();

    // Load suppliers, active purchase orders & inventory catalog (brands + batches) fresh from database concurrently
    await Promise.all([
      this.loadSuppliers(),
      this.loadActivePurchaseOrders(true),
      this.loadInventoryCatalog()
    ]);

    this.syncSuppliersWithApprovedPOs();

    // If a target PO was specified (e.g. from PO table action), verify it is Approved, then select its supplier and link it
    if (targetPoNumber) {
      const po = this.allPurchaseOrders.find(
        (p) => p.po_number === targetPoNumber || String(p.id) === String(targetPoNumber)
      );
      if (po) {
        if (String(po.status || "").trim().toLowerCase() !== "approved") {
          this.showToast(`Please approve Purchase Order ${po.po_number} before receiving a GRN.`, "warning");
          return;
        }
        const supp = this.findSupplierForPo(po);
        if (supp) {
          this.selectSupplier(supp, po.po_number);
        } else {
          this.addPurchaseOrder(po);
        }
      }
    } else if (this.activeSupplierFilter) {
      const cleanFilter = this.activeSupplierFilter.toLowerCase();
      const supp = this.suppliers.find(
        s => String(s.id) === String(this.activeSupplierFilter) ||
             (s.name && s.name.toLowerCase() === cleanFilter)
      );
      if (supp) {
        this.selectSupplier(supp);
      }
    }

    this.openModal("createGrnModal");
  }

  async loadSuppliers() {
    try {
      const res = await this.http.get("/api/v1/suppliers/all");
      const data = res?.data || res;
      this.suppliers = Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.warn("[CreateGrnModal] Could not fetch suppliers:", err);
      this.suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    }
  }

  async loadInventoryCatalog() {
    try {
      const res = await this.http.get("/api/v1/inventory/stocks/form-data");
      const data = res?.data || res;
      this.brands = Array.isArray(data?.brands) ? data.brands : [];
      this.stockItemsCatalog = Array.isArray(data?.stock_items) ? data.stock_items : [];
    } catch (err) {
      console.warn("[CreateGrnModal] Could not fetch inventory catalog:", err);
      this.brands = this.brands || [];
      this.stockItemsCatalog = this.stockItemsCatalog || [];
    }
  }

  getCatalogItem(stockItemId, itemCode = null) {
    if (!this.stockItemsCatalog || this.stockItemsCatalog.length === 0) return null;
    return (
      this.stockItemsCatalog.find(it => Number(it.id) === Number(stockItemId)) ||
      (itemCode ? this.stockItemsCatalog.find(it => String(it.code) === String(itemCode)) : null) ||
      null
    );
  }

  getBrandsForItem(stockItemId, itemCode = null) {
    const catItem = this.getCatalogItem(stockItemId, itemCode);
    const compatible = Array.isArray(catItem?.compatible_brands) ? catItem.compatible_brands : [];
    if (compatible.length > 0 && Array.isArray(this.brands) && this.brands.length > 0) {
      const compatIds = new Set(compatible.map(b => Number(b.id)));
      const others = this.brands.filter(b => !compatIds.has(Number(b.id)));
      return [...compatible, ...others];
    }
    if (compatible.length > 0) return compatible;
    return Array.isArray(this.brands) ? this.brands : [];
  }

  getExistingBatchesForItem(stockItemId, itemCode = null) {
    const catItem = this.getCatalogItem(stockItemId, itemCode);
    return Array.isArray(catItem?.existing_batches) ? catItem.existing_batches : [];
  }

  syncSuppliersWithApprovedPOs() {
    const list = Array.isArray(this.suppliers) ? [...this.suppliers] : [];
    (this.allPurchaseOrders || []).forEach(po => {
      if (String(po.status || "").trim().toLowerCase() !== "approved") return;
      const exists = list.some(s => {
        const matchId = s.id && po.suppliers_id && Number(s.id) === Number(po.suppliers_id);
        const matchName = s.name && po.supplier_name &&
          String(s.name).trim().toLowerCase() === String(po.supplier_name).trim().toLowerCase();
        return matchId || matchName;
      });
      if (!exists && (po.suppliers_id || po.supplier_name)) {
        list.push({
          id: po.suppliers_id || null,
          code: po.suppliers_id ? `SUP-${String(po.suppliers_id).padStart(3, "0")}` : "SUP",
          name: po.supplier_name || "Supplier",
          mobile: po.supplier_contact || ""
        });
      }
    });
    this.suppliers = list;
  }

  findSupplierForPo(po) {
    if (!po) return null;
    let supp = null;
    if (po.suppliers_id) {
      supp = this.suppliers.find(s => Number(s.id) === Number(po.suppliers_id));
    }
    if (!supp && po.supplier_name) {
      const cleanName = String(po.supplier_name).trim().toLowerCase();
      supp = this.suppliers.find(s => String(s.name || "").trim().toLowerCase() === cleanName);
    }
    if (!supp) {
      supp = {
        id: po.suppliers_id || null,
        code: po.suppliers_id ? `SUP-${String(po.suppliers_id).padStart(3, "0")}` : "SUP",
        name: po.supplier_name || "Supplier",
        mobile: po.supplier_contact || ""
      };
    }
    return supp;
  }

  getApprovedPOsForSupplier(supplier) {
    if (!supplier) return [];
    return (this.allPurchaseOrders || []).filter(po => {
      const isApproved = String(po.status || "").trim().toLowerCase() === "approved" ||
        Number(po.purchase_orders_status_id) === 5;
      if (!isApproved) return false;

      const matchId = supplier.id && po.suppliers_id && Number(po.suppliers_id) === Number(supplier.id);
      const matchName = supplier.name && po.supplier_name &&
        String(po.supplier_name).trim().toLowerCase() === String(supplier.name).trim().toLowerCase();
      return matchId || matchName;
    });
  }

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

  hideSupplierDropdown() {
    const dropdown = document.getElementById("grnCreateSuppDropdown");
    const icon = document.getElementById("grnCreateSuppDropdownIcon");
    if (dropdown) dropdown.style.display = "none";
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }

  renderSupplierDropdown(query = "") {
    const dropdown = document.getElementById("grnCreateSuppDropdown");
    const icon = document.getElementById("grnCreateSuppDropdownIcon");
    if (!dropdown) return;

    const cleanQuery = String(query || "").trim().toLowerCase();
    let matches = (this.suppliers || []).filter(
      s => this.getApprovedPOsForSupplier(s).length > 0
    );

    if (cleanQuery) {
      matches = matches.filter(s =>
        String(s.name || "").toLowerCase().includes(cleanQuery) ||
        String(s.mobile || s.phone || "").toLowerCase().includes(cleanQuery) ||
        String(s.code || "").toLowerCase().includes(cleanQuery)
      );
    }

    // Sort suppliers with more Approved POs first
    matches.sort((a, b) => this.getApprovedPOsForSupplier(b).length - this.getApprovedPOsForSupplier(a).length);

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 12px 14px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-truck-field" style="margin-right: 6px; opacity: 0.6;"></i>
          ${cleanQuery
            ? `No suppliers with Approved POs found matching "<strong>${this.escapeHtml(query)}</strong>"`
            : "No suppliers with Approved Purchase Orders available"}
        </div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 35).map(s => {
        const approvedCount = this.getApprovedPOsForSupplier(s).length;
        const phone = s.mobile || s.phone || "No Phone";
        const code = s.code || (s.id ? `SUP-${String(s.id).padStart(3, "0")}` : "SUP");
        return `
          <div class="grn-create-supp-item" data-supplier-id="${s.id || ""}" data-supplier-name="${this.escapeHtml(s.name)}" style="padding: 9px 12px; border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06)); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
            <div style="min-width: 0;">
              <strong style="color: var(--text); font-size: 13px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(s.name)}</strong>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">${this.escapeHtml(phone)} • ${this.escapeHtml(code)}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              ${approvedCount > 0
                ? `<span style="font-size: 10px; background: rgba(22,119,255,0.1); color: #1677ff; padding: 2px 8px; border-radius: 10px; font-weight: 700;">${approvedCount} Approved PO${approvedCount === 1 ? "" : "s"}</span>`
                : `<span style="font-size: 10px; color: var(--text-muted);">0 Approved</span>`}
              <span style="font-size: 11px; font-weight: 700; color: #1677ff;">Select &rarr;</span>
            </div>
          </div>`;
      }).join("");

      dropdown.querySelectorAll(".grn-create-supp-item").forEach(item => {
        item.addEventListener("mouseenter", () => item.style.backgroundColor = "var(--surface-2, rgba(22,119,255,0.05))");
        item.addEventListener("mouseleave", () => item.style.backgroundColor = "");
      });
    }

    dropdown.style.display = "block";
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  }

  selectSupplier(supplier, autoAddPoNumber = null) {
    if (!supplier) return;
    this.selectedSupplier = supplier;
    this.hideSupplierDropdown();

    const searchGroup = document.getElementById("grnCreateSuppSearchGroup");
    const card = document.getElementById("grnCreateSelectedSupplierCard");
    const nameEl = document.getElementById("grnCreateSelectedSuppName");
    const metaEl = document.getElementById("grnCreateSelectedSuppMeta");
    const hiddenId = document.getElementById("grnCreateSelectedSupplierId");

    const approvedPOs = this.getApprovedPOsForSupplier(supplier);
    const phone = supplier.mobile || supplier.phone || "No Phone";

    if (searchGroup) searchGroup.style.display = "none";
    if (card) card.style.display = "flex";
    if (nameEl) nameEl.textContent = supplier.name;
    if (metaEl) metaEl.textContent = `${phone} • ${approvedPOs.length} Approved PO${approvedPOs.length === 1 ? "" : "s"}`;
    if (hiddenId) hiddenId.value = supplier.id || "";

    if (autoAddPoNumber) {
      const targetPo = this.allPurchaseOrders.find(
        p => p.po_number === autoAddPoNumber || String(p.id) === String(autoAddPoNumber)
      );
      if (targetPo) {
        this.addPurchaseOrder(targetPo);
      }
    }

    this.populateApprovedPoSelector();
  }

  clearSelectedSupplier() {
    this.selectedSupplier = null;
    this.selectedPurchaseOrders = [];
    this.grnItems = [];
    this.removedGrnItems = [];
    this.resetSupplierUI();
    this.renderSelectedPOs();
    this.renderGrnItems();
    this.renderRemovedGrnItems();
    this.calculateFinancials();
  }

  populateApprovedPoSelector() {
    const poSelect = document.getElementById("grnModalApprovedPoSelect");
    const addAllBtn = document.getElementById("grnCreateAddAllApprovedPoBtn");
    const chipsContainer = document.getElementById("grnCreateApprovedPoChips");
    const hintEl = document.getElementById("grnModalPoSearchHint");

    if (!this.selectedSupplier) {
      this.resetSupplierUI();
      return;
    }

    const approvedPOs = this.getApprovedPOsForSupplier(this.selectedSupplier);
    const selectedNumbers = this.selectedPurchaseOrders.map(p => p.po_number);
    const available = approvedPOs.filter(po => !selectedNumbers.includes(po.po_number));

    if (poSelect) {
      poSelect.disabled = false;
      if (available.length === 0) {
        poSelect.innerHTML = approvedPOs.length === 0
          ? `<option value="">No Approved Purchase Orders found for ${this.escapeHtml(this.selectedSupplier.name)}</option>`
          : `<option value="">All Approved POs for ${this.escapeHtml(this.selectedSupplier.name)} are linked (${this.selectedPurchaseOrders.length} linked)</option>`;
      } else {
        poSelect.innerHTML = `<option value="">-- Select Approved PO to Add (${available.length} available) --</option>` +
          available.map(po => {
            const itemCount = po.items ? po.items.length : 0;
            const totalFmt = this.ctx.formatCurrency ? this.ctx.formatCurrency(po.total_amount) : `Rs. ${Number(po.total_amount || 0).toFixed(2)}`;
            return `<option value="${this.escapeHtml(po.po_number)}">${this.escapeHtml(po.po_number)} • ${po.order_date || ""} (${itemCount} items | ${totalFmt})</option>`;
          }).join("");
      }
    }

    if (addAllBtn) {
      addAllBtn.style.display = available.length > 1 ? "inline-flex" : "none";
    }

    if (hintEl) {
      hintEl.textContent = approvedPOs.length > 0
        ? `Showing ${approvedPOs.length} Approved PO(s) for ${this.selectedSupplier.name}. Select to link & auto-load items.`
        : `No Approved Purchase Orders found for ${this.selectedSupplier.name}.`;
    }

    if (chipsContainer) {
      if (available.length === 0) {
        chipsContainer.style.display = "none";
        chipsContainer.innerHTML = "";
      } else {
        chipsContainer.style.display = "flex";
        chipsContainer.innerHTML = available.map(po => {
          const itemCount = po.items ? po.items.length : 0;
          return `
            <button type="button" class="ant-btn ant-btn-default ant-btn-sm grn-create-po-chip" data-po-number="${this.escapeHtml(po.po_number)}" style="height: 28px; font-size: 11.5px; padding: 0 10px; border-radius: 16px; border: 1px dashed rgba(22,119,255,0.45); background: rgba(22,119,255,0.06); color: var(--text); display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
              <i class="fa-solid fa-plus" style="color: #1677ff; font-size: 10px;"></i>
              <strong>${this.escapeHtml(po.po_number)}</strong>
              <span style="color: var(--text-muted);">(${itemCount} items)</span>
            </button>`;
        }).join("");
      }
    }
  }

  addPurchaseOrderByNumber(poNumber) {
    if (!poNumber) return;
    const po = this.allPurchaseOrders.find(
      p => p.po_number === poNumber || String(p.id) === String(poNumber)
    );
    if (po) {
      this.addPurchaseOrder(po);
      this.populateApprovedPoSelector();
    }
  }

  addAllApprovedPOs() {
    if (!this.selectedSupplier) return;
    const approvedPOs = this.getApprovedPOsForSupplier(this.selectedSupplier);
    const selectedNumbers = this.selectedPurchaseOrders.map(p => p.po_number);
    const available = approvedPOs.filter(po => !selectedNumbers.includes(po.po_number));
    available.forEach(po => this.addPurchaseOrder(po));
    this.populateApprovedPoSelector();
  }

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

    // Filter Approved POs ready for GRN
    const activeCount = this.allPurchaseOrders.filter((p) => String(p.status || "").trim().toLowerCase() === "approved").length;
    if (hintEl && !this.activeSupplierFilter) {
      hintEl.textContent = `${activeCount} Approved Purchase Order(s) available across all suppliers. Search or click to link POs.`;
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

    // Approved POs not yet completed and not already selected in this GRN
    const selectedNumbers = this.selectedPurchaseOrders.map((p) => p.po_number);
    let availablePOs = this.allPurchaseOrders.filter(
      (po) => String(po.status || "").trim().toLowerCase() === "approved" && !selectedNumbers.includes(po.po_number)
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

    if (String(po.status || "").trim().toLowerCase() !== "approved") {
      this.showToast(`Please approve Purchase Order ${po.po_number} before receiving a GRN.`, "warning");
      return;
    }

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

        const stockItemId = item.stock_items_id || item.item_id;
        const itemCode = item.item_id || item.code || `ITM-${item.stock_items_id}`;
        const itemBrands = this.getBrandsForItem(stockItemId, itemCode);
        const defaultBrandId = item.brands_id || itemBrands[0]?.id || this.brands[0]?.id || 1;

        this.grnItems.push({
          po_id: po.id,
          po_number: po.po_number,
          stock_items_id: stockItemId,
          item_id: stockItemId,
          item_code: itemCode,
          item_name: item.item_name || item.name || `Material #${item.stock_items_id}`,
          unit: item.unit || "Units",
          qty_ordered: qtyOrdered,
          qty_received_prev: qtyReceived,
          receiving_qty: remainingQty,
          unit_cost: unitCost,
          total: remainingQty * unitCost,
          brands_id: defaultBrandId,
          batch_mode: "NEW",
          batch_id: null
        });
      });
    }

    // Clean up any old removed items of this PO if it was re-linked
    this.removedGrnItems = this.removedGrnItems.filter((itm) => itm.po_number !== po.po_number);

    this.renderSelectedPOs();
    this.renderGrnItems();
    this.renderRemovedGrnItems();
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
      this.removedGrnItems = this.removedGrnItems.filter((itm) => itm.po_number !== poNumber);

      this.renderSelectedPOs();
      this.renderGrnItems();
      this.renderRemovedGrnItems();
      this.calculateFinancials();
      this.populateApprovedPoSelector();

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
        <td class="text-center" style="text-align: center; vertical-align: middle;">
          <button type="button"
                  class="ant-btn-action text-danger grn-remove-po-btn"
                  data-po-number="${po.po_number}"
                  title="Remove this Purchase Order and its items from GRN"
                  style="display: inline-flex; align-items: center; justify-content: center; border-color: rgba(255, 77, 79, 0.35); color: #ff4d4f; background: rgba(255, 77, 79, 0.12); height: 28px; width: 28px; padding: 0; gap: 0; line-height: 1; border-radius: 4px; box-sizing: border-box; cursor: pointer; margin: 0 auto;">
            <i class="fa-solid fa-trash-can" style="font-size: 12px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; margin: 0;"></i>
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
      const hasRemoved = this.removedGrnItems && this.removedGrnItems.length > 0;
      const emptyTitle = hasRemoved ? "All Materials Removed from Receiving List" : "No Materials Loaded Yet";
      const emptySubtitle = hasRemoved
        ? `You have removed all ${this.removedGrnItems.length} items from linked Purchase Orders. Use the 'Removed Items' panel above to re-add items, or link another Purchase Order.`
        : "Link one or more Purchase Orders above to automatically populate material line items and pending quantities.";

      tbody.innerHTML = `
        <tr id="grnModalEmptyRow">
          <td colspan="11" style="text-align: center; padding: 32px 16px; background: rgba(0, 0, 0, 0.015); border-radius: 6px;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: ${hasRemoved ? 'rgba(250, 173, 20, 0.12)' : 'rgba(22, 119, 255, 0.08)'}; display: flex; align-items: center; justify-content: center; color: ${hasRemoved ? '#d46b08' : '#1677ff'}; font-size: 18px;">
                <i class="${hasRemoved ? 'fa-solid fa-clock-rotate-left' : 'fa-solid fa-boxes-stacked'}"></i>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text);">
                ${emptyTitle}
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted); max-width: 420px; line-height: 1.4;">
                ${emptySubtitle}
              </div>
            </div>
          </td>
        </tr>
      `;
      if (hint) {
        hint.textContent = hasRemoved
          ? `${this.removedGrnItems.length} item(s) currently removed. You can re-add them above.`
          : "Select active Purchase Orders above to automatically populate received materials.";
      }
      return;
    }

    if (hint) {
      hint.textContent = `${this.grnItems.length} items loaded from ${this.selectedPurchaseOrders.length} linked Purchase Orders. Adjust receiving quantities or costs.`;
    }

    this.grnItems.forEach((item, index) => {
      const tr = document.createElement("tr");

      const isFullyDelivered = item.qty_ordered > 0 && item.qty_received_prev >= item.qty_ordered;
      const availableBrands = this.getBrandsForItem(item.stock_items_id, item.item_code);
      const existingBatches = this.getExistingBatchesForItem(item.stock_items_id, item.item_code);

      if (!item.brands_id && availableBrands.length > 0) {
        item.brands_id = availableBrands[0].id;
      }

      const brandOptionsHtml = availableBrands.length > 0
        ? availableBrands.map(b =>
            `<option value="${b.id}" ${Number(b.id) === Number(item.brands_id) ? "selected" : ""}>${this.escapeHtml(b.brand)}</option>`
          ).join("")
        : `<option value="${item.brands_id || 1}">Default Brand</option>`;

      const isExistingBatchMode = item.batch_mode === "EXISTING" && existingBatches.length > 0;
      if (isExistingBatchMode && !item.batch_id && existingBatches.length > 0) {
        item.batch_id = existingBatches[0].id;
      }

      const batchSelectHtml = isExistingBatchMode
        ? `<select class="grn-inline-input grn-modal-batch-id-select"
                   data-item-index="${index}"
                   aria-label="Select existing batch for ${this.escapeHtml(item.item_name)}"
                   style="height: 28px; font-size: 11.5px; padding: 0 6px; width: 100%; margin-top: 4px; border-color: #1677ff;">
             <option value="">-- Select Batch --</option>
             ${existingBatches.map(b =>
               `<option value="${b.id}" ${Number(b.id) === Number(item.batch_id) ? "selected" : ""}>${this.escapeHtml(b.batch_no || `BAT-${b.id}`)}</option>`
             ).join("")}
           </select>`
        : "";

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
          <select class="grn-inline-input grn-modal-brand-select"
                  data-item-index="${index}"
                  aria-label="Brand for ${this.escapeHtml(item.item_name)}"
                  style="height: 30px; font-size: 12px; padding: 0 6px; width: 100%; min-width: 120px;">
            ${brandOptionsHtml}
          </select>
        </td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <select class="grn-inline-input grn-modal-batch-mode-select"
                    data-item-index="${index}"
                    aria-label="Stock or Batch type for ${this.escapeHtml(item.item_name)}"
                    style="height: 30px; font-size: 12px; padding: 0 6px; width: 100%; min-width: 155px;">
              <option value="NEW" ${!isExistingBatchMode ? "selected" : ""}>New Stock (New Batch)</option>
              <option value="EXISTING" ${isExistingBatchMode ? "selected" : ""} ${existingBatches.length === 0 ? "disabled" : ""}>
                Existing Batch${existingBatches.length === 0 ? " (No Batches)" : ` (${existingBatches.length})`}
              </option>
            </select>
            ${batchSelectHtml}
          </div>
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
        <td class="text-center" style="text-align: center; vertical-align: middle;">
          <button type="button"
                  class="ant-btn-action text-danger grn-modal-remove-item-btn"
                  data-item-index="${index}"
                  title="Remove this item from GRN"
                  style="display: inline-flex; align-items: center; justify-content: center; border-color: rgba(255, 77, 79, 0.35); color: #ff4d4f; background: rgba(255, 77, 79, 0.12); height: 26px; width: 26px; padding: 0; gap: 0; line-height: 1; border-radius: 4px; box-sizing: border-box; cursor: pointer; margin: 0 auto;">
            <i class="fa-solid fa-trash-can" style="font-size: 11px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; margin: 0;"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Wire brand, batch mode, and existing batch selectors
    tbody.querySelectorAll(".grn-modal-brand-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        if (this.grnItems[idx]) {
          this.grnItems[idx].brands_id = parseInt(e.target.value, 10) || null;
        }
      });
    });

    tbody.querySelectorAll(".grn-modal-batch-mode-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        if (this.grnItems[idx]) {
          const mode = e.target.value === "EXISTING" ? "EXISTING" : "NEW";
          this.grnItems[idx].batch_mode = mode;
          if (mode === "EXISTING") {
            const batches = this.getExistingBatchesForItem(this.grnItems[idx].stock_items_id, this.grnItems[idx].item_code);
            this.grnItems[idx].batch_id = batches[0]?.id || null;
          } else {
            this.grnItems[idx].batch_id = null;
          }
          this.renderGrnItems();
        }
      });
    });

    tbody.querySelectorAll(".grn-modal-batch-id-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.itemIndex, 10);
        if (this.grnItems[idx]) {
          this.grnItems[idx].batch_id = parseInt(e.target.value, 10) || null;
        }
      });
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
   * Keeps track of removed items so they can be re-added anytime.
   *
   * @param {number} index
   */
  removeItem(index) {
    if (this.grnItems[index]) {
      const removed = this.grnItems.splice(index, 1)[0];
      this.removedGrnItems.push(removed);
      this.renderGrnItems();
      this.renderRemovedGrnItems();
      this.calculateFinancials();
      this.showToast(`Removed "${removed.item_name}" from receiving list.`, "info");
    }
  }

  /**
   * Re-add a single removed item back into the receiving table.
   *
   * @param {number} removedIndex
   */
  readdItem(removedIndex) {
    if (this.removedGrnItems[removedIndex]) {
      const restored = this.removedGrnItems.splice(removedIndex, 1)[0];
      this.grnItems.push(restored);
      this.renderGrnItems();
      this.renderRemovedGrnItems();
      this.calculateFinancials();
      this.showToast(`Re-added "${restored.item_name}" to receiving list.`, "success");
    }
  }

  /**
   * Re-add all previously removed items back into the receiving table.
   */
  readdAllItems() {
    if (!this.removedGrnItems || this.removedGrnItems.length === 0) return;
    const count = this.removedGrnItems.length;
    this.grnItems.push(...this.removedGrnItems);
    this.removedGrnItems = [];
    this.renderGrnItems();
    this.renderRemovedGrnItems();
    this.calculateFinancials();
    this.showToast(`Re-added all ${count} removed items to receiving list.`, "success");
  }

  /**
   * Handle re-adding an item from the dropdown selector.
   */
  handleReaddFromDropdown() {
    const select = document.getElementById("grnModalReaddSelect");
    const val = select?.value;
    if (val === "" || val === null || val === undefined) {
      this.showToast("Please choose an item from the dropdown to re-add.", "warning");
      return;
    }
    const idx = parseInt(val, 10);
    this.readdItem(idx);
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

    const count = this.removedGrnItems.length;

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

    // Populate dropdown
    if (select) {
      select.innerHTML =
        '<option value="">-- Select Removed Item to Re-add --</option>' +
        this.removedGrnItems
          .map(
            (itm, idx) =>
              `<option value="${idx}">[${this.escapeHtml(itm.po_number)}] ${this.escapeHtml(itm.item_name)} (${itm.receiving_qty} ${this.escapeHtml(itm.unit)})</option>`
          )
          .join("");
    }

    // Populate chips
    container.innerHTML = "";
    this.removedGrnItems.forEach((item, index) => {
      const chip = document.createElement("div");
      chip.style.cssText =
        "display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1.5px dashed #ffd591; padding: 5px 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);";

      const costFmt = this.ctx.formatCurrency
        ? this.ctx.formatCurrency(item.unit_cost)
        : `Rs. ${Number(item.unit_cost || 0).toFixed(2)}`;

      chip.innerHTML = `
        <span style="font-weight: 700; color: #1677ff; font-family: ui-monospace; font-size: 11px; background: rgba(22,119,255,0.08); padding: 1px 6px; border-radius: 4px;">
          ${this.escapeHtml(item.po_number)}
        </span>
        <div style="display: flex; flex-direction: column; min-width: 0;">
          <span style="font-weight: 600; font-size: 12px; color: var(--text);">${this.escapeHtml(item.item_name)}</span>
          <span style="font-size: 10.5px; color: var(--text-muted);">
            Ordered: ${item.qty_ordered} &bull; Rec: <strong>${item.receiving_qty} ${this.escapeHtml(item.unit)}</strong> @ ${costFmt}
          </span>
        </div>
        <button type="button" class="ant-btn ant-btn-primary ant-btn-sm grn-readd-single-item-btn" data-removed-index="${index}" style="height: 24px; font-size: 11px; padding: 0 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;" title="Re-add this item to Received Materials">
          <i class="fa-solid fa-plus"></i> Re-add
        </button>
      `;

      container.appendChild(chip);
    });

    // Wire individual re-add buttons
    container.querySelectorAll(".grn-readd-single-item-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute("data-removed-index"), 10);
        this.readdItem(idx);
      });
    });
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
    const remarks = document.getElementById("grnModalRemarks")?.value?.trim() || "";

    if (!this.selectedPurchaseOrders || this.selectedPurchaseOrders.length === 0) {
      this.showToast("Please select a supplier and link at least one Approved Purchase Order to this GRN", "error");
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
      if (!item.brands_id) {
        this.showToast(`Please select a brand for "${item.item_name}"`, "error");
        return;
      }
      if (item.batch_mode === "EXISTING" && !item.batch_id) {
        this.showToast(`Please select an existing batch for "${item.item_name}"`, "error");
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
        status: "Pending",
        purchase_orders: purchaseOrdersPayload,
        purchase_orders_id: primaryPo.id,
        supplyer_invoice: primaryPo.supplier_invoice,
        stocks: this.grnItems.map((item) => ({
          stock_items_id: parseInt(item.stock_items_id, 10),
          purchase_orders_id: item.po_id,
          brands_id: parseInt(item.brands_id, 10) || 1,
          create_new_batch: item.batch_mode !== "EXISTING",
          batch_id: item.batch_mode === "EXISTING" && item.batch_id ? parseInt(item.batch_id, 10) : null,
          qty: Math.round(item.receiving_qty),
          buy: parseFloat(item.unit_cost) || 0,
          price: parseFloat((item.unit_cost * 1.25).toFixed(2))
        }))
      };

      const response = await this.http.post("/api/v1/grns", payload);
      const createdGrn = response?.data || response;
      const grnCode = createdGrn?.grn_number || createdGrn?.grn_id || `GRN-${Date.now().toString().slice(-4)}`;

      this.showToast(
        `Goods Received Note ${grnCode} created with Pending status! ${this.selectedPurchaseOrders.length} PO(s) linked.`,
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
