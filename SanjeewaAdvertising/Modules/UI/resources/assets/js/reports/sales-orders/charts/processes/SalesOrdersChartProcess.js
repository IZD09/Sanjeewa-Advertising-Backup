/**
 * SanjeewaAdvertising - Sales & Orders Chart Process
 *
 * Binds single-chart selector pill buttons and dropdown for `salesCharts`.
 */

export class SalesOrdersChartProcess {
  /**
   * @param {Object} context
   * @param {import('../handlers/SalesOrdersChartHandler.js').SalesOrdersChartHandler} context.chartHandler
   */
  constructor(context = {}) {
    this.chartHandler = context.chartHandler;
    this.tabGroup = "salesCharts";
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

export default SalesOrdersChartProcess;
