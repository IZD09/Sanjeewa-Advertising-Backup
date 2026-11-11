/**
 * SanjeewaAdvertising - Record GRN Payment Modal
 *
 * Handles recording Stock Material & Multi-Purchase Order Disbursements (#modalRecordGrnPayment).
 * Allows adding multiple purchase orders to a single GRN consignment by selecting from the list
 * OR typing the PO # directly (with keyboard Enter / barcode scanner support),
 * allocating payment amounts, and generating an itemized voucher for all included purchase orders.
 *
 * Supports Cash / Petty Cash, Corporate Card, Company Cheque, Bank Transfer, and Online / QR.
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
    this.selectedMethod = "Cash";
    this.selectedPOs = [];

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers
    document.addEventListener("click", (e) => {
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
        document.querySelectorAll("#grnModalMethodSelector .method-choice").forEach(c => c.classList.remove("selected"));
        methodChoice.classList.add("selected");
        this.selectedMethod = methodChoice.getAttribute("data-method") || "Cash";
        this.updateMethodFields();
      }
    });

    // PO Selector dropdown - automatically add PO when selected
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

    // Confirm Save
    const confirmBtn = document.getElementById("btnConfirmSaveGrnPayment");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.save());
    }
  }

  async openRecordGrnPaymentModal(prefillGrnId = null) {
    const modal = document.getElementById("modalRecordGrnPayment");
    if (!modal) return;

    this.selectedMethod = "Cash";
    document.querySelectorAll("#grnModalMethodSelector .method-choice").forEach(c => {
      c.classList.toggle("selected", c.getAttribute("data-method") === "Cash");
    });
    this.updateMethodFields();

    this.selectedPOs = [];

    // Ensure live purchase orders and GRN consignments from database are loaded
    let grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    if (grnRecords.length === 0) {
      try {
        const res = await this.http.get("/api/v1/grn-payments/available-pos");
        const data = res?.data || res;
        const livePos = Array.isArray(data) ? data : (data?.pos || []);
        if (Array.isArray(livePos) && livePos.length > 0) {
          grnRecords = livePos.map(g => ({
            id: g.id,
            poNumber: g.poNumber || g.id,
            grn_id: g.grn_id || g.id,
            grnNumber: g.grnNumber || `GRN-${g.id}`,
            supplier_id: g.supplier_id || "SUP-001",
            supplier_name: g.supplierName || "Supplier",
            supplierName: g.supplierName || "Supplier",
            stock_category: g.stockCategory || "Stock Consignment",
            stockCategory: g.stockCategory || "Stock Consignment",
            net_total: Number(g.totalAmount || g.totalBill || 0),
            totalAmount: Number(g.totalAmount || g.totalBill || 0),
            totalBill: Number(g.totalAmount || g.totalBill || 0),
            paid_amount: Number(g.paidAmount || 0),
            paidAmount: Number(g.paidAmount || 0),
            balance: Number(g.balanceAmount !== undefined ? g.balanceAmount : g.balance) || 0,
            balanceAmount: Number(g.balanceAmount !== undefined ? g.balanceAmount : g.balance) || 0,
            status: (Number(g.balanceAmount !== undefined ? g.balanceAmount : g.balance) || 0) <= 0 ? "Completed" : "Pending",
            received_date: g.received_date || new Date().toISOString().split("T")[0]
          }));
          localStorage.setItem("sa_advertising_grn_records", JSON.stringify(grnRecords));
        }
      } catch (err) {
        console.warn("[RecordGrnPaymentModal] Could not fetch live purchase orders:", err);
      }
    }

    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];

    // If prefillGrnId passed, find and pre-add that GRN / PO
    if (prefillGrnId) {
      const foundGrn = grnRecords.find(g => (g.grnNumber || g.grn_number || g.id) === prefillGrnId || (g.poNumber || g.purchase_order_no) === prefillGrnId);
      if (foundGrn) {
        this.addPoObject(foundGrn);
      } else {
        const foundPay = grnPayments.find(p => (p.grnNumber || p.grn_number || p.grnId) === prefillGrnId || (p.poNumber || p.po_number) === prefillGrnId);
        if (foundPay) {
          this.addPoObject({
            id: foundPay.poNumber || foundPay.grnNumber || prefillGrnId,
            grnNumber: foundPay.grnNumber || prefillGrnId,
            poNumber: foundPay.poNumber || `PO-${prefillGrnId}`,
            supplierName: foundPay.supplierName || "Supplier",
            supplierInvoice: foundPay.supplier_invoice || foundPay.supplierInvoice || "",
            stockCategory: foundPay.stockCategory || "Stock Delivery",
            totalBill: foundPay.totalBill,
            amount: foundPay.amount,
            balance: foundPay.balance
          });
        }
      }
    }
    // No default prefill row when prefillGrnId is not passed, start with empty selection

    this.updateDropdown();
    this.renderSelectedPoTable();
    this.recalculateSummary();

    const dateInput = document.getElementById("grnModalDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("grnModalNotes");
    if (noteInput) noteInput.value = "";

    const refSelect = document.getElementById("grnModalRefSelect");
    if (refSelect) {
      refSelect.value = "";
    }

    this.openModal("modalRecordGrnPayment");
  }

  addPoObject(grnOrPo) {
    const id = grnOrPo.poNumber || grnOrPo.purchase_order_no || grnOrPo.po_number || grnOrPo.grnNumber || grnOrPo.grn_number || (grnOrPo.id ? `PO-0${grnOrPo.id}` : "PO-0101");
    if (!id || id === "-") return;
    if (this.selectedPOs.some(p => p.id === id)) return;

    const tot = Number(grnOrPo.totalAmount !== undefined ? grnOrPo.totalAmount : (grnOrPo.totalBill !== undefined ? grnOrPo.totalBill : (grnOrPo.net_total !== undefined ? grnOrPo.net_total : 0))) || 0;
    const paid = Number(grnOrPo.paidAmount !== undefined ? grnOrPo.paidAmount : (grnOrPo.amount !== undefined ? grnOrPo.amount : (grnOrPo.paid_amount !== undefined ? grnOrPo.paid_amount : 0))) || 0;
    const bal = Number(grnOrPo.balanceAmount !== undefined ? grnOrPo.balanceAmount : (grnOrPo.balance !== undefined ? grnOrPo.balance : (grnOrPo.balance_amount !== undefined ? grnOrPo.balance_amount : Math.max(0, tot - paid)))) || 0;

    const grnNum = grnOrPo.grnNumber || grnOrPo.grn_number || (grnOrPo.grn_id ? `GRN-0${grnOrPo.grn_id}` : `GRN-${id.replace("PO-", "")}`);
    const poNum = (grnOrPo.poNumber && grnOrPo.poNumber !== "-") ? grnOrPo.poNumber : (grnOrPo.purchase_order_no && grnOrPo.purchase_order_no !== "-" ? grnOrPo.purchase_order_no : id);
    const suppInv = grnOrPo.supplierInvoice || grnOrPo.supplier_invoice || grnOrPo.supplyer_invoice || grnOrPo.supplier_invoice_no || "";

    this.selectedPOs.push({
      id: id,
      grnNumber: grnNum,
      poNumber: poNum,
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

    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];

    // 1. Exact match on PO or GRN number
    let match = grnRecords.find(g =>
      String(g.poNumber ?? g.purchase_order_no ?? g.po_number ?? "").toLowerCase() === clean ||
      String(g.grnNumber ?? g.grn_number ?? g.id ?? "").toLowerCase() === clean
    );
    if (match) return match;

    // 2. Suffix match on ID (e.g. "0101" matches "PO-0101" or "GRN-0101")
    match = grnRecords.find(g =>
      String(g.poNumber ?? g.purchase_order_no ?? g.po_number ?? "").toLowerCase().endsWith(clean) ||
      String(g.grnNumber ?? g.grn_number ?? "").toLowerCase().endsWith(clean) ||
      String(g.id ?? "").toLowerCase() === clean
    );
    if (match) return match;

    // 3. Substring match on supplier name or invoice
    match = grnRecords.find(g =>
      String(g.supplierName ?? g.supplier_name ?? "").toLowerCase().includes(clean) ||
      String(g.supplier_invoice_no ?? g.supplierInvoice ?? g.supplier_invoice ?? "").toLowerCase().includes(clean)
    );
    if (match) return match;

    // 4. Fallback in GRN payments history
    let payMatch = grnPayments.find(p =>
      String(p.poNumber ?? p.po_number ?? "").toLowerCase() === clean ||
      String(p.grnNumber ?? p.grn_number ?? p.grnId ?? "").toLowerCase() === clean ||
      String(p.poNumber ?? p.po_number ?? "").toLowerCase().endsWith(clean) ||
      String(p.supplierName ?? p.supplier_name ?? "").toLowerCase().includes(clean)
    );

    if (payMatch) {
      return {
        id: payMatch.poNumber || payMatch.grnNumber,
        grnNumber: payMatch.grnNumber,
        poNumber: payMatch.poNumber,
        supplierName: payMatch.supplierName,
        stockCategory: payMatch.stockCategory || "Stock Delivery",
        totalBill: payMatch.totalBill,
        amount: payMatch.amount,
        balance: payMatch.balance,
        supplierInvoice: payMatch.supplierInvoice || payMatch.supplier_invoice || ""
      };
    }

    return null;
  }

  addPoById(poId) {
    if (!poId) return;
    const found = this.findPoByIdOrQuery(poId);
    if (!found) return;

    const cleanId = found.id || found.poNumber || found.grnNumber;
    if (this.selectedPOs.some(p =>
      String(p.id).toLowerCase() === String(cleanId).toLowerCase() ||
      String(p.poNumber || "").toLowerCase() === String(cleanId).toLowerCase()
    )) {
      this.showToast(`Purchase Order ${cleanId} is already included in this GRN.`, "info");
      const select = document.getElementById("grnModalRefSelect");
      if (select) select.value = "";
      return;
    }

    this.addPoObject(found);

    const select = document.getElementById("grnModalRefSelect");
    if (select) select.value = "";

    this.updateDropdown();
    this.renderSelectedPoTable();
    this.recalculateSummary();
    this.showToast(`Purchase Order ${found.poNumber || found.id} added to GRN!`);
  }

  removePo(poId) {
    this.selectedPOs = this.selectedPOs.filter(p =>
      String(p.id).toLowerCase() !== String(poId).toLowerCase() &&
      String(p.poNumber || "").toLowerCase() !== String(poId).toLowerCase()
    );
    this.updateDropdown();
    this.renderSelectedPoTable();
    this.recalculateSummary();
    this.showToast(`Purchase Order ${poId} removed from GRN.`, "info");
  }

  updateDropdown() {
    const select = document.getElementById("grnModalRefSelect");
    if (!select) return;

    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];

    const availableItems = [];

    grnRecords.forEach(g => {
      const poNum = (g.poNumber && g.poNumber !== "-") ? g.poNumber : (g.purchase_order_no && g.purchase_order_no !== "-" ? g.purchase_order_no : (g.id ? `PO-0${g.id}` : "PO-0101"));
      const grnNum = g.grnNumber || g.grn_number || (g.id ? `GRN-0${g.id}` : "GRN-0101");
      const supplier = g.supplierName || g.supplier_name || "Supplier";
      const bal = Number(g.balance ?? g.balance_amount ?? 0);
      const inv = g.supplier_invoice_no || g.supplierInvoice || "";

      const isSelected = this.selectedPOs.some(p =>
        String(p.id).toLowerCase() === String(poNum).toLowerCase() ||
        String(p.poNumber || "").toLowerCase() === String(poNum).toLowerCase() ||
        String(p.grnNumber || "").toLowerCase() === String(grnNum).toLowerCase()
      );

      if (!isSelected && !availableItems.some(i => i.id === poNum)) {
        availableItems.push({
          id: poNum,
          label: `${poNum} | ${grnNum} - ${supplier} ${inv ? `[Inv: ${inv}]` : ""} (Bal: Rs. ${bal.toLocaleString()})`
        });
      }
    });

    grnPayments.forEach(p => {
      const poNum = p.poNumber || p.po_number || `PO-${p.grnNumber || "0101"}`;
      const isSelected = this.selectedPOs.some(selected =>
        String(selected.id).toLowerCase() === String(poNum).toLowerCase() ||
        String(selected.poNumber || "").toLowerCase() === String(poNum).toLowerCase()
      );

      if (!isSelected && !availableItems.some(i => i.id === poNum)) {
        availableItems.push({
          id: poNum,
          label: `${poNum} | ${p.grnNumber || "GRN"} - ${p.supplierName} (Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()})`
        });
      }
    });

    select.innerHTML = `<option value="">-- Select Purchase Order / Consignment to Add --</option>` +
      availableItems.map(item => `<option value="${item.id}">${item.label}</option>`).join("");
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
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">
            <i class="fa-solid fa-circle-info" style="color: #10b981; margin-right: 6px;"></i>
            No purchase orders added to this GRN consignment yet. Select a purchase order from the dropdown above.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = this.selectedPOs.map(p => {
      return `
        <tr>
          <td style="padding: 8px 12px;">
            <strong style="color: #10b981; font-size: 12.5px;">${p.poNumber || p.id}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">
              ${p.grnNumber ? `<span style="margin-right: 4px;">${p.grnNumber}</span>` : ""}
              ${p.supplierInvoice ? `<span style="color: var(--text-muted);">| Inv: ${p.supplierInvoice}</span>` : ""}
            </div>
          </td>
          <td style="padding: 8px 10px; font-size: 12px; color: var(--text);">
            <strong>${p.supplierName}</strong>
            <div style="font-size: 10.5px; color: var(--text-muted);">${p.stockCategory}</div>
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 600;">
            Rs. ${p.totalAmount.toLocaleString()}
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: ${p.balanceAmount > 0 ? '#ef4444' : '#10b981'};">
            Rs. ${p.balanceAmount.toLocaleString()}
          </td>
          <td style="padding: 8px 10px; text-align: right;">
            <input type="number" class="pay-po-allocation pay-input" data-po-id="${p.id}" min="0" step="100" value="${p.allocatedAmount}">
          </td>
          <td style="padding: 8px 8px; text-align: center;">
            <button type="button" class="btn-remove-po" data-po-id="${p.id}" title="Remove purchase order from GRN">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>`;
    }).join("");
  }

  onPoAllocationChanged(poId, val) {
    const po = this.selectedPOs.find(p => p.id === poId);
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

  updateMethodFields() {
    const container = document.getElementById("grnModalMethodFields");
    if (!container) return;

    if (this.selectedMethod === "Card") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Company Credit/Debit Card</label>
            <input type="text" id="grnCardType" class="pay-input" placeholder="Commercial Bank VISA Corporate">
          </div>
          <div class="pay-field">
            <label class="pay-label">Card Last 4 Digits</label>
            <input type="text" id="grnCardLast4" class="pay-input" placeholder="E.g. 8832" maxlength="4">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Approval Code / Terminal Ref</label>
          <input type="text" id="grnCardAuth" class="pay-input" placeholder="Authorization code">
        </div>`;
    } else if (this.selectedMethod === "Check") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cheque Number *</label>
            <input type="text" id="grnCheckNo" class="pay-input" placeholder="E.g. 992011" required>
          </div>
          <div class="pay-field">
            <label class="pay-label">Issuing Bank & Account</label>
            <input type="text" id="grnCheckBank" class="pay-input" placeholder="BOC A/C 772189 / Commercial">
          </div>
        </div>
        <div class="pay-form-grid" style="margin-top: 10px;">
          <div class="pay-field">
            <label class="pay-label">Cheque Date</label>
            <input type="date" id="grnCheckDate" class="pay-input" value="${new Date().toISOString().split("T")[0]}">
          </div>
          <div class="pay-field">
            <label class="pay-label">Cheque Type</label>
            <select id="grnCheckType" class="pay-select-field">
              <option value="Account Payee Crossed">Account Payee Crossed</option>
              <option value="Cash Cheque">Cash Cheque</option>
            </select>
          </div>
        </div>`;
    } else if (this.selectedMethod === "Bank Transfer") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Supplier Bank Name</label>
            <input type="text" id="grnTransferBank" class="pay-input" placeholder="Sampath / HNB / Commercial">
          </div>
          <div class="pay-field">
            <label class="pay-label">Corporate Online Ref *</label>
            <input type="text" id="grnTransferRef" class="pay-input" placeholder="FT Reference #">
          </div>
        </div>`;
    } else if (this.selectedMethod === "Online / QR") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Corporate QR App / Bank</label>
            <input type="text" id="grnQrBank" class="pay-input" placeholder="BOC SmartPay / Commercial Q+">
          </div>
          <div class="pay-field">
            <label class="pay-label">Transaction Reference # *</label>
            <input type="text" id="grnQrRef" class="pay-input" placeholder="TXN-QR-00982">
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Petty Cash Voucher #</label>
            <input type="text" id="grnCashReceipt" class="pay-input" value="PETTY-${Math.floor(100 + Math.random() * 900)}">
          </div>
          <div class="pay-field">
            <label class="pay-label">Disbursed From</label>
            <input type="text" class="pay-input" value="Main Shop Petty Cash" readonly style="opacity: 0.85;">
          </div>
        </div>`;
    }
  }

  async save() {
    const amountInput = document.getElementById("grnModalAmount");
    const amount = parseFloat(amountInput ? amountInput.value : 0);
    const stage = document.getElementById("grnModalStageSelect")?.value || "Advance Payment";
    const payDate = document.getElementById("grnModalDate")?.value || new Date().toISOString().split("T")[0];
    const notes = document.getElementById("grnModalNotes")?.value.trim() || "";

    const methodDetails = {};
    if (this.selectedMethod === "Card") {
      methodDetails.last4 = document.getElementById("grnCardLast4")?.value || "";
      methodDetails.auth = document.getElementById("grnCardAuth")?.value || "";
    } else if (this.selectedMethod === "Check") {
      methodDetails.chequeNo = document.getElementById("grnCheckNo")?.value || "";
      methodDetails.bank = document.getElementById("grnCheckBank")?.value || "";
    } else if (this.selectedMethod === "Bank Transfer") {
      methodDetails.ref = document.getElementById("grnTransferRef")?.value || "";
      methodDetails.bank = document.getElementById("grnTransferBank")?.value || "";
    } else if (this.selectedMethod === "Online / QR") {
      methodDetails.app = document.getElementById("grnQrBank")?.value || "LankaQR";
      methodDetails.ref = document.getElementById("grnQrRef")?.value || "";
    } else {
      methodDetails.receipt = document.getElementById("grnCashReceipt")?.value || "";
    }

    const builder = new GrnPaymentBuilder();
    builder.setPurchaseOrders(this.selectedPOs)
           .setAmount(amount)
           .setStage(stage)
           .setMethod(this.selectedMethod, methodDetails)
           .setDate(payDate)
           .setNotes(notes);

    const grnPaymentData = builder.build();
    const result = await this.processor.process(grnPaymentData);

    if (result.success) {
      this.closeModal("modalRecordGrnPayment");
      this.selectedPOs = [];
      this.renderSelectedPoTable();
      this.recalculateSummary();
    }
  }
}
