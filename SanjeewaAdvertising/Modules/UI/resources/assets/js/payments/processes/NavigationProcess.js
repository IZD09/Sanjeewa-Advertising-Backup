/**
 * SanjeewaAdvertising - Payments Navigation Process
 *
 * Handles tab navigation between Customer Invoice Payments, Supplier GRN Payments,
 * and Financial Overview, with active route synchronization.
 */

export class NavigationProcess {
  /**
   * @param {Object} context
   * @param {Function} context.render
   */
  constructor(context) {
    this.ctx = context;
    this.activeTab = "invoice"; // "invoice", "grn", or "overview"
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".pay-tab-btn");
      if (tabBtn) {
        e.preventDefault();
        const tab = tabBtn.getAttribute("data-tab");
        this.switchTab(tab);
      }
    });
  }

  switchTab(tab) {
    this.activeTab = (tab === "grn" || tab === "grn-payment") ? "grn" : ((tab === "overview") ? "overview" : "invoice");

    document.querySelectorAll(".pay-tab-btn").forEach(btn => {
      const btnTab = btn.getAttribute("data-tab");
      btn.classList.toggle("active", btnTab === this.activeTab);
    });

    const invPane = document.getElementById("payTabPaneInvoice");
    const grnPane = document.getElementById("payTabPaneGrn");
    const ovPane = document.getElementById("payTabPaneOverview");

    if (invPane) invPane.style.display = (this.activeTab === "invoice") ? "block" : "none";
    if (grnPane) grnPane.style.display = (this.activeTab === "grn") ? "block" : "none";
    if (ovPane) ovPane.style.display = (this.activeTab === "overview") ? "block" : "none";

    if (window.sidebarComponent) {
      window.sidebarComponent.setActiveRoute("payments", (this.activeTab === "invoice" ? "invoice-payment" : (this.activeTab === "grn" ? "grn-payment" : null)));
    }

    if (this.ctx.render) this.ctx.render();
  }
}

