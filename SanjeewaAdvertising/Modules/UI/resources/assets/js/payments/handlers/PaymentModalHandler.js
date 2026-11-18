/**
 * SanjeewaAdvertising - Payment Modal Handler Orchestrator
 *
 * Coordinates and delegates modal operations across specialized payment modal classes:
 * - RecordInvoicePaymentModal: Customer job order payments (#modalRecordInvoicePayment)
 * - RecordGrnPaymentModal: Stock supplier purchase disbursements (#modalRecordGrnPayment)
 * - RecordBillPaymentModal: Monthly operating utility settlements (#modalRecordBillPayment)
 * - ReceiptModal: View & print official receipt voucher (#printableReceiptModal)
 * - AddExpenseBillModal: Create new operating utility bill (#modalAddExpenseBill)
 * - MarkExpensePaidModal: Quick bill settlement dialog (#modalMarkExpensePaid)
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { ViewOrderModal } from "../../place-order/modals/ViewOrderModal.js";
import {
  ReceiptModal,
  RecordInvoicePaymentModal,
  RecordGrnPaymentModal,
  RecordBillPaymentModal,
  AddExpenseBillModal,
  MarkExpensePaidModal
} from "../modals/index.js";

export class PaymentModalHandler extends BaseModalHandler {
  /**
   * @param {Object} context
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".pay-modal-backdrop",
      toastContainerId: "poToastContainer",
      closeSelectors: [".pay-modal-close", "[data-close-pay-modal]"],
      autoBind: true
    });

    this.ctx = context;

    // Instantiate modular modal handlers
    this.receiptModal = new ReceiptModal(this.ctx);

    this.recordInvoicePaymentModal = new RecordInvoicePaymentModal({
      ...this.ctx,
      openReceiptModal: (id, type) => this.openReceiptModal(id, type)
    });

    this.recordGrnPaymentModal = new RecordGrnPaymentModal({
      ...this.ctx,
      openReceiptModal: (id, type) => this.openReceiptModal(id, type)
    });

    this.recordBillPaymentModal = new RecordBillPaymentModal({
      ...this.ctx,
      openReceiptModal: (id, type) => this.openReceiptModal(id, type)
    });

    this.addExpenseBillModal = new AddExpenseBillModal(this.ctx);
    this.markExpensePaidModal = new MarkExpensePaidModal(this.ctx);

    this.viewOrderModal = new ViewOrderModal({
      ...this.ctx,
      getOrders: () => this.ctx.getOrders ? this.ctx.getOrders() : [],
      openAddPaymentModal: (orderId) => this.openRecordInvoicePaymentModal(orderId)
    });
  }

  // View Order Modal Delegation
  openViewOrderModal(orderOrId) {
    if (this.viewOrderModal) {
      this.viewOrderModal.openViewModal(orderOrId);
    }
  }

  // Invoice Payment Modal Delegations
  openRecordInvoicePaymentModal(prefillOrderId = null) {
    this.recordInvoicePaymentModal.openRecordInvoicePaymentModal(prefillOrderId);
  }
  saveInvoicePayment() {
    this.recordInvoicePaymentModal.save();
  }

  // GRN Payment Modal Delegations
  openRecordGrnPaymentModal(prefillGrnId = null) {
    this.recordGrnPaymentModal.openRecordGrnPaymentModal(prefillGrnId);
  }
  saveGrnPayment() {
    this.recordGrnPaymentModal.save();
  }

  // Operating Bill Payment Modal Delegations
  openRecordBillPaymentModal(prefillBillId = null) {
    this.recordBillPaymentModal.openRecordBillPaymentModal(prefillBillId);
  }
  saveBillPayment() {
    this.recordBillPaymentModal.save();
  }

  // Expense Management Modals Delegations
  openAddExpenseBillModal() {
    this.addExpenseBillModal.openAddExpenseBillModal();
  }
  saveExpenseBill() {
    this.addExpenseBillModal.save();
  }

  openMarkExpensePaidModal(billId) {
    this.markExpensePaidModal.openMarkExpensePaidModal(billId);
  }
  saveMarkExpensePaid() {
    this.markExpensePaidModal.confirm();
  }
  undoExpensePaid(billId) {
    this.markExpensePaidModal.undo(billId);
  }

  // Receipt Modal Delegations
  openReceiptModal(paymentId, type = "invoice") {
    this.receiptModal.openReceiptModal(paymentId, type);
  }
  triggerPrintReceipt() {
    this.receiptModal.triggerPrintReceipt();
  }
}

export default PaymentModalHandler;

