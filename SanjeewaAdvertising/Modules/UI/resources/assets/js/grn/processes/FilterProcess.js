/**
 * SanjeewaAdvertising - GRN Filter Process
 *
 * Manages search keyword inputs, dropdown filters,
 * and filtered rendering for GRN records, Purchase Orders, and Suppliers.
 */

export class FilterProcess {
  /**
   * @param {Object} context
   * @param {Function} context.renderTable
   * @param {Function} context.renderPOTable
   * @param {Function} context.renderSuppliersGrid
   */
  constructor(context) {
    this.ctx = context;

    // Filter states
    this.searchTerm = "";
    this.statusFilter = "ALL";
    this.supplierFilter = "ALL";

    this.poSearchTerm = "";
    this.poSupplierFilter = "ALL";
    this.poStatusFilter = "ALL";

    this.supplierSearchTerm = "";
    this.supplierCategoryFilter = "ALL";
  }

  bindEvents() {
    const bind = (id, ev, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(ev, fn);
    };

    // GRN List Filters
    bind("grnSearchInput", "input", (e) => {
      this.searchTerm = e.target.value.trim().toLowerCase();
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    bind("grnStatusFilter", "change", (e) => {
      this.statusFilter = e.target.value;
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    bind("grnSupplierFilter", "change", (e) => {
      this.supplierFilter = e.target.value;
      if (this.ctx.renderTable) this.ctx.renderTable();
    });

    // PO List Filters
    bind("poSearchInput", "input", (e) => {
      this.poSearchTerm = e.target.value.trim().toLowerCase();
      if (this.ctx.renderPOTable) this.ctx.renderPOTable();
    });

    bind("poSupplierFilter", "change", (e) => {
      this.poSupplierFilter = e.target.value;
      if (this.ctx.renderPOTable) this.ctx.renderPOTable();
    });

    bind("poStatusFilter", "change", (e) => {
      this.poStatusFilter = e.target.value;
      if (this.ctx.renderPOTable) this.ctx.renderPOTable();
    });

    // Suppliers Grid Filters
    bind("supplierSearchInput", "input", (e) => {
      this.supplierSearchTerm = e.target.value.trim().toLowerCase();
      if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();
    });

    bind("supplierCategoryFilter", "change", (e) => {
      this.supplierCategoryFilter = e.target.value;
      if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();
    });
  }
}

