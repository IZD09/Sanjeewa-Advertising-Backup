/**
 * Reusable Sidebar & Navigation Component
 * Sanjeewa Advertising Printing Shop Management System
 * Handles: Switch-case Navigation, Desktop Collapse/Expand, Mobile Drawer, Link Active States
 */

"use strict";

class Navigation {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      // Find button clicked within navigation
      const navBtn = e.target.closest("button.nav-link, button.nav-sublink, button[data-route]");
      if (!navBtn) return;

      // If clicked specifically on the caret inside a dropdown toggle, only toggle dropdown (don't navigate)
      if (e.target.closest(".nav-caret")) {
        return;
      }

      const navigateLocation = navBtn.getAttribute("data-route");
      const targetView = navBtn.getAttribute("data-view");

      if (navigateLocation) {
        this.navigate(navigateLocation, targetView);
      }
    });
  }

  navigate(navigateLocation, targetView = null) {
    // Terminate any active dashboard connections or streams before navigating to another page
    if (navigateLocation !== "dashboard" && window.dashboardInstance && typeof window.dashboardInstance.destroy === "function") {
      try {
        window.dashboardInstance.destroy();
      } catch (e) {}
    }

    switch (navigateLocation) {
      case "dashboard":
        if (window.location.pathname === "/dashboard" || window.location.pathname === "/") {
          if (window.dashboardInstance && typeof window.dashboardInstance.showSlide === "function") {
            window.dashboardInstance.showSlide(0);
          }
          return;
        }
        window.location.href = "/dashboard";
        break;

      case "reports":
        if (window.location.pathname === "/reports") return;
        window.location.href = "/reports";
        break;

      case "print-jobs":
        if (window.location.pathname === "/print-jobs") return;
        window.location.href = "/print-jobs";
        break;

      case "place-order":
        if (targetView === "orders") {
          if (window.location.pathname === "/place-order" && window.location.search.includes("view=orders")) return;
          window.location.href = "/place-order?view=orders";
        } else {
          if (window.location.pathname === "/place-order" && (!window.location.search || window.location.search.includes("view=form"))) return;
          window.location.href = "/place-order";
        }
        break;

      case "customers":
        if (window.location.pathname === "/customers") return;
        window.location.href = "/customers";
        break;

      case "payments":
        if (targetView === "invoice-payment") {
          if (window.location.pathname === "/payments" && window.location.search.includes("view=invoice-payment")) return;
          window.location.href = "/payments?view=invoice-payment";
        } else if (targetView === "grn-payment") {
          if (window.location.pathname === "/payments" && window.location.search.includes("view=grn-payment")) return;
          window.location.href = "/payments?view=grn-payment";
        } else if (targetView === "expenses" || targetView === "expense") {
          if (window.location.pathname === "/payments" && (window.location.search.includes("view=expenses") || window.location.search.includes("view=expense"))) return;
          window.location.href = "/payments?view=expenses";
        } else {
          if (window.location.pathname === "/payments" && !window.location.search) return;
          window.location.href = "/payments";
        }
        break;

      case "inventory":
        if (targetView === "categories") {
          if (window.location.pathname === "/inventory" && window.location.search.includes("view=categories")) return;
          window.location.href = "/inventory?view=categories";
        } else {
          if (window.location.pathname === "/inventory" && !window.location.search) return;
          window.location.href = "/inventory";
        }
        break;

      case "grn":
        if (targetView === "po") {
          if (window.location.pathname === "/grn" && window.location.search.includes("view=po")) return;
          window.location.href = "/grn?view=po";
        } else if (targetView === "suppliers") {
          if (window.location.pathname === "/grn" && window.location.search.includes("view=suppliers")) return;
          window.location.href = "/grn?view=suppliers";
        } else {
          if (window.location.pathname === "/grn" && !window.location.search) return;
          window.location.href = "/grn";
        }
        break;

      case "settings":
        if (window.location.pathname === "/settings") return;
        window.location.href = "/settings";
        break;

      default:
        if (window.location.pathname === "/" + navigateLocation) return;
        window.location.href = "/" + navigateLocation;
        break;
    }
  }
}

class SidebarComponent {
  constructor() {
    this.sidebar = null;
    this.overlay = null;
    this.menuToggle = null;
    this.closeBtn = null;
    this.navLinks = [];
    this.isCollapsed = localStorage.getItem("sa-sidebar-collapsed") === "true";
    this.isMobileOpen = false;
    this.isBound = false;

    this.init();
  }

  init() {
    this.refreshElements();
    this.initDesktopState();
    this.bindEvents();
  }

  refreshElements() {
    this.sidebar = document.getElementById("sidebar");
    this.overlay = document.getElementById("sidebarOverlay");
    this.menuToggle = document.getElementById("menuToggle");
    this.closeBtn = document.getElementById("sidebarClose");
    this.navLinks = [...document.querySelectorAll(".sidebar .nav-link, .sidebar .nav-sublink")];
    this.dropdowns = [...document.querySelectorAll(".sidebar .nav-dropdown")];
  }

