/**
 * SanjeewaAdvertising - Sales & Orders Table Handler
 *
 * Extends BaseReportTableHandler to manage `#salesTable` sorting, filtering, and reset.
 */

import { BaseReportTableHandler } from "../../../core/BaseReportTableHandler.js";
import { SalesOrderRowBuilder } from "../builders/SalesOrderRowBuilder.js";

export class SalesOrdersTableHandler extends BaseReportTableHandler {
  constructor(options = {}) {
    super({
      tableId: "salesTable",
      tbodyId: "salesTableBody",
      paginationInfoId: "salesPaginationInfo",
      paginationControlsId: "salesPaginationControls",
      pageSize: 15,
      colspan: 8,
      itemLabel: "orders",
      rowBuilder: SalesOrderRowBuilder,
      showToast: options.showToast
    });
  }
}

export default SalesOrdersTableHandler;
