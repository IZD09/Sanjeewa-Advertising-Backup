/**
 * SanjeewaAdvertising - Sidebar Scroll Persistence Process
 *
 * Saves and restores #mainNavigation scroll position across Turbo visits
 * and full page loads via sessionStorage.
 */

"use strict";

export class SidebarScrollProcess {
  constructor() {
    this._docBound = false;
  }

  attachNavListener() {
    const nav = document.getElementById("mainNavigation");
    if (nav && !nav._hasScrollListener) {
      nav._hasScrollListener = true;
      nav.addEventListener("scroll", () => {
        sessionStorage.setItem("sa-sidebar-scroll", nav.scrollTop);
      }, { passive: true });
    }
  }

  bindEvents() {
    this.attachNavListener();

    if (this._docBound) return;
    this._docBound = true;

    document.addEventListener("click", (e) => {
      const navBtn = e.target.closest("#mainNavigation a, #mainNavigation button");
      if (navBtn) {
        this.save();
      }
    }, { capture: true, passive: true });

    document.addEventListener("turbo:before-visit", () => {
      this.save();
    });

    document.addEventListener("turbo:render", () => {
      this.restore();
    });
  }

  save() {
    const nav = document.getElementById("mainNavigation");
    if (nav) {
      sessionStorage.setItem("sa-sidebar-scroll", nav.scrollTop);
    }
  }

  restore() {
    const nav = document.getElementById("mainNavigation");
    if (!nav) return;

    const saved = sessionStorage.getItem("sa-sidebar-scroll");
    if (saved !== null) {
      const top = parseInt(saved, 10);
      if (!isNaN(top)) {
        nav.scrollTop = top;
        requestAnimationFrame(() => {
          if (nav) nav.scrollTop = top;
        });
        setTimeout(() => {
          if (nav) nav.scrollTop = top;
        }, 60);
      }
    } else {
      const activeLink = nav.querySelector(".nav-link.active, .nav-sublink.active");
      if (activeLink) {
        activeLink.scrollIntoView({ block: "nearest" });
      }
    }
  }
}

export default SidebarScrollProcess;
