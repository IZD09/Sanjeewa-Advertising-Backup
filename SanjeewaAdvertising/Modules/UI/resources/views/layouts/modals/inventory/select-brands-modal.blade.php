<!-- SELECT BRANDS MODAL FOR STOCK ITEMS -->
<div class="po-modal-overlay" id="selectBrandsModal" aria-hidden="true">
  <div class="po-modal" style="max-width: 520px; max-height: 85vh; display: flex; flex-direction: column;">
    <div class="po-modal-header" style="padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-award" style="color: #1677ff;"></i> Select Compatible Brands
      </h3>
      <button type="button" class="modal-close-btn" data-close-inv-modal="selectBrandsModal" id="closeSelectBrandsModalBtn" aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="po-modal-body" style="padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; flex: 1;">
      <!-- Search within modal -->
      <div class="inv-search-wrap" style="width: 100%;">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="modalBrandSearchInput" name="modal_brand_search" class="inv-search-input" placeholder="Search brands in registry..." aria-label="Search brands in registry">
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); padding: 0 2px;">
        <span id="modalBrandSelectCount">0 brands selected</span>
        <div style="display: flex; gap: 10px;">
          <a href="javascript:void(0)" id="modalBrandSelectAll" style="color: #1677ff; text-decoration: none; font-weight: 600;">Select All</a>
          <span>&bull;</span>
          <a href="javascript:void(0)" id="modalBrandClearAll" style="color: #ff4d4f; text-decoration: none; font-weight: 600;">Clear All</a>
        </div>
      </div>

      <!-- Scrollable list of brand checkboxes -->
      <div id="modalBrandsListContainer" style="display: flex; flex-direction: column; gap: 6px; max-height: 300px; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; padding: 8px; background: var(--surface);">
        <!-- Populated dynamically via JS -->
      </div>
    </div>

    <div class="po-modal-footer" style="padding: 12px 18px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; background: var(--surface-2);">
      <button type="button" class="ant-btn ant-btn-default ant-btn-sm" data-close-inv-modal="selectBrandsModal" id="modalBrandCancelBtn">Cancel</button>
      <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="modalBrandConfirmBtn">
        <i class="fa-solid fa-check"></i> Done &amp; Apply (<span id="modalBrandConfirmCount">0</span>)
      </button>
    </div>
  </div>
</div>
