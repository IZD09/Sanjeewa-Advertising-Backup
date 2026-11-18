/**
 * SanjeewaAdvertising - View Order Modal
 *
 * Handles 100% read-only view order modal dialog (#viewOrderModal),
 * displaying order dimensions, specifications, financials, and employee assignment.
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";

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
    this.http = new RequestHandler();
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
        const orderId = this.currentContextOrder.rawId || this.currentContextOrder.id;
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
        const orderId = this.currentContextOrder.rawId || this.currentContextOrder.id;
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
        const orderId = this.currentContextOrder.rawId || this.currentContextOrder.id;
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
   * @param {Object|string|number} orderOrId
   */
  async openViewModal(orderOrId) {
    let order = typeof orderOrId === "object" && orderOrId !== null ? { ...orderOrId } : null;
    if (!order && (typeof orderOrId === "string" || typeof orderOrId === "number")) {
      const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
      const clean = String(orderOrId).trim().toLowerCase();
      order = orders.find(o =>
        String(o.id || "").toLowerCase() === clean ||
        String(o.rawId ?? o.jobId ?? "").toLowerCase() === clean ||
        String(o.formattedId ?? "").toLowerCase() === clean ||
        String(o.orderId ?? "").toLowerCase() === clean
      );
    }

    // Render immediate details first if order found
    if (order) {
      this.currentContextOrder = order;
      this.populateFields(order);
      this.openModal("viewOrderModal");
    }

    // Attempt to enrich with fresh backend database details
    const rawId = order?.rawId || order?.job_id || order?.jobId || (typeof orderOrId === "number" ? orderOrId : (String(orderOrId).match(/\d+$/) ? Number(String(orderOrId).match(/\d+$/)[0]) : null));
    if (rawId && this.http) {
      try {
        const res = await this.http.get(`/api/v1/print-jobs/${rawId}`);
        const data = res?.data || res;
        if (data && data.id) {
          const costSum = (data.cost?.printCosts || []).reduce((acc, c) => acc + (Number(c.price) || 0), 0);
          const unitPrice = costSum > 0 ? costSum : (Number(order?.unitPrice) || 120.00);
          const width = Number(data.wtdth > 0 ? data.wtdth : (order?.width || 10));
          const height = Number(data.hight > 0 ? data.hight : (order?.height || 4));
          const qty = Number(data.qty || order?.qty || order?.quantity || 1);
          const unitSymbol = data.unit?.simble || order?.unit || "ft";

          let areaSqFt = width * height;
          if (["in", "inches"].includes(unitSymbol.toLowerCase())) areaSqFt /= 144;
          else if (["cm"].includes(unitSymbol.toLowerCase())) areaSqFt /= 929.0304;
          else if (["mm"].includes(unitSymbol.toLowerCase())) areaSqFt /= 92903.04;
          else if (["m"].includes(unitSymbol.toLowerCase())) areaSqFt *= 10.7639;

          const enriched = {
            ...(order || {}),
            id: order?.id || order?.formattedId || `ORD-2026-${1000 + Number(data.id)}`,
            formattedId: order?.formattedId || `ORD-2026-${1000 + Number(data.id)}`,
            rawId: data.id,
            jobId: data.id,
            orderDate: data.add_date ? String(data.add_date).split("T")[0] : (order?.orderDate || order?.addDate || "-"),
            customerName: data.customer?.name || order?.customerName || "Customer",
            customerMobile: data.customer?.mobile || order?.customerMobile || "",
            assignedEmployee: data.user?.full_name || order?.assignedEmployee || "Unassigned",
            deliveryMethod: data.delivery_method?.methord || order?.deliveryMethod || "Store Pickup",
            productName: data.print_type?.print_type || order?.productName || "Custom Print Product",
            width: width,
            height: height,
            unit: unitSymbol,
            quantity: qty,
            areaSqFt: areaSqFt.toFixed(2),
            unitPrice: unitPrice,
            notes: data.discription || order?.notes || "",
            orderStatus: data.current_status?.status?.print_job_states || data.current_status?.print_job_states || order?.orderStatus || order?.status || "Pending",
            requiredDate: data.due_date ? String(data.due_date).split("T")[0] : (order?.requiredDate || "Not Specified"),
            designStatus: data.status_history?.[0]?.notes || order?.designStatus || "Ready to Print"
          };
          this.currentContextOrder = enriched;
          this.populateFields(enriched);
          if (!order) {
            this.openModal("viewOrderModal");
          }
        }
      } catch (err) {
        console.warn("[ViewOrderModal] Failed to fetch print job details from API:", err);
      }
    }
  }

  /**
   * Populate modal UI DOM fields with order entity data
   * @param {Object} order
   */
  populateFields(order) {
    if (!order) return;

    const titleElem = document.getElementById("viewModalTitle");
    if (titleElem) {
      titleElem.textContent = `Order Details — ${order.id || order.formattedId || "JOB"}`;
    }

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt !== undefined && txt !== null && txt !== "" ? txt : "-";
    };

    // 1. Order Context & Identity
    setTxt("voId", order.id || order.formattedId);
    setTxt("voDate", order.orderDate || order.addDate);
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
    setTxt("voQuantity", String(order.quantity || order.qty || 1));
    setTxt("voUnitPrice", `Rs. ${Number(order.unitPrice || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voDesignStatus", order.designStatus || "Ready to Print");

    let areaVal = order.areaSqFt;
    if (!areaVal && order.width && order.height) {
      areaVal = (Number(order.width) * Number(order.height)).toFixed(2);
    }
    setTxt("voArea", areaVal ? `${Number(areaVal).toFixed(2)} sq.ft` : "—");

    // 4. Financial Breakdown
    const totalNum = Number(order.totalAmount ?? order.totalBill ?? 0);
    const paidNum = Number(order.paidAmount ?? order.paid_amount ?? 0);
    const balanceNum = Number(
      order.balanceAmount !== undefined
        ? order.balanceAmount
        : (order.balance_amount !== undefined ? order.balance_amount : Math.max(0, totalNum - paidNum))
    );

    setTxt("voTotal", `Rs. ${totalNum.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voPaid", `Rs. ${paidNum.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);
    setTxt("voBalance", `Rs. ${balanceNum.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`);

    // Status Badges
    const orderBadge = document.getElementById("voOrderStatus");
    if (orderBadge) {
      const statusSlug = String(order.orderStatus || order.status || "pending").toLowerCase().replace(/\s+/g, "-");
      orderBadge.className = `status-badge ${statusSlug}`;
      orderBadge.textContent = order.orderStatus || order.status || "Pending";
    }

    const payBadge = document.getElementById("voPaymentStatus");
    if (payBadge) {
      const paySlug = balanceNum <= 0 ? "paid" : (paidNum > 0 ? "partial" : "unpaid");
      payBadge.className = `status-badge ${paySlug}`;
      payBadge.textContent = balanceNum <= 0 ? "Paid" : (paidNum > 0 ? "Advance" : "Unpaid");
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
  }
}
