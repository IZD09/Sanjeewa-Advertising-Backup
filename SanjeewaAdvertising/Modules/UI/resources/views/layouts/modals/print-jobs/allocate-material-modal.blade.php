<!-- ==================================================================
     MODAL 3: ALLOCATE MATERIAL & RAW STOCK MODAL
     ================================================================== -->
<div class="pj-modal-overlay" id="modalAllocateMaterial">
    <div class="pj-modal" style="max-width: 820px; width: 95%;">
        <div class="pj-modal-header" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <h3 id="modalAllocTitle" style="margin: 0;"><i class="fa-solid fa-boxes-stacked" style="color: #0284c7;"></i> Select Printing Materials</h3>
                <span id="allocHeaderCartBadge" style="display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 14px; background: rgba(2, 132, 199, 0.12); color: #0284c7; font-size: 12px; font-weight: 700;">
                    <i class="fa-solid fa-layer-group"></i>
                    <span id="allocHeaderCartCount">0</span>
                </span>
            </div>
            <button type="button" class="pj-modal-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="pj-modal-body">
            <div style="font-size: 13px; font-weight: 600; color: var(--text);" id="allocJobHeader">—</div>

            <!-- Info Notice for Start Printing -->
            <div id="allocNoticeBanner" style="display: none; background: rgba(2, 132, 199, 0.08); border: 1px solid rgba(2, 132, 199, 0.25); border-radius: 6px; padding: 10px 14px; font-size: 12px; color: var(--text);">
                <i class="fa-solid fa-circle-info" style="color: #0284c7; margin-right: 6px;"></i>
                <span>Select the required printing materials below, adjust quantities with <strong>- / +</strong> buttons, and confirm to proceed.</span>
            </div>

            <!-- Material Selector Box -->
            <div class="pj-material-selector-box" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 14px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <div style="font-size: 12.5px; font-weight: 700; color: var(--text);">
                        <i class="fa-solid fa-dolly" style="color: #0284c7; margin-right: 5px;"></i> Warehouse Material Selector
                    </div>
                    <!-- Search input for materials -->
                    <div style="position: relative; width: 240px;">
                        <input type="text" id="inputMaterialFilter" class="pj-input" placeholder="Search material / SKU / brand..." style="height: 32px; font-size: 11.5px; padding-left: 28px;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 9px; top: 10px; font-size: 11px; color: var(--text-muted);"></i>
                    </div>
                </div>

                <!-- Row 1: Category Selector & Subcategory Selector -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div class="pj-form-group" style="margin-bottom: 0;">
                        <label for="selectMaterialCategory" style="font-size: 11.5px; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text);">
                            <i class="fa-solid fa-layer-group" style="color: #0284c7; margin-right: 4px;"></i> 1. Category
                        </label>
                        <select class="pj-select" id="selectMaterialCategory" style="width: 100%; height: 38px;">
                            <option value="">-- All Categories --</option>
                            @foreach($materialCategories ?? [] as $cat)
                                <option value="{{ $cat['id'] }}">{{ $cat['name'] }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="pj-form-group" style="margin-bottom: 0;">
                        <label for="selectMaterialSubcategory" style="font-size: 11.5px; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text);">
                            <i class="fa-solid fa-tags" style="color: #0284c7; margin-right: 4px;"></i> 2. Subcategory
                        </label>
                        <select class="pj-select" id="selectMaterialSubcategory" style="width: 100%; height: 38px;">
                            <option value="">-- All Subcategories --</option>
                            @foreach($materialSubcategories ?? [] as $sc)
                                <option value="{{ $sc['id'] }}" data-category-id="{{ $sc['category_id'] }}">{{ $sc['name'] }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <!-- Row 2: Material Selector, Stepper Quantity, Add Material Button -->
                <div style="display: grid; grid-template-columns: 1fr 140px 145px; gap: 10px; align-items: flex-end;">
                    <div class="pj-form-group" style="margin-bottom: 0;">
                        <label for="selectAllocateStock" style="font-size: 11.5px; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text);">
                            <i class="fa-solid fa-box-open" style="color: #0284c7; margin-right: 4px;"></i> 3. Material / Stock Item <span style="color: #ff4d4f;">*</span>
                        </label>
                        <select class="pj-select" id="selectAllocateStock" style="width: 100%; height: 38px;">
                            <option value="">-- Choose Stock Item --</option>
                            @foreach($availableStocks ?? [] as $stk)
                                <option value="{{ $stk['id'] }}" data-code="{{ $stk['code'] ?? '' }}" data-brand="{{ $stk['brand'] ?? '' }}" data-category-id="{{ $stk['category_id'] ?? '' }}" data-subcategory-id="{{ $stk['subcategory_id'] ?? '' }}" data-qty="{{ $stk['qty'] ?? 0 }}">
                                    {{ $stk['name'] }} {{ !empty($stk['code']) ? "[{$stk['code']}]" : '' }} {{ !empty($stk['brand']) ? "({$stk['brand']})" : '' }} - Avail: {{ $stk['qty'] }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="pj-form-group" style="margin-bottom: 0;">
                        <label for="inputMaterialQty" style="font-size: 11.5px; font-weight: 600; margin-bottom: 4px; display: block; color: var(--text);">Quantity <span style="color: #ff4d4f;">*</span></label>
                        <div style="display: flex; align-items: center; height: 38px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); overflow: hidden;">
                            <button type="button" id="btnSelectorQtyMinus" title="Decrease Quantity" style="width: 34px; height: 100%; border: none; background: var(--surface-2); color: var(--text); font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-minus" style="font-size: 10px;"></i>
                            </button>
                            <input type="number" class="pj-input" id="inputMaterialQty" value="1" min="1" style="height: 100%; border: none; border-radius: 0; font-weight: 700; text-align: center; width: 100%; padding: 0 4px;" />
                            <button type="button" id="btnSelectorQtyPlus" title="Increase Quantity" style="width: 34px; height: 100%; border: none; background: var(--surface-2); color: var(--text); font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-plus" style="font-size: 10px;"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="ant-btn ant-btn-primary" id="btnSubmitAssignMaterial" style="height: 38px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; background: #0284c7; border-color: #0284c7; font-weight: 600; border-radius: 6px;">
                            <i class="fa-solid fa-plus"></i> <span>Add Material</span>
                        </button>
                    </div>
                </div>

                <!-- Stock Info Preview Box (Shows when an item is selected in dropdown) -->
                <div id="allocStockItemPreview" style="display: none; margin-top: 10px; padding: 9px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; font-size: 11.5px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <span style="color: var(--text-muted);">Code:</span> <strong id="previewStockCode" style="font-family: monospace;">—</strong> •
                            <span style="color: var(--text-muted);">Brand:</span> <span id="previewStockBrand" style="font-weight: 600;">—</span> •
                            <span style="color: var(--text-muted);">Category:</span> <span id="previewStockCategory" style="font-weight: 500;">—</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span id="previewInCartBadge" style="display: none; padding: 2px 8px; border-radius: 10px; background: rgba(2, 132, 199, 0.12); color: #0284c7; font-weight: 700; font-size: 11px;"></span>
                            <span><span style="color: var(--text-muted);">Warehouse Stock:</span> <strong id="previewStockQty" style="color: #16a34a;">0</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected Materials List Section -->
            <div style="margin-top: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-size: 13.5px; font-weight: 700; color: var(--text);">
                            <i class="fa-solid fa-boxes-stacked" style="color: #0284c7; margin-right: 5px;"></i>
                            Selected Materials List
                        </div>
                        <span id="allocCountBadge" style="font-size: 11.5px; padding: 2px 10px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--border); font-weight: 600; color: var(--text-muted);">
                            0 materials selected
                        </span>
                    </div>
                    <button type="button" id="btnClearMaterialCart" class="ant-btn ant-btn-sm" style="display: none; height: 26px; font-size: 11.5px; color: #ef4444; border-color: rgba(239, 68, 68, 0.35); background: rgba(239, 68, 68, 0.06);">
                        <i class="fa-solid fa-trash-can"></i> Clear All
                    </button>
                </div>

                <div id="allocatedMaterialsList">
                    <!-- Populated by JS -->
                </div>

                <!-- Summary Bar -->
                <div id="allocCartSummaryBar" style="display: none; margin-top: 10px; padding: 10px 14px; border-radius: 8px; background: rgba(2, 132, 199, 0.07); border: 1px solid rgba(2, 132, 199, 0.22); align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 16px; font-size: 12.5px; color: var(--text);">
                        <span><i class="fa-solid fa-boxes-stacked" style="color: #0284c7; margin-right: 5px;"></i> Selected Materials: <strong id="cartSummaryItemCount">0</strong></span>
                        <span><i class="fa-solid fa-cubes" style="color: #0284c7; margin-right: 5px;"></i> Total Quantity: <strong id="cartSummaryTotalQty">0</strong> units</span>
                    </div>
                    <div id="cartUnsavedIndicator" style="display: none; font-size: 11.5px; font-weight: 600; color: #d97706;">
                        <i class="fa-solid fa-circle-exclamation"></i> List updated — Click "Confirm & Save Materials" below
                    </div>
                </div>
            </div>
        </div>
        <div class="pj-modal-footer" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <button type="button" class="ant-btn ant-btn-default pj-modal-close">Cancel</button>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="ant-btn ant-btn-primary" id="btnSaveMaterialCart" style="background: #16a34a; border-color: #16a34a; height: 36px; display: inline-flex; align-items: center; gap: 7px; font-weight: 600;">
                    <i class="fa-solid fa-check-double"></i> <span>Confirm & Save Materials</span>
                </button>
                <button type="button" class="ant-btn ant-btn-primary" id="btnModalStartPrinting" style="display: none; background: #0284c7; border-color: #0284c7; height: 36px; align-items: center; gap: 7px; font-weight: 600;">
                    <i class="fa-solid fa-print"></i> <span>Save & Start Printing</span>
                </button>
            </div>
        </div>
    </div>
</div>
