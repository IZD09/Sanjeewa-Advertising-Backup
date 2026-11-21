<!-- ==================================================================
     VIEW D: SUPPLIERS DIRECTORY VIEW
     ================================================================== -->
<div id="grnSuppliersView" @if(request('view') !== 'suppliers') style="display: none;" @endif>
  <div class="grn-suppliers-wrapper">
    <!-- Supplier Toolbar Controls -->
    <div class="grn-toolbar supplier-toolbar">
      <div class="grn-toolbar-left">
        <div class="grn-search-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="supplierSearchInput" name="supplier_search" aria-label="Search suppliers" class="grn-search-input" placeholder="Search suppliers by name, contact, city, category...">
        </div>
        <select id="supplierCategoryFilter" name="supplier_category_filter" class="grn-select" aria-label="Filter by Category">
          <option value="ALL">All Material Categories</option>
          <option value="Paper & Boards">Paper & Boards</option>
          <option value="Inks & Solvents">Inks & Solvents</option>
          <option value="Flex & Banners">Flex & Banners</option>
          <option value="Vinyl & Stickers">Vinyl & Stickers</option>
          <option value="Rigid Boards & Hardware">Rigid Boards & Hardware</option>
          <option value="Rollup Stands & Displays">Rollup Stands & Displays</option>
        </select>
      </div>
      <div class="grn-toolbar-right">
        <button type="button" class="ant-btn ant-btn-primary" id="supplierToolbarCreateBtn">
          <i class="fa-solid fa-user-plus"></i> + Register New Supplier
        </button>
      </div>
    </div>

    <!-- Supplier Grid Cards -->
    <div class="supplier-grid" id="suppliersCardsContainer">
      <!-- Dynamically populated via js/grn.js -->
    </div>

    <!-- Suppliers Pagination (Visible only when results > 20) -->
    <div class="grn-pagination-bar supplier-pagination-bar" id="supplierPaginationBar" style="display: none;">
      <div class="grn-pagination-info" id="supplierPaginationInfo"></div>
      <div class="grn-pagination-controls" id="supplierPaginationControls"></div>
    </div>
  </div>
</div>
