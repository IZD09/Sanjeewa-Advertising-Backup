/**
 * User Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class UserRowBuilder {
  static build(user) {
    const initials = (user.first_name?.[0] || "") + (user.last_name?.[0] || "");
    const statusName = typeof user.status === "object" && user.status !== null
      ? user.status.user_status
      : (user.status || "Active");
    const statusTagClass = statusName === "Active"
      ? "ant-tag-green"
      : (statusName === "Pending" ? "ant-tag-orange" : "ant-tag-default");

    const regDate = user.register_at
      ? String(user.register_at).replace("T", " ").split(" ")[0]
      : "N/A";

    return `
      <tr data-user-id="${user.id}">
        <td>
          <div class="uc-user-cell">
            <div class="uc-user-avatar">${initials.toUpperCase() || "U"}</div>
            <div class="uc-user-meta">
              <strong>${user.first_name} ${user.last_name}</strong>
              <span>@${user.username}</span>
            </div>
          </div>
        </td>
        <td><i class="fa-solid fa-phone" style="color: #94a3b8; font-size: 11px; margin-right: 4px;"></i> ${user.mobile}</td>
        <td>${regDate}</td>
        <td>
          <span class="ant-tag ${statusTagClass}">
            <i class="fa-solid fa-circle" style="font-size: 6px;"></i> ${statusName}
          </span>
        </td>
        <td>
          <div class="uc-table-actions">
            <button type="button" class="ant-btn ant-btn-sm btn-set-perm" data-id="${user.id}" title="Set Permissions">
              <i class="fa-solid fa-key" style="color: #1677ff;"></i> Perms
            </button>
            <button type="button" class="ant-action-btn btn-toggle-user-status" data-id="${user.id}" title="Toggle Active/Inactive">
              <i class="fa-solid ${statusName === 'Active' ? 'fa-user-slash' : 'fa-user-check'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}
