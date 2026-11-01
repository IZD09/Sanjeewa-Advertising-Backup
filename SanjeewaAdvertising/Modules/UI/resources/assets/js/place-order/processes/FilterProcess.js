/**
 * SanjeewaAdvertising - Place Order Filter Process
 *
 * Manages search keyword inputs, status dropdowns, and date filters for the orders table.
 */

export class FilterProcess {
  /**
   * @param {Object} context
   * @param {Function} context.renderTable
   */
  constructor(context) {
    this.ctx = context;

    this.searchTerm = "";
    this.statusFilter = "ALL";
    this.paymentFilter = "ALL";
    this.dateFilter = "ALL";
  }

  bindEvents() {
    const bind = (id, ev, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(ev, fn);
    };

    bind("orderSearchInput", "input", (e) => {
      this.searchTerm = e.target.value.toLowerCase().trim();
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    bind("orderFilterStatus", "change", (e) => {
      this.statusFilter = e.target.value;
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    bind("orderFilterPayment", "change", (e) => {
      this.paymentFilter = e.target.value;
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    bind("orderFilterDate", "change", (e) => {
      this.dateFilter = e.target.value;
      if (this.ctx.renderTable) this.ctx.renderTable();
    });
  }
}

