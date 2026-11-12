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
    const bind = (ids, evs, fn) => {
      const idList = Array.isArray(ids) ? ids : [ids];
      const evList = Array.isArray(evs) ? evs : [evs];
      idList.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          evList.forEach(ev => el.addEventListener(ev, fn));
        }
      });
    };

    // 1. Search keyword input (live filtering on type)
    bind(["orderSearchInput"], ["input", "keyup"], (e) => {
      this.searchTerm = e.target.value.toLowerCase().trim();
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    // 2. Order Workflow Status filter dropdown (supports both orderStatusFilter and orderFilterStatus)
    bind(["orderStatusFilter", "orderFilterStatus"], ["change", "input"], (e) => {
      this.statusFilter = e.target.value || "ALL";
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    // 3. Order Payment Status filter dropdown (supports both orderPaymentFilter and orderFilterPayment)
    bind(["orderPaymentFilter", "orderFilterPayment"], ["change", "input"], (e) => {
      this.paymentFilter = e.target.value || "ALL";
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    // 4. Date filter if available
    bind(["orderDateFilter", "orderFilterDate"], ["change", "input"], (e) => {
      this.dateFilter = e.target.value || "ALL";
      if (this.ctx.renderTable) this.ctx.renderTable();
    });
  }

  /**
   * Dynamically populate status filter dropdown options from backend database statuses.
   *
   * @param {Array} statuses
   */
  populateStatuses(statuses = []) {
    const el = document.getElementById("orderStatusFilter") || document.getElementById("orderFilterStatus");
    if (!el || !Array.isArray(statuses) || statuses.length === 0) return;

    const currentVal = el.value || "ALL";
    const existing = new Set(Array.from(el.options).map(o => o.value.toLowerCase()));

    statuses.forEach(st => {
      const name = st.name || st.print_job_states;
      if (name && !existing.has(name.toLowerCase())) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        el.appendChild(opt);
        existing.add(name.toLowerCase());
      }
    });

    el.value = currentVal;
  }
}

export default FilterProcess;

