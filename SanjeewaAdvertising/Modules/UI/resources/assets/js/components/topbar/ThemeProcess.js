/**
 * SanjeewaAdvertising - Topbar Theme Process
 *
 * Manages Dark / Light theme state, persistence in localStorage,
 * theme toggle icon updates, and live chart theme refreshes.
 */

"use strict";

export class ThemeProcess {
  constructor() {
    this.themeToggleBtn = null;
  }

  init() {
    this.themeToggleBtn = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("sa-dashboard-theme") || "light";
    document.documentElement.dataset.theme = savedTheme;
    this.updateIcon();

    if (this.themeToggleBtn && !this.themeToggleBtn._bound) {
      this.themeToggleBtn._bound = true;
      this.themeToggleBtn.addEventListener("click", () => {
        this.toggle();
      });
    }
  }

  toggle() {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("sa-dashboard-theme", next);
    this.updateIcon();

    if (window.dashboardInstance && typeof window.dashboardInstance.refreshVisibleCharts === "function") {
      window.dashboardInstance.refreshVisibleCharts();
    }
  }

  updateIcon() {
    if (!this.themeToggleBtn) return;
    this.themeToggleBtn.innerHTML = document.documentElement.dataset.theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }
}

export default ThemeProcess;
