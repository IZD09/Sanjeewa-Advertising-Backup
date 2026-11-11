/**
 * SanjeewaAdvertising - Reports Date Range & Preset Filter Process
 *
 * Manages quick date presets (Today, This Week, This Month, This Quarter, This Year)
 * and custom From/To date range filters.
 */

export class DatePresetProcess {
  /**
   * @param {Object} [context={}]
   * @param {Function} [context.showToast]
   * @param {Function} [context.onDateRangeApplied]
   */
  constructor(context = {}) {
    this.ctx = context;
    this.currentPreset = "this_month";
  }

  formatDate(d) {
    return d.toISOString().split("T")[0];
  }

  bindEvents() {
    const presetBtns = document.querySelectorAll(".rep-preset-btn");
    const fromInput = document.getElementById("repDateFrom");
    const toInput = document.getElementById("repDateTo");
    const btnApply = document.getElementById("btnApplyDateFilter");

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        presetBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const preset = btn.getAttribute("data-preset");
        this.currentPreset = preset || "this_month";

        const now = new Date();
        let from = new Date();
        let to = new Date();

        switch (preset) {
          case "today":
            from = new Date(now);
            to = new Date(now);
            break;
          case "this_week": {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            from = new Date(now.setDate(diff));
            to = new Date();
            break;
          }
          case "this_month":
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date();
            break;
          case "this_quarter": {
            const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
            from = new Date(now.getFullYear(), quarterMonth, 1);
            to = new Date();
            break;
          }
          case "this_year":
            from = new Date(now.getFullYear(), 0, 1);
            to = new Date();
            break;
          default:
            return;
        }

        if (fromInput) fromInput.value = this.formatDate(from);
        if (toInput) toInput.value = this.formatDate(to);
      });
    });

    if (btnApply) {
      btnApply.addEventListener("click", () => {
        const from = fromInput?.value || "start";
        const to = toInput?.value || "now";
        if (this.ctx.onDateRangeApplied) {
          this.ctx.onDateRangeApplied({ from, to, preset: this.currentPreset });
        }
        if (this.ctx.showToast) {
          this.ctx.showToast(`Reports & Charts updated for period: ${from} to ${to}`);
        }
      });
    }
  }
}

export default DatePresetProcess;
