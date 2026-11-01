/**
 * SanjeewaAdvertising - Inventory Data Loader
 *
 * Handles storage keys, data persistence, default material inventory seeding,
 * and stock quantity/status calculation utilities.
 */

import { RequestHandler } from "../core/RequestHandler.js";

export class InventoryDataLoader {
  constructor() {
    this.http = new RequestHandler();
    this.storageKey = "sa_advertising_inventory_stock";
    this.items = [];
  }

  loadData() {
    const defaultSupplierMap = {
      "PAP-001": "PaperPro Lanka",
      "PAP-002": "PaperPro Lanka",
      "PAP-003": "PrintCare Materials",
      "INK-101": "Flora Tech International",
      "INK-102": "Flora Tech International",
      "INK-103": "Flora Tech International",
      "FLX-201": "MegaFlex Imports",
      "FLX-202": "Star Media Group",
      "VIN-301": "Avery Dennison Lanka",
      "VIN-303": "Avery Dennison Lanka",
      "RIG-401": "SignBoard Supplies",
      "RIG-402": "DisplayTech Hardware"
    };

    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.items = JSON.parse(saved);
        let updated = false;
        this.items.forEach(item => {
          if (!item.supplier) {
            item.supplier = defaultSupplierMap[item.code] || "General Supplier";
            updated = true;
          }
        });
        if (updated) this.saveData();
        return this.items;
      } catch (e) {
        console.error("Could not parse saved inventory data, restoring defaults", e);
      }
    }
    this.seedDefaultInventory();
    return this.items;
  }

  seedDefaultInventory() {
    this.items = [
      {
        code: "PAP-001",
        name: "300gsm Art Board SRA3",
        category: "Paper & Boards",
        supplier: "PaperPro Lanka",
        unitPrice: 45.00,
        unit: "Sheets",
        minThreshold: 500,
        batches: [
          { id: "BAT-101", receivedDate: "2026-09-10", unitCost: 40.00, initialQty: 2500, availableQty: 1200, supplier: "PaperPro Lanka" },
          { id: "BAT-102", receivedDate: "2026-10-15", unitCost: 42.00, initialQty: 1500, availableQty: 1500, supplier: "PaperPro Lanka" }
        ],
        transactions: [
          { id: "TXN-01", date: "2026-10-24 14:15", type: "DEDUCT", batchId: "BAT-101", qty: 350, reason: "Used for Job ORD-2026-1048", operator: "Admin User", remarks: "Brochure printing assignment" },
          { id: "TXN-02", date: "2026-10-15 10:00", type: "ADD", batchId: "BAT-102", qty: 1500, reason: "Supplier Stock Consignment", operator: "Kasun Perera", remarks: "Delivery from PaperPro Lanka" }
        ]
      },
      {
        code: "PAP-002",
        name: "250gsm Ivory Board A3",
        category: "Paper & Boards",
        supplier: "PaperPro Lanka",
        unitPrice: 38.00,
        unit: "Sheets",
        minThreshold: 400,
        batches: [
          { id: "BAT-103", receivedDate: "2026-08-20", unitCost: 34.00, initialQty: 1000, availableQty: 280, supplier: "PaperPro Lanka" }
        ],
        transactions: [
          { id: "TXN-03", date: "2026-10-22 11:30", type: "DEDUCT", batchId: "BAT-103", qty: 150, reason: "Used for Job ORD-2026-1049", operator: "Nuwan Silva", remarks: "Certificate printing" }
        ]
      },
      {
        code: "PAP-003",
        name: "150gsm Glossy Art Paper A4",
        category: "Paper & Boards",
        supplier: "PrintCare Materials",
        unitPrice: 14.00,
        unit: "Sheets",
        minThreshold: 800,
        batches: [
          { id: "BAT-104", receivedDate: "2026-09-01", unitCost: 11.50, initialQty: 5000, availableQty: 4200, supplier: "PrintCare Materials" }
        ],
        transactions: [
          { id: "TXN-04", date: "2026-10-21 16:00", type: "DEDUCT", batchId: "BAT-104", qty: 800, reason: "Used for Leaflet Batch #2", operator: "Dilshan Fernando", remarks: "A5 flyers" }
        ]
      },
      {
        code: "INK-101",
        name: "Flora Solvent Cyan Ink (5L)",
        category: "Inks & Toners",
        supplier: "Flora Tech International",
        unitPrice: 6800.00,
        unit: "Liters",
        minThreshold: 10,
        batches: [
          { id: "BAT-201", receivedDate: "2026-09-18", unitCost: 6100.00, initialQty: 25, availableQty: 18, supplier: "Flora Tech International" }
        ],
        transactions: [
          { id: "TXN-05", date: "2026-10-23 09:10", type: "DEDUCT", batchId: "BAT-201", qty: 5, reason: "Machine Refill (Flora Large Format)", operator: "Chamara Bandara", remarks: "Daily print tank replenishment" }
        ]
      },
      {
        code: "INK-102",
        name: "Flora Solvent Magenta Ink (5L)",
        category: "Inks & Toners",
        supplier: "Flora Tech International",
        unitPrice: 6800.00,
        unit: "Liters",
        minThreshold: 10,
        batches: [
          { id: "BAT-202", receivedDate: "2026-09-18", unitCost: 6100.00, initialQty: 25, availableQty: 8, supplier: "Flora Tech International" }
        ],
        transactions: [
          { id: "TXN-06", date: "2026-10-25 15:20", type: "DEDUCT", batchId: "BAT-202", qty: 6, reason: "Machine Refill (Flora Large Format)", operator: "Chamara Bandara", remarks: "Refill before overnight run" }
        ]
      },
      {
        code: "INK-103",
        name: "Flora Solvent Yellow Ink (5L)",
        category: "Inks & Toners",
        supplier: "Flora Tech International",
        unitPrice: 6800.00,
        unit: "Liters",
        minThreshold: 10,
        batches: [
          { id: "BAT-203", receivedDate: "2026-09-18", unitCost: 6100.00, initialQty: 20, availableQty: 0, supplier: "Flora Tech International" }
        ],
        transactions: [
          { id: "TXN-07", date: "2026-10-25 18:00", type: "DEDUCT", batchId: "BAT-203", qty: 4, reason: "Used for Job ORD-2026-1050", operator: "Nuwan Silva", remarks: "Tank fully consumed; reorder needed immediately" }
        ]
      },
      {
        code: "FLX-201",
        name: "Frontlit Flex 280gsm (10ft × 50m)",
        category: "Flex & Banners",
        supplier: "MegaFlex Imports",
        unitPrice: 18500.00,
        unit: "Rolls",
        minThreshold: 4,
        batches: [
          { id: "BAT-301", receivedDate: "2026-09-25", unitCost: 16200.00, initialQty: 10, availableQty: 6, supplier: "MegaFlex Imports" }
        ],
        transactions: [
          { id: "TXN-08", date: "2026-10-20 12:45", type: "DEDUCT", batchId: "BAT-301", qty: 2, reason: "Loaded into Flora #1 Machine", operator: "Kasun Perera", remarks: "Outdoor hoarding printing" }
        ]
      },
      {
        code: "FLX-202",
        name: "Star Heavy Flex 380gsm (10.5ft × 50m)",
        category: "Flex & Banners",
        supplier: "Star Media Group",
        unitPrice: 26000.00,
        unit: "Rolls",
        minThreshold: 3,
        batches: [
          { id: "BAT-302", receivedDate: "2026-10-02", unitCost: 23500.00, initialQty: 6, availableQty: 2, supplier: "Star Media Group" }
        ],
        transactions: [
          { id: "TXN-09", date: "2026-10-22 14:00", type: "DEDUCT", batchId: "BAT-302", qty: 1, reason: "Used for VIP Project", operator: "Admin User", remarks: "Heavy weather signage" }
        ]
      },
      {
        code: "VIN-301",
        name: "Glossy Self-Adhesive Vinyl (4ft × 50m)",
        category: "Vinyl & Stickers",
        supplier: "Avery Dennison Lanka",
        unitPrice: 16800.00,
        unit: "Rolls",
        minThreshold: 5,
        batches: [
          { id: "BAT-401", receivedDate: "2026-09-12", unitCost: 14800.00, initialQty: 12, availableQty: 8, supplier: "Avery Dennison Lanka" }
        ],
        transactions: [
          { id: "TXN-10", date: "2026-10-24 16:30", type: "DEDUCT", batchId: "BAT-401", qty: 1, reason: "Used for Vehicle Branding Job", operator: "Nuwan Silva", remarks: "Van wrap print" }
        ]
      },
      {
        code: "VIN-303",
        name: "One-Way Vision Film (4.2ft × 30m)",
        category: "Vinyl & Stickers",
        supplier: "Avery Dennison Lanka",
        unitPrice: 21500.00,
        unit: "Rolls",
        minThreshold: 3,
        batches: [
          { id: "BAT-402", receivedDate: "2026-08-30", unitCost: 19000.00, initialQty: 5, availableQty: 1, supplier: "Avery Dennison Lanka" }
        ],
        transactions: [
          { id: "TXN-11", date: "2026-10-18 10:15", type: "DEDUCT", batchId: "BAT-402", qty: 1, reason: "Storefront Glass Graphics", operator: "Dilshan Fernando", remarks: "Showroom window graphics" }
        ]
      },
      {
        code: "RIG-401",
        name: "5mm White Foam Board (4ft × 8ft)",
        category: "Rigid Boards & Hardware",
        supplier: "SignBoard Supplies",
        unitPrice: 3400.00,
        unit: "Sheets",
        minThreshold: 15,
        batches: [
          { id: "BAT-501", receivedDate: "2026-10-05", unitCost: 2950.00, initialQty: 50, availableQty: 32, supplier: "SignBoard Supplies" }
        ],
        transactions: [
          { id: "TXN-12", date: "2026-10-23 13:00", type: "DEDUCT", batchId: "BAT-501", qty: 8, reason: "Exhibition Stand Displays", operator: "Chamara Bandara", remarks: "Mounted promo boards" }
        ]
      },
      {
        code: "RIG-402",
        name: "Rollup Stand Luxury Aluminium (2.5ft × 6ft)",
        category: "Rigid Boards & Hardware",
        supplier: "DisplayTech Hardware",
        unitPrice: 2800.00,
        unit: "Sets",
        minThreshold: 8,
        batches: [
          { id: "BAT-502", receivedDate: "2026-09-20", unitCost: 2350.00, initialQty: 30, availableQty: 14, supplier: "DisplayTech Hardware" }
        ],
        transactions: [
          { id: "TXN-13", date: "2026-10-24 17:00", type: "DEDUCT", batchId: "BAT-502", qty: 4, reason: "Corporate Event Rollups", operator: "Kasun Perera", remarks: "Complete stand assemblies" }
        ]
      }
    ];
    this.saveData();
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  getItemAvailableQty(item) {
    if (!item.batches || item.batches.length === 0) return 0;
    return item.batches.reduce((sum, b) => sum + (parseFloat(b.availableQty) || 0), 0);
  }

  getItemTotalValue(item) {
    const qty = this.getItemAvailableQty(item);
    return qty * (item.unitPrice || 0);
  }

  getItemStatus(item) {
    const qty = this.getItemAvailableQty(item);
    if (qty <= 0) {
      return { label: "Out of Stock", class: "ant-tag-red", icon: "fa-circle-xmark" };
    }
    if (qty <= (item.minThreshold || 0)) {
      return { label: "Low Stock", class: "ant-tag-yellow", icon: "fa-triangle-exclamation" };
    }
    return { label: "In Stock", class: "ant-tag-green", icon: "fa-circle-check" };
  }

  formatCurrency(amount) {
    return `Rs. ${(parseFloat(amount) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

