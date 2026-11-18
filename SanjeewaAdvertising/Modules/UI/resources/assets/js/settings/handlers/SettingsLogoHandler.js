/**
 * SanjeewaAdvertising - Settings Logo & Brand Icon Handler
 *
 * Manages shop logo image selection, 2MB size validation, image removal,
 * and fallback FontAwesome brand icon selection.
 */

"use strict";

export class SettingsLogoHandler {
  /**
   * @param {Object} [options={}]
   * @param {SettingsPreviewHandler} options.previewHandler
   * @param {Function} [options.onChanged]
   * @param {Function} [options.showToast]
   */
  constructor(options = {}) {
    this.previewHandler = options.previewHandler;
    this.onChanged = options.onChanged || (() => {});
    this.showToast = options.showToast || ((msg) => alert(msg));

    this.logoFileInput = document.getElementById("settingLogoFile");
    this.btnChooseLogo = document.getElementById("btnChooseLogo");
    this.btnRemoveLogo = document.getElementById("btnRemoveLogo");
    this.removeLogoFlag = document.getElementById("removeLogoFlag");
    this.settingLogoUrl = document.getElementById("settingLogoUrl");
    this.settingLogoIconInput = document.getElementById("settingLogoIcon");
    this.iconChoiceBtns = document.querySelectorAll(".icon-choice-btn");

    this.bindEvents();
  }

  bindEvents() {
    this.btnChooseLogo?.addEventListener("click", () => {
      this.logoFileInput?.click();
    });

    this.logoFileInput?.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });

    this.btnRemoveLogo?.addEventListener("click", () => {
      this.removeLogo();
    });

    this.iconChoiceBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosenIcon = btn.getAttribute("data-icon");
        if (chosenIcon) {
          this.selectIcon(chosenIcon);
        }
      });
    });
  }

  /**
   * Validate and preview newly selected logo image file.
   *
   * @param {File} file
   */
  handleFileSelect(file) {
    if (file.size > 2 * 1024 * 1024) {
      this.showToast("Logo image must be smaller than 2MB.", "error");
      if (this.logoFileInput) {
        this.logoFileInput.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        this.previewHandler?.renderLogoImage(dataUrl);
      }
      if (this.removeLogoFlag) {
        this.removeLogoFlag.value = "0";
      }
      if (this.btnRemoveLogo) {
        this.btnRemoveLogo.style.display = "inline-flex";
      }
      this.onChanged();
    };
    reader.readAsDataURL(file);
  }

  /**
   * Clear uploaded logo image and revert to active fallback brand icon.
   */
  removeLogo() {
    if (this.logoFileInput) {
      this.logoFileInput.value = "";
    }
    if (this.removeLogoFlag) {
      this.removeLogoFlag.value = "1";
    }
    if (this.settingLogoUrl) {
      this.settingLogoUrl.value = "";
    }

    const activeIcon = this.settingLogoIconInput
      ? this.settingLogoIconInput.value
      : "fa-solid fa-print";
    this.previewHandler?.renderLogoIcon(activeIcon);

    if (this.btnRemoveLogo) {
      this.btnRemoveLogo.style.display = "none";
    }
    this.onChanged();
  }

  /**
   * Select a fallback FontAwesome brand icon.
   *
   * @param {string} chosenIcon
   */
  selectIcon(chosenIcon) {
    this.iconChoiceBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-icon") === chosenIcon);
    });

    if (this.settingLogoIconInput) {
      this.settingLogoIconInput.value = chosenIcon;
    }

    const hasNoUploadedFile = !this.logoFileInput?.files?.length;
    const hasNoExistingLogo =
      (this.removeLogoFlag && this.removeLogoFlag.value === "1") ||
      (hasNoUploadedFile && !this.settingLogoUrl?.value);

    if (hasNoExistingLogo) {
      this.previewHandler?.renderLogoIcon(chosenIcon);
    }

    this.onChanged();
  }

  /**
   * Reset logo and brand icon to default state.
   *
   * @param {string} [defaultIcon="fa-solid fa-print"]
   */
  resetToDefault(defaultIcon = "fa-solid fa-print") {
    this.removeLogo();
    this.selectIcon(defaultIcon);
  }
}

export default SettingsLogoHandler;
