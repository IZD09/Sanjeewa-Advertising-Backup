@php
  $stockHealth = $dashboardData['stock']['health'] ?? [];
@endphp
<!-- Slide 4: Inventory & Stock Health -->
<section class="dashboard-slide" data-title="Stock & Inventory Management" data-nav="Stock Management">
  <div class="slide-heading">
    <div>
      <p class="eyebrow">WAREHOUSE & SUPPLIES</p>
      <h2>Raw Material Inventory & Stock Health</h2>
      <p class="muted">Real-time status of banner rolls, vinyl sticker media, and solvent inks.</p>
    </div>
    <span class="live-badge"><span></span> Stock Monitored</span>
  </div>

  <div class="content-grid">
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">LOW STOCK ALERTS</p>
          <h3>Low Stock Items (Remaining Stock)</h3>
        </div>
        <span class="pill">Critical Stock</span>
      </div>
      <div class="chart-wrap"><canvas id="stockLevelsChart"></canvas></div>
    </article>

    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">REORDER STATUS</p>
          <h3>Stock Health & Reorder Metrics</h3>
        </div>
        <span class="pill">Supplies Ordered</span>
      </div>
      <div class="stock-health">
        @foreach($stockHealth as $item)
          <div>
            <div class="stock-label">
              <span>{{ $item['name'] ?? '' }}</span>
              <strong style="color: {{ $item['color'] ?? '#2563eb' }};">{{ $item['value'] ?? '' }}</strong>
            </div>
            <div class="progress-track">
              <span style="width: {{ $item['percentage'] ?? 0 }}%; background-color: {{ $item['color'] ?? '#2563eb' }};"></span>
            </div>
          </div>
        @endforeach
      </div>
    </article>
  </div>
</section>
