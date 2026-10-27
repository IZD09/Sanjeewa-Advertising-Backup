<!-- Slide 1: Overview -->
            <section class="dashboard-slide active" data-title="Business Overview" data-nav="Dashboard">
              <div class="slide-heading">
                <div>
                  <p class="eyebrow">YOUR BUSINESS AT A GLANCE</p>
                  <h2>Welcome back, Admin <span class="wave">👋</span></h2>
                  <p class="muted">Here is what's happening with your business today.</p>
                </div>
                <span class="live-badge"><span></span> Live Overview</span>
              </div>

              <div class="stats-grid">
                <article class="stat-card">
                  <div class="stat-top"><span>Total Sales</span><span class="stat-icon blue"><i class="fa-solid fa-chart-line"></i></span></div>
                  <h3>Rs. 845,000</h3>
                  <p class="positive"><i class="fa-solid fa-arrow-up"></i> 12.8% <span>vs last month</span></p>
                  <div class="mini-bars"><i style="height:30%"></i><i style="height:45%"></i><i style="height:35%"></i><i style="height:62%"></i><i style="height:50%"></i><i style="height:78%"></i><i style="height:95%"></i></div>
                </article>

                <article class="stat-card">
                  <div class="stat-top"><span>Active Print Jobs</span><span class="stat-icon red"><i class="fa-solid fa-print"></i></span></div>
                  <h3>28</h3>
                  <p class="positive"><i class="fa-solid fa-arrow-up"></i> 8.4% <span>vs last month</span></p>
                  <div class="mini-bars red-bars"><i style="height:35%"></i><i style="height:50%"></i><i style="height:40%"></i><i style="height:68%"></i><i style="height:55%"></i><i style="height:80%"></i><i style="height:95%"></i></div>
                </article>

                <article class="stat-card">
                  <div class="stat-top"><span>New Customers</span><span class="stat-icon green"><i class="fa-solid fa-user-plus"></i></span></div>
                  <h3>14</h3>
                  <p class="positive"><i class="fa-solid fa-arrow-up"></i> 4.2% <span>vs last month</span></p>
                  <div class="mini-bars green-bars"><i style="height:25%"></i><i style="height:40%"></i><i style="height:30%"></i><i style="height:55%"></i><i style="height:45%"></i><i style="height:70%"></i><i style="height:88%"></i></div>
                </article>

                <article class="stat-card">
                  <div class="stat-top"><span>Pending Invoices</span><span class="stat-icon orange"><i class="fa-solid fa-clock"></i></span></div>
                  <h3>Rs. 182,500</h3>
                  <p class="negative"><i class="fa-solid fa-arrow-down"></i> 3.1% <span>vs last month</span></p>
                  <div class="mini-bars orange-bars"><i style="height:40%"></i><i style="height:55%"></i><i style="height:48%"></i><i style="height:70%"></i><i style="height:60%"></i><i style="height:82%"></i><i style="height:90%"></i></div>
                </article>
              </div>

              <div class="content-grid overview-grid">
                <article class="panel">
                  <div class="panel-header">
                    <div>
                      <p class="eyebrow">REVENUE ANALYSIS</p>
                      <h3>Monthly Revenue (LKR)</h3>
                    </div>
                    <span class="pill">2026 Monthly Trend</span>
                  </div>
                  <div class="chart-wrap"><canvas id="revenueTrendChart"></canvas></div>
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
                    <div class="doughnut-wrap"><canvas id="ordersDoughnutChart"></canvas></div>
                    <div class="legend">
                      <div><span class="dot completed"></span><span>Completed</span><strong>14</strong></div>
                      <div><span class="dot printing"></span><span>Printing</span><strong>8</strong></div>
                      <div><span class="dot designing"></span><span>Designing</span><strong>6</strong></div>
                      <div><span class="dot pending"></span><span>Pending</span><strong>4</strong></div>
                    </div>
                  </div>
                </article>
              </div>
            </section>
