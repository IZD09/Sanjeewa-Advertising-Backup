/**
 * Shared Cancel Order Confirmation Modal helper.
 */

let activeConfirmHandler = null;
let modalBound = false;

function closeCancelModal() {
  const modal = document.getElementById("cancelOrderConfirmModal");
  if (!modal) return;

  if (document.activeElement && modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  activeConfirmHandler = null;
}

function bindCancelModalEvents() {
  if (modalBound || typeof document === "undefined") return;
  const modal = document.getElementById("cancelOrderConfirmModal");
  if (!modal) return;

  modalBound = true;

  const closeBtn = document.getElementById("cancelOrderModalCloseBtn");
  const keepBtn = document.getElementById("cancelOrderModalKeepBtn");
  const confirmBtn = document.getElementById("cancelOrderModalConfirmBtn");

  if (closeBtn) closeBtn.addEventListener("click", closeCancelModal);
  if (keepBtn) keepBtn.addEventListener("click", closeCancelModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeCancelModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeCancelModal();
    }
  });

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (typeof activeConfirmHandler !== "function") {
        closeCancelModal();
        return;
      }

      const originalHtml = confirmBtn.innerHTML;
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cancelling...';

      try {
        await activeConfirmHandler();
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalHtml;
        closeCancelModal();
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
export function openCancelOrderModal({ targetLabel = "this order", onConfirm } = {}) {
  bindCancelModalEvents();

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

  activeConfirmHandler = onConfirm;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
