/**
 * Permission Matrix Table Row Builder
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

export class PermissionMatrixBuilder {
  static buildRow(module, actions, currentPerms = {}) {
    const modulePerms = currentPerms[module.id] || {};

    let actionToggles = "";
    actions.forEach(action => {
      const isChecked = !!modulePerms[action.key];
      actionToggles += `
        <td>
          <button type="button" 
                  class="ant-switch ${isChecked ? 'checked' : ''} perm-toggle" 
                  data-module="${module.id}" 
                  data-action="${action.key}" 
                  role="switch" 
                  aria-checked="${isChecked}">
          </button>
        </td>
      `;
    });

    return `
      <tr data-module-id="${module.id}">
        <td>
          <div class="uc-module-title">
            <i class="${module.icon}"></i>
            <span>${module.name}</span>
          </div>
          <div class="uc-module-desc">${module.desc}</div>
        </td>
        ${actionToggles}
      </tr>
    `;
  }
}

