/**
 * Central Application Coordinator & Module Lifecycle Manager
 * Sanjeewa Advertising Printing Shop Management System
 * Handles: Turbo Drive SPA Navigation, Route Detection, Page Lifecycle Management, Clean URL Navigation
 *
 * Note: Topbar & Sidebar components are decoupled and managed by:
 * - components/topbar.js (TopbarController)
 * - components/sidebar.js (SidebarComponent)
 */

"use strict";

import * as Turbo from "@hotwired/turbo";

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
      },
      "user-control": {
        title: "User & Access Control",
        breadcrumb: "Admin Workspace / Management / <span>User Control</span>",
        moduleId: "module-user-control"
      },
      "sales-revenue": {
        title: "Sales & Revenue Analytics",
        breadcrumb: "Admin Workspace / <span>Sales & Revenue</span>",
        moduleId: "module-dashboard"
      }
    };

    this.currentRoute = this.detectCurrentRoute();
    this.viewport = document.getElementById("mainContentViewport");
    this.topbarController = null;

    this.init();
  }

  detectCurrentRoute() {
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const parts = rawPath.split("/");

    // Handle admin subroutes (e.g. /admin/user-control or /admin/dashboard)
    if (parts[0] === "admin" && parts[1] && this.routes[parts[1]]) {
      return parts[1];
    }

    const path = parts[0];
    if (path && this.routes[path]) {
      return path;
    }
    const moduleElem = document.querySelector(".app-module[data-module]");
    if (moduleElem) {
      const moduleKey = moduleElem.getAttribute("data-module");
      if (moduleKey && this.routes[moduleKey]) return moduleKey;
    }
    return "dashboard";
  }

  init() {
    // Reference TopbarController initialized by components/topbar.js
    this.topbarController = window.topbarController || (window.TopbarController ? new window.TopbarController() : null);

    // If an old legacy hash route exists (e.g. /dashboard#print-jobs), redirect to clean URL /print-jobs
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "").trim();
      if (hash && this.routes[hash]) {
        if (this.currentRoute !== hash) {
          window.location.replace(`/${hash}`);
          return;
        } else {
          // Remove hash from address bar cleanly without reloading
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }
      }
    }

    const searchParams = new URLSearchParams(window.location.search);
    const targetView = searchParams.get("view");

    // 1. Update Title and Breadcrumbs via TopbarController if elements exist
    const route = this.routes[this.currentRoute];
    if (route) {
      const pageTitle = document.getElementById("pageTitle");
      const breadcrumbArea = document.getElementById("breadcrumbArea");
      if (pageTitle && !pageTitle.textContent.trim()) {
        pageTitle.textContent = route.title;
      }
      if (breadcrumbArea && !breadcrumbArea.textContent.trim()) {
        breadcrumbArea.innerHTML = route.breadcrumb;
      }
      if (this.topbarController?.updateTitleAndBreadcrumb && pageTitle && breadcrumbArea) {
        this.topbarController.updateTitleAndBreadcrumb(pageTitle.textContent, breadcrumbArea.innerHTML);
      }
    }

    // 2. Update Sidebar active state
    if (window.sidebarComponent) {
      window.sidebarComponent.setActiveRoute(this.currentRoute, targetView);
    }

    // 3. Module-specific lifecycle management
    this.handleModuleLifecycle(this.currentRoute, targetView);
  }

  onTurboLoad() {
    this.currentRoute = this.detectCurrentRoute();
    this.viewport = document.getElementById("mainContentViewport");
    this.topbarController = window.topbarController || (window.TopbarController ? new window.TopbarController() : null);

    const searchParams = new URLSearchParams(window.location.search);
    const targetView = searchParams.get("view");

    // 1. Update Title and Breadcrumbs via TopbarController if elements exist
    const route = this.routes[this.currentRoute];
    if (route) {
      const pageTitle = document.getElementById("pageTitle");
      const breadcrumbArea = document.getElementById("breadcrumbArea");
      if (pageTitle && !pageTitle.textContent.trim()) {
        pageTitle.textContent = route.title;
      }
      if (breadcrumbArea && !breadcrumbArea.textContent.trim()) {
        breadcrumbArea.innerHTML = route.breadcrumb;
      }
      if (this.topbarController?.updateTitleAndBreadcrumb && pageTitle && breadcrumbArea) {
        this.topbarController.updateTitleAndBreadcrumb(pageTitle.textContent, breadcrumbArea.innerHTML);
      }
    }

    // 2. Update Sidebar active state
    if (window.sidebarComponent) {
      window.sidebarComponent.setActiveRoute(this.currentRoute, targetView);
    }

    // 3. Module-specific lifecycle management
    this.handleModuleLifecycle(this.currentRoute, targetView);
  }

  navigateTo(routeKey, targetView = null) {
    const route = this.routes[routeKey] ? routeKey : "dashboard";
    const url = targetView ? `/${route}?view=${encodeURIComponent(targetView)}` : `/${route}`;
    if (window.Turbo) {
      window.Turbo.visit(url);
    } else {
      window.location.href = url;
    }
  }

  handleModuleLifecycle(routeKey, targetView = null) {
    if (routeKey === "dashboard") {
      if (window.dashboardInstance) {
        window.dashboardInstance.startSlideshow();
        setTimeout(() => window.dashboardInstance.resizeVisibleCharts(), 60);
      } else if (window.AdminDashboard) {
        window.dashboardInstance = new window.AdminDashboard();
      }
    }

    if (routeKey === "place-order") {
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
      } else if (window.PlaceOrderManager && document.getElementById("module-place-order")) {
        window.placeOrderApp = new window.PlaceOrderManager();
      }
    }

    if (routeKey === "inventory") {
      if (window.inventoryManager) {
        window.inventoryManager.render();
      } else if (window.InventoryManager && document.getElementById("module-inventory")) {
        window.inventoryManager = new window.InventoryManager();
        window.inventoryApp = window.inventoryManager;
      }
    }

    if (routeKey === "grn") {
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
      } else if (window.GRNManager && document.getElementById("module-grn")) {
        window.grnManager = new window.GRNManager();
      }
    }

    if (routeKey === "payments") {
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
      } else if (window.PaymentsManager && document.getElementById("module-payments")) {
        window.paymentsManager = new window.PaymentsManager();
        window.paymentsApp = window.paymentsManager;
      }
    }

    if (routeKey === "reports") {
      if (!window.reportsApp && window.ReportsManager && document.getElementById("module-reports")) {
        window.reportsApp = new window.ReportsManager();
      }
    }

    if (routeKey === "print-jobs") {
      if (window.printJobsManager) {
        window.printJobsManager.init();
      } else if (window.PrintJobsManager && document.getElementById("module-print-jobs")) {
        window.printJobsManager = new window.PrintJobsManager();
      }
    }

    if (routeKey === "customers") {
      if (window.customersApp) {
        window.customersApp.init();
      } else if (window.CustomersManager && document.getElementById("module-customers")) {
        window.customersApp = new window.CustomersManager();
      }
    }
  }
}

