/**
 * SanjeewaAdvertising - Invoice Payment Processor
 *
 * Validates invoice payment data and dispatches API requests to the Invoice Module via RequestHandler.
 * Updates local cache and triggers payment vouchers.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

export class InvoicePaymentProcessor {
  /**
   * @param {Object} [context={}]
   * @param {Function} [context.getOrderPayments]
   * @param {Function} [context.saveOrderPayments]
   * @param {Function} [context.getOrders]
   * @param {Function} [context.saveOrders]
   * @param {Function} [context.render]
   * @param {Function} [context.showToast]
   * @param {Function} [context.openReceiptModal]
   */
  constructor(context = {}) {
    this.ctx = context;
    this.http = new RequestHandler();
  }

  /**
   * Validate invoice payment data model.
   *
   * @param {Object} data
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  validate(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      errors.push("Invalid invoice payment data payload.");
      return { isValid: false, errors };
    }

    if (!Array.isArray(data.jobs) || data.jobs.length === 0) {
      errors.push("Please select at least one Print Job to add to this invoice.");
    }

    if (data.amount === undefined || isNaN(data.amount) || Number(data.amount) < 0) {
      errors.push("Please enter a valid payment amount (Rs. 0 or greater).");
    }

    if (!data.customerId && !data.customer_id) {
      errors.push("A customer is required to record an invoice.");
    }

    if (!data.date) {
      errors.push("Invoice payment settlement date is required.");
    }

    if (Array.isArray(data.allocations)) {
      for (const alloc of data.allocations) {
        if (alloc.allocatedNow < 0 || alloc.allocated_amount < 0) {
          errors.push(`Allocation for Print Job ${alloc.id || alloc.job_id} cannot be negative.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Process and dispatch invoice payment to the Invoice Module backend.
   *
   * @param {Object} paymentData - Built via InvoicePaymentBuilder
   * @returns {Promise<{ success: boolean, payment?: Object, error?: string, errors?: string[] }>}
   */
  async process(paymentData) {
    const validation = this.validate(paymentData);
    if (!validation.isValid) {
      const errMsg = validation.errors.join("\n");
      if (this.ctx.showToast) {
        this.ctx.showToast(validation.errors[0], "error");
      } else {
        alert(errMsg);
      }
      return { success: false, errors: validation.errors };
    }

    // 1. Dispatch request to Invoice Module via RequestHandler (POST /advertising/invoices)
    let backendInvoice = null;
    try {
      const rawCustId = paymentData.customer_id || paymentData.customerId;
      const cleanCustId = parseInt(String(rawCustId).replace(/\D/g, ""), 10) || 1;
      
      const resolveId = (val) => {
        if (typeof val === "number" && val > 0) return val;
        const str = String(val || "");
        const m = str.match(/ORD-\d{4}-(\d+)/i);
        if (m) {
          const num = parseInt(m[1], 10);
          return num > 1000 ? num - 1000 : num;
        }
        const digits = parseInt(str.replace(/\D/g, ""), 10);
        if (digits > 1000) return digits - 1000;
        return digits > 0 ? digits : 1;
      };

      const cleanJobIds = (paymentData.print_job_ids || []).map(id => resolveId(id)).filter(id => id > 0);

      const invoicePayload = {
        customer_id: cleanCustId,
        invoice_at: paymentData.invoice_at || `${paymentData.date} 12:00:00`,
        due_date: `${paymentData.date} 23:59:59`,
        print_job_ids: cleanJobIds,
        payment_amount: Number(paymentData.amount) || 0,
        payment_types_id: parseInt(paymentData.payment_types_id, 10) || 1,
        payment_statuses_id: parseInt(paymentData.payment_statuses_id, 10) || (paymentData.balance <= 0 ? 2 : 3),
        stage: paymentData.stage,
        notes: paymentData.notes,
        allocations: (paymentData.allocations || []).map(a => {
          return {
            job_id: resolveId(a.job_id || a.id),
            allocated_amount: Number(a.allocatedNow !== undefined ? a.allocatedNow : a.allocated_amount) || 0
          };
        })
      };

      const response = await this.http.post("/advertising/invoices", invoicePayload);
      backendInvoice = response?.data || response;
    } catch (apiErr) {
      console.warn("[InvoicePaymentProcessor] Invoice Module API error (proceeding with local synchronization):", apiErr);
    }

    // 2. Update local state
    const orderPayments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];
    orderPayments.unshift(paymentData);
    if (this.ctx.saveOrderPayments) {
      this.ctx.saveOrderPayments();
    }

    // 3. Update orders balances in state
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    if (Array.isArray(paymentData.jobs)) {
      paymentData.jobs.forEach(job => {
        const matched = orders.find(o =>
          (job.rawId && Number(o.rawId) === Number(job.rawId)) ||
          String(o.id).toLowerCase() === String(job.id).toLowerCase()
        );
        if (matched) {
          const allocAmount = Number(job.allocatedNow !== undefined ? job.allocatedNow : job.allocated_amount) || 0;
          matched.paidAmount = (Number(matched.paidAmount) || 0) + allocAmount;
          const orderTotal = Number(matched.totalAmount) || 0;
          const newBal = Math.max(0, orderTotal - (Number(matched.paidAmount) || 0));
          matched.balanceAmount = newBal;
          matched.paymentStatus = newBal <= 0 ? "Paid" : (matched.paidAmount > 0 ? "Partial" : "Unpaid");
        }
      });
      if (this.ctx.saveOrders) {
        this.ctx.saveOrders(orders);
      }
    }

    // 4. Trigger live server sync & UI re-render
    if (this.ctx.refreshInvoiceData) {
      await this.ctx.refreshInvoiceData();
    } else if (this.ctx.render) {
      this.ctx.render();
    }

    // 5. Open receipt voucher if callback provided
    if (this.ctx.openReceiptModal) {
      this.ctx.openReceiptModal(paymentData, "invoice");
    }

    if (this.ctx.showToast) {
      this.ctx.showToast(`Invoice payment ${paymentData.invoiceNo} (Rs. ${paymentData.amount.toLocaleString()}) recorded successfully!`);
    }

    return {
      success: true,
      payment: paymentData,
      backendInvoice
    };
  }
}
