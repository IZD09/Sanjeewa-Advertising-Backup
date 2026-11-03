@php
  $overviewData = $dashboardData['overview'] ?? [];
  $overviewStates = $overviewData['states'] ?? [];
  $articles = $overviewStates['articles'] ?? [];
  $jobStats = $overviewStates['jobStatas'] ?? [];
  $art1 = $articles['article1'] ?? [];
  $art2 = $articles['article2'] ?? [];
  $art3 = $articles['article3'] ?? [];
  $art4 = $articles['article4'] ?? [];
  $chartTitle = $overviewStates['chartTitle'] ?? date('Y');
@endphp
<!-- Slide 1: Overview -->
<section class="dashboard-slide active" data-title="Business Overview" data-nav="Dashboard">
  <div class="slide-heading">
    <div>
      <p class="eyebrow">YOUR BUSINESS AT A GLANCE</p>
      <h2>Welcome back, Admin <span class="wave">👋</span></h2>
      <p class="muted">Here is what's happening with your business today.</p>
    </div>
    <span class="live-badge"><span>
      </span> Live Overview</span>
  </div>

  <div class="stats-grid">
    <article class="stat-card" data-slide="totalSales">
      <div class="stat-top">
        <span>Total Sales</span>
        <span class="stat-icon blue">
          <i class="fa-solid fa-chart-line"></i>
        </span>
      </div>
      <h3>{{ isset($art1['value']) ? 'Rs. ' . number_format($art1['value'], 0) : '—' }}</h3>
      <p class="{{ ($art1['trendState'] ?? 'positive') === 'positive' ? 'positive' : 'negative' }}">
        <i class="fa-solid fa-arrow-{{ ($art1['trendState'] ?? 'positive') === 'positive' ? 'up' : 'down' }}"></i> {{ isset($art1['trend']) ? $art1['trend'].'%' : '' }} <span>vs last month</span>
      </p>
      <div class="mini-bars">
        @foreach($art1['bars'] ?? [] as $bar)
          <i style="height:{{ $bar }}%"></i>
        @endforeach
      </div>
    </article>

    <article class="stat-card" data-slide="activeJobs">
      <div class="stat-top">
        <span>Active Print Jobs</span>
        <span class="stat-icon red">
          <i class="fa-solid fa-print"></i>
        </span>
      </div>
      <h3>{{ $art2['value'] ?? '—' }}</h3>
      <p class="{{ ($art2['trendState'] ?? 'positive') === 'positive' ? 'positive' : 'negative' }}">
        <i class="fa-solid fa-arrow-{{ ($art2['trendState'] ?? 'positive') === 'positive' ? 'up' : 'down' }}"></i> {{ isset($art2['trend']) ? $art2['trend'].'%' : '' }} <span>vs last month</span>
      </p>
      <div class="mini-bars red-bars">
        @foreach($art2['bars'] ?? [] as $bar)
          <i style="height:{{ $bar }}%"></i>
        @endforeach
      </div>
    </article>

    <article class="stat-card" data-slide="newCustomers">
      <div class="stat-top">
        <span>New Customers</span>
        <span class="stat-icon green">
          <i class="fa-solid fa-user-plus"></i>
        </span>
      </div>
      <h3>{{ $art3['value'] ?? '—' }}</h3>
      <p class="{{ ($art3['trendState'] ?? 'positive') === 'positive' ? 'positive' : 'negative' }}">
        <i class="fa-solid fa-arrow-{{ ($art3['trendState'] ?? 'positive') === 'positive' ? 'up' : 'down' }}"></i> {{ isset($art3['trend']) ? $art3['trend'].'%' : '' }} <span>vs last month</span>
      </p>
      <div class="mini-bars green-bars">
        @foreach($art3['bars'] ?? [] as $bar)
          <i style="height:{{ $bar }}%"></i>
        @endforeach
      </div>
    </article>

    <article class="stat-card" data-slide="pendingInvoices">
      <div class="stat-top">
        <span>Pending Invoices</span>
        <span class="stat-icon orange">
          <i class="fa-solid fa-clock"></i>
        </span>
      </div>
      <h3>{{ isset($art4['value']) ? 'Rs. ' . number_format($art4['value'], 0) : '—' }}</h3>
      <p class="{{ ($art4['trendState'] ?? 'negative') === 'positive' ? 'positive' : 'negative' }}">
        <i class="fa-solid fa-arrow-{{ ($art4['trendState'] ?? 'negative') === 'positive' ? 'up' : 'down' }}"></i> {{ isset($art4['trend']) ? $art4['trend'].'%' : '' }} <span>vs last month</span>
      </p>
      <div class="mini-bars orange-bars">
        @foreach($art4['bars'] ?? [] as $bar)
          <i style="height:{{ $bar }}%"></i>
        @endforeach
      </div>
    </article>
  </div>

  <div class="content-grid overview-grid">
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">REVENUE ANALYSIS</p>
          <h3>Monthly Revenue (LKR)</h3>
        </div>
        <span class="pill" data-field="overviewChartTitle">{{ $chartTitle }} Monthly Trend</span>
      </div>
      <div class="chart-wrap">
        <canvas id="revenueTrendChart"></canvas>
      </div>
    </article>

    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">PRODUCTION WORKLOAD</p>
          <h3>Active Print Jobs Status</h3>
        </div>
        <span class="pill">Current Production</span>
      </div>
      <div class="order-summary">
        <div class="doughnut-wrap">
          <canvas id="ordersDoughnutChart"></canvas>
        </div>
        <div class="legend">
          <div>
            <span class="dot completed"></span>
            <span>Completed</span>
            <strong data-field="overviewCompleted">{{ $jobStats['completed'] ?? '—' }}</strong>
          </div>
          <div>
            <span class="dot printing"></span>
            <span>Printing</span>
            <strong data-field="overviewPrinting">{{ $jobStats['printing'] ?? '—' }}</strong>
          </div>
          <div>
            <span class="dot designing"></span>
            <span>Designing</span>
            <strong data-field="overviewDesigning">{{ $jobStats['designing'] ?? '—' }}</strong>
          </div>
          <div>
            <span class="dot pending"></span>
            <span>Pending</span>
            <strong data-field="overviewPending">{{ $jobStats['pending'] ?? '—' }}</strong>
          </div>
        </div>
      </div>
    </article>
  </div>
</section>
