/**
 * SanjeewaAdvertising - Inventory Filter Process
 *
 * Handles search keywords and category filtering for the materials inventory table.
 */

export class FilterProcess {
  /**
   * @param {Object} context
   * @param {Function} context.renderTable
   */
  constructor(context) {
    this.ctx = context;
    this.searchTerm = "";
    this.selectedCategory = "ALL";
  }

  bindEvents() {
    const searchInput = document.getElementById("invSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.trim().toLowerCase();
        if (this.ctx.renderTable) this.ctx.renderTable();
      });
    }

    const categoryFilter = document.getElementById("invCategoryFilter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.selectedCategory = e.target.value;
        if (this.ctx.renderTable) this.ctx.renderTable();
      });
    }
  }
}

