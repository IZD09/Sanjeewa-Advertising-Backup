/**
 * SanjeewaAdvertising - Inventory Modal Handler Orchestrator
 *
 * Coordinates and delegates modal operations across specialized modal classes:
 * - ViewStockModal: Item stock details, batches table & transactions timeline
 * - AdjustStockModal: Live stock ADD/DEDUCT batch adjustments
 * - AddStockModal: Receive stock shipment & SKU registration
 * - CategoriesModal: Stock categories cards grid & category addition
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../core/BaseModalHandler.js";
import {
  ViewStockModal,
  AdjustStockModal,
  AddStockModal,
  CategoriesModal
} from "./modals/index.js";

export class InventoryModalHandler extends BaseModalHandler {
  /**
   * @param {Object} context
   */
  constructor(context) {
    super({
      activeModalClass: "open",
      overlaySelector: ".po-modal-overlay",
      toastContainerId: "poToastContainer",
      closeSelectors: ["[data-close-inv-modal]", "[data-close-modal]", ".po-modal-close"],
      autoBind: true
    });

    this.ctx = context;

    // Instantiate modular modal handlers
    this.viewStockModal = new ViewStockModal(this.ctx);
    this.adjustStockModal = new AdjustStockModal(this.ctx);
    this.addStockModal = new AddStockModal(this.ctx);
    this.categoriesModal = new CategoriesModal(this.ctx);
  }

  get currentContextItem() {
    return this.viewStockModal.currentContextItem || this.adjustStockModal.currentContextItem;
  }

  // View Stock Modal Delegations
  openViewModal(itemCode) { this.viewStockModal.openViewModal(itemCode); }

  // Adjust Stock Modal Delegations
  openAdjustModal(itemCode) { this.adjustStockModal.openAdjustModal(itemCode); }
  setAdjustmentType(type) { this.adjustStockModal.setAdjustmentType(type); }
  updateAdjustmentImpact() { this.adjustStockModal.updateAdjustmentImpact(); }
  saveStockAdjustment() { this.adjustStockModal.saveStockAdjustment(); }

  // Add Stock Modal Delegations
  openAddStockModal(prefillCode) { this.addStockModal.openAddStockModal(prefillCode); }
  handleItemSelectionChange() { this.addStockModal.handleItemSelectionChange(); }
  updateAddStockFinancials() { this.addStockModal.updateAddStockFinancials(); }
  saveNewStock() { this.addStockModal.saveNewStock(); }

  // Categories Modal Delegations
  openCategoriesModal() { this.categoriesModal.openCategoriesModal(); }
  renderCategoriesGrid() { this.categoriesModal.renderCategoriesGrid(); }
  filterByCategoryFromModal(cat) { this.categoriesModal.filterByCategoryFromModal(cat); }
  saveNewCategory() { this.categoriesModal.saveNewCategory(); }
}
