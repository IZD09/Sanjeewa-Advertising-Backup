/**
 * SanjeewaAdvertising - Profit & Loss Statement Table Handler
 *
 * Extends BaseReportTableHandler to manage `#profitLossTable`.
 */

import { BaseReportTableHandler } from "../../../core/BaseReportTableHandler.js";
import { ProfitLossRowBuilder } from "../builders/ProfitLossRowBuilder.js";

export class ProfitLossTableHandler extends BaseReportTableHandler {
  constructor(options = {}) {
    super({
      tableId: "profitLossTable",
      colspan: 2,
      itemLabel: "statement lines",
      rowBuilder: ProfitLossRowBuilder,
      showToast: options.showToast
    });
  }
}

export default ProfitLossTableHandler;
