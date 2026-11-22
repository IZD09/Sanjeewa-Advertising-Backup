/**
 * SanjeewaAdvertising - Stock Form Validator
 *
 * Encapsulates input validation rules for Add/Receive Stock Shipment:
 * - Differentiates validation rules between New Stock creation, Existing Stock updates, and Bulk Staged shipments
 * - Validates positive quantities, non-negative pricing, and mandatory references
 */

export class StockFormValidator {
  /**
   * Validate stock submission payload.
   * @param {Object} data
   * @param {boolean} isUpdate
   * @returns {{ isValid: boolean, error: string|null }}
   */
  validate(data = {}, isUpdate = false) {
    // Bulk queue validation
    if (data.items && Array.isArray(data.items)) {
      if (!data.grn_id) {
        return { isValid: false, error: "Please select a valid GRN reference." };
      }

      if (data.grn) {
        const isPendingStock =
          Number(data.grn.grn_statuses_id) === 6 ||
          String(data.grn.status || "").trim().toLowerCase() === "pending stock";
        if (!isPendingStock) {
          return {
            isValid: false,
            error: `Selected GRN is in '${data.grn.status || "Unknown"}' status. Only GRNs in 'Pending Stock' status can be added to stock.`,
          };
        }
      }

      if (!data.add_date) {
        return { isValid: false, error: "Please select a Received Date." };
      }

      if (data.items.length === 0) {
        return { isValid: false, error: "Please add at least one material item to the Queued Stock Items to Receive table." };
      }

      for (let i = 0; i < data.items.length; i++) {
        const it = data.items[i];
        const label = it.item_code ? `${it.item_code} (${it.item_name || ""})` : `Item #${i + 1}`;

        if (!it.stock_items_id) {
          return { isValid: false, error: `${label} has an invalid material item ID.` };
        }
        if (!it.brands_id) {
          return { isValid: false, error: `Brand is missing for ${label}.` };
        }
        const q = Number(it.qty);
        if (!it.qty || isNaN(q) || q <= 0) {
          return { isValid: false, error: `Please enter a valid Received quantity (min 1) for ${label}.` };
        }
        const maxQty = Number(it.grn_qty);
        if (it.grn_qty !== undefined && it.grn_qty !== null && !isNaN(maxQty) && maxQty > 0 && q > maxQty) {
          return { isValid: false, error: `Received quantity (${q}) for ${label} cannot exceed GRN Qty (${maxQty}).` };
        }
        const buy = Number(it.buy);
        if (it.buy === undefined || isNaN(buy) || buy < 0) {
          return { isValid: false, error: `Unit purchase cost for ${label} cannot be negative.` };
        }
        const price = Number(it.price);
        if (it.price === undefined || isNaN(price) || price < 0) {
          return { isValid: false, error: `Selling price for ${label} cannot be negative.` };
        }
      }
      return { isValid: true, error: null };
    }

    // Single item validation
    if (isUpdate && !data.stock_id) {
      return { isValid: false, error: "Please select an existing stock record to update." };
    }

    if (!isUpdate && !data.stock_items_id) {
      return { isValid: false, error: "Please select a material item SKU." };
    }

    if (!isUpdate && !data.brands_id) {
      return { isValid: false, error: "Please select a brand." };
    }

    if (!data.grn_id) {
      return { isValid: false, error: "Please select a valid GRN reference." };
    }

    const qty = Number(data.qty);
    if (!data.qty || isNaN(qty) || qty <= 0) {
      return { isValid: false, error: "Quantity received must be a positive number (min 1)." };
    }

    const buy = Number(data.buy);
    if (data.buy === undefined || isNaN(buy) || buy < 0) {
      return { isValid: false, error: "Unit purchase cost cannot be negative." };
    }

    const price = Number(data.price);
    if (data.price === undefined || isNaN(price) || price < 0) {
      return { isValid: false, error: "Selling price cannot be negative." };
    }

    if (data.use_existing_batch && !data.batch_id) {
      return { isValid: false, error: "Please select an existing batch number or generate a new batch." };
    }

    return { isValid: true, error: null };
  }
}

export default StockFormValidator;
