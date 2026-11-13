/**
 * Global Topbar Controller & Component
 * Sanjeewa Advertising Printing Shop Management System
 * Handles:
 * - Desktop hover auto-hide across all panels (mouse moves up -> shows, mouse moves away -> hides)
 * - Pin/Lock toggle to keep visible permanently
 * - Floating peek pill indicator to reveal and pin
 * - Dark / Light theme toggling with instant chart update
 * - Sri Lanka formatted live calendar date display
 * - Page Title & Breadcrumb updates
 */

"use strict";

class TopbarController {
  constructor() {
    this.topbar = document.getElementById("topbar");
    this.hoverZone = document.getElementById("topbarHoverZone");
    this.mainArea = document.getElementById("mainArea");
    this.pinBtn = document.getElementById("topbarPinToggle");
    this.peekPill = document.getElementById("topbarPeekPill");
    this.themeToggleBtn = document.getElementById("themeToggle");
    this.dateElem = document.getElementById("todayDate");
    this.pageTitleElem = document.getElementById("pageTitle");
    this.breadcrumbElem = document.getElementById("breadcrumbArea");
    this.profileToggle = document.getElementById("profileDropdownToggle");
    this.profileMenu = document.getElementById("profileDropdownMenu");
    this.isDropdownOpen = false;

    this.isPinned = localStorage.getItem("sa-topbar-pinned") === "true";
    this.hideTimeout = null;
    this.isMouseOverTopbar = false;
    this.rafId = null;

    this.init();
  }

  init() {
    if (!this.topbar) return;

    this.initTheme();
    this.setDate();
    this.updatePinUI();
    this.bindEvents();
    this.bindProfileDropdown();

    // Initial state on desktop:
    // If pinned, stay visible permanently.
    // Otherwise show briefly for 2.2s orientation, then smoothly hide.
    if (this.isPinned) {
      this.showTopbar();
    } else {
      this.showTopbar();
      this.scheduleHide(2200);
    }
  }

  setDate() {
    if (!this.dateElem) return;
    this.dateElem.textContent = new Intl.DateTimeFormat("en-LK", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date());
  }

