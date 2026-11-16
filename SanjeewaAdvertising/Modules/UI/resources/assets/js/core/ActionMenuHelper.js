/**
 * ActionMenuHelper Component Class
 * Shared floating row action dropdown helper (avoids overflow clipping inside responsive tables).
 * Provides both static helper utilities and instance method wrappers.
 */

"use strict";

export class ActionMenuHelper {
  static listenersBound = false;

  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Close all currently open floating row action dropdown menus.
   */
  static closeAllActionMenus() {
    if (typeof document === "undefined") {
      return;
    }

    document.querySelectorAll(".row-action-dropdown.open").forEach((menu) => {
      menu.classList.remove("open");
      menu.style.display = "none";
    });
  }

  /**
   * Bind global document/window listeners to close open action menus.
   */
  static bindGlobalCloseListeners() {
    if (this.listenersBound || typeof document === "undefined") {
      return;
    }
    this.listenersBound = true;

    const closeHandler = () => this.closeAllActionMenus();

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".row-action-menu-wrap")) {
        this.closeAllActionMenus();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllActionMenus();
      }
    });

    window.addEventListener("scroll", closeHandler, true);
    window.addEventListener("resize", closeHandler);
  }

  /**
   * Toggle a row's floating action menu next to its trigger button.
   *
   * @param {HTMLElement} triggerBtn
   */
  static toggleRowActionMenu(triggerBtn) {
    if (!triggerBtn) return;
    this.bindGlobalCloseListeners();

    const wrap = triggerBtn.closest(".row-action-menu-wrap");
    const menu = wrap ? wrap.querySelector(".row-action-dropdown") : null;
    if (!menu) return;

    const isAlreadyOpen = menu.classList.contains("open");
    this.closeAllActionMenus();

    if (isAlreadyOpen) {
      return;
    }

    menu.style.display = "block";
    menu.style.visibility = "hidden";
    menu.classList.add("open");

    const btnRect = triggerBtn.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const gap = 6;

    let top = btnRect.bottom + gap;
    if (top + menuRect.height > window.innerHeight - 12) {
      top = Math.max(12, btnRect.top - menuRect.height - gap);
    }

    const right = Math.max(12, window.innerWidth - btnRect.right);

    menu.style.top = `${top}px`;
    menu.style.right = `${right}px`;
    menu.style.left = "auto";
    menu.style.visibility = "visible";
  }

  // --- Instance Method Wrappers for Flexible OOP Usage ---

  closeAllActionMenus() {
    ActionMenuHelper.closeAllActionMenus();
  }

  toggleRowActionMenu(triggerBtn) {
    ActionMenuHelper.toggleRowActionMenu(triggerBtn);
  }
}

export const closeAllActionMenus = (...args) => ActionMenuHelper.closeAllActionMenus(...args);
export const toggleRowActionMenu = (...args) => ActionMenuHelper.toggleRowActionMenu(...args);

export default ActionMenuHelper;
