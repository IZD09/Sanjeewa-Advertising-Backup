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

import { BaseModalHandler } from "../core/BaseModalHandler.js";
import {
  RecordPaymentModal,
  ReceiptModal,
  RecordInvoicePaymentModal,
  RecordGrnPaymentModal,
  RecordBillPaymentModal,
  AddExpenseBillModal,
  MarkExpensePaidModal
} from "./modals/index.js";

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
      ...this.ctx
    });

    this.addExpenseBillModal = new AddExpenseBillModal({
      ...this.ctx
    });

    this.markExpensePaidModal = new MarkExpensePaidModal({
      ...this.ctx
    });
  }

  // Getters & Setters for state compatibility
  get modalType() { return this.recordPaymentModal.modalType; }
  set modalType(val) { this.recordPaymentModal.modalType = val; }
  get selectedMethod() { return this.recordPaymentModal.selectedMethod; }
  set selectedMethod(val) { this.recordPaymentModal.selectedMethod = val; }

  // 1. Invoice Payment Modal Delegations
  openRecordInvoicePaymentModal(prefillOrderId = null) {
    this.recordInvoicePaymentModal.openRecordInvoicePaymentModal(prefillOrderId);
  }

  // 2. GRN Payment Modal Delegations
  openRecordGrnPaymentModal(prefillGrnId = null) {
    this.recordGrnPaymentModal.openRecordGrnPaymentModal(prefillGrnId);
  }

  // 3. Bill Payment Modal Delegations
  openRecordBillPaymentModal(billId = null) {
    this.recordBillPaymentModal.openRecordBillPaymentModal(billId);
  }

  // 4. Operating Expense Modal Delegations
  openAddExpenseBillModal() {
    this.addExpenseBillModal.openAddExpenseBillModal();
  }

  openMarkExpensePaidModal(billId) {
    this.markExpensePaidModal.openMarkExpensePaidModal(billId);
  }

  undoExpensePaid(billId) {
    this.markExpensePaidModal.undo(billId);
  }

  // 5. Dual / Unified Modal Delegations
  openRecordPaymentModal(prefillType, prefillId) {
    this.recordPaymentModal.openRecordPaymentModal(prefillType, prefillId);
  }
  updateModalReferenceDropdown(prefillId) {
    this.recordPaymentModal.updateModalReferenceDropdown(prefillId);
  }
  onReferenceSelected() {
    this.recordPaymentModal.onReferenceSelected();
  }
  onAmountChanged() {
    this.recordPaymentModal.onAmountChanged();
  }
  updateMethodFields() {
    this.recordPaymentModal.updateMethodFields();
  }
  savePayment() {
    this.recordPaymentModal.savePayment();
  }

  // 6. Receipt Modal Delegations
  openReceiptModal(paymentId, type = "invoice") {
    this.receiptModal.openReceiptModal(paymentId, type);
  }
}

export default PaymentModalHandler;
