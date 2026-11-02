/**
 * SanjeewaAdvertising - GRN Navigation Process
 *
 * Handles view switching between GRN List, Form, Purchase Orders, and Suppliers directory,
 * tab state styling, and URL query parameter routing.
 */

export class NavigationProcess {
  /**
   * @param {Object} context
   * @param {Function} context.initNewGrnForm
   * @param {Function} context.renderPOTable
   * @param {Function} context.populatePOSupplierFilter
   * @param {Function} context.renderSuppliersGrid
   * @param {Function} context.render
   */
  constructor(context) {
    this.ctx = context;
    this.currentView = "list"; // "list", "form", "po", or "suppliers"
  }

  bindEvents() {
    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", fn);
    };

    bindClick("grnTabListBtn", () => this.switchView("list"));
    bindClick("grnTabCreateBtn", () => this.switchView("form"));
    bindClick("grnTabPOBtn", () => this.switchView("po"));
    bindClick("grnTabSuppliersBtn", () => this.switchView("suppliers"));
    bindClick("grnHeaderCreateBtn", () => this.switchView("form"));

    // Check URL view parameter on load
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("view");
    if (viewParam === "suppliers" || viewParam === "po" || viewParam === "form") {
      this.switchView(viewParam);
    }
  }

  switchView(viewName, targetPoNumber = null) {
    this.currentView = viewName;

    const views = {
      list: document.getElementById("grnListView"),
      form: document.getElementById("grnFormView"),
      po: document.getElementById("grnPOView"),
      suppliers: document.getElementById("grnSuppliersView")
    };

    const tabs = {
      list: document.getElementById("grnTabListBtn"),
      form: document.getElementById("grnTabCreateBtn"),
      po: document.getElementById("grnTabPOBtn"),
      suppliers: document.getElementById("grnTabSuppliersBtn")
    };

    Object.values(views).forEach(v => { if (v) v.style.display = "none"; });
    Object.values(tabs).forEach(t => { if (t) t.classList.remove("active"); });

    if (viewName === "form") {
      if (views.form) views.form.style.display = "block";
      if (tabs.form) tabs.form.classList.add("active");
      if (this.ctx.initNewGrnForm) this.ctx.initNewGrnForm(targetPoNumber);
    } else if (viewName === "po") {
      if (views.po) views.po.style.display = "block";
      if (tabs.po) tabs.po.classList.add("active");
      if (this.ctx.loadAndRenderPO) {
        this.ctx.loadAndRenderPO();
      } else {
        if (this.ctx.renderPOTable) this.ctx.renderPOTable();
        if (this.ctx.populatePOSupplierFilter) this.ctx.populatePOSupplierFilter();
      }
    } else if (viewName === "suppliers") {
      if (views.suppliers) views.suppliers.style.display = "block";
      if (tabs.suppliers) tabs.suppliers.classList.add("active");
      if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();
    } else {
      if (views.list) views.list.style.display = "block";
      if (tabs.list) tabs.list.classList.add("active");
      if (this.ctx.loadAndRenderGRN) {
        this.ctx.loadAndRenderGRN();
      } else if (this.ctx.render) {
        this.ctx.render();
      }
    }

    // Sync browser URL and sidebar active route
    try {
      const newUrl = viewName === "list" ? window.location.pathname : `${window.location.pathname}?view=${viewName}`;
      if (window.location.search !== (viewName === "list" ? "" : `?view=${viewName}`)) {
        window.history.replaceState(null, "", newUrl);
      }
      if (window.sidebarComponent && typeof window.sidebarComponent.setActiveRoute === "function") {
        window.sidebarComponent.setActiveRoute("grn", viewName === "po" ? "po" : null);
      }
    } catch (e) {}
  }
}

