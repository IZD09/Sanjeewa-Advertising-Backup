<!-- ==========================================================================
     MODAL 1: ADD / EDIT VEHICLE (`truck` & `model` tables)
     ========================================================================== -->
<div class="trp-modal-overlay" id="modalTrpVehicle">
    <div class="trp-modal-card" style="max-width: 560px;">
        <div class="trp-modal-header">
            <h3 id="modalTrpVehicleTitle"><i class="fa-solid fa-truck-medical" style="color: #1677ff;"></i> Add Fleet Vehicle</h3>
            <button type="button" class="trp-modal-close" data-close-trp-modal="modalTrpVehicle" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formTrpVehicle">
            <input type="hidden" id="trpVehicleId" value="">
            <div class="trp-modal-body">
                <div class="trp-form-error" id="trpVehicleError" style="display: none;"></div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpVehicleRegister">Registration Plate <span class="req">*</span></label>
                        <input type="text" id="trpVehicleRegister" class="trp-input" placeholder="e.g. WP-LB-4521" maxlength="20" required style="text-transform: uppercase; font-weight: 700;">
                    </div>
                    <div class="trp-form-group">
                        <label for="trpVehicleStatus">Fleet Status</label>
                        <select id="trpVehicleStatus" class="trp-select-full">
                            <option value="Available">Available (Ready)</option>
                            <option value="Maintenance">Under Maintenance</option>
                        </select>
                    </div>
                </div>

                <div class="trp-form-group">
                    <div class="trp-label-between">
                        <label for="trpVehicleModelSelect">Vehicle Brand / Model <span class="req">*</span></label>
                        <button type="button" class="trp-link-btn" id="btnToggleNewModelInput">
                            <i class="fa-solid fa-plus"></i> Add New Model
                        </button>
                    </div>
                    <select id="trpVehicleModelSelect" class="trp-select-full">
                        <option value="">-- Select Vehicle Model --</option>
                    </select>
                    <div id="trpNewModelWrap" style="display: none; margin-top: 8px;">
                        <input type="text" id="trpNewModelName" class="trp-input" placeholder="Enter new vehicle model name (e.g. Isuzu Elf, Tata Ace)..." maxlength="45">
                    </div>
                </div>

                <div class="trp-form-group">
                    <label for="trpVehicleDriverSelect">Default Assigned Driver (Optional)</label>
                    <select id="trpVehicleDriverSelect" class="trp-select-full">
                        <option value="">-- No Default Driver Assigned --</option>
                    </select>
                </div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpVehicleCurrentKm">Current Odometer (km)</label>
                        <input type="number" id="trpVehicleCurrentKm" class="trp-input" min="0" step="1" value="0" placeholder="e.g. 45200">
                    </div>
                    <div class="trp-form-group">
                        <label for="trpVehicleEfficiency">Expected Efficiency (km/L)</label>
                        <input type="number" id="trpVehicleEfficiency" class="trp-input" min="0.5" max="100" step="0.1" placeholder="e.g. 9.5">
                    </div>
                </div>
            </div>
            <div class="trp-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-trp-modal="modalTrpVehicle">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary" id="btnSubmitTrpVehicle">
                    <i class="fa-solid fa-check"></i> <span id="btnSubmitTrpVehicleLabel">Save Vehicle</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ==========================================================================
     MODAL 2: SET / CHANGE DRIVER FOR VEHICLE OR ACTIVE TRANSPORT
     ========================================================================== -->
