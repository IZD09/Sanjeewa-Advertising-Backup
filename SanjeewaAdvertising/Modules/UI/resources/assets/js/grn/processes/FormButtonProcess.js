/**
 * SanjeewaAdvertising - GRN Form Button Process
 *
 * Handles button events and actions inside the GRN creation and edit form:
 * Save Draft, Complete GRN, Cancel Form, Add Item Row, Reset PO, and Supplier auto-fill.
 */

export class FormButtonProcess {
  /**
   * @param {Object} context
   * @param {Function} context.onPurchaseOrderSelect
   * @param {Function} context.clearSelectedPO
   * @param {Function} context.addNewRow
   * @param {Function} context.calculateFinancials
   * @param {Function} context.switchView
   * @param {Function} context.saveGRN
   * @param {Function} context.getSuppliers
   */
  constructor(context) {
    this.ctx = context;
  }

  bindEvents() {
    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };

    const bindInput = (id, ev, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(ev, fn);
    };

    // Purchase order select & reset
    bindInput("grnFormPOSelect", "change", (e) => {
      if (this.ctx.onPurchaseOrderSelect) this.ctx.onPurchaseOrderSelect(e.target.value);
    });

    bindClick("grnResetPoBtn", () => {
      if (this.ctx.clearSelectedPO) this.ctx.clearSelectedPO();
    });

    // Row management & financial recalculation
    bindClick("grnAddRowBtn", () => {
      if (this.ctx.addNewRow) this.ctx.addNewRow();
    });

    bindInput("grnFormDiscount", "input", () => {
      if (this.ctx.calculateFinancials) this.ctx.calculateFinancials();
    });

    // Form submission buttons
    bindClick("grnCancelFormBtn", () => {
      if (this.ctx.switchView) this.ctx.switchView("list");
    });

    bindClick("grnSaveDraftBtn", () => {
      if (this.ctx.saveGRN) this.ctx.saveGRN(false);
    });

    bindClick("grnCompleteBtn", () => {
      if (this.ctx.saveGRN) this.ctx.saveGRN(true);
    });

    // Auto-fill phone on typing/selecting supplier name
    const grnFormSupplier = document.getElementById("grnFormSupplier");
    if (grnFormSupplier) {
      const autoFillHandler = (e) => {
        const val = e.target.value.trim().toLowerCase();
        const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
        const found = suppliers.find(s => s.name.toLowerCase() === val);
        const contactInput = document.getElementById("grnFormContact");
        if (found && contactInput) {
          contactInput.value = found.phone;
        }
      };
      grnFormSupplier.addEventListener("input", autoFillHandler);
      grnFormSupplier.addEventListener("change", autoFillHandler);
    }
  }
}

