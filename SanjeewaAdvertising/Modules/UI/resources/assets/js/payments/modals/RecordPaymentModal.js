/**
 * SanjeewaAdvertising - Record Payment Modal
 *
 * Handles recording new payments (Customer Invoice Jobs or Supplier GRN Bills),
 * reference linking, payment methods dynamic inputs, and financial updates.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class RecordPaymentModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getOrderPayments
   * @param {Function} context.getGrnRecords
   * @param {Function} context.getGrnPayments
   * @param {Function} context.saveOrderPayments
   * @param {Function} context.saveGrnPayments
   * @param {Function} context.saveOrders
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
    this.modalType = "invoice"; // "invoice" or "grn"
    this.selectedMethod = "Cash";

    this.bindEvents();
  }

  bindEvents() {
    // Open Record Payment Modal Button triggers
    document.addEventListener("click", (e) => {
      const openModalBtn = e.target.closest("#btnOpenRecordPayment, [data-open-pay-modal]");
      if (openModalBtn) {
        e.preventDefault();
        const prefillType = openModalBtn.getAttribute("data-pay-type") || "invoice";
        const prefillId = openModalBtn.getAttribute("data-pay-ref");
        this.openRecordPaymentModal(prefillType, prefillId);
      }

      // Method selector inside modal
      const methodChoice = e.target.closest(".method-choice");
      if (methodChoice) {
        e.preventDefault();
        document.querySelectorAll(".method-choice").forEach(c => c.classList.remove("selected"));
        methodChoice.classList.add("selected");
        this.selectedMethod = methodChoice.getAttribute("data-method");
        this.updateMethodFields();
      }
    });

    // Modal Type Radio Toggle (Invoice vs GRN)
    const typeRadios = document.querySelectorAll('input[name="modalPayType"]');
    typeRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.modalType = e.target.value;
        this.updateModalReferenceDropdown();
      });
    });

    // Reference Select Change (Calculate balance)
    const refSelect = document.getElementById("modalPayRefSelect");
    if (refSelect) {
      refSelect.addEventListener("change", () => this.onReferenceSelected());
    }

    // Amount Input (Auto calculate status)
    const amountInput = document.getElementById("modalPayAmount");
    if (amountInput) {
      amountInput.addEventListener("input", () => this.onAmountChanged());
    }

    // Save Payment Form Submit
    const savePaymentBtn = document.getElementById("btnSaveNewPayment");
    if (savePaymentBtn) {
      savePaymentBtn.addEventListener("click", () => this.savePayment());
    }
  }

  openRecordPaymentModal(prefillType = "invoice", prefillId = null) {
    this.modalType = (prefillType === "grn" || prefillType === "grn-payment") ? "grn" : "invoice";

    const radInvoice = document.getElementById("modalRadioInvoice");
    const radGrn = document.getElementById("modalRadioGrn");
    if (radInvoice) radInvoice.checked = (this.modalType === "invoice");
    if (radGrn) radGrn.checked = (this.modalType === "grn");

    document.querySelectorAll(".pay-type-option").forEach(opt => {
      const isInvoice = opt.classList.contains("invoice-option");
      opt.classList.toggle("selected", (this.modalType === "invoice" && isInvoice) || (this.modalType === "grn" && !isInvoice));
    });

    this.updateModalReferenceDropdown(prefillId);

    this.selectedMethod = "Cash";
    document.querySelectorAll(".method-choice").forEach(c => {
      c.classList.toggle("selected", c.getAttribute("data-method") === "Cash");
    });
    this.updateMethodFields();

    const dateInput = document.getElementById("modalPayDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("modalPayNotes");
    if (noteInput) noteInput.value = "";

    this.openModal("recordPaymentModal");
  }

  updateModalReferenceDropdown(prefillId = null) {
    const select = document.getElementById("modalPayRefSelect");
    const label = document.getElementById("modalPayRefLabel");
    if (!select) return;

    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const orderPayments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];
    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];

    if (this.modalType === "invoice") {
      if (label) label.textContent = "Select Customer Job / Invoice";
      let options = `<option value="">-- Choose Job / Invoice --</option>`;
      orders.forEach(o => {
        const bal = (Number(o.balanceAmount) || 0);
        options += `<option value="${o.id}" data-total="${o.totalAmount}" data-paid="${o.paidAmount}" data-balance="${bal}" data-party="${o.customerName}" ${prefillId === o.id ? 'selected' : ''}>
          ${o.id} - ${o.customerName} (Bal: Rs. ${bal.toLocaleString()})
        </option>`;
      });
      orderPayments.forEach(p => {
        if (!orders.some(o => o.id === p.orderId)) {
          options += `<option value="${p.orderId}" data-total="${p.totalBill}" data-paid="${p.amount}" data-balance="${p.balance}" data-party="${p.customerName}" ${prefillId === p.orderId ? 'selected' : ''}>
            ${p.orderId} - ${p.customerName} (Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()})
          </option>`;
        }
      });
      select.innerHTML = options;
    } else {
      if (label) label.textContent = "Select Supplier GRN / Stock Acquisition";
      let options = `<option value="">-- Choose GRN Stock Bill --</option>`;
      grnRecords.forEach(g => {
        const matchingPay = grnPayments.find(p => p.grnId === g.grn_id);
        const total = g.net_total || g.sub_total || 50000;
        const paid = matchingPay ? matchingPay.amount : 0;
        const bal = matchingPay ? matchingPay.balance : total;
        options += `<option value="${g.grn_id}" data-total="${total}" data-paid="${paid}" data-balance="${bal}" data-party="${g.supplier_name}" ${prefillId === g.grn_id ? 'selected' : ''}>
          ${g.grn_id} - ${g.supplier_name} (Bal: Rs. ${(Number(bal) || 0).toLocaleString()})
        </option>`;
      });
      grnPayments.forEach(p => {
        if (!grnRecords.some(g => g.grn_id === p.grnId)) {
          options += `<option value="${p.grnId}" data-total="${p.totalBill}" data-paid="${p.amount}" data-balance="${p.balance}" data-party="${p.supplierName}" ${prefillId === p.grnId ? 'selected' : ''}>
            ${p.grnId} - ${p.supplierName} (Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()})
          </option>`;
        }
      });
      select.innerHTML = options;
    }

    this.onReferenceSelected();
  }

  onReferenceSelected() {
    const select = document.getElementById("modalPayRefSelect");
    const opt = select?.selectedOptions[0];
    const totalBox = document.getElementById("modalTotalAmount");
    const balBox = document.getElementById("modalCurrentBalance");
    const amtInput = document.getElementById("modalPayAmount");

    if (opt && opt.value) {
      const total = Number(opt.getAttribute("data-total")) || 0;
      const bal = Number(opt.getAttribute("data-balance")) || 0;
      if (totalBox) totalBox.textContent = `Rs. ${total.toLocaleString()}`;
      if (balBox) balBox.textContent = `Rs. ${bal.toLocaleString()}`;
      if (amtInput) amtInput.value = bal > 0 ? bal : "";
    } else {
      if (totalBox) totalBox.textContent = "Rs. 0.00";
      if (balBox) balBox.textContent = "Rs. 0.00";
      if (amtInput) amtInput.value = "";
    }
    this.onAmountChanged();
  }

  onAmountChanged() {
    const select = document.getElementById("modalPayRefSelect");
    const opt = select?.selectedOptions[0];
    const amtInput = document.getElementById("modalPayAmount");
    const statusSelect = document.getElementById("modalPayStatus");

    if (!opt || !opt.value || !amtInput || !statusSelect) return;

    const curBal = Number(opt.getAttribute("data-balance")) || 0;
    const enteringAmt = Number(amtInput.value) || 0;

    if (enteringAmt <= 0) {
      statusSelect.value = "Pending";
    } else if (enteringAmt >= curBal) {
      statusSelect.value = "Complete";
    } else {
      statusSelect.value = "Advance";
    }
  }

  updateMethodFields() {
    const wrap = document.getElementById("methodDynamicFields");
    if (!wrap) return;

    if (this.selectedMethod === "Card") {
      wrap.innerHTML = `
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label" style="font-size: 11.5px; font-weight: 600;">Card Type</label>
            <select class="form-select form-select-sm" id="modalCardType">
              <option value="Visa">Visa</option>
              <option value="MasterCard">MasterCard</option>
              <option value="Amex">American Express</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label" style="font-size: 11.5px; font-weight: 600;">Last 4 Digits & Auth Code</label>
            <input type="text" class="form-control form-control-sm" id="modalCardRef" placeholder="e.g. 4242 / TXN-8931" />
          </div>
        </div>
      `;
    } else if (this.selectedMethod === "Check") {
      wrap.innerHTML = `
        <div class="row g-2">
          <div class="col-md-4">
            <label class="form-label" style="font-size: 11.5px; font-weight: 600;">Check Number</label>
            <input type="text" class="form-control form-control-sm" id="modalCheckNo" placeholder="e.g. CHQ-783921" />
          </div>
          <div class="col-md-4">
            <label class="form-label" style="font-size: 11.5px; font-weight: 600;">Bank & Branch</label>
            <input type="text" class="form-control form-control-sm" id="modalCheckBank" placeholder="e.g. Sampath - Kandy" />
          </div>
          <div class="col-md-4">
            <label class="form-label" style="font-size: 11.5px; font-weight: 600;">Realization Date</label>
            <input type="date" class="form-control form-control-sm" id="modalCheckDate" />
          </div>
        </div>
      `;
    } else if (this.selectedMethod === "Bank Transfer") {
      wrap.innerHTML = `
        <div class="row g-2">
          <div class="col-md-6">
            <label class="form-label" style="font-size: 11.5px; font-weight: 600;">Receiving Bank Account</label>
            <select class="form-select form-select-sm" id="modalBankName">
              <option value="BOC 8291039">Bank of Ceylon - Acc: 8291039</option>
              <option value="Commercial 1092837">Commercial Bank - Acc: 1092837</option>
              <option value="HNB 7629102">HNB - Acc: 7629102</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label" style="font-size: 11.5px; font-weight: 600;">Bank Reference / Slip No</label>
            <input type="text" class="form-control form-control-sm" id="modalBankRef" placeholder="e.g. SLIP-990234" />
          </div>
        </div>
      `;
    } else {
      wrap.innerHTML = `
        <div class="form-text" style="font-size: 11.5px;">Cash payment directly received at counter cash register drawer.</div>
      `;
    }
  }

  savePayment() {
    const select = document.getElementById("modalPayRefSelect");
    const opt = select?.selectedOptions[0];
    const amtInput = document.getElementById("modalPayAmount");
    const dateInput = document.getElementById("modalPayDate");
    const statusSelect = document.getElementById("modalPayStatus");
    const noteInput = document.getElementById("modalPayNotes");

    if (!opt || !opt.value) {
      this.showToast("Please choose an Invoice / Job or GRN bill to settle.");
      return;
    }

    const refId = opt.value;
    const partyName = opt.getAttribute("data-party") || "Customer / Supplier";
    const totalBill = Number(opt.getAttribute("data-total")) || 0;
    const curPaid = Number(opt.getAttribute("data-paid")) || 0;
    const curBal = Number(opt.getAttribute("data-balance")) || 0;
    const amountPaidNow = Number(amtInput?.value) || 0;
    const date = dateInput?.value || new Date().toISOString().split("T")[0];
    const status = statusSelect?.value || "Complete";
    const notes = noteInput?.value?.trim() || "";

    if (amountPaidNow <= 0) {
      this.showToast("Please enter a valid positive payment amount.");
      return;
    }

    let methodRef = "";
    if (this.selectedMethod === "Card") {
      const type = document.getElementById("modalCardType")?.value || "Card";
      const cardRef = document.getElementById("modalCardRef")?.value || "";
      methodRef = `${type} ${cardRef}`.trim();
    } else if (this.selectedMethod === "Check") {
      const chq = document.getElementById("modalCheckNo")?.value || "";
      const bank = document.getElementById("modalCheckBank")?.value || "";
      methodRef = `${chq} (${bank})`.trim();
    } else if (this.selectedMethod === "Bank Transfer") {
      const bName = document.getElementById("modalBankName")?.value || "Bank";
      const bRef = document.getElementById("modalBankRef")?.value || "";
      methodRef = `${bName} / ${bRef}`.trim();
    } else {
      methodRef = "Drawer 01";
    }

    const newBalance = Math.max(0, curBal - amountPaidNow);

    if (this.modalType === "invoice") {
      const orderPayments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];
      const newPayId = `PAY-2026-${String(orderPayments.length + 101).padStart(4, "0")}`;
      const newRecord = {
        paymentId: newPayId,
        orderId: refId,
        customerName: partyName,
        date: date,
        totalBill: totalBill,
        amount: amountPaidNow,
        balance: newBalance,
        method: this.selectedMethod,
        ref: methodRef,
        status: status,
        receivedBy: "Admin User",
        notes: notes
      };
      orderPayments.unshift(newRecord);
      if (this.ctx.saveOrderPayments) this.ctx.saveOrderPayments();

      const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
      const matchedOrder = orders.find(o => o.id === refId);
      if (matchedOrder) {
        matchedOrder.paidAmount = (Number(matchedOrder.paidAmount) || 0) + amountPaidNow;
        matchedOrder.balanceAmount = Math.max(0, (Number(matchedOrder.totalAmount) || 0) - matchedOrder.paidAmount);
        matchedOrder.paymentStatus = (matchedOrder.balanceAmount <= 0) ? "Paid" : "Partially Paid";
        if (this.ctx.saveOrders) this.ctx.saveOrders(orders);
      }

      this.closeModal("recordPaymentModal");
      if (this.ctx.render) this.ctx.render();
      this.showToast(`Payment ${newPayId} for ${refId} recorded successfully!`);
      if (this.ctx.openReceiptModal) this.ctx.openReceiptModal(newPayId, "invoice");
    } else {
      const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];
      const newPayId = `GRNP-2026-${String(grnPayments.length + 101).padStart(4, "0")}`;
      const newRecord = {
        paymentId: newPayId,
        grnId: refId,
        supplierName: partyName,
        date: date,
        totalBill: totalBill,
        amount: amountPaidNow,
        balance: newBalance,
        method: this.selectedMethod,
        ref: methodRef,
        status: status,
        paidBy: "Admin User",
        notes: notes
      };
      grnPayments.unshift(newRecord);
      if (this.ctx.saveGrnPayments) this.ctx.saveGrnPayments();

      this.closeModal("recordPaymentModal");
      if (this.ctx.render) this.ctx.render();
      this.showToast(`Supplier payment ${newPayId} for GRN ${refId} recorded successfully!`);
      if (this.ctx.openReceiptModal) this.ctx.openReceiptModal(newPayId, "grn");
    }
  }
}