<div class="trp-modal-overlay" id="modalTrpAssignDriver">
    <div class="trp-modal-card" style="max-width: 480px;">
        <div class="trp-modal-header">
            <h3 id="modalAssignDriverTitle"><i class="fa-solid fa-user-gear" style="color: #0284c7;"></i> Assign Driver to Vehicle</h3>
            <button type="button" class="trp-modal-close" data-close-trp-modal="modalTrpAssignDriver" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formTrpAssignDriver">
            <input type="hidden" id="assignDriverMode" value="vehicle">
            <input type="hidden" id="assignDriverTargetId" value="">
            <div class="trp-modal-body">
                <div class="trp-form-error" id="trpAssignDriverError" style="display: none;"></div>

                <div class="trp-summary-banner" id="assignDriverVehicleSummary">
                    —
                </div>

                <div class="trp-form-group">
                    <div class="trp-label-between">
                        <label for="trpAssignDriverSelect">Select Driver / Staff Member <span class="req">*</span></label>
                        <button type="button" class="trp-link-btn" id="btnQuickNewDriverFromAssign">
                            <i class="fa-solid fa-user-plus"></i> + New Driver
                        </button>
                    </div>
                    <select id="trpAssignDriverSelect" class="trp-select-full">
                        <option value="">-- Unassigned (Clear Default Driver) --</option>
                    </select>
                </div>

                <label class="trp-checkbox-row" id="assignDriverActiveTripWrap" style="display: none;">
                    <input type="checkbox" id="chkApplyDriverToActiveTrip" checked>
                    <span>Also update driver on this vehicle's active In-Transit trip</span>
                </label>
            </div>
            <div class="trp-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-trp-modal="modalTrpAssignDriver">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary" id="btnSubmitAssignDriver">
                    <i class="fa-solid fa-check"></i> Confirm Driver Assignment
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ==========================================================================
     MODAL 3: START NEW TRANSPORT DISPATCH (`transport` table)
     ========================================================================== -->
<div class="trp-modal-overlay" id="modalTrpStartDispatch">
    <div class="trp-modal-card" style="max-width: 640px;">
        <div class="trp-modal-header">
            <h3><i class="fa-solid fa-route" style="color: #1677ff;"></i> Start New Transport Dispatch</h3>
            <button type="button" class="trp-modal-close" data-close-trp-modal="modalTrpStartDispatch" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formTrpStartDispatch">
            <div class="trp-modal-body">
                <div class="trp-form-error" id="trpStartDispatchError" style="display: none;"></div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpDispatchVehicleSelect">Transporting Vehicle <span class="req">*</span></label>
                        <select id="trpDispatchVehicleSelect" class="trp-select-full" required>
                            <option value="">-- Choose Available Vehicle --</option>
                        </select>
                    </div>
                    <div class="trp-form-group">
                        <div class="trp-label-between">
                            <label for="trpDispatchDriverSelect">Assigned Driver <span class="req">*</span></label>
                            <button type="button" class="trp-link-btn" id="btnQuickNewDriverFromDispatch">
                                <i class="fa-solid fa-user-plus"></i> + New Driver
                            </button>
                        </div>
                        <select id="trpDispatchDriverSelect" class="trp-select-full" required>
                            <option value="">-- Choose Driver --</option>
                        </select>
                    </div>
                </div>

                <div class="trp-form-group">
                    <label for="trpDispatchDestination">Destination / Route &amp; Purpose <span class="req">*</span></label>
                    <input type="text" id="trpDispatchDestination" class="trp-input" placeholder="e.g. Kandy Town - Billboard Frame Delivery &amp; Installation" maxlength="150" required>
                </div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpDispatchStartTime">Departure Date &amp; Time <span class="req">*</span></label>
                        <input type="datetime-local" id="trpDispatchStartTime" class="trp-input" required>
                    </div>
                    <div class="trp-form-group">
                        <label for="trpDispatchStartKm">Starting Odometer (km) <span class="req">*</span></label>
                        <input type="number" id="trpDispatchStartKm" class="trp-input" min="0" step="1" required placeholder="Auto-filled from vehicle">
                    </div>
                </div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpDispatchPrintJobSelect">Linked Print Job (Optional)</label>
                        <select id="trpDispatchPrintJobSelect" class="trp-select-full">
                            <option value="">-- General / Multi-Order Trip --</option>
                        </select>
                    </div>
                    <div class="trp-form-group">
                        <label for="trpDispatchDieselRateSelect">Active Diesel Rate</label>
                        <select id="trpDispatchDieselRateSelect" class="trp-select-full">
                        </select>
                    </div>
                </div>

                <div class="trp-form-group">
                    <label for="trpDispatchNotes">Dispatch Instructions / Notes</label>
                    <textarea id="trpDispatchNotes" class="trp-textarea" rows="2" maxlength="255" placeholder="Delivery contact details, loading notes, highway toll instructions..."></textarea>
                </div>
            </div>
            <div class="trp-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-trp-modal="modalTrpStartDispatch">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary" id="btnSubmitStartDispatch">
                    <i class="fa-solid fa-paper-plane"></i> Dispatch Vehicle Now
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ==========================================================================
     MODAL 4: COMPLETE TRANSPORT & RECORD DIESEL CONSUMPTION
     ========================================================================== -->
