/**
 * SanjeewaAdvertising - Topbar Notification Controller
 *
 * Dedicated OOP controller managing in-app notifications:
 * - Dropdown open/close/toggle & keyboard/outside-click handling
 * - Live fetching via /advertising/notifications (low-priority + 503 backoff)
 * - Rendering notification items, unread badges, and relative timestamps
 * - Single-item and mark-all-as-read actions
 * - Centralized LiveSyncManager subscription for real-time badge updates
 */

"use strict";

import { LiveSyncManager } from "../../core/LiveSyncManager.js";

export class NotificationController {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onOpen] Callback invoked when notification menu opens
   * @param {Function} [options.onClose] Callback invoked when notification menu closes
   * @param {string} [options.endpoint="/advertising/notifications"] Base notifications endpoint
   */
  constructor(options = {}) {
    this.onOpen = typeof options.onOpen === "function" ? options.onOpen : null;
    this.onClose = typeof options.onClose === "function" ? options.onClose : null;
    this.endpoint = options.endpoint || "/advertising/notifications";

    this.isOpen = false;
    this._docEventsBound = false;
    this._unsubscribeSync = null;

    this.refreshElements();
  }

  refreshElements() {
    this.wrapper = document.getElementById("notificationDropdownWrapper");
    this.toggleBtn = document.getElementById("topbarNotificationToggle");
    this.badge = document.getElementById("topbarNotificationBadge");
    this.menu = document.getElementById("topbarNotificationMenu");
    this.list = document.getElementById("topbarNotificationList");
    this.countBadge = document.getElementById("topbarNotificationCountBadge");
    this.markAllBtn = document.getElementById("btnTopBarMarkAllRead");
  }

  /**
   * Bind UI events, fetch initial notifications, and subscribe to LiveSyncManager.
   */
  init() {
    this.refreshElements();
    if (!this.toggleBtn || !this.menu) return;

    if (!this.toggleBtn._notifBound) {
      this.toggleBtn._notifBound = true;
      this.toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    if (this.markAllBtn && !this.markAllBtn._notifBound) {
      this.markAllBtn._notifBound = true;
      this.markAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.markAllAsRead();
      });
    }

    if (!this._docEventsBound) {
      this._docEventsBound = true;

      this._onDocClick = (e) => {
        if (!e.target.closest("#notificationDropdownWrapper")) {
          this.close();
        }
      };

      this._onDocKeydown = (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      };

      document.addEventListener("click", this._onDocClick);
      document.addEventListener("keydown", this._onDocKeydown);
    }

    this.load();
    this.subscribeLiveSync();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.menu || !this.toggleBtn) return;

    this.isOpen = true;
    this.menu.classList.add("show");
    this.menu.setAttribute("aria-hidden", "false");
    this.toggleBtn.setAttribute("aria-expanded", "true");

    if (this.onOpen) this.onOpen();
    this.load();
  }

  close() {
    if (!this.isOpen || !this.menu || !this.toggleBtn) return;

    this.isOpen = false;
    this.menu.classList.remove("show");
    this.menu.setAttribute("aria-hidden", "true");
    this.toggleBtn.setAttribute("aria-expanded", "false");

    if (this.onClose) this.onClose();
  }

  /**
   * Subscribe to centralized LiveSyncManager instead of independent polling timers.
   */
  subscribeLiveSync() {
    if (typeof this._unsubscribeSync === "function") {
      this._unsubscribeSync();
      this._unsubscribeSync = null;
    }

    this._unsubscribeSync = LiveSyncManager.subscribe(
      ["orders", "print_jobs", "payments", "inventory", "grn", "users"],
      () => {
        if (!document.hidden) {
          this.load();
        }
      },
      { key: "topbar-notifications-live-sync" }
    );
  }

  /**
   * Fetch notifications list and unread count from backend.
   */
  async load() {
    if (!this.toggleBtn) return;

    try {
      const response = await fetch(this.endpoint, {
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Request-Priority": "low",
        },
        priority: "low",
        credentials: "same-origin",
      });

      if (response.status === 503 || !response.ok) {
        return;
      }

      const result = await response.json();
      if (result?.success) {
        const notifications = result.data?.notifications || [];
        const unreadCount = result.data?.unread_count || 0;
        this.render(notifications, unreadCount);
      }
    } catch (_) {
      // Quiet fail on transient network issues
    }
  }

  /**
   * Render notification badge and dropdown list items.
   *
   * @param {Array<Object>} notifications
   * @param {number} unreadCount
   */
  render(notifications, unreadCount) {
    if (this.badge) {
      if (unreadCount > 0) {
        this.badge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
        this.badge.style.display = "inline-block";
        this.toggleBtn?.classList.add("has-unread");
      } else {
        this.badge.style.display = "none";
        this.toggleBtn?.classList.remove("has-unread");
      }
    }

    if (this.countBadge) {
      this.countBadge.textContent = `${unreadCount} unread`;
    }

    if (!this.list) return;

    if (!notifications || notifications.length === 0) {
      this.list.innerHTML = `
        <div class="notif-empty-state">
          <i class="fa-regular fa-bell-slash"></i>
          <p>No new notifications</p>
        </div>
      `;
      return;
    }

    this.list.innerHTML = notifications.map((n) => {
      const payload = n.data && typeof n.data === "object" ? n.data : n;
      const isUnread = n.read !== undefined ? !n.read : !n.read_at;
      const type = payload.type || n.type || "info";
      const icon = payload.icon || n.icon || "fa-solid fa-bell";
      const title = payload.title || n.title || "System Notification";
      const message = payload.message || n.message || "";
      const actionUrl = payload.action_url || n.action_url || "";
      const timeStr = n.time_ago || this.formatRelativeTime(n.created_at);

      return `
        <div class="notif-item ${isUnread ? "is-unread" : ""}" data-id="${this.escapeHtml(String(n.id || ""))}" data-action="${this.escapeHtml(actionUrl)}">
          <div class="notif-icon-circle notif-icon-${this.escapeHtml(type)}">
            <i class="${this.escapeHtml(icon)}"></i>
          </div>
          <div class="notif-content">
            <div class="notif-item-title">
              <span>${this.escapeHtml(title)}</span>
              ${isUnread ? '<span class="notif-unread-dot" title="Unread"></span>' : ""}
            </div>
            <div class="notif-item-msg">${this.escapeHtml(message)}</div>
            <div class="notif-item-time">${this.escapeHtml(timeStr)}</div>
          </div>
        </div>
      `;
    }).join("");

    this.list.querySelectorAll(".notif-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        const action = item.dataset.action;
        this.markAsRead(id, action);
      });
    });
  }

  /**
   * Mark a single notification as read and navigate to its action URL if present.
   *
   * @param {string} id
   * @param {string} [actionUrl=""]
   */
  async markAsRead(id, actionUrl = "") {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      fetch(`${this.endpoint}/${id}/read`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
      }).catch(() => {});
    } catch (_) {}

    if (actionUrl && actionUrl.trim() !== "") {
      window.location.href = actionUrl;
    } else {
      this.load();
    }
  }

  /**
   * Mark all unread notifications as read.
   */
  async markAllAsRead() {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      const res = await fetch(`${this.endpoint}/mark-all-read`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
      });

      if (res.ok) {
        this.load();
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
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[m]);
  }

  destroy() {
    if (typeof this._unsubscribeSync === "function") {
      this._unsubscribeSync();
      this._unsubscribeSync = null;
    }
    if (this._docEventsBound) {
      if (this._onDocClick) document.removeEventListener("click", this._onDocClick);
      if (this._onDocKeydown) document.removeEventListener("keydown", this._onDocKeydown);
      this._docEventsBound = false;
    }
  }
}

export default NotificationController;
