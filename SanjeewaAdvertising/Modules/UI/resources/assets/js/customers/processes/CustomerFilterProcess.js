/**
 * SanjeewaAdvertising - Customer Filter Process
 *
 * Handles customer search input debouncing and triggers re-rendering of cards.
 */

export class CustomerFilterProcess {
  /**
   * @param {Object} options
   * @param {string} [options.inputId="customerListSearchInput"]
   * @param {Function} options.onFilterChange
   */
  constructor(options = {}) {
    this.inputId = options.inputId || "customerListSearchInput";
    this.onFilterChange = options.onFilterChange || (() => {});
    this.searchTerm = "";
    this.debounceTimer = null;

    this.bindEvents();
  }

  bindEvents() {
    const input = document.getElementById(this.inputId);
    if (input) {
      input.addEventListener("input", (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.searchTerm = e.target.value.trim();
          this.onFilterChange(this.searchTerm);
        }, 250);
      });
    }
  }

  getSearchTerm() {
    return this.searchTerm;
  }
}

export default CustomerFilterProcess;

