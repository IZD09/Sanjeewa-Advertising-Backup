/**
 * SanjeewaAdvertising - Record GRN Payment Modal
 *
 * Handles recording Stock Material & Multi-Purchase Order Disbursements (#modalRecordGrnPayment).
 * Workflow:
 *  1. Search & Select Supplier (optional first step; or auto-selected when a PO is picked)
 *  2. Select Pending Purchase Orders (shows supplier's pending POs, or all pending POs before supplier selection)
 *  3. Consolidate multiple Purchase Orders into one GRN with custom allocations
 *  4. Select Payment Method (Cash, Bank Transfer, Credit Card, Debit Card, Cheque, Online/QR)
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";
import { GrnPaymentBuilder } from "../builders/GrnPaymentBuilder.js";
import { GrnPaymentProcessor } from "../processors/GrnPaymentProcessor.js";

export class RecordGrnPaymentModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getGrnRecords
   * @param {Function} context.getGrnPayments
   * @param {Function} context.saveGrnPayments
   * @param {Function} context.render
   * @param {Function} [context.openReceiptModal]
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".pay-modal-backdrop",
      toastContainerId: "poToastContainer",
      closeSelectors: [".pay-modal-close", "[data-close-pay-modal]"],
      autoBind: true
    });

    this.ctx = context;
    this.http = new RequestHandler();
    this.processor = new GrnPaymentProcessor(this.ctx);

    this.suppliers = [];
    this.availablePos = [];
    this.selectedSupplier = null;
    this.pendingPOs = [];
    this.selectedPOs = [];
    this.selectedPaymentTypeId = 1;
    this.selectedMethod = "Cash";
    this.isSubmitting = false;

    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      // Open triggers
      const openBtn = e.target.closest("#btnOpenRecordGrnPayment, [data-action='record-grn']");
      if (openBtn) {
        e.preventDefault();
        const prefillId = openBtn.getAttribute("data-grn-id") || openBtn.getAttribute("data-pay-ref") || null;
        this.openRecordGrnPaymentModal(prefillId);
        return;
      }

      // Remove PO Button click
      const removeBtn = e.target.closest(".btn-remove-po");
      if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const poId = removeBtn.getAttribute("data-po-id");
        if (poId) {
          this.removePo(poId);
        }
        return;
      }

      // Quick PO Chip click
      const poChip = e.target.closest(".grn-quick-po-chip");
      if (poChip) {
        e.preventDefault();
        const poId = poChip.getAttribute("data-po-id");
        if (poId) {
          this.addPoById(poId);
        }
        return;
      }

      // Pay Full Balance shortcut
      const payFullBtn = e.target.closest("#btnGrnPayFull");
      if (payFullBtn) {
        e.preventDefault();
        this.payFullBalance();
        return;
      }

      // Method selector inside modal
      const methodChoice = e.target.closest("#grnModalMethodSelector .method-choice");
      if (methodChoice) {
        e.preventDefault();
        const typeId = parseInt(methodChoice.getAttribute("data-type-id"), 10) || 1;
        const methodName = methodChoice.getAttribute("data-method") || "Cash";
        this.setPaymentType(typeId, methodName);
        return;
      }

      // Supplier dropdown toggle button
      const toggleSuppBtn = e.target.closest("#grnToggleSuppDropdownBtn");
      if (toggleSuppBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSupplierDropdown();
        return;
      }

      // Supplier item click inside search dropdown
      const suppItem = e.target.closest(".grn-supp-item");
      if (suppItem) {
        e.preventDefault();
        const suppId = parseInt(suppItem.getAttribute("data-supplier-id"), 10);
        const supp = this.suppliers.find(s => Number(s.id) === suppId);
        if (supp) {
          this.selectSupplier(supp);
        }
        return;
      }

      // Clear / Change supplier button
      const clearSuppBtn = e.target.closest("#grnClearSupplierBtn");
      if (clearSuppBtn) {
        e.preventDefault();
        this.clearSelectedSupplier();
        return;
      }

      // Add All Pending POs button
      const addAllBtn = e.target.closest("#grnBtnAddAllPos");
      if (addAllBtn) {
        e.preventDefault();
        this.addAllPendingPOs();
        return;
      }

      // Confirm Save Button click
      const confirmBtn = e.target.closest("#btnConfirmSaveGrnPayment");
      if (confirmBtn) {
        e.preventDefault();
        this.save();
        return;
      }

      // Click outside supplier dropdown -> close dropdown
      const searchGroup = document.getElementById("grnSuppSearchGroup");
      const dropdown = document.getElementById("grnSuppDropdown");
      if (dropdown && dropdown.style.display !== "none") {
        if (!searchGroup || !searchGroup.contains(e.target)) {
          this.hideSupplierDropdown();
        }
      }
    });

    // Supplier Search Input typing & focus
    const suppSearchInput = document.getElementById("grnSuppSearchInput");
    if (suppSearchInput) {
      suppSearchInput.addEventListener("input", (e) => {
        this.renderSupplierDropdown(e.target.value.trim());
      });
      suppSearchInput.addEventListener("focus", () => {
        this.renderSupplierDropdown(suppSearchInput.value.trim());
      });
    }

    // PO Selector dropdown - automatically add PO when selected (and auto-select supplier if needed)
    const refSelect = document.getElementById("grnModalRefSelect");
    if (refSelect) {
      refSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val) {
          this.addPoById(val);
          refSelect.value = "";
        }
      });
    }

    // Total Amount Input
    const amountInput = document.getElementById("grnModalAmount");
    if (amountInput) {
      amountInput.addEventListener("input", () => this.onTotalAmountChanged());
    }

    // Individual PO Allocation Input change / input
    const poTableBody = document.getElementById("grnModalSelectedPoBody");
    if (poTableBody) {
      poTableBody.addEventListener("input", (e) => {
        const allocInput = e.target.closest(".pay-po-allocation");
        if (allocInput) {
          const poId = allocInput.getAttribute("data-po-id");
          const val = parseFloat(allocInput.value) || 0;
          this.onPoAllocationChanged(poId, val);
        }
      });
    }
  }

  async openRecordGrnPaymentModal(prefillGrnId = null) {
    const modal = document.getElementById("modalRecordGrnPayment");
    if (!modal) return;

    this.setPaymentType(1, "Cash");

    const dateInput = document.getElementById("grnModalDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("grnModalNotes");
    if (noteInput) noteInput.value = "";

    this.selectedSupplier = null;
    this.pendingPOs = [];
    this.selectedPOs = [];

    this.resetSupplierUI();
    this.renderSelectedPoTable();
    this.recalculateSummary();

    // Load suppliers & available purchase orders concurrently
    await Promise.all([
      this.loadSuppliers(),
      this.loadAvailablePurchaseOrders()
    ]);

    if (prefillGrnId) {
      this.handlePrefillPo(prefillGrnId);
    } else {
      this.updateDropdown();
      this.renderQuickPoChips();
    }

    this.openModal("modalRecordGrnPayment");
  }

  async loadSuppliers() {
    try {
      const res = await this.http.get("/api/v1/suppliers/all");
      const data = res?.data || res;
      this.suppliers = Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.warn("[RecordGrnPaymentModal] Could not fetch supplier list:", err);
      this.suppliers = [];
    }
  }

  async loadAvailablePurchaseOrders() {
    let records = [];
    try {
      const res = await this.http.get("/api/v1/grn-payments/available-pos");
      const data = res?.data || res;
      const livePos = Array.isArray(data) ? data : (data?.pos || []);
      if (Array.isArray(livePos)) {
        records = livePos.map(g => ({
          id: g.id || g.poNumber,
          raw_id: g.raw_id || parseInt(String(g.poNumber || g.id || "").replace(/\D/g, ""), 10) || null,
          poNumber: g.poNumber || g.id,
          orderDate: g.orderDate || g.add_date || null,
          status: g.status || "Pending",
          notes: g.notes || "",
          grn_id: g.grn_id || null,
          grnNumber: g.grnNumber || (g.grn_id ? `GRN-0${g.grn_id}` : "GRN-Pending"),
          supplier_id: g.supplier_id || null,
          supplierName: g.supplierName || g.supplier_name || "Direct Supplier",
          supplierBankAccount: g.supplierBankAccount || g.bank_account || "",
          stockCategory: g.stockCategory || "Stock Consignment",
          items: Array.isArray(g.items) ? g.items : [],
          totalAmount: Number(g.totalAmount ?? g.totalBill ?? 0),
          paidAmount: Number(g.paidAmount ?? 0),
          balanceAmount: Number(g.balanceAmount ?? g.balance ?? 0),
          supplierInvoice: g.supplierInvoice || ""
        }));
      }
    } catch (err) {
      console.warn("[RecordGrnPaymentModal] Could not fetch live purchase orders:", err);
    }

    // Fallback to context if API returned empty
    if (records.length === 0) {
      const ctxGrns = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
      records = ctxGrns.map(g => ({
        id: g.poNumber || g.purchase_order_no || g.id,
        poNumber: g.poNumber || g.purchase_order_no || `PO-0${g.id}`,
        grn_id: g.grn_id || g.id,
        grnNumber: g.grnNumber || g.grn_number || `GRN-0${g.id}`,
        supplier_id: g.supplier_id || null,
        supplierName: g.supplierName || g.supplier_name || "Supplier",
        stockCategory: g.stockCategory || g.stock_category || "Stock Consignment",
        totalAmount: Number(g.net_total ?? g.totalAmount ?? g.totalBill ?? 0),
        paidAmount: Number(g.paid_amount ?? g.paidAmount ?? 0),
        balanceAmount: Number(g.balance ?? g.balanceAmount ?? 0),
        supplierInvoice: g.supplier_invoice_no || g.supplierInvoice || ""
      }));
    }

    this.availablePos = records;
  }

  getAllPendingPOs() {
    return this.availablePos.filter(po => (Number(po.balanceAmount) || 0) > 0);
  }

  getSupplierPendingPOs(supplier) {
    if (!supplier) return this.getAllPendingPOs();
    return this.getAllPendingPOs().filter(po => {
      const matchId = supplier.id && po.supplier_id && Number(po.supplier_id) === Number(supplier.id);
      const matchName = supplier.name && po.supplierName &&
        String(po.supplierName).trim().toLowerCase() === String(supplier.name).trim().toLowerCase();
      return matchId || matchName;
    });
  }

  findSupplierForPo(po) {
    if (!po) return null;
    let supp = null;
    if (po.supplier_id) {
      supp = this.suppliers.find(s => Number(s.id) === Number(po.supplier_id));
    }
    if (!supp && po.supplierName) {
      const cleanName = String(po.supplierName).trim().toLowerCase();
      supp = this.suppliers.find(s => String(s.name || "").trim().toLowerCase() === cleanName);
    }
    if (!supp) {
      supp = {
        id: po.supplier_id || null,
        code: po.supplier_id ? `SUP-${String(po.supplier_id).padStart(3, "0")}` : "SUP",
        name: po.supplierName || "Direct Supplier",
        mobile: "",
        bank_account: po.supplierBankAccount || ""
      };
    }
    return supp;
  }

  handlePrefillPo(prefillId) {
    const clean = String(prefillId).trim().toLowerCase();
    const found = this.availablePos.find(g =>
      String(g.id ?? "").toLowerCase() === clean ||
      String(g.poNumber ?? "").toLowerCase() === clean ||
      String(g.grnNumber ?? "").toLowerCase() === clean
    );
    if (found) {
      const supp = this.findSupplierForPo(found);
      if (supp) {
        this.selectSupplier(supp, found.id);
      } else {
        this.addPoObject(found);
        this.updateDropdown();
        this.renderQuickPoChips();
        this.renderSelectedPoTable();
        this.recalculateSummary();
      }
    } else {
      this.updateDropdown();
      this.renderQuickPoChips();
    }
  }

  resetSupplierUI() {
    const searchGroup = document.getElementById("grnSuppSearchGroup");
    const searchInput = document.getElementById("grnSuppSearchInput");
    const suppCard = document.getElementById("grnSelectedSupplierCard");
    const suppIdHidden = document.getElementById("grnSelectedSupplierId");
    const dropdown = document.getElementById("grnSuppDropdown");
    const addAllBtn = document.getElementById("grnBtnAddAllPos");
    const quickList = document.getElementById("grnPendingPoQuickList");
    const helpMsg = document.getElementById("grnPoSelectHelpMsg");

    if (searchGroup) searchGroup.style.display = "block";
    if (searchInput) searchInput.value = "";
    if (suppCard) suppCard.style.display = "none";
    if (suppIdHidden) suppIdHidden.value = "";
    if (dropdown) dropdown.style.display = "none";
    if (addAllBtn) addAllBtn.style.display = "none";
    if (quickList) {
      quickList.style.display = "none";
      quickList.innerHTML = "";
    }
    if (helpMsg) {
      helpMsg.textContent = "Select a pending purchase order above (auto-selects its supplier) or choose a supplier first to filter their pending POs.";
    }
  }

  toggleSupplierDropdown() {
    const dropdown = document.getElementById("grnSuppDropdown");
    if (!dropdown) return;

    if (dropdown.style.display === "block") {
      this.hideSupplierDropdown();
    } else {
      const searchInput = document.getElementById("grnSuppSearchInput");
      this.renderSupplierDropdown(searchInput ? searchInput.value.trim() : "");
    }
  }

  hideSupplierDropdown() {
    const dropdown = document.getElementById("grnSuppDropdown");
    const icon = document.getElementById("grnSuppDropdownIcon");
    if (dropdown) dropdown.style.display = "none";
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }

  renderSupplierDropdown(query = "") {
    const dropdown = document.getElementById("grnSuppDropdown");
    const icon = document.getElementById("grnSuppDropdownIcon");
    if (!dropdown) return;

    const cleanQuery = String(query).toLowerCase().trim();
    let matches = this.suppliers.filter(s => (s.status || "Active").toLowerCase() !== "disabled" || this.getSupplierPendingPOs(s).length > 0);

    if (cleanQuery) {
      matches = matches.filter(s => {
        const name = String(s.name || "").toLowerCase();
        const mobile = String(s.mobile || s.phone || "").toLowerCase();
        const code = String(s.code || "").toLowerCase();
        const id = String(s.id || "");
        return name.includes(cleanQuery) || mobile.includes(cleanQuery) || code.includes(cleanQuery) || id === cleanQuery;
      });
    }

    // Sort suppliers with pending POs first
    matches.sort((a, b) => this.getSupplierPendingPOs(b).length - this.getSupplierPendingPOs(a).length);

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 14px 16px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-truck-field" style="margin-right: 6px; opacity: 0.6;"></i>
          No suppliers found matching "<strong>${this.escapeHtml(query)}</strong>"
        </div>`;
    } else {
      dropdown.innerHTML = matches.slice(0, 35).map(s => {
        const pendingCount = this.getSupplierPendingPOs(s).length;
        const phone = s.mobile || s.phone || "No Phone";
        const code = s.code || `SUP-${String(s.id).padStart(3, "0")}`;
        return `
          <div class="grn-supp-item" data-supplier-id="${s.id}" style="padding: 10px 14px; border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06)); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
            <div style="min-width: 0;">
              <strong style="color: var(--text); font-size: 13px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(s.name)}</strong>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">
                ${this.escapeHtml(phone)} • ${this.escapeHtml(code)}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              ${pendingCount > 0
                ? `<span style="font-size: 10px; background: rgba(16,185,129,0.1); color: #10b981; padding: 2px 8px; border-radius: 10px; font-weight: 700;">${pendingCount} Pending PO${pendingCount === 1 ? "" : "s"}</span>`
                : `<span style="font-size: 10px; color: var(--text-muted);">0 Pending</span>`}
              <span style="font-size: 11px; font-weight: 700; color: #10b981;">Select &rarr;</span>
            </div>
          </div>`;
      }).join("");

      dropdown.querySelectorAll(".grn-supp-item").forEach(item => {
        item.addEventListener("mouseenter", () => item.style.backgroundColor = "var(--surface-2, rgba(16,185,129,0.06))");
        item.addEventListener("mouseleave", () => item.style.backgroundColor = "");
      });
    }

    dropdown.style.display = "block";
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  }

  selectSupplier(supplier, autoSelectPoId = null) {
    if (!supplier) return;

    this.selectedSupplier = supplier;
    this.hideSupplierDropdown();

    const searchGroup = document.getElementById("grnSuppSearchGroup");
    const suppCard = document.getElementById("grnSelectedSupplierCard");
    const suppNameEl = document.getElementById("grnSelectedSuppName");
    const suppMobileEl = document.getElementById("grnSelectedSuppMobile");
    const suppIdHidden = document.getElementById("grnSelectedSupplierId");
    const pendingBadge = document.getElementById("grnSelectedSuppPendingBadge");
    const helpMsg = document.getElementById("grnPoSelectHelpMsg");

    const code = supplier.code || (supplier.id ? `SUP-${String(supplier.id).padStart(3, "0")}` : "SUP");
    const phone = supplier.mobile || supplier.phone || "No Phone";

    if (searchGroup) searchGroup.style.display = "none";
    if (suppCard) suppCard.style.display = "flex";
    if (suppNameEl) suppNameEl.textContent = supplier.name;
    if (suppMobileEl) suppMobileEl.textContent = `${phone} • ${code}`;
    if (suppIdHidden) suppIdHidden.value = supplier.id || "";

    // Load pending POs for this supplier
    this.pendingPOs = this.getSupplierPendingPOs(supplier);
    const count = this.pendingPOs.length;

    if (pendingBadge) {
      pendingBadge.textContent = `${count} Pending PO${count === 1 ? "" : "s"}`;
      pendingBadge.style.color = count > 0 ? "#10b981" : "var(--text-muted)";
    }

    if (helpMsg) {
      helpMsg.textContent = count > 0
        ? `Showing ${count} pending purchase order(s) for ${supplier.name}. Click or select POs to add them to this GRN.`
        : `No pending purchase orders found for ${supplier.name}. All orders are settled.`;
    }

    // If autoSelectPoId was passed (e.g., PO clicked before supplier), add it
    if (autoSelectPoId) {
      const targetPo = this.availablePos.find(p =>
        String(p.id).toLowerCase() === String(autoSelectPoId).toLowerCase() ||
        String(p.poNumber || "").toLowerCase() === String(autoSelectPoId).toLowerCase()
      );
      if (targetPo) {
        this.addPoObject(targetPo);
      }
    }

    this.updateDropdown();
    this.renderQuickPoChips();
    this.renderSelectedPoTable();
    this.recalculateSummary();
    this.updateMethodFields();
  }

  clearSelectedSupplier() {
    this.selectedSupplier = null;
    this.pendingPOs = [];
    this.selectedPOs = [];

    this.resetSupplierUI();
    this.updateDropdown();
    this.renderQuickPoChips();
    this.renderSelectedPoTable();
    this.recalculateSummary();
    this.updateMethodFields();
  }

  addPoObject(grnOrPo) {
    const id = grnOrPo.poNumber || grnOrPo.purchase_order_no || grnOrPo.po_number || grnOrPo.grnNumber || grnOrPo.grn_number || (grnOrPo.id ? `PO-0${grnOrPo.id}` : "PO-0101");
    if (!id || id === "-") return;
    if (this.selectedPOs.some(p => String(p.id).toLowerCase() === String(id).toLowerCase())) return;

    const tot = Number(grnOrPo.totalAmount ?? grnOrPo.totalBill ?? grnOrPo.net_total ?? 0) || 0;
    const paid = Number(grnOrPo.paidAmount ?? grnOrPo.amount ?? grnOrPo.paid_amount ?? 0) || 0;
    const bal = Number(grnOrPo.balanceAmount ?? grnOrPo.balance ?? grnOrPo.balance_amount ?? Math.max(0, tot - paid)) || 0;

    const grnNum = grnOrPo.grnNumber || grnOrPo.grn_number || (grnOrPo.grn_id ? `GRN-0${grnOrPo.grn_id}` : `GRN-${String(id).replace("PO-", "")}`);
    const poNum = (grnOrPo.poNumber && grnOrPo.poNumber !== "-") ? grnOrPo.poNumber : (grnOrPo.purchase_order_no && grnOrPo.purchase_order_no !== "-" ? grnOrPo.purchase_order_no : id);
    const suppInv = grnOrPo.supplierInvoice || grnOrPo.supplier_invoice || grnOrPo.supplyer_invoice || grnOrPo.supplier_invoice_no || "";

    this.selectedPOs.push({
      id: id,
      raw_id: grnOrPo.raw_id || parseInt(String(poNum || id).replace(/\D/g, ""), 10) || null,
      grn_id: grnOrPo.grn_id || null,
      grnNumber: grnNum,
      poNumber: poNum,
      supplier_id: grnOrPo.supplier_id || null,
      supplierInvoice: suppInv,
      supplierName: grnOrPo.supplierName || grnOrPo.supplier_name || "Direct Consignment",
      stockCategory: grnOrPo.stockCategory || grnOrPo.stock_category || "Stock Supplies",
      totalAmount: tot,
      paidAmount: paid,
      balanceAmount: bal,
      allocatedAmount: bal > 0 ? bal : tot
    });
  }

  findPoByIdOrQuery(query) {
    if (!query) return null;
    const clean = String(query).trim().toLowerCase().replace(/^#/, "");
    if (!clean) return null;

    let match = this.availablePos.find(g =>
      String(g.poNumber ?? "").toLowerCase() === clean ||
      String(g.grnNumber ?? "").toLowerCase() === clean ||
      String(g.id ?? "").toLowerCase() === clean
    );
    if (match) return match;

    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    match = grnRecords.find(g =>
      String(g.poNumber ?? g.purchase_order_no ?? g.po_number ?? "").toLowerCase() === clean ||
      String(g.grnNumber ?? g.grn_number ?? g.id ?? "").toLowerCase() === clean
    );
    return match || null;
  }

  addPoById(poId) {
    if (!poId) return;
    const found = this.findPoByIdOrQuery(poId);
    if (!found) return;

    const cleanId = found.poNumber || found.id || found.grnNumber;
    if (this.selectedPOs.some(p =>
      String(p.id).toLowerCase() === String(cleanId).toLowerCase() ||
      String(p.poNumber || "").toLowerCase() === String(cleanId).toLowerCase()
    )) {
      this.showToast(`Purchase Order ${cleanId} is already included in this GRN.`, "info");
      return;
    }

    // If supplier is NOT selected yet, automatically select this PO's supplier and filter pending POs!
    if (!this.selectedSupplier) {
      const supp = this.findSupplierForPo(found);
      if (supp) {
        this.selectSupplier(supp, found.id || found.poNumber);
        this.showToast(`Supplier "${supp.name}" selected & PO ${found.poNumber || found.id} added to GRN!`);
        return;
      }
    }

    this.addPoObject(found);
    this.updateDropdown();
    this.renderQuickPoChips();
    this.renderSelectedPoTable();
    this.recalculateSummary();
    this.showToast(`Purchase Order ${found.poNumber || found.id} added to GRN!`);
  }

  addAllPendingPOs() {
    const sourceList = this.selectedSupplier ? this.pendingPOs : this.getAllPendingPOs();
    let addedCount = 0;

    sourceList.forEach(po => {
      const cleanId = po.poNumber || po.id;
      const alreadyExists = this.selectedPOs.some(p =>
        String(p.id).toLowerCase() === String(cleanId).toLowerCase() ||
        String(p.poNumber || "").toLowerCase() === String(cleanId).toLowerCase()
      );
      if (!alreadyExists) {
        this.addPoObject(po);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.updateDropdown();
      this.renderQuickPoChips();
      this.renderSelectedPoTable();
      this.recalculateSummary();
      this.showToast(`Added ${addedCount} pending purchase order(s) to this GRN.`);
    }
  }

  removePo(poId) {
    this.selectedPOs = this.selectedPOs.filter(p =>
      String(p.id).toLowerCase() !== String(poId).toLowerCase() &&
      String(p.poNumber || "").toLowerCase() !== String(poId).toLowerCase()
    );
    this.updateDropdown();
    this.renderQuickPoChips();
    this.renderSelectedPoTable();
    this.recalculateSummary();
    this.showToast(`Purchase Order ${poId} removed from GRN.`, "info");
  }

  updateDropdown() {
    const select = document.getElementById("grnModalRefSelect");
    const addAllBtn = document.getElementById("grnBtnAddAllPos");
    if (!select) return;

    const sourceList = this.selectedSupplier ? this.pendingPOs : this.getAllPendingPOs();

    const unselected = sourceList.filter(po => {
      const poNum = po.poNumber || po.id;
      return !this.selectedPOs.some(sel =>
        String(sel.id).toLowerCase() === String(poNum).toLowerCase() ||
        String(sel.poNumber || "").toLowerCase() === String(poNum).toLowerCase()
      );
    });

    if (this.selectedSupplier && unselected.length > 0 && addAllBtn) {
      addAllBtn.style.display = "inline-flex";
    } else if (addAllBtn) {
      addAllBtn.style.display = "none";
    }

    if (unselected.length === 0) {
      if (this.selectedSupplier) {
        select.innerHTML = sourceList.length === 0
          ? `<option value="">No pending purchase orders for ${this.escapeHtml(this.selectedSupplier.name)}</option>`
          : `<option value="">All pending POs for ${this.escapeHtml(this.selectedSupplier.name)} are added (${this.selectedPOs.length} selected)</option>`;
      } else {
        select.innerHTML = `<option value="">No pending purchase orders available</option>`;
      }
      return;
    }

    const placeholder = this.selectedSupplier
      ? `-- Select Pending PO for ${this.escapeHtml(this.selectedSupplier.name)} (${unselected.length} available) --`
      : `-- Select Pending Purchase Order to Add (${unselected.length} pending) --`;

    select.innerHTML = `<option value="">${placeholder}</option>` +
      unselected.map(po => {
        const poNum = po.poNumber || po.id;
        const grnPart = po.grnNumber && po.grnNumber !== "GRN-Pending" ? ` | ${po.grnNumber}` : "";
        const bal = Number(po.balanceAmount || 0).toLocaleString();
        return `<option value="${this.escapeHtml(poNum)}">${this.escapeHtml(poNum)}${this.escapeHtml(grnPart)} - ${this.escapeHtml(po.supplierName)} (Bal: Rs. ${bal})</option>`;
      }).join("");
  }

  renderQuickPoChips() {
    const container = document.getElementById("grnPendingPoQuickList");
    if (!container) return;

    if (!this.selectedSupplier) {
      container.style.display = "none";
      container.innerHTML = "";
      return;
    }

    const unselected = this.pendingPOs.filter(po => {
      const poNum = po.poNumber || po.id;
      return !this.selectedPOs.some(sel =>
        String(sel.id).toLowerCase() === String(poNum).toLowerCase() ||
        String(sel.poNumber || "").toLowerCase() === String(poNum).toLowerCase()
      );
    });

    if (unselected.length === 0) {
      container.style.display = "none";
      container.innerHTML = "";
      return;
    }

    container.style.display = "flex";
    container.innerHTML = unselected.map(po => {
      const poNum = po.poNumber || po.id;
      const bal = Number(po.balanceAmount || 0).toLocaleString();
      return `
        <button type="button" class="po-btn po-btn-secondary grn-quick-po-chip" data-po-id="${this.escapeHtml(poNum)}" style="height: 30px; font-size: 11.5px; padding: 0 10px; border-radius: 16px; border: 1px dashed rgba(16,185,129,0.5); background: rgba(16,185,129,0.06); color: var(--text); display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
          <i class="fa-solid fa-plus" style="color: #10b981; font-size: 10px;"></i>
          <strong>${this.escapeHtml(poNum)}</strong>
          <span style="color: #ef4444; font-weight: 700;">Rs. ${bal}</span>
        </button>`;
    }).join("");
  }

  renderSelectedPoTable() {
    const tbody = document.getElementById("grnModalSelectedPoBody");
    const pill = document.getElementById("grnModalPoCountPill");

    const poCount = this.selectedPOs.length;
    if (pill) {
      pill.textContent = `${poCount} Purchase Order${poCount === 1 ? "" : "s"} Selected`;
    }

    if (!tbody) return;

    if (poCount === 0) {
      tbody.innerHTML = `
        <tr class="empty-po-row">
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 22px;">
            <i class="fa-solid fa-circle-info" style="color: #10b981; margin-right: 6px;"></i>
            No purchase orders added to this GRN consignment yet. Select a supplier or choose a pending PO above.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = this.selectedPOs.map(p => {
      const safeAttrId = String(p.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      return `
        <tr>
          <td style="padding: 8px 12px;">
            <strong style="color: #10b981; font-size: 12.5px;">${this.escapeHtml(p.poNumber || p.id)}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">
              ${p.grnNumber ? `<span style="margin-right: 4px;">${this.escapeHtml(p.grnNumber)}</span>` : ""}
              ${p.supplierInvoice ? `<span>| Inv: ${this.escapeHtml(p.supplierInvoice)}</span>` : ""}
            </div>
          </td>
          <td style="padding: 8px 10px; font-size: 12px; color: var(--text);">
            <strong>${this.escapeHtml(p.supplierName)}</strong>
            <div style="font-size: 10.5px; color: var(--text-muted);">${this.escapeHtml(p.stockCategory)}</div>
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 600;">
            Rs. ${p.totalAmount.toLocaleString()}
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: ${p.balanceAmount > 0 ? '#ef4444' : '#10b981'};">
            Rs. ${p.balanceAmount.toLocaleString()}
          </td>
          <td style="padding: 8px 10px; text-align: right;">
            <input type="number" id="grnPoAlloc_${safeAttrId}" name="grn_po_alloc[${safeAttrId}]" aria-label="Payment allocation for ${this.escapeHtml(p.poNumber || p.id)}" class="pay-po-allocation pay-input" data-po-id="${this.escapeHtml(p.id)}" min="0" step="100" value="${p.allocatedAmount}">
          </td>
          <td style="padding: 8px 8px; text-align: center;">
            <button type="button" class="btn-remove-po" data-po-id="${this.escapeHtml(p.id)}" title="Remove purchase order from GRN">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>`;
    }).join("");
  }

  onPoAllocationChanged(poId, val) {
    const po = this.selectedPOs.find(p => String(p.id).toLowerCase() === String(poId).toLowerCase());
    if (!po) return;

    po.allocatedAmount = Math.max(0, val);

    const totalAlloc = this.selectedPOs.reduce((sum, p) => sum + p.allocatedAmount, 0);
    const amountInput = document.getElementById("grnModalAmount");
    if (amountInput) {
      amountInput.value = totalAlloc;
    }

    this.updateStage();
  }

  onTotalAmountChanged() {
    const amountInput = document.getElementById("grnModalAmount");
    let remainingToDistribute = parseFloat(amountInput ? amountInput.value : 0) || 0;

    this.selectedPOs.forEach(po => {
      const needed = po.balanceAmount > 0 ? po.balanceAmount : po.totalAmount;
      if (remainingToDistribute >= needed) {
        po.allocatedAmount = needed;
        remainingToDistribute -= needed;
      } else {
        po.allocatedAmount = remainingToDistribute;
        remainingToDistribute = 0;
      }
    });

    if (remainingToDistribute > 0 && this.selectedPOs.length > 0) {
      this.selectedPOs[0].allocatedAmount += remainingToDistribute;
    }

    this.selectedPOs.forEach(po => {
      const input = document.querySelector(`.pay-po-allocation[data-po-id="${po.id}"]`);
      if (input) input.value = po.allocatedAmount;
    });

    this.updateStage();
  }

  payFullBalance() {
    let totalBal = 0;
    this.selectedPOs.forEach(po => {
      po.allocatedAmount = po.balanceAmount > 0 ? po.balanceAmount : po.totalAmount;
      totalBal += po.allocatedAmount;
    });

    const amountInput = document.getElementById("grnModalAmount");
    if (amountInput) {
      amountInput.value = totalBal;
    }

    this.selectedPOs.forEach(po => {
      const input = document.querySelector(`.pay-po-allocation[data-po-id="${po.id}"]`);
      if (input) input.value = po.allocatedAmount;
    });

    this.updateStage();
  }

  recalculateSummary() {
    const combinedTotal = this.selectedPOs.reduce((sum, p) => sum + p.totalAmount, 0);
    const combinedPaid = this.selectedPOs.reduce((sum, p) => sum + p.paidAmount, 0);
    const combinedDue = this.selectedPOs.reduce((sum, p) => sum + p.balanceAmount, 0);
    const combinedAlloc = this.selectedPOs.reduce((sum, p) => sum + p.allocatedAmount, 0);

    const elTotal = document.getElementById("grnModalBalTotal");
    const elPaid = document.getElementById("grnModalBalPaid");
    const elBal = document.getElementById("grnModalBalRemaining");
    const amountInput = document.getElementById("grnModalAmount");

    if (elTotal) elTotal.textContent = `Rs. ${combinedTotal.toLocaleString()}`;
    if (elPaid) elPaid.textContent = `Rs. ${combinedPaid.toLocaleString()}`;
    if (elBal) elBal.textContent = `Rs. ${combinedDue.toLocaleString()}`;

    if (amountInput) {
      amountInput.value = combinedAlloc > 0 ? combinedAlloc : (combinedDue > 0 ? combinedDue : combinedTotal);
    }

    this.updateStage();
  }

  updateStage() {
    const stageSelect = document.getElementById("grnModalStageSelect");
    if (!stageSelect) return;

    const amountInput = document.getElementById("grnModalAmount");
    const amount = Number(amountInput ? amountInput.value : 0) || 0;
    const combinedDue = this.selectedPOs.reduce((sum, p) => sum + p.balanceAmount, 0);

    if (amount <= 0) {
      stageSelect.value = "Pending Payment";
    } else if (amount >= combinedDue && combinedDue > 0) {
      stageSelect.value = "Complete Payment";
    } else {
      stageSelect.value = "Advance Payment";
    }
  }

  setPaymentType(typeId, methodName = null) {
    this.selectedPaymentTypeId = parseInt(typeId, 10) || 1;

    const typeNames = {
      1: "Cash",
      2: "Bank Transfer",
      3: "Credit Card",
      4: "Debit Card",
      5: "Cheque",
      6: "Online / QR Payment"
    };

    this.selectedMethod = methodName || typeNames[this.selectedPaymentTypeId] || "Cash";

    const hiddenInput = document.getElementById("grnPaymentTypeId");
    if (hiddenInput) {
      hiddenInput.value = String(this.selectedPaymentTypeId);
    }

    document.querySelectorAll("#grnModalMethodSelector .method-choice").forEach(c => {
      const cId = parseInt(c.getAttribute("data-type-id"), 10);
      c.classList.toggle("selected", cId === this.selectedPaymentTypeId);
    });

    this.updateMethodFields();
  }

  updateMethodFields() {
    const container = document.getElementById("grnModalMethodFields");
    if (!container) return;

    if (this.selectedMethod === "Bank Transfer") {
      const matchedSupplier = this.selectedSupplier
        ? (this.suppliers.find(s =>
            (this.selectedSupplier.id && Number(s.id) === Number(this.selectedSupplier.id)) ||
            (this.selectedSupplier.name && String(s.name || "").trim().toLowerCase() === String(this.selectedSupplier.name).trim().toLowerCase())
          ) || this.selectedSupplier)
        : null;
      const bankAccount = matchedSupplier
        ? (matchedSupplier.bank_account || matchedSupplier.bank_details || this.selectedPOs[0]?.supplierBankAccount || "").trim()
        : "";
      const supplierLabel = matchedSupplier ? this.escapeHtml(matchedSupplier.name || "Selected Supplier") : "";

      let displayHtml = "";
      if (!this.selectedSupplier) {
        displayHtml = `
          <div style="font-size: 12.5px; color: var(--text-muted); padding: 10px 12px; border-radius: 8px; background: var(--surface); border: 1px dashed var(--border); display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-info" style="color: #1677ff;"></i>
            <span>Select a supplier above to view their registered bank account.</span>
          </div>`;
      } else if (!bankAccount) {
        displayHtml = `
          <div style="font-size: 12.5px; color: #b45309; padding: 10px 12px; border-radius: 8px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>No bank account registered for <strong>${supplierLabel}</strong>.</span>
          </div>`;
      } else {
        displayHtml = `
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.28);">
            <i class="fa-solid fa-building-columns" style="color: #10b981; font-size: 16px;"></i>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${supplierLabel} — Bank Account</div>
              <div id="grnTransferBank" style="font-size: 13.5px; font-weight: 800; color: var(--text); word-break: break-word;">${this.escapeHtml(bankAccount)}</div>
            </div>
          </div>`;
      }

      container.innerHTML = `
        <div class="pay-field" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px;">
          <div class="pay-label" style="font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-building-columns" style="color: #10b981;"></i>
            <span>Supplier Bank Account Details</span>
          </div>
          ${displayHtml}
        </div>`;
    } else {
      container.innerHTML = "";
    }
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

  async save() {
    if (this.isSubmitting) return;

    if (!this.selectedPOs || this.selectedPOs.length === 0) {
      this.showToast("Please select at least one pending Purchase Order to add to this GRN.", "error");
      return;
    }

    const amountInput = document.getElementById("grnModalAmount");
    const amount = parseFloat(amountInput ? amountInput.value : 0);

    if (isNaN(amount) || amount <= 0) {
      this.showToast("Please enter a valid disbursement amount greater than Rs. 0.", "error");
      return;
    }

    const stage = document.getElementById("grnModalStageSelect")?.value || "Advance Payment";
    const payDate = document.getElementById("grnModalDate")?.value || new Date().toISOString().split("T")[0];
    const notes = document.getElementById("grnModalNotes")?.value.trim() || "";
    const disbursedBy = document.getElementById("grnModalProcurementOfficer")?.value || "Procurement Manager";

    const methodDetails = {};
    if (this.selectedMethod === "Bank Transfer") {
      methodDetails.bank = this.selectedSupplier
        ? (this.selectedSupplier.bank_account || this.selectedSupplier.bank_details || "")
        : "";
    }

    this.isSubmitting = true;
    const confirmBtn = document.getElementById("btnConfirmSaveGrnPayment");
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Settlement...`;
    }

    try {
      const builder = new GrnPaymentBuilder();
      builder.setPurchaseOrders(this.selectedPOs)
             .setAmount(amount)
             .setStage(stage)
             .setMethod(this.selectedMethod, methodDetails, this.selectedPaymentTypeId)
             .setDate(payDate)
             .setNotes(notes)
             .setDisbursedBy(disbursedBy);

      const grnPaymentData = builder.build();
      const result = await this.processor.process(grnPaymentData);

      if (result.success) {
        this.closeModal("modalRecordGrnPayment");
        this.clearSelectedSupplier();
        if (this.ctx.render) {
          this.ctx.render();
        }
      }
    } catch (err) {
      console.error("[RecordGrnPaymentModal] Error saving GRN payment:", err);
      this.showToast("An error occurred while saving GRN payment.", "error");
    } finally {
      this.isSubmitting = false;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save GRN Payment &amp; Generate Voucher`;
      }
    }
  }
}
