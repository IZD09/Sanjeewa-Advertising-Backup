/**
 * System Preferences & Shop Configuration Module
 * Sanjeewa Advertising Digital Printing Management System
 *
 * Architecture:
 * - SettingsDataLoader: Manages default settings, localStorage, and HTTP persistence via RequestHandler
 * - SettingsPreviewHandler: Live Identity Preview card, mock receipt, and status bar synchronization
 * - SettingsLogoHandler: Logo image upload, 2MB validation, removal, and fallback icon selection
 * - SettingsThemeHandler: Light/Dark mode cards, primary brand color swatches, and CSS root variables
 * - SaveSettingsProcess: Form submission, button loading states, and persistence
 * - ResetSettingsProcess: Restoring factory default preferences
 */

"use strict";

import {
  SettingsDataLoader,
  SettingsPreviewHandler,
  SettingsLogoHandler,
  SettingsThemeHandler,
  SaveSettingsProcess,
  ResetSettingsProcess,
} from "./settings/index.js";

export class SettingsManager {
  constructor() {
    this.moduleEl = document.getElementById("module-settings");
    this.isAdmin = this.moduleEl?.dataset.isAdmin === "1";
    this.dataLoader = new SettingsDataLoader();
    this.defaults = this.dataLoader.getDefaultSettings();

    // Form input elements
    this.shopNameInput = document.getElementById("settingShopName");
    this.shopAddressInput = document.getElementById("settingShopAddress");
    this.shopPhoneInput = document.getElementById("settingShopPhone");
    this.currencySymbolInput = document.getElementById("settingCurrencySymbol");
    this.currencyPresets = document.querySelectorAll(".currency-pill");

    // 1. Live Preview Handler
    this.previewHandler = new SettingsPreviewHandler({
      defaults: this.defaults,
    });

    // 2. Logo & Brand Icon Handler (Admin only)
    this.logoHandler = this.isAdmin
      ? new SettingsLogoHandler({
          previewHandler: this.previewHandler,
          onChanged: () => this.previewHandler.markUnsaved(),
          showToast: (msg, type) => this.showToast(msg, type),
        })
      : null;

    // 3. Theme & Appearance Handler
    this.themeHandler = new SettingsThemeHandler({
      previewHandler: this.previewHandler,
      dataLoader: this.dataLoader,
      onChanged: () => this.previewHandler.markUnsaved(),
    });

    // 4. Save Preferences Process
    this.saveProcess = new SaveSettingsProcess({
      dataLoader: this.dataLoader,
      previewHandler: this.previewHandler,
      showToast: (msg, type) => this.showToast(msg, type),
    });

    // 5. Reset Defaults Process
    this.resetProcess = new ResetSettingsProcess({
      isAdmin: this.isAdmin,
      dataLoader: this.dataLoader,
      previewHandler: this.previewHandler,
      logoHandler: this.logoHandler,
      themeHandler: this.themeHandler,
      onResetInputs: (defaults) => this.resetIdentityInputs(defaults),
      showToast: (msg, type) => this.showToast(msg, type),
    });

    this.bindIdentityInputs();
    this.init();
  }

  /**
   * Initialize settings module and apply persisted local theme color.
   */
  init() {
    this.themeHandler.applySavedLocalTheme();
  }

  /**
   * Bind real-time input listeners for shop name, address, phone, and currency symbol.
   */
  bindIdentityInputs() {
    this.shopNameInput?.addEventListener("input", (e) => {
      this.previewHandler.updateShopName(e.target.value);
      this.previewHandler.markUnsaved();
    });

    this.shopAddressInput?.addEventListener("input", (e) => {
      this.previewHandler.updateAddress(e.target.value);
      this.previewHandler.markUnsaved();
    });

    this.shopPhoneInput?.addEventListener("input", (e) => {
      this.previewHandler.updatePhone(e.target.value);
      this.previewHandler.markUnsaved();
    });

    this.currencySymbolInput?.addEventListener("input", (e) => {
      const val = e.target.value.trim() || this.defaults.currency_symbol;
      this.previewHandler.updateCurrencySymbol(val);
      this.syncCurrencyPills(val);
      this.previewHandler.markUnsaved();
    });

    this.currencyPresets.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-val") || this.defaults.currency_symbol;
        if (this.currencySymbolInput) {
          this.currencySymbolInput.value = val;
        }
        this.previewHandler.updateCurrencySymbol(val);
        this.syncCurrencyPills(val);
        this.previewHandler.markUnsaved();
      });
    });
  }

  /**
   * Toggle active class on currency preset pills matching current value.
   *
   * @param {string} activeVal
   */
  syncCurrencyPills(activeVal) {
    this.currencyPresets.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-val") === activeVal);
    });
  }

  /**
   * Reset shop identity inputs and live preview text to provided default values.
   *
   * @param {Object} defaults
   */
  resetIdentityInputs(defaults) {
    if (this.shopNameInput) this.shopNameInput.value = defaults.shop_name;
    if (this.shopAddressInput) this.shopAddressInput.value = defaults.shop_address;
    if (this.shopPhoneInput) this.shopPhoneInput.value = defaults.shop_phone;
    if (this.currencySymbolInput) this.currencySymbolInput.value = defaults.currency_symbol;

    this.previewHandler.updateShopName(defaults.shop_name);
    this.previewHandler.updateAddress(defaults.shop_address);
    this.previewHandler.updatePhone(defaults.shop_phone);
    this.previewHandler.updateCurrencySymbol(defaults.currency_symbol);
    this.syncCurrencyPills(defaults.currency_symbol);
  }

  /**
   * Display toast notification.
   *
   * @param {string} message
   * @param {string} [type="success"]
   */
  showToast(message, type = "success") {
    let toastContainer = document.getElementById("poToastContainer");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "poToastContainer";
      toastContainer.className = "po-toast-container";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `po-toast ${type}`;
    const bgColor =
      type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";
    const iconClass =
      type === "success"
        ? "fa-circle-check"
        : type === "error"
          ? "fa-circle-exclamation"
          : "fa-circle-info";

    toast.style.cssText = `
      background: ${bgColor};
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      margin-bottom: 10px;
      animation: fadeIn 0.3s ease;
    `;
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Auto-instantiate when DOM is ready or on Turbo navigation
if (typeof document !== "undefined") {
  window.SettingsManager = SettingsManager;

  const bootSettings = () => {
    const moduleEl = document.getElementById("module-settings");
    if (moduleEl && !moduleEl.dataset.settingsBooted) {
      moduleEl.dataset.settingsBooted = "1";
      window.settingsManager = new SettingsManager();
    }
  };

  bootSettings();
  document.addEventListener("DOMContentLoaded", bootSettings);
  document.addEventListener("turbo:load", bootSettings);
}

export default SettingsManager;
