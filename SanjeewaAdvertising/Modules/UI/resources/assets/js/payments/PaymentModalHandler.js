/**
 * SanjeewaAdvertising - Payment Modal Handler Orchestrator
 *
 * Coordinates and delegates modal operations across specialized payment modal classes:
 * - RecordPaymentModal: Settle customer invoices & supplier GRN bills
 * - ReceiptModal: View & print receipt voucher
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../core/BaseModalHandler.js";
import {
  RecordPaymentModal,
  ReceiptModal
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
  }

  // Getters & Setters for state compatibility
  get modalType() { return this.recordPaymentModal.modalType; }
  set modalType(val) { this.recordPaymentModal.modalType = val; }
  get selectedMethod() { return this.recordPaymentModal.selectedMethod; }
  set selectedMethod(val) { this.recordPaymentModal.selectedMethod = val; }

  // Record Payment Modal Delegations
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

  // Receipt Modal Delegations
  openReceiptModal(paymentId, type = "invoice") {
    this.receiptModal.openReceiptModal(paymentId, type);
  }
}

export default PaymentModalHandler;
