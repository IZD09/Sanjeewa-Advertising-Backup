/**
 * Central Application Router & Module Coordinator
 * Sanjeewa Advertising Printing Shop Management System
 * Manages: Route Switching, URL Hashes, and Module Lifecycle Hooks
 * 
 * Note: Topbar & Sidebar components are decoupled and managed by:
 * - components/topbar.js (TopbarController)
 * - components/sidebar.js (SidebarComponent)
 */

"use strict";

class AppRouter {
  constructor() {
    this.routes = {
      dashboard: {
        title: "Business Overview",
        breadcrumb: "Workspace / <span>Dashboard</span>",
        moduleId: "module-dashboard"
      },
      "place-order": {
        title: "Place Order & Management",
        breadcrumb: "Workspace / Sales / <span>Place Order</span>",
        moduleId: "module-place-order"
      },
      customers: {
        title: "Customer Directory",
        breadcrumb: "Workspace / Sales / <span>Customers</span>",
        moduleId: "module-customers"
      },
      "print-jobs": {
        title: "Print Production Queue",
        breadcrumb: "Workspace / Production / <span>Print Jobs</span>",
        moduleId: "module-print-jobs"
      },
      inventory: {
        title: "Stock Management",
        breadcrumb: "Workspace / Inventory / <span>Stock Management</span>",
        moduleId: "module-inventory"
      },
      grn: {
        title: "Goods Received Note (GRN)",
        breadcrumb: "Workspace / Inventory / <span>Goods Received (GRN)</span>",
        moduleId: "module-grn"
      },
      payments: {
        title: "Payments & Settlements Hub",
        breadcrumb: "Workspace / Finance / <span>Payments</span>",
        moduleId: "module-payments"
      },
      reports: {
        title: "Financial & Sales Reports",
        breadcrumb: "Workspace / Management / <span>Reports</span>",
        moduleId: "module-reports"
      },
      settings: {
        title: "System Preferences & Settings",
        breadcrumb: "Workspace / Management / <span>Settings</span>",
        moduleId: "module-settings"
      }
    };

    this.currentRoute = "dashboard";
    this.viewport = document.getElementById("mainContentViewport");
    this.loadedModules = new Set();
    this.topbarController = null;

    this.init();
  }

  init() {
    // Reference TopbarController initialized by components/topbar.js
    this.topbarController = window.topbarController || (window.TopbarController ? new window.TopbarController() : null);

    this.bindNavigation();

    // Listen to hash changes (browser back/forward navigation)
    window.addEventListener("hashchange", () => this.handleHashChange());

    // Handle initial route on page load
    this.handleHashChange();
  }

