/**
 * SanjeewaAdvertising - Customer Receivables Table Handler
 *
 * Extends BaseReportTableHandler to manage `#receivablesTable`.
 */

import { BaseReportTableHandler } from "../../../core/BaseReportTableHandler.js";
import { CustomerReceivableRowBuilder } from "../builders/CustomerReceivableRowBuilder.js";

export class CustomerReceivablesTableHandler extends BaseReportTableHandler {
  constructor(options = {}) {
    super({
      tableId: "receivablesTable",
      tbodyId: "receivablesTableBody",
      paginationInfoId: "receivablesPaginationInfo",
      paginationControlsId: "receivablesPaginationControls",
      pageSize: 15,
      colspan: 8,
      itemLabel: "customers",
      rowBuilder: CustomerReceivableRowBuilder,
      showToast: options.showToast
    });
  }
}

export default CustomerReceivablesTableHandler;
