/**
 * SanjeewaAdvertising - Supplier & GRN Table Handler
 *
 * Extends BaseReportTableHandler to manage `#suppliersTable`.
 */

import { BaseReportTableHandler } from "../../../core/BaseReportTableHandler.js";
import { SupplierGrnRowBuilder } from "../builders/SupplierGrnRowBuilder.js";

export class SupplierGrnTableHandler extends BaseReportTableHandler {
  constructor(options = {}) {
    super({
      tableId: "suppliersTable",
      tbodyId: "suppliersTableBody",
      paginationInfoId: "suppliersPaginationInfo",
      paginationControlsId: "suppliersPaginationControls",
      pageSize: 15,
      colspan: 7,
      itemLabel: "suppliers",
      rowBuilder: SupplierGrnRowBuilder,
      showToast: options.showToast
    });
  }
}

export default SupplierGrnTableHandler;
