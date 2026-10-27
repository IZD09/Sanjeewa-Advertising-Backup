<!-- ==================================================================
             MODULE 1: DASHBOARD (Visual Analytics 5-Slide Carousel)
             ================================================================== -->
        <div class="app-module active" id="module-dashboard" data-module="dashboard">
          <section class="dashboard-content">

            <!-- Slide 1: Business Overview -->
    @include('ui::layouts.dashboard.sliders.slide1')

    <!-- Slide 2: Sales & Revenue Analytics -->
    @include('ui::layouts.dashboard.sliders.slide2')

    <!-- Slide 3: Print Jobs & Production -->
    @include('ui::layouts.dashboard.sliders.slide3')

    <!-- Slide 4: Stock & Inventory Management -->
    @include('ui::layouts.dashboard.sliders.slide4')

    <!-- Slide 5: Financial Summary & Profitability -->
    @include('ui::layouts.dashboard.sliders.slide5')

    <!-- Slider Controller positioned at bottom-center of slider -->
            <div class="slide-controls" id="slideControls">
              <button class="control-button" id="previousSlide" aria-label="Previous slide" title="Previous slide"><i class="fa-solid fa-chevron-left"></i></button>
              <div class="slide-dots" id="slideDots">
                <button class="slide-dot active" data-index="0" aria-label="Slide 1"></button>
                <button class="slide-dot" data-index="1" aria-label="Slide 2"></button>
                <button class="slide-dot" data-index="2" aria-label="Slide 3"></button>
                <button class="slide-dot" data-index="3" aria-label="Slide 4"></button>
                <button class="slide-dot" data-index="4" aria-label="Slide 5"></button>
              </div>
              <span class="slide-counter" id="slideCounter">01 / 05</span>
              <button class="control-button" id="pauseSlides" aria-label="Pause slideshow" title="Pause slideshow"><i class="fa-solid fa-pause"></i></button>
              <button class="control-button" id="nextSlide" aria-label="Next slide" title="Next slide"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </section>

          <footer class="dashboard-footer" id="dashboardFooter">
            <span>© 2026 SanjeewaAdvertising</span>
            <span>Executive Visual Analytics</span>
          </footer>
        </div>
