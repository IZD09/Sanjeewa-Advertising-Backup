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
        const costText = item.unit_cost !== undefined ? ` | Cost: Rs. ${Number(item.unit_cost).toFixed(2)}` : "";
        const qtyText = item.qty !== undefined ? ` | Qty: ${item.qty}` : "";
        const opt = document.createElement("option");
        opt.value = String(item.id);
        opt.textContent = `${poBadge}${item.code} - ${item.name} (${item.category_name || "General"}${qtyText}${costText})`;
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
   * Set the active item SKU and automatically select its Category, Subcategory, Brand,
   * populate Quantity Received, Unit Purchase Cost, Standard Selling Price,
   * and trigger live financial calculations.
   *
   * @param {Object} item
   */
  selectItem(item) {
    if (!item) return;

    const masterItems = this.getItems();
    const fullItem = masterItems.find((it) => Number(it.id) === Number(item.id)) || item;
    this.selectedItem = fullItem;

    const idInput = document.getElementById("addStockSelectedItemId");
    if (idInput) idInput.value = String(fullItem.id);

    const itemSelect = document.getElementById("addStockItemSelect");
    if (itemSelect && itemSelect.value !== String(fullItem.id)) {
      itemSelect.value = String(fullItem.id);
    }

    // 1. Automatically select Category & Subcategory
    const catSelect = document.getElementById("addStockCategorySelect");
    if (catSelect && fullItem.category_id) {
      catSelect.value = String(fullItem.category_id);
      this.handleCategoryChange(fullItem.category_id);
      const subcatSelect = document.getElementById("addStockSubcategorySelect");
      if (subcatSelect && fullItem.subcategories_id) {
        subcatSelect.value = String(fullItem.subcategories_id);
      }
    }

    // 2. Automatically select Brand (from compatible brands)
    const brandSelect = document.getElementById("addStockBrandSelect");
    if (brandSelect) {
      const compatible =
        Array.isArray(fullItem.compatible_brands) && fullItem.compatible_brands.length > 0
          ? fullItem.compatible_brands
          : this.getBrands();

      if (compatible.length > 0) {
        brandSelect.innerHTML = '<option value="">-- Select Brand --</option>';
        compatible.forEach((b) => {
          brandSelect.insertAdjacentHTML("beforeend", `<option value="${b.id}">${b.brand}</option>`);
        });
        brandSelect.value = String(compatible[0].id);
      }
    }

    // 3. Automatically populate Quantity Received
    const qtyInput = document.getElementById("addStockQty");
    const qtyVal = item.qty || item.qty_received || item.qty_ordered || 1;
    if (qtyInput) {
      qtyInput.value = qtyVal;
    }

    // 4. Automatically populate Unit Purchase Cost (LKR)
    const unitCostInput = document.getElementById("addStockUnitCost");
    const purchaseCost = item.unit_cost !== undefined ? item.unit_cost : (fullItem.unit_cost || 0);
    if (unitCostInput) {
      unitCostInput.value = Number(purchaseCost).toFixed(2);
    }

    // 5. Automatically populate Standard Selling Price (LKR)
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    if (sellingPriceInput) {
      const sellPrice =
        item.selling_price !== undefined
          ? item.selling_price
          : fullItem.selling_price || (purchaseCost > 0 ? Number(purchaseCost) * 1.25 : 0);
      sellingPriceInput.value = Number(sellPrice).toFixed(2);
    }

    // 6. Notify callbacks and calculate financials immediately
    this.onItemSelected(fullItem);
    this.onCalculate();
  }

  /**
   * Add the currently selected item and its configured inputs to the staged queue table.
   * Removes the item from the SKU dropdown and updates live calculations.
   */
  addSelectedItemToStaged() {
    if (!this.selectedItem) {
      this.showToast("Please select a Material Item (SKU) first.", "warning");
      return;
    }

    const brandSelect = document.getElementById("addStockBrandSelect");
    const brandId = Number(brandSelect?.value) || null;
    const brandName = brandSelect?.options[brandSelect.selectedIndex]?.text || "Generic";

    if (!brandId) {
      this.showToast("Please select a brand for the item.", "warning");
      return;
    }

    const qty = parseInt(document.getElementById("addStockQty")?.value, 10);
    if (isNaN(qty) || qty <= 0) {
      this.showToast("Quantity received must be at least 1.", "warning");
      return;
    }

    const unitCost = parseFloat(document.getElementById("addStockUnitCost")?.value) || 0;
    const sellingPrice = parseFloat(document.getElementById("addStockSellingPrice")?.value) || 0;

    const batchOption = document.querySelector('input[name="addStockBatchOption"]:checked')?.value || "NEW";
    const batchId = batchOption === "EXISTING" ? Number(document.getElementById("addStockBatchSelect")?.value) || null : null;

    const stagedItem = {
      id: this.selectedItem.id,
      code: this.selectedItem.code || `SKU-${this.selectedItem.id}`,
      name: this.selectedItem.name || `Item #${this.selectedItem.id}`,
      category_id: this.selectedItem.category_id,
      category_name: this.selectedItem.category_name || "General",
      brand_id: brandId,
      brand_name: brandName,
      qty: qty,
      unit_cost: unitCost,
      selling_price: sellingPrice,
      subtotal: qty * unitCost,
      batch_id: batchId,
      create_new_batch: batchOption === "NEW" || !batchId,
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
    const batchOption = document.querySelector('input[name="addStockBatchOption"]:checked')?.value || "NEW";
    const batchId = batchOption === "EXISTING" ? Number(document.getElementById("addStockBatchSelect")?.value) || null : null;

    const itemsToAdd = [...this.activeGrnItems];
    itemsToAdd.forEach((item) => {
      const fullItem = masterItems.find((it) => Number(it.id) === Number(item.id)) || item;
      const compatible =
        Array.isArray(fullItem.compatible_brands) && fullItem.compatible_brands.length > 0
          ? fullItem.compatible_brands
          : allBrands;

      const brandId = compatible.length > 0 ? compatible[0].id : (allBrands[0]?.id || 1);
      const brandName = compatible.length > 0 ? compatible[0].brand : (allBrands[0]?.brand || "Generic");

      const qty = parseInt(item.qty || item.qty_received || item.qty_ordered || 1, 10);
      const unitCost = item.unit_cost !== undefined ? parseFloat(item.unit_cost) : (parseFloat(fullItem.unit_cost) || 0);
      const sellingPrice =
        item.selling_price !== undefined
          ? parseFloat(item.selling_price)
          : parseFloat(fullItem.selling_price) || (unitCost > 0 ? roundToTwo(unitCost * 1.25) : 0);

      this.stagedItems.push({
        id: item.id,
        code: item.code || `SKU-${item.id}`,
        name: item.name || `Item #${item.id}`,
        category_id: fullItem.category_id || item.category_id,
        category_name: fullItem.category_name || item.category_name || "General",
        brand_id: brandId,
        brand_name: brandName,
        qty: qty,
        unit_cost: unitCost,
        selling_price: sellingPrice,
        subtotal: qty * unitCost,
        batch_id: batchId,
        create_new_batch: batchOption === "NEW" || !batchId,
        original_item: { ...item, ...fullItem },
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

    if (this.stagedItems.length === 0) {
      container.style.display = "none";
      tbody.innerHTML = "";
      if (queueBadge) queueBadge.style.display = "none";
      if (countBadge) countBadge.textContent = "0 items";
      if (totalCostEl) totalCostEl.textContent = "Rs. 0.00";
      return;
    }

    container.style.display = "block";
    if (queueBadge) queueBadge.style.display = "inline-flex";
    if (queueCount) queueCount.textContent = String(this.stagedItems.length);
    if (countBadge) countBadge.textContent = `${this.stagedItems.length} item${this.stagedItems.length > 1 ? "s" : ""}`;

    let grandCost = 0;
    tbody.innerHTML = "";

    this.stagedItems.forEach((item) => {
      grandCost += Number(item.subtotal || 0);

      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border)";
      tr.innerHTML = `
        <td style="padding: 6px 8px; vertical-align: middle; max-width: 180px; word-break: break-word;">
          <div style="font-weight: 700; color: #1677ff; font-size: 11.5px; word-break: break-all;">${item.code}</div>
          <div style="font-size: 11px; color: var(--text); line-height: 1.3; word-break: break-word;">${item.name}</div>
        </td>
        <td style="padding: 6px 8px; vertical-align: middle; font-size: 11px; color: var(--text-muted); width: 90px; word-break: break-word;">
          ${item.brand_name || "-"}
        </td>
        <td style="padding: 6px 8px; text-align: center; vertical-align: middle; width: 70px;">
          <input type="number" min="1" step="1" value="${item.qty}" 
            class="inv-search-input staged-qty-input" 
            data-item-id="${item.id}"
            style="width: 56px; height: 26px; padding: 2px 4px; text-align: center; font-size: 11.5px; font-weight: 600; box-sizing: border-box;" 
            title="Adjust received quantity">
        </td>
        <td style="padding: 6px 8px; text-align: right; vertical-align: middle; font-size: 11px; font-family: monospace; width: 85px; white-space: nowrap;">
          ${Number(item.unit_cost).toFixed(2)}
        </td>
        <td style="padding: 6px 8px; text-align: right; vertical-align: middle; font-size: 11px; font-family: monospace; color: #52c41a; width: 85px; white-space: nowrap;">
          ${Number(item.selling_price).toFixed(2)}
        </td>
        <td style="padding: 6px 8px; text-align: right; vertical-align: middle; font-size: 11.5px; font-weight: 700; color: #1677ff; font-family: monospace; width: 95px; white-space: nowrap;" class="staged-row-subtotal">
          Rs. ${Number(item.subtotal).toFixed(2)}
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
        const newQty = parseInt(e.target.value, 10);
        if (!isNaN(newQty) && newQty > 0) {
          const item = this.stagedItems.find((it) => Number(it.id) === id);
          if (item) {
            item.qty = newQty;
            item.subtotal = newQty * Number(item.unit_cost);
            const rowSubtotal = e.target.closest("tr")?.querySelector(".staged-row-subtotal");
            if (rowSubtotal) {
              rowSubtotal.textContent = `Rs. ${item.subtotal.toFixed(2)}`;
            }
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
