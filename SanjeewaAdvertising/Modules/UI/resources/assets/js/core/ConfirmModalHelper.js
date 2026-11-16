/**
 * ConfirmModalHelper Component Class
 * Shared Cancel Order Confirmation Modal helper.
 * Provides both static helper utilities and instance method wrappers.
 */

"use strict";

export class ConfirmModalHelper {
  static activeConfirmHandler = null;
  static modalBound = false;

  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Close the cancel order confirmation modal and reset state.
   */
  static closeCancelModal() {
    if (typeof document === "undefined") return;
    const modal = document.getElementById("cancelOrderConfirmModal");
    if (!modal) return;

    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    this.activeConfirmHandler = null;
  }

  /**
   * Bind DOM listeners for the cancel order confirmation modal.
   */
  static bindCancelModalEvents() {
    if (this.modalBound || typeof document === "undefined") return;
    const modal = document.getElementById("cancelOrderConfirmModal");
    if (!modal) return;

    this.modalBound = true;

    const closeBtn = document.getElementById("cancelOrderModalCloseBtn");
    const keepBtn = document.getElementById("cancelOrderModalKeepBtn");
    const confirmBtn = document.getElementById("cancelOrderModalConfirmBtn");

    const closeHandler = () => this.closeCancelModal();

    if (closeBtn) closeBtn.addEventListener("click", closeHandler);
    if (keepBtn) keepBtn.addEventListener("click", closeHandler);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeCancelModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        this.closeCancelModal();
      }
    });

    if (confirmBtn) {
      confirmBtn.addEventListener("click", async () => {
        if (typeof this.activeConfirmHandler !== "function") {
          this.closeCancelModal();
          return;
        }

        const originalHtml = confirmBtn.innerHTML;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cancelling...';

        try {
          await this.activeConfirmHandler();
        } finally {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = originalHtml;
          this.closeCancelModal();
        }
      });
    }
  }

  /**
   * Open the cancel order confirmation modal.
   *
   * @param {Object} options
   * @param {string} [options.targetLabel="this order"]
   * @param {Function} options.onConfirm
   */
  static openCancelOrderModal({ targetLabel = "this order", onConfirm } = {}) {
    this.bindCancelModalEvents();

    const modal = document.getElementById("cancelOrderConfirmModal");
    const labelEl = document.getElementById("cancelOrderTargetLabel");
    if (!modal) {
      if (typeof onConfirm === "function") {
        onConfirm();
      }
      return;
    }

    if (labelEl) {
      labelEl.textContent = targetLabel;
    }

    this.activeConfirmHandler = onConfirm;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  // --- Instance Method Wrappers for Flexible OOP Usage ---

  closeCancelModal() {
    ConfirmModalHelper.closeCancelModal();
  }

  openCancelOrderModal(options = {}) {
    ConfirmModalHelper.openCancelOrderModal(options);
  }
}

export const openCancelOrderModal = (...args) => ConfirmModalHelper.openCancelOrderModal(...args);
export const closeCancelModal = (...args) => ConfirmModalHelper.closeCancelModal(...args);

export default ConfirmModalHelper;
