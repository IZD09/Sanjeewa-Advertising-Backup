/**
 * SanjeewaAdvertising - Customer Card Handler
 *
 * Extends BasePaginationHandler core class to render customer cards grid,
 * handle search filtering, and provide 20-cards-per-page client/server pagination
 * without page reloads.
 */

import { BasePaginationHandler } from "../../core/BasePaginationHandler.js";
import { CustomerCardBuilder } from "../builders/CustomerCardBuilder.js";

export class CustomerCardHandler extends BasePaginationHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.gridId="customersCardsGrid"]
   * @param {string} [options.paginationInfoId="customerPaginationInfo"]
   * @param {string} [options.paginationControlsId="customerPaginationControls"]
   * @param {number} [options.pageSize=20]
   * @param {Function} [options.onPageChange]
   */
  constructor(options = {}) {
    super({
      paginationInfoId: options.paginationInfoId || "customerPaginationInfo",
      paginationControlsId: options.paginationControlsId || "customerPaginationControls",
      pageSize: options.pageSize || 20,
      itemLabel: "customers",
      onPageChange: options.onPageChange || (() => {}),
    });

    this.gridId = options.gridId || "customersCardsGrid";
    this.searchTerm = "";
  }

  getGrid() {
    return typeof document !== "undefined" && this.gridId
      ? document.getElementById(this.gridId)
      : null;
  }

  showLoading(message = "Loading customer accounts...") {
    const grid = this.getGrid();
    if (!grid) return;
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 16px; text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 28px; color: var(--po-orange, #ff6b00);"></i>
        <p style="margin-top: 12px; font-size: 13.5px;">${message}</p>
      </div>
    `;
  }

  renderEmptyState(message = "No customer accounts found.") {
    const grid = this.getGrid();
    if (!grid) return;
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 16px; text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-users-slash" style="font-size: 36px; opacity: 0.4; margin-bottom: 12px;"></i>
        <p style="font-size: 14px; margin: 0;">${message}</p>
      </div>
    `;
  }

  /**
   * Filter customer records by search term across name, mobile, email, location.
   */
  filterCustomers(customers = [], searchTerm = "") {
    const term = (searchTerm || "").toLowerCase().trim();
    if (!term) return customers;

    return (customers || []).filter((cust) => {
      const name = (cust.name || "").toLowerCase();
      const mobile = (cust.mobile || "").toLowerCase();
      const email = (cust.email || "").toLowerCase();
      return name.includes(term) || mobile.includes(term) || email.includes(term);
    });
  }

  /**
   * Render customer cards for active page.
   *
   * @param {Array} customers
   * @param {string} [searchTerm=""]
   * @param {number} [page=this.currentPage]
   * @param {number} [pageSize=this.pageSize]
   */
  render(customers = [], searchTerm = "", page = this.currentPage, pageSize = this.pageSize) {
    const grid = this.getGrid();
    if (!grid) return;

    this.searchTerm = searchTerm;
    const filtered = this.filterCustomers(customers, searchTerm);

    grid.innerHTML = "";

    if (!filtered || filtered.length === 0) {
      this.renderEmptyState(
        searchTerm
          ? `No customers found matching "${searchTerm}"`
          : "No customer accounts registered yet."
      );
      this.renderPagination(0, 1, 1, pageSize, "customers");
      return;
    }

    const { pageItems, total, totalPages, activePage } = this.paginate(filtered, page, pageSize);

    const cardsHtml = pageItems
      .map((item) => new CustomerCardBuilder(item).render())
      .join("");

    grid.innerHTML = cardsHtml;

    this.renderPagination(total, totalPages, activePage, pageSize, "customers");
  }
}

export default CustomerCardHandler;

