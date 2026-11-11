/**
 * PrintJobMetricsProcess - Updates KPI Summary Cards
 */
export class PrintJobMetricsProcess {
    /**
     * Update DOM with KPI metrics
     * @param {Object} kpis 
     */
    static update(kpis = {}) {
        const kpiTotal = document.getElementById('kpiTotalJobs');
        const kpiPrepress = document.getElementById('kpiPrepressJobs');
        const kpiPrinting = document.getElementById('kpiPrintingJobs');
        const kpiFinishing = document.getElementById('kpiFinishingJobs');
        const kpiReady = document.getElementById('kpiReadyJobs');

        if (kpiTotal) kpiTotal.textContent = kpis.total || 0;
        if (kpiPrepress) kpiPrepress.textContent = kpis.prepress || 0;
        if (kpiPrinting) kpiPrinting.textContent = kpis.printing || 0;
        if (kpiFinishing) kpiFinishing.textContent = kpis.finishing || 0;
        if (kpiReady) kpiReady.textContent = kpis.ready_completed || 0;
    }
}
