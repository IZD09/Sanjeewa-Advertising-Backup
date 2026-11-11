/**
 * SanjeewaAdvertising - Payments & Cash Flow Chart Process
 *
 * Binds single-chart selector pill buttons and dropdown for `paymentCharts`.
 */

export class PaymentsCashFlowChartProcess {
  constructor(context = {}) {
    this.chartHandler = context.chartHandler;
    this.tabGroup = "paymentCharts";
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

export default PaymentsCashFlowChartProcess;