  initTheme() {
    const savedTheme = localStorage.getItem("sa-dashboard-theme") || "light";
    document.documentElement.dataset.theme = savedTheme;
    this.updateThemeIcon();

    if (this.themeToggleBtn && !this.themeToggleBtn._bound) {
      this.themeToggleBtn._bound = true;
      this.themeToggleBtn.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme;
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("sa-dashboard-theme", next);
        this.updateThemeIcon();

        // Refresh dashboard charts if available
        if (window.dashboardInstance) {
          window.dashboardInstance.refreshVisibleCharts();
        }
      });
    }
  }

  updateThemeIcon() {
    if (!this.themeToggleBtn) return;
    this.themeToggleBtn.innerHTML = document.documentElement.dataset.theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  bindEvents() {
    if (this.pinBtn) {
      this.pinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePin();
      });
    }

    if (this.peekPill) {
      this.peekPill.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePin(true);
      });
      this.peekPill.addEventListener("mouseenter", () => {
        this.showTopbar();
      });
    }

    if (this.hoverZone) {
      this.hoverZone.addEventListener("mouseenter", () => {
        this.showTopbar();
      });
      this.hoverZone.addEventListener("mousemove", () => {
        this.showTopbar();
      });
    }

    // Direct hover persistence on the topbar itself
    this.topbar.addEventListener("mouseenter", () => {
      this.isMouseOverTopbar = true;
      this.clearHideTimeout();
      this.showTopbar();
    });

    this.topbar.addEventListener("mouseleave", () => {
      this.isMouseOverTopbar = false;
      if (!this.isPinned) {
        this.scheduleHide(300);
      }
    });

    // Keyboard accessibility: keep visible while focus is inside topbar
    this.topbar.addEventListener("focusin", () => {
      this.clearHideTimeout();
      this.showTopbar();
    });

    this.topbar.addEventListener("focusout", (e) => {
      if (!this.topbar.contains(e.relatedTarget) && !this.isPinned) {
        this.scheduleHide(400);
      }
    });

    // Track mouse movement across the document on desktop
    document.addEventListener("mousemove", (event) => {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => this.handleMouseMove(event));
    });

    // When mouse pointer leaves the viewport from the top, keep visible briefly
    document.addEventListener("mouseleave", () => {
      if (!this.isPinned && !this.isDropdownOpen) {
        this.scheduleHide(600);
      }
    });
  }

  bindProfileDropdown() {
    if (!this.profileToggle || !this.profileMenu) return;

    this.profileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleProfileDropdown();
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#profileDropdownWrapper")) {
        this.closeProfileDropdown();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isDropdownOpen) {
        this.closeProfileDropdown();
      }
    });
  }

  toggleProfileDropdown() {
    if (this.isDropdownOpen) {
      this.closeProfileDropdown();
    } else {
      this.openProfileDropdown();
    }
  }

  openProfileDropdown() {
    this.isDropdownOpen = true;
    this.profileMenu.classList.add("show");
    this.profileMenu.setAttribute("aria-hidden", "false");
    this.profileToggle.classList.add("open");
    this.profileToggle.setAttribute("aria-expanded", "true");
    this.clearHideTimeout();
    this.showTopbar();
  }

  closeProfileDropdown() {
    if (!this.isDropdownOpen) return;
    this.isDropdownOpen = false;
    this.profileMenu.classList.remove("show");
    this.profileMenu.setAttribute("aria-hidden", "true");
    this.profileToggle.classList.remove("open");
    this.profileToggle.setAttribute("aria-expanded", "false");
    if (!this.isPinned && !this.isMouseOverTopbar) {
      this.scheduleHide(500);
    }
  }

  handleMouseMove(event) {
    if (window.innerWidth <= 991) return; // Touch & mobile devices stay standard
    if (this.isPinned || this.isDropdownOpen) return; // Pinned state or active dropdown prevents auto-hiding
    if (this.topbar.contains(document.activeElement)) return; // Typing or focused control

    // Check if cursor is horizontally within the main workspace (ignore if hovering sidebar)
    if (this.mainArea) {
      const mainRect = this.mainArea.getBoundingClientRect();
      if (event.clientX < mainRect.left || event.clientX > mainRect.right) {
        return;
      }
    }

    const headerHeight = this.topbar.offsetHeight || 58;

    // Mouse enters top bar area -> SHOW topbar
    if (event.clientY <= headerHeight + 5) {
      this.clearHideTimeout();
      this.showTopbar();
    }
    // Mouse leaves top bar area -> HIDE topbar
    else if (event.clientY > headerHeight + 15 && !this.isMouseOverTopbar) {
      if (!this.hideTimeout && !this.topbar.classList.contains("topbar-hidden")) {
        this.scheduleHide(250);
      }
    }
  }

  clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  scheduleHide(delay = 300) {
    this.clearHideTimeout();
    if (window.innerWidth <= 991 || this.isPinned || this.isDropdownOpen) return;
    if (this.isMouseOverTopbar) return;
    if (this.topbar.contains(document.activeElement)) return;

    this.hideTimeout = setTimeout(() => {
      this.hideTopbar();
    }, delay);
  }

  hideTopbar() {
    this.clearHideTimeout();
    if (window.innerWidth <= 991 || this.isPinned || this.isDropdownOpen) return;
    if (this.isMouseOverTopbar) return;
    if (this.topbar.contains(document.activeElement)) return;

    this.topbar.classList.add("topbar-hidden");
    this.topbar.classList.remove("topbar-visible");
    if (this.mainArea) {
      this.mainArea.classList.add("topbar-hidden-active");
    }
  }

  showTopbar() {
    this.clearHideTimeout();
    this.topbar.classList.remove("topbar-hidden");
    this.topbar.classList.add("topbar-visible");
    if (this.mainArea) {
      this.mainArea.classList.remove("topbar-hidden-active");
    }
  }

  togglePin(forceState = null) {
    this.isPinned = forceState !== null ? forceState : !this.isPinned;
    localStorage.setItem("sa-topbar-pinned", this.isPinned ? "true" : "false");
    this.updatePinUI();
    if (this.isPinned) {
      this.clearHideTimeout();
      this.showTopbar();
    } else {
      this.scheduleHide(1500);
    }
  }

  updatePinUI() {
    if (this.isPinned) {
      this.topbar.classList.add("topbar-pinned");
      if (this.pinBtn) {
        this.pinBtn.classList.add("active");
        this.pinBtn.title = "Topbar is Pinned (Click to enable auto-hide)";
      }
      if (this.mainArea) {
        this.mainArea.classList.remove("topbar-hidden-active");
      }
    } else {
      this.topbar.classList.remove("topbar-pinned");
      if (this.pinBtn) {
        this.pinBtn.classList.remove("active");
        this.pinBtn.title = "Pin Topbar (Click to keep permanently visible)";
      }
    }
  }

  onModuleNavigate() {
    if (this.isPinned) {
      this.showTopbar();
    } else {
      this.showTopbar();
      this.scheduleHide(2200);
    }
  }

  refreshElements() {
    this.topbar = document.getElementById("topbar");
    this.hoverZone = document.getElementById("topbarHoverZone");
    this.mainArea = document.getElementById("mainArea");
    this.pinBtn = document.getElementById("topbarPinToggle");
    this.peekPill = document.getElementById("topbarPeekPill");
    this.themeToggleBtn = document.getElementById("themeToggle");
    this.dateElem = document.getElementById("todayDate");
    this.pageTitleElem = document.getElementById("pageTitle");
    this.breadcrumbElem = document.getElementById("breadcrumbArea");
    this.profileToggle = document.getElementById("profileDropdownToggle");
    this.profileMenu = document.getElementById("profileDropdownMenu");
    this.setDate();
    this.updatePinUI();
    this.bindEvents();
    this.bindProfileDropdown();
  }

  updateTitleAndBreadcrumb(title, breadcrumbHtml) {
    if (this.pageTitleElem && title) {
      this.pageTitleElem.textContent = title;
    }
    if (this.breadcrumbElem && breadcrumbHtml) {
      this.breadcrumbElem.innerHTML = breadcrumbHtml;
    }
  }
}

// Global initialization with safe readyState handling
if (typeof window !== "undefined") {
  window.TopbarController = TopbarController;
  window.TopbarComponent = TopbarController;

  const bootTopbar = () => {
    if (!window.topbarController) {
      window.topbarController = new TopbarController();
      window.topbarComponent = window.topbarController;
    } else {
      window.topbarController.refreshElements();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootTopbar);
  } else {
    bootTopbar();
  }
  document.addEventListener("turbo:load", bootTopbar);
}
