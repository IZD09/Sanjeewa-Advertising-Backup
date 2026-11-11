/**
 * SanjeewaAdvertising - Supplier & GRN Chart Handler
 *
 * Extends BaseReportChartHandler to coordinate all 3 individual Supplier & GRN charts.
 */

import { BaseReportChartHandler } from "../../../core/BaseReportChartHandler.js";
import {
  SupplierPayablesChart,
  SupplierShareChart,
  SupplierSettlementRateChart
} from "../classes/index.js";

export class SupplierGrnChartHandler extends BaseReportChartHandler {
  constructor(options = {}) {
    super({
      tabGroup: "supplierCharts",
      chartRegistry: options.chartRegistry || {}
    });

    this.supplierPayablesChart = new SupplierPayablesChart({ chartRegistry: this.charts });
    this.supplierShareChart = new SupplierShareChart({ chartRegistry: this.charts });
    this.supplierSettlementRateChart = new SupplierSettlementRateChart({ chartRegistry: this.charts });
  }

  renderCharts(payload = {}) {
    if (payload.suppliers) {
      this.supplierPayablesChart.render(payload.suppliers);
      this.supplierShareChart.render(payload.suppliers);
      this.supplierSettlementRateChart.render(payload.suppliers);
    }
  }
}

export default SupplierGrnChartHandler;
