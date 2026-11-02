/**
 * SanjeewaAdvertising - Payment Modal Handler
 * Controls the Record New Payment modal dialog, dynamic reference selectors,
 * method-specific input fields, live balance calculations, and payment persistence.
 */

"use strict";

export class PaymentModalHandler {
  /**
   * @param {Object} options
   * @param {import('./PaymentDataLoad.js').PaymentDataLoad} options.dataLoader
   * @param {Function} options.getOrders
   * @param {Function} options.getOrderPayments
   * @param {Function} options.getGrnRecords
   * @param {Function} options.getGrnPayments
   * @param {Function} options.onPaymentSaved
   * @param {Function} options.showToast
   * @param {Function} options.openReceiptModal
   * @param {Function} options.closeModals
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.getOrders = options.getOrders || (() => []);
    this.getOrderPayments = options.getOrderPayments || (() => []);
    this.getGrnRecords = options.getGrnRecords || (() => []);
    this.getGrnPayments = options.getGrnPayments || (() => []);
    this.onPaymentSaved = options.onPaymentSaved || (() => {});
    this.showToast = options.showToast || (() => {});
    this.openReceiptModal = options.openReceiptModal || (() => {});
    this.closeModals = options.closeModals || (() => {});

    this.modalType = "invoice"; // "invoice" or "grn"
    this.selectedMethod = "Cash";

    this.bindEvents();
  }

  /**
   * Bind event listeners for modal interactions.
   */
  bindEvents() {
    // Modal Type Radio Toggle (Invoice vs GRN)
    const typeRadios = document.querySelectorAll('input[name="modalPayType"]');
    typeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.modalType = e.target.value;
        document.querySelectorAll(".pay-type-option").forEach((opt) => {
          const isInvoice = opt.classList.contains("invoice-option");
          opt.classList.toggle(
            "selected",
            (this.modalType === "invoice" && isInvoice) || (this.modalType === "grn" && !isInvoice)
          );
        });
        this.updateModalReferenceDropdown();
      });
    });

    // Reference Select Change (Calculate balance)
    const refSelect = document.getElementById("modalPayRefSelect");
    if (refSelect) {
      refSelect.addEventListener("change", () => {
        this.onReferenceSelected();
      });
    }

    // Amount Input (Auto calculate status)
    const amountInput = document.getElementById("modalPayAmount");
    if (amountInput) {
      amountInput.addEventListener("input", () => {
        this.onAmountChanged();
      });
    }

    // Save Payment Form Submit
    const savePaymentBtn = document.getElementById("btnSaveNewPayment");
    if (savePaymentBtn) {
      savePaymentBtn.addEventListener("click", () => {
        this.savePayment();
      });
    }
  }

  /**
   * Open the Record Payment Modal with pre-filled context if applicable.
   * @param {string} [prefillType="invoice"]
   * @param {string|null} [prefillId=null]
   */
  openRecordPaymentModal(prefillType = "invoice", prefillId = null) {
    const modal = document.getElementById("recordPaymentModal");
    if (!modal) return;

    this.modalType = (prefillType === "grn" || prefillType === "grn-payment") ? "grn" : "invoice";

    // Set Radio
    const radInvoice = document.getElementById("modalRadioInvoice");
    const radGrn = document.getElementById("modalRadioGrn");
    if (radInvoice) radInvoice.checked = (this.modalType === "invoice");
    if (radGrn) radGrn.checked = (this.modalType === "grn");

    // Highlight Type selector card
    document.querySelectorAll(".pay-type-option").forEach((opt) => {
      const isInvoice = opt.classList.contains("invoice-option");
      opt.classList.toggle(
        "selected",
        (this.modalType === "invoice" && isInvoice) || (this.modalType === "grn" && !isInvoice)
      );
    });

    // Populate Reference Dropdown
    this.updateModalReferenceDropdown(prefillId);

    // Set default method
    this.selectedMethod = "Cash";
    document.querySelectorAll(".method-choice").forEach((c) => {
      c.classList.toggle("selected", c.getAttribute("data-method") === "Cash");
    });
    this.updateMethodFields();

    // Set date to today
    const dateInput = document.getElementById("modalPayDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    // Reset notes
    const noteInput = document.getElementById("modalPayNotes");
    if (noteInput) noteInput.value = "";

    modal.classList.add("open");
  }

  /**
   * Populate reference dropdown with either customer orders or supplier GRNs.
   * @param {string|null} [prefillId=null]
   */
  updateModalReferenceDropdown(prefillId = null) {
    const select = document.getElementById("modalPayRefSelect");
    const label = document.getElementById("modalPayRefLabel");
    if (!select) return;

    const orders = this.getOrders();
    const orderPayments = this.getOrderPayments();
    const grnRecords = this.getGrnRecords();
    const grnPayments = this.getGrnPayments();

    if (this.modalType === "invoice") {
      if (label) label.textContent = "Select Customer Job / Invoice";
      let options = `<option value="">-- Choose Job / Invoice --</option>`;

      orders.forEach((o) => {
        const bal = Number(o.balanceAmount) || 0;
        options += `<option value="${o.id}" data-total="${o.totalAmount}" data-paid="${o.paidAmount}" data-balance="${bal}" data-party="${o.customerName}" ${prefillId === o.id ? "selected" : ""}>
          ${o.id} - ${o.customerName} (Bal: Rs. ${bal.toLocaleString()})
        </option>`;
      });

      // Also allow selecting from orderPayments if order not in list
      orderPayments.forEach((p) => {
        if (!orders.some((o) => o.id === p.orderId)) {
          options += `<option value="${p.orderId}" data-total="${p.totalBill}" data-paid="${p.amount}" data-balance="${p.balance}" data-party="${p.customerName}" ${prefillId === p.orderId ? "selected" : ""}>
            ${p.orderId} - ${p.customerName} (Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()})
          </option>`;
        }
      });
      select.innerHTML = options;
    } else {
      if (label) label.textContent = "Select Supplier GRN / Stock Acquisition";
      let options = `<option value="">-- Choose GRN Stock Bill --</option>`;

      grnRecords.forEach((g) => {
        const matchingPay = grnPayments.find((p) => p.grnId === g.grn_id);
        const total = g.net_total || g.sub_total || 50000;
        const paid = matchingPay ? matchingPay.amount : 0;
        const bal = matchingPay ? matchingPay.balance : total;
        options += `<option value="${g.grn_id}" data-total="${total}" data-paid="${paid}" data-balance="${bal}" data-party="${g.supplier_name}" ${prefillId === g.grn_id ? "selected" : ""}>
          ${g.grn_number} - ${g.supplier_name} (Bal: Rs. ${bal.toLocaleString()})
        </option>`;
      });

      // Also allow from grnPayments if not in grnRecords
      grnPayments.forEach((p) => {
        if (!grnRecords.some((g) => g.grn_id === p.grnId)) {
          options += `<option value="${p.grnId}" data-total="${p.totalBill}" data-paid="${p.amount}" data-balance="${p.balance}" data-party="${p.supplierName}" ${prefillId === p.grnId ? "selected" : ""}>
            ${p.grnNumber} - ${p.supplierName} (Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()})
          </option>`;
        }
      });
      select.innerHTML = options;
    }

    this.onReferenceSelected();
  }

  /**
   * Update modal summary card when reference selection changes.
   */
  onReferenceSelected() {
    const select = document.getElementById("modalPayRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;

    const elTotal = document.getElementById("modalBalTotal");
    const elPaid = document.getElementById("modalBalPaid");
    const elBal = document.getElementById("modalBalRemaining");
    const amountInput = document.getElementById("modalPayAmount");

    if (selectedOpt && selectedOpt.value) {
      const total = Number(selectedOpt.getAttribute("data-total")) || 0;
      const paid = Number(selectedOpt.getAttribute("data-paid")) || 0;
      const balance = Number(selectedOpt.getAttribute("data-balance")) || 0;

      if (elTotal) elTotal.textContent = `Rs. ${total.toLocaleString()}`;
      if (elPaid) elPaid.textContent = `Rs. ${paid.toLocaleString()}`;
      if (elBal) elBal.textContent = `Rs. ${balance.toLocaleString()}`;

      if (amountInput) {
        amountInput.value = balance > 0 ? balance : total;
      }
    } else {
      if (elTotal) elTotal.textContent = "Rs. 0";
      if (elPaid) elPaid.textContent = "Rs. 0";
      if (elBal) elBal.textContent = "Rs. 0";
      if (amountInput) amountInput.value = "";
    }

    this.onAmountChanged();
  }

  /**
   * Auto-adjust stage dropdown based on entered amount vs remaining balance.
   */
  onAmountChanged() {
    const select = document.getElementById("modalPayRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;
    const amountInput = document.getElementById("modalPayAmount");
    const stageSelect = document.getElementById("modalPayStageSelect");

    const amount = Number(amountInput ? amountInput.value : 0) || 0;
    const balance = selectedOpt ? (Number(selectedOpt.getAttribute("data-balance")) || 0) : 0;

    if (stageSelect) {
      if (amount <= 0) {
        stageSelect.value = "Pending Payment";
      } else if (amount >= balance) {
        stageSelect.value = "Complete Payment";
      } else {
        stageSelect.value = "Advance Payment";
      }
    }
  }

  /**
   * Set the selected payment method and update fields.
   * @param {string} method
   */
  setMethod(method) {
    this.selectedMethod = method;
    this.updateMethodFields();
  }

  /**
   * Render dynamic input fields based on the selected payment method.
   */
  updateMethodFields() {
    const detailsContainer = document.getElementById("modalMethodSpecificFields");
    if (!detailsContainer) return;

    if (this.selectedMethod === "Card") {
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Card Brand / Type</label>
            <select id="modalCardType" class="pay-select-field">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
            </select>
          </div>
          <div class="pay-field">
            <label class="pay-label">Card Last 4 Digits</label>
            <input type="text" id="modalCardLast4" class="pay-input" placeholder="E.g. 4821" maxlength="4">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Auth / Approval Code</label>
          <input type="text" id="modalCardAuth" class="pay-input" placeholder="POS terminal approval code">
        </div>`;
    } else if (this.selectedMethod === "Check") {
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cheque Number *</label>
            <input type="text" id="modalCheckNo" class="pay-input" placeholder="E.g. 882019" required>
          </div>
          <div class="pay-field">
            <label class="pay-label">Bank & Branch</label>
            <input type="text" id="modalCheckBank" class="pay-input" placeholder="Commercial Bank / HNB">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Cheque Date</label>
          <input type="date" id="modalCheckDate" class="pay-input" value="${new Date().toISOString().split("T")[0]}">
        </div>`;
    } else if (this.selectedMethod === "Bank Transfer") {
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Bank Name</label>
            <input type="text" id="modalTransferBank" class="pay-input" placeholder="BOC / Sampath / Commercial">
          </div>
          <div class="pay-field">
            <label class="pay-label">Transfer / Slip Reference *</label>
            <input type="text" id="modalTransferRef" class="pay-input" placeholder="Online transaction ref #">
          </div>
        </div>`;
    } else {
      // Cash
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cash Tendered (Rs.)</label>
            <input type="number" id="modalCashTendered" class="pay-input" placeholder="Amount given by customer/petty cash">
          </div>
          <div class="pay-field">
            <label class="pay-label">Cash Receipt No</label>
            <input type="text" id="modalCashReceipt" class="pay-input" value="REC-${Math.floor(1000 + Math.random() * 9000)}">
          </div>
        </div>`;
    }
  }

  /**
   * Validate, record, and persist a new payment transaction.
   */
  savePayment() {
    const select = document.getElementById("modalPayRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;
    if (!selectedOpt || !selectedOpt.value) {
      alert("Please select an Order/Invoice or GRN bill to record payment.");
      return;
    }

    const refId = selectedOpt.value;
    const partyName = selectedOpt.getAttribute("data-party") || "Party";
    const totalBill = Number(selectedOpt.getAttribute("data-total")) || 0;
    const oldBalance = Number(selectedOpt.getAttribute("data-balance")) || 0;

    const amountInput = document.getElementById("modalPayAmount");
    const amount = Number(amountInput ? amountInput.value : 0);

    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const stageSelect = document.getElementById("modalPayStageSelect");
    const stage = stageSelect ? stageSelect.value : "Complete Payment";

    const dateInput = document.getElementById("modalPayDate");
    const payDate = dateInput ? dateInput.value : new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("modalPayNotes");
    const notes = noteInput ? noteInput.value.trim() : "";

    // Generate reference code based on method
    let refCode = "";
    if (this.selectedMethod === "Card") {
      const last4 = document.getElementById("modalCardLast4")?.value || "XXXX";
      const auth = document.getElementById("modalCardAuth")?.value || "AUTH";
      refCode = `CARD-${last4}-${auth}`;
    } else if (this.selectedMethod === "Check") {
      const chq = document.getElementById("modalCheckNo")?.value || "CHQ";
      const bank = document.getElementById("modalCheckBank")?.value || "BANK";
      refCode = `CHQ-${chq}-${bank}`;
    } else if (this.selectedMethod === "Bank Transfer") {
      const trRef = document.getElementById("modalTransferRef")?.value || "TXN";
      refCode = `BANK-TXN-${trRef}`;
    } else {
      refCode = document.getElementById("modalCashReceipt")?.value || `CASH-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newBalance = Math.max(0, oldBalance - amount);

    if (this.modalType === "invoice") {
      const newPayId = `PAY-INV-${Date.now().toString().slice(-6)}`;
      const newPayment = {
        paymentId: newPayId,
        orderId: refId,
        invoiceNo: `INV-${refId}`,
        customerName: partyName,
        date: payDate,
        totalBill: totalBill,
        amount: amount,
        balance: newBalance,
        stage: stage,
        method: this.selectedMethod,
        ref: refCode,
        note: notes
      };

      const orderPayments = this.getOrderPayments();
      orderPayments.unshift(newPayment);
      this.dataLoader.saveOrderPayments(orderPayments);

      // Update Order balance in orders
      const orders = this.getOrders();
      const order = orders.find((o) => o.id === refId);
      if (order) {
        order.paidAmount = (Number(order.paidAmount) || 0) + amount;
        order.balanceAmount = newBalance;
        order.paymentStatus = newBalance <= 0 ? "Paid" : order.paidAmount > 0 ? "Partially Paid" : "Unpaid";
        this.dataLoader.saveOrders(orders);
      }

      this.closeModals();
      this.onPaymentSaved(newPayment, "invoice");
      this.showToast(`Invoice Payment of Rs. ${amount.toLocaleString()} recorded successfully!`);
      this.openReceiptModal(newPayId, "invoice");
    } else {
      const newPayId = `PAY-GRN-${Date.now().toString().slice(-6)}`;
      const newPayment = {
        paymentId: newPayId,
        grnId: refId,
        grnNumber: refId,
        poNumber: "PO-" + refId.replace("GRN-", ""),
        supplierId: "SUP-001",
        supplierName: partyName,
        stockCategory: "Stock Items Received",
        date: payDate,
        totalBill: totalBill,
        amount: amount,
        balance: newBalance,
        stage: stage,
        method: this.selectedMethod,
        ref: refCode,
        note: notes
      };

      const grnPayments = this.getGrnPayments();
      grnPayments.unshift(newPayment);
      this.dataLoader.saveGrnPayments(grnPayments);

      this.closeModals();
      this.onPaymentSaved(newPayment, "grn");
      this.showToast(`GRN Supplier Payment of Rs. ${amount.toLocaleString()} recorded successfully!`);
      this.openReceiptModal(newPayId, "grn");
    }
  }
}

export default PaymentModalHandler;

