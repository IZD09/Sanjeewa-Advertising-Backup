/**
 * SanjeewaAdvertising - Record Invoice Payment Modal
 *
 * Handles recording Customer & Multi-Job Print Settlements (#modalRecordInvoicePayment).
 * Allows adding multiple print jobs to a single invoice by selecting from the list
 * OR typing the Job ID directly (with keyboard Enter / barcode scanner support),
 * allocating payment amounts, and generating an itemized voucher for all included jobs.
 *
 * Supports Cash, Card, Cheque, and Bank Transfer payment methods.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class RecordInvoicePaymentModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getOrderPayments
   * @param {Function} context.saveOrderPayments
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
    this.selectedMethod = "Cash";
    this.selectedJobs = [];

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("#btnOpenRecordInvoicePayment, [data-action='record-invoice']");
      if (openBtn) {
        e.preventDefault();
        const prefillId = openBtn.getAttribute("data-order-id") || null;
        this.openRecordInvoicePaymentModal(prefillId);
        return;
      }

      // Add Job Button click
      const addJobBtn = e.target.closest("#btnAddJobToInvoice");
      if (addJobBtn) {
        e.preventDefault();
        this.addJobFromInputOrDropdown();
        return;
      }

      // Remove Job Button click
      const removeBtn = e.target.closest(".btn-remove-job");
      if (removeBtn) {
        e.preventDefault();
        const jobId = removeBtn.getAttribute("data-job-id");
        if (jobId) {
          this.removeJob(jobId);
        }
        return;
      }

      // Pay Full Balance shortcut
      const payFullBtn = e.target.closest("#btnInvPayFull");
      if (payFullBtn) {
        e.preventDefault();
        this.payFullBalance();
        return;
      }

      // Method selector inside modal
      const methodChoice = e.target.closest("#invModalMethodSelector .method-choice");
      if (methodChoice) {
        e.preventDefault();
        document.querySelectorAll("#invModalMethodSelector .method-choice").forEach(c => c.classList.remove("selected"));
        methodChoice.classList.add("selected");
        this.selectedMethod = methodChoice.getAttribute("data-method") || "Cash";
        this.updateMethodFields();
      }
    });

    // Job ID Text Input - Add on Enter
    const jobIdInput = document.getElementById("invModalJobIdInput");
    if (jobIdInput) {
      jobIdInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.addJobFromInput();
        }
      });
    }

    // Total Amount Input
    const amountInput = document.getElementById("invModalAmount");
    if (amountInput) {
      amountInput.addEventListener("input", () => this.onTotalAmountChanged());
    }

    // Individual Job Allocation Input change / input
    const jobsTableBody = document.getElementById("invModalSelectedJobsBody");
    if (jobsTableBody) {
      jobsTableBody.addEventListener("input", (e) => {
        const allocInput = e.target.closest(".pay-job-allocation");
        if (allocInput) {
          const jobId = allocInput.getAttribute("data-job-id");
          const val = parseFloat(allocInput.value) || 0;
          this.onJobAllocationChanged(jobId, val);
        }
      });
    }

    // Confirm Save
    const confirmBtn = document.getElementById("btnConfirmSaveInvoicePayment");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.save());
    }
  }

  openRecordInvoicePaymentModal(prefillOrderId = null) {
    const modal = document.getElementById("modalRecordInvoicePayment");
    if (!modal) return;

    this.selectedMethod = "Cash";
    document.querySelectorAll("#invModalMethodSelector .method-choice").forEach(c => {
      c.classList.toggle("selected", c.getAttribute("data-method") === "Cash");
    });
    this.updateMethodFields();

    this.selectedJobs = [];

    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];

    // If prefillOrderId passed, find and pre-add that job
    if (prefillOrderId) {
      const foundOrder = orders.find(o => o.id === prefillOrderId);
      if (foundOrder) {
        this.addJobObject(foundOrder);
      } else {
        const foundPay = payments.find(p => p.orderId === prefillOrderId);
        if (foundPay) {
          this.addJobObject({
            id: foundPay.orderId,
            customerName: foundPay.customerName,
            productName: "Print Order",
            totalAmount: foundPay.totalBill,
            paidAmount: foundPay.amount,
            balanceAmount: foundPay.balance
          });
        }
      }
    } else {
      // By default if no prefill, prefill the first pending/partial order if available
      const pendingOrder = orders.find(o => (Number(o.balanceAmount) || (Number(o.totalAmount) - (Number(o.paidAmount) || 0))) > 0);
      if (pendingOrder) {
        this.addJobObject(pendingOrder);
      }
    }

    this.updateDropdown();
    this.renderSelectedJobsTable();
    this.recalculateSummary();

    const dateInput = document.getElementById("invModalDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("invModalNotes");
    if (noteInput) noteInput.value = "";

    const jobIdInput = document.getElementById("invModalJobIdInput");
    if (jobIdInput) {
      jobIdInput.value = "";
      setTimeout(() => jobIdInput.focus(), 150);
    }

    this.openModal("modalRecordInvoicePayment");
  }

  addJobObject(order) {
    const jobId = order.id || order.orderId;
    if (!jobId) return;
    if (this.selectedJobs.some(j => j.id === jobId)) return;

    const tot = Number(order.totalAmount !== undefined ? order.totalAmount : order.totalBill) || 0;
    const paid = Number(order.paidAmount !== undefined ? order.paidAmount : order.amount) || 0;
    const bal = Number(order.balanceAmount !== undefined ? order.balanceAmount : (tot - paid)) || 0;

    this.selectedJobs.push({
      id: jobId,
      customerName: order.customerName || "Customer",
      productName: order.productName || order.stockCategory || "Print Order",
      totalAmount: tot,
      paidAmount: paid,
      balanceAmount: bal,
      allocatedAmount: bal > 0 ? bal : tot
    });
  }

  findOrderByIdOrQuery(query) {
    if (!query) return null;
    const clean = query.trim().toLowerCase().replace(/^#/, "");
    if (!clean) return null;

    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];

    // 1. Exact match on ID (e.g. "ord-2026-1048")
    let match = orders.find(o => (o.id || "").toLowerCase() === clean);
    if (match) return match;

    // 2. Suffix match on ID (e.g. "1048" matches "ORD-2026-1048")
    match = orders.find(o => (o.id || "").toLowerCase().endsWith(clean));
    if (match) return match;

    // 3. Substring match on ID
    match = orders.find(o => (o.id || "").toLowerCase().includes(clean));
    if (match) return match;

    // 4. Substring match on customer name
    match = orders.find(o => (o.customerName || "").toLowerCase().includes(clean));
    if (match) return match;

    // 5. Fallback in payments records
    let payMatch = payments.find(p => (p.orderId || "").toLowerCase() === clean);
    if (!payMatch) {
      payMatch = payments.find(p => (p.orderId || "").toLowerCase().endsWith(clean));
    }
    if (!payMatch) {
      payMatch = payments.find(p => (p.orderId || "").toLowerCase().includes(clean));
    }
    if (!payMatch) {
      payMatch = payments.find(p => (p.customerName || "").toLowerCase().includes(clean));
    }

    if (payMatch) {
      return {
        id: payMatch.orderId,
        customerName: payMatch.customerName,
        productName: "Print Order",
        totalAmount: payMatch.totalBill,
        paidAmount: payMatch.amount,
        balanceAmount: payMatch.balance
      };
    }

    return null;
  }

  updateJobDatalist() {
    const datalist = document.getElementById("invJobsDatalist");

    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];

    const primaryCustomer = this.selectedJobs.length > 0 ? this.selectedJobs[0].customerName : null;

    let available = [];

    orders.forEach(o => {
      if (!this.selectedJobs.some(j => j.id === o.id)) {
        const bal = Number(o.balanceAmount !== undefined ? o.balanceAmount : (Number(o.totalAmount) - (Number(o.paidAmount) || 0))) || 0;
        const tot = Number(o.totalAmount) || 0;
        available.push({
          id: o.id,
          customerName: o.customerName || "Customer",
          productName: o.productName || "Print Job",
          total: tot,
          balance: bal,
          raw: o
        });
      }
    });

    payments.forEach(p => {
      if (!this.selectedJobs.some(j => j.id === p.orderId) && !available.some(a => a.id === p.orderId)) {
        const bal = Number(p.balance) || 0;
        const tot = Number(p.totalBill) || 0;
        available.push({
          id: p.orderId,
          customerName: p.customerName || "Customer",
          productName: "Print Order",
          total: tot,
          balance: bal,
          raw: p
        });
      }
    });

    // Prioritize jobs belonging to the current primary customer
    if (primaryCustomer) {
      available.sort((a, b) => {
        const aMatch = a.customerName.toLowerCase() === primaryCustomer.toLowerCase();
        const bMatch = b.customerName.toLowerCase() === primaryCustomer.toLowerCase();
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    // Populate Datalist for autocomplete on typing
    if (datalist) {
      datalist.innerHTML = available.map(item => {
        return `<option value="${item.id}">${item.id} - ${item.customerName} (${item.productName} - Due: Rs. ${item.balance.toLocaleString()})</option>`;
      }).join("");
    }
  }

  updateDropdown() {
    this.updateJobDatalist();
  }

  addJobFromInput() {
    const input = document.getElementById("invModalJobIdInput");
    const query = input ? input.value.trim() : "";

    if (!query) {
      this.showToast("Please type a Job ID (e.g. 1048 or ORD-2026-1048).", "warning");
      if (input) input.focus();
      return;
    }

    const job = this.findOrderByIdOrQuery(query);
    if (!job) {
      this.showToast(`No print job found matching "${query}". Please check the Job #.`, "warning");
      if (input) input.select();
      return;
    }

    const jobId = job.id || job.orderId;
    if (this.selectedJobs.some(j => j.id === jobId)) {
      this.showToast(`Job ${jobId} is already included in this invoice.`, "info");
      if (input) {
        input.value = "";
        input.focus();
      }
      return;
    }

    this.addJobObject(job);

    if (input) {
      input.value = "";
      input.focus();
    }

    this.updateJobDatalist();
    this.renderSelectedJobsTable();
    this.recalculateSummary();
    this.showToast(`Job ${jobId} added to this invoice!`);
  }

  addJobFromInputOrDropdown() {
    this.addJobFromInput();
  }

  addSelectedJobFromDropdown() {
    this.addJobFromInput();
  }

  removeJob(jobId) {
    this.selectedJobs = this.selectedJobs.filter(j => j.id !== jobId);
    this.updateDropdown();
    this.renderSelectedJobsTable();
    this.recalculateSummary();
  }

  renderSelectedJobsTable() {
    const tbody = document.getElementById("invModalSelectedJobsBody");
    const countPill = document.getElementById("invModalJobCountPill");
    const saveBtnText = document.getElementById("btnConfirmSaveInvoiceText");

    const jobCount = this.selectedJobs.length;
    if (countPill) {
      countPill.textContent = `${jobCount} ${jobCount === 1 ? 'Job' : 'Jobs'} Selected`;
    }

    if (saveBtnText) {
      saveBtnText.textContent = jobCount > 1
        ? `Save Invoice Payment (${jobCount} Jobs) & Generate Voucher`
        : `Save Invoice Payment & Generate Voucher`;
    }

    if (!tbody) return;

    if (jobCount === 0) {
      tbody.innerHTML = `
        <tr class="empty-jobs-row">
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">
            <i class="fa-solid fa-circle-info" style="color: #2563eb; margin-right: 6px;"></i>
            No print jobs added to this invoice yet. Type a Job # above or select from the list and click "+ Add Job".
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = this.selectedJobs.map(j => {
      return `
        <tr>
          <td style="padding: 8px 12px;">
            <strong style="color: var(--blue); font-size: 12.5px;">${j.id}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${j.productName}</div>
          </td>
          <td style="padding: 8px 10px; font-size: 12px; color: var(--text);">
            ${j.customerName}
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 600;">
            Rs. ${j.totalAmount.toLocaleString()}
          </td>
          <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: ${j.balanceAmount > 0 ? '#ef4444' : '#10b981'};">
            Rs. ${j.balanceAmount.toLocaleString()}
          </td>
          <td style="padding: 8px 10px; text-align: right;">
            <input type="number" class="pay-job-allocation pay-input" data-job-id="${j.id}" min="0" step="50" value="${j.allocatedAmount}">
          </td>
          <td style="padding: 8px 8px; text-align: center;">
            <button type="button" class="btn-remove-job" data-job-id="${j.id}" title="Remove job from invoice">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>`;
    }).join("");
  }

  onJobAllocationChanged(jobId, val) {
    const job = this.selectedJobs.find(j => j.id === jobId);
    if (!job) return;

    job.allocatedAmount = Math.max(0, val);

    const totalAlloc = this.selectedJobs.reduce((sum, j) => sum + j.allocatedAmount, 0);
    const amountInput = document.getElementById("invModalAmount");
    if (amountInput) {
      amountInput.value = totalAlloc;
    }

    this.updateStage();
  }

  onTotalAmountChanged() {
    const amountInput = document.getElementById("invModalAmount");
    let remainingToDistribute = parseFloat(amountInput ? amountInput.value : 0) || 0;

    this.selectedJobs.forEach(job => {
      const needed = job.balanceAmount > 0 ? job.balanceAmount : job.totalAmount;
      if (remainingToDistribute >= needed) {
        job.allocatedAmount = needed;
        remainingToDistribute -= needed;
      } else {
        job.allocatedAmount = remainingToDistribute;
        remainingToDistribute = 0;
      }
    });

    if (remainingToDistribute > 0 && this.selectedJobs.length > 0) {
      this.selectedJobs[0].allocatedAmount += remainingToDistribute;
    }

    this.selectedJobs.forEach(job => {
      const input = document.querySelector(`.pay-job-allocation[data-job-id="${job.id}"]`);
      if (input) input.value = job.allocatedAmount;
    });

    this.updateStage();
  }

  payFullBalance() {
    let totalBal = 0;
    this.selectedJobs.forEach(job => {
      job.allocatedAmount = job.balanceAmount > 0 ? job.balanceAmount : job.totalAmount;
      totalBal += job.allocatedAmount;
    });

    const amountInput = document.getElementById("invModalAmount");
    if (amountInput) amountInput.value = totalBal;

    this.selectedJobs.forEach(job => {
      const input = document.querySelector(`.pay-job-allocation[data-job-id="${job.id}"]`);
      if (input) input.value = job.allocatedAmount;
    });

    this.updateStage();
  }

  recalculateSummary() {
    const elTotal = document.getElementById("invModalBalTotal");
    const elPaid = document.getElementById("invModalBalPaid");
    const elBal = document.getElementById("invModalBalRemaining");
    const amountInput = document.getElementById("invModalAmount");

    const totalBill = this.selectedJobs.reduce((sum, j) => sum + j.totalAmount, 0);
    const totalPaidBefore = this.selectedJobs.reduce((sum, j) => sum + j.paidAmount, 0);
    const totalBal = this.selectedJobs.reduce((sum, j) => sum + j.balanceAmount, 0);
    const totalAlloc = this.selectedJobs.reduce((sum, j) => sum + j.allocatedAmount, 0);

    if (elTotal) elTotal.textContent = `Rs. ${totalBill.toLocaleString()}`;
    if (elPaid) elPaid.textContent = `Rs. ${totalPaidBefore.toLocaleString()}`;
    if (elBal) elBal.textContent = `Rs. ${totalBal.toLocaleString()}`;

    if (amountInput) {
      amountInput.value = totalAlloc;
    }

    this.updateStage();
  }

  updateStage() {
    const stageSelect = document.getElementById("invModalStageSelect");
    if (!stageSelect) return;

    const amountInput = document.getElementById("invModalAmount");
    const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    const totalBal = this.selectedJobs.reduce((sum, j) => sum + j.balanceAmount, 0);

    if (amount <= 0) {
      stageSelect.value = "Pending Payment";
    } else if (amount >= totalBal && totalBal > 0) {
      stageSelect.value = "Complete Payment";
    } else {
      stageSelect.value = "Advance Payment";
    }
  }

  updateMethodFields() {
    const container = document.getElementById("invModalMethodFields");
    if (!container) return;

    if (this.selectedMethod === "Card") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Card Brand / Type</label>
            <select id="invCardType" class="pay-select-field">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
            </select>
          </div>
          <div class="pay-field">
            <label class="pay-label">Card Last 4 Digits</label>
            <input type="text" id="invCardLast4" class="pay-input" placeholder="E.g. 4821" maxlength="4">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">POS Terminal Authorization / Approval Code</label>
          <input type="text" id="invCardAuth" class="pay-input" placeholder="POS terminal approval code">
        </div>`;
    } else if (this.selectedMethod === "Check") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cheque Number *</label>
            <input type="text" id="invCheckNo" class="pay-input" placeholder="E.g. 882019" required>
          </div>
          <div class="pay-field">
            <label class="pay-label">Bank & Branch</label>
            <input type="text" id="invCheckBank" class="pay-input" placeholder="Commercial Bank / HNB / BOC">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Cheque Date</label>
          <input type="date" id="invCheckDate" class="pay-input" value="${new Date().toISOString().split("T")[0]}">
        </div>`;
    } else if (this.selectedMethod === "Bank Transfer") {
      container.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Deposited Bank Name</label>
            <input type="text" id="invTransferBank" class="pay-input" placeholder="BOC / Sampath / Commercial">
          </div>
          <div class="pay-field">
            <label class="pay-label">Online Slip / Transfer Ref *</label>
            <input type="text" id="invTransferRef" class="pay-input" placeholder="Transaction ref #">
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="pay-field">
          <label class="pay-label">Cash Tendered (Rs.)</label>
          <input type="number" id="invCashTendered" class="pay-input" placeholder="Amount given by customer">
        </div>`;
    }
  }

  save() {
    if (this.selectedJobs.length === 0) {
      alert("Please add at least one Print Job to the invoice payment.");
      return;
    }

    const amountInput = document.getElementById("invModalAmount");
    const totalAmount = parseFloat(amountInput ? amountInput.value : 0);

    if (isNaN(totalAmount) || totalAmount < 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const primaryJob = this.selectedJobs[0];
    const primaryCustomer = primaryJob.customerName || "Customer";
    const totalBill = this.selectedJobs.reduce((sum, j) => sum + j.totalAmount, 0);
    const totalPrevPaid = this.selectedJobs.reduce((sum, j) => sum + j.paidAmount, 0);
    const totalRemainingBalance = Math.max(0, (totalBill - totalPrevPaid) - totalAmount);

    const stage = document.getElementById("invModalStageSelect")?.value || "Advance Payment";
    const payDate = document.getElementById("invModalDate")?.value || new Date().toISOString().split("T")[0];
    const notes = document.getElementById("invModalNotes")?.value.trim() || "";

    let methodRef = "";
    if (this.selectedMethod === "Card") {
      const last4 = document.getElementById("invCardLast4")?.value || "";
      const auth = document.getElementById("invCardAuth")?.value || "";
      methodRef = `Card ****${last4} (${auth})`;
    } else if (this.selectedMethod === "Check") {
      const chq = document.getElementById("invCheckNo")?.value || "";
      const bnk = document.getElementById("invCheckBank")?.value || "";
      methodRef = `Cheque #${chq} - ${bnk}`;
    } else if (this.selectedMethod === "Bank Transfer") {
      const ref = document.getElementById("invTransferRef")?.value || "";
      const bnk = document.getElementById("invTransferBank")?.value || "";
      methodRef = `FT: ${bnk} ${ref}`;
    } else {
      const tendered = document.getElementById("invCashTendered")?.value;
      methodRef = tendered ? `Cash (Tendered: Rs. ${parseFloat(tendered).toLocaleString()})` : "Direct Cash";
    }

    const paymentId = `PAY-INV-${Date.now().toString().slice(-6)}`;
    const jobIdsList = this.selectedJobs.map(j => j.id);
    const invoiceNo = this.selectedJobs.length === 1
      ? `INV-${primaryJob.id}`
      : `INV-${primaryJob.id}-${this.selectedJobs.length}J`;

    const newPayment = {
      paymentId,
      orderId: jobIdsList.join(", "),
      invoiceNo,
      customerName: primaryCustomer,
      date: payDate,
      totalBill,
      amount: totalAmount,
      balance: totalRemainingBalance,
      stage,
      method: this.selectedMethod,
      ref: methodRef,
      note: notes || (this.selectedJobs.length > 1 ? `Multi-job invoice settlement for ${this.selectedJobs.length} jobs (${jobIdsList.join(", ")})` : "Payment received"),
      jobsCount: this.selectedJobs.length,
      jobIds: jobIdsList,
      jobs: this.selectedJobs.map(j => ({
        id: j.id,
        productName: j.productName,
        total: j.totalAmount,
        paidBefore: j.paidAmount,
        allocatedNow: j.allocatedAmount,
        balanceRemaining: Math.max(0, j.balanceAmount - j.allocatedAmount)
      }))
    };

    const orderPayments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];
    orderPayments.unshift(newPayment);
    if (this.ctx.saveOrderPayments) this.ctx.saveOrderPayments();

    // Update each order in state
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    this.selectedJobs.forEach(job => {
      const matchedOrder = orders.find(o => o.id === job.id);
      if (matchedOrder) {
        matchedOrder.paidAmount = (Number(matchedOrder.paidAmount) || 0) + job.allocatedAmount;
        const orderTotal = Number(matchedOrder.totalAmount) || 0;
        const newBal = Math.max(0, orderTotal - (Number(matchedOrder.paidAmount) || 0));
        matchedOrder.balanceAmount = newBal;
        if (newBal <= 0) {
          matchedOrder.paymentStatus = "Paid";
        } else if (matchedOrder.paidAmount > 0) {
          matchedOrder.paymentStatus = "Partial";
        }
      }
    });

    if (this.ctx.saveOrders) {
      this.ctx.saveOrders(orders);
    }

    this.closeModal("modalRecordInvoicePayment");
    if (this.ctx.render) this.ctx.render();

    this.showToast(
      this.selectedJobs.length > 1
        ? `Invoice payment of Rs. ${totalAmount.toLocaleString()} recorded for ${this.selectedJobs.length} print jobs (${primaryCustomer})!`
        : `Invoice payment of Rs. ${totalAmount.toLocaleString()} recorded for ${primaryCustomer}!`
    );

    if (this.ctx.openReceiptModal) {
      this.ctx.openReceiptModal(paymentId, "invoice");
    }
  }
}
