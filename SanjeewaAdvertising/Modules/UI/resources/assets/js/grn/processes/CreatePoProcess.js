/**
 * SanjeewaAdvertising - Create Purchase Order (PO) Process
 *
 * Encapsulates state, database stock items loading, supplier resolution,
 * PO line item management, total calculation, validation, and PO API submission.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

export class CreatePoProcess {
  /**
   * @param {Object} context
   */
  constructor(context = {}) {
    this.ctx = context;
    this.http = new RequestHandler();

    this.newPoItems = [];
    this.selectedSupplier = null;
    this.selectedCategory = "ALL";
    this.selectedSubcategory = "ALL";
    this.dbCategories = [];
    this.catalogItems = [];
    this.catalogLoaded = false;
  }

  /**
   * Reset PO creation state before opening the modal.
   */
  resetState() {
    this.newPoItems = [];
    this.selectedSupplier = null;
    this.selectedCategory = "ALL";
    this.selectedSubcategory = "ALL";
  }

  /**
   * Fetch master stock items and categories from database via API.
   * @param {boolean} [forceRefresh=false]
   * @param {Object} [callbacks={}]
   * @returns {Promise<Array>}
   */
  async loadCatalogItemsFromDatabase(forceRefresh = false, callbacks = {}) {
    if (this.catalogLoaded && !forceRefresh && this.catalogItems.length > 0) {
      return this.catalogItems;
    }

    if (typeof callbacks.onStart === "function") callbacks.onStart();

    try {
      const response = await this.http.get("/api/v1/inventory/stock-items/data");
      if (response && response.success && response.data) {
        const rawItems = response.data.stock_items || [];
        this.dbCategories = Array.isArray(response.data.categories) ? response.data.categories : [];
        this.catalogItems = rawItems.map((item) => {
          let latestCost = 0;
          if (Array.isArray(item.stocks) && item.stocks.length > 0) {
            latestCost = parseFloat(item.stocks[0].buy) || 0;
          }

          let unit = item.unit || item.stock_unit?.unit || item.stock_unit?.symble || "Units";
          if (unit === "Units") {
            const lowerName = (item.name || "").toLowerCase();
            if (lowerName.includes("ink") || lowerName.includes("liter") || lowerName.includes("solvent")) {
              unit = "Liters";
            } else if (lowerName.includes("board") || lowerName.includes("paper") || lowerName.includes("sheet")) {
              unit = "Sheets";
            } else if (lowerName.includes("flex") || lowerName.includes("vinyl") || lowerName.includes("film") || lowerName.includes("banner")) {
              unit = "Rolls";
            } else if (lowerName.includes("stand") || lowerName.includes("display")) {
              unit = "Pieces";
            }
          }

          return {
            id: item.id,
            code: item.code || `ITM-${item.id}`,
            name: item.name,
            unit: unit,
            unitPrice: latestCost > 0 ? latestCost : (parseFloat(item.unit_cost) || 0),
            category_id: item.subcategory?.category?.id || null,
            category: item.subcategory?.category?.category || "General",
            subcategory_id: item.subcategory?.id || item.subcategory_id || null,
            subcategory: item.subcategory?.subcategory || "",
          };
        });

        this.catalogLoaded = true;
        if (typeof callbacks.onSuccess === "function") {
          callbacks.onSuccess(this.catalogItems, this.dbCategories);
        }
      }
    } catch (err) {
      console.warn("[CreatePoProcess] Could not fetch database stock items:", err);
      if (this.ctx.getCatalogItems) {
        this.catalogItems = this.ctx.getCatalogItems();
      }
      if (typeof callbacks.onError === "function") {
        callbacks.onError(err);
      }
    } finally {
      if (typeof callbacks.onEnd === "function") callbacks.onEnd();
    }

    return this.catalogItems;
  }

  /**
   * Ensure suppliers are loaded in context.
   */
  async ensureSuppliersLoaded() {
    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    if ((!suppliers || suppliers.length === 0) && this.ctx.dataLoader?.fetchSuppliers) {
      await this.ctx.dataLoader.fetchSuppliers({ per_page: 100 }, true);
    }
  }

  /**
   * Resolve a supplier object by ID or Name.
   * @param {string|number} nameOrId
   * @returns {Object|null}
   */
  resolveSupplierByNameOrId(nameOrId) {
    if (!nameOrId) return null;
    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    const clean = String(nameOrId).trim().toLowerCase();
    const found = suppliers.find(
      s => String(s.id) === String(nameOrId) || String(s.name || "").trim().toLowerCase() === clean
    );
    if (found) {
      return found;
    }
    return { id: null, name: String(nameOrId).trim(), mobile: "", code: "" };
  }

  /**
   * Add a selected stock item to the PO line items list (or increment qty if already present).
   * @param {Object} item
   * @returns {{incremented: boolean, item: Object, qty: number}}
   */
  addItemToPo(item) {
    const existingIndex = this.newPoItems.findIndex(
      (row) => row.item_id === item.code || (row.id && row.id === item.id)
    );

    if (existingIndex !== -1) {
      this.newPoItems[existingIndex].qty += 1;
      this.newPoItems[existingIndex].total =
        this.newPoItems[existingIndex].qty * this.newPoItems[existingIndex].unit_cost;
      return {
        incremented: true,
        item: this.newPoItems[existingIndex],
        qty: this.newPoItems[existingIndex].qty
      };
    }

    const unitCost = Number(item.unitPrice) || 0;
    const newRow = {
      id: item.id,
      stock_items_id: item.id,
      item_id: item.code,
      item_name: item.name,
      unit: item.unit || "Units",
      qty: 1,
      unit_cost: unitCost,
      total: unitCost * 1,
    };
    this.newPoItems.push(newRow);

    return {
      incremented: false,
      item: newRow,
      qty: 1
    };
  }

  /**
   * Remove a line item row by index.
   * @param {number} index
   */
  removeNewPoRow(index) {
    this.newPoItems.splice(index, 1);
  }

  /**
   * Update row item by SKU code.
   * @param {number} index
   * @param {string} itemCode
   * @returns {boolean}
   */
  updateRowItemByCode(index, itemCode) {
    if (!this.newPoItems[index]) return false;
    const catalog = this.catalogItems.length > 0
      ? this.catalogItems
      : (this.ctx.getCatalogItems ? this.ctx.getCatalogItems() : []);
    const found = (catalog || []).find(i => i.code === itemCode);
    if (!found) return false;

    this.newPoItems[index].id = found.id;
    this.newPoItems[index].stock_items_id = found.id;
    this.newPoItems[index].item_id = found.code;
    this.newPoItems[index].item_name = found.name;
    this.newPoItems[index].unit = found.unit || "Units";
    this.newPoItems[index].unit_cost = found.unitPrice || 0;
    this.newPoItems[index].total = this.newPoItems[index].qty * this.newPoItems[index].unit_cost;
    return true;
  }

  /**
   * Update order quantity for a line item.
   * @param {number} index
   * @param {number|string} qtyVal
   */
  updateRowQty(index, qtyVal) {
    if (!this.newPoItems[index]) return;
    const qty = parseFloat(qtyVal) || 0;
    this.newPoItems[index].qty = qty;
    this.newPoItems[index].total = qty * this.newPoItems[index].unit_cost;
  }

  /**
   * Update unit cost for a line item.
   * @param {number} index
   * @param {number|string} costVal
   */
  updateRowCost(index, costVal) {
    if (!this.newPoItems[index]) return;
    const cost = parseFloat(costVal) || 0;
    this.newPoItems[index].unit_cost = cost;
    this.newPoItems[index].total = this.newPoItems[index].qty * cost;
  }

  /**
   * Compute total amount across all PO items.
   * @returns {number}
   */
  calculateTotal() {
    return this.newPoItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  }

  /**
   * Validate PO inputs before submission.
   * @param {{supplier: string, supplierId: string|number|null, expDate: string}} params
   * @returns {{isValid: boolean, error?: string}}
   */
  validate({ supplier, supplierId, expDate }) {
    if (!supplier && !supplierId) {
      return {
        isValid: false,
        error: "Please search and select a Supplier for the Purchase Order"
      };
    }

    if (!expDate) {
      return {
        isValid: false,
        error: "Please select the Expected Delivery Date"
      };
    }

    if (this.newPoItems.length === 0) {
      return {
        isValid: false,
        error: "Please add at least 1 material item to the Purchase Order"
      };
    }

    for (const item of this.newPoItems) {
      if (!item.qty || item.qty <= 0) {
        return {
          isValid: false,
          error: `Please enter a valid order quantity for "${item.item_name}"`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Build payload for POST /api/v1/purchase-orders.
   * @param {{supplier: string, supplierId: string|number|null, expDate: string, notes: string}} params
   * @returns {Object}
   */
  buildPayload({ supplier, supplierId, expDate, notes }) {
    const suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    const matchedSupplier = this.selectedSupplier?.id
      ? this.selectedSupplier
      : suppliers.find(
          (s) => (supplierId && String(s.id) === String(supplierId)) || (s.name?.toLowerCase() === supplier.toLowerCase())
        );
    const supplierContact = matchedSupplier?.mobile || matchedSupplier?.phone || "";

    const itemsPayload = this.newPoItems.map((item) => ({
      stock_items_id: parseInt(item.stock_items_id || item.id, 10),
      unit_cost: parseFloat(item.unit_cost) || 0,
      qty_ordered: parseInt(item.qty, 10) || 1,
      qty_received: 0,
    }));

    return {
      suppliers_id: matchedSupplier ? matchedSupplier.id : null,
      supplier_name: supplier,
      supplier_contact: supplierContact,
      expected_date: expDate || null,
      notes: notes || null,
      remarks: notes || null,
      items: itemsPayload,
    };
  }

  /**
   * Submit Purchase Order to backend and sync module state/UI.
   * @param {{supplier: string, supplierId: string|number|null, expDate: string, notes: string}} params
   * @returns {Promise<{createdPo: Object, poCode: string}>}
   */
  async submitPurchaseOrder({ supplier, supplierId, expDate, notes }) {
    const payload = this.buildPayload({ supplier, supplierId, expDate, notes });
    const response = await this.http.post("/api/v1/purchase-orders", payload);
    const createdPo = response?.data?.formatted || response?.data || response;
    const poCode = createdPo?.po_number || (createdPo?.id ? `PO-${String(createdPo.id).padStart(4, "0")}` : "PO-NEW");

    // Re-fetch and sync purchase orders from database
    if (this.ctx.dataLoader?.fetchPurchaseOrders) {
      await this.ctx.dataLoader.fetchPurchaseOrders({}, true);
    } else {
      const purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
      purchaseOrders.unshift(createdPo);
      if (this.ctx.setPurchaseOrders) this.ctx.setPurchaseOrders(purchaseOrders);
    }

    // Refresh suppliers and re-render grid so un-GRNed PO count auto-adjusts
    if (this.ctx.loadAndRenderSuppliers) {
      await this.ctx.loadAndRenderSuppliers(true);
    } else if (this.ctx.dataLoader?.fetchSuppliers) {
      await this.ctx.dataLoader.fetchSuppliers({}, true);
      if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();
    } else if (this.ctx.renderSuppliersGrid) {
      this.ctx.renderSuppliersGrid();
    }

    // Update UI tables and KPIs
    if (this.ctx.renderOpenPoBadge) this.ctx.renderOpenPoBadge();
    if (this.ctx.renderPOTable) this.ctx.renderPOTable();
    if (this.ctx.populatePOSupplierFilter) this.ctx.populatePOSupplierFilter();

    return { createdPo, poCode };
  }
}

export default CreatePoProcess;
