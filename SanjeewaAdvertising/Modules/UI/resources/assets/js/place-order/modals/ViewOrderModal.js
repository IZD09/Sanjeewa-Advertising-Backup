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
   * @param {Function} [context.openEditModal]
   * @param {Function} [context.openAddPaymentModal]
   * @param {Function} [context.openPaymentHistoryModal]
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

    this.bindEvents();
  }

  /**
   * Binds modal action buttons (Payment History, Add Payment, Edit Order)
   */
  bindEvents() {
    const historyBtn = document.getElementById("voBtnHistory");
    if (historyBtn) {
      historyBtn.addEventListener("click", () => {
        if (!this.currentContextOrder) return;
        const orderId = this.currentContextOrder.id;
        this.closeModal("viewOrderModal");
        if (typeof this.ctx.openPaymentHistoryModal === "function") {
          this.ctx.openPaymentHistoryModal(orderId);
        } else if (window.placeOrderApp?.orderModalHandler?.openPaymentHistoryModal) {
          window.placeOrderApp.orderModalHandler.openPaymentHistoryModal(orderId);
        }
      });
    }

    const addPaymentBtn = document.getElementById("voBtnAddPayment");
    if (addPaymentBtn) {
      addPaymentBtn.addEventListener("click", () => {
        if (!this.currentContextOrder) return;
        const orderId = this.currentContextOrder.id;
        this.closeModal("viewOrderModal");
        if (typeof this.ctx.openAddPaymentModal === "function") {
          this.ctx.openAddPaymentModal(orderId);
        } else if (window.placeOrderApp?.orderModalHandler?.openAddPaymentModal) {
          window.placeOrderApp.orderModalHandler.openAddPaymentModal(orderId);
        }
      });
    }

    const editBtn = document.getElementById("voBtnEditOrder");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        if (!this.currentContextOrder) return;
        const orderId = this.currentContextOrder.id;
        this.closeModal("viewOrderModal");
        if (typeof this.ctx.openEditModal === "function") {
          this.ctx.openEditModal(orderId);
        } else if (window.placeOrderApp?.orderModalHandler?.openEditModal) {
          window.placeOrderApp.orderModalHandler.openEditModal(orderId);
        }
      });
    }
  }

  /**
   * Populates and opens the View Order modal dialog.
   * @param {Object|string} orderOrId
   */
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
      titleElem.textContent = `Order Details — ${order.id}`;
    }

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt !== undefined && txt !== null && txt !== "" ? txt : "-";
    };

    // 1. Order Context & Identity
    setTxt("voId", order.id);
    setTxt("voDate", order.orderDate);
    setTxt("voInvoiceNo", order.invoiceNo || (order.invoiceId ? `INV-2026-${String(order.invoiceId).padStart(4, "0")}` : "No Invoice Yet"));

    // 2. Customer Details & Avatar Initials
    const custName = order.customerName || "Walk-in Customer";
    setTxt("voCustName", custName);
    setTxt("voCustMobile", order.customerMobile || "No mobile");

    const avatarEl = document.getElementById("voCustAvatar");
    if (avatarEl) {
      const nameParts = custName.trim().split(/\s+/).filter(Boolean);
      let initials = "C";
      if (nameParts.length >= 2) {
        initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        initials = nameParts[0].substring(0, 2).toUpperCase();
      }
      avatarEl.textContent = initials;
    }

    const phoneLink = document.getElementById("voCustMobileLink");
    if (phoneLink) {
      if (order.customerMobile) {
        phoneLink.href = `tel:${String(order.customerMobile).replace(/[^0-9+]/g, "")}`;
        phoneLink.style.pointerEvents = "auto";
      } else {
        phoneLink.removeAttribute("href");
        phoneLink.style.pointerEvents = "none";
      }
    }

    setTxt("voDeadline", order.requiredDate || "Not Specified");
    setTxt("voAssigned", order.assignedEmployee || "Unassigned");
    setTxt("voDeliveryMethod", order.deliveryMethod || "Store Pickup");

    // 3. Product Specifications & Sizing
    setTxt("voProduct", order.productName || "Custom Print Product");
    setTxt("voDimensions", `${order.width || 0} × ${order.height || 0} ${order.unit || "ft"}`);
    setTxt("voQuantity", String(order.quantity || 1));
    setTxt("voUnitPrice", `Rs. ${Number(order.unitPrice || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voDesignStatus", order.designStatus || "Ready to Print");

    let areaVal = order.areaSqFt;
    if (!areaVal && order.width && order.height) {
      areaVal = (Number(order.width) * Number(order.height)).toFixed(2);
    }
    setTxt("voArea", areaVal ? `${Number(areaVal).toFixed(2)} sq.ft` : "—");

    // 4. Financial Breakdown
    const totalNum = Number(order.totalAmount || 0);
    const paidNum = Number(order.paidAmount || 0);
    const balanceNum = Number(order.balanceAmount || 0);

    setTxt("voTotal", `Rs. ${totalNum.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voPaid", `Rs. ${paidNum.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voBalance", `Rs. ${balanceNum.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);

    // Status Badges
    const orderBadge = document.getElementById("voOrderStatus");
    if (orderBadge) {
      const statusSlug = String(order.orderStatus || "pending").toLowerCase().replace(/\s+/g, "-");
      orderBadge.className = `status-badge ${statusSlug}`;
      orderBadge.textContent = order.orderStatus || "Pending";
    }

    const payBadge = document.getElementById("voPaymentStatus");
    if (payBadge) {
      const paySlug = String(order.paymentStatus || "unpaid").toLowerCase().replace(/\s+/g, "-");
      payBadge.className = `status-badge ${paySlug}`;
      payBadge.textContent = order.paymentStatus || "Unpaid";
    }

    // Payment progress bar
    const progressEl = document.getElementById("voPaymentProgress");
    const percentEl = document.getElementById("voPaymentPercent");
    const pct = totalNum > 0 ? Math.min(100, Math.max(0, Math.round((paidNum / totalNum) * 100))) : 0;
    if (progressEl) {
      progressEl.style.width = `${pct}%`;
    }
    if (percentEl) {
      percentEl.textContent = `${pct}% Settled`;
    }

    // Balance highlight & Add Payment button state
    const balanceBox = document.getElementById("voBalanceBox");
    const addPaymentBtn = document.getElementById("voBtnAddPayment");
    const voBalanceEl = document.getElementById("voBalance");

    if (balanceNum <= 0) {
      if (balanceBox) {
        balanceBox.style.background = "rgba(16, 185, 129, 0.06)";
        balanceBox.style.borderColor = "rgba(16, 185, 129, 0.28)";
      }
      if (voBalanceEl) {
        voBalanceEl.style.color = "#10b981";
      }
      if (addPaymentBtn) {
        addPaymentBtn.style.display = "none";
      }
    } else {
      if (balanceBox) {
        balanceBox.style.background = "rgba(239, 68, 68, 0.06)";
        balanceBox.style.borderColor = "rgba(239, 68, 68, 0.28)";
      }
      if (voBalanceEl) {
        voBalanceEl.style.color = "#ef4444";
      }
      if (addPaymentBtn) {
        addPaymentBtn.style.display = "inline-flex";
      }
    }

    // 5. Notes / Instructions
    setTxt("voNotes", order.notes && order.notes.trim() ? order.notes : "No additional notes or instructions provided.");

    this.openModal("viewOrderModal");
  }
}
