/**
 * SanjeewaAdvertising - Channel Distribution Doughnut Chart
 * Extends BaseReportChart.
 */

import { BaseReportChart } from "../../../core/BaseReportChart.js";

export class ChannelDistributionChart extends BaseReportChart {
  constructor(options = {}) {
    super({
      canvasId: options.canvasId || "chartChannelDistribution",
      chartKey: options.chartKey || "channelDistribution",
      type: "doughnut",
      title: "3-Channel Financial Volume Distribution",
      chartRegistry: options.chartRegistry || {}
    });
  }

  buildConfig(channelDistribution = {}) {
    const { isDark, commonLegend, pieAnimation } = this.getThemeConfig();
    return {
      type: "doughnut",
      data: {
        labels: channelDistribution.labels || [],
        datasets: [
          {
            data: channelDistribution.values || [],
            backgroundColor: ["#1677ff", "#f59e0b", "#ef4444"],
            borderWidth: 2,
            borderColor: isDark ? "#111a2e" : "#ffffff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: pieAnimation,
        cutout: "58%",
        plugins: { legend: commonLegend }
      }
    };
  }
}

export default ChannelDistributionChart;
