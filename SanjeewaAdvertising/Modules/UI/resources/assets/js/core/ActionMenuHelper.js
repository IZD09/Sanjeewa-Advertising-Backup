/**
 * Shared floating row action dropdown helper (avoids overflow clipping inside responsive tables).
 */

let listenersBound = false;

export function closeAllActionMenus() {
  document.querySelectorAll(".row-action-dropdown.open").forEach((menu) => {
    menu.classList.remove("open");
    menu.style.display = "none";
  });
}

function bindGlobalCloseListeners() {
  if (listenersBound || typeof document === "undefined") {
    return;
  }
  listenersBound = true;

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".row-action-menu-wrap")) {
      closeAllActionMenus();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllActionMenus();
    }
  });

  window.addEventListener("scroll", closeAllActionMenus, true);
  window.addEventListener("resize", closeAllActionMenus);
}

/**
 * Toggle a row's floating action menu next to its trigger button.
 *
 * @param {HTMLElement} triggerBtn
 */
export function toggleRowActionMenu(triggerBtn) {
  if (!triggerBtn) return;
  bindGlobalCloseListeners();

  const wrap = triggerBtn.closest(".row-action-menu-wrap");
  const menu = wrap ? wrap.querySelector(".row-action-dropdown") : null;
  if (!menu) return;

  const isAlreadyOpen = menu.classList.contains("open");
  closeAllActionMenus();

  if (isAlreadyOpen) {
    return;
  }

  menu.style.display = "block";
  menu.style.visibility = "hidden";
  menu.classList.add("open");

  const btnRect = triggerBtn.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const gap = 6;

  let top = btnRect.bottom + gap;
  if (top + menuRect.height > window.innerHeight - 12) {
    top = Math.max(12, btnRect.top - menuRect.height - gap);
  }

  const right = Math.max(12, window.innerWidth - btnRect.right);

  menu.style.top = `${top}px`;
  menu.style.right = `${right}px`;
  menu.style.left = "auto";
  menu.style.visibility = "visible";
}
