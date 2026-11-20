/**
 * Admin Activity Audit Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { BaseTableRowBuilder } from "../../../core/BaseTableRowBuilder.js";

export class AdminActivityRowBuilder extends BaseTableRowBuilder {
  /**
   * Resolve color/icon visual metadata for an activity item.
   *
   * @param {Object} item
   * @returns {Object}
   */
  static getVisuals(item = {}) {
    const type = String(item.type || "").toLowerCase();
    const action = String(item.action || "").toLowerCase();

    if (type.includes("login") || action.includes("login")) {
      return {
        rowClass: "upm-act-row-login",
        dotClass: "upm-dot-login",
        badgeClass: "ap-badge-green",
        icon: "fa-solid fa-right-to-bracket",
        iconColor: "#52c41a",
      };
    }

    if (type.includes("logout") || action.includes("logout")) {
      return {
        rowClass: "upm-act-row-logout",
        dotClass: "upm-dot-logout",
        badgeClass: "ap-badge-orange",
        icon: "fa-solid fa-right-from-bracket",
        iconColor: "#fa8c16",
      };
    }

    if (type.includes("permission") || action.includes("permission")) {
      return {
        rowClass: "upm-act-row-permission",
        dotClass: "upm-dot-permission",
        badgeClass: "ap-badge-blue",
        icon: "fa-solid fa-user-shield",
        iconColor: "#1677ff",
      };
    }

    if (
      type.includes("password") ||
      type.includes("security") ||
      type.includes("credential") ||
      action.includes("password") ||
      action.includes("security") ||
      action.includes("credential") ||
      action.includes("lock")
    ) {
      return {
        rowClass: "upm-act-row-security",
        dotClass: "upm-dot-security",
        badgeClass: "ap-badge-red",
        icon: "fa-solid fa-shield-halved",
        iconColor: "#ff4d4f",
      };
    }

    if (type.includes("user") || type.includes("admin") || type.includes("status")) {
      return {
        rowClass: "upm-act-row-status",
        dotClass: "upm-dot-status",
        badgeClass: "ap-badge-orange",
        icon: "fa-solid fa-user-gear",
        iconColor: "#faad14",
      };
    }

    return {
      rowClass: "",
      dotClass: "upm-dot-login",
      badgeClass: "ap-badge-purple",
      icon: "fa-solid fa-clock-rotate-left",
      iconColor: "#722ed1",
    };
  }

  /**
   * Format relative human-readable time string from an ISO/date timestamp.
   *
   * @param {string|null|undefined} dateStr
   * @returns {string}
   */
  static formatRelativeTime(dateStr) {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.round(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-LK", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  }

  /**
   * Build HTML markup for a single admin activity row.
   *
   * @returns {string}
   */
  build() {
    const item = this._data || {};
    const visuals = AdminActivityRowBuilder.getVisuals(item);
    const relativeTime = AdminActivityRowBuilder.formatRelativeTime(item.timestamp);
    const formattedTime = item.formatted_time || (item.timestamp ? new Date(item.timestamp).toLocaleString() : "—");

    let detailChips = "";
    if (item.details && typeof item.details === "object") {
      const details = item.details;
      const chips = [];
      if (details.username) {
        chips.push(`<span class="ant-tag" style="font-size: 11px;">User: @${this.escapeHtml(details.username)}</span>`);
      }
      if (details.modules_count !== undefined) {
        chips.push(`<span class="ant-tag ant-tag-blue" style="font-size: 11px;">${this.escapeHtml(details.modules_count)} modules</span>`);
      }
      if (details.status) {
        chips.push(`<span class="ant-tag ant-tag-orange" style="font-size: 11px;">Status: ${this.escapeHtml(details.status)}</span>`);
      }
      if (details.ip_address) {
        chips.push(`<span class="ant-tag" style="font-size: 11px;">IP: ${this.escapeHtml(details.ip_address)}</span>`);
      }
      if (chips.length > 0) {
        detailChips = `<div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">${chips.join("")}</div>`;
      }
    }

    const actionMeta = item.action && item.action !== item.message
      ? `<div style="font-size: 11.5px; color: var(--text-muted); font-family: monospace; margin-top: 2px;">action: ${this.escapeHtml(item.action)}</div>`
      : "";

    return `
      <tr class="upm-activity-row ${visuals.rowClass}">
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-weight: 700; font-size: 12px; color: var(--text);">
              <i class="${visuals.icon}" style="color: ${visuals.iconColor}; margin-right: 6px;"></i>${this.escapeHtml(item.id || "ACT")}
            </span>
            <span class="ap-badge ${visuals.badgeClass}" style="width: fit-content; font-size: 10.5px; padding: 2px 8px;">
              ${this.escapeHtml(item.type || "Activity")}
            </span>
          </div>
        </td>
        <td>
          <div style="font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.4;">
            ${this.escapeHtml(item.message || item.action || "Administrative activity recorded.")}
          </div>
          ${actionMeta}
          ${detailChips}
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span class="upm-time-cell">
              <i class="fa-regular fa-clock" style="color: #64748b; font-size: 11.5px;"></i>
              <span style="font-weight: 600; font-size: 12px;">${this.escapeHtml(formattedTime)}</span>
            </span>
            ${relativeTime ? `<span style="font-size: 11px; color: var(--text-muted);">${this.escapeHtml(relativeTime)}</span>` : ""}
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Static helper to build row HTML directly from an activity record.
   *
   * @param {Object} item
   * @returns {string}
   */
  static build(item) {
    return new AdminActivityRowBuilder(item).build();
  }
}

export default AdminActivityRowBuilder;
