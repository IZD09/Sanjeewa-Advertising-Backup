/**
 * SanjeewaAdvertising - Base Pagination Handler
 *
 * Universal foundation class for client-side and server-side pagination,
 * managing active page, page size, total pages, and rendering standard
 * pagination info and interactive navigation buttons without full-page reloads.
 */

export class BasePaginationHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.paginationInfoId="paginationInfo"] - DOM element ID for "Showing X-Y of Z records"
   * @param {string} [options.paginationControlsId="paginationControls"] - DOM element ID for page button container
   * @param {number} [options.pageSize=20] - Max records/cards per page (default: 20)
   * @param {string} [options.itemLabel="records"] - Noun used in info string (e.g., "records", "orders", "customers")
   * @param {Function} [options.onPageChange] - Callback invoked when a page button is clicked
   */
  constructor(options = {}) {
    this.paginationInfoId = options.paginationInfoId || "paginationInfo";
    this.paginationControlsId = options.paginationControlsId || "paginationControls";
    this.pageSize = options.pageSize || 20;
    this.itemLabel = options.itemLabel || "records";
    this.onPageChange = options.onPageChange || (() => {});

    this.currentPage = 1;
    this.totalCount = 0;
    this.totalPages = 1;
  }

  /**
   * Compute slice of items for the requested page.
   *
   * @param {Array} items - Complete list of records/cards
   * @param {number} [page=this.currentPage]
   * @param {number} [size=this.pageSize]
   * @returns {{pageItems: Array, total: number, totalPages: number, activePage: number, pageSize: number}}
   */
  paginate(items = [], page = this.currentPage, size = this.pageSize) {
    const total = Array.isArray(items) ? items.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / size));
    const activePage = Math.max(1, Math.min(page, totalPages));
    const start = (activePage - 1) * size;
    const pageItems = Array.isArray(items) ? items.slice(start, start + size) : [];

    this.currentPage = activePage;
    this.totalCount = total;
    this.totalPages = totalPages;
    this.pageSize = size;

    return {
      pageItems,
      total,
      totalPages,
      activePage,
      pageSize: size,
    };
  }

  /**
   * Render pagination summary text and page navigation buttons.
   * Prevents browser reload on click via e.preventDefault().
   *
   * @param {number} totalCount
   * @param {number} totalPages
   * @param {number} [currentPage=this.currentPage]
   * @param {number} [pageSize=this.pageSize]
   * @param {string} [label=this.itemLabel]
   */
  renderPagination(
    totalCount,
    totalPages,
    currentPage = this.currentPage,
    pageSize = this.pageSize,
    label = this.itemLabel
  ) {
    this.totalCount = totalCount;
    this.totalPages = totalPages;
    this.currentPage = currentPage;
    this.pageSize = pageSize;

    const infoElem = document.getElementById(this.paginationInfoId);
    const controlsElem = document.getElementById(this.paginationControlsId);

    if (infoElem) {
      if (totalCount === 0) {
        infoElem.textContent = `Showing 0 ${label}`;
      } else {
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalCount);
        infoElem.textContent = `Showing ${start}-${end} of ${totalCount} ${label}`;
      }
    }

    if (!controlsElem) return;
    controlsElem.innerHTML = "";

    if (totalCount === 0 || totalPages <= 1) {
      return;
    }

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn";
    prevBtn.setAttribute("aria-label", "Previous Page");
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage <= 1;
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.currentPage > 1) {
        this.goToPage(this.currentPage - 1);
      }
    });
    controlsElem.appendChild(prevBtn);

    // Numbered Buttons (with ellipsis for large page ranges)
    const pageNumbers = this.getPageNumbers(totalPages, currentPage);
    pageNumbers.forEach((p) => {
      if (p === "...") {
        const ellipsis = document.createElement("span");
        ellipsis.className = "page-ellipsis";
        ellipsis.textContent = "...";
        ellipsis.style.padding = "0 6px";
        ellipsis.style.color = "var(--text-muted, #8c8c8c)";
        controlsElem.appendChild(ellipsis);
      } else {
        const pageBtn = document.createElement("button");
        pageBtn.type = "button";
        pageBtn.className = `page-btn ${p === currentPage ? "active" : ""}`;
        pageBtn.textContent = String(p);
        pageBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (p !== this.currentPage) {
            this.goToPage(p);
          }
        });
        controlsElem.appendChild(pageBtn);
      }
    });

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn";
    nextBtn.setAttribute("aria-label", "Next Page");
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.currentPage < totalPages) {
        this.goToPage(this.currentPage + 1);
      }
    });
    controlsElem.appendChild(nextBtn);
  }

  /**
   * Helper to compute sensible visible page numbers with ellipsis.
   */
  getPageNumbers(totalPages, current) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (current >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", current - 1, current, current + 1, "...", totalPages];
  }

  /**
   * Navigate to target page without page reload.
   * @param {number} page
   */
  goToPage(page) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.onPageChange(this.currentPage);
  }

  reset() {
    this.currentPage = 1;
  }
}

export default BasePaginationHandler;