<div class="trp-modal-overlay" id="modalTrpCompleteTrip">
    <div class="trp-modal-card" style="max-width: 620px;">
        <div class="trp-modal-header">
            <h3 id="modalCompleteTripTitle"><i class="fa-solid fa-gas-pump" style="color: #10b981;"></i> Complete Transport &amp; Log Diesel</h3>
            <button type="button" class="trp-modal-close" data-close-trp-modal="modalTrpCompleteTrip" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formTrpCompleteTrip">
            <input type="hidden" id="completeTripId" value="">
            <input type="hidden" id="completeTripStartKm" value="0">
            <input type="hidden" id="completeTripExpectedEff" value="">
            <div class="trp-modal-body">
                <div class="trp-form-error" id="trpCompleteTripError" style="display: none;"></div>

                <!-- Trip Summary Header -->
                <div class="trp-summary-banner" id="completeTripSummaryBanner">
                    —
                </div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpCompleteEndTime">Return / Completion Time <span class="req">*</span></label>
                        <input type="datetime-local" id="trpCompleteEndTime" class="trp-input" required>
                    </div>
                    <div class="trp-form-group">
                        <label for="trpCompleteEndKm">Closing Odometer (km) <span class="req">*</span></label>
                        <input type="number" id="trpCompleteEndKm" class="trp-input" min="0" step="1" required placeholder="Enter ending meter reading">
                    </div>
                </div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <div class="trp-label-between">
                            <label for="trpCompleteDieselLiters">Diesel Consumed (Liters) <span class="req">*</span></label>
                            <button type="button" class="trp-link-btn" id="btnEstimateDieselLiters" title="Estimate liters from trip distance and vehicle km/L">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Estimate
                            </button>
                        </div>
                        <input type="number" id="trpCompleteDieselLiters" class="trp-input" min="0" step="0.001" required placeholder="e.g. 8.5">
                    </div>
                    <div class="trp-form-group">
                        <label for="trpCompleteDieselRateSelect">Diesel Rate (Rs. / Liter)</label>
                        <select id="trpCompleteDieselRateSelect" class="trp-select-full">
                        </select>
                    </div>
                </div>

                <!-- Live Calculation Preview Box -->
                <div class="trp-calc-card">
                    <div class="trp-calc-item">
                        <span class="trp-calc-label">Journey Distance</span>
                        <strong class="trp-calc-value" id="calcTripDistanceKm">0 km</strong>
                    </div>
                    <div class="trp-calc-item">
                        <span class="trp-calc-label">Actual Fuel Economy</span>
                        <strong class="trp-calc-value" id="calcTripFuelEconomy">— km/L</strong>
                    </div>
                    <div class="trp-calc-item highlight">
                        <span class="trp-calc-label">Calculated Diesel Cost</span>
                        <strong class="trp-calc-value" id="calcTripDieselCost">Rs. 0.00</strong>
                    </div>
                </div>

                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpCompleteDieselCostOverride">Final Fuel Cost (Rs.) <span style="font-weight: 400; color: var(--text-muted);">(Auto-filled)</span></label>
                        <input type="number" id="trpCompleteDieselCostOverride" class="trp-input" min="0" step="0.01" placeholder="Auto-calculated from Liters × Rate">
                    </div>
                    <div class="trp-form-group">
                        <label for="trpCompleteDestination">Route / Destination</label>
                        <input type="text" id="trpCompleteDestination" class="trp-input" maxlength="150">
                    </div>
                </div>

                <div class="trp-form-group">
                    <label for="trpCompleteNotes">Completion &amp; Fuel Remarks</label>
                    <textarea id="trpCompleteNotes" class="trp-textarea" rows="2" maxlength="255" placeholder="Fuel station receipt #, return condition, delivery confirmation..."></textarea>
                </div>
            </div>
            <div class="trp-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-trp-modal="modalTrpCompleteTrip">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary" id="btnSubmitCompleteTrip" style="background: #10b981; border-color: #10b981;">
                    <i class="fa-solid fa-circle-check"></i> Complete Trip &amp; Save Diesel
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ==========================================================================
     MODAL 5: UPDATE DIESEL PRICE (`desial_price` table)
     ========================================================================== -->
