/**
 * SanjeewaAdvertising - GRN Payment Builder
 *
 * Constructs and normalizes payload models for Stock Material & Multi-Purchase Order Disbursements.
 */
export class GrnPaymentBuilder {
  constructor() {
    this.purchaseOrders = [];
    this.amount = 0;
    this.stage = "Advance Payment";
    this.method = "Cash";
    this.methodDetails = {};
    this.date = new Date().toISOString().split("T")[0];
    this.notes = "";
    this.disbursedBy = "Accounts Officer";
  }

  setPurchaseOrders(pos = []) {
    this.purchaseOrders = Array.isArray(pos) ? [...pos] : [];
    return this;
  }

  addPurchaseOrder(po) {
    if (po && !this.purchaseOrders.some(p => String(p.id).toLowerCase() === String(po.id).toLowerCase())) {
      this.purchaseOrders.push(po);
    }
    return this;
  }

  setAmount(amount) {
    this.amount = parseFloat(amount) || 0;
    return this;
  }

  setStage(stage) {
    this.stage = stage || "Advance Payment";
    return this;
  }

  setMethod(method, details = {}, typeId = null) {
    this.method = method || "Cash";
    this.methodDetails = details || {};
    this.paymentTypeId = typeId ? parseInt(typeId, 10) : null;
    return this;
  }

  setDate(date) {
    this.date = date || new Date().toISOString().split("T")[0];
    return this;
  }

  setNotes(notes) {
    this.notes = (notes || "").trim();
    return this;
  }

  setDisbursedBy(officer) {
    this.disbursedBy = officer || "Accounts Officer";
    return this;
  }

  build() {
    const primaryPo = this.purchaseOrders[0] || {};
    const primaryGrnId = primaryPo.grn_id || null;
    const primaryGrnNumber = primaryPo.grnNumber && primaryPo.grnNumber !== "GRN-Pending"
      ? primaryPo.grnNumber
      : (primaryGrnId ? `GRN-0${primaryGrnId}` : "GRN-New");

    const combinedTotal = this.purchaseOrders.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
    const combinedDue = this.purchaseOrders.reduce((sum, p) => sum + (Number(p.balanceAmount !== undefined ? p.balanceAmount : p.balance) || 0), 0);
    const remainingBalance = Math.max(0, combinedDue - this.amount);

    let paymentTypeId = this.paymentTypeId || 1; // Cash
    let methodRef = "Petty Cash Voucher";

    if (this.method === "Credit Card" || this.method === "Card") {
      paymentTypeId = this.paymentTypeId || 3;
      const last4 = this.methodDetails.last4 || "";
      const auth = this.methodDetails.auth || "";
      methodRef = `Credit Card ****${last4}${auth ? ` (${auth})` : ""}`;
    } else if (this.method === "Debit Card") {
      paymentTypeId = this.paymentTypeId || 4;
      const last4 = this.methodDetails.last4 || "";
      const auth = this.methodDetails.auth || "";
      methodRef = `Debit Card ****${last4}${auth ? ` (${auth})` : ""}`;
    } else if (this.method === "Check" || this.method === "Cheque") {
      paymentTypeId = this.paymentTypeId || 5;
      const chq = this.methodDetails.chequeNo || "";
      const bank = this.methodDetails.bank || "";
      methodRef = `Cheque #${chq} - ${bank}`;
    } else if (this.method === "Bank Transfer") {
      paymentTypeId = this.paymentTypeId || 2;
      const ref = this.methodDetails.ref || "";
      const bank = this.methodDetails.bank || "";
      methodRef = `FT: ${bank} ${ref}`;
    } else if (this.method === "Online / QR" || this.method === "Online / QR Payment") {
      paymentTypeId = this.paymentTypeId || 6;
      const app = this.methodDetails.app || "LankaQR";
      const ref = this.methodDetails.ref || "";
      methodRef = `${app} Ref: ${ref}`;
    } else {
      paymentTypeId = this.paymentTypeId || 1;
      const receipt = this.methodDetails.receipt;
      methodRef = receipt ? `Petty Cash Voucher #${receipt}` : "Main Shop Petty Cash";
    }

    const paymentStatusId = remainingBalance <= 0 ? 2 : (this.amount > 0 ? 3 : 1);
    const paymentId = `PAY-GRN-${Date.now().toString().slice(-6)}`;
    const poNumbers = this.purchaseOrders.map(p => p.poNumber || p.id);
    const purchaseOrderIds = this.purchaseOrders
      .map(p => p.raw_id || parseInt(String(p.poNumber || p.id).replace(/\D/g, ""), 10))
      .filter(id => Number.isInteger(id) && id > 0);
    const supplierInvoices = this.purchaseOrders.map(p => p.supplierInvoice).filter(Boolean);

    const allocations = this.purchaseOrders.map(po => {
      const prevBal = Number(po.balanceAmount !== undefined ? po.balanceAmount : po.balance) || 0;
      const alloc = Number(po.allocatedAmount !== undefined ? po.allocatedAmount : this.amount) || 0;
      const balRem = Math.max(0, prevBal - alloc);
      return {
        id: po.id,
        poNumber: po.poNumber || po.id,
        orderDate: po.orderDate || null,
        status: po.status || "Pending",
        notes: po.notes || "",
        grnNumber: po.grnNumber || primaryGrnNumber,
        supplierName: po.supplierName || "Supplier",
        supplierBankAccount: po.supplierBankAccount || "",
        stockCategory: po.stockCategory || "Stock Delivery",
        supplierInvoice: po.supplierInvoice || "",
        items: Array.isArray(po.items) ? po.items : [],
        total: Number(po.totalAmount) || 0,
        allocated_amount: alloc,
        allocatedNow: alloc,
        balanceRemaining: balRem
      };
    });

    return {
      paymentId,
      grn_id: primaryGrnId,
      grnId: primaryGrnNumber,
      grnNumber: primaryGrnNumber,
      purchaseOrders: allocations,
      purchase_order_ids: purchaseOrderIds,
      supplier_id: primaryPo.supplier_id || null,
      pos: allocations,
      allocations,
      poNumbers,
      poNumber: poNumbers.join(", "),
      poCount: this.purchaseOrders.length,
      supplierName: primaryPo.supplierName || "Supplier",
      supplierBankAccount: primaryPo.supplierBankAccount || "",
      supplierInvoice: supplierInvoices.join(", "),
      stockCategory: primaryPo.stockCategory || "Stock Delivery",
      totalBill: combinedTotal,
      totalAmount: combinedTotal,
      amount: this.amount,
      payment: this.amount,
      balance: remainingBalance,
      stage: this.stage,
      method: this.method,
      methodRef,
      ref: methodRef,
      paymentTypeId,
      payment_types_id: paymentTypeId,
      paymentStatusId,
      payment_statuses_id: paymentStatusId,
      date: this.date,
      pay_date: this.date ? `${this.date} 12:00:00` : new Date().toISOString().slice(0, 19).replace("T", " "),
      notes: this.notes,
      disbursedBy: this.disbursedBy
    };
  }
}
