/**
 * SanjeewaAdvertising - Payments Data Loader
 *
 * Extends PaymentsDataService, providing compatibility methods for
 * invoice payments, GRN supplier payments, and operating expenses.
 * Data is dynamically fetched from backend API endpoints via RequestHandler.
 */

import { PaymentsDataService } from "./PaymentsDataService.js";

export class PaymentsDataLoader extends PaymentsDataService {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Universal initial loader that triggers the 3 API requests via RequestHandler.
   * @returns {Promise<{orders: Array, orderPayments: Array, grnRecords: Array, grnPayments: Array, expenses: Array}>}
   */
  async loadInitialData() {
    await Promise.allSettled([
      this.loadInvoicePayments(),
      this.loadGrnPayments(),
      this.loadOperatingExpenses()
    ]);

    return {
      orders: this.orders,
      orderPayments: this.orderPayments,
      grnRecords: this.grnRecords,
      grnPayments: this.grnPayments,
      expenses: this.expenses
    };
  }

  seedDefaultOrders() {
    this.saveOrders(this.orders);
    return this.orders;
  }

  enrichOrderPayments() {
    this.saveOrderPayments();
    return this.orderPayments;
  }

  seedDefaultGrnPayments() {
    this.saveGrnPayments();
    return this.grnPayments;
  }

  seedDefaultOperatingExpenses() {
    this.saveExpenses();
    return this.expenses;
  }
}

export const PaymentDataLoad = PaymentsDataLoader;
export default PaymentsDataLoader;
