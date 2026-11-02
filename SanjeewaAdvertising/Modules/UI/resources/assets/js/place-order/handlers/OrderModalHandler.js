/**
 * SanjeewaAdvertising - Order Modal Handler Orchestrator
 *
 * Coordinates and delegates modal operations across specialized order modal classes:
 * - OrderConfirmationModal: #orderConfirmationModal
 * - ViewOrderModal: #viewOrderModal
 * - EditOrderModal: #editOrderModal
 * - AddPaymentModal: #addPaymentModal
 * - PaymentHistoryModal: #paymentHistoryModal
 * - ReceiptModal: #receiptModal
 * - AddCustomerModal: #addCustomerModal
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import {
  OrderConfirmationModal,
  ViewOrderModal,
  EditOrderModal,
  AddPaymentModal,
  PaymentHistoryModal,
  ReceiptModal,
  AddCustomerModal
} from "../modals/index.js";

export class OrderModalHandler extends BaseModalHandler {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.options = options;

    // Sub-modal instances
    this.orderConfirmationModal = new OrderConfirmationModal(options);
    this.viewOrderModal = new ViewOrderModal(options);
    this.editOrderModal = new EditOrderModal(options);
    this.addPaymentModal = new AddPaymentModal(options);
    this.paymentHistoryModal = new PaymentHistoryModal(options);
    this.receiptModal = new ReceiptModal(options);
    this.addCustomerModal = new AddCustomerModal(options);
  }

  // Current active order context
  get currentContextOrder() {
    return this.viewOrderModal.currentContextOrder ||
           this.editOrderModal.currentContextOrder ||
           this.addPaymentModal.currentContextOrder ||
           this.paymentHistoryModal.currentContextOrder;
  }

  // 0. Order Creation Modal
  openCreateOrderModal() { this.openModal("createOrderModal"); }
  closeCreateOrderModal() { this.closeModal("createOrderModal"); }

  // 1. Order Confirmation Modal
  openOrderConfirmation() { this.orderConfirmationModal.openOrderConfirmation(); }
  saveNewOrder(orders, payments) {
    if (this.options.saveNewOrder) {
      this.options.saveNewOrder(orders, payments);
    }
  }

  // 2. View Order Modal
  openViewModal(orderOrId) { this.viewOrderModal.openViewModal(orderOrId); }

  // 3. Edit Order Modal
  openEditModal(orderOrId) { this.editOrderModal.openEditModal(orderOrId); }
  saveOrderEdit(orders) { this.editOrderModal.saveOrderEdit(orders); }

  // 4. Add Payment Modal
  openAddPaymentModal(orderId) { this.addPaymentModal.openAddPaymentModal(orderId); }
  saveNewPayment() { this.addPaymentModal.saveNewPayment(); }

  // 5. Payment History Modal
  openPaymentHistoryModal(orderId) { this.paymentHistoryModal.openPaymentHistoryModal(orderId); }
  reversePayment(paymentId) { this.paymentHistoryModal.reversePayment(paymentId); }

  // 6. Receipt Modal
  openReceiptModal(paymentId) { this.receiptModal.openReceiptModal(paymentId); }
  triggerPrintReceipt() { this.receiptModal.triggerPrintReceipt(); }

  // 7. Add Customer Modal
  openAddCustomerModal() { this.addCustomerModal.openAddCustomerModal(); }
  saveNewCustomer() { this.addCustomerModal.saveNewCustomer(); }
}

export default OrderModalHandler;

