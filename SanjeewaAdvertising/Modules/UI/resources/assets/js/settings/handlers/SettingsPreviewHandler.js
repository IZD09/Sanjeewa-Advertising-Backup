/**
 * SanjeewaAdvertising - Settings Preview Handler
 *
 * Manages the Live Identity Preview card, mock receipt values, sidebar brand synchronization,
 * and save status indicator on the System Preferences page.
 */

"use strict";

export class SettingsPreviewHandler {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.defaults]
   */
  constructor(options = {}) {
    this.defaults = options.defaults || {
      shop_name: "Sanjeewa Advertising & Printing",
      shop_address: "No. 42 Main Street, Colombo 03, Sri Lanka",
      shop_phone: "+94 11 234 5678",
      currency_symbol: "Rs.",
    };

    this.mockShopName = document.getElementById("mockShopName");
    this.mockAddress = document.getElementById("mockAddress");
    this.mockPhone = document.getElementById("mockPhone");
    this.previewCurrencySymbols = document.querySelectorAll(".preview-currency-sym");
    this.logoUploadPreviewBox = document.getElementById("logoUploadPreviewBox");
    this.mockLogoBox = document.getElementById("mockLogoBox");
    this.previewColorDot = document.getElementById("previewColorDot");
    this.previewColorHex = document.getElementById("previewColorHex");
    this.saveStatusInfo = document.getElementById("saveStatusInfo");
  }

  /**
   * Update shop name in mock identity card, sidebar brand header, and document title.
   *
   * @param {string} rawName
   */
  updateShopName(rawName) {
    const val = String(rawName || "").trim() || this.defaults.shop_name;
    if (this.mockShopName) {
      this.mockShopName.textContent = val;
    }

    const parts = val.split(/\s+/);
    const firstPart = parts[0] || val;
    const secondPart = parts.slice(1).join(" ");

    const sidebarBrandName = document.getElementById("sidebarBrandName");
    if (sidebarBrandName) {
      sidebarBrandName.textContent = firstPart;
    }

    const sidebarBrandSub = document.getElementById("sidebarBrandSub");
    if (sidebarBrandSub && secondPart) {
      sidebarBrandSub.textContent = secondPart.toUpperCase();
    }

    if (typeof document !== "undefined" && document.title) {
      const titleParts = document.title.split(" - ");
      const pagePrefix = titleParts[0] || "System Preferences & Shop Config";
      document.title = `${pagePrefix} - ${val}`;
    }
  }

  /**
   * Update physical address in mock identity card.
   *
   * @param {string} rawAddress
   */
  updateAddress(rawAddress) {
    const val = String(rawAddress || "").trim() || this.defaults.shop_address;
    if (this.mockAddress) {
      this.mockAddress.textContent = val;
    }
  }

  /**
   * Update hotline phone number in mock identity card.
   *
   * @param {string} rawPhone
   */
  updatePhone(rawPhone) {
    const val = String(rawPhone || "").trim() || this.defaults.shop_phone;
    if (this.mockPhone) {
      this.mockPhone.textContent = val;
    }
  }

  /**
   * Update currency symbol across mock receipt elements.
   *
   * @param {string} rawSymbol
   */
  updateCurrencySymbol(rawSymbol) {
    const val = String(rawSymbol || "").trim() || this.defaults.currency_symbol;
    this.previewCurrencySymbols.forEach((el) => {
      el.textContent = val;
    });
  }

  /**
   * Render uploaded logo image across upload box, mock card, sidebar brand, and browser favicon.
   *
   * @param {string} src
   */
  renderLogoImage(src) {
    if (!src) return;
    if (this.logoUploadPreviewBox) {
      this.logoUploadPreviewBox.innerHTML = `<img src="${src}" alt="Logo" style="width:100%;height:100%;object-fit:cover;">`;
    }
    if (this.mockLogoBox) {
      this.mockLogoBox.innerHTML = `<img src="${src}" alt="Logo" style="width:100%;height:100%;object-fit:cover;">`;
    }
    const sidebarBrandLogo = document.getElementById("sidebarBrandLogo");
    if (sidebarBrandLogo) {
      sidebarBrandLogo.innerHTML = `<img src="${src}" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`;
    }
    const favicon = document.getElementById("appFavicon");
    if (favicon) {
      favicon.setAttribute("href", src);
    }
  }

  /**
   * Render fallback FontAwesome icon across upload box, mock card, sidebar brand, and browser favicon.
   *
   * @param {string} iconClass
   */
  renderLogoIcon(iconClass) {
    const cls = iconClass || "fa-solid fa-print";
    if (this.logoUploadPreviewBox) {
      this.logoUploadPreviewBox.innerHTML = `<i class="${cls}"></i>`;
    }
    if (this.mockLogoBox) {
      this.mockLogoBox.innerHTML = `<i class="${cls}"></i>`;
    }
    const sidebarBrandLogo = document.getElementById("sidebarBrandLogo");
    if (sidebarBrandLogo) {
      sidebarBrandLogo.innerHTML = `<i class="${cls}"></i>`;
    }
    this.updateFaviconFromIcon(cls);
  }

  /**
   * Update browser tab favicon using SVG representation of the selected FontAwesome icon.
   *
   * @param {string} iconClass
   */
  updateFaviconFromIcon(iconClass) {
    const favicon = document.getElementById("appFavicon");
    if (!favicon) return;

    const bg = document.getElementById("settingThemeColor")?.value || "#2563eb";
    const safeBg = /^#[0-9A-Fa-f]{6}$/.test(bg) ? bg : "#2563eb";

    const pathMap = {
      "fa-solid fa-store": '<path d="M3 9l1-4h16l1 4M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M9 20v-6h6v6"/>',
      "fa-solid fa-palette": '<path d="M12 3a9 9 0 100 18 1.5 1.5 0 001.5-1.5c0-.4-.1-.8-.4-1.1-.3-.3-.4-.6-.4-1a1.5 1.5 0 011.5-1.5H16a5 5 0 005-5c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
      "fa-solid fa-wand-magic-sparkles": '<path d="M15 4l5 5L8 21l-5-5L15 4zM12 7l5 5M5 3v4M3 5h4M19 15v4M17 17h4"/>',
      "fa-solid fa-layer-group": '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>',
      "fa-solid fa-bullhorn": '<path d="M3 11v2a1 1 0 001 1h2l4 5h2l-2-5h5l5 3V7l-5 3H4a1 1 0 00-1 1z"/>',
      "fa-solid fa-brush": '<path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08M7 15a4 4 0 00-4 4c0 1.1-.9 2-2 2 1.5 1.5 4 2 6 2a4 4 0 000-8z"/>',
      "fa-solid fa-shapes": '<polygon points="12 3 19 14 5 14 12 3"/><circle cx="17" cy="18" r="3"/><rect x="4" y="16" width="6" height="5" rx="1"/>',
    };

    const paths = pathMap[iconClass] || '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${safeBg}"/><g transform="translate(4,4)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
    favicon.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(svg)}`);
  }

  /**
   * Update theme color dot, hex label, and mock logo box border/color.
   *
   * @param {string} hex
   */
  updateColorPreview(hex) {
    if (!hex) return;
    if (this.previewColorDot) {
      this.previewColorDot.style.backgroundColor = hex;
    }
    if (this.previewColorHex) {
      this.previewColorHex.textContent = hex.toUpperCase();
    }
    if (this.mockLogoBox) {
      this.mockLogoBox.style.borderColor = hex;
      this.mockLogoBox.style.color = hex;
    }
  }

  /**
   * Mark form status bar as having unsaved changes.
   */
  markUnsaved() {
    if (this.saveStatusInfo) {
      this.saveStatusInfo.className = "save-status-info unsaved";
      this.saveStatusInfo.innerHTML =
        '<i class="fa-solid fa-triangle-exclamation"></i> <span>Unsaved changes</span>';
    }
  }

  /**
   * Mark form status bar as saved and synchronized.
   *
   * @param {string} [message="Preferences saved successfully!"]
   */
  markSaved(message = "Preferences saved successfully!") {
    if (this.saveStatusInfo) {
      this.saveStatusInfo.className = "save-status-info saved";
      this.saveStatusInfo.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    }
  }
}

export default SettingsPreviewHandler;
