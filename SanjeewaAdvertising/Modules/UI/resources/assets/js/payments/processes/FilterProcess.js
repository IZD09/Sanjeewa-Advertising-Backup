/**
 * SanjeewaAdvertising - Payments Filter Process
 *
 * Manages search keyword inputs, status dropdowns, payment method filters,
 * and filter reset actions for both Invoice Payments and GRN Payments.
 */

export class FilterProcess {
  /**
   * @param {Object} context
   * @param {Function} context.renderInvoiceTable
   * @param {Function} context.renderGrnTable
   */
  constructor(context) {
    this.ctx = context;

    // Filters for Invoice Payments
    this.invoiceSearch = "";
    this.invoiceStatusFilter = "ALL";
    this.invoiceMethodFilter = "ALL";

    // Filters for GRN Payments
    this.grnSearch = "";
    this.grnStatusFilter = "ALL";
    this.grnMethodFilter = "ALL";
  }

  bindEvents() {
    // 1. Invoice Filters
    const invSearch = document.getElementById("payInvoiceSearch");
    if (invSearch) {
      invSearch.addEventListener("input", (e) => {
        this.invoiceSearch = e.target.value.toLowerCase().trim();
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    const invStatus = document.getElementById("payInvoiceStatusFilter");
    if (invStatus) {
      invStatus.addEventListener("change", (e) => {
        this.invoiceStatusFilter = e.target.value;
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    const invMethod = document.getElementById("payInvoiceMethodFilter");
    if (invMethod) {
      invMethod.addEventListener("change", (e) => {
        this.invoiceMethodFilter = e.target.value;
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    const invReset = document.getElementById("payInvoiceResetFilters");
    if (invReset) {
      invReset.addEventListener("click", () => {
        this.invoiceSearch = "";
        this.invoiceStatusFilter = "ALL";
        this.invoiceMethodFilter = "ALL";
        if (invSearch) invSearch.value = "";
        if (invStatus) invStatus.value = "ALL";
        if (invMethod) invMethod.value = "ALL";
        if (this.ctx.renderInvoiceTable) this.ctx.renderInvoiceTable();
      });
    }

    // 2. GRN Filters
    const grnSearch = document.getElementById("payGrnSearch");
    if (grnSearch) {
      grnSearch.addEventListener("input", (e) => {
        this.grnSearch = e.target.value.toLowerCase().trim();
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }

    const grnStatus = document.getElementById("payGrnStatusFilter");
    if (grnStatus) {
      grnStatus.addEventListener("change", (e) => {
        this.grnStatusFilter = e.target.value;
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }

    const grnMethod = document.getElementById("payGrnMethodFilter");
    if (grnMethod) {
      grnMethod.addEventListener("change", (e) => {
        this.grnMethodFilter = e.target.value;
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }

    const grnReset = document.getElementById("payGrnResetFilters");
    if (grnReset) {
      grnReset.addEventListener("click", () => {
        this.grnSearch = "";
        this.grnStatusFilter = "ALL";
        this.grnMethodFilter = "ALL";
        if (grnSearch) grnSearch.value = "";
        if (grnStatus) grnStatus.value = "ALL";
        if (grnMethod) grnMethod.value = "ALL";
        if (this.ctx.renderGrnTable) this.ctx.renderGrnTable();
      });
    }
  }
}

