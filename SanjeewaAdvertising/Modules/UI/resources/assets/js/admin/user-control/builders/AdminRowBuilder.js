/**
 * Admin Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class AdminRowBuilder {
  static build(admin) {
    const initials = (admin.first_name[0] || "") + (admin.last_name[0] || "");
    const statusTagClass = admin.status === "Active" ? "ant-tag-green" : (admin.status === "Locked" ? "ant-tag-red" : "ant-tag-default");
    const typeTagClass = admin.type === "Super Admin" ? "ant-tag-purple" : (admin.type === "Manager" ? "ant-tag-blue" : "ant-tag-orange");

    return `
      <tr data-admin-id="${admin.id}">
        <td>
          <div class="uc-user-cell">
            <div class="uc-user-avatar admin">${initials.toUpperCase()}</div>
            <div class="uc-user-meta">
              <strong>${admin.first_name} ${admin.last_name}</strong>
              <span>@${admin.username}</span>
            </div>
          </div>
        </td>
        <td><span class="ant-tag ${typeTagClass}">${admin.type || 'Administrator'}</span></td>
        <td><i class="fa-solid fa-envelope" style="color: #94a3b8; font-size: 11px; margin-right: 4px;"></i> ${admin.email}</td>
        <td><i class="fa-solid fa-phone" style="color: #94a3b8; font-size: 11px; margin-right: 4px;"></i> ${admin.mobile}</td>
        <td>${admin.add_time ? admin.add_time.split(' ')[0] : 'N/A'}</td>
        <td>
          <span class="ant-tag ${statusTagClass}">
            <i class="fa-solid fa-circle" style="font-size: 6px;"></i> ${admin.status}
          </span>
        </td>
        <td>
          <div class="uc-table-actions">
            <button type="button" class="ant-action-btn btn-toggle-admin-status" data-id="${admin.id}" title="Toggle Active/Inactive">
              <i class="fa-solid ${admin.status === 'Active' ? 'fa-lock' : 'fa-lock-open'}"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}

