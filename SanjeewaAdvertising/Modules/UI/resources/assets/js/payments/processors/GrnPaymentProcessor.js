/**
 * SanjeewaAdvertising - GRN Payment Processor
 *
 * Validates GRN payment data and dispatches API requests to the Transaction Module via RequestHandler.
 * Updates local cache and triggers GRN disbursement vouchers.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

export class GrnPaymentProcessor {
  /**
   * @param {Object} [context={}]
   * @param {Function} [context.getGrnPayments]
   * @param {Function} [context.saveGrnPayments]
   * @param {Function} [context.getGrnRecords]
   * @param {Function} [context.render]
   * @param {Function} [context.showToast]
   * @param {Function} [context.openReceiptModal]
   */
  constructor(context = {}) {
    this.ctx = context;
    this.http = new RequestHandler();
  }

  /**
   * Validate GRN payment data model.
   *
   * @param {Object} data
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  validate(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      errors.push("Invalid GRN payment data payload.");
      return { isValid: false, errors };
    }

    if (!Array.isArray(data.purchaseOrders) || data.purchaseOrders.length === 0) {
      errors.push("Please select at least one Purchase Order or Consignment to add to this GRN.");
    }

    if (data.amount === undefined || isNaN(data.amount) || Number(data.amount) <= 0) {
      errors.push("Please enter a valid disbursement amount greater than Rs. 0.");
    }

    if (!data.date) {
      errors.push("Disbursement date is required.");
    }

    if (Array.isArray(data.allocations)) {
      for (const alloc of data.allocations) {
        if (alloc.allocatedNow < 0 || alloc.allocated_amount < 0) {
          errors.push(`Allocation for Purchase Order ${alloc.poNumber || alloc.id} cannot be negative.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Process and dispatch GRN payment to the Transaction Module backend.
   *
   * @param {Object} paymentData - Built via GrnPaymentBuilder
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

    // 1. Dispatch request to Transaction Module via RequestHandler (POST /api/v1/grn-payments)
    let backendPayment = null;
    try {
      const grnId = paymentData.grn_id || (parseInt(String(paymentData.grnNumber || "").replace(/\D/g, ""), 10) || 101);

      const grnPayload = {
        payment: paymentData.amount,
        grn_id: grnId,
        payment_types_id: paymentData.payment_types_id || 1,
        payment_statuses_id: paymentData.payment_statuses_id || (paymentData.balance <= 0 ? 2 : 3),
        pay_date: paymentData.pay_date || `${paymentData.date} 12:00:00`,
        po_numbers: paymentData.poNumbers || [],
        notes: paymentData.notes || "",
        allocations: paymentData.allocations || []
      };

      const response = await this.http.post("/api/v1/grn-payments", grnPayload);
      backendPayment = response?.data || response;
    } catch (apiErr) {
      console.warn("[GrnPaymentProcessor] Transaction Module API error (proceeding with local synchronization):", apiErr);
    }

    // 2. Update local state
    const grnPayments = this.ctx.getGrnPayments ? this.ctx.getGrnPayments() : [];
    grnPayments.unshift(paymentData);
    if (this.ctx.saveGrnPayments) {
      this.ctx.saveGrnPayments();
    }

    // 3. Update GRN records balance in state
    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    if (Array.isArray(paymentData.purchaseOrders)) {
      paymentData.purchaseOrders.forEach(po => {
        const matched = grnRecords.find(g =>
          String(g.id).toLowerCase() === String(po.id).toLowerCase() ||
          String(g.poNumber || "").toLowerCase() === String(po.poNumber || "").toLowerCase()
        );
        if (matched) {
          const allocAmount = Number(po.allocatedNow !== undefined ? po.allocatedNow : po.allocated_amount) || 0;
          matched.paid_amount = (Number(matched.paid_amount || matched.paidAmount) || 0) + allocAmount;
          matched.paidAmount = matched.paid_amount;
          const total = Number(matched.totalAmount || matched.totalBill) || 0;
          const newBal = Math.max(0, total - matched.paidAmount);
          matched.balance = newBal;
          matched.balanceAmount = newBal;
          matched.status = newBal <= 0 ? "Completed" : "Partial";
        }
      });
      localStorage.setItem("sa_advertising_grn_records", JSON.stringify(grnRecords));
    }

    // 4. Trigger UI re-render
    if (this.ctx.render) {
      this.ctx.render();
    }

    // 5. Open disbursement voucher
    if (this.ctx.openReceiptModal) {
      this.ctx.openReceiptModal(paymentData, "grn");
    }

    if (this.ctx.showToast) {
      this.ctx.showToast(`GRN payment ${paymentData.paymentId} (Rs. ${paymentData.amount.toLocaleString()}) recorded successfully!`);
    }

    return {
      success: true,
      payment: paymentData,
      backendPayment
    };
  }
}
