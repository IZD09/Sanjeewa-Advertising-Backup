/**
 * SanjeewaAdvertising - Record Invoice Payment Modal
 *
 * Handles recording Customer & Multi-Job Print Settlements (#modalRecordInvoicePayment).
 * Workflow:
 *  1. Search & Select Customer
 *  2. Select Customer's Orders with Pending Payments (or Add All)
 *  3. Included Print Jobs Table with dynamic allocations and financial summary
 *
 * Supports Cash, Card, Cheque, Bank Transfer, and Online/QR payment methods.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import { RequestHandler } from "../../core/RequestHandler.js";
import { InvoicePaymentBuilder } from "../builders/InvoicePaymentBuilder.js";
import { InvoicePaymentProcessor } from "../processors/InvoicePaymentProcessor.js";

export class RecordInvoicePaymentModal extends BaseModalHandler {
  /**
   * @param {Object} context
   * @param {Function} context.getOrders
   * @param {Function} context.getOrderPayments
   * @param {Function} context.saveOrderPayments
   * @param {Function} context.saveOrders
   * @param {Function} context.render
   * @param {Function} [context.openReceiptModal]
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".pay-modal-backdrop",
      toastContainerId: "poToastContainer",
      closeSelectors: [".pay-modal-close", "[data-close-pay-modal]"],
      autoBind: true
    });

    this.ctx = context;
    this.http = new RequestHandler();
    this.processor = new InvoicePaymentProcessor(this.ctx);

    this.customers = [];
    this.selectedCustomer = null;
    this.pendingJobs = [];
    this.selectedJobs = [];
    this.selectedPaymentTypeId = 1;
    this.selectedMethod = "Cash";
    this.isSubmitting = false;

    this.bindEvents();
  }

  bindEvents() {
    // Open triggers across the application
    document.addEventListener("click", (e) => {
      const openBtn = e.target.closest("#btnOpenRecordInvoicePayment, [data-action='record-invoice']");
      if (openBtn) {
        e.preventDefault();
        const prefillId = openBtn.getAttribute("data-order-id") || null;
        this.openRecordInvoicePaymentModal(prefillId);
        return;
      }

      // Remove Job Button click
      const removeBtn = e.target.closest(".btn-remove-job");
      if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const jobId = removeBtn.getAttribute("data-job-id");
        if (jobId) {
          this.removeJob(jobId);
        }
        return;
      }

      // Pay Full Balance shortcut
      const payFullBtn = e.target.closest("#btnInvPayFull");
      if (payFullBtn) {
        e.preventDefault();
        this.payFullBalance();
        return;
      }

      // Method choice button clicks inside modal
      const methodChoice = e.target.closest("#invModalMethodSelector .method-choice");
      if (methodChoice) {
        e.preventDefault();
        const typeId = parseInt(methodChoice.getAttribute("data-type-id"), 10) || 1;
        const methodName = methodChoice.getAttribute("data-method") || "Cash";
        this.setPaymentType(typeId, methodName);
        return;
      }

      // Customer dropdown toggle button
      const toggleCustBtn = e.target.closest("#invToggleCustDropdownBtn");
      if (toggleCustBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleCustomerDropdown();
        return;
      }

      // Customer item click inside search dropdown
      const custItem = e.target.closest(".inv-cust-item");
      if (custItem) {
        e.preventDefault();
        const custId = parseInt(custItem.getAttribute("data-customer-id"), 10);
        const cust = this.customers.find(c => Number(c.id) === custId);
        if (cust) {
          this.selectCustomer(cust);
        }
        return;
      }

      // Clear customer / Change customer button
      const clearCustBtn = e.target.closest("#invClearCustomerBtn");
      if (clearCustBtn) {
        e.preventDefault();
        this.clearSelectedCustomer();
        return;
      }

      // Add All Pending Orders button
      const addAllBtn = e.target.closest("#invBtnAddAllJobs");
      if (addAllBtn) {
        e.preventDefault();
        this.addAllPendingJobs();
        return;
      }

      // Confirm Save Button click
      const confirmBtn = e.target.closest("#btnConfirmSaveInvoicePayment");
      if (confirmBtn) {
        e.preventDefault();
        this.save();
        return;
      }

      // Click outside customer dropdown -> close dropdown
      const searchGroup = document.getElementById("invCustSearchGroup");
      const dropdown = document.getElementById("invCustDropdown");
      if (dropdown && dropdown.style.display !== "none") {
        if (!searchGroup || !searchGroup.contains(e.target)) {
          this.hideCustomerDropdown();
        }
      }
    });

    // Customer Search Input typing
    const searchInput = document.getElementById("invCustSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        this.renderCustomerDropdown(query);
      });

      searchInput.addEventListener("focus", () => {
        const query = searchInput.value.trim();
        this.renderCustomerDropdown(query);
      });
    }

    // Job Selector dropdown - automatically add job when selected
    const jobSelect = document.getElementById("invModalJobSelect");
    if (jobSelect) {
      jobSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val) {
          this.addJobById(val);
          jobSelect.value = "";
        }
      });
    }

    // Total Amount Input
    const amountInput = document.getElementById("invModalAmount");
    if (amountInput) {
      amountInput.addEventListener("input", () => this.onTotalAmountChanged());
    }

    // Individual Job Allocation Input change / input
    const jobsTableBody = document.getElementById("invModalSelectedJobsBody");
    if (jobsTableBody) {
      jobsTableBody.addEventListener("input", (e) => {
        const allocInput = e.target.closest(".pay-job-allocation");
        if (allocInput) {
          const jobId = allocInput.getAttribute("data-job-id");
          const val = parseFloat(allocInput.value) || 0;
          this.onJobAllocationChanged(jobId, val);
        }
      });
    }
  }

  /**
   * Open the Record Invoice Payment modal
   * @param {string|number|null} prefillOrderId
   */
  async openRecordInvoicePaymentModal(prefillOrderId = null) {
    const modal = document.getElementById("modalRecordInvoicePayment");
    if (!modal) return;

    // Reset payment method to Cash (Database ID 1)
    this.setPaymentType(1, "Cash");

    // Reset date to today
    const dateInput = document.getElementById("invModalDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    // Reset note
    const noteInput = document.getElementById("invModalNotes");
    if (noteInput) noteInput.value = "";

    // Clear state
    this.selectedCustomer = null;
    this.pendingJobs = [];
    this.selectedJobs = [];

    // Reset UI elements
    this.resetCustomerUI();
    this.renderSelectedJobsTable();
    this.recalculateSummary();

    // Load customer directory
    await this.loadCustomers();

    // If prefillOrderId is given, find its customer and auto-populate
    if (prefillOrderId) {
      await this.handlePrefillOrder(prefillOrderId);
    }

    this.openModal("modalRecordInvoicePayment");
  }

  /**
   * Load all customers from API
   */
  async loadCustomers() {
    try {
      const res = await this.http.get("/api/v1/customers/all");
      const data = res?.data || res;
      this.customers = Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.warn("[RecordInvoicePaymentModal] Could not fetch customer list:", err);
      this.customers = [];
    }
  }

  /**
   * Handle prefilling from a specific Order ID
   * @param {string|number} orderId
   */
  async handlePrefillOrder(orderId) {
    if (!orderId) return;

    // 1. Try finding in existing orders state
    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];

    const clean = String(orderId).trim().toLowerCase();
    let found = orders.find(o => String(o.id ?? "").toLowerCase() === clean || String(o.id ?? "").toLowerCase().endsWith(clean));
    if (!found) {
      found = payments.find(p => String(p.orderId ?? p.id ?? "").toLowerCase() === clean || String(p.orderId ?? p.id ?? "").toLowerCase().endsWith(clean));
    }

    let customerToSelect = null;
    if (found) {
      const custId = found.customerId || found.customer_id;
      const custName = found.customerName || found.customer_name;
      if (custId) {
        customerToSelect = this.customers.find(c => Number(c.id) === Number(custId));
      }
      if (!customerToSelect && custName) {
        customerToSelect = this.customers.find(c => String(c.name).toLowerCase() === String(custName).toLowerCase());
      }
    }

    // If not found in memory, query API for this job to locate its customer
    if (!customerToSelect) {
      try {
        const rawNum = String(orderId).match(/(\d+)$/)?.[1];
        if (rawNum) {
          const res = await this.http.get(`/api/v1/print-jobs/${rawNum}`);
          const jobData = res?.data || res;
          if (jobData?.customers_id) {
            customerToSelect = this.customers.find(c => Number(c.id) === Number(jobData.customers_id));
          }
        }
      } catch (e) {
        console.warn("[RecordInvoicePaymentModal] Could not fetch prefill job info:", e);
      }
    }

    if (customerToSelect) {
      await this.selectCustomer(customerToSelect, orderId);
    }
  }

  /**
   * Reset customer UI fields to initial state
   */
  resetCustomerUI() {
    const searchGroup = document.getElementById("invCustSearchGroup");
    const searchInput = document.getElementById("invCustSearchInput");
    const custCard = document.getElementById("invSelectedCustomerCard");
    const custIdHidden = document.getElementById("invSelectedCustomerId");
    const dropdown = document.getElementById("invCustDropdown");
    const addAllBtn = document.getElementById("invBtnAddAllJobs");
    const jobSelect = document.getElementById("invModalJobSelect");
    const helpMsg = document.getElementById("invJobSelectHelpMsg");

    if (searchGroup) searchGroup.style.display = "block";
    if (searchInput) searchInput.value = "";
    if (custCard) custCard.style.display = "none";
    if (custIdHidden) custIdHidden.value = "";
    if (dropdown) dropdown.style.display = "none";
    if (addAllBtn) addAllBtn.style.display = "none";

    if (jobSelect) {
      jobSelect.innerHTML = `<option value="">-- Please select a customer above first --</option>`;
      jobSelect.disabled = true;
    }

    if (helpMsg) {
      helpMsg.textContent = "Please search and select a customer above to view their pending orders.";
    }
  }

  /**
   * Toggle Customer search dropdown
   */
  toggleCustomerDropdown() {
    const dropdown = document.getElementById("invCustDropdown");
    if (!dropdown) return;

    if (dropdown.style.display === "block") {
      this.hideCustomerDropdown();
    } else {
      const searchInput = document.getElementById("invCustSearchInput");
      const query = searchInput ? searchInput.value.trim() : "";
      this.renderCustomerDropdown(query);
    }
  }

  /**
   * Hide Customer dropdown
   */
  hideCustomerDropdown() {
    const dropdown = document.getElementById("invCustDropdown");
    const icon = document.getElementById("invCustDropdownIcon");
    if (dropdown) dropdown.style.display = "none";
    if (icon) {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  }

  /**
   * Render customer search results dropdown
   * @param {string} query
   */
  renderCustomerDropdown(query = "") {
    const dropdown = document.getElementById("invCustDropdown");
    const icon = document.getElementById("invCustDropdownIcon");
    if (!dropdown) return;

    const cleanQuery = String(query).toLowerCase().trim();
    let matches = this.customers;

    if (cleanQuery) {
      matches = this.customers.filter(c => {
        const name = String(c.name || "").toLowerCase();
        const mobile = String(c.mobile || "").toLowerCase();
        const id = String(c.id || "");
        const email = String(c.email || "").toLowerCase();
        return name.includes(cleanQuery) || mobile.includes(cleanQuery) || id === cleanQuery || email.includes(cleanQuery);
      });
    }

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 14px 16px; text-align: center; color: var(--text-muted); font-size: 12px;">
          <i class="fa-solid fa-user-slash" style="margin-right: 6px; opacity: 0.6;"></i>
          No customers found matching "<strong>${this.escapeHtml(query)}</strong>"
        </div>`;
    } else {
      const topMatches = matches.slice(0, 30);
      dropdown.innerHTML = topMatches.map(c => {
        const orderCount = c.total_orders || c.print_jobs_count || 0;
        return `
          <div class="inv-cust-item" data-customer-id="${c.id}" style="padding: 10px 14px; border-bottom: 1px solid var(--border-subtle, rgba(0,0,0,0.06)); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.15s ease;">
            <div style="min-width: 0;">
              <strong style="color: var(--text); font-size: 13px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(c.name)}</strong>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;">
                ${this.escapeHtml(c.mobile || "No Mobile")} • Cust #${c.id}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              ${orderCount > 0 ? `<span style="font-size: 10px; background: rgba(37,99,235,0.08); color: #2563eb; padding: 2px 7px; border-radius: 10px; font-weight: 700;">${orderCount} Jobs</span>` : ""}
              <span style="font-size: 11px; font-weight: 700; color: #2563eb;">Select &rarr;</span>
            </div>
          </div>`;
      }).join("");

      // Add hover effect via simple inline style event delegation
      dropdown.querySelectorAll(".inv-cust-item").forEach(item => {
        item.addEventListener("mouseenter", () => item.style.backgroundColor = "var(--surface-2, rgba(37,99,235,0.05))");
        item.addEventListener("mouseleave", () => item.style.backgroundColor = "");
      });
    }

    dropdown.style.display = "block";
    if (icon) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    }
  }

  /**
   * Select a customer and load their pending orders
   * @param {Object} customer
   * @param {string|number|null} [autoSelectJobId]
   */
  async selectCustomer(customer, autoSelectJobId = null) {
    if (!customer) return;

    this.selectedCustomer = customer;
    this.hideCustomerDropdown();

    // Update UI elements
    const searchGroup = document.getElementById("invCustSearchGroup");
    const custCard = document.getElementById("invSelectedCustomerCard");
    const custNameEl = document.getElementById("invSelectedCustName");
    const custMobileEl = document.getElementById("invSelectedCustMobile");
    const custIdHidden = document.getElementById("invSelectedCustomerId");
    const pendingBadge = document.getElementById("invSelectedCustPendingBadge");
    const jobSelect = document.getElementById("invModalJobSelect");
    const helpMsg = document.getElementById("invJobSelectHelpMsg");

    if (searchGroup) searchGroup.style.display = "none";
    if (custCard) custCard.style.display = "flex";
    if (custNameEl) custNameEl.textContent = customer.name;
    if (custMobileEl) custMobileEl.textContent = `${customer.mobile || "No Mobile"} • Customer #${customer.id}`;
    if (custIdHidden) custIdHidden.value = customer.id;

    if (pendingBadge) {
      pendingBadge.textContent = "Loading orders...";
      pendingBadge.style.color = "#2563eb";
    }

    if (jobSelect) {
      jobSelect.disabled = true;
      jobSelect.innerHTML = `<option value="">Loading customer's pending orders...</option>`;
    }

    if (helpMsg) {
      helpMsg.textContent = `Fetching pending payment print jobs for ${customer.name}...`;
    }

    // Fetch pending orders for this customer from backend
    await this.fetchCustomerPendingJobs(customer.id);

    // If an autoSelectJobId was passed, add that job immediately
    if (autoSelectJobId) {
      const match = this.pendingJobs.find(j => {
        const c1 = String(j.id).toLowerCase();
        const c2 = String(j.rawId);
        const q = String(autoSelectJobId).toLowerCase();
        return c1 === q || c1.endsWith(q) || c2 === q;
      });
      if (match) {
        this.addJobObject(match);
      }
    }

    this.updateJobDropdown();
    this.renderSelectedJobsTable();
    this.recalculateSummary();
  }

  /**
   * Fetch customer's pending jobs from backend
   * @param {number} customerId
   */
  async fetchCustomerPendingJobs(customerId) {
    try {
      const res = await this.http.get(`/api/v1/invoices/available-jobs?customer_id=${customerId}&pending_only=1`);
      const data = res?.data || res;
      const rawJobs = Array.isArray(data) ? data : (data?.jobs || []);

      this.pendingJobs = rawJobs.map(j => ({
        id: j.formattedId || j.orderId || `ORD-2026-${1000 + Number(j.id)}`,
        jobId: j.job_id || j.id,
        rawId: j.id,
        customerId: j.customerId || customerId,
        customerName: j.customerName || this.selectedCustomer?.name || "Customer",
        customerMobile: j.customerMobile || this.selectedCustomer?.mobile || "",
        productName: j.productName || "Print Job",
        totalAmount: Number(j.totalAmount) || 0,
        paidAmount: Number(j.paidAmount) || 0,
        balanceAmount: Number(j.balanceAmount) || 0,
        paymentStatus: j.status || (j.balanceAmount <= 0 ? "Paid" : "Pending")
      }));
    } catch (err) {
      console.warn("[RecordInvoicePaymentModal] Could not fetch customer pending jobs:", err);
      this.pendingJobs = [];
    }

    const pendingBadge = document.getElementById("invSelectedCustPendingBadge");
    const count = this.pendingJobs.length;
    if (pendingBadge) {
      pendingBadge.textContent = `${count} Pending Order${count === 1 ? "" : "s"}`;
      pendingBadge.style.color = count > 0 ? "#2563eb" : "#10b981";
    }

    const addAllBtn = document.getElementById("invBtnAddAllJobs");
    if (addAllBtn) {
      addAllBtn.style.display = count > 0 ? "inline-flex" : "none";
    }

    const helpMsg = document.getElementById("invJobSelectHelpMsg");
    if (helpMsg) {
      if (count > 0) {
        helpMsg.textContent = `Found ${count} pending order(s) for ${this.selectedCustomer?.name}. Select an order to include it in this invoice.`;
      } else {
        helpMsg.textContent = `No pending payment orders found for ${this.selectedCustomer?.name}. All jobs are settled.`;
      }
    }
  }

  /**
   * Clear the currently selected customer and reset Step 2 & 3
   */
  clearSelectedCustomer() {
    this.selectedCustomer = null;
    this.pendingJobs = [];
    this.selectedJobs = [];

    this.resetCustomerUI();
    this.renderSelectedJobsTable();
    this.recalculateSummary();
  }

  /**
   * Update the Step 2 Job Selector dropdown with remaining unselected pending orders
   */
  updateJobDropdown() {
    const jobSelect = document.getElementById("invModalJobSelect");
    const addAllBtn = document.getElementById("invBtnAddAllJobs");
    if (!jobSelect) return;

    if (!this.selectedCustomer) {
      jobSelect.innerHTML = `<option value="">-- Please select a customer above first --</option>`;
      jobSelect.disabled = true;
      if (addAllBtn) addAllBtn.style.display = "none";
      return;
    }

    // Filter out jobs that are already in this.selectedJobs
    const unselected = this.pendingJobs.filter(j => {
      return !this.selectedJobs.some(s => {
        return String(s.id).toLowerCase() === String(j.id).toLowerCase() ||
               (s.rawId && j.rawId && Number(s.rawId) === Number(j.rawId));
      });
    });

    jobSelect.disabled = false;

    if (unselected.length === 0) {
      if (this.pendingJobs.length === 0) {
        jobSelect.innerHTML = `<option value="">No pending payment orders for this customer</option>`;
      } else {
        jobSelect.innerHTML = `<option value="">All pending orders are included in this invoice (${this.selectedJobs.length} selected)</option>`;
      }
      if (addAllBtn) addAllBtn.style.display = "none";
      return;
    }

    if (addAllBtn) addAllBtn.style.display = "inline-flex";

    jobSelect.innerHTML =
      `<option value="">-- Select Pending Order to Add (${unselected.length} available) --</option>` +
      unselected.map(item => {
        return `<option value="${item.id}">${item.id} | ${this.escapeHtml(item.productName)} (Due: Rs. ${item.balanceAmount.toLocaleString()} | Total: Rs. ${item.totalAmount.toLocaleString()})</option>`;
      }).join("");
  }

  /**
   * Add a pending order to this.selectedJobs by its ID
   * @param {string|number} jobId
   */
  addJobById(jobId) {
    if (!jobId) return;

    // First look in this customer's pending jobs
    let job = this.pendingJobs.find(j => {
      const c1 = String(j.id).toLowerCase();
      const c2 = String(j.rawId);
      const q = String(jobId).toLowerCase();
      return c1 === q || c1.endsWith(q) || c2 === q;
    });

    // Fallback: look in global orders / payments
    if (!job) {
      job = this.findOrderByIdOrQuery(jobId);
    }

    if (!job) {
      this.showToast(`Order ${jobId} not found.`, "warning");
      return;
    }

    const cleanJobId = job.id || job.orderId;
    if (this.selectedJobs.some(j => String(j.id).toLowerCase() === String(cleanJobId).toLowerCase())) {
      this.showToast(`Order ${cleanJobId} is already included in this invoice.`, "info");
      return;
    }

    this.addJobObject(job);
    this.updateJobDropdown();
    this.renderSelectedJobsTable();
    this.recalculateSummary();
    this.showToast(`Order ${cleanJobId} added to invoice.`, "success");
  }

  /**
   * Add all remaining pending jobs of the customer to this invoice
   */
  addAllPendingJobs() {
    if (!this.pendingJobs || this.pendingJobs.length === 0) {
      this.showToast("No pending orders available to add.", "info");
      return;
    }

    let addedCount = 0;
    this.pendingJobs.forEach(job => {
      const isAlreadyAdded = this.selectedJobs.some(s => {
        return String(s.id).toLowerCase() === String(job.id).toLowerCase() ||
               (s.rawId && job.rawId && Number(s.rawId) === Number(job.rawId));
      });

      if (!isAlreadyAdded) {
        this.addJobObject(job);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.updateJobDropdown();
      this.renderSelectedJobsTable();
      this.recalculateSummary();
      this.showToast(`Added ${addedCount} pending orders to this invoice!`, "success");
    } else {
      this.showToast("All pending orders are already added.", "info");
    }
  }

  /**
   * Push a job object into this.selectedJobs
   * @param {Object} order
   */
  addJobObject(order) {
    const jobId = order.id || order.orderId;
    if (!jobId) return;
    if (this.selectedJobs.some(j => String(j.id).toLowerCase() === String(jobId).toLowerCase())) return;

    const tot = Number(order.totalAmount !== undefined ? order.totalAmount : order.totalBill) || 0;
    const paid = Number(order.paidAmount !== undefined ? order.paidAmount : order.amount) || 0;
    const bal = Number(order.balanceAmount !== undefined ? order.balanceAmount : (tot - paid)) || 0;

    this.selectedJobs.push({
      id: jobId,
      rawId: order.rawId || order.jobId || (typeof order.id === "number" ? order.id : null),
      customerId: order.customerId || (this.selectedCustomer ? this.selectedCustomer.id : 1),
      customerName: order.customerName || (this.selectedCustomer ? this.selectedCustomer.name : "Customer"),
      customerMobile: order.customerMobile || (this.selectedCustomer ? this.selectedCustomer.mobile : ""),
      productName: order.productName || order.stockCategory || "Print Order",
      totalAmount: tot,
      paidAmount: paid,
      balanceAmount: bal,
      allocatedAmount: bal > 0 ? bal : tot
    });
  }

  /**
   * Remove a job from this.selectedJobs
   * @param {string|number} jobId
   */
  removeJob(jobId) {
    this.selectedJobs = this.selectedJobs.filter(j => String(j.id).toLowerCase() !== String(jobId).toLowerCase());
    this.updateJobDropdown();
    this.renderSelectedJobsTable();
    this.recalculateSummary();
    this.showToast(`Order ${jobId} removed from invoice.`, "info");
  }

  /**
   * Render the Included Print Jobs on this Invoice table
   */
  renderSelectedJobsTable() {
    const tbody = document.getElementById("invModalSelectedJobsBody");
    const countPill = document.getElementById("invModalJobCountPill");
    const saveBtnText = document.getElementById("btnConfirmSaveInvoiceText");

    const jobCount = this.selectedJobs.length;
    if (countPill) {
      countPill.textContent = `${jobCount} Order${jobCount === 1 ? "" : "s"} Selected`;
    }

    if (saveBtnText) {
      saveBtnText.textContent = jobCount > 1
        ? `Save Invoice Payment (${jobCount} Orders) & Generate Voucher`
        : `Save Invoice Payment & Generate Voucher`;
    }

    if (!tbody) return;

    if (jobCount === 0) {
      tbody.innerHTML = `
        <tr class="empty-jobs-row">
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 22px;">
            <i class="fa-solid fa-file-circle-exclamation" style="font-size: 24px; color: var(--text-muted); display: block; margin-bottom: 6px; opacity: 0.5;"></i>
            No print jobs added to this invoice yet. Select pending orders from the selector above.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = this.selectedJobs.map(j => {
      const safeAttrId = String(j.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      return `
        <tr>
          <td style="padding: 10px 12px;">
            <strong style="color: #2563eb; font-size: 13px;">${this.escapeHtml(j.id)}</strong>
            <div style="font-size: 11.5px; color: var(--text-muted);">${this.escapeHtml(j.productName)}</div>
          </td>
          <td style="padding: 10px 10px; font-size: 12px; color: var(--text);">
            ${this.escapeHtml(j.customerName)}
          </td>
          <td style="padding: 10px 10px; text-align: right; font-weight: 600;">
            Rs. ${j.totalAmount.toLocaleString()}
          </td>
          <td style="padding: 10px 10px; text-align: right; font-weight: 700; color: ${j.balanceAmount > 0 ? '#ef4444' : '#10b981'};">
            Rs. ${j.balanceAmount.toLocaleString()}
          </td>
          <td style="padding: 8px 10px; text-align: right;">
            <input type="number" id="invJobAlloc_${safeAttrId}" name="inv_job_alloc[${safeAttrId}]" aria-label="Payment allocation for ${this.escapeHtml(j.id)}" class="pay-job-allocation pay-input" data-job-id="${this.escapeHtml(j.id)}" min="0" step="50" value="${j.allocatedAmount}" style="text-align: right; font-weight: 700; height: 34px; padding: 4px 8px; font-size: 13px;">
          </td>
          <td style="padding: 8px 8px; text-align: center;">
            <button type="button" class="btn-remove-job" data-job-id="${j.id}" title="Remove job from invoice" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 6px; font-size: 14px;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>`;
    }).join("");
  }

  /**
   * Recalculate summary totals, allocations, and stage
   */
  recalculateSummary() {
    const elTotal = document.getElementById("invModalBalTotal");
    const elPaid = document.getElementById("invModalBalPaid");
    const elBal = document.getElementById("invModalBalRemaining");
    const amountInput = document.getElementById("invModalAmount");

    const totalBill = this.selectedJobs.reduce((sum, j) => sum + j.totalAmount, 0);
    const totalPaidBefore = this.selectedJobs.reduce((sum, j) => sum + j.paidAmount, 0);
    const totalBal = this.selectedJobs.reduce((sum, j) => sum + j.balanceAmount, 0);
    const totalAlloc = this.selectedJobs.reduce((sum, j) => sum + (Number(j.allocatedAmount) || 0), 0);

    if (elTotal) elTotal.textContent = `Rs. ${totalBill.toLocaleString()}`;
    if (elPaid) elPaid.textContent = `Rs. ${totalPaidBefore.toLocaleString()}`;
    if (elBal) elBal.textContent = `Rs. ${totalBal.toLocaleString()}`;

    if (amountInput) {
      amountInput.value = totalAlloc > 0 ? totalAlloc : (totalBal > 0 ? totalBal : 0);
      if (totalAlloc === 0 && totalBal > 0) {
        this.selectedJobs.forEach(j => {
          j.allocatedAmount = j.balanceAmount > 0 ? j.balanceAmount : j.totalAmount;
        });
        amountInput.value = this.selectedJobs.reduce((sum, j) => sum + (Number(j.allocatedAmount) || 0), 0);
      }
    }

    this.updateStage();
  }

  /**
   * Triggered when an individual job allocation input is edited
   * @param {string|number} jobId
   * @param {number} val
   */
  onJobAllocationChanged(jobId, val) {
    const job = this.selectedJobs.find(j => String(j.id).toLowerCase() === String(jobId).toLowerCase());
    if (!job) return;

    job.allocatedAmount = Math.max(0, val);

    const totalAlloc = this.selectedJobs.reduce((sum, j) => sum + (Number(j.allocatedAmount) || 0), 0);
    const amountInput = document.getElementById("invModalAmount");
    if (amountInput) {
      amountInput.value = totalAlloc;
    }

    this.updateStage();
  }

  /**
   * Triggered when the main payment amount input is edited
   */
  onTotalAmountChanged() {
    const amountInput = document.getElementById("invModalAmount");
    let remainingToDistribute = parseFloat(amountInput ? amountInput.value : 0) || 0;

    this.selectedJobs.forEach(job => {
      const needed = job.balanceAmount > 0 ? job.balanceAmount : job.totalAmount;
      if (remainingToDistribute >= needed) {
        job.allocatedAmount = needed;
        remainingToDistribute -= needed;
      } else {
        job.allocatedAmount = remainingToDistribute;
        remainingToDistribute = 0;
      }
    });

    if (remainingToDistribute > 0 && this.selectedJobs.length > 0) {
      this.selectedJobs[0].allocatedAmount += remainingToDistribute;
    }

    this.selectedJobs.forEach(job => {
      const input = document.querySelector(`.pay-job-allocation[data-job-id="${job.id}"]`);
      if (input) input.value = job.allocatedAmount;
    });

    this.updateStage();
  }

  /**
   * Pay Full Balance shortcut
   */
  payFullBalance() {
    let totalBal = 0;
    this.selectedJobs.forEach(job => {
      job.allocatedAmount = job.balanceAmount > 0 ? job.balanceAmount : job.totalAmount;
      totalBal += job.allocatedAmount;
    });

    const amountInput = document.getElementById("invModalAmount");
    if (amountInput) amountInput.value = totalBal;

    this.selectedJobs.forEach(job => {
      const input = document.querySelector(`.pay-job-allocation[data-job-id="${job.id}"]`);
      if (input) input.value = job.allocatedAmount;
    });

    this.updateStage();
  }

  /**
   * Update payment stage select based on allocated amount vs total balance
   */
  updateStage() {
    const stageSelect = document.getElementById("invModalStageSelect");
    if (!stageSelect) return;

    const amountInput = document.getElementById("invModalAmount");
    const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    const totalBal = this.selectedJobs.reduce((sum, j) => sum + j.balanceAmount, 0);

    if (amount <= 0) {
      stageSelect.value = "Pending Payment";
    } else if (amount >= totalBal && totalBal > 0) {
      stageSelect.value = "Complete Payment";
    } else {
      stageSelect.value = "Advance Payment";
    }
  }

  /**
   * Set Payment Type (Database: payment_types 1..6)
   * @param {number} typeId
   * @param {string} [methodName]
   */
  setPaymentType(typeId, methodName = null) {
    this.selectedPaymentTypeId = parseInt(typeId, 10) || 1;

    // Database lookup names (matching MySQL `payment_types` table)
    const typeNames = {
      1: "Cash",
      2: "Bank Transfer",
      3: "Credit Card",
      4: "Debit Card",
      5: "Cheque",
      6: "Online / QR Payment"
    };

    this.selectedMethod = methodName || typeNames[this.selectedPaymentTypeId] || "Cash";

    // Synchronize select dropdown
    const select = document.getElementById("invPaymentTypeId");
    if (select && parseInt(select.value, 10) !== this.selectedPaymentTypeId) {
      select.value = String(this.selectedPaymentTypeId);
    }

    // Synchronize visual buttons
    document.querySelectorAll("#invModalMethodSelector .method-choice").forEach(c => {
      const cId = parseInt(c.getAttribute("data-type-id"), 10);
      c.classList.toggle("selected", cId === this.selectedPaymentTypeId);
    });
  }

  /**
   * Save Invoice Settlement
   */
  async save() {
    if (this.isSubmitting) return;

    if (!this.selectedCustomer) {
      this.showToast("Please search and select a customer first.", "error");
      return;
    }

    if (!this.selectedJobs || this.selectedJobs.length === 0) {
      this.showToast("Please select at least one pending print job for this invoice.", "error");
      return;
    }

    const amountInput = document.getElementById("invModalAmount");
    const totalAmount = parseFloat(amountInput ? amountInput.value : 0);

    if (totalAmount <= 0) {
      this.showToast("Please enter a valid payment amount greater than Rs. 0.", "error");
      return;
    }

    this.isSubmitting = true;
    const confirmBtn = document.getElementById("btnConfirmSaveInvoicePayment");
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Settlement...`;
    }

    try {
      const stage = document.getElementById("invModalStageSelect")?.value || "Advance Payment";
      const payDate = document.getElementById("invModalDate")?.value || new Date().toISOString().split("T")[0];
      const notes = document.getElementById("invModalNotes")?.value.trim() || "";
      const receivedBy = document.getElementById("invModalAuthorizedOfficer")?.value || document.getElementById("invModalOfficer")?.value || "Cashier";

      const builder = new InvoicePaymentBuilder();
      builder.setCustomer(this.selectedCustomer)
             .setJobs(this.selectedJobs)
             .setAmount(totalAmount)
             .setStage(stage)
             .setMethod(this.selectedMethod, {}, this.selectedPaymentTypeId)
             .setDate(payDate)
             .setNotes(notes)
             .setReceivedBy(receivedBy);

      const paymentData = builder.build();
      const result = await this.processor.process(paymentData);

      if (result.success) {
        this.closeModal("modalRecordInvoicePayment");
        this.clearSelectedCustomer();
        this.showToast("Invoice payment recorded successfully!", "success");

        if (this.ctx.render) {
          this.ctx.render();
        }
      }
    } catch (err) {
      console.error("[RecordInvoicePaymentModal] Error saving invoice payment:", err);
      this.showToast("An error occurred while saving invoice settlement.", "error");
    } finally {
      this.isSubmitting = false;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `
          <i class="fa-solid fa-check-circle"></i>
          <span id="btnConfirmSaveInvoiceText">Save Invoice Payment &amp; Generate Voucher</span>`;
      }
    }
  }

  /**
   * Helper to find order by ID or query in existing memory stores
   */
  findOrderByIdOrQuery(query) {
    if (!query) return null;
    const clean = String(query).trim().toLowerCase().replace(/^#/, "");
    if (!clean) return null;

    const orders = this.ctx.getOrders ? this.ctx.getOrders() : [];
    const payments = this.ctx.getOrderPayments ? this.ctx.getOrderPayments() : [];

    let match = orders.find(o => String(o.id ?? "").toLowerCase() === clean);
    if (match) return match;

    match = orders.find(o => String(o.id ?? "").toLowerCase().endsWith(clean));
    if (match) return match;

    match = orders.find(o => String(o.id ?? "").toLowerCase().includes(clean));
    if (match) return match;

    let payMatch = payments.find(p => String(p.orderId ?? p.order_id ?? p.id ?? "").toLowerCase() === clean);
    if (!payMatch) {
      payMatch = payments.find(p => String(p.orderId ?? p.order_id ?? p.id ?? "").toLowerCase().endsWith(clean));
    }
    if (!payMatch) {
      payMatch = payments.find(p => String(p.orderId ?? p.order_id ?? p.id ?? "").toLowerCase().includes(clean));
    }

    if (payMatch) {
      return {
        id: payMatch.orderId || payMatch.order_id || payMatch.id,
        customerName: payMatch.customerName || payMatch.customer_name || "Customer",
        productName: payMatch.productName || payMatch.product_name || "Print Order",
        totalAmount: Number(payMatch.totalBill ?? payMatch.total_amount ?? payMatch.totalAmount ?? 0),
        paidAmount: Number(payMatch.amount ?? payMatch.paid_amount ?? payMatch.paidAmount ?? 0),
        balanceAmount: Number(payMatch.balance ?? payMatch.balance_amount ?? payMatch.balanceAmount ?? 0)
      };
    }

    return null;
  }

  /**
   * Escape HTML helper
   */
  escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
