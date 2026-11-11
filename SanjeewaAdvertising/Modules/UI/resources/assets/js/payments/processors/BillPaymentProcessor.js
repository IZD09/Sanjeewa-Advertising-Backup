/**
 * SanjeewaAdvertising - Bill Payment Processor
 *
 * Validates bill payment data and dispatches API requests to the Transaction Module via RequestHandler.
 * Updates local cache and notifies UI.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

export class BillPaymentProcessor {
  /**
   * @param {Object} [context={}]
   * @param {Function} [context.getExpenses]
   * @param {Function} [context.saveExpenses]
   * @param {Function} [context.render]
   * @param {Function} [context.showToast]
   */
  constructor(context = {}) {
    this.ctx = context;
    this.http = new RequestHandler();
  }

  /**
   * Validate bill payment data model.
   *
   * @param {Object} data
   * @returns {{ isValid: boolean, errors: string[] }}
   */
  validate(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      errors.push("Invalid bill payment data payload.");
      return { isValid: false, errors };
    }

    if (!data.billId && !data.isDirect) {
      errors.push("Please select an existing bill to settle or choose direct bill settlement.");
    }

    if (data.isDirect && !data.title) {
      errors.push("A title or utility category name is required for direct bill settlement.");
    }

    if (data.amount === undefined || isNaN(data.amount) || Number(data.amount) <= 0) {
      errors.push("Please enter a valid bill payment amount greater than Rs. 0.");
    }

    if (!data.date) {
      errors.push("Settlement date is required.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Process and dispatch bill payment to the Transaction Module backend.
   *
   * @param {Object} billData - Built via BillPaymentBuilder
   * @returns {Promise<{ success: boolean, bill?: Object, error?: string, errors?: string[] }>}
   */
  async process(billData) {
    const validation = this.validate(billData);
    if (!validation.isValid) {
      const errMsg = validation.errors.join("\n");
      if (this.ctx.showToast) {
        this.ctx.showToast(validation.errors[0], "error");
      } else {
        alert(errMsg);
      }
      return { success: false, errors: validation.errors };
    }

    // 1. Dispatch request to Transaction Module via RequestHandler (POST /api/v1/expenses)
    let backendExpense = null;
    try {
      const expensePayload = {
        expencesess_types_id: billData.expencesess_types_id || billData.typeId || 1,
        price: billData.amount,
        expencesess_statuses_id: 3, // Paid
        add_date: billData.add_date || `${billData.date} 00:00:00`,
        pay_at: billData.pay_at || `${billData.date} 12:00:00`,
        notes: billData.notes || billData.paidNote || ""
      };

      const response = await this.http.post("/api/v1/expenses", expensePayload);
      backendExpense = response?.data || response;
    } catch (apiErr) {
      console.warn("[BillPaymentProcessor] Transaction Module API error (proceeding with local synchronization):", apiErr);
    }

    // 2. Update local state
    const expenses = this.ctx.getExpenses ? this.ctx.getExpenses() : [];
    if (billData.isDirect) {
      expenses.unshift(billData);
    } else {
      const existing = expenses.find(b => b.id === billData.billId);
      if (existing) {
        existing.status = "Paid";
        existing.paidDate = billData.date;
        existing.paidAmount = billData.amount;
        existing.paidMethod = billData.method;
        existing.paidRef = billData.reference || "DIRECT-PAY";
        existing.paidNote = billData.notes || "Paid";
      } else {
        expenses.unshift(billData);
      }
    }

    if (this.ctx.saveExpenses) {
      this.ctx.saveExpenses();
    }

    // 3. Trigger UI re-render
    if (this.ctx.render) {
      this.ctx.render();
    }

    if (this.ctx.showToast) {
      this.ctx.showToast(`Operating expense "${billData.title}" (Rs. ${billData.amount.toLocaleString()}) recorded as PAID!`);
    }

    return {
      success: true,
      bill: billData,
      backendExpense
    };
  }
}
