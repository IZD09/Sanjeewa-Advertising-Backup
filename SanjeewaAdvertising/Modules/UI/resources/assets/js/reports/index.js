/**
 * SanjeewaAdvertising - Reports Module Barrel Index
 *
 * Exports:
 * - ReportsDataLoader
 * - Core Base Classes (`BaseReportChartHandler`, `BaseReportTableHandler`)
 * - Shared Processes (`NavigationProcess`, `DatePresetProcess`, `ExportProcess`, `MetricsProcess`)
 * - 1. Sales & Orders (`sales-orders/charts`, `sales-orders/tables`)
 * - 2. Payments & Cash Flow (`payments-cashflow/charts`, `payments-cashflow/tables`)
 * - 3. Customer Receivables (`customer-receivables/charts`, `customer-receivables/tables`)
 * - 4. Inventory & Stock (`inventory-stock/charts`, `inventory-stock/tables`)
 * - 5. Supplier & GRN (`supplier-grn/charts`, `supplier-grn/tables`)
 * - 6. Profit & Loss Statement (`profit-loss/charts`, `profit-loss/tables`)
 */

export { ReportsDataLoader } from "./ReportsDataLoader.js";
export * from "./core/index.js";
export * from "./processes/index.js";

// 1. Sales & Orders
export * from "./sales-orders/index.js";

// 2. Payments & Cash Flow (Incl. Operating Expenses)
export * from "./payments-cashflow/index.js";

// 3. Customer Receivables
export * from "./customer-receivables/index.js";

// 4. Inventory & Stock
export * from "./inventory-stock/index.js";

// 5. Supplier & GRN
export * from "./supplier-grn/index.js";

// 6. Profit & Loss Statement
export * from "./profit-loss/index.js";
