/**
 * SanjeewaAdvertising - Topbar Profile Dropdown Process
 *
 * Manages profile menu open/close/toggle state, outside clicks, and Escape key handling.
 */

"use strict";

export class ProfileDropdownProcess {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onOpen]
   * @param {Function} [options.onClose]
   */
  constructor(options = {}) {
    this.onOpen = typeof options.onOpen === "function" ? options.onOpen : null;
    this.onClose = typeof options.onClose === "function" ? options.onClose : null;
    this.profileToggle = null;
    this.profileMenu = null;
    this.isOpen = false;
    this._docEventsBound = false;
  }

  init() {
    this.profileToggle = document.getElementById("profileDropdownToggle");
    this.profileMenu = document.getElementById("profileDropdownMenu");
    if (!this.profileToggle || !this.profileMenu) return;

    if (!this.profileToggle._bound) {
      this.profileToggle._bound = true;
      this.profileToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    if (!this._docEventsBound) {
      this._docEventsBound = true;

      document.addEventListener("click", (e) => {
        if (!e.target.closest("#profileDropdownWrapper")) {
          this.close();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (!this.profileMenu || !this.profileToggle) return;
    this.isOpen = true;
    this.profileMenu.classList.add("show");
    this.profileMenu.setAttribute("aria-hidden", "false");
    this.profileToggle.classList.add("open");
    this.profileToggle.setAttribute("aria-expanded", "true");

    if (this.onOpen) this.onOpen();
  }

  close() {
    if (!this.isOpen || !this.profileMenu || !this.profileToggle) return;
    this.isOpen = false;
    this.profileMenu.classList.remove("show");
    this.profileMenu.setAttribute("aria-hidden", "true");
    this.profileToggle.classList.remove("open");
    this.profileToggle.setAttribute("aria-expanded", "false");

    if (this.onClose) this.onClose();
  }
}

export default ProfileDropdownProcess;
