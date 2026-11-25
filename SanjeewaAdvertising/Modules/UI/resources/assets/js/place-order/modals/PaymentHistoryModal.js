/**
 * SanjeewaAdvertising - Payment History Modal
 *
 * Handles installment payment history timeline & table modal (#paymentHistoryModal),
 * live API synchronization, receipt viewing triggers, and payment reversal actions.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class PaymentHistoryModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getPayments
   * @param {Object} [context.dataLoader]
   * @param {Function} [context.onPaymentReversed]
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

    this.ctx = context;
    this.currentContextOrder = null;
  }

  /**
   * Resolve MySQL Print Job integer ID from order.
   * Handles formats like "ORD-2026-1001" -> 1.
   *
   * @param {Object} order
   * @returns {number|null}
   */
  resolvePrintJobId(order) {
    if (order?.printJobId && Number(order.printJobId) > 0) {
      return Number(order.printJobId);
    }
    const raw = String(order?.id || "").trim();
    const match = raw.match(/-(\d+)$/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      return parsed > 1000 ? parsed - 1000 : parsed;
    }
    return null;
  }

  /**
   * Open Payment History modal and populate installment records.
   *
   * @param {string} orderId
   */
  async openPaymentHistoryModal(orderId) {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const order = (orders || []).find(o => String(o.id) === String(orderId));
    if (!order) return;
    this.currentContextOrder = order;

    const rawJobId = this.resolvePrintJobId(order);

    // 1. Populate Order Context Banner & Header Details
    this.populateOrderHeader(order);

    // 2. Open modal immediately
    this.openModal("paymentHistoryModal");

    // 3. Show loading state in table
    const tbody = document.getElementById("historyTableBody") || document.getElementById("phTbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">
            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px; color: #1677ff;"></i> Loading installment history...
          </td>
        </tr>
      `;
    }

    // 4. Fetch live payments from API and merge with memory state
    const orderPayments = await this.fetchPaymentsForOrder(order, rawJobId);

    // 5. Recalculate totals and render table
    this.renderPaymentTable(order, orderPayments);
  }

  /**
   * Populate top summary elements and KPI cards.
   *
   * @param {Object} order
   */
  populateOrderHeader(order) {
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt ?? "-";
    };

    setTxt("phOrderId", order.id);
    setTxt("phOrderDate", order.orderDate || "—");
    setTxt("phCustName", order.customerName || "—");
    setTxt("phCustMobile", order.customerMobile || "—");
    setTxt("phProduct", order.productName || "Printing Job");

    const specs = [
      order.width && order.height ? `${order.width} × ${order.height} ${order.unit || "ft"}` : null,
      order.quantity ? `Qty: ${order.quantity}` : null
    ].filter(Boolean).join(" • ");
    setTxt("phSpecs", specs || "Standard Specification");

    // Invoices badge
    const invNo = order.invoiceNo || (order.invoiceId ? `INV-2026-${String(order.invoiceId).padStart(4, "0")}` : null);
    const invBadge = document.getElementById("phInvoiceBadge");
    const invText = document.getElementById("phInvoiceNo");
    if (invBadge && invText) {
      if (invNo) {
        invText.textContent = invNo;
        invBadge.style.display = "inline-flex";
      } else {
        invBadge.style.display = "none";
      }
    }

    // Order status badge
    const orderStatusBadge = document.getElementById("phOrderStatus");
    if (orderStatusBadge) {
      const oStatus = String(order.orderStatus || "Pending").trim();
      const oClass = oStatus.toLowerCase().replace(/\s+/g, "-");
      orderStatusBadge.className = `status-badge ${oClass}`;
      orderStatusBadge.textContent = oStatus;
    }

    // Payment status badge
    const payStatusBadge = document.getElementById("phPaymentStatus");
    if (payStatusBadge) {
      const pStatus = String(order.paymentStatus || "Unpaid").trim();
      const pClass = pStatus.toLowerCase().replace(/\s+/g, "-");
      payStatusBadge.className = `status-badge ${pClass}`;
      payStatusBadge.textContent = pStatus;
    }

    // Financial Cards
    const total = parseFloat(order.totalAmount) || 0;
    const paid = parseFloat(order.paidAmount) || 0;
    const balance = Math.max(0, parseFloat(order.balanceAmount) || (total - paid));

    setTxt("phTotal", `Rs. ${total.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("phPaid", `Rs. ${paid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("phBalance", `Rs. ${balance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);

    const balanceElem = document.getElementById("phBalance");
    if (balanceElem) {
      balanceElem.style.color = balance <= 0.01 ? "#10b981" : "#ef4444";
      if (balance <= 0.01 && total > 0) {
        balanceElem.textContent = "Rs. 0.00 (Settled)";
      }
    }
  }

  /**
   * Fetch live payments from the backend API for this print job,
   * falling back to local memory payments.
   *
   * @param {Object} order
   * @param {number|null} rawJobId
   * @returns {Promise<Array>}
   */
  async fetchPaymentsForOrder(order, rawJobId) {
    const memoryPayments = this.ctx.getPayments ? this.ctx.getPayments() : [];
    let apiPayments = [];

    if (this.ctx.dataLoader?.http && rawJobId) {
      try {
        const endpoints = [
          `/advertising/payments?print_jobs_id=${rawJobId}`,
          `/advertising/payments/all?print_jobs_id=${rawJobId}`,
          `/payments?print_jobs_id=${rawJobId}`
        ];

        let res = null;
        for (const ep of endpoints) {
          try {
            res = await this.ctx.dataLoader.http.get(ep);
            if (res) break;
          } catch (e) {
            // try next endpoint
          }
        }

        const data = (res && res.data) ? res.data : res;
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

        if (Array.isArray(list) && list.length > 0) {
          apiPayments = list.map((item, idx) => {
            const rawAmount = parseFloat(item.amount ?? item.payment ?? 0) || 0;
            const itemDate = item.pay_date || item.paid_date || item.date || item.created_at || new Date().toISOString();
            const dateStr = typeof itemDate === "string" ? itemDate.split("T")[0] : new Date().toISOString().split("T")[0];
            const invNo = item.invoice_no || item.invoiceNo || (item.invoice_id ? `INV-2026-${String(item.invoice_id).padStart(4, "0")}` : null);
            const method = item.type?.name || item.payment_type?.payment_type || item.paid_method || item.method || "Cash";
            const status = item.status?.name || item.payment_status?.payment_status || item.status || "Paid";

            return {
              id: item.id,
              paymentId: `PAY-2026-${String(item.id).padStart(4, "0")}`,
              orderId: order.id,
              printJobId: rawJobId,
              installmentNo: idx + 1,
              date: dateStr,
              amount: rawAmount,
              method: method,
              receivedBy: item.received_by || item.receivedBy || "Admin User",
              status: status,
              invoiceNo: invNo,
              ref: item.paid_ref || item.ref || (item.id ? `RCPT-${item.id}` : "-"),
              note: item.notes || item.paid_note || item.note || ""
            };
          });
        }
      } catch (err) {
        console.warn("[PaymentHistoryModal] Could not fetch API payments, using cached payments:", err);
      }
    }

    // Filter local in-memory payments matching this order
    const localMatches = (memoryPayments || []).filter(p => {
      if (String(p.orderId) === String(order.id)) return true;
      if (rawJobId && p.printJobId && Number(p.printJobId) === Number(rawJobId)) return true;
      return false;
    });

    // Merge and deduplicate by paymentId
    const mergedMap = new Map();
    apiPayments.forEach(p => mergedMap.set(p.paymentId, p));
    localMatches.forEach(p => {
      const pid = p.paymentId || (p.id ? `PAY-2026-${String(p.id).padStart(4, "0")}` : `PAY-${Math.random()}`);
      if (!mergedMap.has(pid)) {
        mergedMap.set(pid, { ...p, paymentId: pid });
      }
    });

    const result = Array.from(mergedMap.values());
    result.sort((a, b) => {
      const numA = parseInt(String(a.paymentId).replace(/\D+/g, ""), 10) || 0;
      const numB = parseInt(String(b.paymentId).replace(/\D+/g, ""), 10) || 0;
      return numA - numB;
    });

    // Assign sequential installment numbers
    result.forEach((p, idx) => {
      p.installmentNo = idx + 1;
    });

    return result;
  }

  /**
   * Render payment rows in the modal table and setup footer actions.
   *
   * @param {Object} order
   * @param {Array} payments
   */
  renderPaymentTable(order, payments) {
    const tbody = document.getElementById("historyTableBody") || document.getElementById("phTbody");
    const instCountElem = document.getElementById("phInstCount");
    const tableSubtitle = document.getElementById("phTableSubtitle");

    // Calculate verified sum of payments
    let validPaidTotal = 0;
    const activePayments = payments.filter(p => {
      const st = String(p.status || "").toLowerCase();
      const isReversed = st === "reversed" || st === "cancelled" || st === "failed";
      if (!isReversed) {
        validPaidTotal += (parseFloat(p.amount) || 0);
        return true;
      }
      return false;
    });

    validPaidTotal = Math.round(validPaidTotal * 100) / 100;
    const totalAmount = parseFloat(order.totalAmount) || 0;
    const remainingBalance = Math.max(0, Math.round((totalAmount - validPaidTotal) * 100) / 100);

    // Update in-memory order object
    order.paidAmount = validPaidTotal;
    order.balanceAmount = remainingBalance;
    if (order.paidAmount >= totalAmount && totalAmount > 0) {
      order.paymentStatus = "Paid";
    } else if (order.paidAmount > 0 && order.balanceAmount > 0) {
      order.paymentStatus = "Partially Paid";
    } else {
      order.paymentStatus = "Unpaid";
    }

    // Refresh KPI numbers
    this.populateOrderHeader(order);

    if (instCountElem) {
      instCountElem.textContent = `${activePayments.length} Paid`;
    }
    if (tableSubtitle) {
      tableSubtitle.textContent = payments.length > 0
        ? `Showing ${payments.length} transaction${payments.length > 1 ? "s" : ""}`
        : "No records found";
    }

    if (!tbody) return;
    tbody.innerHTML = "";

    if (payments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px 16px;">
            <div style="font-size: 28px; color: var(--text-muted); opacity: 0.4; margin-bottom: 8px;">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <strong style="display: block; font-size: 13px; color: var(--text);">No Installment Payments Recorded</strong>
            <span style="font-size: 11.5px; color: var(--text-muted);">Use the 'Add Payment Installment' button below to record the first payment.</span>
          </td>
        </tr>
      `;
    } else {
      payments.forEach(p => {
        const isReversed = String(p.status || "").toLowerCase() === "reversed";
        const isFailed = String(p.status || "").toLowerCase() === "failed";
        const isSuccess = !isReversed && !isFailed;
        const amountFormatted = `Rs. ${Number(p.amount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

        let badgeClass = "paid";
        if (isReversed || isFailed) {
          badgeClass = "unpaid";
        } else if (String(p.status || "").toLowerCase() === "partial") {
          badgeClass = "partially-paid";
        }

        const methodLower = String(p.method || "cash").toLowerCase().replace(/\s+/g, "-");
        let methodIcon = "fa-money-bill-wave";
        if (methodLower.includes("card")) methodIcon = "fa-credit-card";
        else if (methodLower.includes("bank") || methodLower.includes("transfer")) methodIcon = "fa-building-columns";
        else if (methodLower.includes("cheque") || methodLower.includes("check")) methodIcon = "fa-money-check";

        const invoiceBadgeHtml = p.invoiceNo
          ? `<span style="font-size: 11px; font-weight: 700; color: #1677ff; background: rgba(22, 119, 255, 0.08); padding: 2px 7px; border-radius: 4px; border: 1px solid rgba(22, 119, 255, 0.2);"><i class="fa-solid fa-file-invoice" style="margin-right: 3px;"></i>${p.invoiceNo}</span>`
          : `<span style="color: var(--text-muted); font-size: 11px;">—</span>`;

        const tr = document.createElement("tr");
        if (isReversed) tr.className = "reversed-row";
        tr.style.opacity = isReversed ? "0.6" : "1";

        tr.innerHTML = `
          <td style="text-align: center; font-weight: 800; color: var(--text-muted); white-space: nowrap;">${p.installmentNo || "•"}</td>
          <td style="white-space: nowrap;">
            <strong style="font-family: monospace; font-size: 12px; color: #1677ff; background: rgba(22, 119, 255, 0.06); padding: 2px 6px; border-radius: 4px;">${p.paymentId}</strong>
          </td>
          <td style="white-space: nowrap;">${invoiceBadgeHtml}</td>
          <td style="font-size: 11.5px; color: var(--text); white-space: nowrap;">${p.date || "—"}</td>
          <td style="font-weight: 800; font-size: 13px; color: ${isSuccess ? '#10b981' : '#ef4444'}; font-variant-numeric: tabular-nums; white-space: nowrap;">
            ${amountFormatted}
          </td>
          <td style="white-space: nowrap;">
            <span class="pay-method-pill ${methodLower}">
              <i class="fa-solid ${methodIcon}"></i> ${p.method}
            </span>
          </td>
          <td style="white-space: nowrap;">
            <span class="status-badge ${badgeClass}">${p.status || "Paid"}</span>
          </td>
          <td style="font-size: 11px; color: var(--text-muted); white-space: nowrap;">${p.ref || "—"}</td>
          <td style="text-align: center; white-space: nowrap;">
            <div class="po-action-group" style="justify-content: center; gap: 6px; display: inline-flex; align-items: center;">
              ${isSuccess ? `
                <button type="button" class="action-btn print-action" title="Print Receipt" onclick="window.placeOrderApp?.openReceiptModal('${p.paymentId}')">
                  <i class="fa-solid fa-print"></i>
                </button>
                <button type="button" class="action-btn cancel-action" title="Reverse / Cancel Payment" onclick="window.placeOrderApp?.orderModalHandler?.paymentHistoryModal?.reversePayment('${p.paymentId}')">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              ` : `
                <span style="font-size: 10.5px; color: #ef4444; font-weight: 700;">Reversed</span>
              `}
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Setup Footer Actions
    this.setupFooterActions(order, payments);
  }

  /**
   * Configure footer shortcut buttons (Add Payment & Print Latest Receipt).
   *
   * @param {Object} order
   * @param {Array} payments
   */
  setupFooterActions(order, payments) {
    const addPaymentBtn = document.getElementById("phAddPaymentBtn");
    const printLatestBtn = document.getElementById("phPrintLatestReceiptBtn");

    if (addPaymentBtn) {
      if ((order.balanceAmount || 0) > 0.01) {
        addPaymentBtn.style.display = "inline-flex";
        addPaymentBtn.onclick = () => {
          this.closeModal("paymentHistoryModal");
          if (window.placeOrderApp?.openAddPaymentModal) {
            window.placeOrderApp.openAddPaymentModal(order.id);
          }
        };
      } else {
        addPaymentBtn.style.display = "none";
      }
    }

    if (printLatestBtn) {
      const successfulPayments = payments.filter(p => {
        const st = String(p.status || "").toLowerCase();
        return st !== "reversed" && st !== "cancelled" && st !== "failed";
      });

      if (successfulPayments.length > 0) {
        const latest = successfulPayments[successfulPayments.length - 1];
        printLatestBtn.style.display = "inline-flex";
        printLatestBtn.onclick = () => {
          if (window.placeOrderApp?.openReceiptModal) {
            window.placeOrderApp.openReceiptModal(latest.paymentId);
          }
        };
      } else {
        printLatestBtn.style.display = "none";
      }
    }
  }

  /**
   * Reverse a specific payment installment.
   *
   * @param {string} paymentId
   */
  async reversePayment(paymentId) {
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getPayments ? this.ctx.getPayments() : [];
    const p = payments.find(item => item.paymentId === paymentId);

    const confirmed = confirm(`Are you sure you want to REVERSE payment ${paymentId}? This will restore the order balance.`);
    if (!confirmed) return;

    if (p) {
      p.status = "Reversed";
      p.reversedAt = new Date().toISOString();
      if (this.ctx.dataLoader) {
        this.ctx.dataLoader.savePayments(payments);
      }
    }

    // Try backend reversal API if available
    const rawPaymentId = parseInt(String(paymentId).replace(/\D+/g, ""), 10);
    if (this.ctx.dataLoader?.http && rawPaymentId) {
      try {
        await this.ctx.dataLoader.http.patch(`/advertising/payments/${rawPaymentId}`, {
          payment_statuses_id: 4 // Reversed/Cancelled
        });
      } catch (e) {
        console.warn("[PaymentHistoryModal] Backend reversal failed, local reversal applied.");
      }
    }

    this.showToast(`Payment ${paymentId} reversed successfully.`, "info");

    if (this.currentContextOrder) {
      // Refresh current history modal view
      await this.openPaymentHistoryModal(this.currentContextOrder.id);

      // Refresh main table & KPIs
      if (window.placeOrderApp?.renderOrdersTable) {
        window.placeOrderApp.renderOrdersTable();
      }
      if (window.placeOrderApp?.updateKPIs) {
        window.placeOrderApp.updateKPIs();
      }
    }

    if (this.ctx.onPaymentReversed) {
      this.ctx.onPaymentReversed(p, this.currentContextOrder, orders, payments);
    }
  }
}

export default PaymentHistoryModal;
