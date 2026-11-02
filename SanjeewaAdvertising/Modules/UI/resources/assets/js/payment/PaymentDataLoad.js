/**
 * SanjeewaAdvertising - Payment Data Load Service
 *
 * Provides compatibility and server-driven payment data loading
 * via PaymentsDataLoader & PaymentsDataService using core RequestHandler.
 * Obsolete client-side hardcoded demo data has been replaced with dynamic backend API data.
 */

"use strict";

import { PaymentsDataLoader, PaymentsDataService } from "../payments/PaymentsDataLoader.js";

export { PaymentsDataLoader, PaymentsDataService };
export class PaymentDataLoad extends PaymentsDataLoader {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Compatibility method to load data into UI context
   * @param {Object} uiContext
   */
  async loadIntoUI(uiContext) {
    await this.loadInitialData();
    if (uiContext) {
      uiContext.orders = this.orders;
      uiContext.orderPayments = this.orderPayments;
      uiContext.grnRecords = this.grnRecords;
      uiContext.grnPayments = this.grnPayments;
      uiContext.expenses = this.expenses;
      if (typeof uiContext.render === "function") {
        uiContext.render();
      }
    }
    return this;
  }
}

if (typeof window !== "undefined") {
  window.PaymentDataLoad = PaymentDataLoad;
  window.PaymentsDataLoader = PaymentsDataLoader;
  window.PaymentsDataService = PaymentsDataService;
}

export default PaymentDataLoad;
