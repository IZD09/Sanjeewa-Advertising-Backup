/**
 * Goods Received Note (GRN), Purchase Order (PO) & Supplier Management Module
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Ant Design / Gravity UI Clean Style
 */

"use strict";

class GRNManager {
  constructor() {
    this.storageKey = "sa_advertising_grn_records";
    this.poStorageKey = "sa_advertising_purchase_orders";
    this.supplierStorageKey = "sa_advertising_suppliers";

    this.grnRecords = [];
    this.purchaseOrders = [];
    this.suppliers = [];

    this.currentView = "list"; // "list", "form", "po", or "suppliers"
    this.activeGrnContext = null;
    this.activePoContext = null;
    this.supplierCallerContext = null; // 'grn', 'po', or null

    // Filters for GRN Table
    this.searchTerm = "";
    this.statusFilter = "ALL";
    this.supplierFilter = "ALL";

    // Filters for PO Table
    this.poSearchTerm = "";
    this.poSupplierFilter = "ALL";
    this.poStatusFilter = "ALL";

    // Filters for Suppliers Directory
    this.supplierSearchTerm = "";
    this.supplierCategoryFilter = "ALL";

    // Dynamic row state for New GRN form
    this.formItems = [];

    // Dynamic row state for New PO modal
    this.newPoItems = [];

    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.render();

    // Support URL view parameter (e.g. ?view=suppliers or ?view=po)
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("view");
    if (viewParam === "suppliers" || viewParam === "po" || viewParam === "form") {
      this.switchView(viewParam);
    }
  }

