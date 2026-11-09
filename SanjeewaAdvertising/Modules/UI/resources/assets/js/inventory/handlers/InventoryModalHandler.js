/**
 * SanjeewaAdvertising - Inventory Modal Handler Orchestrator
 *
 * Coordinates and delegates modal operations across specialized modal classes:
 * - ViewStockModal: Item stock details, batches table & transactions timeline
 * - AdjustStockModal: Live stock ADD/DEDUCT batch adjustments
 * - AddStockModal: Receive stock shipment & SKU registration
 *
 * Extends BaseModalHandler core class.
 */

import { BaseModalHandler } from "../../core/BaseModalHandler.js";
import {
  ViewStockModal,
  AdjustStockModal,
  AddStockModal
} from "../modals/index.js";

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
  }

  get currentContextItem() {
    return this.viewStockModal.currentContextItem || this.adjustStockModal.currentContextItem;
  }

  // View Stock Modal Delegations
  openViewModal(itemCode) { this.viewStockModal.openViewModal(itemCode); }

  // Adjust Stock Modal Delegations
  openAdjustModal(itemCode) { this.adjustStockModal.openAdjustModal(itemCode); }
  onAdjustmentTypeChange(type) { this.adjustStockModal.onAdjustmentTypeChange(type); }
  onAdjustBatchSelect(batchId) { this.adjustStockModal.onAdjustBatchSelect(batchId); }
  onAdjustQtyChange(qty) { this.adjustStockModal.onAdjustQtyChange(qty); }
  saveStockAdjustment() { this.adjustStockModal.saveStockAdjustment(); }

  // Add Stock Shipment Modal Delegations
  openAddStockModal(prefillItemCode = null) { this.addStockModal.openAddStockModal(prefillItemCode); }
  onAddStockItemSelect(val) { this.addStockModal.onAddStockItemSelect(val); }
  onAddStockCalcChange() { this.addStockModal.onAddStockCalcChange(); }
  saveAddStockShipment() { this.addStockModal.saveAddStockShipment(); }
}

export default InventoryModalHandler;
