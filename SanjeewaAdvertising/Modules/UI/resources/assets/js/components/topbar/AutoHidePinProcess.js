/**
 * SanjeewaAdvertising - Topbar Auto-Hide & Pin Process
 *
 * Handles desktop hover auto-hide, pin/lock state persistence, peek pill reveal,
 * keyboard focus retention, and smooth requestAnimationFrame pointer tracking.
 */

"use strict";

export class AutoHidePinProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.hasOpenDropdown] Returns true when profile or notification dropdown is open
   */
  constructor(options = {}) {
    this.hasOpenDropdown = typeof options.hasOpenDropdown === "function" ? options.hasOpenDropdown : () => false;

    this.topbar = null;
    this.hoverZone = null;
    this.mainArea = null;
    this.pinBtn = null;
    this.peekPill = null;

    this.isPinned = localStorage.getItem("sa-topbar-pinned") === "true";
    this.hideTimeout = null;
    this.isMouseOverTopbar = false;
    this.rafId = null;
    this._docEventsBound = false;
  }

  refreshElements() {
    this.topbar = document.getElementById("topbar");
    this.hoverZone = document.getElementById("topbarHoverZone");
    this.mainArea = document.getElementById("mainArea");
    this.pinBtn = document.getElementById("topbarPinToggle");
    this.peekPill = document.getElementById("topbarPeekPill");
  }

  init() {
    this.refreshElements();
    if (!this.topbar) {
      this.clearHideTimeout();
      return;
    }

    this.updatePinUI();
    this.bindEvents();
  }

  showInitialState() {
    if (!this.topbar) return;
    if (this.isPinned) {
      this.showTopbar();
    } else {
      this.showTopbar();
      this.scheduleHide(2200);
    }
  }

  bindEvents() {
    if (!this.topbar) return;

    if (this.pinBtn && !this.pinBtn._bound) {
      this.pinBtn._bound = true;
      this.pinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePin();
      });
    }

    if (this.peekPill && !this.peekPill._bound) {
      this.peekPill._bound = true;
      this.peekPill.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePin(true);
      });
      this.peekPill.addEventListener("mouseenter", () => {
        this.showTopbar();
      });
    }

    if (this.hoverZone && !this.hoverZone._bound) {
      this.hoverZone._bound = true;
      this.hoverZone.addEventListener("mouseenter", () => {
        this.showTopbar();
      });
      this.hoverZone.addEventListener("mousemove", () => {
        this.showTopbar();
      });
    }

    if (!this.topbar._bound) {
      this.topbar._bound = true;

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

      this.topbar.addEventListener("focusin", () => {
        this.clearHideTimeout();
        this.showTopbar();
      });

      this.topbar.addEventListener("focusout", (e) => {
        if (!this.topbar.contains(e.relatedTarget) && !this.isPinned) {
          this.scheduleHide(400);
        }
      });
    }

    if (!this._docEventsBound) {
      this._docEventsBound = true;

      document.addEventListener("mousemove", (event) => {
        if (!this.topbar) return;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => this.handleMouseMove(event));
      });

      document.addEventListener("mouseleave", () => {
        if (!this.topbar) return;
        if (!this.isPinned && !this.hasOpenDropdown()) {
          this.scheduleHide(600);
        }
      });
    }
  }

  handleMouseMove(event) {
    if (!this.topbar) return;
    if (window.innerWidth <= 991) return;
    if (this.isPinned || this.hasOpenDropdown()) return;
    if (this.topbar.contains(document.activeElement)) return;

    if (this.mainArea) {
      const mainRect = this.mainArea.getBoundingClientRect();
      if (event.clientX < mainRect.left || event.clientX > mainRect.right) {
        return;
      }
    }

    const headerHeight = this.topbar.offsetHeight || 58;

    if (event.clientY <= headerHeight + 5) {
      this.clearHideTimeout();
      this.showTopbar();
    } else if (event.clientY > headerHeight + 15 && !this.isMouseOverTopbar) {
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
    if (!this.topbar) return;
    if (window.innerWidth <= 991 || this.isPinned || this.hasOpenDropdown()) return;
    if (this.isMouseOverTopbar) return;
    if (this.topbar.contains(document.activeElement)) return;

    this.hideTimeout = setTimeout(() => {
      this.hideTopbar();
    }, delay);
  }

  hideTopbar() {
    this.clearHideTimeout();
    if (!this.topbar) return;
    if (window.innerWidth <= 991 || this.isPinned || this.hasOpenDropdown()) return;
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
    if (!this.topbar) return;
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
    if (!this.topbar) return;
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
}

export default AutoHidePinProcess;
