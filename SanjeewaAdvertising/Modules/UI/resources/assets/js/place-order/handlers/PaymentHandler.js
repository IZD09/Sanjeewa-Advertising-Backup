/**
 * SanjeewaAdvertising - Payment Handler
 * Handles Multiple Payment Installments workflow, Payment History,
 * Payment Reversals, and Printable Cash/Bank Receipts.
 */

export class PaymentHandler {
  /**
   * @param {Object} options
   * @param {Object} options.dataLoader
   * @param {string} options.currentUser
   * @param {Function} options.getOrders
   * @param {Function} options.getPayments
   * @param {Function} options.openModal
   * @param {Function} options.closeModal
   * @param {Function} options.showToast
   * @param {Function} options.onPaymentSaved
   * @param {Function} options.onPaymentReversed
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.currentUser = options.currentUser || "Admin User";
    this.getOrders = options.getOrders || (() => []);
    this.getPayments = options.getPayments || (() => []);
    this.openModal = options.openModal || (() => {});
    this.closeModal = options.closeModal || (() => {});
    this.showToast = options.showToast || (() => {});
    this.onPaymentSaved = options.onPaymentSaved || (() => {});
    this.onPaymentReversed = options.onPaymentReversed || (() => {});

    this.currentContextOrder = null;

    this.bindEvents();
  }

  setCurrentUser(user) {
    this.currentUser = user || "Admin User";
  }

  bindEvents() {
    const submitBtn = document.getElementById("submitAddPaymentBtn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.saveNewPayment());
    }
  }

  /**
   * Recalculate paidAmount, balanceAmount, and paymentStatus for a specific order.
   *
   * @param {string} orderId
   * @param {Array} [ordersList]
   * @param {Array} [paymentsList]
   */
  recalculateOrderTotals(orderId, ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const matchingPayments = (payments || []).filter(p => p.orderId === orderId);
    if (matchingPayments.length === 0) {
      // Do not overwrite backend calculated totals and status if no payments list is available
      return;
    }

    const validPayments = matchingPayments.filter(p => {
      const amt = parseFloat(p.amount) || 0;
      if (amt <= 0) return false;
      const st = String(p.status || "").toLowerCase().trim();
      return st !== "failed" && st !== "reversed";
    });

    const totalPaid = validPayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    const totalAmount = parseFloat(order.totalAmount) || 0;

    if (typeof order.recalculateBalance === "function") {
      order.recalculateBalance(totalPaid);
    } else {
      order.paidAmount = Math.round(totalPaid * 100) / 100;
      order.balanceAmount = Math.max(0, Math.round((totalAmount - order.paidAmount) * 100) / 100);
      if (order.paidAmount >= totalAmount && totalAmount > 0) {
        order.paymentStatus = "Paid";
      } else if (order.paidAmount > 0 && order.balanceAmount > 0) {
        order.paymentStatus = "Partially Paid";
      } else if (order.paidAmount > 0) {
        order.paymentStatus = "Partially Paid";
      } else {
        order.paymentStatus = "Unpaid";
      }
    }

    if (this.dataLoader) {
      this.dataLoader.saveOrders(orders);
    }
  }

  /**
   * Open the modal to add a new installment for an order.
   *
   * @param {string} orderId
   * @param {Array} [ordersList]
   * @param {Array} [paymentsList]
   */
  openAddPaymentModal(orderId, ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    this.recalculateOrderTotals(orderId, orders, payments);

    if (order.balanceAmount <= 0) {
      this.showToast(`Order ${orderId} is already fully paid!`, "warning");
      return;
    }

    const existingPayments = (payments || []).filter(p => p.orderId === orderId);
    const nextInstallmentNo = existingPayments.length + 1;
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : "";
    };

    setVal("pmPaymentId", paymentId);
    setVal("pmOrderId", order.id);

    const instElem = document.getElementById("pmInstallmentNo");
    if (instElem) {
      instElem.value = `Installment #${nextInstallmentNo}`;
      instElem.dataset.rawNo = String(nextInstallmentNo);
    }

    setVal("pmDate", new Date().toISOString().split("T")[0]);
    setVal("pmReceivedBy", this.currentUser);

