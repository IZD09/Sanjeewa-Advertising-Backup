/**
 * SanjeewaAdvertising - Profile Permission Card Builder
 *
 * Implements Builder Pattern extending BaseTableRowBuilder:
 * - ProfilePermissionEntity: Encapsulates individual module access permissions
 * - ProfilePermissionCardBuilder: Fluent builder for creating permission cards with action pills
 */

"use strict";

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * ProfilePermissionEntity - Entity model for module permission card
 */
export class ProfilePermissionEntity {
  /**
   * @param {Object} [data={}]
   */
  constructor(data = {}) {
    this.id = data.id || "";
    this.name = data.name || "System Module";
    this.icon = data.icon || "fa-shield-halved";
    this.view = Boolean(data.view);
    this.create = Boolean(data.create);
    this.edit = Boolean(data.edit);
    this.delete = Boolean(data.delete);
    this.export = Boolean(data.export);
  }

  /**
   * Render HTMLDivElement for the module permission card.
   * @returns {HTMLDivElement}
   */
  render() {
    const card = document.createElement("div");
    card.className = "up-perm-card";
    card.dataset.moduleId = String(this.id);

    const actions = [
      { label: "View", active: this.view },
      { label: "Create", active: this.create },
      { label: "Edit", active: this.edit },
      { label: "Delete", active: this.delete },
      { label: "Export", active: this.export },
    ];

    const pillsHtml = actions.map(act => `
      <span class="up-pill ${act.active ? 'up-pill-active' : 'up-pill-inactive'}">
        ${act.active ? '<i class="fa-solid fa-check" style="font-size: 9px;"></i>' : '<i class="fa-solid fa-xmark" style="font-size: 9px;"></i>'} ${act.label}
      </span>
    `).join("");

    card.innerHTML = `
      <div class="up-perm-title">
        <i class="fa-solid ${this.icon}" style="color: #0284c7;"></i>
        <span>${this.name}</span>
      </div>
      <div class="up-perm-pills">
        ${pillsHtml}
      </div>
    `;

    return card;
  }
}

/**
 * ProfilePermissionCardBuilder - Fluent builder class for module permission cards
 */
export class ProfilePermissionCardBuilder extends BaseTableRowBuilder {
  setId(id) {
    return this.set("id", id);
  }

  setName(name) {
    return this.set("name", name);
  }

  setIcon(icon) {
    return this.set("icon", icon);
  }

  setView(view) {
    return this.set("view", Boolean(view));
  }

  setCreate(create) {
    return this.set("create", Boolean(create));
  }

  setEdit(edit) {
    return this.set("edit", Boolean(edit));
  }

  setDelete(del) {
    return this.set("delete", Boolean(del));
  }

  setExport(exp) {
    return this.set("export", Boolean(exp));
  }

  buildEntity() {
    return new ProfilePermissionEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  /**
   * Static helper to build a permission card directly from a module object.
   *
   * @param {Object} mod
   * @returns {HTMLDivElement}
   */
  static buildFrom(mod) {
    return new ProfilePermissionCardBuilder(mod).build();
  }
}

export default ProfilePermissionCardBuilder;
