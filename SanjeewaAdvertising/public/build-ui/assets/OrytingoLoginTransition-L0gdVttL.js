var e=class{static play({redirectUrl:e=`/dashboard`,subtitle:t=`Launching workspace...`,durationMs:n=1850}={}){if(typeof document>`u`)return window.location.href=e,Promise.resolve();try{let t=document.createElement(`link`);t.rel=`prefetch`,t.href=e,t.as=`document`,document.head.appendChild(t)}catch{}this.injectStyles();let r=document.getElementById(`orytingoLoginSplash`);r&&r.remove();let i=document.createElement(`div`);i.id=`orytingoLoginSplash`,i.setAttribute(`role`,`status`),i.setAttribute(`aria-live`,`polite`),i.innerHTML=`
      <div class="ory-splash-backdrop"></div>
      <div class="ory-splash-content">
        <div class="ory-emblem-wrap">
          <svg class="ory-logo-svg" viewBox="0 0 500 355" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Orytingo Logo">
            <defs>
              <radialGradient id="oryCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#FF9A52" stop-opacity="0.55" />
                <stop offset="60%" stop-color="#F38B43" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#F38B43" stop-opacity="0" />
              </radialGradient>
              <linearGradient id="oryProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#F38B43" />
                <stop offset="55%" stop-color="#FFB37B" />
                <stop offset="100%" stop-color="#FFFFFF" />
              </linearGradient>
            </defs>

            <!-- Soft ambient halo behind orange core -->
            <circle class="ory-core-halo" cx="294" cy="148" r="66" fill="url(#oryCoreGlow)" />

            <!-- Continuous Double-Wall Circuit-C Ribbon + Top & Bottom Traces -->
            <path class="ory-c-ribbon"
                  d="M 210 108 L 239 108 A 68 68 0 0 1 359 128 L 325.1 128 A 37 37 0 1 0 325.1 168 L 359 168 A 68 68 0 0 1 239 188 L 210 188"
                  stroke="#FFFFFF"
                  stroke-width="13"
                  stroke-linecap="round"
                  stroke-linejoin="miter"
                  stroke-miterlimit="6" />

            <!-- Middle Circuit Collar & Horizontal Stem -->
            <path class="ory-mid-collar"
                  d="M 233 130 A 64 64 0 0 0 233 166"
                  stroke="#FFFFFF"
                  stroke-width="13"
                  stroke-linecap="butt" />
            <line class="ory-mid-stem"
                  x1="232" y1="148" x2="169" y2="148"
                  stroke="#FFFFFF"
                  stroke-width="13"
                  stroke-linecap="round" />

            <!-- Three Left Hollow Circuit Terminal Nodes -->
            <circle class="ory-node ory-node-top" cx="197" cy="108" r="12.5" fill="#04060B" stroke="#FFFFFF" stroke-width="8.5" />
            <circle class="ory-node ory-node-mid" cx="154" cy="148" r="14.5" fill="#04060B" stroke="#FFFFFF" stroke-width="9" />
            <circle class="ory-node ory-node-bot" cx="197" cy="188" r="12.5" fill="#04060B" stroke="#FFFFFF" stroke-width="8.5" />

            <!-- Expanding Pulse Ring + Signature Orange Core -->
            <circle class="ory-core-ring" cx="294" cy="148" r="20" stroke="#F38B43" stroke-width="3" fill="none" />
            <circle class="ory-core-dot" cx="294" cy="148" r="20.5" fill="#F38B43" />

            <!-- Wordmark: ORYTINGO -->
            <text class="ory-wordmark"
                  x="252"
                  y="282"
                  text-anchor="middle"
                  fill="#FFFFFF"
                  font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  font-weight="800"
                  font-size="50"
                  letter-spacing="5">ORYTINGO</text>

            <!-- Tagline: CODE. INNOVATE. ELEVATE -->
            <text class="ory-tagline"
                  x="254"
                  y="314"
                  text-anchor="middle"
                  fill="#D6DCE8"
                  font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  font-weight="500"
                  font-size="13.5"
                  letter-spacing="5.5">CODE. INNOVATE. ELEVATE</text>
          </svg>
        </div>

        <div class="ory-progress-track">
          <div class="ory-progress-bar"></div>
        </div>
        <div class="ory-status-caption">${this.escapeHtml(t)}</div>
      </div>
    `,document.body.appendChild(i),requestAnimationFrame(()=>{i.classList.add(`is-active`)});let a=typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches?550:n;return new Promise(t=>{setTimeout(()=>{i.classList.add(`is-exiting`),window.location.href=e,t()},a)})}static escapeHtml(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}static injectStyles(){if(document.getElementById(`orytingoSplashStyles`))return;let e=document.createElement(`style`);e.id=`orytingoSplashStyles`,e.textContent=`
      #orytingoLoginSplash {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1);
        pointer-events: all;
        user-select: none;
      }
      #orytingoLoginSplash.is-active {
        opacity: 1;
      }
      .ory-splash-backdrop {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 52% 44%, rgba(243, 139, 67, 0.11) 0%, rgba(15, 23, 42, 0.4) 36%, #04060B 75%),
          #04060B;
      }
      .ory-splash-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        transform: scale(0.94);
        transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #orytingoLoginSplash.is-active .ory-splash-content {
        transform: scale(1);
      }
      .ory-emblem-wrap {
        width: min(340px, 82vw);
        display: flex;
        justify-content: center;
      }
      .ory-logo-svg {
        width: 100%;
        height: auto;
        overflow: visible;
        filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.65));
      }
      .ory-c-ribbon {
        stroke-dasharray: 820;
        stroke-dashoffset: 820;
        animation: oryDrawRibbon 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
      }
      .ory-mid-collar,
      .ory-mid-stem {
        stroke-dasharray: 120;
        stroke-dashoffset: 120;
        animation: oryDrawRibbon 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.38s forwards;
      }
      .ory-node {
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        transform: scale(0.3);
      }
      .ory-node-top {
        animation: oryPopNode 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 0.42s forwards;
      }
      .ory-node-mid {
        animation: oryPopNode 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) 0.54s forwards;
      }
      .ory-node-bot {
        animation: oryPopNode 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 0.64s forwards;
      }
      .ory-core-dot {
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        transform: scale(0);
        animation: oryCoreIgnite 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.52s forwards;
      }
      .ory-core-halo {
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        animation: oryHaloPulse 1.4s ease-out 0.58s infinite;
      }
      .ory-core-ring {
        opacity: 0;
        transform-box: fill-box;
        transform-origin: center;
        animation: oryShockwave 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
      }
      .ory-wordmark {
        opacity: 0;
        transform: translateY(10px);
        animation: oryTextRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.68s forwards;
      }
      .ory-tagline {
        opacity: 0;
        transform: translateY(8px);
        animation: oryTextRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.84s forwards;
      }
      .ory-progress-track {
        width: 210px;
        height: 3px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        overflow: hidden;
        margin-top: 14px;
      }
      .ory-progress-bar {
        width: 0%;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #F38B43 0%, #FFB076 60%, #FFFFFF 100%);
        box-shadow: 0 0 12px rgba(243, 139, 67, 0.75);
        animation: oryProgressFill 1.65s cubic-bezier(0.25, 0.9, 0.35, 1) 0.12s forwards;
      }
      .ory-status-caption {
        margin-top: 12px;
        font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.6px;
        color: rgba(226, 232, 240, 0.72);
        opacity: 0;
        animation: oryTextRise 0.45s ease 0.4s forwards;
      }

      @keyframes oryDrawRibbon {
        to { stroke-dashoffset: 0; }
      }
      @keyframes oryPopNode {
        0% { opacity: 0; transform: scale(0.3); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes oryCoreIgnite {
        0% { opacity: 0; transform: scale(0); }
        70% { opacity: 1; transform: scale(1.14); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes oryShockwave {
        0% { opacity: 0.95; transform: scale(1); stroke-width: 4; }
        100% { opacity: 0; transform: scale(2.45); stroke-width: 0.5; }
      }
      @keyframes oryHaloPulse {
        0%, 100% { opacity: 0.55; transform: scale(0.95); }
        50% { opacity: 0.95; transform: scale(1.12); }
      }
      @keyframes oryTextRise {
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes oryProgressFill {
        0% { width: 0%; }
        65% { width: 82%; }
        100% { width: 100%; }
      }
    `,document.head.appendChild(e)}};export{e as t};