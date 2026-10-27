/**
 * Payments & Financial Settlements Hub
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Handles:
 *   1. Invoice Payment (Job Payments: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
 *   2. GRN Payment (Stock Items & Suppliers: Complete, Pending, Advance; Card, Cash, Check, Bank Transfer)
 */

"use strict";

class PaymentsManager {
  constructor() {
    this.storageKeys = {
      orders: "sa_advertising_orders",
      orderPayments: "sa_advertising_payments",
      grnRecords: "sa_advertising_grn_records",
      grnPayments: "sa_advertising_grn_payments"
    };

    // State
    this.orders = [];
    this.orderPayments = [];
    this.grnRecords = [];
    this.grnPayments = [];

    this.activeTab = "invoice"; // "invoice", "grn", or "overview"

    // Filters for Invoice Payments
    this.invoiceSearch = "";
    this.invoiceStatusFilter = "ALL";
    this.invoiceMethodFilter = "ALL";

    // Filters for GRN Payments
    this.grnSearch = "";
    this.grnStatusFilter = "ALL";
    this.grnMethodFilter = "ALL";

    // Modal state
    this.modalType = "invoice"; // "invoice" or "grn"
    this.selectedMethod = "Cash";

    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.render();
  }

  /* ==========================================================================
     Data Loading & Seeding
     ========================================================================== */
  loadData() {
    // 1. Load Orders & Invoice Payments
    const savedOrders = localStorage.getItem(this.storageKeys.orders);
    const savedOrderPayments = localStorage.getItem(this.storageKeys.orderPayments);

    if (savedOrders) {
      try {
        this.orders = JSON.parse(savedOrders);
      } catch (e) {
        console.error("Could not parse saved orders", e);
      }
    }

    if (savedOrderPayments) {
      try {
        this.orderPayments = JSON.parse(savedOrderPayments);
      } catch (e) {
        console.error("Could not parse saved order payments", e);
      }
    }

    // 2. Load GRN Records & GRN Payments
    const savedGrns = localStorage.getItem(this.storageKeys.grnRecords);
    if (savedGrns) {
      try {
        this.grnRecords = JSON.parse(savedGrns);
      } catch (e) {
        console.error("Could not parse saved GRNs", e);
      }
    }

    const savedGrnPayments = localStorage.getItem(this.storageKeys.grnPayments);
    if (savedGrnPayments) {
      try {
        this.grnPayments = JSON.parse(savedGrnPayments);
      } catch (e) {
        console.error("Could not parse saved GRN payments", e);
      }
    } else {
      this.seedDefaultGrnPayments();
    }

    // Ensure initial rich sample data if empty
    this.enrichOrderPayments();
  }

