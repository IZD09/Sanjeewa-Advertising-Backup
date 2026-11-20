<!-- ==================================================================
     MODAL 1: JOB DETAILS & STATUS HISTORY MODAL
     ================================================================== -->
<div class="pj-modal-overlay" id="modalJobDetails">
    <div class="pj-modal">
        <div class="pj-modal-header">
            <h3><i class="fa-solid fa-circle-info" style="color: #1677ff;"></i> Job Details & History</h3>
            <button type="button" class="pj-modal-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="pj-modal-body">
            <div style="background: var(--surface-2); border-radius: 8px; padding: 12px; border: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                    <div style="font-size: 11px; color: var(--text-muted);">Job Code</div>
                    <div style="font-size: 14px; font-weight: 700; color: var(--text);" id="detailsJobCode">—</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: var(--text-muted);">Order Date</div>
                    <div style="font-size: 13px; font-weight: 600; color: var(--text);" id="detailsDate">—</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: var(--text-muted);">Customer</div>
                    <div style="font-size: 13px; font-weight: 600; color: var(--text);" id="detailsCustomerName">—</div>
                    <div style="font-size: 11px; color: var(--text-muted);" id="detailsCustomerContact">—</div>
                </div>
                <div>
                    <div style="font-size: 11px; color: var(--text-muted);">Specification</div>
                    <div style="font-size: 13px; font-weight: 600; color: var(--text);" id="detailsPrintType">—</div>
                    <div style="font-size: 11px; color: #38bdf8; font-weight: 600;" id="detailsQuantity">—</div>
                </div>
            </div>

            <!-- Financial Snapshot -->
            <div>
                <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 6px 0; color: var(--text);">
                    <i class="fa-solid fa-file-invoice-dollar" style="color: #52c41a;"></i> Financial Summary
                </h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px; text-align: center;">
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted);">Total Amount</div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--text);" id="detailsTotalAmount">Rs. 0.00</div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted);">Paid</div>
                        <div style="font-size: 13px; font-weight: 700; color: #52c41a;" id="detailsPaidAmount">Rs. 0.00</div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted);">Balance</div>
                        <div style="font-size: 13px; font-weight: 700; color: #ef4444;" id="detailsBalanceAmount">Rs. 0.00</div>
                    </div>
                    <div>
                        <div style="font-size: 10.5px; color: var(--text-muted);">Status</div>
                        <div style="margin-top: 2px;"><span id="detailsPaymentBadge" class="pj-pay-badge unpaid">Unpaid</span></div>
                    </div>
                </div>
            </div>

            <!-- Allocated Materials -->
            <div>
                <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 6px 0; color: var(--text);">
                    <i class="fa-solid fa-boxes-stacked" style="color: #fa8c16;"></i> Allocated Materials & Raw Stock
                </h4>
                <div id="detailsMaterialsList">
                    <!-- Populated by JS -->
                </div>
            </div>

            <!-- Status History Timeline -->
            <div>
                <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 8px 0; color: var(--text);">
                    <i class="fa-solid fa-clock-rotate-left" style="color: #722ed1;"></i> Status History Timeline
                </h4>
                <div id="detailsTimelineContainer">
                    <!-- Populated by JS -->
                </div>
            </div>
        </div>
        <div class="pj-modal-footer">
            <div style="font-size: 11px; color: var(--text-muted); margin-right: auto;">
                Registered by: <strong id="detailsOperator" style="color: var(--text);">—</strong>
            </div>
            <button type="button" class="ant-btn ant-btn-default pj-modal-close">Close</button>
        </div>
    </div>
</div>