<div class="trp-modal-overlay" id="modalTrpDieselPrice">
    <div class="trp-modal-card" style="max-width: 440px;">
        <div class="trp-modal-header">
            <h3><i class="fa-solid fa-gas-pump" style="color: #f59e0b;"></i> Update Diesel Price per Liter</h3>
            <button type="button" class="trp-modal-close" data-close-trp-modal="modalTrpDieselPrice" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formTrpDieselPrice">
            <div class="trp-modal-body">
                <div class="trp-form-error" id="trpDieselPriceError" style="display: none;"></div>
                <div class="trp-form-group">
                    <label for="trpDieselPriceInput">Diesel Rate per 1 Liter (Rs.) <span class="req">*</span></label>
                    <input type="number" id="trpDieselPriceInput" class="trp-input" min="1" step="0.01" required placeholder="e.g. 286.00">
                </div>
                <div class="trp-form-group">
                    <label for="trpDieselDateInput">Effective Date <span class="req">*</span></label>
                    <input type="date" id="trpDieselDateInput" class="trp-input" required>
                </div>
            </div>
            <div class="trp-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-trp-modal="modalTrpDieselPrice">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary" id="btnSubmitDieselPrice">
                    <i class="fa-solid fa-check"></i> Save Diesel Rate
                </button>
            </div>
        </form>
    </div>
</div>

<!-- ==========================================================================
     MODAL 6: QUICK REGISTER DRIVER (`staff` table with Driver role)
     ========================================================================== -->
<div class="trp-modal-overlay" id="modalTrpAddDriver">
    <div class="trp-modal-card" style="max-width: 500px;">
        <div class="trp-modal-header">
            <h3><i class="fa-solid fa-id-card-clip" style="color: #0284c7;"></i> Register New Driver</h3>
            <button type="button" class="trp-modal-close" data-close-trp-modal="modalTrpAddDriver" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <form id="formTrpAddDriver">
            <div class="trp-modal-body">
                <div class="trp-form-error" id="trpAddDriverError" style="display: none;"></div>
                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpDriverFirstName">First Name <span class="req">*</span></label>
                        <input type="text" id="trpDriverFirstName" class="trp-input" maxlength="50" required placeholder="e.g. Kasun">
                    </div>
                    <div class="trp-form-group">
                        <label for="trpDriverLastName">Last Name <span class="req">*</span></label>
                        <input type="text" id="trpDriverLastName" class="trp-input" maxlength="50" required placeholder="e.g. Bandara">
                    </div>
                </div>
                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpDriverNic">NIC Number <span class="req">*</span></label>
                        <input type="text" id="trpDriverNic" class="trp-input" maxlength="15" required placeholder="e.g. 199212345678">
                    </div>
                    <div class="trp-form-group">
                        <label for="trpDriverMobile">Mobile Phone <span class="req">*</span></label>
                        <input type="tel" id="trpDriverMobile" class="trp-input" maxlength="15" required placeholder="e.g. 0771234567">
                    </div>
                </div>
                <div class="trp-form-row-2">
                    <div class="trp-form-group">
                        <label for="trpDriverRole">Transport Role</label>
                        <select id="trpDriverRole" class="trp-select-full">
                            <option value="Driver">Driver</option>
                            <option value="Delivery Assistant">Delivery Assistant</option>
                        </select>
                    </div>
                    <div class="trp-form-group">
                        <label for="trpDriverAssignVehicle">Assign to Vehicle (Optional)</label>
                        <select id="trpDriverAssignVehicle" class="trp-select-full">
                            <option value="">-- Do Not Assign Yet --</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="trp-modal-footer">
                <button type="button" class="ant-btn ant-btn-default" data-close-trp-modal="modalTrpAddDriver">Cancel</button>
                <button type="submit" class="ant-btn ant-btn-primary" id="btnSubmitAddDriver">
                    <i class="fa-solid fa-check"></i> Save Driver
                </button>
            </div>
        </form>
    </div>
</div>