  initDesktopState() {
    if (window.innerWidth > 991 && this.isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else if (window.innerWidth <= 991) {
      document.body.classList.remove("sidebar-collapsed");
    }
    this.updateToggleIcon();
  }

  bindEvents() {
    if (this.isBound) return;
    this.isBound = true;

    // Toggle menu button (shared in Topbar)
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest("#menuToggle");
      if (toggleBtn) {
        e.preventDefault();
        if (window.innerWidth > 991) {
          this.toggleDesktopSidebar();
        } else {
          this.toggleMobileDrawer();
        }
        return;
      }

      // Close button inside mobile sidebar
      const closeBtn = e.target.closest("#sidebarClose");
      if (closeBtn) {
        e.preventDefault();
        this.closeMobileDrawer();
        return;
      }

      // Dropdown toggle click inside sidebar
      const dropdownToggle = e.target.closest(".nav-dropdown-toggle");
      if (dropdownToggle) {
        const dropdown = dropdownToggle.closest(".nav-dropdown");
        if (dropdown) {
          // If clicked on caret or to expand/collapse dropdown
          if (e.target.closest(".nav-caret")) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle("expanded");
            return;
          }
          // Otherwise expand dropdown
          dropdown.classList.add("expanded");
        }
      }

      // Overlay click
      if (e.target.id === "sidebarOverlay" || e.target.closest("#sidebarOverlay")) {
        this.closeMobileDrawer();
        return;
      }
    });

    // Window resize handler
    window.addEventListener("resize", () => {
      if (window.innerWidth > 991) {
        this.closeMobileDrawer();
        document.body.classList.toggle("sidebar-collapsed", this.isCollapsed);
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
      this.updateToggleIcon();
    });

    // Close mobile drawer on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMobileOpen) {
        this.closeMobileDrawer();
      }
    });
  }

  toggleDesktopSidebar() {
    this.isCollapsed = !this.isCollapsed;
    document.body.classList.toggle("sidebar-collapsed", this.isCollapsed);
    localStorage.setItem("sa-sidebar-collapsed", this.isCollapsed ? "true" : "false");
    this.updateToggleIcon();

    window.dispatchEvent(new Event("resize"));
    setTimeout(() => window.dispatchEvent(new Event("resize")), 150);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
  }

  toggleMobileDrawer() {
    if (this.isMobileOpen) {
      this.closeMobileDrawer();
    } else {
      this.openMobileDrawer();
    }
  }

  openMobileDrawer() {
    this.refreshElements();
    this.isMobileOpen = true;
    if (this.sidebar) this.sidebar.classList.add("mobile-open");
    if (this.overlay) this.overlay.classList.add("visible");
    document.body.classList.add("sidebar-open");
    this.updateToggleIcon();
  }

  closeMobileDrawer() {
    this.refreshElements();
    this.isMobileOpen = false;
    if (this.sidebar) this.sidebar.classList.remove("mobile-open");
    if (this.overlay) this.overlay.classList.remove("visible");
    document.body.classList.remove("sidebar-open");
    this.updateToggleIcon();
  }

  updateToggleIcon() {
    const toggle = document.getElementById("menuToggle");
    if (!toggle) return;

    if (window.innerWidth > 991) {
      const collapsed = document.body.classList.contains("sidebar-collapsed");
      toggle.setAttribute("aria-label", collapsed ? "Show sidebar" : "Hide sidebar");
      toggle.setAttribute("title", collapsed ? "Show sidebar" : "Hide sidebar");
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      toggle.classList.toggle("collapsed-active", collapsed);
      toggle.innerHTML = collapsed
        ? '<i class="fa-solid fa-bars-staggered"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    } else {
      toggle.setAttribute("aria-label", "Toggle navigation menu");
      toggle.setAttribute("title", "Toggle navigation menu");
      toggle.setAttribute("aria-expanded", this.isMobileOpen ? "true" : "false");
      toggle.classList.remove("collapsed-active");
      toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  }

  setActiveRoute(route, view = null) {
    this.refreshElements();
    let matchedSpecific = false;

    // If route is payments, ensure payments dropdown is expanded
    if (route === "payments") {
      const payDropdown = document.getElementById("paymentsDropdown");
      if (payDropdown) payDropdown.classList.add("expanded");
    }

    if (view && view !== "list" && view !== "all") {
      this.navLinks.forEach(link => {
        const linkRoute = link.getAttribute("data-route");
        const linkView = link.getAttribute("data-view");
        const normalizedView = (view === "invoice" ? "invoice-payment" : (view === "grn" ? "grn-payment" : (view === "expense" ? "expenses" : view)));
        const normalizedLinkView = (linkView === "invoice" ? "invoice-payment" : (linkView === "grn" ? "grn-payment" : (linkView === "expense" ? "expenses" : linkView)));
        
        if (linkRoute === route && (linkView === view || normalizedLinkView === normalizedView)) {
          link.classList.add("active");
          matchedSpecific = true;
        } else {
          link.classList.remove("active");
        }
      });
    }

    if (!matchedSpecific) {
      // Find the primary link for this route (one without data-view or with data-view matching route/list)
      const primaryLink = this.navLinks.find(link => 
        link.getAttribute("data-route") === route && 
        (!link.hasAttribute("data-view") || link.getAttribute("data-view") === "list" || link.getAttribute("data-view") === route)
      );

      let activatedPrimary = false;
      this.navLinks.forEach(link => {
        if (primaryLink && link === primaryLink) {
          link.classList.add("active");
          activatedPrimary = true;
        } else if (!primaryLink && link.getAttribute("data-route") === route && !activatedPrimary) {
          link.classList.add("active");
          activatedPrimary = true;
        } else {
          link.classList.remove("active");
        }
      });
    }
  }
}

// Global initialization
if (typeof window !== "undefined") {
  window.Navigation = Navigation;
  window.SidebarComponent = SidebarComponent;
  document.addEventListener("DOMContentLoaded", () => {
    window.navigation = new Navigation();
    window.sidebarComponent = new SidebarComponent();
  });
}
