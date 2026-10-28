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
                      <p class="eyebrow">REMAINING ROLL CAPACITY</p>
                      <h3>Media Rolls Length (Meters Remaining)</h3>
                    </div>
                    <span class="pill">Warehouse Levels</span>
                  </div>
                  <div class="chart-wrap"><canvas id="stockLevelsChart"></canvas></div>
                </article>

                <article class="panel">
                  <div class="panel-header">
                    <div>
                      <p class="eyebrow">LIVE ALERTS</p>
                      <h3>Stock Health & Reorder Metrics</h3>
                    </div>
                    <span class="pill">Supplies Health</span>
                  </div>
                  <div class="stock-health">
                    <div>
                      <div class="stock-label"><span>Frontlit Flex Banner (10ft)</span><strong>180m / 250m</strong></div>
                      <div class="progress-track"><span style="width:72%"></span></div>
                    </div>
                    <div>
                      <div class="stock-label"><span>Glossy Vinyl Sticker (4ft)</span><strong class="warning-text">42m / 200m (Low)</strong></div>
                      <div class="progress-track warning-progress"><span style="width:21%"></span></div>
                    </div>
                    <div>
                      <div class="stock-label"><span>Solvent Cyan Ink Cartridges</span><strong>85% Full</strong></div>
                      <div class="progress-track green-progress"><span style="width:85%"></span></div>
                    </div>
                    <div>
                      <div class="stock-label"><span>Foam Board Sheets (5mm)</span><strong>65 Sheets</strong></div>
                      <div class="progress-track"><span style="width:65%"></span></div>
                    </div>
                  </div>
                </article>
              </div>
            </section>
