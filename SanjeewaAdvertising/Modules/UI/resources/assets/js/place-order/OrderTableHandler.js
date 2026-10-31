/**
 * SanjeewaAdvertising - Order Table Handler
 * Renders the main orders data table utilizing PrintingOrder fluent builder,
 * handles multi-parameter filtering, pagination, and KPI counter calculations.
 */

import { PrintingOrder } from "./PrintingOrder.js";

export class OrderTableHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onRecalculateTotals]
   * @param {Function} [options.onPageChange]
   */
  constructor(options = {}) {
    this.onRecalculateTotals = options.onRecalculateTotals || (() => {});
    this.onPageChange = options.onPageChange || (() => {});
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
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    const filtered = this.getFilteredOrders(orders, searchTerm, statusFilter, paymentFilter);
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const activePage = Math.min(currentPage, totalPages);

    const start = (activePage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13">
            <div class="po-empty-state">
              <i class="fa-solid fa-folder-open"></i>
              <p>No orders matching your criteria</p>
            </div>
          </td>
        </tr>
      `;
      this.renderPagination(0, 1, 1, pageSize);
      return;
    }

    pageItems.forEach(item => {
      // Recalculate order totals for accurate payment balance
      this.onRecalculateTotals(item.id);

      // Fluent Chaining Builder Pattern using PrintingOrder class
      const tr = new PrintingOrder()
        .setId(item.id)
        .setOrderDate(item.orderDate)
        .setCustomerId(item.customerId)
        .setCustomerName(item.customerName)
        .setCustomerMobile(item.customerMobile)
        .setProductKey(item.productKey)
        .setProductName(item.productName)
        .setWidth(item.width)
        .setHeight(item.height)
        .setUnit(item.unit)
        .setQuantity(item.quantity)
        .setAreaSqFt(item.areaSqFt)
        .setUnitPrice(item.unitPrice)
        .setDesignStatus(item.designStatus)
        .setDeliveryMethod(item.deliveryMethod)
        .setRequiredDate(item.requiredDate)
        .setTotalAmount(item.totalAmount)
        .setPaidAmount(item.paidAmount)
        .setBalanceAmount(item.balanceAmount)
        .setPaymentStatus(item.paymentStatus)
        .setOrderStatus(item.orderStatus)
        .setAssignedEmployee(item.assignedEmployee)
        .setNotes(item.notes)
        .render();

      tbody.appendChild(tr);
    });

    this.renderPagination(total, totalPages, activePage, pageSize);
    this.updateKPIs(orders);
  }

  /**
   * Render pagination summary and page number buttons.
   *
   * @param {number} totalCount
   * @param {number} totalPages
   * @param {number} currentPage
   * @param {number} pageSize
   */
  renderPagination(totalCount, totalPages, currentPage, pageSize) {
    const infoElem = document.getElementById("paginationInfo");
    const controlsElem = document.getElementById("paginationControls");
    if (!infoElem || !controlsElem) return;

    if (totalCount === 0) {
      infoElem.textContent = "Showing 0 orders";
      controlsElem.innerHTML = "";
      return;
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    infoElem.textContent = `Showing ${start}-${end} of ${totalCount} orders`;

    controlsElem.innerHTML = "";

    // Prev Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn";
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        this.onPageChange(currentPage - 1);
      }
    });
    controlsElem.appendChild(prevBtn);

    // Number Buttons
    for (let p = 1; p <= totalPages; p++) {
      const pBtn = document.createElement("button");
      pBtn.className = `page-btn ${p === currentPage ? "active" : ""}`;
      pBtn.textContent = String(p);
      pBtn.addEventListener("click", () => {
        this.onPageChange(p);
      });
      controlsElem.appendChild(pBtn);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn";
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        this.onPageChange(currentPage + 1);
      }
    });
    controlsElem.appendChild(nextBtn);
  }

  /**
   * Update top KPI summary cards based on current orders.
   * @param {Array} orders
   */
  updateKPIs(orders = []) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "In Progress").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
    const totalOutstanding = orders.reduce((sum, o) => sum + (parseFloat(o.balanceAmount) || 0), 0);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal("kpiTotalOrders", String(totalOrders));
    setVal("kpiPendingOrders", String(pendingOrders));
    setVal("kpiTotalRevenue", `Rs. ${totalRevenue.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`);
    setVal("kpiOutstandingBalance", `Rs. ${totalOutstanding.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`);
  }
}

export default OrderTableHandler;
