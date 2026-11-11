/**
 * SanjeewaAdvertising - Payments & Cash Flow Chart Handler
 *
 * Extends BaseReportChartHandler to coordinate all 6 individual Payments & Cash Flow charts
 * (including Operating Expenses Breakdown & Paid vs Pending Status) in `tabPayments`.
 */

import { BaseReportChartHandler } from "../../../core/BaseReportChartHandler.js";
import {
  CashFlowChannelsChart,
  OperatingExpensesChart,
  OperatingExpensesStatusChart,
  PaymentMethodsChart,
  NetCashFlowTrendChart,
  ChannelDistributionChart
} from "../classes/index.js";

export class PaymentsCashFlowChartHandler extends BaseReportChartHandler {
  constructor(options = {}) {
    super({
      tabGroup: "paymentCharts",
      chartRegistry: options.chartRegistry || {}
    });

    this.cashFlowChannelsChart = new CashFlowChannelsChart({ chartRegistry: this.charts });
    this.operatingExpensesChart = new OperatingExpensesChart({ chartRegistry: this.charts });
    this.operatingExpensesStatusChart = new OperatingExpensesStatusChart({ chartRegistry: this.charts });
    this.paymentMethodsChart = new PaymentMethodsChart({ chartRegistry: this.charts });
    this.netCashFlowTrendChart = new NetCashFlowTrendChart({ chartRegistry: this.charts });
    this.channelDistributionChart = new ChannelDistributionChart({ chartRegistry: this.charts });
  }

  renderCharts(payload = {}) {
    if (payload.cashFlow) {
      this.cashFlowChannelsChart.render(payload.cashFlow);
      this.netCashFlowTrendChart.render(payload.cashFlow);
    }

    if (payload.operatingExpensesByCategory) {
      this.operatingExpensesChart.render(payload.operatingExpensesByCategory);
    }

    if (payload.operatingExpensesStatus) {
      this.operatingExpensesStatusChart.render(payload.operatingExpensesStatus);
    }

    if (payload.paymentMethods) {
      this.paymentMethodsChart.render(payload.paymentMethods);
    }

    if (payload.channelDistribution) {
      this.channelDistributionChart.render(payload.channelDistribution);
    }
  }
}

export default PaymentsCashFlowChartHandler;
