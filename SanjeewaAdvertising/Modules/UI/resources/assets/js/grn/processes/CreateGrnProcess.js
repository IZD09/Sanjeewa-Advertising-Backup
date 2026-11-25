/**
 * SanjeewaAdvertising - Create Goods Received Note (GRN) Process
 *
 * Encapsulates state, backend API data fetching, catalog/brand/batch resolution,
 * Multi-PO linking business logic, financial calculations, validation, and GRN submission.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

export class CreateGrnProcess {
  /**
   * @param {Object} context
   */
  constructor(context = {}) {
    this.ctx = context;
    this.http = new RequestHandler();

    // Multi-PO & GRN State
    this.selectedPurchaseOrders = [];
    this.grnItems = [];
    this.removedGrnItems = [];
    this.allPurchaseOrders = [];
    this.suppliers = [];
    this.brands = [];
    this.stockItemsCatalog = [];
    this.selectedSupplier = null;
    this.poListLoaded = false;
    this.activeSupplierFilter = null;
  }

  /**
   * Reset state before opening the Create GRN modal.
   * @param {string|null} [targetSupplier=null]
   */
  resetState(targetSupplier = null) {
    this.selectedPurchaseOrders = [];
    this.grnItems = [];
    this.removedGrnItems = [];
    this.selectedSupplier = null;
    this.activeSupplierFilter = targetSupplier ? String(targetSupplier).trim() : null;
  }

  /**
   * Clear selected supplier and linked POs/items.
   */
  clearSelectedSupplierState() {
    this.selectedSupplier = null;
    this.selectedPurchaseOrders = [];
    this.grnItems = [];
    this.removedGrnItems = [];
  }

  /**
   * Load suppliers from backend API or fallback to context.
   * @returns {Promise<Array>}
   */
  async loadSuppliers() {
    try {
      const res = await this.http.get("/advertising/suppliers/all");
      const data = res?.data || res;
      this.suppliers = Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.warn("[CreateGrnProcess] Could not fetch suppliers:", err);
      this.suppliers = this.ctx.getSuppliers ? this.ctx.getSuppliers() : [];
    }
    return this.suppliers;
  }

  /**
   * Load inventory catalog (brands, stock items, batches) from backend API.
   * @returns {Promise<{brands: Array, stockItemsCatalog: Array}>}
   */
  async loadInventoryCatalog() {
    try {
      const res = await this.http.get("/advertising/inventory/stocks/form-data");
      const data = res?.data || res;
      this.brands = Array.isArray(data?.brands) ? data.brands : [];
      this.stockItemsCatalog = Array.isArray(data?.stock_items) ? data.stock_items : [];
    } catch (err) {
      console.warn("[CreateGrnProcess] Could not fetch inventory catalog:", err);
      this.brands = this.brands || [];
      this.stockItemsCatalog = this.stockItemsCatalog || [];
    }
    return { brands: this.brands, stockItemsCatalog: this.stockItemsCatalog };
  }

  /**
   * Fetch active purchase orders from backend or cache.
   * @param {boolean} [forceRefresh=false]
   * @param {Object} [callbacks={}]
   * @returns {Promise<Array>}
   */
  async loadActivePurchaseOrders(forceRefresh = false, callbacks = {}) {
    let purchaseOrders = [];

    if (!this.allPurchaseOrders || this.allPurchaseOrders.length === 0 || forceRefresh) {
      if (typeof callbacks.onStart === "function") callbacks.onStart();

      try {
        const response = await this.http.get("/advertising/purchase-orders/data", { per_page: 100 });
        const data = response?.data || response;
        purchaseOrders = data?.purchase_orders ?? data?.orders ?? (Array.isArray(data) ? data : []);
        if (this.ctx.setPurchaseOrders && Array.isArray(purchaseOrders)) {
          this.ctx.setPurchaseOrders(purchaseOrders);
        }
      } catch (err) {
        console.warn("[CreateGrnProcess] Failed to fetch purchase orders:", err);
        purchaseOrders = this.ctx.getPurchaseOrders ? this.ctx.getPurchaseOrders() : [];
      } finally {
        if (typeof callbacks.onEnd === "function") callbacks.onEnd();
      }
    } else {
      purchaseOrders = this.allPurchaseOrders;
    }

    this.allPurchaseOrders = purchaseOrders;
    this.poListLoaded = true;

    const activeCount = this.allPurchaseOrders.filter(
      (p) => String(p.status || "").trim().toLowerCase() === "approved"
    ).length;

    if (typeof callbacks.onLoaded === "function") {
      callbacks.onLoaded(activeCount);
    }

    return this.allPurchaseOrders;
  }

  /**
   * Look up a stock item in the loaded inventory catalog.
   * @param {number|string} stockItemId
   * @param {string|null} [itemCode=null]
   * @returns {Object|null}
   */
  getCatalogItem(stockItemId, itemCode = null) {
    if (!this.stockItemsCatalog || this.stockItemsCatalog.length === 0) return null;
    return (
      this.stockItemsCatalog.find(it => Number(it.id) === Number(stockItemId)) ||
      (itemCode ? this.stockItemsCatalog.find(it => String(it.code) === String(itemCode)) : null) ||
      null
    );
  }

  /**
   * Get ordered list of brands for an item (compatible brands first, then remaining brands).
   * @param {number|string} stockItemId
   * @param {string|null} [itemCode=null]
   * @returns {Array}
   */
  getBrandsForItem(stockItemId, itemCode = null) {
    const catItem = this.getCatalogItem(stockItemId, itemCode);
    const compatible = Array.isArray(catItem?.compatible_brands) ? catItem.compatible_brands : [];
    if (compatible.length > 0 && Array.isArray(this.brands) && this.brands.length > 0) {
      const compatIds = new Set(compatible.map(b => Number(b.id)));
      const others = this.brands.filter(b => !compatIds.has(Number(b.id)));
      return [...compatible, ...others];
    }
    if (compatible.length > 0) return compatible;
    return Array.isArray(this.brands) ? this.brands : [];
  }

  /**
   * Get existing batches for a stock item from the catalog.
   * @param {number|string} stockItemId
   * @param {string|null} [itemCode=null]
   * @returns {Array}
   */
  getExistingBatchesForItem(stockItemId, itemCode = null) {
    const catItem = this.getCatalogItem(stockItemId, itemCode);
    return Array.isArray(catItem?.existing_batches) ? catItem.existing_batches : [];
  }

  /**
   * Ensure suppliers referenced by Approved POs are present in the suppliers list.
   */
  syncSuppliersWithApprovedPOs() {
    const list = Array.isArray(this.suppliers) ? [...this.suppliers] : [];
    (this.allPurchaseOrders || []).forEach(po => {
      if (String(po.status || "").trim().toLowerCase() !== "approved") return;
      const exists = list.some(s => {
        const matchId = s.id && po.suppliers_id && Number(s.id) === Number(po.suppliers_id);
        const matchName = s.name && po.supplier_name &&
          String(s.name).trim().toLowerCase() === String(po.supplier_name).trim().toLowerCase();
        return matchId || matchName;
      });
      if (!exists && (po.suppliers_id || po.supplier_name)) {
        list.push({
          id: po.suppliers_id || null,
          code: po.suppliers_id ? `SUP-${String(po.suppliers_id).padStart(3, "0")}` : "SUP",
          name: po.supplier_name || "Supplier",
          mobile: po.supplier_contact || ""
        });
      }
    });
    this.suppliers = list;
  }

  /**
   * Resolve supplier object for a given Purchase Order.
   * @param {Object} po
   * @returns {Object|null}
   */
  findSupplierForPo(po) {
    if (!po) return null;
    let supp = null;
    if (po.suppliers_id) {
      supp = this.suppliers.find(s => Number(s.id) === Number(po.suppliers_id));
    }
    if (!supp && po.supplier_name) {
      const cleanName = String(po.supplier_name).trim().toLowerCase();
      supp = this.suppliers.find(s => String(s.name || "").trim().toLowerCase() === cleanName);
    }
    if (!supp) {
      supp = {
        id: po.suppliers_id || null,
        code: po.suppliers_id ? `SUP-${String(po.suppliers_id).padStart(3, "0")}` : "SUP",
        name: po.supplier_name || "Supplier",
        mobile: po.supplier_contact || ""
      };
    }
    return supp;
  }

  /**
   * Filter Approved POs belonging to a supplier.
   * @param {Object} supplier
   * @returns {Array}
   */
  getApprovedPOsForSupplier(supplier) {
    if (!supplier) return [];
    return (this.allPurchaseOrders || []).filter(po => {
      const isApproved = String(po.status || "").trim().toLowerCase() === "approved" ||
        Number(po.purchase_orders_status_id) === 5;
      if (!isApproved) return false;

      const matchId = supplier.id && po.suppliers_id && Number(po.suppliers_id) === Number(supplier.id);
      const matchName = supplier.name && po.supplier_name &&
        String(po.supplier_name).trim().toLowerCase() === String(supplier.name).trim().toLowerCase();
      return matchId || matchName;
    });
  }

  /**
   * Link an Approved Purchase Order and populate its items into grnItems.
   * @param {Object} po
   * @returns {{added: boolean, reason?: string, itemsCount?: number}}
   */
  linkPurchaseOrder(po) {
    if (!po) return { added: false };

    if (String(po.status || "").trim().toLowerCase() !== "approved") {
      return {
        added: false,
        reason: `Please approve Purchase Order ${po.po_number} before receiving a GRN.`
      };
    }

    if (this.selectedPurchaseOrders.some((p) => p.po_number === po.po_number)) {
      return {
        added: false,
        reason: `Purchase Order ${po.po_number} is already linked.`
      };
    }

    const defaultInvoice = `INV-${po.po_number.replace(/\D+/g, "") || Date.now().toString().slice(-4)}`;

    const poEntry = {
      id: po.id,
      po_number: po.po_number,
      supplier_name: po.supplier_name || "Supplier",
      supplier_contact: po.supplier_contact || "",
      order_date: po.order_date || "",
      total_amount: po.total_amount || 0,
      status: po.status || "Pending",
      supplier_invoice: defaultInvoice,
      items: po.items || []
    };

    this.selectedPurchaseOrders.push(poEntry);

    if (Array.isArray(po.items) && po.items.length > 0) {
      po.items.forEach((item) => {
        const qtyOrdered = parseInt(item.qty_ordered, 10) || 0;
        const qtyReceived = parseInt(item.qty_received, 10) || 0;
        const remainingQty = Math.max(1, qtyOrdered - qtyReceived);
        const unitCost = parseFloat(item.unit_cost) || 0;

        const stockItemId = item.stock_items_id || item.item_id;
        const itemCode = item.item_id || item.code || `ITM-${item.stock_items_id}`;
        const itemBrands = this.getBrandsForItem(stockItemId, itemCode);
        const defaultBrandId = item.brands_id || itemBrands[0]?.id || this.brands[0]?.id || 1;
        const catItem = this.getCatalogItem(stockItemId, itemCode);
        const resolvedUnit = (item.unit && item.unit !== "Units")
          ? item.unit
          : (catItem?.unit || catItem?.stock_unit?.unit || catItem?.stock_unit?.symble || item.unit || "Units");

        this.grnItems.push({
          po_id: po.id,
          po_number: po.po_number,
          stock_items_id: stockItemId,
          item_id: stockItemId,
          item_code: itemCode,
          item_name: item.item_name || item.name || `Material #${item.stock_items_id}`,
          unit: resolvedUnit,
          qty_ordered: qtyOrdered,
          qty_received_prev: qtyReceived,
          receiving_qty: remainingQty,
          unit_cost: unitCost,
          total: remainingQty * unitCost,
          brands_id: defaultBrandId,
          batch_mode: "NEW",
          batch_id: null
        });
      });
    }

    // Clean up any old removed items of this PO if it was re-linked
    this.removedGrnItems = this.removedGrnItems.filter((itm) => itm.po_number !== po.po_number);

    return {
      added: true,
      itemsCount: po.items ? po.items.length : 0
    };
  }

  /**
   * Unlink a Purchase Order and remove its items.
   * @param {string} poNumber
   * @returns {boolean}
   */
  unlinkPurchaseOrder(poNumber) {
    const initialPoCount = this.selectedPurchaseOrders.length;
    this.selectedPurchaseOrders = this.selectedPurchaseOrders.filter((p) => p.po_number !== poNumber);

    if (this.selectedPurchaseOrders.length < initialPoCount) {
      this.grnItems = this.grnItems.filter((itm) => itm.po_number !== poNumber);
      this.removedGrnItems = this.removedGrnItems.filter((itm) => itm.po_number !== poNumber);
      return true;
    }
    return false;
  }

  /**
   * Update supplier invoice reference for a linked PO.
   * @param {number} index
   * @param {string} value
   */
  updatePoInvoice(index, value) {
    if (this.selectedPurchaseOrders[index]) {
      this.selectedPurchaseOrders[index].supplier_invoice = String(value || "").trim();
    }
  }

  /**
   * Update receiving quantity on a line item.
   * @param {number} index
   * @param {number|string} value
   */
  updateItemQty(index, value) {
    if (!this.grnItems[index]) return;
    const qty = parseFloat(value) || 0;
    this.grnItems[index].receiving_qty = qty;
    this.grnItems[index].total = qty * this.grnItems[index].unit_cost;
  }

  /**
   * Update unit purchase cost on a line item.
   * @param {number} index
   * @param {number|string} value
   */
  updateItemCost(index, value) {
    if (!this.grnItems[index]) return;
    const cost = parseFloat(value) || 0;
    this.grnItems[index].unit_cost = cost;
    this.grnItems[index].total = this.grnItems[index].receiving_qty * cost;
  }

  /**
   * Update brand selection on a line item.
   * @param {number} index
   * @param {number|string} brandId
   */
  updateItemBrand(index, brandId) {
    if (this.grnItems[index]) {
      this.grnItems[index].brands_id = parseInt(brandId, 10) || null;
    }
  }

  /**
   * Update batch mode (NEW vs EXISTING) on a line item.
   * @param {number} index
   * @param {string} modeValue
   */
  updateItemBatchMode(index, modeValue) {
    if (!this.grnItems[index]) return;
    const mode = modeValue === "EXISTING" ? "EXISTING" : "NEW";
    this.grnItems[index].batch_mode = mode;
    if (mode === "EXISTING") {
      const batches = this.getExistingBatchesForItem(
        this.grnItems[index].stock_items_id,
        this.grnItems[index].item_code
      );
      this.grnItems[index].batch_id = batches[0]?.id || null;
    } else {
      this.grnItems[index].batch_id = null;
    }
  }

  /**
   * Update selected existing batch ID on a line item.
   * @param {number} index
   * @param {number|string} batchId
   */
  updateItemBatchId(index, batchId) {
    if (this.grnItems[index]) {
      this.grnItems[index].batch_id = parseInt(batchId, 10) || null;
    }
  }

  /**
   * Remove an item from receiving list and store in removedGrnItems.
   * @param {number} index
   * @returns {Object|null}
   */
  removeItem(index) {
    if (!this.grnItems[index]) return null;
    const removed = this.grnItems.splice(index, 1)[0];
    this.removedGrnItems.push(removed);
    return removed;
  }

  /**
   * Restore a removed item back to receiving list.
   * @param {number} removedIndex
   * @returns {Object|null}
   */
  readdItem(removedIndex) {
    if (!this.removedGrnItems[removedIndex]) return null;
    const restored = this.removedGrnItems.splice(removedIndex, 1)[0];
    this.grnItems.push(restored);
    return restored;
  }

  /**
   * Restore all removed items back to receiving list.
   * @returns {number}
   */
  readdAllItems() {
    if (!this.removedGrnItems || this.removedGrnItems.length === 0) return 0;
    const count = this.removedGrnItems.length;
    this.grnItems.push(...this.removedGrnItems);
    this.removedGrnItems = [];
    return count;
  }

  /**
   * Calculate Sub Total, Discount, and Net Total.
   * @param {number|string} [discountVal=0]
   * @returns {{subTotal: number, discount: number, netTotal: number}}
   */
  calculateTotals(discountVal = 0) {
    const subTotal = this.grnItems.reduce((acc, itm) => acc + (parseFloat(itm.total) || 0), 0);
    const discount = parseFloat(discountVal) || 0;
    const netTotal = Math.max(0, subTotal - discount);
    return { subTotal, discount, netTotal };
  }

  /**
   * Validate GRN state before submitting.
   * @returns {{isValid: boolean, error?: string}}
   */
  validate() {
    if (!this.selectedPurchaseOrders || this.selectedPurchaseOrders.length === 0) {
      return {
        isValid: false,
        error: "Please select a supplier and link at least one Approved Purchase Order to this GRN"
      };
    }

    if (!this.grnItems || this.grnItems.length === 0) {
      return {
        isValid: false,
        error: "Please link Purchase Orders that contain material items to receive"
      };
    }

    for (const item of this.grnItems) {
      if (!item.receiving_qty || item.receiving_qty <= 0) {
        return {
          isValid: false,
          error: `Please enter a valid receiving quantity for "${item.item_name}"`
        };
      }
      if (!item.brands_id) {
        return {
          isValid: false,
          error: `Please select a brand for "${item.item_name}"`
        };
      }
      if (item.batch_mode === "EXISTING" && !item.batch_id) {
        return {
          isValid: false,
          error: `Please select an existing batch for "${item.item_name}"`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Build API payload for POST /advertising/grns.
   * @param {string} remarks
   * @param {{subTotal: number, discount: number, netTotal: number}} financials
   * @returns {Object}
   */
  buildPayload(remarks = "", financials = { subTotal: 0, discount: 0, netTotal: 0 }) {
    const purchaseOrdersPayload = this.selectedPurchaseOrders.map((po) => ({
      id: po.id,
      supplyer_invoice: po.supplier_invoice && po.supplier_invoice.trim() !== ""
        ? po.supplier_invoice.trim()
        : `INV-${po.po_number.replace(/\D+/g, "") || Date.now().toString().slice(-4)}`
    }));

    const primaryPo = this.selectedPurchaseOrders[0];

    return {
      status: "Pending",
      purchase_orders: purchaseOrdersPayload,
      purchase_orders_id: primaryPo.id,
      supplyer_invoice: primaryPo.supplier_invoice && primaryPo.supplier_invoice.trim() !== ""
        ? primaryPo.supplier_invoice.trim()
        : null,
      remarks: remarks,
      discount: financials.discount,
      sub_total: financials.subTotal,
      net_total: financials.netTotal,
      stocks: this.grnItems.map((item) => {
        const catItem = this.getCatalogItem(item.stock_items_id, item.item_code);
        const existingStocks = Array.isArray(catItem?.existing_stocks) ? catItem.existing_stocks : [];
        const latestPrice = existingStocks.length > 0 ? parseFloat(existingStocks[0].price) || 0 : 0;
        const unitCost = parseFloat(item.unit_cost) || 0;
        const sellPrice = latestPrice > unitCost ? latestPrice : parseFloat((unitCost * 1.25).toFixed(2));
        const isExistingBatch = item.batch_mode === "EXISTING" && Boolean(item.batch_id);

        return {
          stock_items_id: parseInt(item.stock_items_id, 10),
          purchase_orders_id: item.po_id,
          brands_id: parseInt(item.brands_id, 10) || 1,
          batch_mode: isExistingBatch ? "EXISTING" : "NEW",
          create_new_batch: !isExistingBatch,
          batch_id: isExistingBatch ? parseInt(item.batch_id, 10) : null,
          qty: Math.round(item.receiving_qty),
          buy: unitCost,
          price: sellPrice
        };
      })
    };
  }

  /**
   * Submit GRN payload to backend and refresh module views.
   * @param {string} remarks
   * @param {{subTotal: number, discount: number, netTotal: number}} financials
   * @returns {Promise<{createdGrn: Object, grnCode: string}>}
   */
  async submitGrn(remarks = "", financials = { subTotal: 0, discount: 0, netTotal: 0 }) {
    const payload = this.buildPayload(remarks, financials);
    const response = await this.http.post("/advertising/grns", payload);
    const createdGrn = response?.data || response;
    const grnCode = createdGrn?.grn_number || createdGrn?.grn_id || `GRN-${Date.now().toString().slice(-4)}`;

    // Refresh GRN records, Purchase Orders, and Suppliers
    if (this.ctx.loadAndRenderGRN) {
      await this.ctx.loadAndRenderGRN(true);
    }
    if (this.ctx.loadAndRenderPO) {
      await this.ctx.loadAndRenderPO(true);
    }
    if (this.ctx.loadAndRenderSuppliers) {
      await this.ctx.loadAndRenderSuppliers(true);
    } else if (this.ctx.dataLoader?.fetchSuppliers) {
      await this.ctx.dataLoader.fetchSuppliers({}, true);
      if (this.ctx.renderSuppliersGrid) this.ctx.renderSuppliersGrid();
    } else if (this.ctx.renderSuppliersGrid) {
      this.ctx.renderSuppliersGrid();
    }

    return { createdGrn, grnCode };
  }
}

export default CreateGrnProcess;
