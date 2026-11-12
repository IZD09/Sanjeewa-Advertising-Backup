/**
 * SanjeewaAdvertising - Order Table Handler
 *
 * Extends BaseTableLoader core class, utilizing PrintingOrderBuilder
 * to render orders data, handle filtering, pagination, and KPI calculations.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { PrintingOrderBuilder, PrintingOrder } from "../builders/PrintingOrderBuilder.js";

export class OrderTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onRecalculateTotals]
   * @param {Function} [options.onPageChange]
   */
  constructor(options = {}) {
    super({
      tbodyId: "ordersTableBody",
      paginationInfoId: "paginationInfo",
      paginationControlsId: "paginationControls",
      pageSize: 20,
      itemLabel: "orders",
      colspan: 10,
      emptyIcon: "fa-folder-open",
      emptyMessage: "No orders matching your criteria",
      onPageChange: options.onPageChange,
      rowBuilder: PrintingOrderBuilder
    });

    this.onRecalculateTotals = options.onRecalculateTotals || (() => {});
    this.sortCol = null;
    this.sortAsc = true;
    this.bindHeaderSorting();
  }

  /**
   * Attach interactive column sort click events to the table header.
   */
  bindHeaderSorting() {
    if (typeof document === "undefined") return;
    const thead = document.querySelector(".po-table thead");
    if (!thead || thead.dataset.sortBound) return;
    thead.dataset.sortBound = "true";

    thead.addEventListener("click", (e) => {
      const th = e.target.closest("th[data-sort]");
      if (!th) return;

      const col = th.getAttribute("data-sort");
      if (!col) return;

      if (this.sortCol === col) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortCol = col;
        this.sortAsc = true;
      }

      // Update header icons
      thead.querySelectorAll("th[data-sort] i").forEach(icon => {
        icon.className = "fa-solid fa-sort";
        icon.style.opacity = "0.5";
      });
      const currentIcon = th.querySelector("i");
      if (currentIcon) {
        currentIcon.className = this.sortAsc ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down";
        currentIcon.style.opacity = "1";
      }

      if (window.placeOrderApp?.renderOrdersTable) {
        window.placeOrderApp.renderOrdersTable();
      }
    });
  }

  /**
   * Filter orders array by search text, order workflow status, and payment status,
   * and apply active column sort order.
   *
   * @param {Array} orders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} paymentFilter
   * @returns {Array}
   */
  getFilteredOrders(orders = [], searchTerm = "", statusFilter = "ALL", paymentFilter = "ALL") {
    const term = (searchTerm || "").toLowerCase().trim();
    const sFilter = (statusFilter || "ALL").toLowerCase().trim();
    const pFilter = (paymentFilter || "ALL").toLowerCase().trim();

    const list = (orders || []).filter(order => {
      const matchSearch = !term ||
        (order.id && String(order.id).toLowerCase().includes(term)) ||
        (order.customerName && String(order.customerName).toLowerCase().includes(term)) ||
        (order.customerMobile && String(order.customerMobile).includes(term)) ||
        (order.productName && String(order.productName).toLowerCase().includes(term)) ||
        (order.assignedEmployee && String(order.assignedEmployee).toLowerCase().includes(term));

      const oStatus = String(order.orderStatus || "").toLowerCase().trim();
      let matchStatus = sFilter === "all" || sFilter === "";
      if (!matchStatus) {
        if (sFilter === "in progress") {
          matchStatus = ["designing", "approved", "printing", "finishing", "in progress"].includes(oStatus);
        } else {
          matchStatus = oStatus === sFilter;
        }
      }

      const oPayment = String(order.paymentStatus || "").toLowerCase().trim();
      let matchPayment = pFilter === "all" || pFilter === "";
      if (!matchPayment) {
        if (pFilter === "paid" || pFilter === "fully paid" || pFilter === "completed") {
          matchPayment = oPayment === "paid" || oPayment === "completed";
        } else if (pFilter === "partially paid" || pFilter === "partial") {
          matchPayment = oPayment === "partially paid" || oPayment === "partial";
        } else if (pFilter === "unpaid" || pFilter === "pending") {
          matchPayment = oPayment === "unpaid" || oPayment === "pending";
        } else {
          matchPayment = oPayment === pFilter;
        }
      }

      return matchSearch && matchStatus && matchPayment;
    });

    if (this.sortCol) {
      list.sort((a, b) => {
        let valA = a[this.sortCol] ?? "";
        let valB = b[this.sortCol] ?? "";

        if (this.sortCol === "id") {
          const numA = parseInt(String(valA).replace(/\D+/g, ""), 10) || 0;
          const numB = parseInt(String(valB).replace(/\D+/g, ""), 10) || 0;
          return this.sortAsc ? numA - numB : numB - numA;
        }

        if (this.sortCol === "totalAmount" || this.sortCol === "paidAmount" || this.sortCol === "quantity") {
          const numA = parseFloat(valA) || 0;
          const numB = parseFloat(valB) || 0;
          return this.sortAsc ? numA - numB : numB - numA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
    }

    return list;
  }

  /**
   * Render orders table body rows and pagination.
   *
   * @param {Array} orders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} paymentFilter
   * @param {number} currentPage
   * @param {number} pageSize
   */
  render(orders = [], searchTerm = "", statusFilter = "ALL", paymentFilter = "ALL", currentPage = 1, pageSize = 20) {
    this.currentPage = currentPage;
    this.pageSize = pageSize;

    const filtered = this.getFilteredOrders(orders, searchTerm, statusFilter, paymentFilter);

    // Delegate row rendering & pagination to BaseTableLoader
    this.loadTable(filtered, (item) => {
      this.onRecalculateTotals(item.id);
      const order = item instanceof PrintingOrder
        ? item
        : new PrintingOrderBuilder(item).build();
      return order.render();
    }, currentPage, pageSize);

    this.updateKPIs(orders);
  }

  /**
   * Custom pagination summary text for orders.
   */
  renderPagination(totalCount, totalPages, currentPage, pageSize) {
    super.renderPagination(totalCount, totalPages, currentPage, pageSize);
    const infoElem = document.getElementById(this.paginationInfoId);
    if (infoElem && totalCount > 0) {
      const start = (currentPage - 1) * pageSize + 1;
      const end = Math.min(currentPage * pageSize, totalCount);
      infoElem.textContent = `Showing ${start}-${end} of ${totalCount} orders`;
    } else if (infoElem) {
      infoElem.textContent = "Showing 0 orders";
    }
  }

  /**
   * Update top-level statistical metrics (KPI cards) based on current orders.
   *
   * @param {Array} orders
   */
  updateKPIs(orders = []) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "In Progress").length;

    const totalRevenue = orders.reduce((sum, o) => {
      return sum + (parseFloat(o.totalAmount) || 0);
    }, 0);

    const outstandingBalance = orders.reduce((sum, o) => {
      return sum + (parseFloat(o.balanceAmount) || 0);
    }, 0);

    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setTxt("kpiTotalOrders", String(totalOrders));
    setTxt("kpiPendingOrders", String(pendingOrders));
    setTxt("kpiTotalRevenue", `Rs. ${totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`);
    setTxt("kpiOutstandingBalance", `Rs. ${outstandingBalance.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`);
  }
}

export default OrderTableHandler;

