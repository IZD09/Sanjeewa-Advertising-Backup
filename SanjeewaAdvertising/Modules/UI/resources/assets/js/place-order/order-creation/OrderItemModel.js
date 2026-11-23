/**
 * SanjeewaAdvertising - Order Item Model
 * Represents a single staged order item in the Order Creation Form queue.
 */

export class OrderItemModel {
  /**
   * @param {Object} data
   */
  constructor(data = {}) {
    this.uid = data.uid || OrderItemModel.generateUid();
    this.printingTypeId = String(data.printingTypeId ?? "");
    this.printingTypeName = String(data.printingTypeName ?? "").trim();
    this.userId = String(data.userId ?? "");
    this.userName = String(data.userName ?? "").trim();
    this.designStatus = String(data.designStatus ?? "Customer Provides Design");
    this.notes = String(data.notes ?? "").trim();

    this.width = Number(data.width) || 0;
    this.height = Number(data.height) || 0;
    this.unitId = String(data.unitId ?? "");
    this.unitSymbol = String(data.unitSymbol ?? "ft").trim();
    this.unitName = String(data.unitName ?? "Feet").trim();
    this.qty = parseInt(data.qty, 10) || 1;
    this.unitPrice = Number(data.unitPrice) || 0;
    this.discount = Number(data.discount) || 0;

    this.deliveryMethodId = String(data.deliveryMethodId ?? "");
    this.deliveryMethodName = String(data.deliveryMethodName ?? "").trim();
    this.requiredDate = String(data.requiredDate ?? "");

    this.areaSqFt = Number(data.areaSqFt) || 0;
    this.designFee = Number(data.designFee) || 0;
    this.subtotal = Number(data.subtotal) || 0;
    this.totalAmount = Number(data.totalAmount) || 0;
  }

  /**
   * Generate a client-side unique identifier for a queued order item.
   *
   * @returns {string}
   */
  static generateUid() {
    return `order-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Human-readable dimensions string.
   *
   * @returns {string}
   */
  getDimensionsLabel() {
    return `${this.width} × ${this.height} ${this.unitSymbol}`;
  }

  /**
   * Human-readable computed area or piece count string.
   *
   * @returns {string}
   */
  getAreaLabel() {
    if (this.unitSymbol.toLowerCase() === "pcs" || this.unitId === "6") {
      return `${this.qty} pcs`;
    }
    return `${this.areaSqFt.toFixed(2)} sq.ft`;
  }

  /**
   * Create a shallow clone of this model.
   *
   * @returns {OrderItemModel}
   */
  clone() {
    return new OrderItemModel(this.toJSON());
  }

  /**
   * Serialize to plain object.
   *
   * @returns {Object}
   */
  toJSON() {
    return {
      uid: this.uid,
      printingTypeId: this.printingTypeId,
      printingTypeName: this.printingTypeName,
      userId: this.userId,
      userName: this.userName,
      designStatus: this.designStatus,
      notes: this.notes,
      width: this.width,
      height: this.height,
      unitId: this.unitId,
      unitSymbol: this.unitSymbol,
      unitName: this.unitName,
      qty: this.qty,
      unitPrice: this.unitPrice,
      discount: this.discount,
      deliveryMethodId: this.deliveryMethodId,
      deliveryMethodName: this.deliveryMethodName,
      requiredDate: this.requiredDate,
      areaSqFt: this.areaSqFt,
      designFee: this.designFee,
      subtotal: this.subtotal,
      totalAmount: this.totalAmount,
    };
  }
}

export default OrderItemModel;
