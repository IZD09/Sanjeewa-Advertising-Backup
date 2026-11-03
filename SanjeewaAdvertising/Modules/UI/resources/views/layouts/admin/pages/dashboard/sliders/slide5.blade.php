@php
  $financeData = $dashboardData['finance'] ?? [];
@endphp
<!-- Slide 5: Financial Summary -->
<section class="dashboard-slide" data-title="Financial Summary & Profitability" data-nav="Financial Summary">
  <div class="slide-heading">
    <div>
      <p class="eyebrow">EXECUTIVE FINANCE</p>
      <h2>Revenue, Expenses & Profitability</h2>
      <p class="muted">High-level financial performance and operating margins for 2026.</p>
    </div>
    <span class="live-badge"><span></span> Fiscal YTD</span>
  </div>

  <div class="content-grid">
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">MONTHLY P&L</p>
          <h3>Gross Income vs Operating Expenses (LKR)</h3>
        </div>
        <span class="pill">YTD Financials</span>
      </div>
      <div class="chart-wrap"><canvas id="financeComparisonChart"></canvas></div>
    </article>

    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">YEAR-TO-DATE</p>
          <h3>Profitability & Cash Flow</h3>
        </div>
        <span class="pill">Fiscal 2026</span>
      </div>
      <div class="finance-list">
        <div><span><i class="fa-solid fa-circle revenue-color"></i> Total Revenue</span><strong>{{ $financeData['totalRevenue'] ?? '—' }}</strong></div>
        <div><span><i class="fa-solid fa-circle expense-color"></i> Total Expenses</span><strong>{{ $financeData['totalExpenses'] ?? '—' }}</strong></div>
        <div><span><i class="fa-solid fa-circle profit-color"></i> Net Profit</span><strong>{{ $financeData['netProfit'] ?? '—' }}</strong></div>
      </div>
      <div class="profit-box"><span>Profit Margin</span><strong>{{ isset($financeData['profitMargin']) ? $financeData['profitMargin'].'%' : '—' }}</strong>
        <div class="progress-track green-progress"><span style="width:{{ $financeData['profitMargin'] ?? 0 }}%"></span></div>
      </div>
      <div class="supplier-summary-compact">
        <span><i class="fa-solid fa-file-invoice-dollar"></i> Supplier Payables</span>
        <strong>{{ $financeData['supplierPayables'] ?? '—' }}</strong>
      </div>
    </article>
  </div>
</section>
