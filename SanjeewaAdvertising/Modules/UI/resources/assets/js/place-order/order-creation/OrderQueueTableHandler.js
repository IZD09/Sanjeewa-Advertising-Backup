/**
 * SanjeewaAdvertising - Order Queue Table Handler
 * Manages the list of staged orders in the Order Creation Form,
 * renders the table below the form, handles row click for editing
 * (no edit button), and handles row removal.
 */

export class OrderQueueTableHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.onRowClick]
   * @param {Function} [options.onRemoveClick]
   */
  constructor(options = {}) {
    this.items = [];
    this.editingUid = null;
    this.onRowClick = options.onRowClick || (() => {});
    this.onRemoveClick = options.onRemoveClick || (() => {});
  }

  /**
   * Add a new OrderItemModel to the queue.
   *
   * @param {import('./OrderItemModel.js').OrderItemModel} item
   */
  addItem(item) {
    this.items.push(item);
    this.render();
  }

  /**
   * Update an existing queued OrderItemModel by UID.
   *
   * @param {string} uid
   * @param {import('./OrderItemModel.js').OrderItemModel} updatedItem
   * @returns {boolean}
   */
  updateItem(uid, updatedItem) {
    const idx = this.items.findIndex((i) => i.uid === uid);
    if (idx === -1) return false;
    updatedItem.uid = uid;
    this.items[idx] = updatedItem;
    this.render();
    return true;
  }

  /**
   * Remove an order item from the queue by UID.
   *
   * @param {string} uid
   * @returns {import('./OrderItemModel.js').OrderItemModel|null}
   */
  removeItem(uid) {
    const idx = this.items.findIndex((i) => i.uid === uid);
    if (idx === -1) return null;
    const [removed] = this.items.splice(idx, 1);
    if (this.editingUid === uid) {
      this.editingUid = null;
    }
    this.render();
    return removed;
  }

  /**
   * Retrieve an item by UID.
   *
   * @param {string} uid
   * @returns {import('./OrderItemModel.js').OrderItemModel|null}
   */
  getItemByUid(uid) {
    return this.items.find((i) => i.uid === uid) || null;
  }

  /**
   * Retrieve 1-based row number for a UID.
   *
   * @param {string} uid
   * @returns {number}
   */
  getRowNumber(uid) {
    const idx = this.items.findIndex((i) => i.uid === uid);
    return idx === -1 ? 0 : idx + 1;
  }

  /**
   * Get all queued order items.
   *
   * @returns {Array<import('./OrderItemModel.js').OrderItemModel>}
   */
  getAllItems() {
    return [...this.items];
  }

  /**
   * Get number of queued order items.
   *
   * @returns {number}
   */
  getCount() {
    return this.items.length;
  }

  /**
   * Calculate combined grand total of all queued orders.
   *
   * @returns {number}
   */
  getGrandTotal() {
    const sum = this.items.reduce((acc, item) => acc + (Number(item.totalAmount) || 0), 0);
    return Math.round(sum * 100) / 100;
  }

  /**
   * Set active editing row UID and re-render row highlight.
   *
   * @param {string|null} uid
   */
  setEditingUid(uid) {
    this.editingUid = uid;
    this.render();
  }

  /**
   * Get currently editing row UID.
   *
   * @returns {string|null}
   */
  getEditingUid() {
    return this.editingUid;
  }

  /**
   * Clear all queued orders.
   */
  clear() {
    this.items = [];
    this.editingUid = null;
    this.render();
  }

  /**
   * Render the queued orders table, count badge, and grand total.
   */
  render() {
    const tbody = document.getElementById("queuedOrdersTableBody");
    const countBadge = document.getElementById("queuedOrdersCountBadge");
    const grandTotalEl = document.getElementById("queuedOrdersGrandTotal");

    const count = this.items.length;
    const grandTotal = this.getGrandTotal();
    const fmtOpts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    if (countBadge) {
      countBadge.textContent = `${count} ${count === 1 ? "Order" : "Orders"}`;
    }

    if (grandTotalEl) {
      grandTotalEl.textContent = `Rs. ${grandTotal.toLocaleString("en-LK", fmtOpts)}`;
    }

    if (!tbody) return;

    if (count === 0) {
      tbody.innerHTML = `
        <tr class="po-queued-empty-row">
          <td colspan="10">
            <div class="po-queued-empty-state">
              <i class="fa-solid fa-layer-group"></i>
              <span>No orders added yet. Fill in the order details above and click <strong>Add Order</strong> to queue orders for this customer.</span>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";

    this.items.forEach((item, index) => {
      const tr = document.createElement("tr");
      const isEditing = this.editingUid === item.uid;
      tr.className = `po-queued-row${isEditing ? " is-editing" : ""}`;
      tr.dataset.orderUid = item.uid;
      tr.title = "Click to edit this order";

      const notesHtml = item.notes
        ? `<div class="po-queued-subtext po-queued-notes" title="${this.escapeHtml(item.notes)}"><i class="fa-regular fa-note-sticky"></i> ${this.escapeHtml(item.notes)}</div>`
        : "";

      const designBadgeClass = item.designStatus === "Shop Creates Design"
        ? "po-design-pill shop-design"
        : "po-design-pill customer-design";

      tr.innerHTML = `
        <td class="po-col-index">
          <span class="po-row-num">${index + 1}</span>
        </td>
        <td>
          <div class="po-queued-main-text">${this.escapeHtml(item.printingTypeName || "-")}</div>
          <span class="${designBadgeClass}">${this.escapeHtml(item.designStatus)}</span>
          ${notesHtml}
        </td>
        <td>
          <div class="po-queued-staff">
            <i class="fa-regular fa-user"></i>
            <span>${this.escapeHtml(item.userName || "-")}</span>
          </div>
        </td>
        <td>
          <div class="po-queued-main-text">${this.escapeHtml(item.getDimensionsLabel())}</div>
          <div class="po-queued-subtext">${this.escapeHtml(item.getAreaLabel())}</div>
        </td>
        <td class="po-col-num"><strong>${item.qty}</strong></td>
        <td class="po-col-num">Rs. ${Number(item.unitPrice).toLocaleString("en-LK", fmtOpts)}</td>
        <td class="po-col-num">${item.discount > 0 ? `Rs. ${Number(item.discount).toLocaleString("en-LK", fmtOpts)}` : "-"}</td>
        <td>
          <div class="po-queued-main-text">${this.escapeHtml(item.deliveryMethodName || "-")}</div>
          <div class="po-queued-subtext"><i class="fa-regular fa-calendar"></i> ${this.escapeHtml(item.requiredDate || "-")}</div>
        </td>
        <td class="po-col-num po-col-total">
          <strong>Rs. ${Number(item.totalAmount).toLocaleString("en-LK", fmtOpts)}</strong>
        </td>
        <td class="po-col-action">
          <button type="button" class="po-queued-remove-btn" data-remove-uid="${this.escapeHtml(item.uid)}" title="Remove order">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

      // Clicking the row loads the order into the form for editing
      tr.addEventListener("click", () => {
        this.onRowClick(item.uid);
      });

      // Clicking Remove stops row click propagation and removes the order
      const removeBtn = tr.querySelector(".po-queued-remove-btn");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onRemoveClick(item.uid);
        });
      }

      tbody.appendChild(tr);
    });
  }

  /**
   * Escape HTML special characters for safe template rendering.
   *
   * @param {string} value
   * @returns {string}
   */
  escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

export default OrderQueueTableHandler;
