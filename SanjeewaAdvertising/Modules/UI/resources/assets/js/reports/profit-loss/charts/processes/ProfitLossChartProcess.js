/**
 * SanjeewaAdvertising - Profit & Loss Statement Chart Process
 *
 * Binds single-chart selector pill buttons and dropdown for `plCharts`.
 */

export class ProfitLossChartProcess {
  constructor(context = {}) {
    this.chartHandler = context.chartHandler;
    this.tabGroup = "plCharts";
  }

  bindEvents() {
    document.querySelectorAll(`.rep-chart-select-btn[data-tab-group="${this.tabGroup}"]`).forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetPane = btn.getAttribute("data-target-pane");
        if (this.chartHandler) this.chartHandler.activateChartPane(targetPane);
      });
    });

    document.querySelectorAll(`.rep-chart-select-dropdown[data-tab-group="${this.tabGroup}"]`).forEach((select) => {
      select.addEventListener("change", (e) => {
        if (this.chartHandler) this.chartHandler.activateChartPane(e.target.value);
      });
    });
  }
}

export default ProfitLossChartProcess;