  bindNavigation() {
    // Delegated navigation click handler to capture all present and future nav links
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a.nav-link, a[data-route], [data-navigate]");
      if (!link) return;

      const rawRoute = link.getAttribute("data-route") ||
                       link.getAttribute("data-navigate") ||
                       link.getAttribute("href")?.replace("#", "");

      if (!rawRoute || rawRoute.startsWith("http") || rawRoute.startsWith("//")) return;

      e.preventDefault();
      const targetView = link.getAttribute("data-view");
      this.navigateTo(rawRoute, true, targetView);
    });
  }

  handleHashChange() {
    const rawHash = window.location.hash.replace("#", "").trim();
    const targetRoute = this.routes[rawHash] ? rawHash : "dashboard";
    this.navigateTo(targetRoute, false);
  }

  async navigateTo(routeKey, updateHash = true, targetView = null) {
    const normalizedKey = this.routes[routeKey] ? routeKey : "dashboard";
    const route = this.routes[normalizedKey];
    this.currentRoute = normalizedKey;

    if (updateHash && window.location.hash !== `#${normalizedKey}`) {
      window.location.hash = `#${normalizedKey}`;
    }

    // 1. Update Title and Breadcrumbs via TopbarController or DOM
    if (this.topbarController?.updateTitleAndBreadcrumb) {
      this.topbarController.updateTitleAndBreadcrumb(route.title, route.breadcrumb);
    } else {
      const pageTitle = document.getElementById("pageTitle");
      const breadcrumbArea = document.getElementById("breadcrumbArea");
      if (pageTitle) pageTitle.textContent = route.title;
      if (breadcrumbArea) breadcrumbArea.innerHTML = route.breadcrumb;
    }

    // 2. Ensure module content is available in DOM (from file or pre-rendered)
    let targetModule = document.getElementById(route.moduleId);
    if (!targetModule && this.viewport) {
      targetModule = await this.loadModuleContent(normalizedKey);
    }

    // 3. Show target module and hide all other modules
    const allModules = document.querySelectorAll(".app-module");
    allModules.forEach(mod => {
      const isTarget = mod.id === route.moduleId || mod.getAttribute("data-module") === normalizedKey;
      mod.classList.toggle("active", isTarget);
      if (isTarget) {
        mod.scrollTop = 0;
      }
    });

    // 4. Update Sidebar active states and close mobile drawer
    if (window.sidebarComponent) {
      window.sidebarComponent.setActiveRoute(normalizedKey, targetView);
      window.sidebarComponent.closeMobileDrawer();
    }

    // 5. Ensure Topbar handles orientation on module navigation
    if (this.topbarController) {
      this.topbarController.onModuleNavigate();
    }

    // 6. Reset viewport scroll position
    if (this.viewport && !targetView) {
      this.viewport.scrollTop = 0;
    }

    // 7. Module-specific lifecycle management
    this.handleModuleLifecycle(normalizedKey, targetView);
  }

  async loadModuleContent(routeKey) {
    if (!this.viewport) return null;

    try {
      const response = await fetch(`pages/${routeKey}.html`);
      if (response.ok) {
        const html = await response.text();
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const moduleElement = temp.firstElementChild;
        if (moduleElement) {
          this.viewport.appendChild(moduleElement);
          this.loadedModules.add(routeKey);
          return moduleElement;
        }
      }
    } catch (err) {
      console.warn(`Could not load pages/${routeKey}.html dynamically, using DOM fallback.`, err);
    }

    return document.getElementById(this.routes[routeKey]?.moduleId);
  }

  handleModuleLifecycle(routeKey, targetView = null) {
    if (routeKey === "dashboard") {
      // Resume dashboard slideshow and refresh charts
      if (window.dashboardInstance) {
        window.dashboardInstance.startSlideshow();
        setTimeout(() => window.dashboardInstance.resizeVisibleCharts(), 60);
      }
    } else {
      // Pause slideshow when away from dashboard to preserve CPU and timer resources
      if (window.dashboardInstance) {
        window.dashboardInstance.stopSlideshow();
      }
    }

    if (routeKey === "place-order") {
      // Initialize or refresh place order records and financial calculations
      if (window.placeOrderApp) {
        window.placeOrderApp.renderOrdersTable();
        window.placeOrderApp.updateKPIs();
        window.placeOrderApp.updateCalculation();

        if (targetView === "orders" || targetView === "payments") {
          const ordersPanel = document.querySelector(".po-card:nth-of-type(2)");
          if (ordersPanel) {
            setTimeout(() => ordersPanel.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
          }
        }
      }
    }

    if (routeKey === "inventory") {
      // Refresh inventory table and KPIs
      if (window.inventoryManager) {
        window.inventoryManager.render();
      }
    }

    if (routeKey === "grn") {
      // Refresh GRN directory and KPIs
      if (window.grnManager) {
        if (targetView === "po") {
          window.grnManager.switchView("po");
        } else if (targetView === "form") {
          window.grnManager.switchView("form");
        } else if (targetView === "suppliers") {
          window.grnManager.switchView("suppliers");
        } else {
          window.grnManager.render();
        }
      }
    }

    if (routeKey === "payments") {
      // Refresh Payments Hub and activate specific sub-channel tab
      if (window.paymentsManager) {
        if (targetView === "invoice" || targetView === "invoice-payment") {
          window.paymentsManager.switchTab("invoice");
        } else if (targetView === "grn" || targetView === "grn-payment") {
          window.paymentsManager.switchTab("grn");
        } else if (targetView === "overview") {
          window.paymentsManager.switchTab("overview");
        } else {
          window.paymentsManager.render();
        }
      }
    }
  }
}

// Global initialization
if (typeof window !== "undefined") {
  window.AppRouter = AppRouter;
  document.addEventListener("DOMContentLoaded", () => {
    window.appRouter = new AppRouter();
  });
}
