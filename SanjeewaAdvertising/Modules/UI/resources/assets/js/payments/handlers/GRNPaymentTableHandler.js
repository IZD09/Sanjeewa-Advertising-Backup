/**
 * SanjeewaAdvertising - GRN Payment Table Handler
 *
 * Extends BaseTableLoader core class (which extends BasePaginationHandler),
 * utilizing GrnPaymentRowBuilder to filter, paginate (20 rows per page),
 * and render GRN Supplier Stock Payments without page reloads.
 */

import { BaseTableLoader } from "../../core/BaseTableLoader.js";
import { StatusHelper } from "../../core/StatusHelper.js";
import { GrnPaymentRowBuilder, GrnPaymentEntity } from "../builders/GrnPaymentRowBuilder.js";

export class GRNPaymentTableHandler extends BaseTableLoader {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.renderStageBadge]
   * @param {Function} [options.renderMethodBadge]
   * @param {Function} [options.formatCurrency]
   * @param {Function} [options.onPageChange]
   * @param {number} [options.pageSize=20]
   */
  constructor(options = {}) {
    super({
      tbodyId: "payGrnTableBody",
      paginationInfoId: "payGrnPaginationInfo",
      paginationControlsId: "payGrnPaginationControls",
      pageSize: options.pageSize || 20,
      colspan: 9,
      emptyIcon: "fa-truck-ramp-box",
      emptyMessage: "No GRN Stock Payments match your filter criteria.",
      itemLabel: "disbursements",
      onPageChange: (page) => {
        this.currentPage = page;
        this.renderCurrent();
        if (options.onPageChange) options.onPageChange(page);
      },
      rowBuilder: GrnPaymentRowBuilder
    });

    this.renderStageBadge = options.renderStageBadge || (() => "");
    this.renderMethodBadge = options.renderMethodBadge || (() => "");
    this.formatCurrency = options.formatCurrency || ((amt) => `Rs. ${(parseFloat(amt) || 0).toFixed(2)}`);

    this.lastDataset = [];
    this.lastSearch = "";
    this.lastStatus = "ALL";
    this.lastMethod = "ALL";
    this.lastSupplierId = null;
  }

  /**
   * Normalize supplier IDs like 5 or "SUP-005" to a comparable canonical value.
   *
   * @param {string|number|null|undefined} id
   * @returns {number|string|null}
   */
  normalizeSupplierId(id) {
    if (id === null || id === undefined || id === "") return null;
    const raw = String(id).trim();
    const digitsMatch = raw.match(/(\d+)$/);
    if (digitsMatch) {
      const num = Number(digitsMatch[1]);
      if (num > 0) return num;
    }
    return raw.toLowerCase();
  }

  /**
   * Filter GRN payments by search keyword, stage/status, payment method, and supplier ID.
   *
   * @param {Array} grnPayments
   * @param {string} grnSearch
   * @param {string} grnStatusFilter
   * @param {string} grnMethodFilter
   * @param {number|string|null} [supplierId=null]
   * @returns {Array}
   */
  getFilteredPayments(grnPayments = [], grnSearch = "", grnStatusFilter = "ALL", grnMethodFilter = "ALL", supplierId = null) {
    const term = (grnSearch || "").toLowerCase().trim();
    const targetSupplierId = this.normalizeSupplierId(supplierId);

    return (grnPayments || []).filter(p => {
      if (targetSupplierId !== null) {
        const itemSupplierId = this.normalizeSupplierId(p.supplierId ?? p.supplier_id ?? null);
        if (itemSupplierId !== null && itemSupplierId !== targetSupplierId) {
          return false;
        }
      }

      const grnNumber = String(p.grnNumber || p.grn_number || "").toLowerCase();
      const poNumber = String(p.poNumber || p.po_number || p.purchase_order_no || "").toLowerCase();
      const supplierName = String(p.supplierName || p.supplier_name || "").toLowerCase();
      const category = String(p.stockCategory || p.stock_category || "").toLowerCase();
      const ref = String(p.ref || p.reference_no || "").toLowerCase();
      const note = String(p.note || p.narration || "").toLowerCase();

      const matchesSearch = !term ||
        grnNumber.includes(term) ||
        poNumber.includes(term) ||
        supplierName.includes(term) ||
        category.includes(term) ||
        ref.includes(term) ||
        note.includes(term) ||
        (Array.isArray(p.poNumbers) && p.poNumbers.some(po => String(po).toLowerCase().includes(term))) ||
        (Array.isArray(p.po_numbers) && p.po_numbers.some(po => String(po).toLowerCase().includes(term)));

      const balance = Number(p.balance ?? p.balanceAmount ?? p.balance_amount ?? 0);
      const stage = p.stage || (p.payment_status === "Paid" || balance <= 0.009 ? "Complete Payment" : "Pending Payment");
      const matchesStatus = grnStatusFilter === "ALL" ||
        (grnStatusFilter === "PENDING_DUE"
          ? (balance > 0.009 || stage !== "Complete Payment")
          : stage === grnStatusFilter);
      const matchesMethod = StatusHelper.matchesPaymentMethod(p.method, grnMethodFilter);

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  /**
   * Filter, paginate (20 per page), and render table rows.
   *
   * @param {Array} grnPayments
   * @param {string} grnSearch
   * @param {string} grnStatusFilter
   * @param {string} grnMethodFilter
   * @param {boolean} [resetPage=false]
   * @param {number|string|null} [supplierId=null]
   */
  render(grnPayments = [], grnSearch = "", grnStatusFilter = "ALL", grnMethodFilter = "ALL", resetPage = false, supplierId = null) {
    if (
      resetPage ||
      grnSearch !== this.lastSearch ||
      grnStatusFilter !== this.lastStatus ||
      grnMethodFilter !== this.lastMethod ||
      supplierId !== this.lastSupplierId
    ) {
      this.currentPage = 1;
    }

    this.lastDataset = grnPayments || [];
    this.lastSearch = grnSearch || "";
    this.lastStatus = grnStatusFilter || "ALL";
    this.lastMethod = grnMethodFilter || "ALL";
    this.lastSupplierId = supplierId;

    this.renderCurrent();
  }

  /**
   * Render table using stored criteria and active page.
   */
  renderCurrent() {
    const tbody = this.getTbody();
    if (!tbody) return;

    const filtered = this.getFilteredPayments(
      this.lastDataset,
      this.lastSearch,
      this.lastStatus,
      this.lastMethod,
      this.lastSupplierId
    );

    if (filtered.length === 0) {
      this.renderEmptyState(
        "No GRN Stock Payments match your filter criteria.",
        "fa-truck-ramp-box"
      );
      this.renderPagination(0, 1, 1, this.pageSize, "disbursements");
      return;
    }

    // Paginate: max 20 rows per page
    const paginated = this.paginate(filtered, this.currentPage, this.pageSize);

    tbody.innerHTML = "";

    paginated.pageItems.forEach(item => {
      const entity = item instanceof GrnPaymentEntity
        ? item
        : new GrnPaymentRowBuilder(item).build();
      tbody.appendChild(entity.render());
    });

    // Render standard pagination bar & navigation controls without reload
    this.renderPagination(
      paginated.total,
      paginated.totalPages,
      paginated.activePage,
      this.pageSize,
      "disbursements"
    );
  }
}

export default GRNPaymentTableHandler;
