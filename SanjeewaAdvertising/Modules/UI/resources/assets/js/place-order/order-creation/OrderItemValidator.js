/**
 * SanjeewaAdvertising - Order Item Validator
 * Handles frontend validation for adding/updating individual order items
 * and validating the overall queued orders before review/submission.
 */

export class OrderItemValidator {
  /**
   * Validate individual order item inputs before adding/updating in the table.
   *
   * @param {Object} fields
   * @returns {{ isValid: boolean, error?: string, targetId?: string }}
   */
  validateItem(fields = {}) {
    if (!fields.printingTypeId) {
      return {
        isValid: false,
        error: "Please select a Printing Type.",
        targetId: "poPrintingType",
      };
    }

    if (!fields.userId) {
      return {
        isValid: false,
        error: "Please select an Assigned Staff member.",
        targetId: "poUser",
      };
    }

    if (!fields.designStatus) {
      return {
        isValid: false,
        error: "Please select an Artwork / Design Status.",
        targetId: "poDesignStatus",
      };
    }

    const width = Number(fields.width);
    const height = Number(fields.height);
    if (isNaN(width) || width <= 0) {
      return {
        isValid: false,
        error: "Width must be greater than zero.",
        targetId: "poWidth",
      };
    }

    if (isNaN(height) || height <= 0) {
      return {
        isValid: false,
        error: "Height must be greater than zero.",
        targetId: "poHeight",
      };
    }

    if (!fields.unitId) {
      return {
        isValid: false,
        error: "Please select a measurement Unit.",
        targetId: "poUnit",
      };
    }

    const qty = parseInt(fields.qty, 10);
    if (isNaN(qty) || qty < 1) {
      return {
        isValid: false,
        error: "Quantity must be at least 1.",
        targetId: "poQty",
      };
    }

    const unitPriceRaw = fields.unitPriceRaw;
    const unitPrice = Number(fields.unitPrice);
    if (unitPriceRaw === "" || unitPriceRaw === null || unitPriceRaw === undefined || isNaN(unitPrice) || unitPrice < 0) {
      return {
        isValid: false,
        error: "Unit Price must be 0 or a valid positive amount.",
        targetId: "poUnitPrice",
      };
    }

    const discount = Number(fields.discount);
    if (isNaN(discount) || discount < 0) {
      return {
        isValid: false,
        error: "Discount cannot be negative.",
        targetId: "poDiscount",
      };
    }

    if (!fields.deliveryMethodId) {
      return {
        isValid: false,
        error: "Please select a Delivery Method.",
        targetId: "poDeliveryMethod",
      };
    }

    if (!fields.requiredDate) {
      return {
        isValid: false,
        error: "Please select a Required Deadline date.",
        targetId: "poRequiredDate",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate overall form readiness (customer, queued orders, and payment).
   *
   * @param {Object} params
   * @param {Object|null} params.customer
   * @param {Array} params.items
   * @param {number} params.paidAmount
   * @param {string} params.paymentMethodId
   * @returns {{ isValid: boolean, error?: string, targetId?: string }}
   */
  validateSubmission({ customer, items, paidAmount, paymentMethodId }) {
    if (!customer || !customer.id) {
      return {
        isValid: false,
        error: "Please search and select a customer first.",
        targetId: "customerSearchInput",
      };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return {
        isValid: false,
        error: "Please add at least one order to the table before placing the order.",
        targetId: "poPrintingType",
      };
    }

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const itemValidation = this.validateItem({
        ...item,
        unitPriceRaw: item.unitPrice,
      });
      if (!itemValidation.isValid) {
        return {
          isValid: false,
          error: `Order #${i + 1}: ${itemValidation.error}`,
          targetId: itemValidation.targetId,
        };
      }
    }

    const paid = Number(paidAmount) || 0;
    if (paid < 0) {
      return {
        isValid: false,
        error: "Initial Advance Paid cannot be negative.",
        targetId: "poPaidAmount",
      };
    }

    if (paid > 0 && !paymentMethodId) {
      return {
        isValid: false,
        error: "Please select a Payment Method for the advance deposit.",
        targetId: "poPaymentMethod",
      };
    }

    return { isValid: true };
  }
}

export default OrderItemValidator;
