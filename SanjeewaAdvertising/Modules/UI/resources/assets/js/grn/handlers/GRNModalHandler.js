/**
 * SanjeewaAdvertising - GRN Modal Handler Orchestrator
 *
 * Coordinates and delegates modal dialog operations across specialized modal classes:
 * - ViewGRNModal: View/Print GRN voucher
 * - ViewPOModal: View/Print PO document & GRN generation
 * - CreatePOModal: Dynamic PO creation, item lines & totals
 * - SupplierModal: Supplier registration & edit dialog
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import {
  ViewGRNModal,
  ViewPOModal,
  CreatePOModal,
  CreateGrnModal,
  SupplierModal
} from "../modals/index.js";

export class GRNModalHandler extends BaseModalHandler {
  /**
   * @param {Object} context
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-grn-modal]", "[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;

    // Instantiate modular modal handlers
    this.viewGrnModal = new ViewGRNModal(this.ctx);
    this.viewPoModal = new ViewPOModal(this.ctx);
    this.createPoModal = new CreatePOModal(this.ctx);
    this.createGrnModal = new CreateGrnModal(this.ctx);
    this.supplierModal = new SupplierModal(this.ctx);
  }

  // Active context & state getters
  get activeGrnContext() { return this.viewGrnModal.activeGrnContext; }
  get activePoContext() { return this.viewPoModal.activePoContext; }
  get newPoItems() { return this.createPoModal.newPoItems; }
  set newPoItems(val) { this.createPoModal.newPoItems = val; }

  // 1. View & Print GRN Modal
  viewGRN(grnNumber) { this.viewGrnModal.viewGRN(grnNumber); }
  triggerPrintGrn() { this.viewGrnModal.triggerPrintGrn(); }

  // 2. View & Print PO Modal
  viewPO(poNumber) { this.viewPoModal.viewPO(poNumber); }
  triggerPrintPO() { this.viewPoModal.triggerPrintPO(); }

  // 3. Create GRN Modal
  openCreateGrnModal(targetPoNumber = null) { this.createGrnModal.openCreateGrnModal(targetPoNumber); }

  // 4. Create PO Modal
  openCreatePOModal(defaultSupplier = null) { this.createPoModal.openCreatePOModal(defaultSupplier); }
  addNewPoRow() { this.createPoModal.addNewPoRow(); }
  addItemToPo(item) { this.createPoModal.addItemToPo(item); }
  removeNewPoRow(index) { this.createPoModal.removeNewPoRow(index); }
  renderNewPoItems() { this.createPoModal.renderNewPoItems(); }
  onNewPoItemSelectChange(index, code) { this.createPoModal.onNewPoItemSelectChange(index, code); }
  onNewPoQtyChange(index, qty) { this.createPoModal.onNewPoQtyChange(index, qty); }
  onNewPoCostChange(index, cost) { this.createPoModal.onNewPoCostChange(index, cost); }
  renderNewPoRowTotal(index) { this.createPoModal.renderNewPoRowTotal(index); }
  calculateNewPoTotal() { return this.createPoModal.calculateNewPoTotal(); }
  saveNewPurchaseOrder() { this.createPoModal.saveNewPurchaseOrder(); }

  // 4. Supplier Register & Edit Modal
  openRegisterSupplierModal(caller = null, code = null) { this.supplierModal.openRegisterSupplierModal(caller, code); }
  openEditSupplierModal(code) { this.supplierModal.openEditSupplierModal(code); }
  saveNewSupplier() { this.supplierModal.saveNewSupplier(); }

  // 5. CSV Export utility
  exportCSV() {
    const grnRecords = this.ctx.getGrnRecords ? this.ctx.getGrnRecords() : [];
    if (!grnRecords || grnRecords.length === 0) {
      this.showToast("No GRN records available to export", "warning");
      return;
    }

    const headers = ["GRN Number", "Purchase Order", "Supplier", "Supplier Contact", "Received Date", "Items Count", "Sub Total (LKR)", "Discount (LKR)", "Net Total (LKR)", "Received By", "Status"];
    const rows = grnRecords.map(r => [
      `"${r.grn_number}"`,
      `"${r.purchase_order_no || ''}"`,
      `"${r.supplier_name}"`,
      `"${r.supplier_contact || r.supplier_invoice_no || ''}"`,
      r.received_date,
      r.items ? r.items.length : 0,
      r.sub_total.toFixed(2),
      (r.discount || 0).toFixed(2),
      r.net_total.toFixed(2),
      `"${r.received_by}"`,
      `"${r.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Sanjeewa_GRN_Records_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    this.showToast("GRN records CSV exported successfully!", "success");
  }
}

export default GRNModalHandler;

