/**
 * Reusable Sidebar & Navigation Component Orchestrator
 * Sanjeewa Advertising Printing Shop Management System
 *
 * Delegates modular responsibilities to components/sidebar/ process classes:
 * - SidebarNavigationProcess: Hover prefetch, dropdown toggles, slide/route navigation
 * - SidebarScrollProcess: Scroll position save/restore across Turbo & page loads
 * - SidebarToggleProcess: Desktop collapse/expand, mobile drawer, toggle icon sync
 * - SidebarActiveRouteProcess: URL parsing & active nav-link highlighting
 */

"use strict";

import {
  SidebarNavigationProcess,
  SidebarScrollProcess,
  SidebarToggleProcess,
  SidebarActiveRouteProcess,
} from "./sidebar/index.js";

class Navigation {
  constructor() {
    this.process = new SidebarNavigationProcess();
    this.init();
  }

  init() {
    this.process.init();
  }

  goTo(url) {
    this.process.goTo(url);
  }

  navigate(navigateLocation, targetView = null) {
    this.process.navigate(navigateLocation, targetView);
  }
}

class SidebarComponent {
  constructor() {
    this.scrollProcess = new SidebarScrollProcess();
    this.toggleProcess = new SidebarToggleProcess();
    this.activeRouteProcess = new SidebarActiveRouteProcess();

    this.init();
  }

  get sidebar() {
    return this.toggleProcess.sidebar;
  }

  get isCollapsed() {
    return this.toggleProcess.isCollapsed;
  }

  get isMobileOpen() {
    return this.toggleProcess.isMobileOpen;
  }

  init() {
    this.refreshElements();
    this.toggleProcess.initDesktopState();
    this.toggleProcess.bindEvents();
    this.scrollProcess.bindEvents();
    this.activeRouteProcess.initFromUrl();
    this.scrollProcess.restore();
  }

  refreshElements() {
    this.toggleProcess.refreshElements();
    this.activeRouteProcess.refreshElements();

    if (this.sidebar) {
      const portal = this.sidebar.getAttribute("data-portal");
      if (portal) {
        document.cookie = `sa_portal=${portal};path=/;max-age=86400;SameSite=Lax`;
        localStorage.setItem("sa-portal", portal);
      }
    }

    this.scrollProcess.attachNavListener();
    this.scrollProcess.restore();
  }

  saveScrollPosition() {
    this.scrollProcess.save();
  }

  restoreScrollPosition() {
    this.scrollProcess.restore();
  }

  toggleDesktopSidebar() {
    this.toggleProcess.toggleDesktop();
  }

  toggleMobileDrawer() {
    this.toggleProcess.toggleMobileDrawer();
  }

  openMobileDrawer() {
    this.toggleProcess.openMobileDrawer();
  }

  closeMobileDrawer() {
    this.toggleProcess.closeMobileDrawer();
  }

  updateToggleIcon() {
    this.toggleProcess.updateToggleIcon();
  }

  setActiveRoute(route, view = null) {
    this.refreshElements();
    this.activeRouteProcess.setActiveRoute(route, view);
    this.scrollProcess.restore();
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
