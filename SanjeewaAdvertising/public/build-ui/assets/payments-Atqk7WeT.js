var e=class{constructor(){this.storageKeys={orders:`sa_advertising_orders`,orderPayments:`sa_advertising_payments`,grnRecords:`sa_advertising_grn_records`,grnPayments:`sa_advertising_grn_payments`},this.orders=[],this.orderPayments=[],this.grnRecords=[],this.grnPayments=[],this.activeTab=`invoice`,this.invoiceSearch=``,this.invoiceStatusFilter=`ALL`,this.invoiceMethodFilter=`ALL`,this.grnSearch=``,this.grnStatusFilter=`ALL`,this.grnMethodFilter=`ALL`,this.modalType=`invoice`,this.selectedMethod=`Cash`,this.init()}init(){this.loadData(),this.bindEvents(),this.render()}loadData(){let e=localStorage.getItem(this.storageKeys.orders),t=localStorage.getItem(this.storageKeys.orderPayments);if(e)try{this.orders=JSON.parse(e)}catch(e){console.error(`Could not parse saved orders`,e)}if(t)try{this.orderPayments=JSON.parse(t)}catch(e){console.error(`Could not parse saved order payments`,e)}let n=localStorage.getItem(this.storageKeys.grnRecords);if(n)try{this.grnRecords=JSON.parse(n)}catch(e){console.error(`Could not parse saved GRNs`,e)}let r=localStorage.getItem(this.storageKeys.grnPayments);if(r)try{this.grnPayments=JSON.parse(r)}catch(e){console.error(`Could not parse saved GRN payments`,e)}else this.seedDefaultGrnPayments();this.enrichOrderPayments()}enrichOrderPayments(){let e=new Date,t=e=>e.toISOString().split(`T`)[0];(!this.orderPayments||this.orderPayments.length<3)&&(this.orderPayments=[{paymentId:`PAY-INV-2026-001`,orderId:`ORD-2026-1048`,invoiceNo:`INV-2026-1048`,customerName:`Kasun Jayasundara`,date:t(new Date(e.getTime()-2592e5)),totalBill:7600,amount:7600,balance:0,stage:`Complete Payment`,method:`Cash`,ref:`CASH-REC-1048`,note:`Full settlement paid upon delivery`},{paymentId:`PAY-INV-2026-002`,orderId:`ORD-2026-1049`,invoiceNo:`INV-2026-1049`,customerName:`Dilhani Senaratne`,date:t(new Date(e.getTime()-1728e5)),totalBill:8060,amount:5e3,balance:3060,stage:`Advance Payment`,method:`Card`,ref:`VISA-AUTH-9921`,cardLast4:`4821`,note:`50% upfront advance paid on Visa Debit card`},{paymentId:`PAY-INV-2026-003`,orderId:`ORD-2026-1050`,invoiceNo:`INV-2026-1050`,customerName:`Sajith Warnakula`,date:t(e),totalBill:11e3,amount:0,balance:11e3,stage:`Pending Payment`,method:`Check`,ref:`CHQ-PENDING`,note:`Cheque promised upon final delivery`},{paymentId:`PAY-INV-2026-004`,orderId:`ORD-2026-1051`,invoiceNo:`INV-2026-1051`,customerName:`Nuwan Weerasinghe`,date:t(e),totalBill:13e3,amount:6500,balance:6500,stage:`Advance Payment`,method:`Bank Transfer`,ref:`BOC-TXN-881920`,note:`Direct online transfer to Sanjeewa Advertising BOC account`}],this.saveOrderPayments())}seedDefaultGrnPayments(){let e=new Date,t=e=>e.toISOString().split(`T`)[0];this.grnPayments=[{paymentId:`PAY-GRN-2026-001`,grnId:`GRN-2610-001`,grnNumber:`GRN-2610-001`,poNumber:`PO-2026-088`,supplierId:`SUP-001`,supplierName:`PaperPro Lanka`,stockCategory:`300gsm Art Board & Cyan Ink`,date:t(new Date(e.getTime()-1728e5)),totalBill:87500,amount:87500,balance:0,stage:`Complete Payment`,method:`Check`,ref:`CHQ-882019-COMBANK`,checkNo:`882019`,bankName:`Commercial Bank`,note:`Account payee crossed cheque issued for full SRA3 board delivery`},{paymentId:`PAY-GRN-2026-002`,grnId:`GRN-2610-002`,grnNumber:`GRN-2610-002`,poNumber:`PO-2026-074`,supplierId:`SUP-003`,supplierName:`MegaFlex Imports`,stockCategory:`Flex Banner Heavy Star 380gsm`,date:t(new Date(e.getTime()-864e5)),totalBill:108e3,amount:5e4,balance:58e3,stage:`Advance Payment`,method:`Bank Transfer`,ref:`HNB-FT-992011`,bankName:`Hatton National Bank`,note:`Initial advance transferred on container unloading. Balance on 30 days.`},{paymentId:`PAY-GRN-2026-003`,grnId:`GRN-2610-003`,grnNumber:`GRN-2610-003`,poNumber:`PO-2026-092`,supplierId:`SUP-002`,supplierName:`Flora Tech International`,stockCategory:`Solvent Inks & Cleaning Solvents`,date:t(e),totalBill:64e3,amount:0,balance:64e3,stage:`Pending Payment`,method:`Check`,ref:`DUE-14-DAYS`,note:`Credit invoice received, payable within 14 days credit terms`},{paymentId:`PAY-GRN-2026-004`,grnId:`GRN-2610-004`,grnNumber:`GRN-2610-004`,poNumber:`PO-2026-068`,supplierId:`SUP-005`,supplierName:`Star Media Group`,stockCategory:`Foam Boards 5mm & Acrylic Sheets`,date:t(e),totalBill:42e3,amount:42e3,balance:0,stage:`Complete Payment`,method:`Cash`,ref:`PETTY-CASH-402`,note:`Cash on delivery paid from petty cash voucher`},{paymentId:`PAY-GRN-2026-005`,grnId:`GRN-2610-005`,grnNumber:`GRN-2610-005`,poNumber:`PO-2026-095`,supplierId:`SUP-004`,supplierName:`Avery Dennison Lanka`,stockCategory:`Vinyl Sticker Glossy Rolls`,date:t(e),totalBill:96e3,amount:3e4,balance:66e3,stage:`Advance Payment`,method:`Card`,ref:`CORP-CARD-8832`,cardLast4:`8832`,note:`Deposit paid using company credit card on order placement`}],this.saveGrnPayments()}saveOrderPayments(){localStorage.setItem(this.storageKeys.orderPayments,JSON.stringify(this.orderPayments))}saveGrnPayments(){localStorage.setItem(this.storageKeys.grnPayments,JSON.stringify(this.grnPayments))}bindEvents(){document.addEventListener(`click`,e=>{let t=e.target.closest(`.pay-tab-btn`);if(t){e.preventDefault();let n=t.getAttribute(`data-tab`);this.switchTab(n);return}let n=e.target.closest(`#btnOpenRecordPayment, [data-open-pay-modal]`);if(n){e.preventDefault();let t=n.getAttribute(`data-pay-type`)||this.activeTab,r=n.getAttribute(`data-pay-ref`);this.openRecordPaymentModal(t,r);return}if(e.target.closest(`.pay-modal-close, [data-close-pay-modal]`)){e.preventDefault(),this.closeModals();return}let r=e.target.closest(`.method-choice`);if(r){e.preventDefault(),document.querySelectorAll(`.method-choice`).forEach(e=>e.classList.remove(`selected`)),r.classList.add(`selected`),this.selectedMethod=r.getAttribute(`data-method`),this.updateMethodFields();return}let i=e.target.closest(`[data-view-receipt]`);if(i){e.preventDefault();let t=i.getAttribute(`data-view-receipt`),n=i.getAttribute(`data-type`)||`invoice`;this.openReceiptModal(t,n)}else e.target.closest(`#btnPrintReceipt`)&&(e.preventDefault(),window.print())});let e=document.getElementById(`payInvoiceSearch`);e&&e.addEventListener(`input`,e=>{this.invoiceSearch=e.target.value.toLowerCase().trim(),this.renderInvoiceTable()});let t=document.getElementById(`payInvoiceStatusFilter`);t&&t.addEventListener(`change`,e=>{this.invoiceStatusFilter=e.target.value,this.renderInvoiceTable()});let n=document.getElementById(`payInvoiceMethodFilter`);n&&n.addEventListener(`change`,e=>{this.invoiceMethodFilter=e.target.value,this.renderInvoiceTable()});let r=document.getElementById(`payInvoiceResetFilters`);r&&r.addEventListener(`click`,()=>{this.invoiceSearch=``,this.invoiceStatusFilter=`ALL`,this.invoiceMethodFilter=`ALL`,e&&(e.value=``),t&&(t.value=`ALL`),n&&(n.value=`ALL`),this.renderInvoiceTable()});let i=document.getElementById(`payGrnSearch`);i&&i.addEventListener(`input`,e=>{this.grnSearch=e.target.value.toLowerCase().trim(),this.renderGrnTable()});let a=document.getElementById(`payGrnStatusFilter`);a&&a.addEventListener(`change`,e=>{this.grnStatusFilter=e.target.value,this.renderGrnTable()});let o=document.getElementById(`payGrnMethodFilter`);o&&o.addEventListener(`change`,e=>{this.grnMethodFilter=e.target.value,this.renderGrnTable()});let s=document.getElementById(`payGrnResetFilters`);s&&s.addEventListener(`click`,()=>{this.grnSearch=``,this.grnStatusFilter=`ALL`,this.grnMethodFilter=`ALL`,i&&(i.value=``),a&&(a.value=`ALL`),o&&(o.value=`ALL`),this.renderGrnTable()}),document.querySelectorAll(`input[name="modalPayType"]`).forEach(e=>{e.addEventListener(`change`,e=>{this.modalType=e.target.value,this.updateModalReferenceDropdown()})});let c=document.getElementById(`modalPayRefSelect`);c&&c.addEventListener(`change`,()=>{this.onReferenceSelected()});let l=document.getElementById(`modalPayAmount`);l&&l.addEventListener(`input`,()=>{this.onAmountChanged()});let u=document.getElementById(`btnSaveNewPayment`);u&&u.addEventListener(`click`,()=>{this.savePayment()})}switchTab(e){this.activeTab=e===`grn`||e===`grn-payment`?`grn`:e===`overview`?`overview`:`invoice`,document.querySelectorAll(`.pay-tab-btn`).forEach(e=>{let t=e.getAttribute(`data-tab`);e.classList.toggle(`active`,t===this.activeTab)});let t=document.getElementById(`payTabPaneInvoice`),n=document.getElementById(`payTabPaneGrn`),r=document.getElementById(`payTabPaneOverview`);t&&(t.style.display=this.activeTab===`invoice`?`block`:`none`),n&&(n.style.display=this.activeTab===`grn`?`block`:`none`),r&&(r.style.display=this.activeTab===`overview`?`block`:`none`),window.sidebarComponent&&window.sidebarComponent.setActiveRoute(`payments`,this.activeTab===`invoice`?`invoice-payment`:this.activeTab===`grn`?`grn-payment`:null),this.render()}render(){this.updateKPIs(),this.renderInvoiceTable(),this.renderGrnTable(),this.renderOverviewTab()}updateKPIs(){let e=this.orderPayments.reduce((e,t)=>e+(Number(t.totalBill)||0),0),t=this.orderPayments.reduce((e,t)=>e+(Number(t.amount)||0),0),n=this.orderPayments.reduce((e,t)=>e+(Number(t.balance)||0),0),r=this.orderPayments.filter(e=>e.stage===`Complete Payment`).length,i=this.orderPayments.filter(e=>e.stage===`Advance Payment`).length,a=this.orderPayments.filter(e=>e.stage===`Pending Payment`).length,o=document.getElementById(`kpiInvTotalBilled`),s=document.getElementById(`kpiInvTotalCollected`),c=document.getElementById(`kpiInvTotalPending`),l=document.getElementById(`kpiInvStageCounts`);o&&(o.textContent=`Rs. ${e.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),s&&(s.textContent=`Rs. ${t.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),c&&(c.textContent=`Rs. ${n.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),l&&(l.innerHTML=`<strong>${r}</strong> Complete | <strong>${i}</strong> Advance | <strong>${a}</strong> Pending`);let u=this.orderPayments.filter(e=>e.method===`Card`).reduce((e,t)=>e+Number(t.amount),0),d=this.orderPayments.filter(e=>e.method===`Cash`).reduce((e,t)=>e+Number(t.amount),0),f=this.orderPayments.filter(e=>e.method===`Check`).reduce((e,t)=>e+Number(t.amount),0),p=this.orderPayments.filter(e=>e.method===`Bank Transfer`).reduce((e,t)=>e+Number(t.amount),0),m=document.getElementById(`invMethodCardTotal`),h=document.getElementById(`invMethodCashTotal`),g=document.getElementById(`invMethodCheckTotal`),_=document.getElementById(`invMethodTransferTotal`);m&&(m.textContent=`Rs. ${u.toLocaleString()}`),h&&(h.textContent=`Rs. ${d.toLocaleString()}`),g&&(g.textContent=`Rs. ${f.toLocaleString()}`),_&&(_.textContent=`Rs. ${p.toLocaleString()}`);let v=this.grnPayments.reduce((e,t)=>e+(Number(t.totalBill)||0),0),y=this.grnPayments.reduce((e,t)=>e+(Number(t.amount)||0),0),b=this.grnPayments.reduce((e,t)=>e+(Number(t.balance)||0),0),x=this.grnPayments.filter(e=>e.stage===`Complete Payment`).length,S=this.grnPayments.filter(e=>e.stage===`Advance Payment`).length,C=this.grnPayments.filter(e=>e.stage===`Pending Payment`).length,w=document.getElementById(`kpiGrnTotalBilled`),T=document.getElementById(`kpiGrnTotalPaid`),E=document.getElementById(`kpiGrnTotalDue`),D=document.getElementById(`kpiGrnStageCounts`);w&&(w.textContent=`Rs. ${v.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),T&&(T.textContent=`Rs. ${y.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),E&&(E.textContent=`Rs. ${b.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),D&&(D.innerHTML=`<strong>${x}</strong> Complete | <strong>${S}</strong> Advance | <strong>${C}</strong> Pending`);let O=this.grnPayments.filter(e=>e.method===`Card`).reduce((e,t)=>e+Number(t.amount),0),k=this.grnPayments.filter(e=>e.method===`Cash`).reduce((e,t)=>e+Number(t.amount),0),A=this.grnPayments.filter(e=>e.method===`Check`).reduce((e,t)=>e+Number(t.amount),0),j=this.grnPayments.filter(e=>e.method===`Bank Transfer`).reduce((e,t)=>e+Number(t.amount),0),M=document.getElementById(`grnMethodCardTotal`),N=document.getElementById(`grnMethodCashTotal`),P=document.getElementById(`grnMethodCheckTotal`),F=document.getElementById(`grnMethodTransferTotal`);M&&(M.textContent=`Rs. ${O.toLocaleString()}`),N&&(N.textContent=`Rs. ${k.toLocaleString()}`),P&&(P.textContent=`Rs. ${A.toLocaleString()}`),F&&(F.textContent=`Rs. ${j.toLocaleString()}`);let I=document.getElementById(`tabBadgeInvoiceCount`),L=document.getElementById(`tabBadgeGrnCount`);I&&(I.textContent=this.orderPayments.length),L&&(L.textContent=this.grnPayments.length)}renderInvoiceTable(){let e=document.getElementById(`payInvoiceTableBody`);if(!e)return;let t=this.orderPayments.filter(e=>{let t=!this.invoiceSearch||e.invoiceNo&&e.invoiceNo.toLowerCase().includes(this.invoiceSearch)||e.orderId&&e.orderId.toLowerCase().includes(this.invoiceSearch)||e.customerName&&e.customerName.toLowerCase().includes(this.invoiceSearch)||e.ref&&e.ref.toLowerCase().includes(this.invoiceSearch),n=this.invoiceStatusFilter===`ALL`||e.stage===this.invoiceStatusFilter,r=this.invoiceMethodFilter===`ALL`||e.method===this.invoiceMethodFilter;return t&&n&&r});e.innerHTML=t.length===0?`
        <tr>
          <td colspan="9" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-receipt" style="font-size: 28px; opacity: 0.4; margin-bottom: 8px; display: block;"></i>
            No Invoice Payments match your filter criteria.
          </td>
        </tr>`:t.map(e=>{let t=this.renderStageBadge(e.stage),n=this.renderMethodBadge(e.method,e.ref);return`
        <tr>
          <td>
            <strong style="color: var(--blue);">${e.invoiceNo||e.orderId}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${e.date}</div>
          </td>
          <td>
            <strong>${e.customerName||`Customer`}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">Ref: ${e.orderId}</div>
          </td>
          <td>${t}</td>
          <td>${n}</td>
          <td style="font-weight: 700;">Rs. ${(Number(e.totalBill)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}</td>
          <td style="font-weight: 800; color: #10b981;">Rs. ${(Number(e.amount)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}</td>
          <td style="font-weight: 700; color: ${(Number(e.balance)||0)>0?`#ef4444`:`var(--text-muted)`};">
            Rs. ${(Number(e.balance)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}
          </td>
          <td>
            <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${e.note||``}">
              ${e.note||`-`}
            </span>
          </td>
          <td>
            <div class="pay-table-actions">
              <button type="button" class="pay-btn-sm" data-view-receipt="${e.paymentId}" data-type="invoice" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${e.balance>0?`
              <button type="button" class="pay-btn-sm primary-sm" data-open-pay-modal data-pay-type="invoice" data-pay-ref="${e.orderId}" title="Record settlement installment">
                <i class="fa-solid fa-plus"></i> Pay
              </button>`:``}
            </div>
          </td>
        </tr>`}).join(``)}renderGrnTable(){let e=document.getElementById(`payGrnTableBody`);if(!e)return;let t=this.grnPayments.filter(e=>{let t=!this.grnSearch||e.grnNumber&&e.grnNumber.toLowerCase().includes(this.grnSearch)||e.poNumber&&e.poNumber.toLowerCase().includes(this.grnSearch)||e.supplierName&&e.supplierName.toLowerCase().includes(this.grnSearch)||e.ref&&e.ref.toLowerCase().includes(this.grnSearch),n=this.grnStatusFilter===`ALL`||e.stage===this.grnStatusFilter,r=this.grnMethodFilter===`ALL`||e.method===this.grnMethodFilter;return t&&n&&r});e.innerHTML=t.length===0?`
        <tr>
          <td colspan="9" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <i class="fa-solid fa-truck-ramp-box" style="font-size: 28px; opacity: 0.4; margin-bottom: 8px; display: block;"></i>
            No GRN Stock Payments match your filter criteria.
          </td>
        </tr>`:t.map(e=>{let t=this.renderStageBadge(e.stage),n=this.renderMethodBadge(e.method,e.ref);return`
        <tr>
          <td>
            <strong style="color: #10b981;">${e.grnNumber}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">PO: ${e.poNumber||`-`}</div>
          </td>
          <td>
            <strong>${e.supplierName||`Supplier`}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${e.stockCategory||`Stock Delivery`}</div>
          </td>
          <td>${t}</td>
          <td>${n}</td>
          <td style="font-weight: 700;">Rs. ${(Number(e.totalBill)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}</td>
          <td style="font-weight: 800; color: #10b981;">Rs. ${(Number(e.amount)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}</td>
          <td style="font-weight: 700; color: ${(Number(e.balance)||0)>0?`#ef4444`:`var(--text-muted)`};">
            Rs. ${(Number(e.balance)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}
          </td>
          <td>
            <span style="font-size: 11.5px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;" title="${e.note||``}">
              ${e.note||`-`}
            </span>
          </td>
          <td>
            <div class="pay-table-actions">
              <button type="button" class="pay-btn-sm" data-view-receipt="${e.paymentId}" data-type="grn" title="View & Print Payment Voucher">
                <i class="fa-solid fa-receipt"></i> Voucher
              </button>
              ${e.balance>0?`
              <button type="button" class="pay-btn-sm green-sm" data-open-pay-modal data-pay-type="grn" data-pay-ref="${e.grnId}" title="Pay supplier installment">
                <i class="fa-solid fa-money-bill-wave"></i> Pay
              </button>`:``}
            </div>
          </td>
        </tr>`}).join(``)}renderOverviewTab(){this.orderPayments.reduce((e,t)=>e+(Number(t.totalBill)||0),0);let e=this.orderPayments.reduce((e,t)=>e+(Number(t.amount)||0),0),t=this.orderPayments.reduce((e,t)=>e+(Number(t.balance)||0),0);this.grnPayments.reduce((e,t)=>e+(Number(t.totalBill)||0),0);let n=this.grnPayments.reduce((e,t)=>e+(Number(t.amount)||0),0),r=this.grnPayments.reduce((e,t)=>e+(Number(t.balance)||0),0),i=e-n,a=document.getElementById(`ovNetOperatingCash`),o=document.getElementById(`ovJobCashInflow`),s=document.getElementById(`ovGrnCashOutflow`),c=document.getElementById(`ovReceivablesTotal`),l=document.getElementById(`ovPayablesTotal`);a&&(a.textContent=`Rs. ${i.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`,a.style.color=i>=0?`#10b981`:`#ef4444`),o&&(o.textContent=`Rs. ${e.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),s&&(s.textContent=`Rs. ${n.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),c&&(c.textContent=`Rs. ${t.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`),l&&(l.textContent=`Rs. ${r.toLocaleString(`en-LK`,{minimumFractionDigits:2})}`)}renderStageBadge(e){return e===`Complete Payment`?`<span class="status-pill complete"><i class="fa-solid fa-circle-check"></i> Complete Payment</span>`:e===`Advance Payment`?`<span class="status-pill advance"><i class="fa-solid fa-hourglass-half"></i> Advance Payment</span>`:`<span class="status-pill pending"><i class="fa-solid fa-clock"></i> Pending Payment</span>`}renderMethodBadge(e,t=``){return e===`Card`?`<span class="method-pill card"><i class="fa-solid fa-credit-card"></i> Card</span>`:e===`Cash`?`<span class="method-pill cash"><i class="fa-solid fa-money-bill-wave"></i> Cash</span>`:e===`Check`?`<span class="method-pill check"><i class="fa-solid fa-money-check"></i> Check</span>`:`<span class="method-pill transfer"><i class="fa-solid fa-building-columns"></i> Bank Transfer</span>`}openRecordPaymentModal(e=`invoice`,t=null){let n=document.getElementById(`recordPaymentModal`);if(!n)return;this.modalType=e===`grn`||e===`grn-payment`?`grn`:`invoice`;let r=document.getElementById(`modalRadioInvoice`),i=document.getElementById(`modalRadioGrn`);r&&(r.checked=this.modalType===`invoice`),i&&(i.checked=this.modalType===`grn`),document.querySelectorAll(`.pay-type-option`).forEach(e=>{let t=e.classList.contains(`invoice-option`);e.classList.toggle(`selected`,this.modalType===`invoice`&&t||this.modalType===`grn`&&!t)}),this.updateModalReferenceDropdown(t),this.selectedMethod=`Cash`,document.querySelectorAll(`.method-choice`).forEach(e=>{e.classList.toggle(`selected`,e.getAttribute(`data-method`)===`Cash`)}),this.updateMethodFields();let a=document.getElementById(`modalPayDate`);a&&(a.value=new Date().toISOString().split(`T`)[0]);let o=document.getElementById(`modalPayNotes`);o&&(o.value=``),n.classList.add(`open`)}updateModalReferenceDropdown(e=null){let t=document.getElementById(`modalPayRefSelect`),n=document.getElementById(`modalPayRefLabel`);if(t){if(this.modalType===`invoice`){n&&(n.textContent=`Select Customer Job / Invoice`);let r=`<option value="">-- Choose Job / Invoice --</option>`;this.orders.forEach(t=>{let n=Number(t.balanceAmount)||0;r+=`<option value="${t.id}" data-total="${t.totalAmount}" data-paid="${t.paidAmount}" data-balance="${n}" data-party="${t.customerName}" ${e===t.id?`selected`:``}>
          ${t.id} - ${t.customerName} (Bal: Rs. ${n.toLocaleString()})
        </option>`}),this.orderPayments.forEach(t=>{this.orders.some(e=>e.id===t.orderId)||(r+=`<option value="${t.orderId}" data-total="${t.totalBill}" data-paid="${t.amount}" data-balance="${t.balance}" data-party="${t.customerName}" ${e===t.orderId?`selected`:``}>
            ${t.orderId} - ${t.customerName} (Bal: Rs. ${(Number(t.balance)||0).toLocaleString()})
          </option>`)}),t.innerHTML=r}else{n&&(n.textContent=`Select Supplier GRN / Stock Acquisition`);let r=`<option value="">-- Choose GRN Stock Bill --</option>`;this.grnRecords.forEach(t=>{let n=this.grnPayments.find(e=>e.grnId===t.grn_id),i=t.net_total||t.sub_total||5e4,a=n?n.amount:0,o=n?n.balance:i;r+=`<option value="${t.grn_id}" data-total="${i}" data-paid="${a}" data-balance="${o}" data-party="${t.supplier_name}" ${e===t.grn_id?`selected`:``}>
          ${t.grn_number} - ${t.supplier_name} (Bal: Rs. ${o.toLocaleString()})
        </option>`}),this.grnPayments.forEach(t=>{this.grnRecords.some(e=>e.grn_id===t.grnId)||(r+=`<option value="${t.grnId}" data-total="${t.totalBill}" data-paid="${t.amount}" data-balance="${t.balance}" data-party="${t.supplierName}" ${e===t.grnId?`selected`:``}>
            ${t.grnNumber} - ${t.supplierName} (Bal: Rs. ${(Number(t.balance)||0).toLocaleString()})
          </option>`)}),t.innerHTML=r}this.onReferenceSelected()}}onReferenceSelected(){let e=document.getElementById(`modalPayRefSelect`),t=e?e.options[e.selectedIndex]:null,n=document.getElementById(`modalBalTotal`),r=document.getElementById(`modalBalPaid`),i=document.getElementById(`modalBalRemaining`),a=document.getElementById(`modalPayAmount`);if(t&&t.value){let e=Number(t.getAttribute(`data-total`))||0,o=Number(t.getAttribute(`data-paid`))||0,s=Number(t.getAttribute(`data-balance`))||0;n&&(n.textContent=`Rs. ${e.toLocaleString()}`),r&&(r.textContent=`Rs. ${o.toLocaleString()}`),i&&(i.textContent=`Rs. ${s.toLocaleString()}`),a&&(a.value=s>0?s:e)}else n&&(n.textContent=`Rs. 0`),r&&(r.textContent=`Rs. 0`),i&&(i.textContent=`Rs. 0`),a&&(a.value=``);this.onAmountChanged()}onAmountChanged(){let e=document.getElementById(`modalPayRefSelect`),t=e?e.options[e.selectedIndex]:null,n=document.getElementById(`modalPayAmount`),r=document.getElementById(`modalPayStageSelect`),i=Number(n?n.value:0)||0,a=t&&Number(t.getAttribute(`data-balance`))||0;r&&(r.value=i<=0?`Pending Payment`:i>=a?`Complete Payment`:`Advance Payment`)}updateMethodFields(){let e=document.getElementById(`modalMethodSpecificFields`);e&&(e.innerHTML=this.selectedMethod===`Card`?`
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Card Brand / Type</label>
            <select id="modalCardType" class="pay-select-field">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">American Express</option>
            </select>
          </div>
          <div class="pay-field">
            <label class="pay-label">Card Last 4 Digits</label>
            <input type="text" id="modalCardLast4" class="pay-input" placeholder="E.g. 4821" maxlength="4">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Auth / Approval Code</label>
          <input type="text" id="modalCardAuth" class="pay-input" placeholder="POS terminal approval code">
        </div>`:this.selectedMethod===`Check`?`
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cheque Number *</label>
            <input type="text" id="modalCheckNo" class="pay-input" placeholder="E.g. 882019" required>
          </div>
          <div class="pay-field">
            <label class="pay-label">Bank & Branch</label>
            <input type="text" id="modalCheckBank" class="pay-input" placeholder="Commercial Bank / HNB">
          </div>
        </div>
        <div class="pay-field" style="margin-top: 10px;">
          <label class="pay-label">Cheque Date</label>
          <input type="date" id="modalCheckDate" class="pay-input" value="${new Date().toISOString().split(`T`)[0]}">
        </div>`:this.selectedMethod===`Bank Transfer`?`
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Bank Name</label>
            <input type="text" id="modalTransferBank" class="pay-input" placeholder="BOC / Sampath / Commercial">
          </div>
          <div class="pay-field">
            <label class="pay-label">Transfer / Slip Reference *</label>
            <input type="text" id="modalTransferRef" class="pay-input" placeholder="Online transaction ref #">
          </div>
        </div>`:`
        <div class="pay-form-grid">
          <div class="pay-field">
            <label class="pay-label">Cash Tendered (Rs.)</label>
            <input type="number" id="modalCashTendered" class="pay-input" placeholder="Amount given by customer/petty cash">
          </div>
          <div class="pay-field">
            <label class="pay-label">Cash Receipt No</label>
            <input type="text" id="modalCashReceipt" class="pay-input" value="REC-${Math.floor(1e3+Math.random()*9e3)}">
          </div>
        </div>`)}savePayment(){let e=document.getElementById(`modalPayRefSelect`),t=e?e.options[e.selectedIndex]:null;if(!t||!t.value){alert(`Please select an Order/Invoice or GRN bill to record payment.`);return}let n=t.value,r=t.getAttribute(`data-party`)||`Party`,i=Number(t.getAttribute(`data-total`))||0,a=Number(t.getAttribute(`data-balance`))||0,o=document.getElementById(`modalPayAmount`),s=Number(o?o.value:0);if(isNaN(s)||s<0){alert(`Please enter a valid payment amount.`);return}let c=document.getElementById(`modalPayStageSelect`),l=c?c.value:`Complete Payment`,u=document.getElementById(`modalPayDate`),d=u?u.value:new Date().toISOString().split(`T`)[0],f=document.getElementById(`modalPayNotes`),p=f?f.value.trim():``,m=``;m=this.selectedMethod===`Card`?`CARD-${document.getElementById(`modalCardLast4`)?.value||`XXXX`}-${document.getElementById(`modalCardAuth`)?.value||`AUTH`}`:this.selectedMethod===`Check`?`CHQ-${document.getElementById(`modalCheckNo`)?.value||`CHQ`}-${document.getElementById(`modalCheckBank`)?.value||`BANK`}`:this.selectedMethod===`Bank Transfer`?`BANK-TXN-${document.getElementById(`modalTransferRef`)?.value||`TXN`}`:document.getElementById(`modalCashReceipt`)?.value||`CASH-${Math.floor(1e3+Math.random()*9e3)}`;let h=Math.max(0,a-s);if(this.modalType===`invoice`){let e=`PAY-INV-${Date.now().toString().slice(-6)}`,t={paymentId:e,orderId:n,invoiceNo:`INV-${n}`,customerName:r,date:d,totalBill:i,amount:s,balance:h,stage:l,method:this.selectedMethod,ref:m,note:p};this.orderPayments.unshift(t),this.saveOrderPayments();let a=this.orders.find(e=>e.id===n);a&&(a.paidAmount=(Number(a.paidAmount)||0)+s,a.balanceAmount=h,a.paymentStatus=h<=0?`Paid`:a.paidAmount>0?`Partially Paid`:`Unpaid`,localStorage.setItem(this.storageKeys.orders,JSON.stringify(this.orders))),this.closeModals(),this.render(),this.showToast(`Invoice Payment of Rs. ${s.toLocaleString()} recorded successfully!`),this.openReceiptModal(e,`invoice`)}else{let e=`PAY-GRN-${Date.now().toString().slice(-6)}`,t={paymentId:e,grnId:n,grnNumber:n,poNumber:`PO-`+n.replace(`GRN-`,``),supplierId:`SUP-001`,supplierName:r,stockCategory:`Stock Items Received`,date:d,totalBill:i,amount:s,balance:h,stage:l,method:this.selectedMethod,ref:m,note:p};this.grnPayments.unshift(t),this.saveGrnPayments(),this.closeModals(),this.render(),this.showToast(`GRN Supplier Payment of Rs. ${s.toLocaleString()} recorded successfully!`),this.openReceiptModal(e,`grn`)}}openReceiptModal(e,t=`invoice`){let n=document.getElementById(`printableReceiptModal`),r=document.getElementById(`receiptPrintContainer`);if(!n||!r)return;let i=null,a=t===`invoice`;i=a?this.orderPayments.find(t=>t.paymentId===e):this.grnPayments.find(t=>t.paymentId===e),i&&(r.innerHTML=`
      <div class="receipt-printable-card">
        <div class="receipt-header">
          <h4>SANJEEWA ADVERTISING</h4>
          <p>Digital Large Format Printing & Advertising Solutions</p>
          <p style="font-size: 10px; color: #64748b;">No. 128 Main Street, Colombo | Tel: 011 234 5678 | Email: billing@sanjeewa.lk</p>
          <div style="margin-top: 8px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: ${a?`#2563eb`:`#059669`};">
            ${a?`INVOICE PAYMENT RECEIPT (JOB SETTLEMENT)`:`GRN SUPPLIER PAYMENT VOUCHER (STOCK PURCHASE)`}
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div><strong>Voucher No:</strong> ${i.paymentId}</div>
          <div><strong>Date:</strong> ${i.date}</div>
          <div><strong>${a?`Customer Name:`:`Supplier Name:`}</strong> ${a?i.customerName:i.supplierName}</div>
          <div><strong>Reference:</strong> ${a?i.invoiceNo||i.orderId:i.grnNumber}</div>
          <div><strong>Payment Stage:</strong> <span style="font-weight: 700;">${i.stage}</span></div>
          <div><strong>Payment Method:</strong> <span style="font-weight: 700;">${i.method} (${i.ref||`Direct`})</span></div>
        </div>

        <div class="receipt-totals">
          <div class="receipt-row">
            <span>Total Bill Value:</span>
            <span>Rs. ${(Number(i.totalBill)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}</span>
          </div>
          <div class="receipt-row grand-total">
            <span>Amount Paid This Transaction:</span>
            <span style="color: #059669;">Rs. ${(Number(i.amount)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}</span>
          </div>
          <div class="receipt-row">
            <span>Remaining Balance Due:</span>
            <span style="color: ${(Number(i.balance)||0)>0?`#ef4444`:`#64748b`};">
              Rs. ${(Number(i.balance)||0).toLocaleString(`en-LK`,{minimumFractionDigits:2})}
            </span>
          </div>
        </div>

        ${i.note?`
        <div style="font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
          <strong>Narration:</strong> ${i.note}
        </div>`:``}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; text-align: center; font-size: 11px;">
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            Authorized Cashier / Officer
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 4px;">
            ${a?`Customer Signature`:`Supplier Acknowledgment`}
          </div>
        </div>
      </div>`,n.classList.add(`open`))}closeModals(){document.querySelectorAll(`.pay-modal-backdrop`).forEach(e=>e.classList.remove(`open`))}showToast(e){let t=document.createElement(`div`);t.className=`po-toast`,t.style.cssText=`
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: payToastIn 0.25s ease;
    `,t.innerHTML=`<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 16px;"></i> ${e}`,document.body.appendChild(t),setTimeout(()=>{t.style.opacity=`0`,t.style.transition=`opacity 0.3s ease`,setTimeout(()=>t.remove(),300)},3200)}};typeof window<`u`&&(window.PaymentsManager=e,document.addEventListener(`DOMContentLoaded`,()=>{window.paymentsManager=new e}));