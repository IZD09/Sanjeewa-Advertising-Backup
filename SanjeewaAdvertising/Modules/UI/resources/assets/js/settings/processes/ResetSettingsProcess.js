/**
 * SanjeewaAdvertising - Reset Settings Process
 *
 * Restores all shop identity fields, currency symbol, logo/brand icon,
 * and theme settings back to factory defaults.
 */

"use strict";

export class ResetSettingsProcess {
  /**
   * @param {Object} [options={}]
   * @param {SettingsDataLoader} options.dataLoader
   * @param {SettingsPreviewHandler} options.previewHandler
   * @param {SettingsLogoHandler} options.logoHandler
   * @param {SettingsThemeHandler} options.themeHandler
   * @param {Function} [options.onResetInputs]
   * @param {Function} [options.showToast]
   */
  constructor(options = {}) {
    this.isAdmin = Boolean(options.isAdmin);
    this.dataLoader = options.dataLoader;
    this.previewHandler = options.previewHandler;
    this.logoHandler = options.logoHandler;
    this.themeHandler = options.themeHandler;
    this.onResetInputs = options.onResetInputs || (() => {});
    this.showToast = options.showToast || (() => {});

    this.btnResetTop = document.getElementById("btnResetSettingsTop");
    this.btnResetBottom = document.getElementById("btnResetSettingsBottom");

    this.bindEvents();
  }

  bindEvents() {
    this.btnResetTop?.addEventListener("click", () => this.resetToDefaults());
    this.btnResetBottom?.addEventListener("click", () => this.resetToDefaults());
  }

  /**
   * Prompt confirmation and reset all fields & previews to defaults.
   */
  resetToDefaults() {
    if (
      !window.confirm(
        "Are you sure you want to reset all preferences to their default settings?"
      )
    ) {
      return;
    }

    const defaults = this.dataLoader
      ? this.dataLoader.getDefaultSettings()
      : {
          shop_name: "Sanjeewa Advertising & Printing",
          shop_address: "No. 42 Main Street, Colombo 03, Sri Lanka",
          shop_phone: "+94 11 234 5678",
          currency_symbol: "Rs.",
          logo_url: null,
          logo_icon: "fa-solid fa-print",
          theme_mode: "light",
          theme_color: "#2563eb",
        };

    if (this.isAdmin) {
      // 1. Reset shop identity inputs & live preview
      this.onResetInputs(defaults);

      // 2. Reset logo & fallback icon
      this.logoHandler?.resetToDefault(defaults.logo_icon);
    }

    // 3. Reset theme mode & brand accent color
    this.themeHandler?.applyThemeMode(defaults.theme_mode, false);
    this.themeHandler?.applyThemeColor(defaults.theme_color, false);

    // 4. Mark unsaved & notify user
    this.previewHandler?.markUnsaved();
    this.showToast(
      'Preferences reset to default values. Click "Save Preferences" to persist.',
      "info"
    );
  }
}

export default ResetSettingsProcess;