// Global initialization & Turbo lifecycle management
if (typeof window !== "undefined") {
  window.Turbo = Turbo;
  window.AppRouter = AppRouter;

  const bootApp = () => {
    if (!window.appRouter) {
      window.appRouter = new AppRouter();
    } else {
      window.appRouter.onTurboLoad();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootApp);
  } else {
    bootApp();
  }

  // Handle Turbo SPA navigation events
  document.addEventListener("turbo:load", () => {
    bootApp();
  });

  // Prevent Turbo from navigating when clicking the active URL (prevents UI blink/flash)
  document.addEventListener("turbo:click", (e) => {
    try {
      const targetUrl = new URL(e.detail?.url || "", window.location.origin);
      const normalizePath = (p) => (p.replace(/\/+$/, "") || "/");
      const isSamePath = normalizePath(targetUrl.pathname) === normalizePath(window.location.pathname);
      const isSameSearch = (targetUrl.search || "") === (window.location.search || "");
      if (targetUrl.origin === window.location.origin && isSamePath && isSameSearch) {
        e.preventDefault();
      }
    } catch (_) {}
  });

  // Clean up modals, overlays, and toasts before caching snapshot
  document.addEventListener("turbo:before-cache", () => {
    document.querySelectorAll(".sidebar-overlay.active, .modal-backdrop, .modal.show, .po-modal-container.active").forEach((el) => {
      el.classList.remove("active", "show");
    });
    document.body.classList.remove("modal-open", "sidebar-open");
    document.querySelectorAll(".po-toast, .rep-toast").forEach((el) => el.remove());
  });
}
