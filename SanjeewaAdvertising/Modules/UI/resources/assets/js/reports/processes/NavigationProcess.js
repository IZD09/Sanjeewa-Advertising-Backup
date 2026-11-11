/**
 * SanjeewaAdvertising - Reports Navigation & View Mode Process
 *
 * Handles switching between the 6 Report Tabs (`tabSales`, `tabPayments`,
 * `tabReceivables`, `tabInventory`, `tabSuppliers`, `tabProfitLoss`) and
 * toggling between Table View (`table`) and Chart View (`chart`).
 */

export class NavigationProcess {
  /**
   * @param {Object} [context={}]
   * @param {Function} [context.onTabChanged]
   * @param {Function} [context.onViewModeChanged]
   */
  constructor(context = {}) {
    this.ctx = context;
    this.activeTab = "tabSales";
    this.activeViewMode = "table";
  }

  bindEvents() {
    this.bindTabButtons();
    this.bindViewModeToggle();
  }

  bindTabButtons() {
    const tabBtns = document.querySelectorAll(".rep-tab-btn");
    const tabPanes = document.querySelectorAll(".rep-tab-pane");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        if (!targetTab) return;

        this.activeTab = targetTab;
        tabBtns.forEach((b) => b.classList.toggle("active", b === btn));
        tabPanes.forEach((pane) => {
          pane.classList.toggle("active", pane.id === targetTab);
        });

        if (this.ctx.onTabChanged) {
          this.ctx.onTabChanged(targetTab);
        }
      });
    });
  }

  bindViewModeToggle() {
    const toggleBtns = document.querySelectorAll(".rep-view-toggle-btn");
    const viewSections = document.querySelectorAll(".rep-view-section");

    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const selectedMode = btn.getAttribute("data-view-mode");
        if (!selectedMode) return;

        this.activeViewMode = selectedMode;
        toggleBtns.forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-view-mode") === selectedMode);
        });

        viewSections.forEach((section) => {
          const sectionMode = section.getAttribute("data-section-mode");
          section.classList.toggle("active", sectionMode === selectedMode);
        });

        if (this.ctx.onViewModeChanged) {
          this.ctx.onViewModeChanged(selectedMode);
        }
      });
    });
  }
}

export default NavigationProcess;
