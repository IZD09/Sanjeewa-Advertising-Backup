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
      pageSize: 8,
      colspan: 10,
      emptyIcon: "fa-folder-open",
      emptyMessage: "No orders matching your criteria",
      onPageChange: options.onPageChange,
      rowBuilder: PrintingOrderBuilder
    });

    this.onRecalculateTotals = options.onRecalculateTotals || (() => {});
  }

  /**
   * Filter orders array by search text, order workflow status, and payment status.
   *
   * @param {Array} orders
   * @param {string} searchTerm
   * @param {string} statusFilter
   * @param {string} paymentFilter
   * @returns {Array}
   */
  getFilteredOrders(orders = [], searchTerm = "", statusFilter = "ALL", paymentFilter = "ALL") {
    const term = (searchTerm || "").toLowerCase().trim();

    return (orders || []).filter(order => {
      const matchSearch = !term ||
        (order.id && order.id.toLowerCase().includes(term)) ||
        (order.customerName && order.customerName.toLowerCase().includes(term)) ||
        (order.customerMobile && order.customerMobile.includes(term)) ||
        (order.productName && order.productName.toLowerCase().includes(term)) ||
        (order.assignedEmployee && order.assignedEmployee.toLowerCase().includes(term));

      const matchStatus = statusFilter === "ALL" || order.orderStatus === statusFilter;
      const matchPayment = paymentFilter === "ALL" || order.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
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
  render(orders = [], searchTerm = "", statusFilter = "ALL", paymentFilter = "ALL", currentPage = 1, pageSize = 8) {
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