    const balElem = document.getElementById("pmRemainingBalance");
    if (balElem) {
      balElem.textContent = `Rs. ${order.balanceAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }

    const amtInput = document.getElementById("pmAmount");
    if (amtInput) {
      amtInput.value = order.balanceAmount.toFixed(2);
      amtInput.max = String(order.balanceAmount);
    }

    setVal("pmMethod", "Cash");
    setVal("pmRef", "");
    setVal("pmNote", "");

    this.openModal("addPaymentModal");
  }

  /**
   * Save a newly submitted installment payment.
   *
   * @param {Array} [ordersList]
   * @param {Array} [paymentsList]
   */
  saveNewPayment(ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();

    if (!this.currentContextOrder) return;
    const order = this.currentContextOrder;

    const paymentId = document.getElementById("pmPaymentId")?.value;
    const instElem = document.getElementById("pmInstallmentNo");
    const installmentNo = parseInt(instElem?.dataset?.rawNo || "1", 10);
    const date = document.getElementById("pmDate")?.value || new Date().toISOString().split("T")[0];
    const amount = parseFloat(document.getElementById("pmAmount")?.value);
    const method = document.getElementById("pmMethod")?.value || "Cash";
    const ref = document.getElementById("pmRef")?.value?.trim() || "-";
    const note = document.getElementById("pmNote")?.value?.trim() || "";
    const receivedBy = document.getElementById("pmReceivedBy")?.value || this.currentUser;

    if (isNaN(amount) || amount <= 0) {
      this.showToast("Payment amount must be greater than zero", "error");
      return;
    }

    if (amount > order.balanceAmount + 0.01) {
      this.showToast(`Payment amount exceeds outstanding balance of Rs. ${order.balanceAmount.toFixed(2)}`, "error");
      return;
    }

    const newPayment = {
      paymentId,
      orderId: order.id,
      installmentNo,
      date,
      amount: Math.round(amount * 100) / 100,
      method,
      ref,
      receivedBy,
      status: "Successful",
      note
    };

    payments.unshift(newPayment);
    if (this.dataLoader) {
      this.dataLoader.savePayments(payments);
    }

    this.recalculateOrderTotals(order.id, orders, payments);

    if (this.dataLoader) {
      this.dataLoader.logAudit("ADD_PAYMENT", order.id, `Recorded Installment #${installmentNo}: Rs. ${amount} (${method})`);
    }

    this.closeModal("addPaymentModal");
    this.showToast(`Installment #${installmentNo} of Rs. ${amount.toFixed(2)} recorded successfully!`, "success");