  /* ==========================================================================
     DATA PERSISTENCE & SEEDING
     ========================================================================== */
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
        address: "No. 45, Baseline Road, Colombo 09",
        category: "Paper & Boards",
        payment_terms: "30 Days Credit",
        tax_no: "VAT-98821034-7000",
        bank_details: "Commercial Bank - 8820019283 (Grandpass)",
        status: "Active",
        created_at: "2026-10-15"
      },
      {
        code: "SUP-002",
        name: "Flora Tech International",
        contact_person: "Sunil Perera",
        phone: "071 556 7890",
        alt_phone: "011 445 1122",
        email: "orders@floratech.lk",
        address: "No. 128 Main Street, Colombo 11",
        category: "Inks & Solvents",
        payment_terms: "14 Days Credit",
        tax_no: "VAT-11223344-8000",
        bank_details: "Sampath Bank - 01221003445 (Pettah)",
        status: "Active",
        created_at: "2026-10-16"
      },
      {
        code: "SUP-003",
        name: "MegaFlex Imports",
        contact_person: "Rohan Jayasuriya",
        phone: "011 234 5678",
        alt_phone: "077 765 4321",
        email: "info@megaflex.lk",
        address: "No. 88 Kandy Road, Kelaniya",
        category: "Flex & Banners",
        payment_terms: "30 Days Credit",
        tax_no: "VAT-44556677-9000",
        bank_details: "HNB - 00392011928 (Kelaniya)",
        status: "Active",
        created_at: "2026-10-17"
      },
      {
        code: "SUP-004",
        name: "Avery Dennison Lanka",
        contact_person: "Samantha Silva",
        phone: "071 998 8441",
        alt_phone: "011 248 9900",
        email: "lanka.sales@averydennison.com",
        address: "EPZ Zone, Biyagama",
        category: "Vinyl & Stickers",
        payment_terms: "45 Days Credit",
        tax_no: "VAT-88990011-5000",
        bank_details: "Standard Chartered - 0100293847 (Colombo)",
        status: "Active",
        created_at: "2026-10-18"
      },
      {
        code: "SUP-005",
        name: "Star Media Group",
        contact_person: "Chaminda Wickramasinghe",
        phone: "011 445 6677",
        alt_phone: "076 112 3344",
        email: "support@starmedia.lk",
        address: "No. 12 High Level Road, Maharagama",
        category: "Rigid Boards & Hardware",
        payment_terms: "Cash on Delivery",
        tax_no: "PV-882910",
        bank_details: "Seylan Bank - 00291029384 (Maharagama)",
        status: "Active",
        created_at: "2026-10-19"
      },
      {
        code: "SUP-006",
        name: "PrintCare Materials",
        contact_person: "Niroshan Fonseka",
        phone: "011 445 5667",
        alt_phone: "077 334 5566",
        email: "materials@printcare.lk",
        address: "Industrial Zone, Ratmalana",
        category: "Paper & Boards",
        payment_terms: "30 Days Credit",
        tax_no: "VAT-77889900-2000",
        bank_details: "Commercial Bank - 1002938475 (Ratmalana)",
        status: "Active",
        created_at: "2026-10-20"
      },
      {
        code: "SUP-007",
        name: "SignBoard Supplies",
        contact_person: "Anura Bandara",
        phone: "077 889 9001",
        alt_phone: "011 282 3344",
        email: "anura@signboardsupplies.com",
        address: "No. 200 Nawala Road, Nugegoda",
        category: "Rigid Boards & Hardware",
        payment_terms: "14 Days Credit",
        tax_no: "PV-554433",
        bank_details: "Nations Trust Bank - 0029384756 (Nugegoda)",
        status: "Active",
        created_at: "2026-10-21"
      },
      {
        code: "SUP-008",
        name: "DisplayTech Hardware",
        contact_person: "Pradeep Kumara",
        phone: "011 778 8990",
        alt_phone: "077 990 0112",
        email: "info@displaytech.lk",
        address: "No. 15 Galle Road, Colombo 03",
        category: "Rollup Stands & Displays",
        payment_terms: "Cash on Delivery",
        tax_no: "PV-119922",
        bank_details: "BOC - 0019283746 (Kollupitiya)",
        status: "Active",
        created_at: "2026-10-22"
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
        received_date: "2026-10-24",
        sub_total: 87500.00,
        discount: 0.00,
        net_total: 87500.00,
        received_by: "Admin User",
        status: "Completed",
        created_at: "2026-10-24 10:15",
        remarks: "Consignment delivered in good condition. All SRA3 bundles inspected.",
        items: [
          {
            item_id: "PAP-001",
            item_name: "300gsm Art Board SRA3",
            unit: "Sheets",
            qty_received: 1000,
            unit_cost: 45.00,
            item_total: 45000.00,
            batch_id: "BAT-102"
          },
          {
            item_id: "INK-101",
            item_name: "Flora Solvent Cyan Ink (5L)",
            unit: "Liters",
            qty_received: 5,
            unit_cost: 8500.00,
            item_total: 42500.00,
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
        supplier_contact: "011 234 5678",
        supplier_invoice_no: "011 234 5678",
        received_date: "2026-10-22",
        sub_total: 111000.00,
        discount: 3000.00,
        net_total: 108000.00,
        received_by: "Admin User",
        status: "Completed",
        created_at: "2026-10-22 14:30",
        remarks: "Heavy flex outdoor material for billboard orders.",
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
        supplier_id: "SUP-004",
        supplier_name: "Avery Dennison Lanka",
        supplier_contact: "071 998 8441",
        supplier_invoice_no: "071 998 8441",
        received_date: "2026-10-26",
        sub_total: 67200.00,
        discount: 0.00,
        net_total: 67200.00,
        received_by: "Kasun Perera",
        status: "Draft",
        created_at: "2026-10-26 11:00",
        remarks: "Pending roll quality audit before finalizing stock entry.",
        items: [
          {
            item_id: "VIN-301",
            item_name: "Glossy Self-Adhesive Vinyl (4ft × 50m)",
            unit: "Rolls",
            qty_received: 4,
            unit_cost: 16800.00,
            item_total: 67200.00,
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
        po_number: "PO-2026-088",
        order_date: "2026-10-20",
        expected_date: "2026-10-24",
        supplier_name: "PaperPro Lanka",
        supplier_contact: "077 123 4567",
        status: "Completed",
        total_amount: 87500.00,
        created_by: "Admin User",
        remarks: "Urgent restocking for corporate brochure print jobs.",
        items: [
          {
            item_id: "PAP-001",
            item_name: "300gsm Art Board SRA3",
            unit: "Sheets",
            qty_ordered: 1000,
            qty_received: 1000,
            unit_cost: 45.00,
            item_total: 45000.00
          },
          {
            item_id: "INK-101",
            item_name: "Flora Solvent Cyan Ink (5L)",
            unit: "Liters",
            qty_ordered: 5,
            qty_received: 5,
            unit_cost: 8500.00,
            item_total: 42500.00
          }
        ]
      },
      {
        po_number: "PO-2026-074",
        order_date: "2026-10-18",
        expected_date: "2026-10-22",
        supplier_name: "MegaFlex Imports",
        supplier_contact: "011 234 5678",
        status: "Completed",
        total_amount: 111000.00,
        created_by: "Admin User",
        remarks: "Flex banners for outdoor exhibition campaigns.",
        items: [
          {
            item_id: "FLX-201",
            item_name: "Frontlit Flex 280gsm (10ft × 50m)",
            unit: "Rolls",
            qty_ordered: 6,
            qty_received: 6,
            unit_cost: 18500.00,
            item_total: 111000.00
          }
        ]
      },
      {
        po_number: "PO-2026-092",
        order_date: "2026-10-23",
        expected_date: "2026-10-27",
        supplier_name: "Avery Dennison Lanka",
        supplier_contact: "071 998 8441",
        status: "Partial",
        total_amount: 134400.00,
        created_by: "Kasun Perera",
        remarks: "Premium vinyl rolls for vehicle branding wraps.",
        items: [
          {
            item_id: "VIN-301",
            item_name: "Glossy Self-Adhesive Vinyl (4ft × 50m)",
            unit: "Rolls",
            qty_ordered: 8,
            qty_received: 4,
            unit_cost: 16800.00,
            item_total: 134400.00
          }
        ]
      },
      {
        po_number: "PO-2026-095",
        order_date: "2026-10-25",
        expected_date: "2026-10-29",
        supplier_name: "Flora Tech International",
        supplier_contact: "071 556 7890",
        status: "Pending",
        total_amount: 108800.00,
        created_by: "Admin User",
        remarks: "Solvent inks for wide format billboard printer #1.",
        items: [
          {
            item_id: "INK-102",
            item_name: "Flora Solvent Magenta Ink (5L)",
            unit: "Liters",
            qty_ordered: 8,
            qty_received: 0,
            unit_cost: 6800.00,
            item_total: 54400.00
          },
          {
            item_id: "INK-103",
            item_name: "Flora Solvent Yellow Ink (5L)",
            unit: "Liters",
            qty_ordered: 8,
            qty_received: 0,
            unit_cost: 6800.00,
            item_total: 54400.00
          }
        ]
      },
      {
        po_number: "PO-2026-096",
        order_date: "2026-10-26",
        expected_date: "2026-10-31",
        supplier_name: "MegaFlex Imports",
        supplier_contact: "011 234 5678",
        status: "Pending",
        total_amount: 181000.00,
        created_by: "Admin User",
        remarks: "Heavy star flex & foam boards for showroom signs.",
        items: [
          {
            item_id: "FLX-202",
            item_name: "Star Heavy Flex 380gsm (10.5ft × 50m)",
            unit: "Rolls",
            qty_ordered: 5,
            qty_received: 0,
            unit_cost: 26000.00,
            item_total: 130000.00
          },
          {
            item_id: "RIG-401",
            item_name: "5mm White Foam Board (4ft × 8ft)",
            unit: "Sheets",
            qty_ordered: 15,
            qty_received: 0,
            unit_cost: 3400.00,
            item_total: 51000.00
          }
        ]
      },
      {
        po_number: "PO-2026-097",
        order_date: "2026-10-26",
        expected_date: "2026-10-30",
        supplier_name: "Star Media Group",
        supplier_contact: "011 445 6677",
        status: "Pending",
        total_amount: 114000.00,
        created_by: "Admin User",
        remarks: "Perforated window film and aluminium rollup display stands.",
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

  populateAllSupplierDropdowns() {
    // 1. Datalist for autocomplete inputs
    const datalists = document.querySelectorAll("#grnSupplierList");
    datalists.forEach(dl => {
      dl.innerHTML = "";
      this.suppliers.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.name;
        dl.appendChild(opt);
      });
    });

    // 2. Filter dropdowns
    this.populateSupplierFilter();
    this.populatePOSupplierFilter();

    // 3. Count badge
    const badge = document.getElementById("grnSupplierCountBadge");
    if (badge) badge.textContent = this.suppliers.length;
  }

  /* ==========================================================================
     EVENT BINDINGS
     ========================================================================== */
  bindEvents() {
    // Navigation tab switcher
    const tabListBtn = document.getElementById("grnTabListBtn");
    const tabCreateBtn = document.getElementById("grnTabCreateBtn");
    const tabPOBtn = document.getElementById("grnTabPOBtn");
    const tabSuppliersBtn = document.getElementById("grnTabSuppliersBtn");

    const headerCreateBtn = document.getElementById("grnHeaderCreateBtn");
    const headerCreatePOBtn = document.getElementById("grnHeaderCreatePOBtn");
    const headerRegisterSupplierBtn = document.getElementById("grnHeaderRegisterSupplierBtn");

    if (tabListBtn) tabListBtn.addEventListener("click", () => this.switchView("list"));
    if (tabCreateBtn) tabCreateBtn.addEventListener("click", () => this.switchView("form"));
    if (tabPOBtn) tabPOBtn.addEventListener("click", () => this.switchView("po"));
    if (tabSuppliersBtn) tabSuppliersBtn.addEventListener("click", () => this.switchView("suppliers"));

    if (headerCreateBtn) headerCreateBtn.addEventListener("click", () => this.switchView("form"));
    if (headerCreatePOBtn) headerCreatePOBtn.addEventListener("click", () => this.openCreatePOModal());
    if (headerRegisterSupplierBtn) headerRegisterSupplierBtn.addEventListener("click", () => this.openRegisterSupplierModal());

    // Search and filters for GRN list
    const searchInput = document.getElementById("grnSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.trim().toLowerCase();
        this.renderTable();
      });
    }

    const statusFilter = document.getElementById("grnStatusFilter");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.statusFilter = e.target.value;
        this.renderTable();
      });
    }

    const supplierFilter = document.getElementById("grnSupplierFilter");
    if (supplierFilter) {
      supplierFilter.addEventListener("change", (e) => {
        this.supplierFilter = e.target.value;
        this.renderTable();
      });
    }

    // Search and filters for PO list
    const poSearchInput = document.getElementById("poSearchInput");
    if (poSearchInput) {
      poSearchInput.addEventListener("input", (e) => {
        this.poSearchTerm = e.target.value.trim().toLowerCase();
        this.renderPOTable();
      });
    }

    const poSupplierFilter = document.getElementById("poSupplierFilter");
    if (poSupplierFilter) {
      poSupplierFilter.addEventListener("change", (e) => {
        this.poSupplierFilter = e.target.value;
        this.renderPOTable();
      });
    }

    const poStatusFilter = document.getElementById("poStatusFilter");
    if (poStatusFilter) {
      poStatusFilter.addEventListener("change", (e) => {
        this.poStatusFilter = e.target.value;
        this.renderPOTable();
      });
    }

    const poToolbarCreateBtn = document.getElementById("poToolbarCreateBtn");
    if (poToolbarCreateBtn) {
      poToolbarCreateBtn.addEventListener("click", () => this.openCreatePOModal());
    }

    // Search and filters for Suppliers directory
    const supplierSearchInput = document.getElementById("supplierSearchInput");
    if (supplierSearchInput) {
      supplierSearchInput.addEventListener("input", (e) => {
        this.supplierSearchTerm = e.target.value.trim().toLowerCase();
        this.renderSuppliersGrid();
      });
    }

    const supplierCategoryFilter = document.getElementById("supplierCategoryFilter");
    if (supplierCategoryFilter) {
      supplierCategoryFilter.addEventListener("change", (e) => {
        this.supplierCategoryFilter = e.target.value;
        this.renderSuppliersGrid();
      });
    }

    const supplierToolbarCreateBtn = document.getElementById("supplierToolbarCreateBtn");
    if (supplierToolbarCreateBtn) {
      supplierToolbarCreateBtn.addEventListener("click", () => this.openRegisterSupplierModal());
    }

    // Export button
    const exportBtn = document.getElementById("grnExportBtn");
    if (exportBtn) exportBtn.addEventListener("click", () => this.exportCSV());

    // Purchase Order Selection in GRN Form
    const poSelect = document.getElementById("grnFormPOSelect");
    if (poSelect) {
      poSelect.addEventListener("change", (e) => this.onPurchaseOrderSelect(e.target.value));
    }

    const quickAddPoBtn = document.getElementById("grnQuickAddPOBtn");
    if (quickAddPoBtn) {
      quickAddPoBtn.addEventListener("click", () => this.openCreatePOModal());
    }

    const resetPoBtn = document.getElementById("grnResetPoBtn");
    if (resetPoBtn) {
      resetPoBtn.addEventListener("click", () => this.clearSelectedPO());
    }

    // Quick Add Supplier in GRN Form & PO Modal
    const grnQuickAddSupplierBtn = document.getElementById("grnQuickAddSupplierBtn");
    if (grnQuickAddSupplierBtn) {
      grnQuickAddSupplierBtn.addEventListener("click", () => this.openRegisterSupplierModal("grn"));
    }

    const poQuickAddSupplierBtn = document.getElementById("poQuickAddSupplierBtn");
    if (poQuickAddSupplierBtn) {
      poQuickAddSupplierBtn.addEventListener("click", () => this.openRegisterSupplierModal("po"));
    }

    // Auto-fill phone on typing/selecting supplier name
    const grnFormSupplier = document.getElementById("grnFormSupplier");
    if (grnFormSupplier) {
      const autoFillHandler = (e) => {
        const val = e.target.value.trim().toLowerCase();
        const found = this.suppliers.find(s => s.name.toLowerCase() === val);
        const contactInput = document.getElementById("grnFormContact");
        if (found && contactInput) {
          contactInput.value = found.phone;
        }
      };
      grnFormSupplier.addEventListener("input", autoFillHandler);
      grnFormSupplier.addEventListener("change", autoFillHandler);
    }

    const newPoSupplier = document.getElementById("newPoSupplier");
    if (newPoSupplier) {
      const autoFillHandler = (e) => {
        const val = e.target.value.trim().toLowerCase();
        const found = this.suppliers.find(s => s.name.toLowerCase() === val);
        const contactInput = document.getElementById("newPoContact");
        if (found && contactInput) {
          contactInput.value = found.phone;
        }
      };
      newPoSupplier.addEventListener("input", autoFillHandler);
      newPoSupplier.addEventListener("change", autoFillHandler);
    }

    // Add Row button in GRN form
    const addRowBtn = document.getElementById("grnAddRowBtn");
    if (addRowBtn) addRowBtn.addEventListener("click", () => this.addNewRow());

    // Discount change in GRN form
    const discountInput = document.getElementById("grnFormDiscount");
    if (discountInput) {
      discountInput.addEventListener("input", () => this.calculateFinancials());
    }

    // Cancel form button
    const cancelFormBtn = document.getElementById("grnCancelFormBtn");
    if (cancelFormBtn) cancelFormBtn.addEventListener("click", () => this.switchView("list"));

    // Save as Draft button
    const saveDraftBtn = document.getElementById("grnSaveDraftBtn");
    if (saveDraftBtn) saveDraftBtn.addEventListener("click", () => this.saveGRN(false));

    // Complete GRN button
    const completeBtn = document.getElementById("grnCompleteBtn");
    if (completeBtn) completeBtn.addEventListener("click", () => this.saveGRN(true));

    // New PO Modal buttons
    const newPoAddRowBtn = document.getElementById("newPoAddRowBtn");
    if (newPoAddRowBtn) newPoAddRowBtn.addEventListener("click", () => this.addNewPoRow());

    const saveNewPoBtn = document.getElementById("saveNewPoBtn");
    if (saveNewPoBtn) saveNewPoBtn.addEventListener("click", () => this.saveNewPurchaseOrder());

    // Save New Supplier button
    const saveNewSupplierBtn = document.getElementById("saveNewSupplierBtn");
    if (saveNewSupplierBtn) saveNewSupplierBtn.addEventListener("click", () => this.saveNewSupplier());

    // Print PO Voucher & Create GRN from PO modal action
    const printPoBtn = document.getElementById("printPoDocBtn");
    if (printPoBtn) printPoBtn.addEventListener("click", () => this.triggerPrintPO());

    const poCreateGrnActionBtn = document.getElementById("poCreateGrnActionBtn");
    if (poCreateGrnActionBtn) {
      poCreateGrnActionBtn.addEventListener("click", () => {
        if (this.activePoContext) {
          const poNo = this.activePoContext.po_number;
          this.closeModal("viewPOModal");
          this.createGrnForPO(poNo);
        }
      });
    }

    // Modal Close buttons
    document.querySelectorAll("[data-close-grn-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-grn-modal");
        this.closeModal(modalId);
      });
    });

    // Print GRN button in modal
    const printBtn = document.getElementById("printGrnDocBtn");
    if (printBtn) printBtn.addEventListener("click", () => this.triggerPrintGrn());
  }

  switchView(viewName, targetPoNumber = null) {
    this.currentView = viewName;
    const listView = document.getElementById("grnListView");
    const formView = document.getElementById("grnFormView");
    const poView = document.getElementById("grnPOView");
    const suppliersView = document.getElementById("grnSuppliersView");

    const tabListBtn = document.getElementById("grnTabListBtn");
    const tabCreateBtn = document.getElementById("grnTabCreateBtn");
    const tabPOBtn = document.getElementById("grnTabPOBtn");
    const tabSuppliersBtn = document.getElementById("grnTabSuppliersBtn");

    // Hide all
    if (listView) listView.style.display = "none";
    if (formView) formView.style.display = "none";
    if (poView) poView.style.display = "none";
    if (suppliersView) suppliersView.style.display = "none";

    // Deactivate all tabs
    if (tabListBtn) tabListBtn.classList.remove("active");
    if (tabCreateBtn) tabCreateBtn.classList.remove("active");
    if (tabPOBtn) tabPOBtn.classList.remove("active");
    if (tabSuppliersBtn) tabSuppliersBtn.classList.remove("active");

    if (viewName === "form") {
      if (formView) formView.style.display = "block";
      if (tabCreateBtn) tabCreateBtn.classList.add("active");
      this.initNewGrnForm(targetPoNumber);
    } else if (viewName === "po") {
      if (poView) poView.style.display = "block";
      if (tabPOBtn) tabPOBtn.classList.add("active");
      this.renderPOTable();
      this.populatePOSupplierFilter();
    } else if (viewName === "suppliers") {
      if (suppliersView) suppliersView.style.display = "block";
      if (tabSuppliersBtn) tabSuppliersBtn.classList.add("active");
      this.renderSuppliersGrid();
    } else {
      // List view
      if (listView) listView.style.display = "block";
      if (tabListBtn) tabListBtn.classList.add("active");
      this.render();
    }
  }

  /* ==========================================================================
     RENDER & DASHBOARDS
     ========================================================================== */
  render() {
    this.renderKPIs();
    this.renderTable();
    this.populateAllSupplierDropdowns();
    this.renderOpenPoBadge();
    this.renderPOTable();
    this.renderSuppliersGrid();
  }

  renderKPIs() {
    const totalGrns = this.grnRecords.length;
    let completedCount = 0;
    let draftCount = 0;
    let totalValue = 0;

    this.grnRecords.forEach(rec => {
      if (rec.status === "Completed") {
        completedCount++;
        totalValue += (parseFloat(rec.net_total) || 0);
      } else {
        draftCount++;
      }
    });

    const kpiTotal = document.getElementById("grnKpiTotal");
    const kpiCompleted = document.getElementById("grnKpiCompleted");
    const kpiValue = document.getElementById("grnKpiValue");
    const kpiDraft = document.getElementById("grnKpiDraft");

    if (kpiTotal) kpiTotal.textContent = totalGrns;
    if (kpiCompleted) kpiCompleted.textContent = completedCount;
    if (kpiValue) kpiValue.textContent = this.formatCurrency(totalValue);
    if (kpiDraft) kpiDraft.textContent = draftCount;
  }

  renderOpenPoBadge() {
    const badge = document.getElementById("grnOpenPoBadge");
    if (!badge) return;
    const openCount = this.purchaseOrders.filter(p => p.status === "Pending" || p.status === "Partial").length;
    badge.textContent = openCount;
  }

  populateSupplierFilter() {
    const select = document.getElementById("grnSupplierFilter");
    if (!select) return;

    const suppliers = new Set();
    this.grnRecords.forEach(r => {
      if (r.supplier_name) suppliers.add(r.supplier_name);
    });
    this.suppliers.forEach(s => suppliers.add(s.name));

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Suppliers</option>';
    suppliers.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  populatePOSupplierFilter() {
    const select = document.getElementById("poSupplierFilter");
    if (!select) return;

    const suppliers = new Set();
    this.purchaseOrders.forEach(p => {
      if (p.supplier_name) suppliers.add(p.supplier_name);
    });
    this.suppliers.forEach(s => suppliers.add(s.name));

    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">All Suppliers</option>';
    suppliers.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }

  /* ==========================================================================
     SUPPLIERS DIRECTORY
     ========================================================================== */
  renderSuppliersGrid() {
    const container = document.getElementById("suppliersCardsContainer");
    if (!container) return;

    const filtered = this.suppliers.filter(s => {
      const matchesSearch = !this.supplierSearchTerm ||
        s.name.toLowerCase().includes(this.supplierSearchTerm) ||
        s.code.toLowerCase().includes(this.supplierSearchTerm) ||
        s.contact_person.toLowerCase().includes(this.supplierSearchTerm) ||
        s.phone.includes(this.supplierSearchTerm) ||
        (s.email && s.email.toLowerCase().includes(this.supplierSearchTerm)) ||
        (s.address && s.address.toLowerCase().includes(this.supplierSearchTerm)) ||
        s.category.toLowerCase().includes(this.supplierSearchTerm);

      const matchesCategory = this.supplierCategoryFilter === "ALL" || s.category === this.supplierCategoryFilter;

      return matchesSearch && matchesCategory;
    });

    container.innerHTML = "";

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="inv-empty-state" style="grid-column: 1 / -1; padding: 40px;">
          <i class="fa-solid fa-truck-field"></i>
          <h4 style="margin: 0; font-size: 15px; color: var(--text);">No Suppliers Found</h4>
          <p style="margin: 6px 0 14px; font-size: 12.5px; color: var(--text-muted);">Register a new supplier to start issuing Purchase Orders and Goods Received Notes.</p>
          <button type="button" class="ant-btn ant-btn-primary" onclick="window.grnManager.openRegisterSupplierModal()">
            <i class="fa-solid fa-user-plus"></i> Register Supplier Now
          </button>
        </div>
      `;
      return;
    }

    filtered.forEach(s => {
      const card = document.createElement("div");
      card.className = "supplier-card";
      card.innerHTML = `
        <div>
          <div class="supplier-card-header">
            <div class="supplier-brand-info">
              <h4><i class="fa-solid fa-truck-ramp-box"></i> ${s.name}</h4>
              <div class="supplier-contact-person">
                <i class="fa-solid fa-user-tie"></i> ${s.contact_person}
              </div>
            </div>
            <span class="grn-code-badge" style="background: #e6f4ff; color: #1677ff; border-color: #91caff;">${s.code}</span>
          </div>

          <div class="supplier-details-list" style="margin-top: 12px;">
            <div class="supplier-detail-row">
              <i class="fa-solid fa-phone"></i>
              <a href="tel:${s.phone}" style="color: var(--text); font-weight: 600; text-decoration: none;">${s.phone}</a>
              ${s.alt_phone ? `<span style="color: var(--text-muted); font-size: 11px;">/ ${s.alt_phone}</span>` : ""}
            </div>
            ${s.email ? `
              <div class="supplier-detail-row">
                <i class="fa-solid fa-envelope"></i>
                <a href="mailto:${s.email}" style="color: var(--text-muted); text-decoration: none;">${s.email}</a>
              </div>
            ` : ""}
            ${s.address ? `
              <div class="supplier-detail-row">
                <i class="fa-solid fa-location-dot"></i>
                <span title="${s.address}">${s.address}</span>
              </div>
            ` : ""}
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="supplier-category-pill">${s.category}</span>
            <span class="supplier-terms-badge">${s.payment_terms || "COD"}</span>
          </div>

          <div class="supplier-card-footer">
            <button type="button" class="ant-btn ant-btn-default" style="font-size: 11.5px; height: 30px; padding: 0 10px;" title="Create Purchase Order for this Supplier" onclick="window.grnManager.openCreatePOModal('${s.name}')">
              <i class="fa-solid fa-cart-arrow-down" style="color: #1677ff;"></i> + PO
            </button>
            <button type="button" class="ant-btn ant-btn-primary" style="font-size: 11.5px; height: 30px; padding: 0 10px;" title="Create GRN for this Supplier" onclick="window.grnManager.createGrnForSupplier('${s.name}')">
              <i class="fa-solid fa-file-invoice"></i> + GRN
            </button>
            <button type="button" class="ant-btn-action" style="color: var(--text-muted); border-color: transparent;" title="Edit Supplier Details" onclick="window.grnManager.openEditSupplierModal('${s.code}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="ant-btn-action" style="color: #ff4d4f; border-color: transparent;" title="Delete Supplier" onclick="window.grnManager.deleteSupplier('${s.code}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  openEditSupplierModal(supplierCode) {
    this.openRegisterSupplierModal(null, supplierCode);
  }

  openRegisterSupplierModal(callerContext = null, editingSupplierCode = null) {
    this.supplierCallerContext = callerContext;
    this.editingSupplierCode = editingSupplierCode;

    const modalTitle = document.getElementById("registerSupplierModalTitle");
    const saveBtn = document.getElementById("saveNewSupplierBtn");

    const codeInput = document.getElementById("newSupCode");
    const nameInput = document.getElementById("newSupName");
    const personInput = document.getElementById("newSupPerson");
    const phoneInput = document.getElementById("newSupPhone");
    const altPhoneInput = document.getElementById("newSupAltPhone");
    const emailInput = document.getElementById("newSupEmail");
    const categoryInput = document.getElementById("newSupCategory");
    const termsInput = document.getElementById("newSupTerms");
    const addressInput = document.getElementById("newSupAddress");
    const taxNoInput = document.getElementById("newSupTaxNo");
    const bankInput = document.getElementById("newSupBank");

    if (editingSupplierCode) {
      const s = this.suppliers.find(sup => sup.code === editingSupplierCode);
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #1677ff;"></i> Edit Supplier Details (${s ? s.code : ""})`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Update Supplier`;

      if (codeInput) codeInput.value = s ? s.code : "";
      if (nameInput) nameInput.value = s ? s.name : "";
      if (personInput) personInput.value = s ? s.contact_person : "";
      if (phoneInput) phoneInput.value = s ? s.phone : "";
      if (altPhoneInput) altPhoneInput.value = s ? (s.alt_phone || "") : "";
      if (emailInput) emailInput.value = s ? (s.email || "") : "";
      if (categoryInput) categoryInput.value = s ? (s.category || "Paper & Boards") : "Paper & Boards";
      if (termsInput) termsInput.value = s ? (s.payment_terms || "30 Days Credit") : "30 Days Credit";
      if (addressInput) addressInput.value = s ? (s.address || "") : "";
      if (taxNoInput) taxNoInput.value = s ? (s.tax_no || "") : "";
      if (bankInput) bankInput.value = s ? (s.bank_details || "") : "";
    } else {
      if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-truck-field" style="color: #1677ff;"></i> Register New Supplier / Vendor`;
      if (saveBtn) saveBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> Save & Register Supplier`;

      if (codeInput) codeInput.value = this.generateNextSupplierCode();
      if (nameInput) nameInput.value = "";
      if (personInput) personInput.value = "";
      if (phoneInput) phoneInput.value = "";
      if (altPhoneInput) altPhoneInput.value = "";
      if (emailInput) emailInput.value = "";
      if (categoryInput) categoryInput.value = "Paper & Boards";
      if (termsInput) termsInput.value = "30 Days Credit";
      if (addressInput) addressInput.value = "";
      if (taxNoInput) taxNoInput.value = "";
      if (bankInput) bankInput.value = "";
    }

    this.openModal("registerSupplierModal");
  }

  saveNewSupplier() {
    const code = document.getElementById("newSupCode")?.value || this.generateNextSupplierCode();
    const name = document.getElementById("newSupName")?.value?.trim();
    const person = document.getElementById("newSupPerson")?.value?.trim() || "";
    const phone = document.getElementById("newSupPhone")?.value?.trim();
    const altPhone = document.getElementById("newSupAltPhone")?.value?.trim() || "";
    const email = document.getElementById("newSupEmail")?.value?.trim() || "";
    const category = document.getElementById("newSupCategory")?.value || "Paper & Boards";
    const terms = document.getElementById("newSupTerms")?.value || "30 Days Credit";
    const address = document.getElementById("newSupAddress")?.value?.trim() || "";
    const taxNo = document.getElementById("newSupTaxNo")?.value?.trim() || "";
    const bank = document.getElementById("newSupBank")?.value?.trim() || "";

    if (!name) {
      this.showToast("Please enter the Company / Supplier Name", "error");
      return;
    }

    if (!phone) {
      this.showToast("Please enter a valid Phone / Mobile Number", "error");
      return;
    }

    if (this.editingSupplierCode) {
      const existingIdx = this.suppliers.findIndex(sup => sup.code === this.editingSupplierCode);
      if (existingIdx !== -1) {
        this.suppliers[existingIdx] = {
          ...this.suppliers[existingIdx],
          name: name,
          contact_person: person || name,
          phone: phone,
          alt_phone: altPhone,
          email: email,
          category: category,
          payment_terms: terms,
          address: address,
          tax_no: taxNo,
          bank_details: bank
        };
        this.saveSupplierData();
        this.populateAllSupplierDropdowns();
        this.renderSuppliersGrid();
        this.closeModal("registerSupplierModal");
        this.showToast(`Supplier "${name}" updated successfully!`, "success");
        this.editingSupplierCode = null;
        return;
      }
    }

    const newSupplier = {
      code: code,
      name: name,
      contact_person: person || name,
      phone: phone,
      alt_phone: altPhone,
      email: email,
      category: category,
      payment_terms: terms,
      address: address,
      tax_no: taxNo,
      bank_details: bank,
      status: "Active",
      created_at: new Date().toISOString().split("T")[0]
    };

    this.suppliers.unshift(newSupplier);
    this.saveSupplierData();
    this.populateAllSupplierDropdowns();
    this.renderSuppliersGrid();

    this.closeModal("registerSupplierModal");

    if (this.supplierCallerContext === "grn") {
      const grnSup = document.getElementById("grnFormSupplier");
      const grnContact = document.getElementById("grnFormContact");
      if (grnSup) grnSup.value = newSupplier.name;
      if (grnContact) grnContact.value = newSupplier.phone;
      this.showToast(`Supplier "${newSupplier.name}" registered and selected in GRN!`, "success");
    } else if (this.supplierCallerContext === "po") {
      const poSup = document.getElementById("newPoSupplier");
      const poContact = document.getElementById("newPoContact");
      if (poSup) poSup.value = newSupplier.name;
      if (poContact) poContact.value = newSupplier.phone;
      this.showToast(`Supplier "${newSupplier.name}" registered and selected in Purchase Order!`, "success");
    } else {
      this.showToast(`Supplier "${newSupplier.name}" registered successfully!`, "success");
      if (this.currentView !== "suppliers") {
        this.switchView("suppliers");
      }
    }
  }

  createGrnForSupplier(supplierName) {
    this.switchView("form");
    this.clearSelectedPO();

    const supInput = document.getElementById("grnFormSupplier");
    const contactInput = document.getElementById("grnFormContact");

    if (supInput) supInput.value = supplierName;
    const found = this.suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
    if (found && contactInput) {
      contactInput.value = found.phone;
    }

    const formView = document.getElementById("grnFormView");
    if (formView) {
      formView.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  deleteSupplier(supplierCode) {
    const s = this.suppliers.find(sup => sup.code === supplierCode);
    if (!s) return;

    const confirmed = confirm(`Are you sure you want to remove supplier "${s.name}"?`);
    if (!confirmed) return;

    this.suppliers = this.suppliers.filter(sup => sup.code !== supplierCode);
    this.saveSupplierData();
    this.populateAllSupplierDropdowns();
    this.renderSuppliersGrid();
    this.showToast(`Supplier "${s.name}" removed`, "warning");
  }

  /* ==========================================================================
     GRN TABLE VIEW
     ========================================================================== */
  renderTable() {
    const tbody = document.getElementById("grnTableBody");
    const countLabel = document.getElementById("grnTableCount");
    if (!tbody) return;

    const filtered = this.grnRecords.filter(rec => {
      const matchesSearch = !this.searchTerm ||
        rec.grn_number.toLowerCase().includes(this.searchTerm) ||
        (rec.purchase_order_no && rec.purchase_order_no.toLowerCase().includes(this.searchTerm)) ||
        rec.supplier_name.toLowerCase().includes(this.searchTerm) ||
        (rec.supplier_contact && rec.supplier_contact.toLowerCase().includes(this.searchTerm)) ||
        (rec.supplier_invoice_no && rec.supplier_invoice_no.toLowerCase().includes(this.searchTerm)) ||
        rec.received_by.toLowerCase().includes(this.searchTerm);

      const matchesStatus = this.statusFilter === "ALL" || rec.status === this.statusFilter;
      const matchesSupplier = this.supplierFilter === "ALL" || rec.supplier_name === this.supplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${this.grnRecords.length} GRN notes`;
    }

    tbody.innerHTML = "";

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="inv-empty-state">
              <i class="fa-solid fa-file-invoice"></i>
              <h4 style="margin: 0; font-size: 14px; color: var(--text);">No Goods Received Notes found</h4>
              <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-muted);">Create your first GRN by clicking "+ Create New GRN"</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(rec => {
      const isCompleted = rec.status === "Completed";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="grn-code-badge">${rec.grn_number}</span></td>
        <td>
          <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${rec.supplier_name}</span>
        </td>
        <td><span style="font-family: ui-monospace; font-weight: 600; color: var(--text);"><i class="fa-solid fa-phone" style="font-size: 11px; color: var(--primary); margin-right: 5px;"></i>${rec.supplier_contact || rec.supplier_invoice_no || "N/A"}</span></td>
        <td>${rec.received_date}</td>
        <td>
          <span class="grn-code-badge" style="background: #f6ffed; color: #389e0d; border-color: #b7eb8f; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-file-invoice" style="font-size: 11px;"></i> ${rec.purchase_order_no || "PO-2026-088"}
          </span>
          <span style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 2px;">
            ${rec.items ? rec.items.length : 0} items
          </span>
        </td>
        <td class="text-right" style="font-weight: 700; color: var(--text);">${this.formatCurrency(rec.net_total)}</td>
        <td><span style="font-size: 12px; color: var(--text-muted);">${rec.received_by}</span></td>
        <td>
          <span class="grn-status-badge ${isCompleted ? "completed" : "draft"}">
            <i class="fa-solid ${isCompleted ? "fa-circle-check" : "fa-clock"}"></i>
            ${rec.status}
          </span>
        </td>
        <td class="text-center">
          <div class="inv-actions-group">
            <button class="ant-btn-action" title="View GRN Document" onclick="window.grnManager.viewGRN('${rec.grn_number}')">
              <i class="fa-solid fa-eye"></i> View
            </button>
            ${!isCompleted ? `
              <button class="ant-btn-action" style="color: #52c41a; border-color: #b7eb8f;" title="Complete GRN & Update Stock" onclick="window.grnManager.finalizeDraftGRN('${rec.grn_number}')">
                <i class="fa-solid fa-check-double"></i> Complete
              </button>
            ` : ""}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================================================
     PURCHASE ORDERS TABLE VIEW
     ========================================================================== */
  renderPOTable() {
    const tbody = document.getElementById("poTableBody");
    if (!tbody) return;

    const filtered = this.purchaseOrders.filter(po => {
      const itemNames = po.items ? po.items.map(i => i.item_name).join(" ") : "";
      const matchesSearch = !this.poSearchTerm ||
        po.po_number.toLowerCase().includes(this.poSearchTerm) ||
        po.supplier_name.toLowerCase().includes(this.poSearchTerm) ||
        (po.supplier_contact && po.supplier_contact.toLowerCase().includes(this.poSearchTerm)) ||
        itemNames.toLowerCase().includes(this.poSearchTerm);

      const matchesStatus = this.poStatusFilter === "ALL" || po.status === this.poStatusFilter;
      const matchesSupplier = this.poSupplierFilter === "ALL" || po.supplier_name === this.poSupplierFilter;

      return matchesSearch && matchesStatus && matchesSupplier;
    });

    tbody.innerHTML = "";

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="inv-empty-state">
              <i class="fa-solid fa-clipboard-list"></i>
              <h4 style="margin: 0; font-size: 14px; color: var(--text);">No Purchase Orders found</h4>
              <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-muted);">Create a new Purchase Order to request items from suppliers.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(po => {
      const tr = document.createElement("tr");

      // Items summary tags
      let itemsTags = "";
      if (po.items && po.items.length > 0) {
        itemsTags = po.items.map(item => `
          <span class="po-item-tag" title="${item.item_name}">
            <strong>${item.qty_ordered} ${item.unit}</strong> ${item.item_name.substring(0, 22)}${item.item_name.length > 22 ? "..." : ""}
          </span>
        `).join("");
      }

      let statusBadgeClass = "pending";
      let statusIcon = "fa-clock";
      if (po.status === "Completed") {
        statusBadgeClass = "completed";
        statusIcon = "fa-circle-check";
      } else if (po.status === "Partial") {
        statusBadgeClass = "partial";
        statusIcon = "fa-hourglass-half";
      }

      const isCompleted = po.status === "Completed";

      tr.innerHTML = `
        <td>
          <span class="grn-code-badge" style="background: #e6f4ff; color: #1677ff; border-color: #91caff;">
            ${po.po_number}
          </span>
        </td>
        <td><span style="font-size: 12.5px; color: var(--text);">${po.order_date}</span></td>
        <td><span style="font-size: 12.5px; font-weight: 600; color: #fa8c16;">${po.expected_date || "N/A"}</span></td>
        <td>
          <span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${po.supplier_name}</span>
          <div style="font-size: 11px; color: var(--text-muted); font-family: ui-monospace; margin-top: 3px;">
            <i class="fa-solid fa-phone" style="font-size: 10px;"></i> ${po.supplier_contact || "-"}
          </div>
        </td>
        <td style="max-width: 320px;">
          ${itemsTags}
        </td>
        <td class="text-right" style="font-weight: 700; color: var(--text);">
          ${this.formatCurrency(po.total_amount)}
        </td>
        <td>
          <span class="grn-status-badge ${statusBadgeClass}">
            <i class="fa-solid ${statusIcon}"></i> ${po.status}
          </span>
        </td>
        <td class="text-center">
          <div class="inv-actions-group">
            <button class="ant-btn-action" title="View Purchase Order" onclick="window.grnManager.viewPO('${po.po_number}')">
              <i class="fa-solid fa-eye"></i> View
            </button>
            ${!isCompleted ? `
              <button class="ant-btn-action" style="color: #52c41a; border-color: #b7eb8f; background: #f6ffed;" title="Create GRN for this PO" onclick="window.grnManager.createGrnForPO('${po.po_number}')">
                <i class="fa-solid fa-truck-ramp-box"></i> Receive (GRN)
              </button>
            ` : ""}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================================================
     GRN CREATION FORM & PO LINKING
     ========================================================================== */
  populatePOSelect(preselectedPoNo = null) {
    const select = document.getElementById("grnFormPOSelect");
    if (!select) return;

    select.innerHTML = "";

    // Default unselected option
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Select Approved / Pending Purchase Order --";
    select.appendChild(defaultOpt);

    // Manual direct consignment option
    const manualOpt = document.createElement("option");
    manualOpt.value = "MANUAL";
    manualOpt.textContent = "[+] Manual / Direct Consignment (No PO)";
    select.appendChild(manualOpt);

    // Group pending POs first
    const pendingPOs = this.purchaseOrders.filter(p => p.status !== "Completed");
    const completedPOs = this.purchaseOrders.filter(p => p.status === "Completed");

    if (pendingPOs.length > 0) {
      const group = document.createElement("optgroup");
      group.label = "Pending & Open Purchase Orders (Ready for GRN)";
      pendingPOs.forEach(po => {
        const opt = document.createElement("option");
        opt.value = po.po_number;
        opt.textContent = `${po.po_number} • ${po.supplier_name} (${po.items ? po.items.length : 0} items — ${this.formatCurrency(po.total_amount)}) [${po.status}]`;
        if (preselectedPoNo === po.po_number) opt.selected = true;
        group.appendChild(opt);
      });
      select.appendChild(group);
    }

    if (completedPOs.length > 0) {
      const group = document.createElement("optgroup");
      group.label = "Completed Purchase Orders (Already Received)";
      completedPOs.forEach(po => {
        const opt = document.createElement("option");
        opt.value = po.po_number;
        opt.textContent = `${po.po_number} • ${po.supplier_name} (Received)`;
        if (preselectedPoNo === po.po_number) opt.selected = true;
        group.appendChild(opt);
      });
      select.appendChild(group);
    }
  }

  initNewGrnForm(targetPoNumber = null) {
    const grnNoInput = document.getElementById("grnFormNumber");
    const dateInput = document.getElementById("grnFormDate");
    const receivedByInput = document.getElementById("grnFormReceivedBy");
    const remarksInput = document.getElementById("grnFormRemarks");
    const discountInput = document.getElementById("grnFormDiscount");

    if (grnNoInput) grnNoInput.value = this.generateNextGrnNumber();
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
    if (receivedByInput) receivedByInput.value = "Admin User";
    if (remarksInput) remarksInput.value = "";
    if (discountInput) discountInput.value = "0.00";

    // Populate dropdown
    this.populatePOSelect(targetPoNumber);

    if (targetPoNumber) {
      this.onPurchaseOrderSelect(targetPoNumber);
    } else {
      // Pick first pending PO if available to make workflow smooth
      const pendingPo = this.purchaseOrders.find(p => p.status === "Pending" || p.status === "Partial");
      if (pendingPo) {
        const poSelect = document.getElementById("grnFormPOSelect");
        if (poSelect) poSelect.value = pendingPo.po_number;
        this.onPurchaseOrderSelect(pendingPo.po_number);
      } else {
        // Fallback default sample row
        this.clearSelectedPO();
      }
    }
  }

  onPurchaseOrderSelect(poNumber) {
    const poInput = document.getElementById("grnFormPO");
    const supplierInput = document.getElementById("grnFormSupplier");
    const contactInput = document.getElementById("grnFormContact");
    const banner = document.getElementById("grnPoInfoBanner");
    const bannerCode = document.getElementById("grnPoBannerCode");
    const bannerStatus = document.getElementById("grnPoBannerStatus");
    const bannerSupplier = document.getElementById("grnPoBannerSupplier");
    const bannerCount = document.getElementById("grnPoBannerItemCount");

    if (!poNumber || poNumber === "MANUAL") {
      if (poInput) poInput.value = poNumber === "MANUAL" ? `DIR-${Date.now().toString().slice(-4)}` : "";
      if (banner) banner.style.display = "none";
      return;
    }

    const po = this.purchaseOrders.find(p => p.po_number === poNumber);
    if (!po) {
      if (poInput) poInput.value = poNumber;
      if (banner) banner.style.display = "none";
      return;
    }

    // Set hidden PO field
    if (poInput) poInput.value = po.po_number;

    // Auto fill supplier info
    if (supplierInput) supplierInput.value = po.supplier_name;
    if (contactInput) contactInput.value = po.supplier_contact || "";

    // Show PO Banner
    if (banner) {
      banner.style.display = "flex";
      if (bannerCode) bannerCode.textContent = po.po_number;
      if (bannerStatus) {
        bannerStatus.className = `grn-status-badge ${po.status.toLowerCase()}`;
        bannerStatus.textContent = po.status;
      }
      if (bannerSupplier) {
        bannerSupplier.textContent = `Supplier: ${po.supplier_name} • Ordered Date: ${po.order_date}${po.expected_date ? ` • Due: ${po.expected_date}` : ""}`;
      }
      if (bannerCount) {
        bannerCount.textContent = `${po.items ? po.items.length : 0} items auto-loaded`;
      }
    }

    // Auto populate items from this PO into the GRN Items Table!
    if (po.items && po.items.length > 0) {
      this.formItems = po.items.map(item => {
        const remainingQty = Math.max(1, (item.qty_ordered || 0) - (item.qty_received || 0));
        return {
          item_id: item.item_id,
          item_name: item.item_name,
          unit: item.unit,
          qty: remainingQty,
          ordered_qty: item.qty_ordered,
          unit_cost: item.unit_cost,
          total: remainingQty * item.unit_cost
        };
      });
    } else {
      this.formItems = [];
    }

    this.renderFormItems();
    this.calculateFinancials();
    this.showToast(`Loaded ${this.formItems.length} items from Purchase Order ${po.po_number}`, "success");
  }

  clearSelectedPO() {
    const poSelect = document.getElementById("grnFormPOSelect");
    const poInput = document.getElementById("grnFormPO");
    const banner = document.getElementById("grnPoInfoBanner");

    if (poSelect) poSelect.value = "MANUAL";
    if (poInput) poInput.value = "";
    if (banner) banner.style.display = "none";

    // Set 1 default catalog row
    const catalog = this.getCatalogItems();
    const defaultItem = catalog[0] || { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 };
    this.formItems = [
      {
        item_id: defaultItem.code,
        item_name: defaultItem.name,
        unit: defaultItem.unit,
        qty: 100,
        ordered_qty: null,
        unit_cost: defaultItem.unitPrice || 45.00,
        total: (defaultItem.unitPrice || 45.00) * 100
      }
    ];

    this.renderFormItems();
    this.calculateFinancials();
  }

  createGrnForPO(poNumber) {
    this.switchView("form", poNumber);
    const formView = document.getElementById("grnFormView");
    if (formView) {
      formView.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ==========================================================================
     MATERIAL ITEMS CATALOG & TABLE ROWS
     ========================================================================== */
  getCatalogItems() {
    if (window.inventoryManager && window.inventoryManager.items && window.inventoryManager.items.length > 0) {
      return window.inventoryManager.items;
    }
    return [
      { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 },
      { code: "PAP-002", name: "250gsm Ivory Board A3", unit: "Sheets", unitPrice: 38.00 },
      { code: "PAP-003", name: "150gsm Glossy Art Paper A4", unit: "Sheets", unitPrice: 14.00 },
      { code: "INK-101", name: "Flora Solvent Cyan Ink (5L)", unit: "Liters", unitPrice: 8500.00 },
      { code: "INK-102", name: "Flora Solvent Magenta Ink (5L)", unit: "Liters", unitPrice: 6800.00 },
      { code: "INK-103", name: "Flora Solvent Yellow Ink (5L)", unit: "Liters", unitPrice: 6800.00 },
      { code: "FLX-201", name: "Frontlit Flex 280gsm (10ft × 50m)", unit: "Rolls", unitPrice: 18500.00 },
      { code: "FLX-202", name: "Star Heavy Flex 380gsm (10.5ft × 50m)", unit: "Rolls", unitPrice: 26000.00 },
      { code: "VIN-301", name: "Glossy Self-Adhesive Vinyl (4ft × 50m)", unit: "Rolls", unitPrice: 16800.00 },
      { code: "VIN-303", name: "One-Way Vision Film (4.2ft × 30m)", unit: "Rolls", unitPrice: 21500.00 },
      { code: "RIG-401", name: "5mm White Foam Board (4ft × 8ft)", unit: "Sheets", unitPrice: 3400.00 },
      { code: "RIG-402", name: "Rollup Stand Luxury Aluminium (2.5ft × 6ft)", unit: "Sets", unitPrice: 2800.00 }
    ];
  }

  addNewRow() {
    const catalog = this.getCatalogItems();
    const defaultItem = catalog[0] || { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 };

    this.formItems.push({
      item_id: defaultItem.code,
      item_name: defaultItem.name,
      unit: defaultItem.unit,
      qty: 1,
      ordered_qty: null,
      unit_cost: defaultItem.unitPrice || 0,
      total: (defaultItem.unitPrice || 0) * 1
    });

    this.renderFormItems();
    this.calculateFinancials();
  }

  removeRow(index) {
    if (this.formItems.length <= 1) {
      this.showToast("A GRN must contain at least 1 item row", "warning");
      return;
    }
    this.formItems.splice(index, 1);
    this.renderFormItems();
    this.calculateFinancials();
  }

  renderFormItems() {
    const tbody = document.getElementById("grnFormItemsTbody");
    if (!tbody) return;

    const catalog = this.getCatalogItems();
    tbody.innerHTML = "";

    this.formItems.forEach((row, index) => {
      const tr = document.createElement("tr");

      // Build options
      const optionsHtml = catalog.map(item => `
        <option value="${item.code}" ${item.code === row.item_id ? "selected" : ""}>
          ${item.name} (${item.code})
        </option>
      `).join("");

      const orderedHintHtml = row.ordered_qty ? `
        <span class="po-ordered-hint">
          <i class="fa-solid fa-clipboard-check"></i> Ordered: ${row.ordered_qty} ${row.unit}
        </span>
      ` : "";

      tr.innerHTML = `
        <td style="min-width: 260px;">
          <select class="grn-inline-input" onchange="window.grnManager.onItemSelectChange(${index}, this.value)">
            ${optionsHtml}
          </select>
        </td>
        <td style="width: 100px;">
          <span class="inv-unit-badge" style="font-size: 12px; font-weight: 600; color: var(--text);">${row.unit}</span>
        </td>
        <td style="width: 130px;">
          <input type="number" class="grn-inline-input text-right" min="1" step="1" value="${row.qty}" oninput="window.grnManager.onQtyChange(${index}, this.value)">
          ${orderedHintHtml}
        </td>
        <td style="width: 140px;">
          <input type="number" class="grn-inline-input text-right" min="0" step="0.01" value="${row.unit_cost}" oninput="window.grnManager.onCostChange(${index}, this.value)">
        </td>
        <td class="text-right" style="width: 150px; font-weight: 700; color: var(--text);">
          ${this.formatCurrency(row.total)}
        </td>
        <td class="text-center" style="width: 70px;">
          <button type="button" class="ant-btn-action" style="color: #ff4d4f; border-color: transparent;" title="Delete Row" onclick="window.grnManager.removeRow(${index})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  onItemSelectChange(index, itemCode) {
    const catalog = this.getCatalogItems();
    const found = catalog.find(i => i.code === itemCode);
    if (!found) return;

    this.formItems[index].item_id = found.code;
    this.formItems[index].item_name = found.name;
    this.formItems[index].unit = found.unit;
    this.formItems[index].unit_cost = found.unitPrice || 0;
    this.formItems[index].total = this.formItems[index].qty * this.formItems[index].unit_cost;

    this.renderFormItems();
    this.calculateFinancials();
  }

  onQtyChange(index, qtyVal) {
    const qty = parseFloat(qtyVal) || 0;
    this.formItems[index].qty = qty;
    this.formItems[index].total = qty * this.formItems[index].unit_cost;
    this.renderRowTotal(index);
    this.calculateFinancials();
  }

  onCostChange(index, costVal) {
    const cost = parseFloat(costVal) || 0;
    this.formItems[index].unit_cost = cost;
    this.formItems[index].total = this.formItems[index].qty * cost;
    this.renderRowTotal(index);
    this.calculateFinancials();
  }

  renderRowTotal(index) {
    const tbody = document.getElementById("grnFormItemsTbody");
    if (!tbody) return;
    const tr = tbody.children[index];
    if (tr) {
      const totalTd = tr.children[4];
      if (totalTd) totalTd.textContent = this.formatCurrency(this.formItems[index].total);
    }
  }

  calculateFinancials() {
    const subTotal = this.formItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const discountInput = document.getElementById("grnFormDiscount");
    const discount = parseFloat(discountInput?.value) || 0;
    const netTotal = Math.max(0, subTotal - discount);

    const subTotalElem = document.getElementById("grnFormSubTotal");
    const netTotalElem = document.getElementById("grnFormNetTotal");

    if (subTotalElem) subTotalElem.textContent = this.formatCurrency(subTotal);
    if (netTotalElem) netTotalElem.textContent = this.formatCurrency(netTotal);

    return { subTotal, discount, netTotal };
  }

  /* ==========================================================================
     SAVE & FINALIZE GRN
     ========================================================================== */
  saveGRN(isCompleted = false) {
    const grnNumber = document.getElementById("grnFormNumber")?.value || this.generateNextGrnNumber();
    const poNumber = document.getElementById("grnFormPO")?.value || document.getElementById("grnFormPOSelect")?.value || "";
    const receivedDate = document.getElementById("grnFormDate")?.value;
    const supplierName = document.getElementById("grnFormSupplier")?.value?.trim();
    const contactNo = document.getElementById("grnFormContact")?.value?.trim() || "";
    const receivedBy = document.getElementById("grnFormReceivedBy")?.value || "Admin User";
    const remarks = document.getElementById("grnFormRemarks")?.value || "";

    if (!supplierName) {
      this.showToast("Please enter or select a Supplier / Vendor", "error");
      return;
    }

    if (!receivedDate) {
      this.showToast("Please select the Received Date", "error");
      return;
    }

    if (this.formItems.length === 0) {
      this.showToast("Please add at least 1 item to the GRN", "error");
      return;
    }

    // Verify quantities
    for (const item of this.formItems) {
      if (!item.qty || item.qty <= 0) {
        this.showToast(`Please enter a valid received quantity for "${item.item_name}"`, "error");
        return;
      }
    }

    const { subTotal, discount, netTotal } = this.calculateFinancials();
    const status = isCompleted ? "Completed" : "Draft";
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);

    // Build finalized items list with batch IDs
    const finalizedItems = this.formItems.map((item, idx) => {
      let batchId = "PENDING";
      if (isCompleted) {
        batchId = `BAT-2610-${Math.floor(100 + Math.random() * 899)}`;
      }
      return {
        item_id: item.item_id,
        item_name: item.item_name,
        unit: item.unit,
        qty_received: item.qty,
        unit_cost: item.unit_cost,
        item_total: item.total,
        batch_id: batchId
      };
    });

    const newRecord = {
      grn_id: grnNumber,
      grn_number: grnNumber,
      purchase_order_no: poNumber || "DIR-GRN",
      supplier_id: `SUP-${Date.now().toString().slice(-3)}`,
      supplier_name: supplierName,
      supplier_contact: contactNo,
      supplier_invoice_no: contactNo,
      received_date: receivedDate,
      sub_total: subTotal,
      discount: discount,
      net_total: netTotal,
      received_by: receivedBy,
      status: status,
      created_at: dateStr,
      remarks: remarks,
      items: finalizedItems
    };

    // If completed: Create new batches in InventoryManager & update stock live!
    if (isCompleted && window.inventoryManager) {
      finalizedItems.forEach(item => {
        let catalogItem = window.inventoryManager.items.find(i => i.code === item.item_id);
        if (catalogItem) {
          if (!catalogItem.batches) catalogItem.batches = [];
          catalogItem.batches.push({
            id: item.batch_id,
            receivedDate: receivedDate,
            unitCost: item.unit_cost,
            initialQty: item.qty_received,
            availableQty: item.qty_received,
            supplier: supplierName,
            grnNo: grnNumber
          });

          if (!catalogItem.transactions) catalogItem.transactions = [];
          catalogItem.transactions.unshift({
            id: `TXN-${Date.now().toString().slice(-4)}`,
            date: dateStr,
            type: "ADD",
            batchId: item.batch_id,
            qty: item.qty_received,
            reason: `GRN Completed (${grnNumber})`,
            operator: receivedBy,
            remarks: `Supplier: ${supplierName}${poNumber ? ` (PO: ${poNumber})` : ""}${contactNo ? ` [Tel: ${contactNo}]` : ""}`
          });

          catalogItem.supplier = supplierName;
        }
      });

      window.inventoryManager.saveData();
      window.inventoryManager.render();
    }

    // Update PO Status if completed
    if (isCompleted && poNumber) {
      this.updatePurchaseOrderStatus(poNumber, finalizedItems);
    }

    this.grnRecords.unshift(newRecord);
    this.saveData();

    this.showToast(
      isCompleted
        ? `GRN ${grnNumber} completed! Stock batches and inventory values updated successfully.`
        : `GRN ${grnNumber} saved as Draft! You can finalize it anytime.`,
      "success"
    );

    this.switchView("list");

    // If completed, view the printable receipt
    if (isCompleted) {
      setTimeout(() => this.viewGRN(grnNumber), 400);
    }
  }

  finalizeDraftGRN(grnNumber) {
    const rec = this.grnRecords.find(r => r.grn_number === grnNumber);
    if (!rec || rec.status === "Completed") return;

    const confirmed = confirm(`Are you sure you want to complete ${grnNumber}? This will create stock batches and increase warehouse inventory values.`);
    if (!confirmed) return;

    rec.status = "Completed";
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);

    // Create batches
    if (window.inventoryManager && rec.items) {
      rec.items.forEach(item => {
        item.batch_id = `BAT-2610-${Math.floor(100 + Math.random() * 899)}`;
        let catalogItem = window.inventoryManager.items.find(i => i.code === item.item_id);
        if (catalogItem) {
          if (!catalogItem.batches) catalogItem.batches = [];
          catalogItem.batches.push({
            id: item.batch_id,
            receivedDate: rec.received_date,
            unitCost: item.unit_cost,
            initialQty: item.qty_received,
            availableQty: item.qty_received,
            supplier: rec.supplier_name,
            grnNo: rec.grn_number
          });

          if (!catalogItem.transactions) catalogItem.transactions = [];
          catalogItem.transactions.unshift({
            id: `TXN-${Date.now().toString().slice(-4)}`,
            date: dateStr,
            type: "ADD",
            batchId: item.batch_id,
            qty: item.qty_received,
            reason: `GRN Completed (${rec.grn_number})`,
            operator: rec.received_by,
            remarks: `Supplier: ${rec.supplier_name}${rec.purchase_order_no ? ` (PO: ${rec.purchase_order_no})` : ""}${rec.supplier_contact ? ` [Tel: ${rec.supplier_contact}]` : ""}`
          });
        }
      });

      window.inventoryManager.saveData();
      window.inventoryManager.render();
    }

    if (rec.purchase_order_no) {
      this.updatePurchaseOrderStatus(rec.purchase_order_no, rec.items);
    }

    this.saveData();
    this.render();
    this.showToast(`GRN ${grnNumber} is now Completed and stock batches have been updated!`, "success");
  }

  updatePurchaseOrderStatus(poNumber, receivedItems) {
    if (!poNumber) return;
    const po = this.purchaseOrders.find(p => p.po_number === poNumber);
    if (!po) return;

    if (receivedItems && po.items) {
      receivedItems.forEach(recItem => {
        const poItem = po.items.find(i => i.item_id === recItem.item_id);
        if (poItem) {
          poItem.qty_received = (poItem.qty_received || 0) + (recItem.qty_received || 0);
        }
      });

      const allReceived = po.items.every(i => (i.qty_received || 0) >= (i.qty_ordered || 0));
      const anyReceived = po.items.some(i => (i.qty_received || 0) > 0);

      if (allReceived) {
        po.status = "Completed";
      } else if (anyReceived) {
        po.status = "Partial";
      }
    }

    this.savePOData();
    this.renderOpenPoBadge();
    this.renderPOTable();
  }

  /* ==========================================================================
     CREATE NEW PURCHASE ORDER (PO) MODAL LOGIC
     ========================================================================== */
  openCreatePOModal(defaultSupplier = null) {
    const poNumInput = document.getElementById("newPoNumber");
    const orderDateInput = document.getElementById("newPoDate");
    const expDateInput = document.getElementById("newPoExpectedDate");
    const supplierInput = document.getElementById("newPoSupplier");
    const contactInput = document.getElementById("newPoContact");
    const remarksInput = document.getElementById("newPoRemarks");

    const today = new Date().toISOString().split("T")[0];
    const expDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const supName = defaultSupplier || "PaperPro Lanka";
    const foundSup = this.suppliers.find(s => s.name.toLowerCase() === supName.toLowerCase());

    if (poNumInput) poNumInput.value = this.generateNextPONumber();
    if (orderDateInput) orderDateInput.value = today;
    if (expDateInput) expDateInput.value = expDate;
    if (supplierInput) supplierInput.value = supName;
    if (contactInput) contactInput.value = foundSup ? foundSup.phone : "077 123 4567";
    if (remarksInput) remarksInput.value = "";

    // Initialize with 2 items from catalog
    const catalog = this.getCatalogItems();
    this.newPoItems = [
      {
        item_id: catalog[0]?.code || "PAP-001",
        item_name: catalog[0]?.name || "300gsm Art Board SRA3",
        unit: catalog[0]?.unit || "Sheets",
        qty: 500,
        unit_cost: catalog[0]?.unitPrice || 45.00,
        total: (catalog[0]?.unitPrice || 45.00) * 500
      },
      {
        item_id: catalog[3]?.code || "INK-101",
        item_name: catalog[3]?.name || "Flora Solvent Cyan Ink (5L)",
        unit: catalog[3]?.unit || "Liters",
        qty: 4,
        unit_cost: catalog[3]?.unitPrice || 8500.00,
        total: (catalog[3]?.unitPrice || 8500.00) * 4
      }
    ];

    this.renderNewPoItems();
    this.calculateNewPoTotal();
    this.openModal("createPOModal");
  }

  addNewPoRow() {
    const catalog = this.getCatalogItems();
    const defaultItem = catalog[0] || { code: "PAP-001", name: "300gsm Art Board SRA3", unit: "Sheets", unitPrice: 45.00 };

    this.newPoItems.push({
      item_id: defaultItem.code,
      item_name: defaultItem.name,
      unit: defaultItem.unit,
      qty: 10,
      unit_cost: defaultItem.unitPrice || 0,
      total: (defaultItem.unitPrice || 0) * 10
    });

    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  removeNewPoRow(index) {
    if (this.newPoItems.length <= 1) {
      this.showToast("A Purchase Order must contain at least 1 item line", "warning");
      return;
    }
    this.newPoItems.splice(index, 1);
    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  renderNewPoItems() {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody) return;

    const catalog = this.getCatalogItems();
    tbody.innerHTML = "";

    this.newPoItems.forEach((row, index) => {
      const tr = document.createElement("tr");

      const optionsHtml = catalog.map(item => `
        <option value="${item.code}" ${item.code === row.item_id ? "selected" : ""}>
          ${item.name} (${item.code})
        </option>
      `).join("");

      tr.innerHTML = `
        <td style="min-width: 250px;">
          <select class="grn-inline-input" onchange="window.grnManager.onNewPoItemSelectChange(${index}, this.value)">
            ${optionsHtml}
          </select>
        </td>
        <td style="width: 100px;">
          <span class="inv-unit-badge" style="font-size: 12px; font-weight: 600; color: var(--text);">${row.unit}</span>
        </td>
        <td style="width: 120px;">
          <input type="number" class="grn-inline-input text-right" min="1" step="1" value="${row.qty}" oninput="window.grnManager.onNewPoQtyChange(${index}, this.value)">
        </td>
        <td style="width: 140px;">
          <input type="number" class="grn-inline-input text-right" min="0" step="0.01" value="${row.unit_cost}" oninput="window.grnManager.onNewPoCostChange(${index}, this.value)">
        </td>
        <td class="text-right" style="width: 150px; font-weight: 700; color: #1677ff;">
          ${this.formatCurrency(row.total)}
        </td>
        <td class="text-center" style="width: 60px;">
          <button type="button" class="ant-btn-action" style="color: #ff4d4f; border-color: transparent;" title="Delete Row" onclick="window.grnManager.removeNewPoRow(${index})">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  onNewPoItemSelectChange(index, itemCode) {
    const catalog = this.getCatalogItems();
    const found = catalog.find(i => i.code === itemCode);
    if (!found) return;

    this.newPoItems[index].item_id = found.code;
    this.newPoItems[index].item_name = found.name;
    this.newPoItems[index].unit = found.unit;
    this.newPoItems[index].unit_cost = found.unitPrice || 0;
    this.newPoItems[index].total = this.newPoItems[index].qty * this.newPoItems[index].unit_cost;

    this.renderNewPoItems();
    this.calculateNewPoTotal();
  }

  onNewPoQtyChange(index, qtyVal) {
    const qty = parseFloat(qtyVal) || 0;
    this.newPoItems[index].qty = qty;
    this.newPoItems[index].total = qty * this.newPoItems[index].unit_cost;
    this.calculateNewPoTotal();
    this.renderNewPoRowTotal(index);
  }

  onNewPoCostChange(index, costVal) {
    const cost = parseFloat(costVal) || 0;
    this.newPoItems[index].unit_cost = cost;
    this.newPoItems[index].total = this.newPoItems[index].qty * cost;
    this.calculateNewPoTotal();
    this.renderNewPoRowTotal(index);
  }

  renderNewPoRowTotal(index) {
    const tbody = document.getElementById("newPoItemsTbody");
    if (!tbody) return;
    const tr = tbody.children[index];
    if (tr) {
      const totalTd = tr.children[4];
      if (totalTd) totalTd.textContent = this.formatCurrency(this.newPoItems[index].total);
    }
  }

  calculateNewPoTotal() {
    const total = this.newPoItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const display = document.getElementById("newPoTotalDisplay");
    if (display) display.textContent = this.formatCurrency(total);
    return total;
  }

  saveNewPurchaseOrder() {
    const poNum = document.getElementById("newPoNumber")?.value || this.generateNextPONumber();
    const orderDate = document.getElementById("newPoDate")?.value;
    const expDate = document.getElementById("newPoExpectedDate")?.value;
    const supplier = document.getElementById("newPoSupplier")?.value?.trim();
    const contact = document.getElementById("newPoContact")?.value?.trim() || "";
    const remarks = document.getElementById("newPoRemarks")?.value?.trim() || "";

    if (!supplier) {
      this.showToast("Please enter or select a Supplier for the Purchase Order", "error");
      return;
    }

    if (!orderDate) {
      this.showToast("Please select the Order Date", "error");
      return;
    }

    if (this.newPoItems.length === 0) {
      this.showToast("Please add at least 1 item to the Purchase Order", "error");
      return;
    }

    for (const item of this.newPoItems) {
      if (!item.qty || item.qty <= 0) {
        this.showToast(`Please enter a valid order quantity for "${item.item_name}"`, "error");
        return;
      }
    }

    const totalAmount = this.calculateNewPoTotal();

    const newPO = {
      po_number: poNum,
      order_date: orderDate,
      expected_date: expDate,
      supplier_name: supplier,
      supplier_contact: contact,
      status: "Pending",
      total_amount: totalAmount,
      created_by: "Admin User",
      remarks: remarks,
      items: this.newPoItems.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        unit: item.unit,
        qty_ordered: item.qty,
        qty_received: 0,
        unit_cost: item.unit_cost,
        item_total: item.total
      }))
    };

    this.purchaseOrders.unshift(newPO);
    this.savePOData();
    this.renderOpenPoBadge();
    this.renderPOTable();
    this.populatePOSupplierFilter();

    this.closeModal("createPOModal");

    // If currently in the GRN creation form, automatically select this newly created PO and load its items!
    if (this.currentView === "form") {
      this.populatePOSelect(newPO.po_number);
      const poSelect = document.getElementById("grnFormPOSelect");
      if (poSelect) poSelect.value = newPO.po_number;
      this.onPurchaseOrderSelect(newPO.po_number);
      this.showToast(`Purchase Order ${newPO.po_number} created and items loaded for GRN!`, "success");
    } else {
      this.showToast(`Purchase Order ${newPO.po_number} created successfully!`, "success");
      if (this.currentView !== "po") {
        this.switchView("po");
      }
    }
  }

  /* ==========================================================================
     VIEW & PRINT PURCHASE ORDER
     ========================================================================== */
  viewPO(poNumber) {
    const po = this.purchaseOrders.find(p => p.po_number === poNumber);
    if (!po) return;

    this.activePoContext = po;

    const docNo = document.getElementById("poDocNumber");
    const docStatus = document.getElementById("poDocStatus");
    const docSupplier = document.getElementById("poDocSupplier");
    const docDate = document.getElementById("poDocDate");
    const docContact = document.getElementById("poDocContact");
    const docExpDate = document.getElementById("poDocExpectedDate");
    const docRemarks = document.getElementById("poDocRemarks");
    const docTotal = document.getElementById("poDocTotal");
    const tbody = document.getElementById("poDocItemsTbody");

    if (docNo) docNo.textContent = po.po_number;
    if (docStatus) {
      docStatus.className = `grn-status-badge ${po.status.toLowerCase()}`;
      docStatus.textContent = po.status;
    }
    if (docSupplier) docSupplier.textContent = po.supplier_name;
    if (docDate) docDate.textContent = po.order_date;
    if (docContact) docContact.textContent = po.supplier_contact || "N/A";
    if (docExpDate) docExpDate.textContent = po.expected_date || "N/A";
    if (docRemarks) docRemarks.textContent = po.remarks || "Standard packaging & delivery terms apply.";
    if (docTotal) docTotal.textContent = this.formatCurrency(po.total_amount);

    if (tbody) {
      tbody.innerHTML = "";
      if (po.items && po.items.length > 0) {
        po.items.forEach((item, idx) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${item.item_name}</strong> <span style="font-size: 11px; color: #666;">(${item.item_id})</span></td>
            <td>${item.unit}</td>
            <td class="text-right"><strong>${(item.qty_ordered || 0).toLocaleString()}</strong></td>
            <td class="text-right" style="color: ${item.qty_received >= item.qty_ordered ? '#52c41a' : '#faad14'}; font-weight: 600;">
              ${(item.qty_received || 0).toLocaleString()}
            </td>
            <td class="text-right">${this.formatCurrency(item.unit_cost)}</td>
            <td class="text-right" style="font-weight: bold;">${this.formatCurrency(item.item_total)}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    // Toggle "Create GRN for this PO" button visibility if already completed
    const poCreateGrnActionBtn = document.getElementById("poCreateGrnActionBtn");
    if (poCreateGrnActionBtn) {
      poCreateGrnActionBtn.style.display = po.status === "Completed" ? "none" : "inline-flex";
    }

    this.openModal("viewPOModal");
  }

  triggerPrintPO() {
    const printArea = document.getElementById("poPrintArea");
    if (!printArea) return;

    const printWin = window.open("", "_blank", "width=850,height=900");
    if (!printWin) {
      alert("Please allow popups to print the Purchase Order Document.");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Order - ${this.activePoContext?.po_number || "Document"}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 24px; color: #111; }
          .grn-voucher-header { display: flex; justify-content: space-between; border-bottom: 2px solid #1677ff; padding-bottom: 14px; margin-bottom: 16px; }
          .grn-voucher-brand strong { font-size: 22px; color: #000; display: block; }
          .grn-voucher-brand span { font-size: 12px; letter-spacing: 2px; color: #f97316; font-weight: 800; }
          .grn-voucher-meta-table { width: 100%; margin-bottom: 18px; font-size: 13px; border-collapse: collapse; }
          .grn-voucher-meta-table td { padding: 5px 8px; }
          .grn-voucher-items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
          .grn-voucher-items-table th { background: #f0f5ff; color: #1677ff; border: 1px solid #d9d9d9; padding: 8px 10px; font-weight: bold; }
          .grn-voucher-items-table td { border: 1px solid #e8e8e8; padding: 7px 10px; }
          .text-right { text-align: right; }
          .grn-code-badge { font-family: monospace; font-weight: bold; background: #e6f4ff; color: #1677ff; padding: 2px 6px; border-radius: 4px; }
          .grn-status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid #faad14; color: #faad14; background: #fffbe6; }
          .grn-status-badge.completed { border-color: #52c41a; color: #52c41a; background: #f6ffed; }
          .grn-voucher-signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
          .grn-sig-box { width: 180px; border-top: 1px dashed #666; text-align: center; font-size: 12px; color: #555; padding-top: 5px; }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 350);
  }

  /* ==========================================================================
     VIEW & PRINT GRN VOUCHER
     ========================================================================== */
  viewGRN(grnNumber) {
    const rec = this.grnRecords.find(r => r.grn_number === grnNumber);
    if (!rec) return;

    this.activeGrnContext = rec;

    const docNo = document.getElementById("grnDocNumber");
    const docDate = document.getElementById("grnDocDate");
    const docSupplier = document.getElementById("grnDocSupplier");
    const docContact = document.getElementById("grnDocContact") || document.getElementById("grnDocInvoice");
    const docPO = document.getElementById("grnDocPO");
    const docStatus = document.getElementById("grnDocStatus");
    const docReceivedBy = document.getElementById("grnDocReceivedBy");
    const docRemarks = document.getElementById("grnDocRemarks");
    const docSubTotal = document.getElementById("grnDocSubTotal");
    const docDiscount = document.getElementById("grnDocDiscount");
    const docNetTotal = document.getElementById("grnDocNetTotal");
    const tbody = document.getElementById("grnDocItemsTbody");

    if (docNo) docNo.textContent = rec.grn_number;
    if (docDate) docDate.textContent = rec.received_date;
    if (docSupplier) docSupplier.textContent = rec.supplier_name;
    if (docContact) docContact.textContent = rec.supplier_contact || rec.supplier_invoice_no || "N/A";
    if (docPO) docPO.textContent = rec.purchase_order_no || "N/A";
    if (docStatus) {
      docStatus.className = `grn-status-badge ${rec.status === "Completed" ? "completed" : "draft"}`;
      docStatus.textContent = rec.status;
    }
    if (docReceivedBy) docReceivedBy.textContent = rec.received_by;
    if (docRemarks) docRemarks.textContent = rec.remarks || "No additional notes provided.";
    if (docSubTotal) docSubTotal.textContent = this.formatCurrency(rec.sub_total);
    if (docDiscount) docDiscount.textContent = this.formatCurrency(rec.discount || 0);
    if (docNetTotal) docNetTotal.textContent = this.formatCurrency(rec.net_total);

    if (tbody) {
      tbody.innerHTML = "";
      if (rec.items && rec.items.length > 0) {
        rec.items.forEach((item, idx) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${item.item_name}</strong> <span style="font-size: 11px; color: #666;">(${item.item_id})</span></td>
            <td><span class="grn-code-badge" style="font-size: 11px;">${item.batch_id || "PENDING"}</span></td>
            <td>${item.unit}</td>
            <td class="text-right"><strong>${(item.qty_received || 0).toLocaleString()}</strong></td>
            <td class="text-right">${this.formatCurrency(item.unit_cost)}</td>
            <td class="text-right" style="font-weight: bold;">${this.formatCurrency(item.item_total)}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

    this.openModal("viewGrnModal");
  }

  triggerPrintGrn() {
    const printArea = document.getElementById("grnPrintArea");
    if (!printArea) return;

    const printWin = window.open("", "_blank", "width=850,height=900");
    if (!printWin) {
      alert("Please allow popups to print the GRN Document.");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GRN - ${this.activeGrnContext?.grn_number || "Document"}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 24px; color: #111; }
          .grn-voucher-header { display: flex; justify-content: space-between; border-bottom: 2px solid #1677ff; padding-bottom: 14px; margin-bottom: 16px; }
          .grn-voucher-brand strong { font-size: 22px; color: #000; display: block; }
          .grn-voucher-brand span { font-size: 12px; letter-spacing: 2px; color: #f97316; font-weight: 800; }
          .grn-voucher-meta-table { width: 100%; margin-bottom: 18px; font-size: 13px; border-collapse: collapse; }
          .grn-voucher-meta-table td { padding: 5px 8px; }
          .grn-voucher-items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
          .grn-voucher-items-table th { background: #f0f5ff; color: #1677ff; border: 1px solid #d9d9d9; padding: 8px 10px; font-weight: bold; }
          .grn-voucher-items-table td { border: 1px solid #e8e8e8; padding: 7px 10px; }
          .text-right { text-align: right; }
          .grn-code-badge { font-family: monospace; font-weight: bold; background: #e6f4ff; color: #1677ff; padding: 2px 6px; border-radius: 4px; }
          .grn-status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid #52c41a; color: #52c41a; background: #f6ffed; }
          .grn-status-badge.draft { border-color: #faad14; color: #faad14; background: #fffbe6; }
          .grn-voucher-signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
          .grn-sig-box { width: 180px; border-top: 1px dashed #666; text-align: center; font-size: 12px; color: #555; padding-top: 5px; }
        </style>
      </head>
      <body>
        ${printArea.innerHTML}
      </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 350);
  }

  /* ==========================================================================
     EXPORT CSV
     ========================================================================== */
  exportCSV() {
    if (!this.grnRecords || this.grnRecords.length === 0) {
      this.showToast("No GRN records available to export", "warning");
      return;
    }

    const headers = ["GRN Number", "Purchase Order", "Supplier", "Supplier Contact", "Received Date", "Items Count", "Sub Total (LKR)", "Discount (LKR)", "Net Total (LKR)", "Received By", "Status"];
    const rows = this.grnRecords.map(r => [
      `"${r.grn_number}"`,
      `"${r.purchase_order_no || ''}"`,
      `"${r.supplier_name}"`,
      `"${r.supplier_contact || r.supplier_invoice_no || ''}"`,
      r.received_date,
      r.items ? r.items.length : 0,
      r.sub_total.toFixed(2),
      (r.discount || 0).toFixed(2),
      r.net_total.toFixed(2),
      `"${r.received_by}"`,
      `"${r.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Sanjeewa_GRN_Records_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    this.showToast("GRN records CSV exported successfully!", "success");
  }

  /* Modal Helpers */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  }

  showToast(message, type = "success") {
    const container = document.getElementById("poToastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `po-toast ${type}`;

    let icon = "fa-check-circle";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "warning") icon = "fa-circle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 260);
    }, 3500);
  }
}

// Global initialization
if (typeof window !== "undefined") {
  window.GRNManager = GRNManager;
  document.addEventListener("DOMContentLoaded", () => {
    window.grnManager = new GRNManager();
  });
}
