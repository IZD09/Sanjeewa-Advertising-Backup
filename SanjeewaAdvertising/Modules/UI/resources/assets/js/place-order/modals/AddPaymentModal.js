/**
 * SanjeewaAdvertising - Add Payment Installment Modal
 *
 * Handles recording payment installments for orders (#addPaymentModal)
 * with robust frontend validation and direct integration with the MySQL `payments` schema:
 * - Frontend validation: amount > 0, amount <= balance, order validation, valid payment method
 * - Real-time calculation and live visual status feedback
 * - Backend API submission to `POST /api/v1/payments` with Laravel 422 error handling
 * - Automatic update of order balance, status, table row, KPIs, and receipt modal
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";

export class AddPaymentModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getPayments
   * @param {string} [context.currentUser]
   * @param {Object} [context.dataLoader]
   * @param {Function} [context.onPaymentSaved]
   * @param {Function} [context.openReceiptModal]
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context || {};
    this.currentContextOrder = null;
    this.http = new RequestHandler();
    this.isSubmitting = false;

    // Database lookup dictionaries matching MySQL `payment_types` table
    this.paymentTypesMap = {
      1: { id: 1, name: "Cash", code: "Cash", icon: "💵" },
      2: { id: 2, name: "Bank Transfer", code: "Bank Transfer", icon: "🏦" },
      3: { id: 3, name: "Credit Card", code: "Credit Card", icon: "💳" },
      4: { id: 4, name: "Debit Card", code: "Debit Card", icon: "💳" },
      5: { id: 5, name: "Cheque", code: "Cheque", icon: "📜" },
      6: { id: 6, name: "Online / QR Payment", code: "Online / QR", icon: "📱" }
    };

    // Database lookup dictionaries matching MySQL `payment_statuses` table
    this.paymentStatusesMap = {
      1: { id: 1, name: "Pending", badge: "Pending" },
      2: { id: 2, name: "Completed", badge: "Paid" },
      3: { id: 3, name: "Partial", badge: "Partially Paid" },
      4: { id: 4, name: "Failed", badge: "Failed" },
      5: { id: 5, name: "Reversed", badge: "Reversed" }
    };

    this.bindEvents();
  }

  bindEvents() {
    const submitBtn = document.getElementById("submitAddPaymentBtn");
    if (submitBtn) {
      submitBtn.onclick = (e) => {
        e.preventDefault();
        this.saveNewPayment();
      };
    }

    const btnPayFull = document.getElementById("btnPayFull");
    if (btnPayFull) {
      btnPayFull.onclick = (e) => {
        e.preventDefault();
        if (!this.currentContextOrder) return;
        const amtInput = document.getElementById("pmAmount");
        if (amtInput) {
          amtInput.value = Number(this.currentContextOrder.balanceAmount || 0).toFixed(2);
          this.clearFieldError("pmAmount");
          this.updateLiveCalculations();
        }
      };
    }

    const btnPayHalf = document.getElementById("btnPayHalf");
    if (btnPayHalf) {
      btnPayHalf.onclick = (e) => {
        e.preventDefault();
        if (!this.currentContextOrder) return;
        const half = Math.round((Number(this.currentContextOrder.balanceAmount || 0) / 2) * 100) / 100;
        const amtInput = document.getElementById("pmAmount");
        if (amtInput) {
          amtInput.value = half.toFixed(2);
          this.clearFieldError("pmAmount");
          this.updateLiveCalculations();
        }
      };
    }

    const amtInput = document.getElementById("pmAmount");
    if (amtInput) {
      amtInput.addEventListener("input", () => this.updateLiveCalculations());
      amtInput.addEventListener("change", () => this.updateLiveCalculations());
      amtInput.addEventListener("blur", () => this.validateAmount(true));
    }

    const typeSelect = document.getElementById("pmPaymentTypeId");
    if (typeSelect) {
      typeSelect.addEventListener("change", () => {
        const typeId = parseInt(typeSelect.value, 10);
        const meta = this.paymentTypesMap[typeId];
        const methodInput = document.getElementById("pmMethod");
        if (methodInput && meta) {
          methodInput.value = meta.name;
        }
      });
    }
  }

  /**
   * Display inline field error on amount input.
   * @param {string} fieldId
   * @param {string} errorMsg
   */
  showFieldError(fieldId, errorMsg) {
    const inputEl = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}ErrorMsg`);

    if (inputEl) {
      inputEl.style.borderColor = "#ef4444";
      inputEl.style.boxShadow = "0 0 0 2px rgba(239, 68, 68, 0.2)";
      inputEl.setAttribute("aria-invalid", "true");
    }

    if (errorEl) {
      errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${errorMsg}`;
      errorEl.style.display = "flex";
    }

    const submitBtn = document.getElementById("submitAddPaymentBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.6";
      submitBtn.style.cursor = "not-allowed";
    }
  }

  /**
   * Clear inline field error on amount input.
   * @param {string} fieldId
   */
  clearFieldError(fieldId) {
    const inputEl = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}ErrorMsg`);

    if (inputEl) {
      inputEl.style.borderColor = "";
      inputEl.style.boxShadow = "";
      inputEl.removeAttribute("aria-invalid");
    }

    if (errorEl) {
      errorEl.innerHTML = "";
      errorEl.style.display = "none";
    }

    const submitBtn = document.getElementById("submitAddPaymentBtn");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    }
  }

  /**
   * Validate amount input value against business requirements.
   * @param {boolean} [showError=false]
   * @returns {{valid: boolean, amount?: number, error?: string}}
   */
  validateAmount(showError = false) {
    if (!this.currentContextOrder) {
      return { valid: false, error: "No order selected." };
    }

    const amtInput = document.getElementById("pmAmount");
    if (!amtInput) {
      return { valid: false, error: "Amount input not found." };
    }

    const rawVal = amtInput.value.trim();
    const balance = Number(this.currentContextOrder.balanceAmount || 0);

    if (rawVal === "") {
      if (showError) {
        this.showFieldError("pmAmount", "Payment amount is required.");
      }
      return { valid: false, error: "Payment amount is required." };
    }

    const amount = parseFloat(rawVal);
    if (isNaN(amount) || amount <= 0) {
      if (showError) {
        this.showFieldError("pmAmount", "Payment amount must be a positive number greater than zero.");
      }
      return { valid: false, error: "Payment amount must be greater than zero." };
    }

    if (amount > balance + 0.01) {
      if (showError) {
        this.showFieldError(
          "pmAmount",
          `Amount (Rs. ${amount.toFixed(2)}) exceeds remaining balance (Rs. ${balance.toFixed(2)}).`
        );
      }
      return { valid: false, error: "Payment amount exceeds remaining balance." };
    }

    this.clearFieldError("pmAmount");
    return { valid: true, amount };
  }

  /**
   * Automatically compute live balance and dynamically update the payment status badge based on payment amount.
   */
  updateLiveCalculations() {
    if (!this.currentContextOrder) return;

    const amtInput = document.getElementById("pmAmount");
    const previewEl = document.getElementById("pmNewBalancePreview");
    if (!amtInput) return;

    const rawVal = amtInput.value.trim();
    const balance = Number(this.currentContextOrder.balanceAmount || 0);

    if (rawVal === "") {
      if (previewEl) {
        previewEl.textContent = `Rs. ${balance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
        previewEl.style.color = "var(--text)";
      }
      this.clearFieldError("pmAmount");
      this.setStatusBadge(3);
      return;
    }

    const amount = parseFloat(rawVal);
    if (isNaN(amount) || amount <= 0) {
      if (previewEl) {
        previewEl.textContent = "Please enter an amount > 0";
        previewEl.style.color = "var(--text-muted)";
      }
      this.showFieldError("pmAmount", "Payment amount must be greater than zero.");
      this.setStatusBadge(3);
      return;
    }

    if (amount > balance + 0.01) {
      if (previewEl) {
        previewEl.innerHTML = `<span style="color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Exceeds balance by Rs. ${(amount - balance).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>`;
      }
      this.showFieldError(
        "pmAmount",
        `Amount (Rs. ${amount.toFixed(2)}) exceeds remaining balance (Rs. ${balance.toFixed(2)}).`
      );
      this.setStatusBadge(2);
      return;
    }

    this.clearFieldError("pmAmount");
    const remaining = Math.max(0, Math.round((balance - amount) * 100) / 100);

    if (remaining <= 0.01) {
      if (previewEl) {
        previewEl.innerHTML = `<span style="color: #10b981;"><i class="fa-solid fa-circle-check"></i> Rs. 0.00 (Fully Settled)</span>`;
      }
      // Amount fully settles the order -> Status: Completed (ID: 2)
      this.setStatusBadge(2);
    } else {
      if (previewEl) {
        previewEl.innerHTML = `<span style="color: var(--po-orange, #ff6b00);">Rs. ${remaining.toLocaleString("en-LK", { minimumFractionDigits: 2 })} (Partial Settlement)</span>`;
      }
      // Amount partially settles the order -> Status: Partial (ID: 3)
      this.setStatusBadge(3);
    }
  }

  /**
   * Set payment status badge and hidden input (2: Completed, 3: Partial)
   */
  setStatusBadge(statusId) {
    const statusHidden = document.getElementById("pmPaymentStatusId");
    const statusIcon = document.getElementById("pmStatusIcon");
    const statusText = document.getElementById("pmStatusText");

    if (statusHidden) statusHidden.value = String(statusId);

    if (statusId === 2) {
      if (statusIcon) statusIcon.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>`;
      if (statusText) statusText.innerHTML = `<span style="color: #10b981;">Completed (Full Settlement)</span>`;
    } else {
      if (statusIcon) statusIcon.innerHTML = `<i class="fa-solid fa-circle-dot" style="color: var(--po-orange, #ff6b00);"></i>`;
      if (statusText) statusText.innerHTML = `<span style="color: var(--po-orange, #ff6b00);">Partially Paid (Installment)</span>`;
    }
  }

  /**
   * Resolves the real integer primary key `print_jobs.id` from an order instance.
   * @param {Object} order
   * @returns {number}
   */
  resolvePrintJobId(order) {
    if (!order) return 1;

    // 1. Check explicit printJobId / job_id attributes
    const candidateId = order.printJobId ?? order.print_job_id ?? order.job_id ?? order.print_jobs_id;
    if (candidateId !== undefined && candidateId !== null) {
      const parsed = parseInt(candidateId, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    // 2. Parse from standard formatted ID e.g. "ORD-2026-1001" or "ORD-1" or "1001"
    const strId = String(order.id || "").trim();
    const parts = strId.split("-");
    const lastSegment = parts[parts.length - 1];
    const num = parseInt(lastSegment, 10);
    if (!isNaN(num) && num > 0) {
      return num > 1000 ? num - 1000 : num;
    }

    // 3. Fallback: extract last digits group
    const match = strId.match(/(\d+)$/);
    if (match && match[1]) {
      const parsedLast = parseInt(match[1], 10);
      if (!isNaN(parsedLast) && parsedLast > 0) {
        return parsedLast > 1000 ? parsedLast - 1000 : parsedLast;
      }
    }

    return 1;
  }

  openAddPaymentModal(orderId) {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      this.showToast(`Order ${orderId} not found!`, "error");
      return;
    }
    this.currentContextOrder = order;

    if (Number(order.balanceAmount || 0) <= 0) {
      this.showToast(`Order ${orderId} is already fully paid!`, "warning");
      return;
    }

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : "";
    };

    // Database IDs resolution
    const printJobId = this.resolvePrintJobId(order);

    const orderPayments = (payments || []).filter(p => p.orderId === orderId);
    const instNo = orderPayments.length + 1;
    const paymentId = `PAY-2026-${String((payments.length || 0) + 1).padStart(4, "0")}`;

    // 1. Context Summary Card
    setTxt("pmDisplayOrderId", order.id);
    setTxt("pmDisplayOrderDate", order.orderDate ? `Placed: ${order.orderDate}` : "");
    setTxt("pmDisplayCustomer", `${order.customerName || "Customer"} (${order.customerMobile || "-"})`);
    setTxt("pmCustomer", `${order.customerName || "Customer"} (${order.customerMobile || "-"})`);

    const productDetails = order.productName
      ? `${order.productName} • ${order.width || "-"} × ${order.height || "-"} ${order.unit || ""}${order.quantity ? ` (Qty: ${order.quantity})` : ""}`
      : "Print Job";
    setTxt("pmDisplayProduct", productDetails);

    // Invoice status badge in context card
    const existingInvoicesCount = order.invoices?.length || (order.invoiceNo ? 1 : 0);
    const invoiceBadge = document.getElementById("pmInvoiceBadge");
    if (invoiceBadge) {
      invoiceBadge.textContent = "New Invoice per Payment";
    }
    const invCountEl = document.getElementById("pmInvoicesCount");
    if (invCountEl) {
      invCountEl.textContent = existingInvoicesCount > 0
        ? `Existing: ${existingInvoicesCount} • Generating: #${existingInvoicesCount + 1}`
        : "Generating: Invoice #1";
    }

    // 3 Financial Metric Cards (Total, Paid, Balance)
    const formattedTotal = `Rs. ${Number(order.totalAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    const formattedPaid = `Rs. ${Number(order.paidAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    const formattedBal = `Rs. ${Number(order.balanceAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    setTxt("pmTotalAmount", formattedTotal);
    setTxt("pmTotal", formattedTotal);
    setTxt("pmPaidAmount", formattedPaid);
    setTxt("pmPaid", formattedPaid);
    setTxt("pmRemainingBalance", formattedBal);
    setTxt("pmBalance", formattedBal);

    // 2. Hidden Database Bindings
    setVal("pmPrintJobId", printJobId);
    setVal("pmOrderId", order.id);
    setVal("pmInvoiceId", order.invoiceId || "");
    setVal("pmPaymentId", paymentId);
    setVal("pmInstallmentNo", instNo);

    // Current system datetime
    const now = new Date();
    const systemDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    setVal("pmPayDate", systemDateTime);
    setVal("pmDate", systemDateTime.slice(0, 10));

    setVal("pmReceivedBy", this.ctx.currentUser || "Admin User");

    // Default Payment Type: 1 (Cash)
    setVal("pmPaymentTypeId", "1");
    setVal("pmMethod", "Cash");

    // Default Amount: full balance
    const amtInput = document.getElementById("pmAmount");
    if (amtInput) {
      amtInput.value = Number(order.balanceAmount || 0).toFixed(2);
      amtInput.max = String(order.balanceAmount);
    }

    setVal("pmRef", "-");
    setVal("pmReference", "-");
    setVal("pmNote", "");

    this.clearFieldError("pmAmount");
    this.updateLiveCalculations();

    this.openModal("addPaymentModal");
  }

  async saveNewPayment() {
    if (!this.currentContextOrder || this.isSubmitting) return;

    const order = this.currentContextOrder;
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];

    // 1. Frontend Validations
    const currentBal = Number(order.balanceAmount || 0);
    if (currentBal <= 0) {
      this.showToast("This order is already fully paid.", "warning");
      this.closeModal("addPaymentModal");
      return;
    }

    const validation = this.validateAmount(true);
    if (!validation.valid) {
      this.showToast(validation.error || "Please correct the payment amount.", "error");
      const amtInput = document.getElementById("pmAmount");
      if (amtInput) amtInput.focus();
      return;
    }

    const amount = validation.amount;

    const paymentTypeId = parseInt(document.getElementById("pmPaymentTypeId")?.value || "1", 10);
    if (isNaN(paymentTypeId) || paymentTypeId < 1 || paymentTypeId > 6) {
      this.showToast("Please select a valid payment method.", "error");
      return;
    }

    const paymentStatusId = parseInt(document.getElementById("pmPaymentStatusId")?.value || "3", 10);
    const receivedBy = this.ctx.currentUser || "Admin User";
    const instElem = document.getElementById("pmInstallmentNo");
    const instNo = parseInt(instElem?.value || "1", 10) || 1;
    const printJobId = parseInt(document.getElementById("pmPrintJobId")?.value, 10) ||
      this.resolvePrintJobId(order);

    if (!printJobId || isNaN(printJobId)) {
      this.showToast("Unable to identify the database print job ID for this order.", "error");
      return;
    }

    // Automated current system date & time for MySQL `pay_date`
    const now = new Date();
    const formattedPayDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const typeMeta = this.paymentTypesMap[paymentTypeId] || { name: "Cash", code: "Cash" };
    const statusMeta = this.paymentStatusesMap[paymentStatusId] || { name: "Partial", badge: "Partially Paid" };

    // 2. Lock UI & show processing spinner
    const submitBtn = document.getElementById("submitAddPaymentBtn");
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing & Storing in DB...`;
    }
    this.isSubmitting = true;

    let dbPaymentId = null;

    try {
      // 3. Send strictly validated database payload to `/api/v1/payments`
      const apiPayload = {
        payment: Math.round(amount * 100) / 100,
        print_jobs_id: printJobId,
        payment_types_id: paymentTypeId,
        payment_statuses_id: paymentStatusId,
        pay_date: formattedPayDate
      };

      const existingInvId = parseInt(document.getElementById("pmInvoiceId")?.value, 10);
      if (!isNaN(existingInvId) && existingInvId > 0) {
        apiPayload.invoice_id = existingInvId;
      }

      let apiResData = null;

      try {
        const apiRes = await this.http.post("/api/v1/payments", apiPayload);
        if (apiRes && apiRes.data) {
          apiResData = apiRes.data;
          if (apiRes.data.id) {
            dbPaymentId = `PAY-2026-${String(apiRes.data.id).padStart(4, "0")}`;
          }
        }
      } catch (apiErr) {
        console.warn("[AddPaymentModal] API payment store response:", apiErr);

        // If backend returned HTTP 422 validation errors, display exact message and keep form open
        if (apiErr.status === 422) {
          const validationMsg = apiErr.message || "Validation failed on the server.";
          this.showFieldError("pmAmount", validationMsg);
          this.showToast(validationMsg, "error");
          return;
        }

        // For other network warnings, log and continue with local sync
        this.showToast(`Warning: Server sync note (${apiErr.message || "Network fallback"}). Storing locally.`, "warning");
      }

      const generatedPaymentId = dbPaymentId || `PAY-2026-${String((payments.length || 0) + 1).padStart(4, "0")}`;
      const confirmedInvoiceId = apiResData?.invoice_id || null;
      const confirmedInvoiceNo = apiResData?.invoice_no || (confirmedInvoiceId ? `INV-2026-${String(confirmedInvoiceId).padStart(4, "0")}` : null);

      if (!order.invoices) order.invoices = [];
      if (confirmedInvoiceNo && !order.invoices.includes(confirmedInvoiceNo)) {
        order.invoices.push(confirmedInvoiceNo);
      }
      if (confirmedInvoiceId) order.invoiceId = confirmedInvoiceId;
      if (confirmedInvoiceNo) order.invoiceNo = confirmedInvoiceNo;

      // 4. Prepare local transaction record
      const newPayment = {
        paymentId: generatedPaymentId,
        orderId: order.id,
        printJobId: printJobId,
        invoiceId: confirmedInvoiceId,
        invoiceNo: confirmedInvoiceNo,
        installmentNo: instNo,
        date: formattedPayDate.slice(0, 10),
        payDateTime: formattedPayDate,
        amount: Math.round(amount * 100) / 100,
        payment: Math.round(amount * 100) / 100,
        paymentTypeId: paymentTypeId,
        paymentStatusId: paymentStatusId,
        method: typeMeta.name,
        paymentType: typeMeta.name,
        paymentStatus: statusMeta.badge,
        ref: "-",
        receivedBy,
        status: paymentStatusId === 1 ? "Pending" : "Successful",
        note: `Installment #${instNo} (${typeMeta.name}) for Print Job #${printJobId}${confirmedInvoiceNo ? ` • Invoice: ${confirmedInvoiceNo}` : ""}`
      };

      payments.unshift(newPayment);

      // 5. Recalculate order totals & status
      const orderPayments = payments.filter(p => {
        if (p.orderId !== order.id && p.printJobId !== printJobId) return false;
        const amt = parseFloat(p.amount || p.payment) || 0;
        const st = String(p.status || "").toLowerCase();
        return amt > 0 && st !== "failed" && st !== "reversed";
      });

      const totalPaid = orderPayments.reduce((acc, p) => acc + (parseFloat(p.amount || p.payment) || 0), 0);
      order.paidAmount = Math.round(totalPaid * 100) / 100;
      order.balanceAmount = Math.max(0, Math.round(((order.totalAmount || 0) - order.paidAmount) * 100) / 100);

      if (paymentStatusId === 2 || (order.paidAmount >= order.totalAmount && order.totalAmount > 0)) {
        order.paymentStatus = "Paid";
      } else if (order.paidAmount > 0 && order.balanceAmount > 0) {
        order.paymentStatus = "Partially Paid";
      } else {
        order.paymentStatus = "Unpaid";
      }

      // 6. Persist to dataLoader / localStorage cache
      if (this.ctx.dataLoader) {
        this.ctx.dataLoader.savePayments(payments);
        this.ctx.dataLoader.saveOrders(orders);
        this.ctx.dataLoader.logAudit(
          "ADD_PAYMENT",
          order.id,
          `Recorded DB payment #${generatedPaymentId} (Job #${printJobId}): Rs. ${amount.toFixed(2)} via ${typeMeta.name} [Status: ${statusMeta.name}]`
        );
      }

      this.closeModal("addPaymentModal");
      const toastMsg = confirmedInvoiceNo
        ? `Payment #${generatedPaymentId} (Rs. ${amount.toFixed(2)}) recorded! New Invoice ${confirmedInvoiceNo} created.`
        : `Payment #${generatedPaymentId} of Rs. ${amount.toFixed(2)} recorded successfully!`;
      this.showToast(toastMsg, "success");

      // 7. Refresh orders table & KPIs
      if (this.ctx.onPaymentSaved) {
        this.ctx.onPaymentSaved(newPayment, order, orders, payments);
      }

      // 8. Automatically open receipt voucher
      if (typeof this.ctx.openReceiptModal === "function") {
        this.ctx.openReceiptModal(generatedPaymentId);
      } else if (window.placeOrderApp?.openReceiptModal) {
        window.placeOrderApp.openReceiptModal(generatedPaymentId);
      }
    } catch (err) {
      console.error("[AddPaymentModal] Unexpected error recording installment:", err);
      this.showToast("Failed to record installment payment. Please try again.", "error");
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  }
}

export default AddPaymentModal;