    this.onPaymentSaved(newPayment, order, orders, payments);
    this.openReceiptModal(newPayment, order);
  }

  /**
   * Open payment history log modal for an order.
   *
   * @param {string} orderId
   * @param {Array} [ordersList]
   * @param {Array} [paymentsList]
   */
  openHistoryModal(orderId, ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    this.currentContextOrder = order;

    this.recalculateOrderTotals(orderId, orders, payments);

    const titleElem = document.getElementById("histModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> Payment History — ${order.id}`;
    }

    const infoElem = document.getElementById("histOrderInfo");
    if (infoElem) {
      infoElem.innerHTML = `${order.customerName} (${order.customerMobile}) &bull; Total: Rs. ${Number(order.totalAmount).toLocaleString("en-LK", { minimumFractionDigits: 2 })} &bull; Paid: Rs. ${Number(order.paidAmount).toLocaleString("en-LK", { minimumFractionDigits: 2 })} &bull; Balance: Rs. ${Number(order.balanceAmount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    }

    const tbody = document.getElementById("historyTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const orderPayments = (payments || [])
      .filter(p => p.orderId === orderId)
      .sort((a, b) => a.installmentNo - b.installmentNo);

    if (orderPayments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 18px;">No payments recorded for this order yet.</td></tr>`;
    } else {
      orderPayments.forEach(p => {
        const tr = document.createElement("tr");
        if (p.status === "Reversed") tr.className = "reversed-row";

        const isReversed = String(p.status || "").toLowerCase() === "reversed";
        const isFailed = String(p.status || "").toLowerCase() === "failed";
        const isSuccess = !isReversed && !isFailed && (parseFloat(p.amount) || 0) > 0;
        const statusText = String(p.status || "Pending").trim();
        let badgeClass = "paid";
        if (isReversed || isFailed) {
          badgeClass = "unpaid";
        } else if (statusText.toLowerCase() === "partial") {
          badgeClass = "partially-paid";
        }

        tr.innerHTML = `
          <td><strong>${p.paymentId}</strong></td>
          <td>#${p.installmentNo}</td>
          <td>${p.date}</td>
          <td style="font-weight: 700; color: ${isSuccess ? 'var(--green)' : 'var(--red)'};">
            Rs. ${Number(p.amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </td>
          <td>${p.method}</td>
          <td>${p.receivedBy}</td>
          <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
          <td>${p.ref || "-"}</td>
          <td>
            <div class="po-action-group">
              ${isSuccess ? `
                <button class="action-btn print-action" title="Print Receipt" onclick="window.placeOrderApp.printSpecificReceipt('${p.paymentId}')">
                  <i class="fa-solid fa-print"></i>
                </button>
                <button class="action-btn" title="Reverse Payment" style="color: var(--red);" onclick="window.placeOrderApp.reversePayment('${p.paymentId}')">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              ` : `
                <span style="font-size: 10px; color: var(--red); font-weight: 700;">${statusText}</span>
              `}
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    this.openModal("paymentHistoryModal");
  }

  /**
   * Reverse a previously made payment.
   *
   * @param {string} paymentId
   * @param {Array} [ordersList]
   * @param {Array} [paymentsList]
   */
  reversePayment(paymentId, ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();
    const payment = payments.find(p => p.paymentId === paymentId);
    if (!payment) return;

    if (!confirm(`Are you sure you want to REVERSE payment ${paymentId} (Rs. ${Number(payment.amount).toFixed(2)})? This will restore the outstanding balance.`)) {
      return;
    }

    payment.status = "Reversed";
    payment.reversedDate = new Date().toISOString();

    if (this.dataLoader) {
      this.dataLoader.savePayments(payments);
    }

    this.recalculateOrderTotals(payment.orderId, orders, payments);

    if (this.dataLoader) {
      this.dataLoader.logAudit("REVERSE_PAYMENT", payment.orderId, `Reversed payment ${paymentId} of Rs. ${payment.amount}`);
    }

    this.showToast(`Payment ${paymentId} reversed successfully. Balance recalculated.`, "warning");

    this.onPaymentReversed(payment, orders, payments);
    this.openHistoryModal(payment.orderId, orders, payments);
  }

  /**
   * Print receipt for the latest successful payment of an order.
   *
   * @param {string} orderId
   * @param {Array} [ordersList]
   * @param {Array} [paymentsList]
   */
  printLatestReceipt(orderId, ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const successfulPayments = (payments || []).filter(p => {
      if (p.orderId !== orderId) return false;
      const amt = parseFloat(p.amount) || 0;
      const st = String(p.status || "").toLowerCase();
      return amt > 0 && st !== "failed" && st !== "reversed";
    });
    if (successfulPayments.length === 0) {
      this.showToast("No successful payments found to generate receipt", "warning");
      return;
    }

    const latest = successfulPayments[0];
    this.openReceiptModal(latest, order);
  }

  /**
   * Print receipt for a specific payment ID.
   *
   * @param {string} paymentId
   * @param {Array} [ordersList]
   * @param {Array} [paymentsList]
   */
  printSpecificReceipt(paymentId, ordersList, paymentsList) {
    const orders = ordersList || this.getOrders();
    const payments = paymentsList || this.getPayments();
    const payment = payments.find(p => p.paymentId === paymentId);
    if (!payment) return;
    const order = orders.find(o => o.id === payment.orderId);
    if (!order) return;

    this.openReceiptModal(payment, order);
  }

  /**
   * Populate receipt printable template and display modal.
   *
   * @param {Object} payment
   * @param {Object} order
   */
  openReceiptModal(payment, order) {
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("rcptPaymentId", payment.paymentId);
    setTxt("rcptOrderId", order.id);
    setTxt("rcptDate", payment.date);
    setTxt("rcptCustName", order.customerName);
    setTxt("rcptCustMobile", order.customerMobile);
    setTxt("rcptProduct", `${order.productName} (${order.width} × ${order.height} ${order.unit}, Qty: ${order.quantity})`);
    setTxt("rcptInstallment", `Installment #${payment.installmentNo}`);
    setTxt("rcptMethod", `${payment.method} ${payment.ref && payment.ref !== '-' ? '(' + payment.ref + ')' : ''}`);
    setTxt("rcptReceivedBy", payment.receivedBy);

    setTxt("rcptTotalAmount", `Rs. ${Number(order.totalAmount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("rcptPaidThis", `Rs. ${Number(payment.amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("rcptRemainingBalance", `Rs. ${Number(order.balanceAmount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);

    this.openModal("receiptModal");
  }

  triggerPrintReceipt() {
    window.print();
  }
}

export default PaymentHandler;

