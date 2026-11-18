/**
 * SanjeewaAdvertising - Settings Theme & Appearance Handler
 *
 * Manages Light/Dark interface mode selection, brand primary color swatches,
 * custom hex color picker synchronization, and live CSS variable updates.
 */

"use strict";

export class SettingsThemeHandler {
  /**
   * @param {Object} [options={}]
   * @param {SettingsPreviewHandler} options.previewHandler
   * @param {SettingsDataLoader} [options.dataLoader]
   * @param {Function} [options.onChanged]
   */
  constructor(options = {}) {
    this.previewHandler = options.previewHandler;
    this.dataLoader = options.dataLoader;
    this.onChanged = options.onChanged || (() => {});

    this.themeModeCards = document.querySelectorAll(".theme-mode-card");
    this.themeModeInput = document.getElementById("settingThemeMode");
    this.colorSwatchBtns = document.querySelectorAll(".color-swatch-btn");
    this.customColorPicker = document.getElementById("settingCustomColorPicker");
    this.themeColorInput = document.getElementById("settingThemeColor");

    this.bindEvents();
  }

  bindEvents() {
    this.themeModeCards.forEach((card) => {
      card.addEventListener("click", () => {
        const mode = card.getAttribute("data-mode");
        if (mode) {
          this.applyThemeMode(mode, true);
        }
      });
    });

    this.colorSwatchBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const color = btn.getAttribute("data-color");
        if (color) {
          this.applyThemeColor(color, true);
        }
      });
    });

    this.customColorPicker?.addEventListener("input", (e) => {
      this.applyThemeColor(e.target.value, true);
    });

    this.themeColorInput?.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9a-fA-F]{6}$/i.test(val)) {
        this.applyThemeColor(val, true);
      }
    });
  }

  /**
   * Apply Light or Dark theme mode and synchronize with topbar toggle & localStorage.
   *
   * @param {string} mode
   * @param {boolean} [notifyUnsaved=true]
   */
  applyThemeMode(mode, notifyUnsaved = true) {
    const normalizedMode = mode === "dark" ? "dark" : "light";

    this.themeModeCards.forEach((card) => {
      card.classList.toggle("active", card.getAttribute("data-mode") === normalizedMode);
    });

    if (this.themeModeInput) {
      this.themeModeInput.value = normalizedMode;
    }

    document.documentElement.dataset.theme = normalizedMode;
    localStorage.setItem("sa-dashboard-theme", normalizedMode);

    const topbarToggle = document.getElementById("themeToggle");
    if (topbarToggle) {
      topbarToggle.innerHTML =
        normalizedMode === "dark"
          ? '<i class="fa-solid fa-sun"></i>'
          : '<i class="fa-solid fa-moon"></i>';
    }

    if (notifyUnsaved) {
      this.onChanged();
    }
  }

  /**
   * Validate and apply a 6-digit hex accent color across inputs, swatches, and CSS root variables.
   *
   * @param {string} rawHex
   * @param {boolean} [notifyUnsaved=true]
   */
  applyThemeColor(rawHex, notifyUnsaved = true) {
    if (!rawHex) return;
    let hex = String(rawHex).trim();
    if (!hex.startsWith("#")) {
      hex = `#${hex}`;
    }
    if (!/^#[0-9a-fA-F]{6}$/i.test(hex)) {
      return;
    }

    if (this.themeColorInput) {
      this.themeColorInput.value = hex;
    }
    if (this.customColorPicker) {
      this.customColorPicker.value = hex;
    }

    this.previewHandler?.updateColorPreview(hex);

    // Live dynamic root CSS property update
    document.documentElement.style.setProperty("--blue", hex);
    document.documentElement.style.setProperty("--blue-dark", hex);
    document.documentElement.style.setProperty("--sidebar-item-active-border", hex);

    this.colorSwatchBtns.forEach((btn) => {
      const btnColor = (btn.getAttribute("data-color") || "").toLowerCase();
      const isMatch = btnColor === hex.toLowerCase();
      btn.classList.toggle("active", isMatch);
      btn.innerHTML = isMatch ? '<i class="fa-solid fa-check"></i>' : "";
    });

    if (notifyUnsaved) {
      this.onChanged();
    }
  }

  /**
   * Apply saved theme color from localStorage on initial page load.
   */
  applySavedLocalTheme() {
    const saved = this.dataLoader?.getSavedLocalSettings();
    if (saved?.theme_color && /^#[0-9a-fA-F]{6}$/i.test(saved.theme_color)) {
      document.documentElement.style.setProperty("--blue", saved.theme_color);
      document.documentElement.style.setProperty("--blue-dark", saved.theme_color);
      document.documentElement.style.setProperty("--sidebar-item-active-border", saved.theme_color);
    }
  }
}

export default SettingsThemeHandler;
