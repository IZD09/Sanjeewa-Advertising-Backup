/**
 * SanjeewaAdvertising - Payment Modal Handler Orchestrator
 *
 * Coordinates and delegates modal operations across specialized payment modal classes:
 * - RecordInvoicePaymentModal: Customer job order payments (#modalRecordInvoicePayment)
 * - RecordGrnPaymentModal: Stock supplier purchase disbursements (#modalRecordGrnPayment)
 * - RecordBillPaymentModal: Monthly operating utility settlements (#modalRecordBillPayment)
 * - RecordPaymentModal: Dual-channel fallback payment modal (#recordPaymentModal)
 * - ReceiptModal: View & print official receipt voucher (#printableReceiptModal)
 * - AddExpenseBillModal: Create new operating utility bill (#modalAddExpenseBill)
 * - MarkExpensePaidModal: Quick bill settlement dialog (#modalMarkExpensePaid)
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import {
  RecordPaymentModal,
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
    this.recordPaymentModal = new RecordPaymentModal({
      ...this.ctx,
      openReceiptModal: (id, type) => this.openReceiptModal(id, type)
    });

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
  }

  // Dual Fallback Modal Delegations
  openRecordPaymentModal(prefillType = "invoice", prefillId = null) {
    this.recordPaymentModal.openRecordPaymentModal(prefillType, prefillId);
  }
  savePayment() {
    this.recordPaymentModal.savePayment();
  }

  // Invoice Payment Modal Delegations
  openRecordInvoicePaymentModal(prefillOrderId = null) {
    this.recordInvoicePaymentModal.open(prefillOrderId);
  }
  saveInvoicePayment() {
    this.recordInvoicePaymentModal.save();
  }

  // GRN Payment Modal Delegations
  openRecordGrnPaymentModal(prefillGrnId = null) {
    this.recordGrnPaymentModal.open(prefillGrnId);
  }
  saveGrnPayment() {
    this.recordGrnPaymentModal.save();
  }

  // Operating Bill Payment Modal Delegations
  openRecordBillPaymentModal(prefillBillId = null) {
    this.recordBillPaymentModal.open(prefillBillId);
  }
  saveBillPayment() {
    this.recordBillPaymentModal.save();
  }

  // Expense Management Modals Delegations
  openAddExpenseBillModal() {
    this.addExpenseBillModal.open();
  }
  saveExpenseBill() {
    this.addExpenseBillModal.save();
  }

  openMarkExpensePaidModal(billId) {
    this.markExpensePaidModal.open(billId);
  }
  saveMarkExpensePaid() {
    this.markExpensePaidModal.save();
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

