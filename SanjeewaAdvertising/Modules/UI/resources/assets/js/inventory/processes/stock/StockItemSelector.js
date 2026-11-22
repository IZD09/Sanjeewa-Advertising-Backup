/**
 * SanjeewaAdvertising - Stock Item Selector
 *
 * Handles SKU selection, item dropdown rendering, category/subcategory cascading,
 * compatible brand resolution, and staged items queue management in the Add Stock Modal.
 * Aligned with GRN-first workflow: allows queuing multiple/all Purchase Order items
 * under the selected GRN into a staged table, removing them from the dropdown,
 * and restoring them if removed from the staged table.
 */

export class StockItemSelector {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getItems] - Returns all stock items list
   * @param {Function} [options.getCategories] - Returns categories list
   * @param {Function} [options.getBrands] - Returns brands list
   * @param {Function} [options.showToast] - Shows notification toast
   * @param {Function} [options.onItemSelected] - Callback when an item is chosen
   * @param {Function} [options.onItemCleared] - Callback when selection is cleared
   * @param {Function} [options.onCategoryChanged] - Callback when category is changed
   * @param {Function} [options.onCalculate] - Callback to recalculate live financials
   * @param {Function} [options.onGrnAllStocked] - Callback when all items in GRN are stocked
   */
  constructor(options = {}) {
    this.getItems = options.getItems || (() => []);
    this.getCategories = options.getCategories || (() => []);
    this.getBrands = options.getBrands || (() => []);
    this.showToast = options.showToast || ((msg, type) => console.log(`[Toast ${type}]: ${msg}`));
    this.onItemSelected = options.onItemSelected || (() => {});
    this.onItemCleared = options.onItemCleared || (() => {});
    this.onCategoryChanged = options.onCategoryChanged || (() => {});
    this.onCalculate = options.onCalculate || (() => {});
    this.onGrnAllStocked = options.onGrnAllStocked || (() => {});

    this.selectedItem = null;
    this.activeGrn = null;
    this.activeGrnItems = [];
    this.stagedItems = [];
  }

  /**
   * Bind event listeners for SKU select, category select, and stage queue buttons.
   */
  bindEvents() {
    // Select dropdown change
    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect) {
      itemSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!val) {
          this.clearSelection();
          return;
        }
        const item =
          this.activeGrnItems.find((it) => String(it.id) === String(val)) ||
          this.getItems().find((it) => String(it.id) === String(val));
        if (item) {
          this.selectItem(item);
        }
      });
    }

    // Category change cascading
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => this.handleCategoryChange(e.target.value));
    }

    // + Add Item to Staged Queue Table button
    const btnAdd = document.getElementById("btnAddStockItemToTable");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => this.addSelectedItemToStaged());
    }

    // + Add All GRN Items to Staged Queue Table button
    const btnAddAll = document.getElementById("btnAddAllStockItemsToTable");
    if (btnAddAll) {
      btnAddAll.addEventListener("click", () => this.addAllGrnItemsToStaged());
    }
  }

  /**
   * Set active GRN context, populate un-stocked items into Select Material Item (SKU),
   * and automatically select the first un-stocked item with its financial calculations.
   *
   * @param {Object|null} grn
   */
  setGrnContext(grn) {
    this.activeGrn = grn || null;
    this.activeGrnItems = grn?.items && Array.isArray(grn.items) ? [...grn.items] : [];
    this.stagedItems = [];
    this.renderStagedTable();

    const itemSelect = document.getElementById("addStockItemSelect");
    const itemHint = document.getElementById("addStockItemHint");
    const idInput = document.getElementById("addStockSelectedItemId");
    const btnAdd = document.getElementById("btnAddStockItemToTable");
    const btnAddAll = document.getElementById("btnAddAllStockItemsToTable");

    if (!itemSelect) return;

    itemSelect.innerHTML = "";

    if (!this.activeGrn) {
      itemSelect.innerHTML = '<option value="">-- Select a GRN Reference above first --</option>';
      itemSelect.disabled = true;
      if (btnAdd) btnAdd.disabled = true;
      if (btnAddAll) btnAddAll.disabled = true;
      if (itemHint) itemHint.textContent = "Please select a GRN Reference above first.";
      if (idInput) idInput.value = "";
      this.clearSelection();
      return;
    }

    itemSelect.disabled = false;
    if (btnAdd) btnAdd.disabled = false;
    if (btnAddAll) btnAddAll.disabled = false;

    this.renderDropdownOptions();
  }

  /**
   * Render options inside the Select Material Item (SKU) dropdown.
   */
  renderDropdownOptions() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const itemHint = document.getElementById("addStockItemHint");
    const idInput = document.getElementById("addStockSelectedItemId");
    const btnAdd = document.getElementById("btnAddStockItemToTable");
    const btnAddAll = document.getElementById("btnAddAllStockItemsToTable");

    if (!itemSelect) return;

    itemSelect.innerHTML = "";

    if (this.activeGrnItems.length > 0) {
      itemSelect.disabled = false;
      if (btnAdd) btnAdd.disabled = false;
      if (btnAddAll) btnAddAll.disabled = false;

      const defaultOpt = document.createElement("option");
      defaultOpt.value = "";
      defaultOpt.textContent = `-- Select Material Item (${this.activeGrnItems.length} available) --`;
      itemSelect.appendChild(defaultOpt);

      this.activeGrnItems.forEach((item) => {
        const poBadge = item.po_id ? `[PO #${item.po_id}] ` : "";
        const catText = `${item.category_name || "General"} / ${item.subcategory_name || "General"}`;
        const brandText = item.brand_name ? ` | Brand: ${item.brand_name}` : "";
        const batchText = item.batch_no ? ` | Batch: ${item.batch_no}` : " | No Batch ID";
        const costText = item.unit_cost !== undefined ? ` | Cost: Rs. ${Number(item.unit_cost).toFixed(2)}` : "";
        const qtyText = item.qty !== undefined ? ` | Qty: ${item.qty}` : "";
        const opt = document.createElement("option");
        opt.value = String(item.id);
        opt.textContent = `${poBadge}${item.code} - ${item.name} (${catText}${brandText}${batchText}${qtyText}${costText})`;
        itemSelect.appendChild(opt);
      });

      if (itemHint) {
        const poText = this.activeGrn?.po_numbers ? ` (${this.activeGrn.po_numbers})` : "";
        const supText = this.activeGrn?.supplier_name ? ` - Supplier: ${this.activeGrn.supplier_name}` : "";
        itemHint.textContent = `${this.activeGrnItems.length} unstocked Purchase Order item(s) available for this GRN${poText}${supText}`;
      }

      // Automatically select and load the first un-stocked item
      const firstItem = this.activeGrnItems[0];
      itemSelect.value = String(firstItem.id);
      this.selectItem(firstItem);
    } else {
      if (this.stagedItems.length > 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = `-- All GRN items queued in table (${this.stagedItems.length} items queued) --`;
        itemSelect.appendChild(opt);
        itemSelect.disabled = true;
        if (btnAdd) btnAdd.disabled = true;
        if (btnAddAll) btnAddAll.disabled = true;

        if (itemHint) {
          itemHint.textContent = `All items under this GRN are queued in the table below. Click 'Save Stock Shipment' to receive them.`;
        }
      } else {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "-- All items under this GRN already added to stock --";
        itemSelect.appendChild(opt);
        itemSelect.disabled = true;
        if (btnAdd) btnAdd.disabled = true;
        if (btnAddAll) btnAddAll.disabled = true;

        if (itemHint) {
          itemHint.textContent = "All Purchase Order items under this GRN have already been added to stock.";
        }
      }

      if (idInput) idInput.value = "";
      this.clearSelection();
    }
  }

  /**
   * Cascade Subcategories when Category is selected.
   * @param {string|number} catId
   */
  handleCategoryChange(catId) {
    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (!subcatSelect) return;

    subcatSelect.innerHTML = '<option value="">-- Select Subcategory --</option>';
    if (!catId) {
      subcatSelect.disabled = true;
      this.onCategoryChanged(null);
      return;
    }

    const categories = this.getCategories();
    const cat = categories.find((c) => String(c.id) === String(catId));
    (cat?.subcategories || []).forEach((sub) => {
      subcatSelect.insertAdjacentHTML("beforeend", `<option value="${sub.id}">${sub.subcategory}</option>`);
    });
    subcatSelect.disabled = false;
    this.onCategoryChanged(catId);
  }

  /**
   * Set the active item SKU, populate Quantity Received, Unit Purchase Cost,
   * Standard Selling Price, and trigger live financial calculations.
   *
   * @param {Object} item
   */
  selectItem(item) {
    if (!item) return;

    const masterItems = this.getItems();
    const masterItem = masterItems.find((it) => Number(it.id) === Number(item.id)) || {};
    const fullItem = { ...masterItem, ...item };
    this.selectedItem = fullItem;

    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = String(fullItem.id);

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect && itemSelect.value !== String(fullItem.id)) {
      itemSelect.value = String(fullItem.id);
    }

    // 1. Automatically populate Quantity Received
    const qtyInput = document.getElementById("addStockQty");
    const qtyVal = item.qty || item.qty_received || item.qty_ordered || 1;
    if (qtyInput) {
      qtyInput.value = qtyVal;
    }

    // 2. Automatically populate Unit Purchase Cost (LKR)
    const unitCostInput = document.getElementById("addStockUnitCost");
    const purchaseCost = item.unit_cost !== undefined ? item.unit_cost : (fullItem.unit_cost || 0);
    if (unitCostInput) {
      unitCostInput.value = Number(purchaseCost).toFixed(2);
    }

    // 3. Automatically populate Standard Selling Price (LKR)
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    if (sellingPriceInput) {
      const sellPrice =
        item.selling_price !== undefined
          ? item.selling_price
          : fullItem.selling_price || (purchaseCost > 0 ? Number(purchaseCost) * 1.25 : 0);
      sellingPriceInput.value = Number(sellPrice).toFixed(2);
    }

    // 4. Notify callbacks and calculate financials immediately
    this.onItemSelected(fullItem);
    this.onCalculate();
  }

  /**
   * Add the currently selected item and its GRN-derived Category, Subcategory, Brand, and Batch ID
   * to the staged queue table. Removes the item from the SKU dropdown and updates live calculations.
   */
  addSelectedItemToStaged() {
    if (!this.selectedItem) {
      this.showToast("Please select a Material Item (SKU) first.", "warning");
      return;
    }

    const allBrands = this.getBrands();
    const compatible =
      Array.isArray(this.selectedItem.compatible_brands) && this.selectedItem.compatible_brands.length > 0
        ? this.selectedItem.compatible_brands
        : allBrands;

    const brandId =
      Number(this.selectedItem.brand_id) ||
      (compatible.length > 0 ? Number(compatible[0].id) : Number(allBrands[0]?.id || 1));
    const brandName =
      this.selectedItem.brand_name ||
      (compatible.length > 0 ? compatible[0].brand : (allBrands[0]?.brand || "Generic"));

    const grnQty = parseInt(this.selectedItem.qty || this.selectedItem.qty_received || this.selectedItem.qty_ordered || 1, 10);
    const receivedQty = 0;

    const unitCost = this.selectedItem.unit_cost !== undefined ? parseFloat(this.selectedItem.unit_cost) || 0 : 0;
    const sellingPrice =
      this.selectedItem.selling_price !== undefined
        ? parseFloat(this.selectedItem.selling_price) || 0
        : unitCost > 0 ? roundToTwo(unitCost * 1.25) : 0;

    const batchId = this.selectedItem.batch_id ? Number(this.selectedItem.batch_id) : null;
    const batchNo = this.selectedItem.batch_no || (batchId ? `BAT-${String(batchId).padStart(3, "0")}` : null);

    const stagedItem = {
      id: this.selectedItem.id,
      code: this.selectedItem.code || `SKU-${this.selectedItem.id}`,
      name: this.selectedItem.name || `Item #${this.selectedItem.id}`,
      category_id: this.selectedItem.category_id,
      category_name: this.selectedItem.category_name || "General",
      subcategories_id: this.selectedItem.subcategories_id,
      subcategory_name: this.selectedItem.subcategory_name || "General",
      brand_id: brandId,
      brand_name: brandName,
      grn_qty: grnQty,
      qty: receivedQty,
      unit_cost: unitCost,
      selling_price: sellingPrice,
      subtotal: receivedQty * unitCost,
      batch_id: batchId,
      batch_no: batchNo,
      create_new_batch: !batchId,
      original_item: { ...this.selectedItem },
    };

    // Add to staged items list
    this.stagedItems.push(stagedItem);

    // Remove from active GRN items list
    const addedId = this.selectedItem.id;
    this.activeGrnItems = this.activeGrnItems.filter((it) => Number(it.id) !== Number(addedId));

    // Update dropdown options
    this.renderDropdownOptions();

    // Render table
    this.renderStagedTable();

    // Recalculate totals
    this.onCalculate();

    this.showToast(`Added "${stagedItem.code} - ${stagedItem.name}" to queue.`, "success");
  }

  /**
   * Add all remaining items from the active GRN to the staged queue table at once.
   */
  addAllGrnItemsToStaged() {
    if (!this.activeGrnItems || this.activeGrnItems.length === 0) {
      this.showToast("No pending items available in this GRN to add.", "info");
      return;
    }

    const masterItems = this.getItems();
    const allBrands = this.getBrands();

    const itemsToAdd = [...this.activeGrnItems];
    itemsToAdd.forEach((item) => {
      const masterItem = masterItems.find((it) => Number(it.id) === Number(item.id)) || {};
      const fullItem = { ...masterItem, ...item };
      const compatible =
        Array.isArray(fullItem.compatible_brands) && fullItem.compatible_brands.length > 0
          ? fullItem.compatible_brands
          : allBrands;

      const brandId =
        Number(fullItem.brand_id) ||
        (compatible.length > 0 ? Number(compatible[0].id) : Number(allBrands[0]?.id || 1));
      const brandName =
        fullItem.brand_name ||
        (compatible.length > 0 ? compatible[0].brand : (allBrands[0]?.brand || "Generic"));

      const grnQty = parseInt(fullItem.qty || fullItem.qty_received || fullItem.qty_ordered || 1, 10);
      const receivedQty = 0;
      const unitCost = fullItem.unit_cost !== undefined ? parseFloat(fullItem.unit_cost) : 0;
      const sellingPrice =
        fullItem.selling_price !== undefined
          ? parseFloat(fullItem.selling_price)
          : unitCost > 0 ? roundToTwo(unitCost * 1.25) : 0;

      const batchId = fullItem.batch_id ? Number(fullItem.batch_id) : null;
      const batchNo = fullItem.batch_no || (batchId ? `BAT-${String(batchId).padStart(3, "0")}` : null);

      this.stagedItems.push({
        id: fullItem.id,
        code: fullItem.code || `SKU-${fullItem.id}`,
        name: fullItem.name || `Item #${fullItem.id}`,
        category_id: fullItem.category_id,
        category_name: fullItem.category_name || "General",
        subcategories_id: fullItem.subcategories_id,
        subcategory_name: fullItem.subcategory_name || "General",
        brand_id: brandId,
        brand_name: brandName,
        grn_qty: grnQty,
        qty: receivedQty,
        unit_cost: unitCost,
        selling_price: sellingPrice,
        subtotal: receivedQty * unitCost,
        batch_id: batchId,
        batch_no: batchNo,
        create_new_batch: !batchId,
        original_item: { ...fullItem },
      });
    });

    this.activeGrnItems = [];

    this.renderDropdownOptions();
    this.renderStagedTable();
    this.onCalculate();

    this.showToast(`Queued all ${itemsToAdd.length} items from GRN into the table.`, "success");
  }

  /**
   * Remove an item from the staged queue and return it to the SKU select dropdown.
   *
   * @param {string|number} itemId
   */
  removeStagedItem(itemId) {
    const idx = this.stagedItems.findIndex((it) => Number(it.id) === Number(itemId));
    if (idx === -1) return;

    const [removed] = this.stagedItems.splice(idx, 1);

    // Return to active GRN pool
    const originalItem = removed.original_item || {
      id: removed.id,
      code: removed.code,
      name: removed.name,
      category_id: removed.category_id,
      category_name: removed.category_name,
      unit_cost: removed.unit_cost,
      selling_price: removed.selling_price,
      qty: removed.qty,
    };

    this.activeGrnItems.unshift(originalItem);

    // Re-render dropdown and select this returned item
    this.renderDropdownOptions();

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect) {
      itemSelect.value = String(originalItem.id);
      this.selectItem(originalItem);
    }

    // Render table
    this.renderStagedTable();

    // Recalculate totals
    this.onCalculate();

    this.showToast(`Returned "${removed.code}" back to selection dropdown.`, "info");
  }

  /**
   * Render the staged items queue table DOM.
   */
  renderStagedTable() {
    const container = document.getElementById("addStockStagedContainer");
    const tbody = document.getElementById("addStockStagedTbody");
    const countBadge = document.getElementById("addStockStagedItemsBadge");
    const totalCostEl = document.getElementById("addStockStagedTotalCost");
    const queueBadge = document.getElementById("stagedQueueBadge");
    const queueCount = document.getElementById("stagedQueueCount");

    if (!container || !tbody) return;

    container.style.display = "block";

    if (this.stagedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 24px 12px; text-align: center; color: var(--text-muted, #8c8c8c); font-size: 12px;">
            <i class="fa-solid fa-cart-plus" style="font-size: 18px; color: #bfbfbf; display: block; margin-bottom: 6px;"></i>
            No items queued yet. Please select a GRN and click <strong>Add</strong> or <strong>Add All</strong> to add items.
          </td>
        </tr>
      `;
      if (queueBadge) queueBadge.style.display = "none";
      if (countBadge) countBadge.textContent = "0 items";
      if (totalCostEl) totalCostEl.textContent = "Rs. 0.00";
      return;
    }
    if (queueBadge) queueBadge.style.display = "inline-flex";
    if (queueCount) queueCount.textContent = String(this.stagedItems.length);
    if (countBadge) countBadge.textContent = `${this.stagedItems.length} item${this.stagedItems.length > 1 ? "s" : ""}`;

    let grandCost = 0;
    tbody.innerHTML = "";

    this.stagedItems.forEach((item) => {
      grandCost += Number(item.subtotal || 0);

      const batchNoText = item.batch_no || (item.batch_id ? `BAT-${String(item.batch_id).padStart(3, "0")}` : null);
      const batchBadgeHtml = batchNoText
        ? `<span style="display: inline-flex; align-items: center; gap: 4px; font-family: monospace; font-size: 11px; font-weight: 700; color: #722ed1; background: #f9f0ff; border: 1px solid #d3adf7; padding: 2px 7px; border-radius: 4px; white-space: nowrap;">
             <i class="fa-solid fa-barcode"></i> ${batchNoText}
           </span>`
        : `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--text-muted, #8c8c8c); background: var(--surface-2, #f5f5f5); border: 1px solid var(--border, #d9d9d9); padding: 2px 7px; border-radius: 4px; white-space: nowrap;">
             No Batch ID
           </span>`;

      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border)";
      tr.innerHTML = `
        <td style="padding: 6px 8px; vertical-align: middle; max-width: 170px; word-break: break-word;">
          <div style="font-weight: 700; color: #1677ff; font-size: 11.5px; word-break: break-all;">${item.code}</div>
          <div style="font-size: 11px; color: var(--text); line-height: 1.3; word-break: break-word;">${item.name}</div>
        </td>
        <td style="padding: 6px 8px; vertical-align: middle; font-size: 11px; color: var(--text); font-weight: 600; width: 100px; word-break: break-word;">
          ${item.category_name || "General"}
        </td>
        <td style="padding: 6px 8px; vertical-align: middle; font-size: 11px; color: var(--text-muted); width: 105px; word-break: break-word;">
          ${item.subcategory_name || "General"}
        </td>
        <td style="padding: 6px 8px; vertical-align: middle; font-size: 11px; color: var(--text); font-weight: 600; width: 90px; word-break: break-word;">
          ${item.brand_name || "Generic"}
        </td>
        <td style="padding: 6px 8px; vertical-align: middle; width: 115px;">
          ${batchBadgeHtml}
        </td>
        <td style="padding: 6px 8px; text-align: center; vertical-align: middle; width: 55px; font-size: 11.5px; font-weight: 600; color: var(--text-muted);">
          ${item.grn_qty ?? item.qty}
        </td>
        <td style="padding: 6px 8px; text-align: center; vertical-align: middle; width: 75px;">
          <input type="number" min="0" max="${item.grn_qty ?? item.qty}" step="1" value="${item.qty}" 
            class="inv-search-input staged-qty-input" 
            data-item-id="${item.id}"
            style="width: 60px; height: 26px; padding: 2px 4px; text-align: center; font-size: 11.5px; font-weight: 700; color: #1677ff; box-sizing: border-box;" 
            title="Enter received quantity (max ${item.grn_qty ?? item.qty})">
        </td>
        <td style="padding: 6px 8px; text-align: center; vertical-align: middle; width: 45px;">
          <button type="button" class="ant-btn ant-btn-text btn-remove-staged" data-item-id="${item.id}" 
            style="color: #ff4d4f; padding: 0; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: none; background: transparent; cursor: pointer; border-radius: 4px; margin: 0 auto;" 
            title="Remove item and return to dropdown">
            <i class="fa-solid fa-trash-can" style="font-size: 12px;"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    if (totalCostEl) {
      totalCostEl.textContent = `Rs. ${grandCost.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Attach event listeners for dynamic quantity adjustments
    tbody.querySelectorAll(".staged-qty-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const id = Number(e.target.dataset.itemId);
        let newQty = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
        if (!isNaN(newQty) && newQty >= 0) {
          const item = this.stagedItems.find((it) => Number(it.id) === id);
          if (item) {
            const maxQty = Number(item.grn_qty);
            if (!isNaN(maxQty) && maxQty > 0 && newQty > maxQty) {
              newQty = maxQty;
              e.target.value = String(maxQty);
              this.showToast(`Received quantity for "${item.code}" cannot exceed GRN Qty (${maxQty}).`, "warning");
            }
            item.qty = newQty;
            item.subtotal = newQty * Number(item.unit_cost);
            this.updateStagedSummary();
            this.onCalculate();
          }
        }
      });
    });

    // Attach event listeners for row removal
    tbody.querySelectorAll(".btn-remove-staged").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.itemId);
        this.removeStagedItem(id);
      });
    });
  }

  /**
   * Update staged summary badge and total cost without re-rendering all rows.
   */
  updateStagedSummary() {
    const totalCostEl = document.getElementById("addStockStagedTotalCost");
    const countBadge = document.getElementById("addStockStagedItemsBadge");
    const queueCount = document.getElementById("stagedQueueCount");

    let grandCost = 0;
    this.stagedItems.forEach((item) => {
      grandCost += Number(item.subtotal || 0);
    });

    if (totalCostEl) {
      totalCostEl.textContent = `Rs. ${grandCost.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (countBadge) {
      countBadge.textContent = `${this.stagedItems.length} item${this.stagedItems.length > 1 ? "s" : ""}`;
    }
    if (queueCount) {
      queueCount.textContent = String(this.stagedItems.length);
    }
  }

  /**
   * Clear all staged items and reset the queue table.
   */
  clearStaged() {
    this.stagedItems = [];
    this.renderStagedTable();
  }

  /**
   * Remove an item from the active GRN pool once it has been added to stock.
   *
   * @param {string|number} itemId
   */
  removeItemFromGrn(itemId) {
    if (!itemId) return;
    this.activeGrnItems = this.activeGrnItems.filter((it) => Number(it.id) !== Number(itemId));
    this.renderDropdownOptions();
  }

  /**
   * Clear active SKU selection and reset inputs.
   */
  clearSelection() {
    this.selectedItem = null;
    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = "";

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect && (!itemSelect.value || this.activeGrnItems.length === 0)) {
      itemSelect.value = "";
    }

    if (this.activeGrnItems.length === 0) {
      const qtyInput = document.getElementById("addStockQty");
      const unitCostInput = document.getElementById("addStockUnitCost");
      const sellingPriceInput = document.getElementById("addStockSellingPrice");

      if (qtyInput) qtyInput.value = "";
      if (unitCostInput) unitCostInput.value = "";
      if (sellingPriceInput) sellingPriceInput.value = "";
    }

    this.onItemCleared();
    this.onCalculate();
  }

  /**
   * Reset the selector state completely.
   */
  reset() {
    this.clearStaged();
    this.clearSelection();
    this.activeGrn = null;
    this.activeGrnItems = [];

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect) {
      itemSelect.innerHTML = '<option value="">-- Select Material Item (SKU) --</option>';
      itemSelect.value = "";
      itemSelect.disabled = false;
    }

    const catSelect = document.getElementById("addStockCategorySelect");
    const subcatSelect = document.getElementById("addStockSubcategorySelect");
    if (catSelect) catSelect.value = "";
    if (subcatSelect) {
      subcatSelect.value = "";
      subcatSelect.disabled = true;
    }

    const itemHint = document.getElementById("addStockItemHint");
    if (itemHint) itemHint.textContent = "Pending Purchase Order items for this GRN";
  }
}

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

export default StockItemSelector;
