/**
 * SanjeewaAdvertising - Base Modal Handler
 *
 * Universal foundation class for controlling modal dialogs, backdrops,
 * focus/escape handling, printable popups, and toast notifications across all modules:
 * (Place Order, GRN, Inventory, Payments).
 */

export class BaseModalHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.activeModalClass="open"] - CSS class indicating open state
   * @param {string[]} [options.closeSelectors] - CSS selectors for close triggers
   * @param {string} [options.overlaySelector] - CSS selector for backdrop overlays
   * @param {string} [options.toastContainerId="poToastContainer"] - Container ID for toasts
   * @param {boolean} [options.closeOnEscape=true] - Close modals on Escape key
   * @param {boolean} [options.closeOnBackdrop=true] - Close modal when clicking backdrop
   * @param {boolean} [options.autoBind=true] - Automatically bind close/backdrop/escape events
   */
  constructor(options = {}) {
    this.activeModalClass = options.activeModalClass || "open";
    this.closeSelectors = options.closeSelectors || [
      "[data-close-modal]",
      "[data-close-grn-modal]",
      "[data-close-inv-modal]",
      "[data-close-pay-modal]",
      ".po-modal-close",
      ".pay-modal-close",
      ".ant-modal-close"
    ];
    this.overlaySelector = options.overlaySelector || ".po-modal-overlay, .pay-modal-backdrop, .ant-modal-mask";
    this.toastContainerId = options.toastContainerId || "poToastContainer";
    this.closeOnEscape = options.closeOnEscape !== false;
    this.closeOnBackdrop = options.closeOnBackdrop !== false;

    if (options.autoBind !== false && typeof document !== "undefined") {
      this.bindModalEvents();
    }
  }

  /**
   * Resolve an element from an ID or element reference.
   * @param {string|HTMLElement} modalIdOrEl
   * @returns {HTMLElement|null}
   */
  getModalElement(modalIdOrEl) {
    if (!modalIdOrEl) return null;
    if (typeof modalIdOrEl === "string") {
      return document.getElementById(modalIdOrEl);
    }
    return modalIdOrEl instanceof HTMLElement ? modalIdOrEl : null;
  }

  /**
   * Open a modal dialog by DOM ID or element reference.
   * @param {string|HTMLElement} modalIdOrEl
   * @returns {HTMLElement|null}
   */
  open(modalIdOrEl) {
    const modal = this.getModalElement(modalIdOrEl);
    if (!modal) return null;

    modal.classList.add(this.activeModalClass);
    modal.setAttribute("aria-hidden", "false");

    const modalId = typeof modalIdOrEl === "string" ? modalIdOrEl : modal.id;
    this.onOpen(modalId, modal);
    return modal;
  }

  /**
   * Alias for open()
   * @param {string|HTMLElement} modalIdOrEl
   * @returns {HTMLElement|null}
   */
  openModal(modalIdOrEl) {
    return this.open(modalIdOrEl);
  }

  /**
   * Close a modal dialog by DOM ID or element reference.
   * @param {string|HTMLElement} modalIdOrEl
   * @returns {HTMLElement|null}
   */
  close(modalIdOrEl) {
    const modal = this.getModalElement(modalIdOrEl);
    if (!modal) return null;

    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.classList.remove(this.activeModalClass);
    modal.setAttribute("aria-hidden", "true");

    const modalId = typeof modalIdOrEl === "string" ? modalIdOrEl : modal.id;
    this.onClose(modalId, modal);
    return modal;
  }

  /**
   * Alias for close()
   * @param {string|HTMLElement} modalIdOrEl
   * @returns {HTMLElement|null}
   */
  closeModal(modalIdOrEl) {
    return this.close(modalIdOrEl);
  }

  /**
   * Toggle modal open/closed state.
   * @param {string|HTMLElement} modalIdOrEl
   * @returns {boolean}
   */
  toggle(modalIdOrEl) {
    const modal = this.getModalElement(modalIdOrEl);
    if (!modal) return false;

    if (this.isOpen(modal)) {
      this.close(modal);
      return false;
    } else {
      this.open(modal);
      return true;
    }
  }

  /**
   * Check if a modal is currently open.
   * @param {string|HTMLElement} modalIdOrEl
   * @returns {boolean}
   */
  isOpen(modalIdOrEl) {
    const modal = this.getModalElement(modalIdOrEl);
    return modal ? modal.classList.contains(this.activeModalClass) : false;
  }

  /**
   * Close all active open modals across overlays.
   * @param {string} [customSelector]
   */
  closeAll(customSelector = null) {
    if (typeof document === "undefined") return;
    const selector = customSelector || this.overlaySelector;
    const openModals = document.querySelectorAll(
      selector.split(",").map(s => `${s.trim()}.${this.activeModalClass}`).join(",")
    );

    openModals.forEach(modal => {
      this.close(modal);
    });
  }

  /**
   * Alias for closeAll()
   */
  closeAllModals(customSelector = null) {
    this.closeAll(customSelector);
  }

  /**
   * Bind event listeners for close triggers, backdrop clicks, and Escape key.
   */
  bindModalEvents() {
    if (typeof document === "undefined") return;

    // 1. Delegate click on close buttons and backdrop overlays
    document.addEventListener("click", (e) => {
      // Check close buttons
      const closeSelector = this.closeSelectors.join(", ");
      const closeBtn = e.target.closest(closeSelector);

      if (closeBtn) {
        e.preventDefault();
        // Priority: target attribute -> closest overlay
        const targetModalId =
          closeBtn.getAttribute("data-close-modal") ||
          closeBtn.getAttribute("data-close-grn-modal") ||
          closeBtn.getAttribute("data-close-inv-modal") ||
          closeBtn.getAttribute("data-close-pay-modal");

        if (targetModalId && document.getElementById(targetModalId)) {
          this.close(targetModalId);
        } else {
          const parentOverlay = closeBtn.closest(this.overlaySelector);
          if (parentOverlay) this.close(parentOverlay);
        }
        return;
      }

      // Check clicking backdrop outside modal content
      if (this.closeOnBackdrop) {
        const overlay = e.target.closest(this.overlaySelector);
        if (overlay && e.target === overlay) {
          this.close(overlay);
        }
      }
    });

    // 2. Escape key closes open modals
    if (this.closeOnEscape) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeAll();
        }
      });
    }
  }

  /**
   * Display floating toast notification.
   *
   * @param {string} message
   * @param {"success"|"error"|"warning"|"info"} [type="success"]
   * @param {number} [duration=3500]
   */
  showToast(message, type = "success", duration = 3500) {
    if (typeof document === "undefined") return;

    let container = document.getElementById(this.toastContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = this.toastContainerId;
      container.className = "po-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `po-toast ${type}`;

    let icon = "fa-check-circle";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "warning") icon = "fa-circle-exclamation";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 260);
    }, duration);
  }

  /**
   * Open a print preview window for printable voucher / document areas.
   *
   * @param {string} contentHtml
   * @param {string} [title="Document"]
   * @param {string} [extraStyles=""]
   */
  printDocument(contentHtml, title = "Document", extraStyles = "") {
    if (typeof window === "undefined") return;

    const printWin = window.open("", "_blank", "width=850,height=900");
    if (!printWin) {
      alert("Please allow popups to print this document.");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 24px; color: #111; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          ${extraStyles}
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 350);
  }

  /**
   * Hook called when a modal is opened. Subclasses can override.
   * @param {string} modalId
   * @param {HTMLElement} element
   */
  onOpen(modalId, element) {}

  /**
   * Hook called when a modal is closed. Subclasses can override.
   * @param {string} modalId
   * @param {HTMLElement} element
   */
  onClose(modalId, element) {}
}

export default BaseModalHandler;

