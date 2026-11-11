/**
 * SanjeewaAdvertising - Customer Receivables Chart Handler
 *
 * Extends BaseReportChartHandler to coordinate all 3 individual Customer Receivables charts.
 */

import { BaseReportChartHandler } from "../../../core/BaseReportChartHandler.js";
import {
  ReceivablesAgingChart,
  CustomerBalancesChart,
  ReceivablesStatusChart
} from "../classes/index.js";

export class CustomerReceivablesChartHandler extends BaseReportChartHandler {
  constructor(options = {}) {
    super({
      tabGroup: "receivablesCharts",
      chartRegistry: options.chartRegistry || {}
    });

    this.receivablesAgingChart = new ReceivablesAgingChart({ chartRegistry: this.charts });
    this.customerBalancesChart = new CustomerBalancesChart({ chartRegistry: this.charts });
    this.receivablesStatusChart = new ReceivablesStatusChart({ chartRegistry: this.charts });
  }

  renderCharts(payload = {}) {
    if (payload.receivablesAging) {
      this.receivablesAgingChart.render(payload.receivablesAging);
    }

    if (payload.topCustomers) {
      this.customerBalancesChart.render(payload.topCustomers);
    }

    if (payload.receivablesStatus) {
      this.receivablesStatusChart.render(payload.receivablesStatus);
    }
  }
}

export default CustomerReceivablesChartHandler;