  enrichOrderPayments() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    // Verify if we have standard samples with all 4 methods & 3 stages
    if (!this.orderPayments || this.orderPayments.length < 3) {
      this.orderPayments = [
        {
          paymentId: "PAY-INV-2026-001",
          orderId: "ORD-2026-1048",
          invoiceNo: "INV-2026-1048",
          customerName: "Kasun Jayasundara",
          date: formatDate(new Date(today.getTime() - 86400000 * 3)),
          totalBill: 7600.00,
          amount: 7600.00,
          balance: 0.00,
          stage: "Complete Payment",
          method: "Cash",
          ref: "CASH-REC-1048",
          note: "Full settlement paid upon delivery"
        },
        {
          paymentId: "PAY-INV-2026-002",
          orderId: "ORD-2026-1049",
          invoiceNo: "INV-2026-1049",
          customerName: "Dilhani Senaratne",
          date: formatDate(new Date(today.getTime() - 86400000 * 2)),
          totalBill: 8060.00,
          amount: 5000.00,
          balance: 3060.00,
          stage: "Advance Payment",
          method: "Card",
          ref: "VISA-AUTH-9921",
          cardLast4: "4821",
          note: "50% upfront advance paid on Visa Debit card"
        },
        {
          paymentId: "PAY-INV-2026-003",
          orderId: "ORD-2026-1050",
          invoiceNo: "INV-2026-1050",
          customerName: "Sajith Warnakula",
          date: formatDate(today),
          totalBill: 11000.00,
          amount: 0.00,
          balance: 11000.00,
          stage: "Pending Payment",
          method: "Check",
          ref: "CHQ-PENDING",
          note: "Cheque promised upon final delivery"
        },
        {
          paymentId: "PAY-INV-2026-004",
          orderId: "ORD-2026-1051",
          invoiceNo: "INV-2026-1051",
          customerName: "Nuwan Weerasinghe",
          date: formatDate(today),
          totalBill: 13000.00,
          amount: 6500.00,
          balance: 6500.00,
          stage: "Advance Payment",
          method: "Bank Transfer",
          ref: "BOC-TXN-881920",
          note: "Direct online transfer to Sanjeewa Advertising BOC account"
        }
      ];
      this.saveOrderPayments();
    }
  }

  seedDefaultGrnPayments() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    this.grnPayments = [
      {
        paymentId: "PAY-GRN-2026-001",
        grnId: "GRN-2610-001",
        grnNumber: "GRN-2610-001",
        poNumber: "PO-2026-088",
        supplierId: "SUP-001",
        supplierName: "PaperPro Lanka",
        stockCategory: "300gsm Art Board & Cyan Ink",
        date: formatDate(new Date(today.getTime() - 86400000 * 2)),
        totalBill: 87500.00,
        amount: 87500.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Check",
        ref: "CHQ-882019-COMBANK",
        checkNo: "882019",
        bankName: "Commercial Bank",
        note: "Account payee crossed cheque issued for full SRA3 board delivery"
      },
      {
        paymentId: "PAY-GRN-2026-002",
        grnId: "GRN-2610-002",
        grnNumber: "GRN-2610-002",
        poNumber: "PO-2026-074",
        supplierId: "SUP-003",
        supplierName: "MegaFlex Imports",
        stockCategory: "Flex Banner Heavy Star 380gsm",
        date: formatDate(new Date(today.getTime() - 86400000 * 1)),
        totalBill: 108000.00,
        amount: 50000.00,
        balance: 58000.00,
        stage: "Advance Payment",
        method: "Bank Transfer",
        ref: "HNB-FT-992011",
        bankName: "Hatton National Bank",
        note: "Initial advance transferred on container unloading. Balance on 30 days."
      },
      {
        paymentId: "PAY-GRN-2026-003",
        grnId: "GRN-2610-003",
        grnNumber: "GRN-2610-003",
        poNumber: "PO-2026-092",
        supplierId: "SUP-002",
        supplierName: "Flora Tech International",
        stockCategory: "Solvent Inks & Cleaning Solvents",
        date: formatDate(today),
        totalBill: 64000.00,
        amount: 0.00,
        balance: 64000.00,
        stage: "Pending Payment",
        method: "Check",
        ref: "DUE-14-DAYS",
        note: "Credit invoice received, payable within 14 days credit terms"
      },
      {
        paymentId: "PAY-GRN-2026-004",
        grnId: "GRN-2610-004",
        grnNumber: "GRN-2610-004",
        poNumber: "PO-2026-068",
        supplierId: "SUP-005",
        supplierName: "Star Media Group",
        stockCategory: "Foam Boards 5mm & Acrylic Sheets",
        date: formatDate(today),
        totalBill: 42000.00,
        amount: 42000.00,
        balance: 0.00,
        stage: "Complete Payment",
        method: "Cash",
        ref: "PETTY-CASH-402",
        note: "Cash on delivery paid from petty cash voucher"
      },
      {
        paymentId: "PAY-GRN-2026-005",
        grnId: "GRN-2610-005",
        grnNumber: "GRN-2610-005",
        poNumber: "PO-2026-095",
        supplierId: "SUP-004",
        supplierName: "Avery Dennison Lanka",
        stockCategory: "Vinyl Sticker Glossy Rolls",
        date: formatDate(today),
        totalBill: 96000.00,
        amount: 30000.00,
        balance: 66000.00,
        stage: "Advance Payment",
        method: "Card",
        ref: "CORP-CARD-8832",
        cardLast4: "8832",
        note: "Deposit paid using company credit card on order placement"
      }
    ];
    this.saveGrnPayments();
  }

  saveOrderPayments() {
    localStorage.setItem(this.storageKeys.orderPayments, JSON.stringify(this.orderPayments));
  }

  saveGrnPayments() {
    localStorage.setItem(this.storageKeys.grnPayments, JSON.stringify(this.grnPayments));
  }

  /* ==========================================================================
     Event Binding
     ========================================================================== */
  bindEvents() {
    // 1. Tab Switching
    document.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".pay-tab-btn");
      if (tabBtn) {
        e.preventDefault();
        const tab = tabBtn.getAttribute("data-tab");
        this.switchTab(tab);
        return;
      }

      // Open Record Payment Modal Button
      const openModalBtn = e.target.closest("#btnOpenRecordPayment, [data-open-pay-modal]");
      if (openModalBtn) {
        e.preventDefault();
        const prefillType = openModalBtn.getAttribute("data-pay-type") || this.activeTab;
        const prefillId = openModalBtn.getAttribute("data-pay-ref");
        this.openRecordPaymentModal(prefillType, prefillId);
        return;
      }

      // Close Modal Buttons
      const closeBtn = e.target.closest(".pay-modal-close, [data-close-pay-modal]");
      if (closeBtn) {
        e.preventDefault();
        this.closeModals();
        return;
      }

      // Method selector inside modal
      const methodChoice = e.target.closest(".method-choice");
      if (methodChoice) {
        e.preventDefault();
        document.querySelectorAll(".method-choice").forEach(c => c.classList.remove("selected"));
        methodChoice.classList.add("selected");
        this.selectedMethod = methodChoice.getAttribute("data-method");
        this.updateMethodFields();
        return;
      }

      // View Receipt from table
      const receiptBtn = e.target.closest("[data-view-receipt]");
      if (receiptBtn) {
        e.preventDefault();
        const payId = receiptBtn.getAttribute("data-view-receipt");
        const type = receiptBtn.getAttribute("data-type") || "invoice";
        this.openReceiptModal(payId, type);
        return;
      }

      // Print Receipt Button inside modal
      const printBtn = e.target.closest("#btnPrintReceipt");
      if (printBtn) {
        e.preventDefault();
        window.print();
        return;
      }
    });

    // 2. Filter Inputs
    // Invoice Filters
    const invSearch = document.getElementById("payInvoiceSearch");
    if (invSearch) {
      invSearch.addEventListener("input", (e) => {
        this.invoiceSearch = e.target.value.toLowerCase().trim();
        this.renderInvoiceTable();
      });
    }

    const invStatus = document.getElementById("payInvoiceStatusFilter");
    if (invStatus) {
      invStatus.addEventListener("change", (e) => {
        this.invoiceStatusFilter = e.target.value;
        this.renderInvoiceTable();
      });
    }

    const invMethod = document.getElementById("payInvoiceMethodFilter");
    if (invMethod) {
      invMethod.addEventListener("change", (e) => {
        this.invoiceMethodFilter = e.target.value;
        this.renderInvoiceTable();
      });
    }

    const invReset = document.getElementById("payInvoiceResetFilters");
    if (invReset) {
      invReset.addEventListener("click", () => {
        this.invoiceSearch = "";
        this.invoiceStatusFilter = "ALL";
        this.invoiceMethodFilter = "ALL";
        if (invSearch) invSearch.value = "";
        if (invStatus) invStatus.value = "ALL";
        if (invMethod) invMethod.value = "ALL";
        this.renderInvoiceTable();
      });
    }

    // GRN Filters
    const grnSearch = document.getElementById("payGrnSearch");
    if (grnSearch) {
      grnSearch.addEventListener("input", (e) => {
        this.grnSearch = e.target.value.toLowerCase().trim();
        this.renderGrnTable();
      });
    }

    const grnStatus = document.getElementById("payGrnStatusFilter");
    if (grnStatus) {
      grnStatus.addEventListener("change", (e) => {
        this.grnStatusFilter = e.target.value;
        this.renderGrnTable();
      });
    }

    const grnMethod = document.getElementById("payGrnMethodFilter");
    if (grnMethod) {
      grnMethod.addEventListener("change", (e) => {
        this.grnMethodFilter = e.target.value;
        this.renderGrnTable();
      });
    }

    const grnReset = document.getElementById("payGrnResetFilters");
    if (grnReset) {
      grnReset.addEventListener("click", () => {
        this.grnSearch = "";
        this.grnStatusFilter = "ALL";
        this.grnMethodFilter = "ALL";
        if (grnSearch) grnSearch.value = "";
        if (grnStatus) grnStatus.value = "ALL";
        if (grnMethod) grnMethod.value = "ALL";
        this.renderGrnTable();
      });
    }

    // Modal Type Radio Toggle (Invoice vs GRN)
    const typeRadios = document.querySelectorAll('input[name="modalPayType"]');
    typeRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.modalType = e.target.value;
        this.updateModalReferenceDropdown();
      });
    });

    // Reference Select Change (Calculate balance)
    const refSelect = document.getElementById("modalPayRefSelect");
    if (refSelect) {
      refSelect.addEventListener("change", () => {
        this.onReferenceSelected();
      });
    }

    // Amount Input (Auto calculate status)
    const amountInput = document.getElementById("modalPayAmount");
    if (amountInput) {
      amountInput.addEventListener("input", () => {
        this.onAmountChanged();
      });
    }

    // Save Payment Form Submit
    const savePaymentBtn = document.getElementById("btnSaveNewPayment");
    if (savePaymentBtn) {
      savePaymentBtn.addEventListener("click", () => {
        this.savePayment();
      });
    }
  }

  /* ==========================================================================
     Tab Navigation
     ========================================================================== */
  switchTab(tab) {
    this.activeTab = (tab === "grn" || tab === "grn-payment") ? "grn" : ((tab === "overview") ? "overview" : "invoice");

    // Update buttons
    document.querySelectorAll(".pay-tab-btn").forEach(btn => {
      const btnTab = btn.getAttribute("data-tab");
      btn.classList.toggle("active", btnTab === this.activeTab);
    });

    // Update Tab View Panes
    const invPane = document.getElementById("payTabPaneInvoice");
    const grnPane = document.getElementById("payTabPaneGrn");
    const ovPane = document.getElementById("payTabPaneOverview");

    if (invPane) invPane.style.display = (this.activeTab === "invoice") ? "block" : "none";
    if (grnPane) grnPane.style.display = (this.activeTab === "grn") ? "block" : "none";
    if (ovPane) ovPane.style.display = (this.activeTab === "overview") ? "block" : "none";

    // Update sidebar active sublink if present
    if (window.sidebarComponent) {
      window.sidebarComponent.setActiveRoute("payments", (this.activeTab === "invoice" ? "invoice-payment" : (this.activeTab === "grn" ? "grn-payment" : null)));
    }

    this.render();
  }

  /* ==========================================================================
     Rendering Views & KPIs
     ========================================================================== */
  render() {
    this.updateKPIs();
    this.renderInvoiceTable();
    this.renderGrnTable();
    this.renderOverviewTab();
  }

  updateKPIs() {
    // 1. Invoice Payments Stats
    const totalInvBilled = this.orderPayments.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalInvCollected = this.orderPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalInvPending = this.orderPayments.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const invCompleteCount = this.orderPayments.filter(p => p.stage === "Complete Payment").length;
    const invAdvanceCount = this.orderPayments.filter(p => p.stage === "Advance Payment").length;
    const invPendingCount = this.orderPayments.filter(p => p.stage === "Pending Payment").length;

    const kpiInvBilled = document.getElementById("kpiInvTotalBilled");
    const kpiInvCollected = document.getElementById("kpiInvTotalCollected");
    const kpiInvPending = document.getElementById("kpiInvTotalPending");
    const kpiInvCounts = document.getElementById("kpiInvStageCounts");

    if (kpiInvBilled) kpiInvBilled.textContent = `Rs. ${totalInvBilled.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiInvCollected) kpiInvCollected.textContent = `Rs. ${totalInvCollected.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiInvPending) kpiInvPending.textContent = `Rs. ${totalInvPending.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiInvCounts) kpiInvCounts.innerHTML = `<strong>${invCompleteCount}</strong> Complete | <strong>${invAdvanceCount}</strong> Advance | <strong>${invPendingCount}</strong> Pending`;

    // Invoice Methods Breakdown
    const invCard = this.orderPayments.filter(p => p.method === "Card").reduce((a, p) => a + Number(p.amount), 0);
    const invCash = this.orderPayments.filter(p => p.method === "Cash").reduce((a, p) => a + Number(p.amount), 0);
    const invCheck = this.orderPayments.filter(p => p.method === "Check").reduce((a, p) => a + Number(p.amount), 0);
    const invTransfer = this.orderPayments.filter(p => p.method === "Bank Transfer").reduce((a, p) => a + Number(p.amount), 0);

    const elInvCard = document.getElementById("invMethodCardTotal");
    const elInvCash = document.getElementById("invMethodCashTotal");
    const elInvCheck = document.getElementById("invMethodCheckTotal");
    const elInvTransfer = document.getElementById("invMethodTransferTotal");

    if (elInvCard) elInvCard.textContent = `Rs. ${invCard.toLocaleString()}`;
    if (elInvCash) elInvCash.textContent = `Rs. ${invCash.toLocaleString()}`;
    if (elInvCheck) elInvCheck.textContent = `Rs. ${invCheck.toLocaleString()}`;
    if (elInvTransfer) elInvTransfer.textContent = `Rs. ${invTransfer.toLocaleString()}`;

    // 2. GRN Payments Stats
    const totalGrnBilled = this.grnPayments.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalGrnPaid = this.grnPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalGrnDue = this.grnPayments.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const grnCompleteCount = this.grnPayments.filter(p => p.stage === "Complete Payment").length;
    const grnAdvanceCount = this.grnPayments.filter(p => p.stage === "Advance Payment").length;
    const grnPendingCount = this.grnPayments.filter(p => p.stage === "Pending Payment").length;

    const kpiGrnBilled = document.getElementById("kpiGrnTotalBilled");
    const kpiGrnPaid = document.getElementById("kpiGrnTotalPaid");
    const kpiGrnDue = document.getElementById("kpiGrnTotalDue");
    const kpiGrnCounts = document.getElementById("kpiGrnStageCounts");

    if (kpiGrnBilled) kpiGrnBilled.textContent = `Rs. ${totalGrnBilled.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiGrnPaid) kpiGrnPaid.textContent = `Rs. ${totalGrnPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiGrnDue) kpiGrnDue.textContent = `Rs. ${totalGrnDue.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (kpiGrnCounts) kpiGrnCounts.innerHTML = `<strong>${grnCompleteCount}</strong> Complete | <strong>${grnAdvanceCount}</strong> Advance | <strong>${grnPendingCount}</strong> Pending`;

    // GRN Methods Breakdown
    const grnCard = this.grnPayments.filter(p => p.method === "Card").reduce((a, p) => a + Number(p.amount), 0);
    const grnCash = this.grnPayments.filter(p => p.method === "Cash").reduce((a, p) => a + Number(p.amount), 0);
    const grnCheck = this.grnPayments.filter(p => p.method === "Check").reduce((a, p) => a + Number(p.amount), 0);
    const grnTransfer = this.grnPayments.filter(p => p.method === "Bank Transfer").reduce((a, p) => a + Number(p.amount), 0);

    const elGrnCard = document.getElementById("grnMethodCardTotal");
    const elGrnCash = document.getElementById("grnMethodCashTotal");
    const elGrnCheck = document.getElementById("grnMethodCheckTotal");
    const elGrnTransfer = document.getElementById("grnMethodTransferTotal");

    if (elGrnCard) elGrnCard.textContent = `Rs. ${grnCard.toLocaleString()}`;
    if (elGrnCash) elGrnCash.textContent = `Rs. ${grnCash.toLocaleString()}`;
    if (elGrnCheck) elGrnCheck.textContent = `Rs. ${grnCheck.toLocaleString()}`;
    if (elGrnTransfer) elGrnTransfer.textContent = `Rs. ${grnTransfer.toLocaleString()}`;

    // Update Tab count badges
    const tabInvCount = document.getElementById("tabBadgeInvoiceCount");
    const tabGrnCount = document.getElementById("tabBadgeGrnCount");
    if (tabInvCount) tabInvCount.textContent = this.orderPayments.length;
    if (tabGrnCount) tabGrnCount.textContent = this.grnPayments.length;
  }

  /* ==========================================================================
     Invoice Payments Table
     ========================================================================== */
  renderInvoiceTable() {
    const tbody = document.getElementById("payInvoiceTableBody");
    if (!tbody) return;

    let filtered = this.orderPayments.filter(p => {
      // Search filter
      const matchesSearch = !this.invoiceSearch ||
        (p.invoiceNo && p.invoiceNo.toLowerCase().includes(this.invoiceSearch)) ||
        (p.orderId && p.orderId.toLowerCase().includes(this.invoiceSearch)) ||
        (p.customerName && p.customerName.toLowerCase().includes(this.invoiceSearch)) ||
        (p.ref && p.ref.toLowerCase().includes(this.invoiceSearch));

      // Status filter
      const matchesStatus = this.invoiceStatusFilter === "ALL" || p.stage === this.invoiceStatusFilter;

      // Method filter
      const matchesMethod = this.invoiceMethodFilter === "ALL" || p.method === this.invoiceMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-receipt" style="font-size: 28px; opacity: 0.4; margin-bottom: 8px; display: block;"></i>
            No Invoice Payments match your filter criteria.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const stagePill = this.renderStageBadge(p.stage);
      const methodPill = this.renderMethodBadge(p.method, p.ref);

      return `
        <tr>
          <td>
            <strong style="color: var(--blue);">${p.invoiceNo || p.orderId}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${p.date}</div>
          </td>
          <td>
            <strong>${p.customerName || "Customer"}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">Ref: ${p.orderId}</div>
          </td>
          <td>${stagePill}</td>
          <td>${methodPill}</td>
          <td style="font-weight: 700;">Rs. ${(Number(p.totalBill) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 800; color: #10b981;">Rs. ${(Number(p.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 700; color: ${(Number(p.balance) || 0) > 0 ? '#ef4444' : 'var(--text-muted)'};">
            Rs. ${(Number(p.balance) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </td>
          <td>
            <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${p.note || ''}">
              ${p.note || '-'}
            </span>
          </td>
          <td>
            <div class="pay-table-actions">
              <button type="button" class="pay-btn-sm" data-view-receipt="${p.paymentId}" data-type="invoice" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${p.balance > 0 ? `
              <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${p.orderId}" title="Record settlement installment">
                <i class="fa-solid fa-plus"></i> Pay
              </button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join("");
  }

  /* ==========================================================================
     GRN Payments Table
     ========================================================================== */
  renderGrnTable() {
    const tbody = document.getElementById("payGrnTableBody");
    if (!tbody) return;

    let filtered = this.grnPayments.filter(p => {
      // Search filter
      const matchesSearch = !this.grnSearch ||
        (p.grnNumber && p.grnNumber.toLowerCase().includes(this.grnSearch)) ||
        (p.poNumber && p.poNumber.toLowerCase().includes(this.grnSearch)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(this.grnSearch)) ||
        (p.ref && p.ref.toLowerCase().includes(this.grnSearch));

      // Status filter
      const matchesStatus = this.grnStatusFilter === "ALL" || p.stage === this.grnStatusFilter;

      // Method filter
      const matchesMethod = this.grnMethodFilter === "ALL" || p.method === this.grnMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-truck-ramp-box" style="font-size: 28px; opacity: 0.4; margin-bottom: 8px; display: block;"></i>
            No GRN Stock Payments match your filter criteria.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const stagePill = this.renderStageBadge(p.stage);
      const methodPill = this.renderMethodBadge(p.method, p.ref);

      return `
        <tr>
          <td>
            <strong style="color: #10b981;">${p.grnNumber}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">PO: ${p.poNumber || '-'}</div>
          </td>
          <td>
            <strong>${p.supplierName || "Supplier"}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${p.stockCategory || "Stock Delivery"}</div>
          </td>
          <td>${stagePill}</td>
          <td>${methodPill}</td>
          <td style="font-weight: 700;">Rs. ${(Number(p.totalBill) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 800; color: #10b981;">Rs. ${(Number(p.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
          <td style="font-weight: 700; color: ${(Number(p.balance) || 0) > 0 ? '#ef4444' : 'var(--text-muted)'};">
            Rs. ${(Number(p.balance) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
          </td>
          <td>
            <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${p.note || ''}">
              ${p.note || '-'}
            </span>
          </td>
          <td>
            <div class="pay-table-actions">
              <button type="button" class="pay-btn-sm" data-view-receipt="${p.paymentId}" data-type="grn" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${p.balance > 0 ? `
              <button type="button" class="pay-btn-sm green-sm" data-open-pay-modal data-pay-type="grn" data-pay-ref="${p.grnId}" title="Pay supplier installment">
                <i class="fa-solid fa-money-bill-wave"></i> Pay
              </button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join("");
  }

  /* ==========================================================================
     Overview Tab: Dual Financial Reconciliation
     ========================================================================== */
  renderOverviewTab() {
    const totalJobInvoiced = this.orderPayments.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalJobCollected = this.orderPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalJobReceivable = this.orderPayments.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const totalGrnBilled = this.grnPayments.reduce((acc, p) => acc + (Number(p.totalBill) || 0), 0);
    const totalGrnPaid = this.grnPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalGrnPayable = this.grnPayments.reduce((acc, p) => acc + (Number(p.balance) || 0), 0);

    const netOperatingCash = totalJobCollected - totalGrnPaid;

    const elNetCash = document.getElementById("ovNetOperatingCash");
    const elJobInflow = document.getElementById("ovJobCashInflow");
    const elGrnOutflow = document.getElementById("ovGrnCashOutflow");
    const elReceivables = document.getElementById("ovReceivablesTotal");
    const elPayables = document.getElementById("ovPayablesTotal");

    if (elNetCash) {
      elNetCash.textContent = `Rs. ${netOperatingCash.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
      elNetCash.style.color = netOperatingCash >= 0 ? '#10b981' : '#ef4444';
    }
    if (elJobInflow) elJobInflow.textContent = `Rs. ${totalJobCollected.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (elGrnOutflow) elGrnOutflow.textContent = `Rs. ${totalGrnPaid.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (elReceivables) elReceivables.textContent = `Rs. ${totalJobReceivable.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
    if (elPayables) elPayables.textContent = `Rs. ${totalGrnPayable.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  }

  /* ==========================================================================
     Helper Badges
     ========================================================================== */
  renderStageBadge(stage) {
    if (stage === "Complete Payment") {
      return `<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`;
    } else if (stage === "Advance Payment") {
      return `<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>`;
    } else {
      return `<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>`;
    }
  }

  renderMethodBadge(method, ref = "") {
    if (method === "Card") {
      return `<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
    } else if (method === "Cash") {
      return `<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`;
    } else if (method === "Check") {
      return `<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Check</span>`;
    } else {
      return `<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`;
    }
  }

  /* ==========================================================================
     Modal Actions: Record New Payment
     ========================================================================== */
  openRecordPaymentModal(prefillType = "invoice", prefillId = null) {
    const modal = document.getElementById("recordPaymentModal");
    if (!modal) return;

    this.modalType = (prefillType === "grn" || prefillType === "grn-payment") ? "grn" : "invoice";

    // Set Radio
    const radInvoice = document.getElementById("modalRadioInvoice");
    const radGrn = document.getElementById("modalRadioGrn");
    if (radInvoice) radInvoice.checked = (this.modalType === "invoice");
    if (radGrn) radGrn.checked = (this.modalType === "grn");

    // Highlight Type selector card
    document.querySelectorAll(".pay-type-option").forEach(opt => {
      const isInvoice = opt.classList.contains("invoice-option");
      opt.classList.toggle("selected", (this.modalType === "invoice" && isInvoice) || (this.modalType === "grn" && !isInvoice));
    });

    // Populate Reference Dropdown
    this.updateModalReferenceDropdown(prefillId);

    // Set default method
    this.selectedMethod = "Cash";
    document.querySelectorAll(".method-choice").forEach(c => {
      c.classList.toggle("selected", c.getAttribute("data-method") === "Cash");
    });
    this.updateMethodFields();

    // Set date to today
    const dateInput = document.getElementById("modalPayDate");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    // Reset notes
    const noteInput = document.getElementById("modalPayNotes");
    if (noteInput) noteInput.value = "";

    modal.classList.add("open");
  }

  updateModalReferenceDropdown(prefillId = null) {
    const select = document.getElementById("modalPayRefSelect");
    const label = document.getElementById("modalPayRefLabel");
    if (!select) return;

    if (this.modalType === "invoice") {
      if (label) label.textContent = "Select Customer Job / Invoice";
      // Options from orders
      let options = `<option value="">-- Choose Job / Invoice --</option>`;
      this.orders.forEach(o => {
        const bal = (Number(o.balanceAmount) || 0);
        options += `<option value="${o.id}" data-total="${o.totalAmount}" data-paid="${o.paidAmount}" data-balance="${bal}" data-party="${o.customerName}" ${prefillId === o.id ? 'selected' : ''}>
          ${o.id} - ${o.customerName} (Bal: Rs. ${bal.toLocaleString()})
        </option>`;
      });
      // Also allow selecting from orderPayments if order not in list
      this.orderPayments.forEach(p => {
        if (!this.orders.some(o => o.id === p.orderId)) {
          options += `<option value="${p.orderId}" data-total="${p.totalBill}" data-paid="${p.amount}" data-balance="${p.balance}" data-party="${p.customerName}" ${prefillId === p.orderId ? 'selected' : ''}>
            ${p.orderId} - ${p.customerName} (Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()})
          </option>`;
        }
      });
      select.innerHTML = options;
    } else {
      if (label) label.textContent = "Select Supplier GRN / Stock Acquisition";
      let options = `<option value="">-- Choose GRN Stock Bill --</option>`;
      this.grnRecords.forEach(g => {
        const matchingPay = this.grnPayments.find(p => p.grnId === g.grn_id);
        const total = g.net_total || g.sub_total || 50000;
        const paid = matchingPay ? matchingPay.amount : 0;
        const bal = matchingPay ? matchingPay.balance : total;
        options += `<option value="${g.grn_id}" data-total="${total}" data-paid="${paid}" data-balance="${bal}" data-party="${g.supplier_name}" ${prefillId === g.grn_id ? 'selected' : ''}>
          ${g.grn_number} - ${g.supplier_name} (Bal: Rs. ${bal.toLocaleString()})
        </option>`;
      });
      // Also allow from grnPayments
      this.grnPayments.forEach(p => {
        if (!this.grnRecords.some(g => g.grn_id === p.grnId)) {
          options += `<option value="${p.grnId}" data-total="${p.totalBill}" data-paid="${p.amount}" data-balance="${p.balance}" data-party="${p.supplierName}" ${prefillId === p.grnId ? 'selected' : ''}>
            ${p.grnNumber} - ${p.supplierName} (Bal: Rs. ${(Number(p.balance) || 0).toLocaleString()})
          </option>`;
        }
      });
      select.innerHTML = options;
    }

    this.onReferenceSelected();
  }

  onReferenceSelected() {
    const select = document.getElementById("modalPayRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;

    const elTotal = document.getElementById("modalBalTotal");
    const elPaid = document.getElementById("modalBalPaid");
    const elBal = document.getElementById("modalBalRemaining");
    const amountInput = document.getElementById("modalPayAmount");

    if (selectedOpt && selectedOpt.value) {
      const total = Number(selectedOpt.getAttribute("data-total")) || 0;
      const paid = Number(selectedOpt.getAttribute("data-paid")) || 0;
      const balance = Number(selectedOpt.getAttribute("data-balance")) || 0;

      if (elTotal) elTotal.textContent = `Rs. ${total.toLocaleString()}`;
      if (elPaid) elPaid.textContent = `Rs. ${paid.toLocaleString()}`;
      if (elBal) elBal.textContent = `Rs. ${balance.toLocaleString()}`;

      if (amountInput) {
        amountInput.value = balance > 0 ? balance : total;
      }
    } else {
      if (elTotal) elTotal.textContent = "Rs. 0";
      if (elPaid) elPaid.textContent = "Rs. 0";
      if (elBal) elBal.textContent = "Rs. 0";
      if (amountInput) amountInput.value = "";
    }

    this.onAmountChanged();
  }

  onAmountChanged() {
    const select = document.getElementById("modalPayRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;
    const amountInput = document.getElementById("modalPayAmount");
    const stageSelect = document.getElementById("modalPayStageSelect");

    const amount = Number(amountInput ? amountInput.value : 0) || 0;
    const balance = selectedOpt ? (Number(selectedOpt.getAttribute("data-balance")) || 0) : 0;

    if (stageSelect) {
      if (amount <= 0) {
        stageSelect.value = "Pending Payment";
      } else if (amount >= balance) {
        stageSelect.value = "Complete Payment";
      } else {
        stageSelect.value = "Advance Payment";
      }
    }
  }

  updateMethodFields() {
    const detailsContainer = document.getElementById("modalMethodSpecificFields");
    if (!detailsContainer) return;

    if (this.selectedMethod === "Card") {
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Card Brand / Type</label>
            <select id="modalCardType" class="pay-select-field">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
            </select>
          </div>
          <div class="pay-field">
            <label class="pay-label">Card Last 4 Digits</label>
            <input type="text" id="modalCardLast4" class="pay-input" placeholder="E.g. 4821" maxlength="4">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Auth / Approval Code</label>
          <input type="text" id="modalCardAuth" class="pay-input" placeholder="POS terminal approval code">
        </div>`;
    } else if (this.selectedMethod === "Check") {
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cheque Number *</label>
            <input type="text" id="modalCheckNo" class="pay-input" placeholder="E.g. 882019" required>
          </div>
          <div class="pay-field">
            <label class="pay-label">Bank & Branch</label>
            <input type="text" id="modalCheckBank" class="pay-input" placeholder="Commercial Bank / HNB">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Cheque Date</label>
          <input type="date" id="modalCheckDate" class="pay-input" value="${new Date().toISOString().split("T")[0]}">
        </div>`;
    } else if (this.selectedMethod === "Bank Transfer") {
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Bank Name</label>
            <input type="text" id="modalTransferBank" class="pay-input" placeholder="BOC / Sampath / Commercial">
          </div>
          <div class="pay-field">
            <label class="pay-label">Transfer / Slip Reference *</label>
            <input type="text" id="modalTransferRef" class="pay-input" placeholder="Online transaction ref #">
          </div>
        </div>`;
    } else {
      // Cash
      detailsContainer.innerHTML = `
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cash Tendered (Rs.)</label>
            <input type="number" id="modalCashTendered" class="pay-input" placeholder="Amount given by customer/petty cash">
          </div>
          <div class="pay-field">
            <label class="pay-label">Cash Receipt No</label>
            <input type="text" id="modalCashReceipt" class="pay-input" value="REC-${Math.floor(1000 + Math.random() * 9000)}">
          </div>
        </div>`;
    }
  }

  savePayment() {
    const select = document.getElementById("modalPayRefSelect");
    const selectedOpt = select ? select.options[select.selectedIndex] : null;
    if (!selectedOpt || !selectedOpt.value) {
      alert("Please select an Order/Invoice or GRN bill to record payment.");
      return;
    }

    const refId = selectedOpt.value;
    const partyName = selectedOpt.getAttribute("data-party") || "Party";
    const totalBill = Number(selectedOpt.getAttribute("data-total")) || 0;
    const oldBalance = Number(selectedOpt.getAttribute("data-balance")) || 0;

    const amountInput = document.getElementById("modalPayAmount");
    const amount = Number(amountInput ? amountInput.value : 0);

    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const stageSelect = document.getElementById("modalPayStageSelect");
    const stage = stageSelect ? stageSelect.value : "Complete Payment";

    const dateInput = document.getElementById("modalPayDate");
    const payDate = dateInput ? dateInput.value : new Date().toISOString().split("T")[0];

    const noteInput = document.getElementById("modalPayNotes");
    const notes = noteInput ? noteInput.value.trim() : "";

    // Generate reference code based on method
    let refCode = "";
    if (this.selectedMethod === "Card") {
      const last4 = document.getElementById("modalCardLast4")?.value || "XXXX";
      const auth = document.getElementById("modalCardAuth")?.value || "AUTH";
      refCode = `CARD-${last4}-${auth}`;
    } else if (this.selectedMethod === "Check") {
      const chq = document.getElementById("modalCheckNo")?.value || "CHQ";
      const bank = document.getElementById("modalCheckBank")?.value || "BANK";
      refCode = `CHQ-${chq}-${bank}`;
    } else if (this.selectedMethod === "Bank Transfer") {
      const trRef = document.getElementById("modalTransferRef")?.value || "TXN";
      refCode = `BANK-TXN-${trRef}`;
    } else {
      refCode = document.getElementById("modalCashReceipt")?.value || `CASH-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newBalance = Math.max(0, oldBalance - amount);

    if (this.modalType === "invoice") {
      const newPayId = `PAY-INV-${Date.now().toString().slice(-6)}`;
      const newPayment = {
        paymentId: newPayId,
        orderId: refId,
        invoiceNo: `INV-${refId}`,
        customerName: partyName,
        date: payDate,
        totalBill: totalBill,
        amount: amount,
        balance: newBalance,
        stage: stage,
        method: this.selectedMethod,
        ref: refCode,
        note: notes
      };

      this.orderPayments.unshift(newPayment);
      this.saveOrderPayments();

      // Update Order balance in sa_advertising_orders
      const order = this.orders.find(o => o.id === refId);
      if (order) {
        order.paidAmount = (Number(order.paidAmount) || 0) + amount;
        order.balanceAmount = newBalance;
        order.paymentStatus = (newBalance <= 0) ? "Paid" : (order.paidAmount > 0 ? "Partially Paid" : "Unpaid");
        localStorage.setItem(this.storageKeys.orders, JSON.stringify(this.orders));
      }

      this.closeModals();
      this.render();
      this.showToast(`Invoice Payment of Rs. ${amount.toLocaleString()} recorded successfully!`);
      this.openReceiptModal(newPayId, "invoice");
    } else {
      const newPayId = `PAY-GRN-${Date.now().toString().slice(-6)}`;
      const newPayment = {
        paymentId: newPayId,
        grnId: refId,
        grnNumber: refId,
        poNumber: "PO-" + refId.replace("GRN-", ""),
        supplierId: "SUP-001",
        supplierName: partyName,
        stockCategory: "Stock Items Received",
        date: payDate,
        totalBill: totalBill,
        amount: amount,
        balance: newBalance,
        stage: stage,
        method: this.selectedMethod,
        ref: refCode,
        note: notes
      };

      this.grnPayments.unshift(newPayment);
      this.saveGrnPayments();

      this.closeModals();
      this.render();
      this.showToast(`GRN Supplier Payment of Rs. ${amount.toLocaleString()} recorded successfully!`);
      this.openReceiptModal(newPayId, "grn");
    }
  }

  /* ==========================================================================
     Printable Receipt / Voucher Modal
     ========================================================================== */
  openReceiptModal(paymentId, type = "invoice") {
    const modal = document.getElementById("printableReceiptModal");
    const container = document.getElementById("receiptPrintContainer");
    if (!modal || !container) return;

    let item = null;
    let isInvoice = (type === "invoice");

    if (isInvoice) {
      item = this.orderPayments.find(p => p.paymentId === paymentId);
    } else {
      item = this.grnPayments.find(p => p.paymentId === paymentId);
    }

    if (!item) return;

    container.innerHTML = `
      <div class="receipt-printable-card">
        <div class="receipt-header">
          <h4>SANJEEWA ADVERTISING</h4>
          <p>Digital Large Format Printing & Advertising Solutions</p>
          <p style="font-size: 10px; color: #64748b;">No. 128 Main Street, Colombo | Tel: 011 234 5678 | Email: billing@sanjeewa.lk</p>
          <div style="margin-top: 8px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: ${isInvoice ? '#2563eb' : '#059669'};">
            ${isInvoice ? 'INVOICE PAYMENT RECEIPT (JOB SETTLEMENT)' : 'GRN SUPPLIER PAYMENT VOUCHER (STOCK PURCHASE)'}
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div><strong>Voucher No:</strong> ${item.paymentId}</div>
          <div><strong>Date:</strong> ${item.date}</div>
          <div><strong>${isInvoice ? 'Customer Name:' : 'Supplier Name:'}</strong> ${isInvoice ? item.customerName : item.supplierName}</div>
          <div><strong>Reference:</strong> ${isInvoice ? (item.invoiceNo || item.orderId) : item.grnNumber}</div>
          <div><strong>Payment Stage:</strong> <span style="font-weight: 700;">${item.stage}</span></div>
          <div><strong>Payment Method:</strong> <span style="font-weight: 700;">${item.method} (${item.ref || 'Direct'})</span></div>
        </div>

        <div class="receipt-totals">
          <div class="receipt-row">
            <span>Total Bill Value:</span>
            <span>Rs. ${(Number(item.totalBill) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-row grand-total">
            <span>Amount Paid This Transaction:</span>
            <span style="color: #059669;">Rs. ${(Number(item.amount) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-row">
            <span>Remaining Balance Due:</span>
            <span style="color: ${(Number(item.balance) || 0) > 0 ? '#ef4444' : '#64748b'};">
              Rs. ${(Number(item.balance) || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        ${item.note ? `
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
          <strong>Narration:</strong> ${item.note}
        </div>` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; text-align: center; font-size: 11px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            Authorized Cashier / Officer
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            ${isInvoice ? 'Customer Signature' : 'Supplier Acknowledgment'}
          </div>
        </div>
      </div>`;

    modal.classList.add("open");
  }

  closeModals() {
    document.querySelectorAll(".pay-modal-backdrop").forEach(m => m.classList.remove("open"));
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "po-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: payToastIn 0.25s ease;
    `;
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 16px;"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Global initialization
if (typeof window !== "undefined") {
  window.PaymentsManager = PaymentsManager;
  document.addEventListener("DOMContentLoaded", () => {
    window.paymentsManager = new PaymentsManager();
  });
}
