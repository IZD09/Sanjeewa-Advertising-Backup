/**
 * SanjeewaAdvertising - Sidebar Toggle & Drawer Process
 *
 * Manages desktop collapse/expand persistence, mobile slide-out drawer,
 * backdrop overlay, Escape key close, responsive resize sync, and toggle icon updates.
 */

"use strict";

export class SidebarToggleProcess {
  constructor() {
    this.sidebar = null;
    this.overlay = null;
    this.menuToggle = null;
    this.closeBtn = null;
    this.isCollapsed = localStorage.getItem("sa-sidebar-collapsed") === "true";
    this.isMobileOpen = false;
    this._bound = false;
  }

  refreshElements() {
    this.sidebar = document.getElementById("sidebar");
    this.overlay = document.getElementById("sidebarOverlay");
    this.menuToggle = document.getElementById("menuToggle");
    this.closeBtn = document.getElementById("sidebarClose");
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
    if (this._bound) return;
    this._bound = true;

    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest("#menuToggle");
      if (toggleBtn) {
        e.preventDefault();
        if (window.innerWidth > 991) {
          this.toggleDesktop();
        } else {
          this.toggleMobileDrawer();
        }
        return;
      }

      const closeBtn = e.target.closest("#sidebarClose");
      if (closeBtn) {
        e.preventDefault();
        this.closeMobileDrawer();
        return;
      }

      const dropdownToggle = e.target.closest(".nav-dropdown-toggle");
      if (dropdownToggle) {
        const dropdown = dropdownToggle.closest(".nav-dropdown");
        if (dropdown) {
          e.preventDefault();
          dropdown.classList.toggle("expanded");
          return;
        }
      }

      if (e.target.id === "sidebarOverlay" || e.target.closest("#sidebarOverlay")) {
        this.closeMobileDrawer();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 991) {
        this.closeMobileDrawer();
        document.body.classList.toggle("sidebar-collapsed", this.isCollapsed);
      } else {
        document.body.classList.remove("sidebar-collapsed");
      }
      this.updateToggleIcon();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMobileOpen) {
        this.closeMobileDrawer();
      }
    });
  }

  toggleDesktop() {
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
}

export default SidebarToggleProcess;
