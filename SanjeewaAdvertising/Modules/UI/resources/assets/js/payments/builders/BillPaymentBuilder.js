/**
 * SanjeewaAdvertising - Bill Payment Builder
 *
 * Constructs and normalizes payload models for Operating Expense & Monthly Utility Bill Payments.
 */
export class BillPaymentBuilder {
  constructor() {
    this.billId = null;
    this.isDirect = false;
    this.directData = {
      typeId: 1,
      category: "Electricity Utility",
      month: new Date().toISOString().slice(0, 7),
      title: "Electricity Utility",
      accountNo: ""
    };
    this.amount = 0;
    this.method = "Bank Transfer";
    this.reference = "";
    this.date = new Date().toISOString().split("T")[0];
    this.notes = "";
  }

  setBill(bill) {
    if (bill) {
      this.billId = bill.id;
      this.isDirect = false;
      this.amount = Number(bill.amount) || this.amount;
      this.directData.typeId = bill.typeId || 1;
      this.directData.category = bill.category || "General Expense";
      this.directData.title = bill.title || "Operating Bill";
      this.directData.accountNo = bill.accountNo || "";
      this.directData.month = bill.month || new Date().toISOString().slice(0, 7);
    }
    return this;
  }

  setBillId(id) {
    this.billId = id;
    if (id === "DIRECT_NEW") {
      this.isDirect = true;
    }
    return this;
  }

  setDirectExpense({ typeId = 1, category = "", month = "", title = "", accountNo = "" } = {}) {
    this.isDirect = true;
    this.directData = {
      typeId: parseInt(typeId, 10) || 1,
      category: category || "Electricity Utility",
      month: month || new Date().toISOString().slice(0, 7),
      title: title || category || "Operating Bill",
      accountNo: accountNo || ""
    };
    return this;
  }

  setAmount(amount) {
    this.amount = parseFloat(amount) || 0;
    return this;
  }

  setMethod(method) {
    this.method = method || "Bank Transfer";
    return this;
  }

  setReference(ref) {
    this.reference = (ref || "").trim();
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

  build() {
    const id = this.isDirect
      ? `EXP-${this.directData.month || "DIRECT"}-${Date.now().toString().slice(-4)}`
      : (this.billId || `EXP-${Date.now().toString().slice(-4)}`);

    const title = this.directData.title || this.directData.category || "Operating Bill";
    const typeId = parseInt(this.directData.typeId, 10) || 1;

    return {
      id,
      billId: this.billId,
      isDirect: this.isDirect,
      typeId,
      expencesess_types_id: typeId,
      title,
      category: this.directData.category,
      accountNo: this.directData.accountNo || "DIRECT-SETTLED",
      month: this.directData.month,
      dueDate: this.date,
      amount: this.amount,
      price: this.amount,
      status: "Paid",
      expencesess_statuses_id: 3, // Paid
      paidDate: this.date,
      date: this.date,
      pay_at: this.date ? `${this.date} 12:00:00` : new Date().toISOString().slice(0, 19).replace("T", " "),
      add_date: this.date ? `${this.date} 00:00:00` : new Date().toISOString().slice(0, 19).replace("T", " "),
      paidAmount: this.amount,
      paidMethod: this.method,
      method: this.method,
      paidRef: this.reference || "DIRECT-PAY",
      ref: this.reference || "DIRECT-PAY",
      paidNote: this.notes || "Operating expense settlement",
      notes: this.notes
    };
  }
}
