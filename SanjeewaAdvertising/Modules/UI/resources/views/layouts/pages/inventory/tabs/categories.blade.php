<!-- ========================================== -->
<!-- TAB PANE 3: CATEGORIES & SUBCATEGORIES     -->
<!-- ========================================== -->
<div id="invTabPaneCategories" class="inv-tab-pane" style="display: none; flex-direction: column; gap: 22px;">
  <!-- Categories KPI Metric Cards (3 Cards) -->
  <div class="inv-summary-grid" id="invCategoriesKpiGrid" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
    <!-- Card 1: Total Categories -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Material Categories</span>
        <div class="inv-kpi-val" id="catKpiTotalCategories">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-folder-tree" style="color: #1677ff;"></i> Primary Classifications</span>
      </div>
      <div class="inv-kpi-icon blue">
        <i class="fa-solid fa-folder-open"></i>
      </div>
    </div>

    <!-- Card 2: Total Subcategories -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Subcategories</span>
        <div class="inv-kpi-val" id="catKpiTotalSubcategories" style="color: #52c41a;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-tags" style="color: #52c41a;"></i> Material Sub-groups</span>
      </div>
      <div class="inv-kpi-icon green">
        <i class="fa-solid fa-tags"></i>
      </div>
    </div>

    <!-- Card 3: Material SKUs -->
    <div class="inv-kpi-card">
      <div class="inv-kpi-meta">
        <span class="inv-kpi-label">Mapped Stock SKUs</span>
        <div class="inv-kpi-val" id="catKpiTotalItems" style="color: #722ed1;">0</div>
        <span class="inv-kpi-desc"><i class="fa-solid fa-boxes-stacked" style="color: #722ed1;"></i> Registered Material Items</span>
      </div>
      <div class="inv-kpi-icon purple">
        <i class="fa-solid fa-layer-group"></i>
      </div>
    </div>
  </div>

  <!-- Main Master-Detail 2-Column Layout -->
  <div class="cat-split-layout">
    <!-- LEFT COLUMN: Categories Master List -->
    <div class="cat-col-card cat-col-categories">
      <div class="cat-card-header">
        <div class="cat-card-title">
          <h3><i class="fa-solid fa-folder-tree"></i> Categories</h3>
          <span class="cat-header-sub" id="catListSubtitle">Master classifications</span>
        </div>
        <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="catToggleNewCategoryBtn">
          <i class="fa-solid fa-plus"></i> Add Category
        </button>
      </div>

      <!-- Quick Add Category Form (Inline) -->
      <div id="catNewCategoryBox" class="cat-inline-form-box" style="display: none;">
        <div class="cat-form-title">
          <span><i class="fa-solid fa-circle-plus" style="color: #1677ff;"></i> New Category</span>
          <button type="button" class="cat-close-btn" id="catCancelNewCategoryBtn">&times;</button>
        </div>
        <div class="po-field" style="margin-top: 8px;">
          <label class="po-label" for="newCategoryInput">Category Name <span class="req">*</span></label>
          <input type="text" id="newCategoryInput" name="category_name" class="inv-search-input" placeholder="E.g. Speciality Media">
          <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
          <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="catCancelNewCategoryBtn2">Cancel</button>
          <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="catSaveCategoryBtn">
            <i class="fa-solid fa-check"></i> Save
          </button>
        </div>
      </div>

      <!-- Category Search Input -->
      <div class="cat-search-box" style="margin: 14px 0 10px;">
        <div class="inv-search-wrap" style="width: 100%;">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="catFilterInput" name="cat_filter_search" class="inv-search-input" placeholder="Search categories..." aria-label="Search categories">
        </div>
      </div>

      <!-- Categories Dynamic List -->
      <div class="cat-list-container" id="categoriesListContainer">
        <!-- Populated dynamically -->
      </div>
    </div>

    <!-- RIGHT COLUMN: Subcategories Detail Table -->
    <div class="cat-col-card cat-col-subcategories">
      <div class="cat-card-header">
        <div class="cat-card-title">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h3><i class="fa-solid fa-tags"></i> Subcategories</h3>
            <span id="activeCategoryBadge" class="cat-active-badge">All Categories</span>
          </div>
          <span class="cat-header-sub" id="subcatTableSubtitle">Manage sub-groups and material classifications</span>
        </div>
        <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="subcatToggleNewBtn">
          <i class="fa-solid fa-plus"></i> Add Subcategory
        </button>
      </div>

      <!-- Quick Add Subcategory Form (Inline) -->
      <div id="subcatNewBox" class="cat-inline-form-box" style="display: none;">
        <div class="cat-form-title">
          <span><i class="fa-solid fa-circle-plus" style="color: #52c41a;"></i> New Subcategory</span>
          <button type="button" class="cat-close-btn" id="subcatCancelNewBtn">&times;</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 12px; margin-top: 8px;">
          <div class="po-field">
            <label class="po-label" for="newSubcatCategorySelect">Parent Category <span class="req">*</span></label>
            <select id="newSubcatCategorySelect" name="parent_category" class="inv-select" style="width: 100%;">
              <!-- Options dynamically populated -->
            </select>
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
          <div class="po-field">
            <label class="po-label" for="newSubcatNameInput">Subcategory Name <span class="req">*</span></label>
            <input type="text" id="newSubcatNameInput" name="subcategory_name" class="inv-search-input" placeholder="E.g. Matte Canvas 380gsm">
            <small class="err" style="color: #ff4d4f; font-size: 11px;"></small>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
          <button type="button" class="ant-btn ant-btn-default ant-btn-sm" id="subcatCancelNewBtn2">Cancel</button>
          <button type="button" class="ant-btn ant-btn-primary ant-btn-sm" id="subcatSaveBtn">
            <i class="fa-solid fa-check"></i> Save Subcategory
          </button>
        </div>
      </div>

      <!-- Subcategory Filter & Search Bar -->
      <div class="inv-toolbar" style="margin-top: 14px;">
        <div class="inv-toolbar-left" style="flex: 1;">
          <div class="inv-search-wrap" style="width: 100%; max-width: 320px;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="subcatSearchInput" name="subcat_search" class="inv-search-input" placeholder="Search subcategories..." aria-label="Search subcategories">
          </div>
          <button type="button" class="ant-btn ant-btn-default" id="subcatRefreshBtn" title="Refresh list">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </div>
        <div class="inv-toolbar-right">
          <span id="subcategoriesTableCount" style="font-size: 12px; color: var(--text-muted); font-weight: 500;">
            Showing 0 subcategories
          </span>
        </div>
      </div>

      <!-- Subcategories Table -->
      <div class="po-table-responsive inv-table-responsive" style="margin-top: 10px;">
        <table class="po-table" id="subcategoriesTable">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Subcategory Name</th>
              <th style="width: 220px;">Parent Category</th>
              <th class="text-center" style="width: 130px;">Stock Items</th>
              <th class="text-center" style="width: 130px;">Actions</th>
            </tr>
          </thead>
          <tbody id="subcategoriesTableBody">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>

      <!-- Non-Reloading Pagination Bar (BasePaginationHandler standard, max 20 rows per page) -->
      <div class="po-pagination po-pagination-bar" id="subcategoriesPaginationBar">
        <div id="subcategoriesPaginationInfo" class="po-pagination-info">
          Showing 0 subcategories
        </div>
        <div id="subcategoriesPaginationControls" class="pagination-controls po-pagination-controls">
          <!-- Rendered by BasePaginationHandler -->
        </div>
      </div>
    </div>
  </div>
</div>
