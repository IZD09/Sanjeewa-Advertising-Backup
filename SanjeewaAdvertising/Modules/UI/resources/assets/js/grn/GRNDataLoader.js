/**
 * SanjeewaAdvertising - GRN Data Loader
 *
 * Handles storage keys, data persistence, default seeds for suppliers,
 * GRN notes, and purchase orders, as well as code/number generators.
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class GRNDataLoader {
  constructor() {
    this.http = new RequestHandler();
    this.storageKey = "sa_advertising_grn_records";
    this.poStorageKey = "sa_advertising_purchase_orders";
    this.supplierStorageKey = "sa_advertising_suppliers";

    this.grnRecords = [];
    this.purchaseOrders = [];
    this.suppliers = [];
  }

  /**
   * Load data from localStorage or seed defaults if empty.
   */
  loadData() {
    // 1. Load Suppliers
    const savedSuppliers = localStorage.getItem(this.supplierStorageKey);
    if (savedSuppliers) {
      try {
        this.suppliers = JSON.parse(savedSuppliers);
      } catch (e) {
        console.error("Could not parse saved suppliers data, restoring defaults", e);
        this.seedDefaultSuppliers();
      }
    } else {
      this.seedDefaultSuppliers();
    }

    // 2. Load GRN Records
    const savedGrns = localStorage.getItem(this.storageKey);
    if (savedGrns) {
      try {
        this.grnRecords = JSON.parse(savedGrns);
        this.grnRecords.forEach((r, idx) => {
          if (!r.supplier_contact) {
            r.supplier_contact = r.supplier_invoice_no || "077 123 4567";
          }
          if (!r.purchase_order_no) {
            r.purchase_order_no = "PO-2026-0" + (88 + idx);
          }
        });
      } catch (e) {
        console.error("Could not parse saved GRN data, restoring defaults", e);
        this.seedDefaultGRNs();
      }
    } else {
      this.seedDefaultGRNs();
    }

    // 3. Load Purchase Orders
    const savedPOs = localStorage.getItem(this.poStorageKey);
    if (savedPOs) {
      try {
        this.purchaseOrders = JSON.parse(savedPOs);
      } catch (e) {
        console.error("Could not parse saved PO data, restoring defaults", e);
        this.seedDefaultPurchaseOrders();
      }
    } else {
      this.seedDefaultPurchaseOrders();
    }

    return {
      suppliers: this.suppliers,
      grnRecords: this.grnRecords,
      purchaseOrders: this.purchaseOrders
    };
  }

  seedDefaultSuppliers() {
    this.suppliers = [
      {
        code: "SUP-001",
        name: "PaperPro Lanka",
        contact_person: "Dinesh Ranatunga",
        phone: "077 123 4567",
        alt_phone: "011 234 8899",
        email: "sales@paperpro.lk",
        category: "Paper & Boards",
        payment_terms: "30 Days Credit",
        address: "No. 45, Baseline Road, Colombo 09",
        tax_no: "VAT-882910-1",
        bank_details: "Commercial Bank - 8820194820",
        status: "Active",
        created_at: "2026-01-10"
      },
      {
        code: "SUP-002",
        name: "Flora Tech International",
        contact_person: "Rohan De Silva",
        phone: "071 889 2233",
        alt_phone: "011 445 1122",
        email: "info@floratech.lk",
        category: "Inks & Toners",
        payment_terms: "14 Days Credit",
        address: "No. 112, High Level Road, Maharagama",
        tax_no: "VAT-119203-9",
        bank_details: "Sampath Bank - 0019284729",
        status: "Active",
        created_at: "2026-01-15"
      },
      {
        code: "SUP-003",
        name: "MegaFlex Imports",
        contact_person: "Mohamed Rilwan",
        phone: "076 554 9988",
        alt_phone: "011 556 7788",
        email: "megaflex@sltnet.lk",
        category: "Flex & Banners",
        payment_terms: "Cash on Delivery",
        address: "No. 88, Kandy Road, Kelaniya",
        tax_no: "VAT-992019-3",
        bank_details: "HNB - 1002938475",
        status: "Active",
        created_at: "2026-02-01"
      },
      {
        code: "SUP-004",
        name: "Avery Dennison Lanka",
        contact_person: "Chaminda Bandara",
        phone: "077 334 1122",
        alt_phone: "011 889 0011",
        email: "orders@averydennison.lk",
        category: "Vinyl & Stickers",
        payment_terms: "30 Days Credit",
        address: "Biyagama Export Processing Zone",
        tax_no: "VAT-554192-8",
        bank_details: "Standard Chartered - 019283746",
        status: "Active",
        created_at: "2026-02-12"
      },
      {
        code: "SUP-005",
        name: "Star Media Group",
        contact_person: "Anura Kumara",
        phone: "071 223 9988",
        alt_phone: "011 776 5544",
        email: "starmedia@gmail.com",
        category: "Flex & Banners",
        payment_terms: "15 Days Credit",
        address: "No. 15, Negombo Road, Wattala",
        tax_no: "VAT-332910-4",
        bank_details: "BOC - 7728192837",
        status: "Active",
        created_at: "2026-02-20"
      },
      {
        code: "SUP-006",
        name: "SignBoard Supplies",
        contact_person: "Prasanna Jayakody",
        phone: "075 443 2211",
        alt_phone: "011 223 4455",
        email: "sales@signboardsupplies.com",
        category: "Rigid Boards & Hardware",
        payment_terms: "30 Days Credit",
        address: "No. 204, Galle Road, Dehiwala",
        tax_no: "VAT-771829-0",
        bank_details: "Commercial Bank - 1102938475",
        status: "Active",
        created_at: "2026-03-01"
      },
      {
        code: "SUP-007",
        name: "DisplayTech Hardware",
        contact_person: "Suren Abeywickrama",
        phone: "077 998 7766",
        alt_phone: "011 998 8776",
        email: "displaytech@slt.lk",
        category: "Rigid Boards & Hardware",
        payment_terms: "Cash on Delivery",
        address: "No. 67, Old Moor Street, Colombo 12",
        tax_no: "VAT-449102-3",
        bank_details: "Seylan Bank - 0029384716",
        status: "Active",
        created_at: "2026-03-10"
      },
      {
        code: "SUP-008",
        name: "PrintCare Materials",
        contact_person: "Kavinda Wickramasinghe",
        phone: "071 445 6677",
        alt_phone: "011 334 5566",
        email: "supply@printcare.lk",
        category: "Paper & Boards",
        payment_terms: "30 Days Credit",
        address: "No. 77, Awissawella Road, Wellampitiya",
        tax_no: "VAT-662918-2",
        bank_details: "Commercial Bank - 8819203948",
        status: "Active",
        created_at: "2026-03-15"
      }
    ];
    this.saveSupplierData();
  }

  seedDefaultGRNs() {
    this.grnRecords = [
      {
        grn_id: "GRN-2610-001",
        grn_number: "GRN-2610-001",
        purchase_order_no: "PO-2026-088",
        supplier_id: "SUP-001",
        supplier_name: "PaperPro Lanka",
        supplier_contact: "077 123 4567",
        supplier_invoice_no: "077 123 4567",
        received_date: "2026-10-15",
        sub_total: 97000.00,
        discount: 9500.00,
        net_total: 87500.00,
        received_by: "Admin User",
        status: "Completed",
        created_at: "2026-10-15 10:30",
        remarks: "Consignment delivery via lorry WP-DA-5520. All paper packs inspected and verified without water damage.",
        items: [
          {
            item_id: "PAP-001",
            item_name: "300gsm Art Board SRA3",
            unit: "Sheets",
            qty_received: 1500,
            unit_cost: 42.00,
            item_total: 63000.00,
            batch_id: "BAT-102"
          },
          {
            item_id: "INK-101",
            item_name: "Flora Solvent Cyan Ink (5L)",
            unit: "Liters",
            qty_received: 5,
            unit_cost: 6800.00,
            item_total: 34000.00,
            batch_id: "BAT-201"
          }
        ]
      },
      {
        grn_id: "GRN-2610-002",
        grn_number: "GRN-2610-002",
        purchase_order_no: "PO-2026-074",
        supplier_id: "SUP-003",
        supplier_name: "MegaFlex Imports",
        supplier_contact: "076 554 9988",
        supplier_invoice_no: "076 554 9988",
        received_date: "2026-10-20",
        sub_total: 111000.00,
        discount: 3000.00,
        net_total: 108000.00,
        received_by: "Kasun Perera",
        status: "Completed",
        created_at: "2026-10-20 14:10",
        remarks: "Frontlit Flex roll packages undamaged. Stored in flex rack aisle A-2.",
        items: [
          {
            item_id: "FLX-201",
            item_name: "Frontlit Flex 280gsm (10ft × 50m)",
            unit: "Rolls",
            qty_received: 6,
            unit_cost: 18500.00,
            item_total: 111000.00,
            batch_id: "BAT-301"
          }
        ]
      },
      {
        grn_id: "GRN-2610-003",
        grn_number: "GRN-2610-003",
        purchase_order_no: "PO-2026-092",
        supplier_id: "SUP-002",
        supplier_name: "Flora Tech International",
        supplier_contact: "071 889 2233",
        supplier_invoice_no: "071 889 2233",
        received_date: "2026-10-24",
        sub_total: 68000.00,
        discount: 4000.00,
        net_total: 64000.00,
        received_by: "Nuwan Silva",
        status: "Completed",
        created_at: "2026-10-24 16:45",
        remarks: "Flora solvent inks delivered. Batch expiry verified up to 2028.",
        items: [
          {
            item_id: "INK-102",
            item_name: "Flora Solvent Magenta Ink (5L)",
            unit: "Liters",
            qty_received: 5,
            unit_cost: 6800.00,
            item_total: 34000.00,
            batch_id: "BAT-202"
          },
          {
            item_id: "INK-103",
            item_name: "Flora Solvent Yellow Ink (5L)",
            unit: "Liters",
            qty_received: 5,
            unit_cost: 6800.00,
            item_total: 34000.00,
            batch_id: "BAT-203"
          }
        ]
      },
      {
        grn_id: "GRN-2610-004",
        grn_number: "GRN-2610-004",
        purchase_order_no: "PO-2026-068",
        supplier_id: "SUP-006",
        supplier_name: "SignBoard Supplies",
        supplier_contact: "075 443 2211",
        supplier_invoice_no: "075 443 2211",
        received_date: "2026-10-25",
        sub_total: 44200.00,
        discount: 2200.00,
        net_total: 42000.00,
        received_by: "Chamara Bandara",
        status: "Completed",
        created_at: "2026-10-25 11:15",
        remarks: "5mm foam boards received in good shape. Corner protectors intact.",
        items: [
          {
            item_id: "RIG-401",
            item_name: "5mm White Foam Board (4ft × 8ft)",
            unit: "Sheets",
            qty_received: 13,
            unit_cost: 3400.00,
            item_total: 44200.00,
            batch_id: "BAT-501"
          }
        ]
      },
      {
        grn_id: "GRN-2610-005",
        grn_number: "GRN-2610-005",
        purchase_order_no: "PO-2026-095",
        supplier_id: "SUP-004",
        supplier_name: "Avery Dennison Lanka",
        supplier_contact: "077 334 1122",
        supplier_invoice_no: "077 334 1122",
        received_date: "2026-10-26",
        sub_total: 100800.00,
        discount: 4800.00,
        net_total: 96000.00,
        received_by: "Admin User",
        status: "Draft",
        created_at: "2026-10-26 15:20",
        remarks: "Pending visual quality verification on roll 3 sticker adhesive coating.",
        items: [
          {
            item_id: "VIN-301",
            item_name: "Glossy Self-Adhesive Vinyl (4ft × 50m)",
            unit: "Rolls",
            qty_received: 6,
            unit_cost: 16800.00,
            item_total: 100800.00,
            batch_id: "PENDING"
          }
        ]
      }
    ];
    this.saveData();
  }

  seedDefaultPurchaseOrders() {
    this.purchaseOrders = [
      {
        po_number: "PO-2026-095",
        order_date: "2026-10-24",
        expected_date: "2026-10-28",
        supplier_name: "Avery Dennison Lanka",
        supplier_contact: "077 334 1122",
        status: "Partial",
        total_amount: 143800.00,
        created_by: "Admin User",
        remarks: "Urgent restocking of self-adhesive vinyl for upcoming corporate branding orders.",
        items: [
          {
            item_id: "VIN-301",
            item_name: "Glossy Self-Adhesive Vinyl (4ft × 50m)",
            unit: "Rolls",
            qty_ordered: 6,
            qty_received: 6,
            unit_cost: 16800.00,
            item_total: 100800.00
          },
          {
            item_id: "VIN-303",
            item_name: "One-Way Vision Film (4.2ft × 30m)",
            unit: "Rolls",
            qty_ordered: 2,
            qty_received: 0,
            unit_cost: 21500.00,
            item_total: 43000.00
          }
        ]
      },
      {
        po_number: "PO-2026-096",
        order_date: "2026-10-26",
        expected_date: "2026-10-31",
        supplier_name: "PaperPro Lanka",
        supplier_contact: "077 123 4567",
        status: "Pending",
        total_amount: 51500.00,
        created_by: "Admin User",
        remarks: "Regular monthly board order. Please ensure dry pallet packing.",
        items: [
          {
            item_id: "PAP-001",
            item_name: "300gsm Art Board SRA3",
            unit: "Sheets",
            qty_ordered: 500,
            qty_received: 0,
            unit_cost: 45.00,
            item_total: 22500.00
          },
          {
            item_id: "PAP-002",
            item_name: "250gsm Ivory Board A3",
            unit: "Sheets",
            qty_ordered: 500,
            qty_received: 0,
            unit_cost: 38.00,
            item_total: 19000.00
          },
          {
            item_id: "PAP-003",
            item_name: "150gsm Glossy Art Paper A4",
            unit: "Sheets",
            qty_ordered: 700,
            qty_received: 0,
            unit_cost: 14.00,
            item_total: 9800.00
          }
        ]
      },
      {
        po_number: "PO-2026-092",
        order_date: "2026-10-22",
        expected_date: "2026-10-25",
        supplier_name: "Flora Tech International",
        supplier_contact: "071 889 2233",
        status: "Completed",
        total_amount: 68000.00,
        created_by: "Admin User",
        remarks: "Full order received via GRN-2610-003.",
        items: [
          {
            item_id: "INK-102",
            item_name: "Flora Solvent Magenta Ink (5L)",
            unit: "Liters",
            qty_ordered: 5,
            qty_received: 5,
            unit_cost: 6800.00,
            item_total: 34000.00
          },
          {
            item_id: "INK-103",
            item_name: "Flora Solvent Yellow Ink (5L)",
            unit: "Liters",
            qty_ordered: 5,
            qty_received: 5,
            unit_cost: 6800.00,
            item_total: 34000.00
          }
        ]
      },
      {
        po_number: "PO-2026-088",
        order_date: "2026-10-12",
        expected_date: "2026-10-16",
        supplier_name: "PaperPro Lanka",
        supplier_contact: "077 123 4567",
        status: "Completed",
        total_amount: 97000.00,
        created_by: "Kasun Perera",
        remarks: "Complete fulfillment received on GRN-2610-001.",
        items: [
          {
            item_id: "PAP-001",
            item_name: "300gsm Art Board SRA3",
            unit: "Sheets",
            qty_ordered: 1500,
            qty_received: 1500,
            unit_cost: 42.00,
            item_total: 63000.00
          },
          {
            item_id: "INK-101",
            item_name: "Flora Solvent Cyan Ink (5L)",
            unit: "Liters",
            qty_ordered: 5,
            qty_received: 5,
            unit_cost: 6800.00,
            item_total: 34000.00
          }
        ]
      },
      {
        po_number: "PO-2026-097",
        order_date: "2026-10-27",
        expected_date: "2026-11-02",
        supplier_name: "DisplayTech Hardware",
        supplier_contact: "077 998 7766",
        status: "Pending",
        total_amount: 114000.00,
        created_by: "Nuwan Silva",
        remarks: "Rollup stands & hardware items required for upcoming exhibition week.",
        items: [
          {
            item_id: "VIN-303",
            item_name: "One-Way Vision Film (4.2ft × 30m)",
            unit: "Rolls",
            qty_ordered: 4,
            qty_received: 0,
            unit_cost: 21500.00,
            item_total: 86000.00
          },
          {
            item_id: "RIG-402",
            item_name: "Rollup Stand Luxury Aluminium (2.5ft × 6ft)",
            unit: "Sets",
            qty_ordered: 10,
            qty_received: 0,
            unit_cost: 2800.00,
            item_total: 28000.00
          }
        ]
      }
    ];
    this.savePOData();
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.grnRecords));
  }

  savePOData() {
    localStorage.setItem(this.poStorageKey, JSON.stringify(this.purchaseOrders));
  }

  saveSupplierData() {
    localStorage.setItem(this.supplierStorageKey, JSON.stringify(this.suppliers));
  }

  formatCurrency(amount) {
    return `Rs. ${(parseFloat(amount) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  generateNextGrnNumber() {
    const count = this.grnRecords.length + 1;
    const pad = String(count).padStart(3, "0");
    return `GRN-2610-${pad}`;
  }

  generateNextPONumber() {
    let maxNum = 97;
    this.purchaseOrders.forEach(p => {
      const match = p.po_number && p.po_number.match(/PO-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `PO-2026-${String(nextNum).padStart(3, "0")}`;
  }

  generateNextSupplierCode() {
    let maxNum = 8;
    this.suppliers.forEach(s => {
      const match = s.code && s.code.match(/SUP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `SUP-${String(nextNum).padStart(3, "0")}`;
  }
}

