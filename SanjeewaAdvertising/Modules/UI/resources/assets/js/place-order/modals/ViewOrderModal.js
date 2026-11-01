/**
 * SanjeewaAdvertising - View Order Modal
 *
 * Handles 100% read-only view order modal dialog (#viewOrderModal),
 * displaying order dimensions, specifications, financials, and employee assignment.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";

export class ViewOrderModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;
    this.currentContextOrder = null;
  }

  openViewModal(orderOrId) {
    let order = orderOrId;
    if (typeof orderOrId === "string") {
      const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
      order = orders.find(o => o.id === orderOrId);
    }
    if (!order) return;
    this.currentContextOrder = order;

    const titleElem = document.getElementById("viewModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-file-invoice"></i> Order Details — ${order.id}`;
    }

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("voId", order.id);
    setTxt("voDate", order.orderDate);
    setTxt("voCustName", order.customerName);
    setTxt("voCustMobile", order.customerMobile);
    setTxt("voProduct", order.productName);
    setTxt("voDimensions", `${order.width} × ${order.height} ${order.unit}`);
    setTxt("voQuantity", String(order.quantity));
    setTxt("voUnitPrice", `Rs. ${Number(order.unitPrice || 0).toFixed(2)}`);
    setTxt("voTotal", `Rs. ${Number(order.totalAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voPaid", `Rs. ${Number(order.paidAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voBalance", `Rs. ${Number(order.balanceAmount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voPaymentStatus", order.paymentStatus);
    setTxt("voDeadline", order.requiredDate);
    setTxt("voOrderStatus", order.orderStatus);
    setTxt("voAssigned", order.assignedEmployee || "Unassigned");

    this.openModal("viewOrderModal");
  }
}

