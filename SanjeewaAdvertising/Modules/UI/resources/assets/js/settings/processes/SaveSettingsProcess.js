/**
 * SanjeewaAdvertising - Save Settings Process
 *
 * Handles form submission, top/bottom save button states, backend API persistence
 * via SettingsDataLoader, and feedback notifications.
 */

"use strict";

export class SaveSettingsProcess {
  /**
   * @param {Object} [options={}]
   * @param {SettingsDataLoader} options.dataLoader
   * @param {SettingsPreviewHandler} options.previewHandler
   * @param {Function} [options.showToast]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.previewHandler = options.previewHandler;
    this.showToast = options.showToast || (() => {});

    this.form = document.getElementById("settingsForm");
    this.btnSaveTop = document.getElementById("btnSaveSettingsTop");
    this.btnSaveBottom = document.getElementById("btnSaveSettingsBottom");

    this.bindEvents();
  }

  bindEvents() {
    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.btnSaveTop?.addEventListener("click", () => {
      this.form?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });
  }

  /**
   * Toggle loading state on top and bottom save buttons.
   *
   * @param {boolean} isSaving
   * @param {string} [originalBottomHtml]
   */
  setSavingState(isSaving, originalBottomHtml = "") {
    const defaultBtnHtml = '<i class="fa-solid fa-floppy-disk"></i> Save Preferences';
    const savingHtml = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    if (this.btnSaveBottom) {
      this.btnSaveBottom.disabled = isSaving;
      this.btnSaveBottom.innerHTML = isSaving
        ? savingHtml
        : originalBottomHtml || defaultBtnHtml;
    }

    if (this.btnSaveTop) {
      this.btnSaveTop.disabled = isSaving;
      this.btnSaveTop.innerHTML = isSaving ? savingHtml : defaultBtnHtml;
    }
  }

  /**
   * Execute form submission and persist settings.
   */
  async handleSubmit() {
    if (!this.form || !this.dataLoader) return;

    const originalBottomHtml = this.btnSaveBottom ? this.btnSaveBottom.innerHTML : "";
    this.setSavingState(true, originalBottomHtml);

    try {
      const formData = new FormData(this.form);
      const actionUrl = this.form.getAttribute("action") || "/settings";
      const result = await this.dataLoader.saveSettings(formData, actionUrl);

      if (result && result.success) {
        this.previewHandler?.markSaved("Preferences saved successfully!");
        this.showToast(
          "System preferences & shop config saved successfully!",
          "success"
        );
      } else {
        throw new Error(result?.message || "Failed to save settings.");
      }
    } catch (err) {
      console.error("[SaveSettingsProcess] Save error:", err);
      const msg = err?.data?.message || err?.message || "An error occurred while saving.";
      this.showToast(msg, "error");
    } finally {
      this.setSavingState(false, originalBottomHtml);
    }
  }
}

export default SaveSettingsProcess;
