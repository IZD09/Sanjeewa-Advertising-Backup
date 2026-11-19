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

    // Notifications state & elements
    this.notifWrapper = document.getElementById("notificationDropdownWrapper");
    this.notifToggle = document.getElementById("topbarNotificationToggle");
    this.notifBadge = document.getElementById("topbarNotificationBadge");
    this.notifMenu = document.getElementById("topbarNotificationMenu");
    this.notifList = document.getElementById("topbarNotificationList");
    this.notifCountBadge = document.getElementById("topbarNotificationCountBadge");
    this.notifMarkAllBtn = document.getElementById("btnTopBarMarkAllRead");
    this.isNotifOpen = false;
    this.notifPollTimer = null;

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
    this.bindNotificationDropdown();

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
    }

    if (!this._docEventsBound) {
      this._docEventsBound = true;
      // Track mouse movement across the document on desktop
      document.addEventListener("mousemove", (event) => {
        if (!this.topbar) return;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => this.handleMouseMove(event));
      });

      // When mouse pointer leaves the viewport from the top, keep visible briefly
      document.addEventListener("mouseleave", () => {
        if (!this.topbar) return;
        if (!this.isPinned && !this.isDropdownOpen) {
          this.scheduleHide(600);
        }
      });
    }
  }

  bindProfileDropdown() {
    if (!this.profileToggle || !this.profileMenu) return;

    if (!this.profileToggle._bound) {
      this.profileToggle._bound = true;
      this.profileToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleProfileDropdown();
      });
    }

    if (!this._dropdownDocEventsBound) {
      this._dropdownDocEventsBound = true;
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
  }

  toggleProfileDropdown() {
    if (this.isDropdownOpen) {
      this.closeProfileDropdown();
    } else {
      this.openProfileDropdown();
    }
  }

  openProfileDropdown() {
    this.closeNotificationDropdown();
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
    if (!this.isPinned && !this.isMouseOverTopbar && !this.isNotifOpen) {
      this.scheduleHide(500);
    }
  }

  bindNotificationDropdown() {
    if (!this.notifToggle || !this.notifMenu) return;

    if (!this.notifToggle._bound) {
      this.notifToggle._bound = true;
      this.notifToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleNotificationDropdown();
      });
    }

    if (this.notifMarkAllBtn && !this.notifMarkAllBtn._bound) {
      this.notifMarkAllBtn._bound = true;
      this.notifMarkAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.markAllNotificationsAsRead();
      });
    }

    if (!this._notifDocEventsBound) {
      this._notifDocEventsBound = true;
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#notificationDropdownWrapper")) {
          this.closeNotificationDropdown();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isNotifOpen) {
          this.closeNotificationDropdown();
        }
      });
    }

    // Load initial notifications & start polling
    this.loadNotifications();
    this.startNotificationPolling();
  }

  toggleNotificationDropdown() {
    if (this.isNotifOpen) {
      this.closeNotificationDropdown();
    } else {
      this.closeProfileDropdown();
      this.openNotificationDropdown();
    }
  }

  openNotificationDropdown() {
    this.isNotifOpen = true;
    this.notifMenu.classList.add("show");
    this.notifMenu.setAttribute("aria-hidden", "false");
    this.notifToggle.setAttribute("aria-expanded", "true");
    this.clearHideTimeout();
    this.showTopbar();
    this.loadNotifications();
  }

  closeNotificationDropdown() {
    if (!this.isNotifOpen) return;
    this.isNotifOpen = false;
    this.notifMenu.classList.remove("show");
    this.notifMenu.setAttribute("aria-hidden", "true");
    this.notifToggle.setAttribute("aria-expanded", "false");
    if (!this.isPinned && !this.isMouseOverTopbar && !this.isDropdownOpen) {
      this.scheduleHide(500);
    }
  }

  startNotificationPolling() {
    if (this.notifPollTimer) clearInterval(this.notifPollTimer);
    this.notifPollTimer = setInterval(() => {
      if (!document.hidden) {
        this.loadNotifications();
      }
    }, 45000);
  }

  async loadNotifications() {
    if (!this.notifToggle) return;

    try {
      const response = await fetch("/api/v1/notifications", {
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin"
      });

      if (!response.ok) return;

      const result = await response.json();
      if (result?.success) {
        const notifications = result.data?.notifications || [];
        const unreadCount = result.data?.unread_count || 0;
        this.renderNotifications(notifications, unreadCount);
      }
    } catch (_) {
      // Quiet fail on network issues
    }
  }

  renderNotifications(notifications, unreadCount) {
    if (this.notifBadge) {
      if (unreadCount > 0) {
        this.notifBadge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
        this.notifBadge.style.display = "inline-block";
        this.notifToggle?.classList.add("has-unread");
      } else {
        this.notifBadge.style.display = "none";
        this.notifToggle?.classList.remove("has-unread");
      }
    }

    if (this.notifCountBadge) {
      this.notifCountBadge.textContent = `${unreadCount} unread`;
    }

    if (!this.notifList) return;

    if (!notifications || notifications.length === 0) {
      this.notifList.innerHTML = `
        <div class="notif-empty-state">
          <i class="fa-regular fa-bell-slash"></i>
          <p>No new notifications</p>
        </div>
      `;
      return;
    }

    const html = notifications.map(n => {
      const isUnread = !n.read_at;
      const type = n.data?.type || "info";
      const icon = n.data?.icon || "fa-solid fa-bell";
      const title = n.data?.title || "System Notification";
      const message = n.data?.message || "";
      const actionUrl = n.data?.action_url || "";
      const timeStr = this.formatRelativeTime(n.created_at);

      return `
        <div class="notif-item ${isUnread ? 'is-unread' : ''}" data-id="${n.id}" data-action="${this.escapeHtml(actionUrl)}">
          <div class="notif-icon-circle notif-icon-${this.escapeHtml(type)}">
            <i class="${this.escapeHtml(icon)}"></i>
          </div>
          <div class="notif-content">
            <div class="notif-item-title">
              <span>${this.escapeHtml(title)}</span>
              ${isUnread ? '<span class="notif-unread-dot" title="Unread"></span>' : ''}
            </div>
            <div class="notif-item-msg">${this.escapeHtml(message)}</div>
            <div class="notif-item-time">${timeStr}</div>
          </div>
        </div>
      `;
    }).join("");

    this.notifList.innerHTML = html;

    this.notifList.querySelectorAll(".notif-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        const action = item.dataset.action;
        this.markNotificationAsRead(id, action);
      });
    });
  }

  async markNotificationAsRead(id, actionUrl) {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      fetch(`/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin"
      }).catch(() => {});
    } catch (_) {}

    if (actionUrl && actionUrl.trim() !== "") {
      window.location.href = actionUrl;
    } else {
      this.loadNotifications();
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      const res = await fetch("/api/v1/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin"
      });

      if (res.ok) {
        this.loadNotifications();
      }
    } catch (_) {}
  }

  formatRelativeTime(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString("en-LK", { month: "short", day: "numeric" });
  }

  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  handleMouseMove(event) {
    if (!this.topbar) return;
    if (window.innerWidth <= 991) return; // Touch & mobile devices stay standard
    if (this.isPinned || this.isDropdownOpen || this.isNotifOpen) return; // Pinned state or active dropdown prevents auto-hiding
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
    if (!this.topbar) return;
    if (window.innerWidth <= 991 || this.isPinned || this.isDropdownOpen) return;
    if (this.isMouseOverTopbar) return;
    if (this.topbar.contains(document.activeElement)) return;

    this.hideTimeout = setTimeout(() => {
      this.hideTopbar();
    }, delay);
  }

  hideTopbar() {
    this.clearHideTimeout();
    if (!this.topbar) return;
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

  onModuleNavigate() {
    if (!this.topbar) return;
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
    this.notifWrapper = document.getElementById("notificationDropdownWrapper");
    this.notifToggle = document.getElementById("topbarNotificationToggle");
    this.notifBadge = document.getElementById("topbarNotificationBadge");
    this.notifMenu = document.getElementById("topbarNotificationMenu");
    this.notifList = document.getElementById("topbarNotificationList");
    this.notifCountBadge = document.getElementById("topbarNotificationCountBadge");
    this.notifMarkAllBtn = document.getElementById("btnTopBarMarkAllRead");

    if (!this.topbar) {
      this.clearHideTimeout();
      return;
    }

    this.initTheme();
    this.setDate();
    this.updatePinUI();
    this.bindEvents();
    this.bindProfileDropdown();
    this.bindNotificationDropdown();
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
