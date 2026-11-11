/**
 * SanjeewaAdvertising - Inventory & Stock Table Handler
 *
 * Extends BaseReportTableHandler to manage `#inventoryTable`.
 */

import { BaseReportTableHandler } from "../../../core/BaseReportTableHandler.js";
import { InventoryStockRowBuilder } from "../builders/InventoryStockRowBuilder.js";

export class InventoryStockTableHandler extends BaseReportTableHandler {
  constructor(options = {}) {
    super({
      tableId: "inventoryTable",
      tbodyId: "inventoryTableBody",
      paginationInfoId: "inventoryPaginationInfo",
      paginationControlsId: "inventoryPaginationControls",
      pageSize: 15,
      colspan: 7,
      itemLabel: "stock items",
      rowBuilder: InventoryStockRowBuilder,
      showToast: options.showToast
    });
  }
}

export default InventoryStockTableHandler;
