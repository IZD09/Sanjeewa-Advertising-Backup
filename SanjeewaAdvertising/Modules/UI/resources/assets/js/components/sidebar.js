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
    // Smart prefetch on hover for instant navigation
    const prefetchedUrls = new Set();
    const prefetchUrl = (url) => {
      if (!url || prefetchedUrls.has(url) || url.startsWith("javascript:") || url.startsWith("#")) return;
      try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.origin !== window.location.origin || parsed.pathname === window.location.pathname) return;
        prefetchedUrls.add(url);
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        link.as = "document";
        document.head.appendChild(link);
      } catch (_) {}
    };

    document.addEventListener("mouseover", (e) => {
      const navBtn = e.target.closest("#mainNavigation a.nav-link[href], #mainNavigation a.nav-sublink[href]");
      if (navBtn && navBtn.href) {
        prefetchUrl(navBtn.href);
      }
    }, { passive: true });

    document.addEventListener("click", (e) => {
      // Find button or link clicked within navigation
      const navBtn = e.target.closest("button.nav-link, button.nav-sublink, button[data-route], a.nav-link, a.nav-sublink, a[data-route]");
      if (!navBtn) return;

      const nav = document.getElementById("mainNavigation");
      if (nav) {
        sessionStorage.setItem("sa-sidebar-scroll", nav.scrollTop);
      }

      // 1. Handle dropdown toggle (Payments)
      const dropdownToggle = navBtn.classList.contains("nav-dropdown-toggle") ? navBtn : null;
      if (dropdownToggle) {
        e.preventDefault();
        const dropdown = dropdownToggle.closest(".nav-dropdown");
        if (dropdown) {
          dropdown.classList.toggle("expanded");
        }
        return;
      }

      // 2. Handle in-dashboard slide switches (e.g. Dashboard -> Slide 0, Sales & Revenue -> Slide 1)
      if (navBtn.hasAttribute("data-slide") && (window.location.pathname === "/admin/dashboard" || window.location.pathname === "/dashboard" || window.location.pathname === "/")) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const slideIndex = parseInt(navBtn.getAttribute("data-slide"), 10);
        if (window.dashboardInstance && typeof window.dashboardInstance.showSlide === "function") {
          window.dashboardInstance.showSlide(slideIndex);
        }
        if (window.sidebarComponent) {
          window.sidebarComponent.setActiveRoute(navBtn.getAttribute("data-route") || "dashboard");
        }
        return false;
      }

      // 3. For any regular link with an href, prevent re-fetching/blinking if already on that page
      if (navBtn.tagName === "A" && navBtn.hasAttribute("href")) {
        try {
          const targetUrl = new URL(navBtn.href, window.location.origin);
          const normalizePath = (p) => (p.replace(/\/+$/, "") || "/");
          const isSamePath = normalizePath(targetUrl.pathname) === normalizePath(window.location.pathname);
          const isSameSearch = (targetUrl.search || "") === (window.location.search || "");

          if (targetUrl.origin === window.location.origin && isSamePath && isSameSearch) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        } catch (_) {}
        return;
      }

      // 4. Fallback for elements without href
      const navigateLocation = navBtn.getAttribute("data-route");
      const targetView = navBtn.getAttribute("data-view");

      if (navigateLocation) {
        this.navigate(navigateLocation, targetView);
      }
    }, { capture: true });
  }

  goTo(url) {
    const nav = document.getElementById("mainNavigation");
    if (nav) {
      sessionStorage.setItem("sa-sidebar-scroll", nav.scrollTop);
    }
    if (window.Turbo && typeof window.Turbo.visit === "function") {
      window.Turbo.visit(url);
    } else {
      window.location.href = url;
    }
  }

  navigate(navigateLocation, targetView = null) {
    // Terminate any active dashboard connections or streams before navigating to another page
    if (navigateLocation !== "dashboard" && navigateLocation !== "sales-revenue" && window.dashboardInstance && typeof window.dashboardInstance.destroy === "function") {
      try {
        window.dashboardInstance.destroy();
      } catch (e) {}
    }

    switch (navigateLocation) {
      case "dashboard":
        if (window.location.pathname === "/admin/dashboard" || window.location.pathname === "/dashboard" || window.location.pathname === "/") {
          if (window.dashboardInstance && typeof window.dashboardInstance.showSlide === "function") {
            window.dashboardInstance.showSlide(0);
          }
          if (window.sidebarComponent) {
            window.sidebarComponent.setActiveRoute("dashboard");
          }
          return;
        }
        this.goTo("/admin/dashboard");
        break;

      case "sales-revenue":
        if (window.location.pathname === "/admin/dashboard" || window.location.pathname === "/dashboard" || window.location.pathname === "/") {
          if (window.dashboardInstance && typeof window.dashboardInstance.showSlide === "function") {
            window.dashboardInstance.showSlide(1);
          }
          if (window.sidebarComponent) {
            window.sidebarComponent.setActiveRoute("sales-revenue");
          }
          return;
        }
        this.goTo("/admin/dashboard?slide=1");
        break;

      case "reports":
        if (window.location.pathname === "/reports") return;
        this.goTo("/reports");
        break;

      case "print-jobs":
        if (targetView === "design") {
          if (window.location.pathname === "/print-jobs" && window.location.search.includes("view=design")) return;
          this.goTo("/print-jobs?view=design");
        } else {
          if (window.location.pathname === "/print-jobs" && (!window.location.search || !window.location.search.includes("view=design"))) return;
          this.goTo("/print-jobs");
        }
        break;

      case "place-order":
        if (targetView === "orders") {
          if (window.location.pathname === "/place-order" && window.location.search.includes("view=orders")) return;
          this.goTo("/place-order?view=orders");
        } else {
          if (window.location.pathname === "/place-order" && (!window.location.search || window.location.search.includes("view=form"))) return;
          this.goTo("/place-order");
        }
        break;

      case "customers":
        if (window.location.pathname === "/customers") return;
        this.goTo("/customers");
        break;

      case "payments":
        if (targetView === "invoice-payment") {
          if (window.location.pathname === "/payments" && window.location.search.includes("view=invoice-payment")) return;
          this.goTo("/payments?view=invoice-payment");
        } else if (targetView === "grn-payment") {
          if (window.location.pathname === "/payments" && window.location.search.includes("view=grn-payment")) return;
          this.goTo("/payments?view=grn-payment");
        } else if (targetView === "expenses" || targetView === "expense") {
          if (window.location.pathname === "/payments" && (window.location.search.includes("view=expenses") || window.location.search.includes("view=expense"))) return;
          this.goTo("/payments?view=expenses");
        } else {
          if (window.location.pathname === "/payments" && !window.location.search) return;
          this.goTo("/payments");
        }
        break;

      case "inventory":
        if (targetView === "categories") {
          if (window.location.pathname === "/inventory" && window.location.search.includes("view=categories")) return;
          this.goTo("/inventory?view=categories");
        } else {
          if (window.location.pathname === "/inventory" && !window.location.search) return;
          this.goTo("/inventory");
        }
        break;

      case "grn":
        if (targetView === "po") {
          if (window.location.pathname === "/grn" && window.location.search.includes("view=po")) return;
          this.goTo("/grn?view=po");
        } else if (targetView === "suppliers") {
          if (window.location.pathname === "/grn" && window.location.search.includes("view=suppliers")) return;
          this.goTo("/grn?view=suppliers");
        } else {
          if (window.location.pathname === "/grn" && !window.location.search) return;
          this.goTo("/grn");
        }
        break;

      case "user-control":
        if (window.location.pathname === "/admin/user-control" || window.location.pathname === "/user-control") return;
        this.goTo("/admin/user-control");
        break;

      case "settings":
        if (window.location.pathname === "/settings") return;
        this.goTo("/settings");
        break;

      default:
        if (window.location.pathname === "/" + navigateLocation) return;
        this.goTo("/" + navigateLocation);
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
    this.initActiveRouteFromUrl();
  }

  initActiveRouteFromUrl() {
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const parts = rawPath.split("/");
    let route = (parts[0] === "admin" && parts[1]) ? parts[1] : (parts[0] || "dashboard");
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get("view");
    const slide = searchParams.get("slide");

    if ((route === "dashboard" || route === "") && slide === "1") {
      route = "sales-revenue";
    }

    this.setActiveRoute(route, view);
  }

  refreshElements() {
    this.sidebar = document.getElementById("sidebar");
    if (this.sidebar) {
      const portal = this.sidebar.getAttribute("data-portal");
      if (portal) {
        document.cookie = `sa_portal=${portal};path=/;max-age=86400;SameSite=Lax`;
        localStorage.setItem("sa-portal", portal);
      }
    }
    this.overlay = document.getElementById("sidebarOverlay");
    this.menuToggle = document.getElementById("menuToggle");
    this.closeBtn = document.getElementById("sidebarClose");
    this.navLinks = [...document.querySelectorAll(".sidebar .nav-link, .sidebar .nav-sublink")];
    this.dropdowns = [...document.querySelectorAll(".sidebar .nav-dropdown")];

    // Restore scroll position
    this.restoreScrollPosition();

    // Attach real-time scroll listener to mainNavigation
    const nav = document.getElementById("mainNavigation");
    if (nav && !nav._hasScrollListener) {
      nav._hasScrollListener = true;
      nav.addEventListener("scroll", () => {
        sessionStorage.setItem("sa-sidebar-scroll", nav.scrollTop);
      }, { passive: true });
    }
  }

  saveScrollPosition() {
    const nav = document.getElementById("mainNavigation");
    if (nav) {
      sessionStorage.setItem("sa-sidebar-scroll", nav.scrollTop);
    }
  }

  restoreScrollPosition() {
    const nav = document.getElementById("mainNavigation");
    if (!nav) return;
    const saved = sessionStorage.getItem("sa-sidebar-scroll");
    if (saved !== null) {
      const top = parseInt(saved, 10);
      if (!isNaN(top)) {
        nav.scrollTop = top;
        requestAnimationFrame(() => {
          if (nav) nav.scrollTop = top;
        });
        setTimeout(() => {
          if (nav) nav.scrollTop = top;
        }, 60);
      }
    } else {
      const activeLink = nav.querySelector(".nav-link.active, .nav-sublink.active");
      if (activeLink) {
        activeLink.scrollIntoView({ block: "nearest" });
      }
    }
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
          e.preventDefault();
          dropdown.classList.toggle("expanded");
          return;
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

    // Save scroll on clicking any navigation link or button
    document.addEventListener("click", (e) => {
      const navBtn = e.target.closest("#mainNavigation a, #mainNavigation button");
      if (navBtn) {
        this.saveScrollPosition();
      }
    }, { capture: true, passive: true });

    // Save scroll before Turbo visits another page
    document.addEventListener("turbo:before-visit", () => {
      this.saveScrollPosition();
    });

    // Restore scroll when Turbo renders
    document.addEventListener("turbo:render", () => {
      this.restoreScrollPosition();
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

    this.restoreScrollPosition();
  }
}

// Global initialization with safe readyState handling
if (typeof window !== "undefined") {
  window.Navigation = Navigation;
  window.SidebarComponent = SidebarComponent;

  const bootSidebar = () => {
    if (!window.navigation) {
      window.navigation = new Navigation();
    }
    if (!window.sidebarComponent) {
      window.sidebarComponent = new SidebarComponent();
    } else {
      window.sidebarComponent.refreshElements();
    }
    if (window.sidebarComponent) {
      window.sidebarComponent.restoreScrollPosition();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSidebar);
  } else {
    bootSidebar();
  }
  document.addEventListener("turbo:load", bootSidebar);
}
