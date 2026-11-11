/**
 * SanjeewaAdvertising - Invoice Payment Builder
 *
 * Constructs and normalizes payload models for Customer & Multi-Job Invoice Payments.
 */
export class InvoicePaymentBuilder {
  constructor() {
    this.jobs = [];
    this.amount = 0;
    this.stage = "Advance Payment";
    this.method = "Cash";
    this.methodDetails = {};
    this.date = new Date().toISOString().split("T")[0];
    this.notes = "";
    this.receivedBy = "Cashier";
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

  setMethod(method, details = {}) {
    this.method = method || "Cash";
    this.methodDetails = details || {};
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
    const primaryJob = this.jobs[0] || {};
    const primaryCustomer = primaryJob.customerName || "Customer";
    const primaryCustomerId = primaryJob.customerId || primaryJob.customer_id || 1;

    const totalBill = this.jobs.reduce((sum, j) => sum + (Number(j.totalAmount) || 0), 0);
    const totalPrevPaid = this.jobs.reduce((sum, j) => sum + (Number(j.paidAmount) || 0), 0);
    const remainingBalance = Math.max(0, (totalBill - totalPrevPaid) - this.amount);

    let paymentTypeId = 1; // Cash
    let methodRef = "Direct Cash";

    if (this.method === "Card") {
      paymentTypeId = 3;
      const last4 = this.methodDetails.last4 || "";
      const auth = this.methodDetails.auth || "";
      methodRef = `Card ****${last4}${auth ? ` (${auth})` : ""}`;
    } else if (this.method === "Check" || this.method === "Cheque") {
      paymentTypeId = 5;
      const chq = this.methodDetails.chequeNo || "";
      const bank = this.methodDetails.bank || "";
      methodRef = `Cheque #${chq} - ${bank}`;
    } else if (this.method === "Bank Transfer") {
      paymentTypeId = 2;
      const ref = this.methodDetails.ref || "";
      const bank = this.methodDetails.bank || "";
      methodRef = `FT: ${bank} ${ref}`;
    } else if (this.method === "Online / QR") {
      paymentTypeId = 6;
      const app = this.methodDetails.app || "LankaQR";
      const ref = this.methodDetails.ref || "";
      methodRef = `${app} Ref: ${ref}`;
    } else {
      paymentTypeId = 1;
      const tendered = this.methodDetails.tendered;
      methodRef = tendered ? `Cash (Tendered: Rs. ${parseFloat(tendered).toLocaleString()})` : "Direct Cash";
    }

    const paymentStatusId = remainingBalance <= 0 ? 2 : (this.amount > 0 ? 3 : 1);
    const paymentId = `PAY-INV-${Date.now().toString().slice(-6)}`;
    const jobIdsList = this.jobs.map(j => j.id);
    const numericJobIds = this.jobs.map(j => parseInt(String(j.rawId || j.job_id || j.id).replace(/\D/g, ""), 10) || 1);

    const invoiceNo = this.jobs.length === 1
      ? `INV-${primaryJob.id}`
      : `INV-${primaryJob.id}-${this.jobs.length}J`;

    const allocations = this.jobs.map(j => ({
      job_id: parseInt(String(j.rawId || j.job_id || j.id).replace(/\D/g, ""), 10) || 1,
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
