/**
 * SanjeewaAdvertising - Sales & Orders Chart Handler
 *
 * Extends BaseReportChartHandler to coordinate the 4 individual Sales & Orders charts.
 */

import { BaseReportChartHandler } from "../../../core/BaseReportChartHandler.js";
import {
  SalesTrendChart,
  SalesByCategoryChart,
  OrderStatusChart,
  OrderVolumeTrendChart
} from "../classes/index.js";

export class SalesOrdersChartHandler extends BaseReportChartHandler {
  constructor(options = {}) {
    super({
      tabGroup: "salesCharts",
      chartRegistry: options.chartRegistry || {}
    });

    this.salesTrendChart = new SalesTrendChart({ chartRegistry: this.charts });
    this.salesByCategoryChart = new SalesByCategoryChart({ chartRegistry: this.charts });
    this.orderStatusChart = new OrderStatusChart({ chartRegistry: this.charts });
    this.orderVolumeTrendChart = new OrderVolumeTrendChart({ chartRegistry: this.charts });
  }

  renderCharts(payload = {}) {
    if (payload.salesTrend) {
      this.salesTrendChart.render(payload.salesTrend);
      this.orderVolumeTrendChart.render(payload.salesTrend);
    }

    if (payload.salesCategories) {
      this.salesByCategoryChart.render(payload.salesCategories);
    }

    if (payload.orderStatus) {
      this.orderStatusChart.render(payload.orderStatus);
    }
  }
}

export default SalesOrdersChartHandler;
