/**
 * SanjeewaAdvertising - Payments Data Loader
 *
 * Handles storage keys, data persistence, default seeding for
 * 1. Invoice payments (Customer print orders)
 * 2. GRN supplier payments (Stock acquisitions)
 * 3. Operating expenses (Monthly utility & overhead bills)
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class PaymentsDataLoader {
  constructor() {
    this.http = new RequestHandler();
    this.storageKeys = {
      orders: "sa_advertising_orders",
      orderPayments: "sa_advertising_payments",
      grnRecords: "sa_advertising_grn_records",
      grnPayments: "sa_advertising_grn_payments",
      operatingExpenses: "sa_advertising_operating_expenses"
    };

    this.orders = [];
    this.orderPayments = [];
    this.grnRecords = [];
    this.grnPayments = [];
    this.expenses = [];
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

    if (!this.orders || this.orders.length === 0) {
      this.seedDefaultOrders();
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

    // 3. Load Operating Expenses (Monthly Overhead Bills)
    const savedExpenses = localStorage.getItem(this.storageKeys.operatingExpenses);
    if (savedExpenses) {
      try {
        this.expenses = JSON.parse(savedExpenses);
      } catch (e) {
        console.error("Could not parse saved operating expenses", e);
      }
    } else {
      this.seedDefaultOperatingExpenses();
    }

    // Ensure initial rich sample data if empty
    this.enrichOrderPayments();

    return {
      orders: this.orders,
      orderPayments: this.orderPayments,
      grnRecords: this.grnRecords,
      grnPayments: this.grnPayments,
      expenses: this.expenses
    };
  }

  seedDefaultOrders() {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];

    this.orders = [
      {
        id: "ORD-2026-1048",
        orderDate: formatDate(new Date(today.getTime() - 86400000 * 3)),
        customerId: "CUST-001",
        customerName: "Kasun Jayasundara",
        customerMobile: "0771234567",
        productKey: "flex_normal",
        productName: "Flex Banner (Normal 280gsm)",
        totalAmount: 7600.00,
        paidAmount: 7600.00,
        balanceAmount: 0.00,
        paymentStatus: "Paid"
      },
      {
        id: "ORD-2026-1049",
        orderDate: formatDate(new Date(today.getTime() - 86400000 * 2)),
        customerId: "CUST-002",
        customerName: "Dilhani Senaratne",
        customerMobile: "0719876543",
        productKey: "sticker_glossy",
        productName: "Vinyl Sticker (Glossy)",
        totalAmount: 8060.00,
        paidAmount: 5000.00,
        balanceAmount: 3060.00,
        paymentStatus: "Partial"
      },
      {
        id: "ORD-2026-1050",
        orderDate: formatDate(today),
        customerId: "CUST-003",
        customerName: "Sajith Warnakula",
        customerMobile: "0755554433",
        productKey: "rollup_banner",
        productName: "Rollup Banner Display",
        totalAmount: 11000.00,
        paidAmount: 0.00,
        balanceAmount: 11000.00,
        paymentStatus: "Pending"
      },
      {
        id: "ORD-2026-1051",
        orderDate: formatDate(today),
        customerId: "CUST-004",
        customerName: "Nuwan Weerasinghe",
        customerMobile: "0721112233",
        productKey: "foam_board",
        productName: "Foam Board Signage (5mm)",
        totalAmount: 13000.00,
        paidAmount: 6500.00,
        balanceAmount: 6500.00,
        paymentStatus: "Partial"
      },
      {
        id: "ORD-2026-1052",
        orderDate: formatDate(new Date(today.getTime() - 86400000 * 1)),
        customerId: "CUST-001",
        customerName: "Kasun Jayasundara",
        customerMobile: "0771234567",
        productKey: "business_card_lux",
        productName: "Business Cards (Spot UV 500 pcs)",
        totalAmount: 11000.00,
        paidAmount: 0.00,
        balanceAmount: 11000.00,
        paymentStatus: "Pending"
      },
      {
        id: "ORD-2026-1053",
        orderDate: formatDate(today),
        customerId: "CUST-001",
        customerName: "Kasun Jayasundara",
        customerMobile: "0771234567",
        productKey: "backlit_film",
        productName: "Lightbox Backlit Film (8x3 ft)",
        totalAmount: 5760.00,
        paidAmount: 0.00,
        balanceAmount: 5760.00,
        paymentStatus: "Pending"
      },
      {
        id: "ORD-2026-1054",
        orderDate: formatDate(today),
        customerId: "CUST-002",
        customerName: "Dilhani Senaratne",
        customerMobile: "0719876543",
        productKey: "flyer_a5",
        productName: "Flyers / Leaflets (A5 1000 pcs)",
        totalAmount: 15000.00,
        paidAmount: 0.00,
        balanceAmount: 15000.00,
        paymentStatus: "Pending"
      }
    ];
    this.saveOrders(this.orders);
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

  seedDefaultOperatingExpenses() {
    this.expenses = [
      {
        id: "EXP-2026-10-001",
        title: "CEB Heavy Power (3-Phase Workshop & HP Scitex)",
        category: "Electricity",
        provider: "Ceylon Electricity Board (CEB)",
        accountNo: "042-881-9921",
        month: "2026-10",
        dueDate: "2026-10-31",
        amount: 48500.00,
        status: "Pending",
        notes: "Main factory meter reading 4,200 units power consumption for digital presses"
      },
      {
        id: "EXP-2026-10-002",
        title: "NWSDB Water Supply (Workshop & Washing Bay)",
        category: "Water Board",
        provider: "National Water Supply & Drainage Board",
        accountNo: "11/204/883/02",
        month: "2026-10",
        dueDate: "2026-10-30",
        amount: 4850.00,
        status: "Pending",
        notes: "Monthly commercial water utility tariff"
      },
      {
        id: "EXP-2026-10-003",
        title: "SLT Megaline 100Mbps Ultra Fiber Line",
        category: "Internet & Fiber",
        provider: "Sri Lanka Telecom (SLT-Mobitel)",
        accountNo: "011-234-5678",
        month: "2026-10",
        dueDate: "2026-10-25",
        amount: 14200.00,
        status: "Paid",
        paidDate: "2026-10-24",
        paidAmount: 14200.00,
        paidMethod: "Bank Transfer",
        paidRef: "BOC-ONLINE-99214",
        paidNote: "Settled online via BOC corporate portal for graphics file transfers"
      },
      {
        id: "EXP-2026-10-004",
        title: "Dialog Business Broadband & Customer Hotline",
        category: "Mobile & Telephone",
        provider: "Dialog Axiata PLC",
        accountNo: "D-9928103",
        month: "2026-10",
        dueDate: "2026-10-28",
        amount: 6800.00,
        status: "Pending",
        notes: "Customer sales hotline & standby 4G backup router"
      },
      {
        id: "EXP-2026-10-005",
        title: "Main Street Printing Shop & Factory Premises Rent",
        category: "Shop Rent",
        provider: "Premises Landlord (Mr. K. Perera)",
        accountNo: "RENT-PREM-128",
        month: "2026-10",
        dueDate: "2026-10-05",
        amount: 65000.00,
        status: "Paid",
        paidDate: "2026-10-04",
        paidAmount: 65000.00,
        paidMethod: "Bank Transfer",
        paidRef: "COMBANK-FT-44102",
        paidNote: "Direct monthly transfer to landlord Commercial Bank savings account"
      },
      {
        id: "EXP-2026-10-006",
        title: "Konica Minolta & Roland Plotter Service Contract",
        category: "Maintenance & Other",
        provider: "Techno Graphic Services",
        accountNo: "AMC-TGS-2026",
        month: "2026-10",
        dueDate: "2026-10-29",
        amount: 18000.00,
        status: "Pending",
        notes: "Scheduled printhead cleaning, UV lamp maintenance and RIP calibration"
      },
      {
        id: "EXP-2026-09-001",
        title: "CEB Heavy Power (September)",
        category: "Electricity",
        provider: "Ceylon Electricity Board (CEB)",
        accountNo: "042-881-9921",
        month: "2026-09",
        dueDate: "2026-09-30",
        amount: 46200.00,
        status: "Paid",
        paidDate: "2026-09-28",
        paidAmount: 46200.00,
        paidMethod: "Bank Transfer",
        paidRef: "BOC-TXN-55410",
        paidNote: "Settled prior to month end"
      },
      {
        id: "EXP-2026-09-002",
        title: "NWSDB Water Supply (September)",
        category: "Water Board",
        provider: "National Water Supply & Drainage Board",
        accountNo: "11/204/883/02",
        month: "2026-09",
        dueDate: "2026-09-30",
        amount: 4600.00,
        status: "Paid",
        paidDate: "2026-09-29",
        paidAmount: 4600.00,
        paidMethod: "Cash",
        paidRef: "WATER-REC-8810",
        paidNote: "Settled at post office cash counter"
      },
      {
        id: "EXP-2026-09-003",
        title: "SLT Megaline 100Mbps Ultra Fiber Line (September)",
        category: "Internet & Fiber",
        provider: "Sri Lanka Telecom (SLT-Mobitel)",
        accountNo: "011-234-5678",
        month: "2026-09",
        dueDate: "2026-09-25",
        amount: 14200.00,
        status: "Paid",
        paidDate: "2026-09-24",
        paidAmount: 14200.00,
        paidMethod: "Bank Transfer",
        paidRef: "BOC-ONLINE-8812",
        paidNote: "Settled online"
      },
      {
        id: "EXP-2026-09-004",
        title: "Main Street Printing Shop & Factory Premises Rent (September)",
        category: "Shop Rent",
        provider: "Premises Landlord (Mr. K. Perera)",
        accountNo: "RENT-PREM-128",
        month: "2026-09",
        dueDate: "2026-09-05",
        amount: 65000.00,
        status: "Paid",
        paidDate: "2026-09-04",
        paidAmount: 65000.00,
        paidMethod: "Bank Transfer",
        paidRef: "COMBANK-FT-3391",
        paidNote: "Monthly shop lease rental"
      }
    ];
    this.saveExpenses();
  }

  saveOrderPayments() {
    localStorage.setItem(this.storageKeys.orderPayments, JSON.stringify(this.orderPayments));
  }

  saveGrnPayments() {
    localStorage.setItem(this.storageKeys.grnPayments, JSON.stringify(this.grnPayments));
  }

  saveExpenses() {
    localStorage.setItem(this.storageKeys.operatingExpenses, JSON.stringify(this.expenses));
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
