/**
 * SanjeewaAdvertising - Payments Navigation Process
 *
 * Handles tab navigation between:
 * 1. Customer Invoice Payments (Job Invoices)
 * 2. Supplier GRN Payments (Stock Items)
 * 3. Operating Expenses (Utility & Overhead Bills)
 * 4. Financial Reconciliation & Overview
 *
 * Synchronizes with Sidebar sub-items and URL query parameters.
 */

export class NavigationProcess {
  /**
   * @param {Object} context
   * @param {Function} context.render
   * @param {Function} [context.onConceptFilter]
   */
  constructor(context) {
    this.ctx = context;

    // Detect initial tab from URL query param if present
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const viewParam = urlParams ? urlParams.get("view") : null;
    if (viewParam === "grn-payment" || viewParam === "grn") {
      this.activeTab = "grn";
    } else if (viewParam === "expenses" || viewParam === "expense") {
      this.activeTab = "expenses";
    } else if (viewParam === "overview") {
      this.activeTab = "overview";
    } else {
      this.activeTab = "invoice";
    }
  }

  bindEvents() {
    // Tab navigation clicks
    document.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".pay-tab-btn");
      if (tabBtn) {
        e.preventDefault();
        const tab = tabBtn.getAttribute("data-tab");
        this.switchTab(tab);
        return;
      }

      // Concept chips click-to-filter
      const chip = e.target.closest(".concept-chip[data-target]");
      if (chip) {
        e.preventDefault();
        const targetTab = chip.getAttribute("data-target");
        const filterType = chip.getAttribute("data-filter-type");
        const filterVal = chip.getAttribute("data-filter-val");

        this.switchTab(targetTab);

        if (this.ctx.onConceptFilter) {
          this.ctx.onConceptFilter(targetTab, filterType, filterVal);
        }
      }
    });
  }

  switchTab(tab) {
    if (tab === "grn" || tab === "grn-payment") {
      this.activeTab = "grn";
    } else if (tab === "expenses" || tab === "expense") {
      this.activeTab = "expenses";
    } else if (tab === "overview") {
      this.activeTab = "overview";
    } else {
      this.activeTab = "invoice";
    }

    document.querySelectorAll(".pay-tab-btn").forEach(btn => {
      const btnTab = btn.getAttribute("data-tab");
      btn.classList.toggle("active", btnTab === this.activeTab);
    });

    const invPane = document.getElementById("payTabPaneInvoice");
    const grnPane = document.getElementById("payTabPaneGrn");
    const expPane = document.getElementById("payTabPaneExpenses");
    const ovPane = document.getElementById("payTabPaneOverview");

    if (invPane) invPane.style.display = (this.activeTab === "invoice") ? "block" : "none";
    if (grnPane) grnPane.style.display = (this.activeTab === "grn") ? "block" : "none";
    if (expPane) expPane.style.display = (this.activeTab === "expenses") ? "block" : "none";
    if (ovPane) ovPane.style.display = (this.activeTab === "overview") ? "block" : "none";

    // Update browser URL query param without page reload
    if (typeof window !== "undefined" && window.history && window.history.replaceState) {
      const viewVal = this.activeTab === "grn"
        ? "grn-payment"
        : (this.activeTab === "expenses"
          ? "expenses"
          : (this.activeTab === "overview" ? "overview" : "invoice-payment"));
      const newUrl = `${window.location.pathname}?view=${viewVal}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);
    }

    if (window.sidebarComponent) {
      const subRoute = (this.activeTab === "invoice"
        ? "invoice-payment"
        : (this.activeTab === "grn"
          ? "grn-payment"
          : (this.activeTab === "expenses" ? "expenses" : null)));
      window.sidebarComponent.setActiveRoute("payments", subRoute);
    }

    if (this.ctx.render) this.ctx.render();
  }
}
