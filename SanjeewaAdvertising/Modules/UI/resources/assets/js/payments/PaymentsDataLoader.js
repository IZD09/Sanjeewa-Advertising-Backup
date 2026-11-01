/**
 * SanjeewaAdvertising - Payments Data Loader
 *
 * Handles storage keys, data persistence, default seeding for
 * Invoice payments and GRN supplier payments.
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class PaymentsDataLoader {
  constructor() {
    this.http = new RequestHandler();
    this.storageKeys = {
      orders: "sa_advertising_orders",
      orderPayments: "sa_advertising_payments",
      grnRecords: "sa_advertising_grn_records",
      grnPayments: "sa_advertising_grn_payments"
    };

    this.orders = [];
    this.orderPayments = [];
    this.grnRecords = [];
    this.grnPayments = [];
  }

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

    return {
      orders: this.orders,
      orderPayments: this.orderPayments,
      grnRecords: this.grnRecords,
      grnPayments: this.grnPayments
    };
  }

  enrichOrderPayments() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

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

  saveOrders(orders) {
    this.orders = orders;
    localStorage.setItem(this.storageKeys.orders, JSON.stringify(this.orders));
  }

  formatCurrency(amount) {
    return `Rs. ${(parseFloat(amount) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

