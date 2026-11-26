/**
 * SanjeewaAdvertising - Sidebar Navigation Process
 *
 * Handles smart link hover prefetching, dropdown toggling,
 * in-dashboard slide switching, same-URL blink prevention,
 * and programmatic switch-case route navigation.
 */

"use strict";

export class SidebarNavigationProcess {
  constructor() {
    this._bound = false;
    this.prefetchedUrls = new Set();
  }

  init() {
    this.bindEvents();
  }

  prefetchUrl(url) {
    if (!url || this.prefetchedUrls.has(url) || url.startsWith("javascript:") || url.startsWith("#")) return;
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.origin !== window.location.origin || parsed.pathname === window.location.pathname) return;
      this.prefetchedUrls.add(url);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      link.as = "document";
      document.head.appendChild(link);
    } catch (_) {}
  }

  bindEvents() {
    if (this._bound) return;
    this._bound = true;

    document.addEventListener("mouseover", (e) => {
      const navBtn = e.target.closest("#mainNavigation a.nav-link[href], #mainNavigation a.nav-sublink[href]");
      if (navBtn && navBtn.href) {
        this.prefetchUrl(navBtn.href);
      }
    }, { passive: true });

    document.addEventListener("click", (e) => {
      const navBtn = e.target.closest("button.nav-link, button.nav-sublink, button[data-route], a.nav-link, a.nav-sublink, a[data-route]");
      if (!navBtn) return;

      const nav = document.getElementById("mainNavigation");
      if (nav) {
        sessionStorage.setItem("sa-sidebar-scroll", nav.scrollTop);
      }

      // 1. Handle dropdown toggle
      const dropdownToggle = navBtn.classList.contains("nav-dropdown-toggle") ? navBtn : null;
      if (dropdownToggle) {
        e.preventDefault();
        const dropdown = dropdownToggle.closest(".nav-dropdown");
        if (dropdown) {
          dropdown.classList.toggle("expanded");
        }
        return;
      }

      // 2. Handle in-dashboard slide switches
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

      // 3. Prevent re-fetching/blinking if already on that exact URL
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
    if (navigateLocation !== "dashboard" && navigateLocation !== "sales-revenue" && window.dashboardInstance && typeof window.dashboardInstance.destroy === "function") {
      try {
        window.dashboardInstance.destroy();
      } catch (_) {}
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

      case "hr-management":
        if (window.location.pathname === "/admin/hr-management" || window.location.pathname === "/hr-management") return;
        this.goTo("/admin/hr-management");
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

export default SidebarNavigationProcess;
