/**
 * SanjeewaAdvertising - Collectable Payments Table Handler
 *
 * Extends BaseTableLoader core class (which extends BasePaginationHandler),
 * utilizing CollectablePaymentRowBuilder to filter, paginate (20 rows per page),
 * and render customer jobs/invoices with outstanding collectable balances.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { CollectablePaymentRowBuilder, CollectablePaymentEntity } from "../builders/CollectablePaymentRowBuilder.js";

export class CollectablePaymentsTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onPageChange]
   * @param {number} [options.pageSize=20]
   */
  constructor(options = {}) {
    super({
      tbodyId: "payCollectionTableBody",
      paginationInfoId: "payCollectionPaginationInfo",
      paginationControlsId: "payCollectionPaginationControls",
      pageSize: options.pageSize || 20,
      colspan: 8,
      emptyIcon: "fa-hand-holding-dollar",
      emptyMessage: "All customer jobs & invoices are fully collected! No pending collections.",
      itemLabel: "collectables",
      onPageChange: (page) => {
        this.currentPage = page;
        this.renderCurrent();
        if (options.onPageChange) options.onPageChange(page);
      },
      rowBuilder: CollectablePaymentRowBuilder
    });

    this.lastDataset = [];
    this.lastSearch = "";
    this.lastStatus = "ALL";
  }

  /**
   * Extract only jobs/invoices that still have an outstanding balance (> 0).
   *
   * @param {Array} orders
   * @returns {Array}
   */
  getCollectableItems(orders = []) {
    return (orders || []).filter((job) => {
      const balance = Number(
        job.balanceAmount !== undefined
          ? job.balanceAmount
          : (job.balance_amount !== undefined ? job.balance_amount : Math.max(0, (Number(job.totalAmount || 0) - Number(job.paidAmount || 0))))
      );
      return balance > 0.009;
    });
  }

  /**
   * Filter collectable jobs by search keyword and collection status.
   *
   * @param {Array} orders
   * @param {string} search
   * @param {string} statusFilter
   * @returns {Array}
   */
  getFilteredCollectables(orders = [], search = "", statusFilter = "ALL") {
    const term = (search || "").toLowerCase().trim();
    const collectables = this.getCollectableItems(orders);

    return collectables.filter((job) => {
      const formattedId = String(job.formattedId || job.orderId || `ORD-2026-${1000 + Number(job.rawId || job.jobId || job.id || 0)}`).toLowerCase();
      const rawId = String(job.rawId || job.jobId || job.id || "").toLowerCase();
      const customerName = String(job.customerName || job.customer_name || "").toLowerCase();
      const customerMobile = String(job.customerMobile || job.customer_mobile || "").toLowerCase();
      const productName = String(job.productName || job.product_name || "").toLowerCase();

      const matchesSearch = !term ||
        formattedId.includes(term) ||
        rawId.includes(term) ||
        customerName.includes(term) ||
        customerMobile.includes(term) ||
        productName.includes(term);

      const paidAmt = Number(job.paidAmount ?? job.paid_amount ?? 0);
      const stage = paidAmt > 0 ? "Advance Payment" : "Pending Payment";
      const matchesStatus = statusFilter === "ALL" || stage === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Filter, paginate (20 per page), and render table rows.
   *
   * @param {Array} orders
   * @param {string} search
   * @param {string} statusFilter
   * @param {boolean} [resetPage=false]
   */
  render(orders = [], search = "", statusFilter = "ALL", resetPage = false) {
    if (resetPage || search !== this.lastSearch || statusFilter !== this.lastStatus) {
      this.currentPage = 1;
    }

    this.lastDataset = orders || [];
    this.lastSearch = search || "";
    this.lastStatus = statusFilter || "ALL";

    this.renderCurrent();
  }

  /**
   * Render table using stored criteria and active page.
   */
  renderCurrent() {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredCollectables(
      this.lastDataset,
      this.lastSearch,
      this.lastStatus
    );

    if (filtered.length === 0) {
      this.renderEmptyState(
        "All customer jobs & invoices are fully collected! No pending collections.",
        "fa-hand-holding-dollar"
      );
      this.renderPagination(0, 1, 1, this.pageSize, "collectables");
      return;
    }

    const paginated = this.paginate(filtered, this.currentPage, this.pageSize);
    tbody.innerHTML = "";

    paginated.pageItems.forEach((item) => {
      const entity = item instanceof CollectablePaymentEntity
        ? item
        : new CollectablePaymentRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });

    this.renderPagination(
      paginated.total,
      paginated.totalPages,
      paginated.activePage,
      this.pageSize,
      "collectables"
    );
  }
}

export default CollectablePaymentsTableHandler;
