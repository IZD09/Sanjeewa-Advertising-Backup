/**
 * SanjeewaAdvertising - Profit & Loss Statement Table Process
 *
 * Manages P&L statement table interactions.
 */

export class ProfitLossTableProcess {
  constructor(context = {}) {
    this.tableHandler = context.tableHandler;
  }

  bindEvents() {
    if (!this.tableHandler) return;
    this.tableHandler.cacheInitialRowOrder();
  }
}

export default ProfitLossTableProcess;
