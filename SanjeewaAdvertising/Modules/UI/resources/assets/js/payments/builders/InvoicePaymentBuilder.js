/**
 * SanjeewaAdvertising - Invoice Payment Builder
 *
 * Constructs and normalizes payload models for Customer & Multi-Job Invoice Payments.
 */
export class InvoicePaymentBuilder {
  constructor() {
    this.customer = null;
    this.jobs = [];
    this.amount = 0;
    this.stage = "Advance Payment";
    this.method = "Cash";
    this.methodDetails = {};
    this.date = new Date().toISOString().split("T")[0];
    this.notes = "";
    this.receivedBy = "Cashier";
  }

  setCustomer(customer) {
    this.customer = customer;
    return this;
  }

  setJobs(jobs = []) {
    this.jobs = Array.isArray(jobs) ? [...jobs] : [];
    return this;
  }

  addJob(job) {
    if (job && !this.jobs.some(j => String(j.id).toLowerCase() === String(job.id).toLowerCase())) {
      this.jobs.push(job);
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

  setMethod(method, details = {}, paymentTypeId = null) {
    this.method = method || "Cash";
    this.methodDetails = details || {};
    this.paymentTypeId = paymentTypeId ? parseInt(paymentTypeId, 10) : null;
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

  setReceivedBy(officer) {
    this.receivedBy = officer || "Cashier";
    return this;
  }

  build() {
    const resolveNumericJobId = (j) => {
      if (j.rawId && Number(j.rawId) > 0) return Number(j.rawId);
      if (j.job_id && Number(j.job_id) > 0) return Number(j.job_id);
      const str = String(j.id || "");
      const m = str.match(/ORD-\d{4}-(\d+)/i);
      if (m) {
        const num = parseInt(m[1], 10);
        return num > 1000 ? num - 1000 : num;
      }
      const digits = parseInt(str.replace(/\D/g, ""), 10);
      if (digits > 1000) return digits - 1000;
      return digits > 0 ? digits : 1;
    };

    const primaryJob = this.jobs[0] || {};
    const customer = this.customer || {};
    const primaryCustomer = customer.name || primaryJob.customerName || "Customer";
    const rawCustId = customer.id || primaryJob.customerId || primaryJob.customer_id || 1;
    const primaryCustomerId = parseInt(String(rawCustId).replace(/\D/g, ""), 10) || 1;

    const totalBill = this.jobs.reduce((sum, j) => sum + (Number(j.totalAmount) || 0), 0);
    const totalPrevPaid = this.jobs.reduce((sum, j) => sum + (Number(j.paidAmount) || 0), 0);
    const remainingBalance = Math.max(0, (totalBill - totalPrevPaid) - this.amount);

    let paymentTypeId = this.paymentTypeId;
    let methodRef = "Direct Cash";

    if (!paymentTypeId) {
      if (this.method === "Credit Card") paymentTypeId = 3;
      else if (this.method === "Debit Card") paymentTypeId = 4;
      else if (this.method === "Cheque" || this.method === "Check") paymentTypeId = 5;
      else if (this.method === "Bank Transfer") paymentTypeId = 2;
      else if (this.method === "Online / QR Payment" || this.method === "Online / QR") paymentTypeId = 6;
      else if (this.method === "Card") paymentTypeId = 3;
      else paymentTypeId = 1;
    }

    const typeNames = {
      1: "Cash",
      2: "Bank Transfer",
      3: "Credit Card",
      4: "Debit Card",
      5: "Cheque",
      6: "Online / QR Payment"
    };

    methodRef = typeNames[paymentTypeId] || this.method || "Cash";

    const paymentStatusId = remainingBalance <= 0 ? 2 : (this.amount > 0 ? 3 : 1);
    const paymentId = `PAY-INV-${Date.now().toString().slice(-6)}`;
    const jobIdsList = this.jobs.map(j => j.id);
    const numericJobIds = this.jobs.map(j => resolveNumericJobId(j));

    const invoiceNo = this.jobs.length === 1
      ? `INV-${primaryJob.id}`
      : `INV-${primaryJob.id}-${this.jobs.length}J`;

    const allocations = this.jobs.map(j => ({
      job_id: resolveNumericJobId(j),
      id: j.id,
      productName: j.productName,
      total: Number(j.totalAmount) || 0,
      paidBefore: Number(j.paidAmount) || 0,
      allocated_amount: Number(j.allocatedAmount !== undefined ? j.allocatedAmount : this.amount) || 0,
      allocatedNow: Number(j.allocatedAmount !== undefined ? j.allocatedAmount : this.amount) || 0,
      balanceRemaining: Math.max(0, (Number(j.balanceAmount) || 0) - (Number(j.allocatedAmount) || 0))
    }));

    return {
      paymentId,
      invoiceNo,
      customerId: primaryCustomerId,
      customer_id: primaryCustomerId,
      customerName: primaryCustomer,
      customerMobile: primaryJob.customerMobile || "",
      orderId: jobIdsList.join(", "),
      jobIds: jobIdsList,
      print_job_ids: numericJobIds,
      jobCount: this.jobs.length,
      jobsCount: this.jobs.length,
      jobs: allocations,
      allocations,
      totalBill,
      totalAmount: totalBill,
      previouslyPaid: totalPrevPaid,
      amount: this.amount,
      payment_amount: this.amount,
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
      invoice_at: this.date ? `${this.date} 12:00:00` : new Date().toISOString().slice(0, 19).replace("T", " "),
      notes: this.notes,
      receivedBy: this.receivedBy
    };
  }
}
