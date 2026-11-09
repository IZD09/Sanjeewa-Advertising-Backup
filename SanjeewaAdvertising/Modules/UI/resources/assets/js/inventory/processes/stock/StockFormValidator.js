/**
 * SanjeewaAdvertising - Stock Form Validator
 *
 * Encapsulates input validation rules for Add/Receive Stock Shipment:
 * - Differentiates validation rules between New Stock creation and Existing Stock updates
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
