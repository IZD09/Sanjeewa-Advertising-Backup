/**
 * SanjeewaAdvertising - Profile Session Row Builder
 *
 * Implements Builder Pattern extending BaseTableRowBuilder:
 * - ProfileSessionEntity: Encapsulates individual login session record
 * - ProfileSessionRowBuilder: Fluent builder for creating login session table rows
 */

"use strict";

import { BaseTableRowBuilder } from "../../core/BaseTableRowBuilder.js";

/**
 * ProfileSessionEntity - Entity model for a user login session
 */
export class ProfileSessionEntity {
  /**
   * @param {Object} [data={}]
   */
  constructor(data = {}) {
    this.id = data.id || "";
    this.login = data.login || "—";
    this.logout = data.logout || "—";
    this.isActive = data.is_active ?? data.isActive ?? emptySessionLogout(data.logout);
  }

  /**
   * Render HTMLTableRowElement for the session row.
   * @returns {HTMLTableRowElement}
   */
  render() {
    const row = document.createElement("tr");

    const statusBadge = this.isActive
      ? `<span class="up-pill up-pill-active"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> Active</span>`
      : `<span class="up-pill up-pill-inactive">Ended</span>`;

    row.innerHTML = `
      <td><strong>#${this.id}</strong></td>
      <td>${this.login}</td>
      <td>${this.logout}</td>
      <td>${statusBadge}</td>
    `;

    return row;
  }
}

function emptySessionLogout(logoutVal) {
  return !logoutVal || logoutVal === "—";
}

/**
 * ProfileSessionRowBuilder - Fluent builder class for login session table rows
 */
export class ProfileSessionRowBuilder extends BaseTableRowBuilder {
  setId(id) {
    return this.set("id", id);
  }

  setLogin(time) {
    return this.set("login", time);
  }

  setLogout(time) {
    return this.set("logout", time);
  }

  setIsActive(isActive) {
    return this.set("is_active", Boolean(isActive));
  }

  buildEntity() {
    return new ProfileSessionEntity(this._data);
  }

  build() {
    return this.buildEntity().render();
  }

  /**
   * Static helper to build a row directly from a session object.
   *
   * @param {Object} session
   * @returns {HTMLTableRowElement}
   */
  static buildFrom(session) {
    return new ProfileSessionRowBuilder(session).build();
  }
}

export default ProfileSessionRowBuilder;
