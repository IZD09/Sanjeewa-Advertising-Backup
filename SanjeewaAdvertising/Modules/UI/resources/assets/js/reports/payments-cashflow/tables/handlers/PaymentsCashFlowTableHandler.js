/**
 * SanjeewaAdvertising - Payments, Cash Flow & Operating Expenses Table Handlers
 *
 * Extends BaseReportTableHandler to manage both `#cashFlowTable` and `#operatingExpensesTable`.
 */

import { BaseReportTableHandler } from "../../../core/BaseReportTableHandler.js";
import { CashFlowRowBuilder, OperatingExpenseRowBuilder } from "../builders/CashFlowRowBuilder.js";

export class PaymentsCashFlowTableHandler extends BaseReportTableHandler {
  constructor(options = {}) {
    super({
      tableId: options.tableId || "cashFlowTable",
      tbodyId: "cashFlowTableBody",
      paginationInfoId: "cashFlowPaginationInfo",
      paginationControlsId: "cashFlowPaginationControls",
      pageSize: 15,
      colspan: 7,
      itemLabel: "transactions",
      rowBuilder: CashFlowRowBuilder,
      showToast: options.showToast
    });
  }
}

export class OperatingExpensesReportTableHandler extends BaseReportTableHandler {
  constructor(options = {}) {
    super({
      tableId: "operatingExpensesTable",
      tbodyId: "operatingExpensesTableBody",
      paginationInfoId: "operatingExpensesPaginationInfo",
      paginationControlsId: "operatingExpensesPaginationControls",
      pageSize: 15,
      colspan: 8,
      itemLabel: "operating expenses",
      rowBuilder: OperatingExpenseRowBuilder,
      showToast: options.showToast
    });
  }
}

export default PaymentsCashFlowTableHandler;
