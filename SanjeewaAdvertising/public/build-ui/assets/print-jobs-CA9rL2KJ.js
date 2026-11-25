import{t as e}from"./MobileNumberHelper-Cjypt2Ll.js";import{t}from"./ActionMenuHelper-CmW00VbZ.js";import{t as n}from"./ConfirmModalHelper-DtrZaNdB.js";import{t as r}from"./StatusHelper-BgrHG_5r.js";import{t as i}from"./LiveSyncManager-5XDpZg_L.js";var a=class{constructor(){this.csrfToken=document.querySelector(`meta[name="csrf-token"]`)?.getAttribute(`content`)||``}getHeaders(){return{"Content-Type":`application/json`,Accept:`application/json`,"X-CSRF-TOKEN":this.csrfToken,"X-Requested-With":`XMLHttpRequest`}}async fetchFloorData(e={}){let t=new URLSearchParams(e).toString(),n=`/print-jobs/floor-data${t?`?`+t:``}`,r=await fetch(n,{credentials:`same-origin`,headers:this.getHeaders()}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Failed to fetch production floor data.`);return i.data}async fetchJob(e){let t=`/print-jobs/${e}`,n=await fetch(t,{credentials:`same-origin`,headers:this.getHeaders()}),r=await n.json();if(!n.ok||!r.success)throw Error(r.message||`Failed to fetch print job details.`);return r.data}async updateStatus(e,t){let n=`/print-jobs/${e}/status`,r=await fetch(n,{method:`PATCH`,credentials:`same-origin`,headers:this.getHeaders(),body:JSON.stringify({print_job_statuses_id:t})}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Failed to update job status.`);return i.data}async fetchStatusHistory(e){let t=`/print-jobs/${e}/status-history`,n=await fetch(t,{credentials:`same-origin`,headers:this.getHeaders()}),r=await n.json();if(!n.ok||!r.success)throw Error(r.message||`Failed to load status history.`);return r.data}async assignStockItem(e,t,n){let r=`/print-jobs/${e}/stock-items`,i=await fetch(r,{method:`POST`,credentials:`same-origin`,headers:this.getHeaders(),body:JSON.stringify({stock_id:t,qty:n})}),a=await i.json();if(!i.ok||!a.success)throw Error(a.message||`Failed to assign stock item.`);return a.data}async syncStockItems(e,t){let n=`/print-jobs/${e}/stock-items`,r=await fetch(n,{method:`POST`,credentials:`same-origin`,headers:this.getHeaders(),body:JSON.stringify({stock_items:t})}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Failed to save materials.`);return i.data}async removeStockItem(e,t){let n=`/print-jobs/${e}/stock-items/${t}`,r=await fetch(n,{method:`DELETE`,credentials:`same-origin`,headers:this.getHeaders()}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Failed to remove stock item.`);return i.data}},o={prepress:{label:`Start Printing`,icon:`fa-print`},printing:{label:`Move to Finishing`,icon:`fa-scissors`},finishing:{label:`Mark Ready for Pickup`,icon:`fa-box-archive`},ready:{label:`Mark Completed`,icon:`fa-circle-check`},completed:{label:`Mark Delivered`,icon:`fa-truck-fast`}},s=class{static getStageThemeClass(e){switch(e){case`prepress`:return`card-purple`;case`printing`:return`card-blue`;case`finishing`:return`card-amber`;case`ready`:return`card-mint`;case`completed`:return`card-slate`;default:return`card-purple`}}static build(e,t){let n=this.getStageThemeClass(t||e.stage_key),r=t||e.stage_key,i=r===`printing`||parseInt(e.status_id,10)===4,a=(e.materials||[]).length||e.materials_count||0,s=``;return s=a>0?i?`
                    <div class="pj-card-materials has-material btn-action-allocate" data-job-id="${e.id}" style="cursor: pointer;" title="Allocated Materials (${a} items) - Click to view/add more">
                        <i class="fa-solid fa-boxes-stacked"></i>
                        <span class="pj-material-name">${this.escapeHtml(e.materials?.[0]?.name||`Material`)} ${a>1?`(+${a-1} more)`:``}</span>
                        <span style="margin-left: auto; font-size: 10px; background: rgba(2, 132, 199, 0.15); color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                            <i class="fa-solid fa-plus"></i> Add
                        </span>
                    </div>
                `:`
                    <div class="pj-card-materials has-material" title="Allocated Materials (${a} items)">
                        <i class="fa-solid fa-boxes-stacked"></i>
                        <span class="pj-material-name">${this.escapeHtml(e.materials?.[0]?.name||`Material`)} ${a>1?`(+${a-1} more)`:``}</span>
                        <span style="margin-left: auto; font-size: 10px; color: var(--text-muted); font-weight: 600;">
                            ${a} item${a>1?`s`:``}
                        </span>
                    </div>
                `:i?`
                <div class="pj-card-materials no-material btn-action-allocate" data-job-id="${e.id}" style="cursor: pointer; background: rgba(239, 68, 68, 0.08); border: 1px dashed #ef4444; color: #dc2626;" title="Click to select materials for this print">
                    <i class="fa-solid fa-boxes-stacked" style="color: #dc2626;"></i>
                    <span style="font-weight: 700;">+ Select Required Materials</span>
                </div>
            `:`
                <div class="pj-card-materials no-material" title="No materials allocated">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>No materials allocated</span>
                </div>
            `,`
            <div class="pj-job-card ${n}" data-job-id="${e.id}">
                <div class="pj-card-top-row">
                    <div class="pj-card-ids">
                        <span class="pj-card-job-num">${this.escapeHtml(e.job_number)}</span>
                        <span class="pj-card-order-num">${this.escapeHtml(e.order_number)}</span>
                    </div>
                    <span class="pj-stage-badge badge-${n}">
                        ${this.escapeHtml(e.status_name)}
                    </span>
                </div>

                <div class="pj-card-customer-block">
                    <div class="pj-card-cust-name">${this.escapeHtml(e.customer_name)}</div>
                    <div class="pj-card-cust-phone">
                        <i class="fa-solid fa-phone"></i> ${this.escapeHtml(e.customer_mobile)}
                    </div>
                </div>

                <div class="pj-card-tags-row">
                    <span class="pj-tag-spec">
                        <i class="fa-solid fa-print"></i> ${this.escapeHtml(e.print_type_name)}
                    </span>
                    <span class="pj-tag-qty">${e.qty} pcs</span>
                </div>

                ${s}

                <div class="pj-card-bottom-row">
                    <div class="pj-card-date-info">
                        <i class="fa-regular fa-calendar"></i> ${this.escapeHtml(e.date_formatted)}
                    </div>
                    <div class="pj-card-btn-group">
                        <button type="button" class="pj-btn-icon-sm btn-action-details" data-job-id="${e.id}" title="View Details & History">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        ${i?`
                            <button type="button" class="pj-btn-pill-allocate btn-action-allocate" data-job-id="${e.id}" title="Select / Add Materials" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 6px; background: rgba(2, 132, 199, 0.1); border: 1px solid rgba(2, 132, 199, 0.3); color: #0284c7; cursor: pointer;">
                                <i class="fa-solid fa-boxes-stacked"></i>
                                <span>${a>0?`${a} Mats`:`Materials`}</span>
                            </button>
                        `:``}
                    </div>
                </div>

                <div class="pj-card-advance-row">
                    ${(()=>{if(String(e.status_name||``).toLowerCase().trim()===`delivered`)return`<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${e.id}" disabled>
                                <i class="fa-solid fa-check-double"></i> <span>Delivered</span>
                            </button>`;if(r===`prepress`)return`<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${e.id}" title="Start Printing on Machine">
                                <i class="fa-solid fa-print"></i> <span>Start Printing</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>`;if(r===`printing`)return a===0?`<button type="button" class="pj-btn-advance-status btn-action-status btn-need-materials" data-job-id="${e.id}" title="Select materials before moving to Finishing">
                                    <i class="fa-solid fa-boxes-stacked"></i> <span>Select Materials to Finish</span> <i class="fa-solid fa-arrow-right"></i>
                                </button>`:`<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${e.id}" title="Move to Finishing & Eyelets">
                                    <i class="fa-solid fa-scissors"></i> <span>Move to Finishing</span> <i class="fa-solid fa-arrow-right"></i>
                                </button>`;let t=o[r]||{label:`Advance Production Status`,icon:`fa-forward-step`};return`<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${e.id}">
                            <i class="fa-solid ${t.icon}"></i> <span>${t.label}</span> <i class="fa-solid fa-arrow-right"></i>
                        </button>`})()}
                </div>
            </div>
        `}static escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},c=class{static buildRow(e){let t=e.materials_count>0?e.materials.map(e=>`
                <span class="pj-spec-tag" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                    <i class="fa-solid fa-box"></i> ${this.escapeHtml(e.name)} (${e.qty})
                </span>
            `).join(` `):`<span style="color: #94a3b8; font-size: 11px;">Not allocated</span>`,n=e.payment_status===`Paid`?`paid`:e.payment_status===`Partially Paid`?`partially-paid`:`unpaid`,i=String(e.status_name||``).toLowerCase().trim(),a=i===`approved`,o=i===`cancelled`||i===`rejected`,s=r.getStatusRowClass(e.status_name);return`
            <tr data-job-id="${e.id}"${s?` class="${s}"`:``}>
                <td>
                    <div style="font-weight: 700; font-family: monospace; color: var(--text, #0f172a);">${this.escapeHtml(e.job_number)}</div>
                    <div style="font-size: 11px; color: var(--text-muted, #64748b);">${this.escapeHtml(e.order_number)}</div>
                    ${e.date_formatted?`<div style="font-size: 10.5px; color: var(--text-muted, #94a3b8); margin-top: 2px;"><i class="fa-regular fa-clock" style="margin-right: 3px;"></i>${this.escapeHtml(e.date_formatted)}${e.time_formatted&&e.time_formatted!==`—`?` • ${this.escapeHtml(e.time_formatted)}`:``}</div>`:``}
                </td>
                <td>
                    <div style="font-weight: 600;">${this.escapeHtml(e.customer_name)}</div>
                    <div style="font-size: 11px; color: var(--text-muted, #64748b);"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(e.customer_mobile)}</div>
                </td>
                <td>
                    <span class="pj-spec-tag"><i class="fa-solid fa-print"></i> ${this.escapeHtml(e.print_type_name)}</span>
                </td>
                <td>
                    <span class="pj-qty-tag">${e.qty} pcs</span>
                </td>
                <td>
                    ${t}
                </td>
                <td>
                    <span class="pj-badge ${e.badge_class}">
                        ${this.escapeHtml(e.status_name)}
                    </span>
                </td>
                <td>
                    <div style="font-weight: 600; font-size: 12.5px;">Rs. ${Number(e.total_amount).toLocaleString(`en-US`,{minimumFractionDigits:2})}</div>
                    <span class="pj-pay-badge ${n}">${this.escapeHtml(e.payment_status)}</span>
                </td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; align-items: center; gap: 5px;">
                        <button type="button" class="pj-btn-icon-sm btn-action-approve" data-job-id="${e.id}" title="Approve Order" ${a||o?`disabled`:``}>
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-cancel" data-job-id="${e.id}" title="Cancel Order" ${o?`disabled`:``}>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <div class="row-action-menu-wrap">
                            <button type="button" class="pj-btn-icon-sm btn-action-more" title="More Actions">
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <div class="row-action-dropdown" style="display: none;">
                                <button type="button" class="row-action-item btn-action-details" data-job-id="${e.id}">
                                    <i class="fa-solid fa-eye"></i><span>Details &amp; Timeline</span>
                                </button>
                                ${e.stage_key===`printing`||parseInt(e.status_id,10)===4?`
                                    <button type="button" class="row-action-item btn-action-allocate" data-job-id="${e.id}">
                                        <i class="fa-solid fa-boxes-stacked"></i><span>Allocate Stock</span>
                                    </button>
                                `:``}
                                <button type="button" class="row-action-item btn-action-status" data-job-id="${e.id}">
                                    <i class="fa-solid fa-arrow-right"></i><span>Update Status</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `}static buildEmpty(e=8){return`
            <tr>
                <td colspan="${e}" style="text-align: center; padding: 48px 16px; color: #8c8c8c;">
                    <i class="fa-solid fa-folder-open" style="font-size: 28px; margin-bottom: 10px; display: block; color: #cbd5e1;"></i>
                    <div style="font-size: 13px; font-weight: 500;">No print jobs found</div>
                    <div style="font-size: 11.5px; color: #94a3b8; margin-top: 4px;">Try adjusting your search or category filter.</div>
                </td>
            </tr>
        `}static escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},l=class{constructor(e={}){this.onViewDetails=e.onViewDetails||(()=>{}),this.onChangeStatus=e.onChangeStatus||(()=>{}),this.onAllocateStock=e.onAllocateStock||(()=>{}),this.currentStage=`prepress`,this.stages=[`prepress`,`printing`,`finishing`,`ready`,`completed`],this.initTabs()}initTabs(){let e=document.getElementById(`pjStageTabs`);e&&e.querySelectorAll(`.pj-stage-tab`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-stage`);t&&this.switchTab(t)}})}switchTab(e){this.stages.includes(e)&&(this.currentStage=e,document.querySelectorAll(`#pjStageTabs .pj-stage-tab`).forEach(t=>{t.getAttribute(`data-stage`)===e?t.classList.add(`active`):t.classList.remove(`active`)}),document.querySelectorAll(`.pj-tab-pane`).forEach(t=>{t.id===`tabPane-${e}`?(t.classList.add(`active`),t.style.display=`grid`):(t.classList.remove(`active`),t.style.display=`none`)}))}render(e={}){this.stages.forEach(t=>{let n=document.getElementById(`tabCards-${t}`),r=document.getElementById(`tabBadge-${t}`),i=e[t]||[];r&&(r.textContent=i.length),n&&(n.innerHTML=i.length===0?`
                    <div class="pj-tab-empty">
                        <i class="fa-solid fa-inbox"></i>
                        <div class="pj-empty-title">No jobs in this stage</div>
                        <div class="pj-empty-sub">Jobs assigned to this production stage will appear here.</div>
                    </div>
                `:i.map(e=>s.build(e,t)).join(``))}),this.attachCardEvents()}attachCardEvents(){document.querySelectorAll(`.pj-job-card .btn-action-details`).forEach(e=>{e.onclick=t=>{t.stopPropagation();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onViewDetails(n)}}),document.querySelectorAll(`.pj-job-card .btn-action-status`).forEach(e=>{e.onclick=t=>{t.stopPropagation();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onChangeStatus(n)}}),document.querySelectorAll(`.pj-job-card .btn-action-allocate`).forEach(e=>{e.onclick=t=>{t.stopPropagation();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onAllocateStock(n)}})}},u=class{constructor(e={}){this.onViewDetails=e.onViewDetails||(()=>{}),this.onChangeStatus=e.onChangeStatus||(()=>{}),this.onAllocateStock=e.onAllocateStock||(()=>{}),this.onApproveJob=e.onApproveJob||(()=>{}),this.onCancelJob=e.onCancelJob||(()=>{}),this.tableBody=document.getElementById(`pjTableBody`),this.paginationInfo=document.getElementById(`pjPaginationInfo`),this.btnPrev=document.getElementById(`pjBtnPrevPage`),this.btnNext=document.getElementById(`pjBtnNextPage`),this.jobs=[],this.currentPage=1,this.perPage=10,this.btnPrev&&(this.btnPrev.onclick=()=>this.goToPage(this.currentPage-1)),this.btnNext&&(this.btnNext.onclick=()=>this.goToPage(this.currentPage+1))}setData(e=[]){this.jobs=e,this.currentPage=1,this.render()}goToPage(e){let t=Math.ceil(this.jobs.length/this.perPage)||1;e<1||e>t||(this.currentPage=e,this.render())}render(){if(!this.tableBody)return;if(this.jobs.length===0){this.tableBody.innerHTML=c.buildEmpty(8),this.paginationInfo&&(this.paginationInfo.textContent=`Showing 0 of 0 jobs`),this.btnPrev&&(this.btnPrev.disabled=!0),this.btnNext&&(this.btnNext.disabled=!0);return}let e=Math.ceil(this.jobs.length/this.perPage)||1,t=(this.currentPage-1)*this.perPage,n=this.jobs.slice(t,t+this.perPage);this.tableBody.innerHTML=n.map(e=>c.buildRow(e)).join(``);let r=Math.min(t+this.perPage,this.jobs.length);this.paginationInfo&&(this.paginationInfo.textContent=`Showing ${t+1} to ${r} of ${this.jobs.length} jobs (Page ${this.currentPage} of ${e})`),this.btnPrev&&(this.btnPrev.disabled=this.currentPage<=1),this.btnNext&&(this.btnNext.disabled=this.currentPage>=e),this.attachRowEvents()}attachRowEvents(){this.tableBody&&(this.tableBody.querySelectorAll(`.btn-action-more`).forEach(e=>{e.onclick=n=>{n.stopPropagation(),t.toggleRowActionMenu(e)}}),this.tableBody.querySelectorAll(`.btn-action-details`).forEach(e=>{e.onclick=()=>{t.closeAllActionMenus();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onViewDetails(n)}}),this.tableBody.querySelectorAll(`.btn-action-status`).forEach(e=>{e.onclick=()=>{t.closeAllActionMenus();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onChangeStatus(n)}}),this.tableBody.querySelectorAll(`.btn-action-allocate`).forEach(e=>{e.onclick=()=>{t.closeAllActionMenus();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onAllocateStock(n)}}),this.tableBody.querySelectorAll(`.btn-action-approve`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-job-id`),10);this.onApproveJob(t)}}),this.tableBody.querySelectorAll(`.btn-action-cancel`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-job-id`),10);this.onCancelJob(t)}}))}},d=class{constructor(e){this.dataLoader=e,this.modal=document.getElementById(`modalJobDetails`)}async open(e){if(!this.modal||!e)return;document.getElementById(`detailsJobCode`).textContent=`${e.job_number} (${e.order_number})`,document.getElementById(`detailsCustomerName`).textContent=e.customer_name,document.getElementById(`detailsCustomerContact`).textContent=`${e.customer_mobile||`—`} ${e.customer_email?`• ${e.customer_email}`:``}`,document.getElementById(`detailsPrintType`).textContent=e.print_type_name,document.getElementById(`detailsQuantity`).textContent=`${e.qty} units`,document.getElementById(`detailsDate`).textContent=e.date_formatted,document.getElementById(`detailsOperator`).textContent=e.operator_name,document.getElementById(`detailsTotalAmount`).textContent=`Rs. ${Number(e.total_amount).toLocaleString(`en-US`,{minimumFractionDigits:2})}`,document.getElementById(`detailsPaidAmount`).textContent=`Rs. ${Number(e.paid_amount).toLocaleString(`en-US`,{minimumFractionDigits:2})}`,document.getElementById(`detailsBalanceAmount`).textContent=`Rs. ${Number(e.balance_amount).toLocaleString(`en-US`,{minimumFractionDigits:2})}`;let t=document.getElementById(`detailsPaymentBadge`);t&&(t.textContent=e.payment_status,t.className=`pj-pay-badge ${e.payment_status===`Paid`?`paid`:e.payment_status===`Partially Paid`?`partially-paid`:`unpaid`}`);let n=document.getElementById(`detailsMaterialsList`);if(n){let t=Array.isArray(e.materials)?e.materials:[];if(t.length===0&&this.dataLoader&&typeof this.dataLoader.fetchJob==`function`)try{let n=await this.dataLoader.fetchJob(e.id);n&&(Array.isArray(n.materials)&&n.materials.length>0?t=n.materials:Array.isArray(n.stock_items)&&n.stock_items.length>0&&(t=n.stock_items.map(e=>({stock_id:e.stock_id,name:e.name||e.item_name||`Stock #${e.stock_id}`,brand:e.brand||``,qty:e.qty||1}))),e.materials=t,e.materials_count=t.length)}catch(e){console.warn(`Could not fetch fresh materials for job details:`,e)}n.innerHTML=t&&t.length>0?`
                    <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; margin-bottom: 6px; font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                        <span><i class="fa-solid fa-boxes-stacked" style="color: #0284c7; margin-right: 5px;"></i> Materials allocated for printing</span>
                        <strong style="color: var(--text);">${t.length} item${t.length>1?`s`:``}</strong>
                    </div>
                    <table class="pj-assigned-table">
                        <thead>
                            <tr>
                                <th style="width: 30px;">#</th>
                                <th>Material / Stock Item</th>
                                <th>Brand</th>
                                <th style="text-align: right; width: 110px;">Assigned Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${t.map((e,t)=>`
                                <tr>
                                    <td style="color: var(--text-muted); font-size: 11px;">${t+1}</td>
                                    <td>
                                        <strong style="color: var(--text);">
                                            <i class="fa-solid fa-box" style="color: #0284c7; margin-right: 4px; font-size: 11px;"></i>
                                            ${this.escapeHtml(e.name||e.item_name||`Material`)}
                                        </strong>
                                    </td>
                                    <td>
                                        <span style="background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; font-size: 11px; color: var(--text);">
                                            ${this.escapeHtml(e.brand||`Generic`)}
                                        </span>
                                    </td>
                                    <td style="text-align: right; font-weight: 700; font-family: monospace; color: #0284c7;">
                                        ${e.qty}
                                    </td>
                                </tr>
                            `).join(``)}
                        </tbody>
                    </table>
                `:`<div style="font-size: 12px; color: #94a3b8; font-style: italic; padding: 8px 0;"><i class="fa-solid fa-circle-exclamation" style="margin-right: 4px;"></i> No stock materials currently linked to this job.</div>`}let r=document.getElementById(`detailsTimelineContainer`);if(this.modal.classList.add(`active`),r){r.innerHTML=`<div style="font-size: 12px; color: #8c8c8c;"><i class="fa-solid fa-spinner fa-spin"></i> Loading status history...</div>`;try{let t=await this.dataLoader.fetchStatusHistory(e.id);r.innerHTML=t&&t.length>0?`
                        <div class="pj-timeline">
                            ${t.map(e=>{let t=e.status?.print_job_states||`Status Update`,n=e.update_at?new Date(e.update_at).toLocaleString():`—`;return`
                                    <div class="pj-timeline-item">
                                        <div class="pj-timeline-dot"></div>
                                        <div class="pj-timeline-status">${this.escapeHtml(t)}</div>
                                        <div class="pj-timeline-date"><i class="fa-regular fa-clock"></i> ${this.escapeHtml(n)}</div>
                                    </div>
                                `}).join(``)}
                        </div>
                    `:`
                        <div class="pj-timeline">
                            <div class="pj-timeline-item">
                                <div class="pj-timeline-dot"></div>
                                <div class="pj-timeline-status">${this.escapeHtml(e.status_name)}</div>
                                <div class="pj-timeline-date">${this.escapeHtml(e.date_formatted)}</div>
                            </div>
                        </div>
                    `}catch{r.innerHTML=`<div style="font-size: 12px; color: #cf1322;">Failed to load timeline. Current status: ${this.escapeHtml(e.status_name)}</div>`}}}close(){this.modal&&this.modal.classList.remove(`active`)}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},f=class{constructor(e,t={}){this.dataLoader=e,this.onJobUpdated=t.onJobUpdated||(()=>{}),this.onNeedMaterials=t.onNeedMaterials||null,this.showToast=t.showToast||((e,t)=>alert(e)),this.modal=document.getElementById(`modalChangeStatus`),this.currentJob=null,this.statuses=[],this.initEvents()}initEvents(){let e=document.getElementById(`btnSubmitStatusChange`);e&&(e.onclick=()=>this.submit())}setStatuses(e=[]){this.statuses=e;let t=document.getElementById(`selectNewStatus`);t&&(t.innerHTML=`<option value="">-- Choose New Status --</option>`+e.map(e=>`<option value="${e.id}">${this.escapeHtml(e.name)}</option>`).join(``))}open(e){if(this.currentJob=e,!this.modal||!e)return;let t=document.getElementById(`statusJobHeader`);t&&(t.textContent=`${e.job_number} • ${e.customer_name}`);let n=document.getElementById(`statusCurrentBadge`);n&&(n.textContent=e.status_name,n.className=`pj-badge ${e.badge_class}`);let r=document.getElementById(`selectNewStatus`);r&&(r.value=``),this.modal.classList.add(`active`)}close(){this.modal&&this.modal.classList.remove(`active`),this.currentJob=null}async submit(){if(!this.currentJob)return;let e=document.getElementById(`selectNewStatus`),t=parseInt(e.value,10);if(!t){this.showToast(`Please select a new production stage.`,`warning`);return}let n=t===5||this.statuses.find(e=>e.id===t)?.name?.toLowerCase()===`finishing`,r=(this.currentJob.materials||[]).length>0;if(n&&!r){this.showToast(`Please allocate materials used during printing before moving to Finishing.`,`warning`);let e=this.currentJob;this.close(),typeof this.onNeedMaterials==`function`&&this.onNeedMaterials(e);return}let i=document.getElementById(`btnSubmitStatusChange`),a=i.innerHTML;i.disabled=!0,i.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Updating...`;try{await this.dataLoader.updateStatus(this.currentJob.id,t),this.showToast(`Job ${this.currentJob.job_number} status updated successfully!`,`success`),this.close(),this.onJobUpdated()}catch(e){this.showToast(e.message||`Failed to update status.`,`error`)}finally{i.disabled=!1,i.innerHTML=a}}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},p=class{constructor(e,t={}){this.dataLoader=e,this.onJobUpdated=t.onJobUpdated||(()=>{}),this.onStartPrintingSuccess=t.onStartPrintingSuccess||null,this.showToast=t.showToast||((e,t)=>alert(e)),this.modal=document.getElementById(`modalAllocateMaterial`),this.currentJob=null,this.cart=[],this.isCartDirty=!1,this.isSavingCart=!1,this.availableStocks=[],this.categories=[],this.subcategories=[],this.statuses=[],this.forStartPrinting=!1,this.selectedCategoryId=``,this.selectedSubcategoryId=``,this.searchQuery=``,this.initEvents()}initEvents(){let e=document.getElementById(`btnSubmitAssignMaterial`);e&&(e.onclick=()=>this.addToCart());let t=document.getElementById(`btnSelectorQtyMinus`),n=document.getElementById(`btnSelectorQtyPlus`),r=document.getElementById(`inputMaterialQty`);t&&r&&(t.onclick=()=>{let e=parseInt(r.value,10)||1;r.value=String(Math.max(1,e-1))}),n&&r&&(n.onclick=()=>{let e=parseInt(r.value,10)||1,t=parseInt(r.max,10)||999999;r.value=String(Math.min(t,e+1))});let i=document.getElementById(`btnClearMaterialCart`);i&&(i.onclick=()=>this.clearCart());let a=document.getElementById(`btnSaveMaterialCart`);a&&(a.onclick=()=>this.saveCart({closeOnSuccess:!0}));let o=document.getElementById(`btnModalStartPrinting`);o&&(o.onclick=()=>this.submitStartPrinting());let s=document.getElementById(`selectMaterialCategory`);s&&(s.onchange=()=>{this.selectedCategoryId=s.value?String(s.value):``,this.selectedSubcategoryId=``,this.updateSubcategoryDropdown(),this.filterAndRenderStockOptions()});let c=document.getElementById(`selectMaterialSubcategory`);c&&(c.onchange=()=>{if(this.selectedSubcategoryId=c.value?String(c.value):``,this.selectedSubcategoryId&&!this.selectedCategoryId){let e=this.subcategories.find(e=>String(e.id)===this.selectedSubcategoryId);e&&e.category_id&&(this.selectedCategoryId=String(e.category_id),s&&(s.value=this.selectedCategoryId))}this.filterAndRenderStockOptions()});let l=document.getElementById(`inputMaterialFilter`);l&&(l.oninput=()=>{this.searchQuery=l.value.trim().toLowerCase(),this.filterAndRenderStockOptions()});let u=document.getElementById(`selectAllocateStock`);u&&(u.onchange=()=>this.updateStockPreview())}setReferenceData(e=[],t=[],n=[]){if(this.availableStocks=e||[],this.categories=t||[],this.subcategories=n||[],this.categories.length===0&&this.availableStocks.length>0){let e=new Map;this.availableStocks.forEach(t=>{t.category_id&&t.category&&e.set(String(t.category_id),{id:t.category_id,name:t.category})}),this.categories=Array.from(e.values())}if(this.subcategories.length===0&&this.availableStocks.length>0){let e=new Map;this.availableStocks.forEach(t=>{t.subcategory_id&&t.subcategory&&e.set(String(t.subcategory_id),{id:t.subcategory_id,category_id:t.category_id,name:t.subcategory})}),this.subcategories=Array.from(e.values())}this.modal&&this.modal.classList.contains(`active`)||(this.populateCategoryDropdown(),this.updateSubcategoryDropdown(),this.filterAndRenderStockOptions())}setAvailableStocks(e=[]){this.availableStocks=e||[],this.modal&&this.modal.classList.contains(`active`)||this.filterAndRenderStockOptions()}populateCategoryDropdown(){let e=document.getElementById(`selectMaterialCategory`);if(!e)return;let t=this.selectedCategoryId;e.innerHTML=`<option value="">-- All Categories --</option>`+this.categories.map(e=>`
                <option value="${e.id}" ${String(e.id)===String(t)?`selected`:``}>
                    ${this.escapeHtml(e.name)}
                </option>
            `).join(``)}updateSubcategoryDropdown(){let e=document.getElementById(`selectMaterialSubcategory`);if(!e)return;let t=this.subcategories||[];this.selectedCategoryId&&(t=t.filter(e=>String(e.category_id)===this.selectedCategoryId)),e.innerHTML=`<option value="">-- All Subcategories --</option>`+t.map(e=>`
                <option value="${e.id}" data-category-id="${e.category_id||``}" ${String(e.id)===String(this.selectedSubcategoryId)?`selected`:``}>
                    ${this.escapeHtml(e.name)}
                </option>
            `).join(``),e.value=this.selectedSubcategoryId||``}filterAndRenderStockOptions(){let e=document.getElementById(`selectAllocateStock`);if(!e)return;let t=this.availableStocks||[];this.selectedCategoryId&&(t=t.filter(e=>{if(e.category_id)return String(e.category_id)===this.selectedCategoryId;let t=this.categories.find(e=>String(e.id)===this.selectedCategoryId);return t&&String(e.category||``).toLowerCase()===String(t.name||``).toLowerCase()})),this.selectedSubcategoryId&&(t=t.filter(e=>{if(e.subcategory_id)return String(e.subcategory_id)===this.selectedSubcategoryId;let t=this.subcategories.find(e=>String(e.id)===this.selectedSubcategoryId);return t&&String(e.subcategory||``).toLowerCase()===String(t.name||``).toLowerCase()})),this.searchQuery&&(t=t.filter(e=>`${e.name||``} ${e.code||``} ${e.brand||``} ${e.category||``} ${e.subcategory||``}`.toLowerCase().includes(this.searchQuery))),e.innerHTML=`<option value="">-- Choose Stock Item --</option>`+t.map(e=>{let t=e.code?`[${this.escapeHtml(e.code)}] `:``,n=e.brand?` (${this.escapeHtml(e.brand)})`:``,r=e.category?` • ${this.escapeHtml(e.category)}`:``,i=this.cart.find(t=>Number(t.stock_id)===Number(e.id)),a=i?` [Selected: ${i.qty}]`:``;return`
                    <option value="${e.id}" data-code="${this.escapeHtml(e.code||``)}" data-brand="${this.escapeHtml(e.brand||``)}" data-category="${this.escapeHtml(e.category||``)}" data-subcategory="${this.escapeHtml(e.subcategory||``)}" data-qty="${e.qty}">
                        ${t}${this.escapeHtml(e.name)}${n}${r} — Avail: ${e.qty}${a}
                    </option>
                `}).join(``),this.updateStockPreview()}updateStockPreview(){let e=document.getElementById(`selectAllocateStock`),t=document.getElementById(`allocStockItemPreview`),n=document.getElementById(`inputMaterialQty`);if(!e||!t)return;let r=e.selectedOptions?e.selectedOptions[0]:null;if(!r||!r.value){t.style.display=`none`;return}let i=parseInt(r.value,10),a=this.availableStocks.find(e=>Number(e.id)===i),o=this.cart.find(e=>Number(e.stock_id)===i),s=document.getElementById(`previewStockCode`),c=document.getElementById(`previewStockBrand`),l=document.getElementById(`previewStockCategory`),u=document.getElementById(`previewStockQty`),d=document.getElementById(`previewInCartBadge`);s&&(s.textContent=a?.code||r.getAttribute(`data-code`)||`—`),c&&(c.textContent=a?.brand||r.getAttribute(`data-brand`)||`Generic`);let f=a?.category||r.getAttribute(`data-category`)||``,p=a?.subcategory||r.getAttribute(`data-subcategory`)||``;l&&(l.textContent=[f,p].filter(Boolean).join(` / `)||`General`);let m=a?a.qty:parseInt(r.getAttribute(`data-qty`),10)||0;u&&(u.textContent=`${m} in stock`),d&&(o?(d.textContent=`Already Selected: ${o.qty}`,d.style.display=`inline-block`):d.style.display=`none`),n&&m>0&&(n.max=m),t.style.display=`block`}setStatuses(e=[]){this.statuses=e||[]}open(e,t={}){if(this.currentJob=e,!this.modal||!e)return;let n=Array.isArray(e.materials)?e.materials:[];this.cart=n.map(e=>{let t=Number(e.stock_id||e.id),n=this.availableStocks.find(e=>Number(e.id)===t);return{stock_id:t,name:e.name||e.item_name||n?.name||`Stock #${t}`,code:e.code||n?.code||``,brand:e.brand||n?.brand||`Generic`,category:e.category||n?.category||``,subcategory:e.subcategory||n?.subcategory||``,avail_qty:n?Number(n.qty):9999,qty:Math.max(1,parseInt(e.qty,10)||1)}}),this.isCartDirty=!1,this.forStartPrinting=!!t.forStartPrinting;let r=document.getElementById(`allocJobHeader`);r&&(r.innerHTML=`
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <strong style="color: var(--text); font-size: 14px;">${this.escapeHtml(e.job_number)}</strong>
                        <span style="color: var(--text-muted); font-size: 12px; margin-left: 6px;">(${this.escapeHtml(e.order_number)})</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted);">
                        <span>${this.escapeHtml(e.customer_name)}</span> • <strong>${this.escapeHtml(e.print_type_name)}</strong> (${e.qty} units)
                    </div>
                </div>
            `);let i=document.getElementById(`modalAllocTitle`),a=document.getElementById(`allocNoticeBanner`),o=document.getElementById(`btnModalStartPrinting`),s=document.getElementById(`btnSaveMaterialCart`);this.forStartPrinting?(i&&(i.innerHTML=`<i class="fa-solid fa-print" style="color: #0284c7;"></i> Select Materials & Start Printing`),a&&(a.style.display=`block`),o&&(o.style.display=`inline-flex`),s&&(s.style.display=`none`)):(i&&(i.innerHTML=`<i class="fa-solid fa-boxes-stacked" style="color: #0284c7;"></i> Select Printing Materials`),a&&(a.style.display=`none`),o&&(o.style.display=`none`),s&&(s.style.display=`inline-flex`)),this.selectedCategoryId=``,this.selectedSubcategoryId=``,this.searchQuery=``;let c=document.getElementById(`selectMaterialCategory`);c&&(c.value=``);let l=document.getElementById(`selectMaterialSubcategory`);l&&(l.value=``);let u=document.getElementById(`inputMaterialFilter`);u&&(u.value=``);let d=document.getElementById(`inputMaterialQty`);d&&(d.value=`1`),this.populateCategoryDropdown(),this.updateSubcategoryDropdown(),this.filterAndRenderStockOptions(),this.renderCart(),this.modal.classList.add(`active`)}close(){this.modal&&this.modal.classList.remove(`active`),this.currentJob=null,this.cart=[],this.isCartDirty=!1,this.forStartPrinting=!1}addToCart(){if(!this.currentJob)return;let e=document.getElementById(`selectAllocateStock`),t=document.getElementById(`inputMaterialQty`);if(!e||!t)return;let n=parseInt(e.value,10),r=parseInt(t.value,10);if(!n){this.showToast(`Please select a material / stock item to add.`,`warning`);return}if(!r||r<=0){this.showToast(`Please enter a valid quantity of at least 1.`,`warning`);return}let i=this.availableStocks.find(e=>Number(e.id)===n),a=i?Number(i.qty):9999,o=this.cart.find(e=>Number(e.stock_id)===n);if(o){let e=o.qty+r;a>0&&e>a?(o.qty=a,this.showToast(`Adjusted "${o.name}" to maximum available warehouse stock (${a}).`,`warning`)):(o.qty=e,this.showToast(`Updated "${o.name}" quantity (Total: ${o.qty}).`,`info`))}else{let e=a>0?Math.min(r,a):r,t=i?i.name:`Stock #${n}`;this.cart.push({stock_id:n,name:t,code:i?.code||``,brand:i?.brand||`Generic`,category:i?.category||``,subcategory:i?.subcategory||``,avail_qty:a,qty:e}),this.showToast(`Added "${t}" (Qty: ${e}) to selected materials!`,`success`)}this.isCartDirty=!0,e.value=``,t.value=`1`,this.filterAndRenderStockOptions(),this.renderCart()}updateCartItemQty(e,t){let n=this.cart.find(t=>Number(t.stock_id)===Number(e));if(!n)return;let r=parseInt(t,10);(isNaN(r)||r<1)&&(r=1),n.avail_qty>0&&r>n.avail_qty&&(r=n.avail_qty,this.showToast(`Maximum available warehouse stock for "${n.name}" is ${n.avail_qty}.`,`warning`)),n.qty!==r&&(n.qty=r,this.isCartDirty=!0,this.renderCart(),this.filterAndRenderStockOptions())}removeFromCart(e){let t=this.cart.findIndex(t=>Number(t.stock_id)===Number(e));if(t===-1)return;let n=this.cart[t];this.cart.splice(t,1),this.isCartDirty=!0,this.showToast(`Removed "${n.name}" from list.`,`info`),this.renderCart(),this.filterAndRenderStockOptions()}clearCart(){this.cart.length!==0&&(this.cart=[],this.isCartDirty=!0,this.showToast(`Cleared all selected materials.`,`info`),this.renderCart(),this.filterAndRenderStockOptions())}updateFooterActionButtons(){let e=this.cart.length,t=this.cart.reduce((e,t)=>e+(Number(t.qty)||0),0),n=document.getElementById(`allocHeaderCartCount`);n&&(n.textContent=`${e} (${t})`);let r=document.getElementById(`btnClearMaterialCart`);r&&(r.style.display=e>0?`inline-flex`:`none`);let i=document.getElementById(`allocCartSummaryBar`),a=document.getElementById(`cartSummaryItemCount`),o=document.getElementById(`cartSummaryTotalQty`),s=document.getElementById(`cartUnsavedIndicator`);i&&(i.style.display=e>0||this.isCartDirty?`flex`:`none`),a&&(a.textContent=String(e)),o&&(o.textContent=String(t)),s&&(s.style.display=this.isCartDirty?`block`:`none`);let c=document.getElementById(`btnSaveMaterialCart`);c&&!this.forStartPrinting&&(c.innerHTML=`<i class="fa-solid fa-check-double"></i> <span>Confirm & Save Materials (${e})</span>`);let l=document.getElementById(`btnModalStartPrinting`);l&&this.forStartPrinting&&(e===0?(l.disabled=!0,l.style.opacity=`0.45`,l.style.cursor=`not-allowed`,l.innerHTML=`<i class="fa-solid fa-print"></i> <span>Select Materials First</span>`):(l.disabled=!1,l.style.opacity=`1`,l.style.cursor=`pointer`,l.innerHTML=`<i class="fa-solid fa-print"></i> <span>Save & Start Printing (${e} Material${e>1?`s`:``})</span> <i class="fa-solid fa-arrow-right"></i>`))}renderCart(){let e=document.getElementById(`allocatedMaterialsList`),t=document.getElementById(`allocCountBadge`);if(!e||!this.currentJob)return;this.updateFooterActionButtons();let n=this.cart.reduce((e,t)=>e+(Number(t.qty)||0),0);t&&(t.textContent=`${this.cart.length} material${this.cart.length===1?``:`s`} (${n} units)`,t.style.color=this.cart.length>0?`#0284c7`:`var(--text-muted)`),this.cart.length===0?e.innerHTML=`
                <div style="font-size: 12.5px; color: var(--text-muted); background: var(--surface-2); border: 1px dashed var(--border); padding: 22px 16px; text-align: center; border-radius: 8px;">
                    <i class="fa-solid fa-boxes-stacked" style="font-size: 24px; color: #0284c7; opacity: 0.45; margin-bottom: 8px; display: block;"></i>
                    No materials selected yet. Choose a material above and click <strong>"Add Material"</strong>.
                </div>
            `:(e.innerHTML=`
            <table class="pj-assigned-table">
                <thead>
                    <tr>
                        <th style="width: 36px; text-align: center;">#</th>
                        <th>Material Item</th>
                        <th>Brand & Stock</th>
                        <th style="text-align: center; width: 155px;">Required Qty</th>
                        <th style="text-align: right; width: 65px;">Remove</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.cart.map((e,t)=>{let n=e.code?`<span style="font-family: monospace; font-size: 11px; color: #0284c7; background: rgba(2, 132, 199, 0.1); padding: 1px 6px; border-radius: 4px; margin-left: 6px;">${this.escapeHtml(e.code)}</span>`:``,r=[e.category,e.subcategory].filter(Boolean).join(` / `);return`
                            <tr data-cart-stock-id="${e.stock_id}">
                                <td style="color: var(--text-muted); font-size: 11.5px; font-weight: 600; text-align: center;">${t+1}</td>
                                <td>
                                    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                                        <strong style="color: var(--text); font-size: 13px;">
                                            <i class="fa-solid fa-box" style="color: #0284c7; margin-right: 5px; font-size: 11.5px;"></i>
                                            ${this.escapeHtml(e.name)}
                                        </strong>
                                        ${n}
                                    </div>
                                    ${r?`<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(r)}</div>`:``}
                                </td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                        <span style="background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; font-size: 11px; color: var(--text); font-weight: 600;">
                                            ${this.escapeHtml(e.brand||`Generic`)}
                                        </span>
                                        ${e.avail_qty&&e.avail_qty<9999?`<span style="font-size: 11px; color: #16a34a; font-weight: 600;">Avail: ${e.avail_qty}</span>`:``}
                                    </div>
                                </td>
                                <td style="text-align: center;">
                                    <div style="display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); overflow: hidden; height: 30px;">
                                        <button type="button"
                                                class="btn-cart-qty-minus"
                                                data-stock-id="${e.stock_id}"
                                                title="Decrease Quantity"
                                                style="width: 28px; height: 100%; border: none; background: var(--surface-2); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                                            <i class="fa-solid fa-minus" style="font-size: 9px;"></i>
                                        </button>
                                        <input type="number"
                                               class="pj-input pj-alloc-qty-input"
                                               data-stock-id="${e.stock_id}"
                                               value="${e.qty}"
                                               min="1"
                                               max="${e.avail_qty||9999}"
                                               style="width: 56px; height: 100%; border: none; border-radius: 0; text-align: center; font-weight: 700; font-family: monospace; font-size: 12.5px; padding: 0 4px;" />
                                        <button type="button"
                                                class="btn-cart-qty-plus"
                                                data-stock-id="${e.stock_id}"
                                                title="Increase Quantity"
                                                style="width: 28px; height: 100%; border: none; background: var(--surface-2); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                                            <i class="fa-solid fa-plus" style="font-size: 9px;"></i>
                                        </button>
                                    </div>
                                </td>
                                <td style="text-align: right;">
                                    <button type="button"
                                            class="pj-btn-icon-sm btn-remove-stock"
                                            data-stock-id="${e.stock_id}"
                                            title="Remove from Cart"
                                            style="color: #ff4d4f; width: 30px; height: 30px; border-radius: 6px; border: 1px solid rgba(255, 77, 79, 0.3); background: rgba(255, 77, 79, 0.08); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        `}).join(``)}
                </tbody>
            </table>
        `,e.querySelectorAll(`.btn-cart-qty-minus`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-stock-id`),10),n=this.cart.find(e=>Number(e.stock_id)===t);n&&n.qty>1&&this.updateCartItemQty(t,n.qty-1)}}),e.querySelectorAll(`.btn-cart-qty-plus`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-stock-id`),10),n=this.cart.find(e=>Number(e.stock_id)===t);n&&this.updateCartItemQty(t,n.qty+1)}}),e.querySelectorAll(`.pj-alloc-qty-input`).forEach(e=>{e.onchange=()=>{let t=parseInt(e.getAttribute(`data-stock-id`),10);this.updateCartItemQty(t,e.value)},e.onkeydown=t=>{if(t.key===`Enter`){t.preventDefault();let n=parseInt(e.getAttribute(`data-stock-id`),10);this.updateCartItemQty(n,e.value)}}}),e.querySelectorAll(`.btn-remove-stock`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-stock-id`),10);this.removeFromCart(t)}}))}async saveCart(e={}){if(!this.currentJob||this.isSavingCart)return!1;this.isSavingCart=!0;let t=document.getElementById(`btnSaveMaterialCart`),n=t?t.innerHTML:``;t&&(t.disabled=!0,t.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Saving Materials...`);try{let t=this.cart.map(e=>({stock_id:Number(e.stock_id),qty:Math.max(1,parseInt(e.qty,10)||1)})),n=await this.dataLoader.syncStockItems(this.currentJob.id,t);return n&&Array.isArray(n.materials)?(this.currentJob.materials=n.materials,this.currentJob.materials_count=n.materials.length):(this.currentJob.materials=this.cart.map(e=>({...e})),this.currentJob.materials_count=this.cart.length),this.isCartDirty=!1,this.renderCart(),this.onJobUpdated(),this.showToast(`Selected materials saved (${this.cart.length} item${this.cart.length===1?``:`s`})!`,`success`),e.closeOnSuccess&&this.close(),!0}catch(e){return this.showToast(e.message||`Failed to save selected materials.`,`error`),!1}finally{this.isSavingCart=!1,t&&(t.disabled=!1,t.innerHTML=n,this.updateFooterActionButtons())}}async submitStartPrinting(){if(!this.currentJob||this.isSavingCart)return;if(this.cart.length===0){this.showToast(`Please select at least one material before starting printing.`,`warning`);return}let e=document.getElementById(`btnModalStartPrinting`),t=e?e.innerHTML:``;e&&(e.disabled=!0,e.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Saving & Starting Printing...`);try{let e=this.cart.map(e=>({stock_id:Number(e.stock_id),qty:Math.max(1,parseInt(e.qty,10)||1)}));await this.dataLoader.syncStockItems(this.currentJob.id,e);let t=(this.statuses||[]).find(e=>String(e.name||``).toLowerCase().trim()===`printing`),n=t?t.id:4;await this.dataLoader.updateStatus(this.currentJob.id,n),this.showToast(`Materials saved & Job ${this.currentJob.job_number} moved to Printing!`,`success`),this.close(),typeof this.onStartPrintingSuccess==`function`?this.onStartPrintingSuccess(this.currentJob.id):this.onJobUpdated()}catch(n){this.showToast(n.message||`Failed to save materials and start printing.`,`error`),e&&(e.disabled=!1,e.innerHTML=t)}}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},m=class{constructor(e,t={}){this.dataLoader=e,this.onJobUpdated=t.onJobUpdated||(()=>{}),this.onStartPrintingSuccess=t.onStartPrintingSuccess||null,this.showToast=t.showToast||((e,t)=>alert(e)),this.detailsModal=new d(this.dataLoader),this.statusModal=new f(this.dataLoader,{onJobUpdated:this.onJobUpdated,showToast:this.showToast,onNeedMaterials:e=>this.openAllocateMaterial(e,{forStartPrinting:!0})}),this.materialModal=new p(this.dataLoader,{onJobUpdated:this.onJobUpdated,onStartPrintingSuccess:this.onStartPrintingSuccess,showToast:this.showToast}),this.initGlobalEvents()}initGlobalEvents(){document.querySelectorAll(`.pj-modal-close, [data-modal-dismiss]`).forEach(e=>{e.onclick=()=>this.closeAll()}),document.querySelectorAll(`.pj-modal-overlay`).forEach(e=>{e.onclick=t=>{t.target===e&&this.closeAll()}}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.closeAll()})}setReferenceData(e=[],t=[],n=[],r=[]){this.statusModal.setStatuses(e),this.materialModal.setReferenceData(t,n,r),this.materialModal.setStatuses(e)}openDetails(e){this.detailsModal.open(e)}openChangeStatus(e){this.statusModal.open(e)}openAllocateMaterial(e,t={}){if(!e)return;let n=e.stage_key||``,r=parseInt(e.status_id,10);n!==`printing`&&r!==4?this.showToast(`Materials can only be added or modified during Printing on Machine stage.`,`info`):this.materialModal.open(e,t)}closeAll(){this.detailsModal.close(),this.statusModal.close(),this.materialModal.close()}},h=class{static filter(t=[],n={}){let r=(n.query||``).toLowerCase().trim(),i=n.typeId||``,a=n.statusId||``,o=t.filter(t=>{if(r){let n=String(t.id).includes(r)||t.job_number.toLowerCase().includes(r)||t.order_number.toLowerCase().includes(r),i=t.customer_name.toLowerCase().includes(r)||e.matchesMobile(t.customer_mobile,r),a=t.print_type_name.toLowerCase().includes(r),o=[t.date_search,t.date_formatted,t.time_formatted,t.time_24,t.date_raw].filter(Boolean).join(` `).toLowerCase().includes(r);if(!n&&!i&&!a&&!o)return!1}return!(i&&String(t.print_types_id)!==String(i)||a&&String(t.status_id)!==String(a))}),s={prepress:[],printing:[],finishing:[],ready:[],completed:[]};return o.forEach(e=>{s[e.stage_key]&&s[e.stage_key].push(e)}),{filteredJobs:o,kanbanGrouped:s}}},g=class{static exportToCsv(e=[]){if(!e||e.length===0)throw Error(`No jobs available to export.`);let t=[`Job ID`,`Order Number`,`Customer Name`,`Mobile`,`Print Type`,`Quantity`,`Production Stage`,`Total Amount (LKR)`,`Paid Amount (LKR)`,`Payment Status`,`Order Date`],n=e.map(e=>[e.job_number,e.order_number,`"${(e.customer_name||``).replace(/"/g,`""`)}"`,e.customer_mobile,`"${(e.print_type_name||``).replace(/"/g,`""`)}"`,e.qty,`"${(e.status_name||``).replace(/"/g,`""`)}"`,e.total_amount,e.paid_amount,e.payment_status,e.date_formatted]),r=`data:text/csv;charset=utf-8,`+[t.join(`,`),...n.map(e=>e.join(`,`))].join(`
`),i=encodeURI(r),a=document.createElement(`a`);a.setAttribute(`href`,i),a.setAttribute(`download`,`print_jobs_export_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a)}},_=class{static update(e={}){let t=document.getElementById(`kpiTotalJobs`),n=document.getElementById(`kpiPrepressJobs`),r=document.getElementById(`kpiPrintingJobs`),i=document.getElementById(`kpiFinishingJobs`),a=document.getElementById(`kpiReadyJobs`);t&&(t.textContent=e.total||0),n&&(n.textContent=e.prepress||0),r&&(r.textContent=e.printing||0),i&&(i.textContent=e.finishing||0),a&&(a.textContent=e.ready_completed||0)}},v=class{constructor(){this.dataLoader=new a,this.modalHandler=new m(this.dataLoader,{onJobUpdated:()=>this.reloadFloorData(!0),onStartPrintingSuccess:async()=>{await this.reloadFloorData(!0),this.tabHandler.switchTab(`printing`)},showToast:(e,t)=>this.showToast(e,t)}),this.tabHandler=new l({onViewDetails:e=>this.handleViewDetails(e),onChangeStatus:e=>this.handleAdvanceFromCard(e),onAllocateStock:e=>this.handleAllocateStock(e)}),this.tableHandler=new u({onViewDetails:e=>this.handleViewDetails(e),onChangeStatus:e=>this.handleChangeStatus(e),onAllocateStock:e=>this.handleAllocateStock(e),onApproveJob:e=>this.handleQuickStatusChange(e,`Approved`),onCancelJob:e=>{let t=this.allJobs.find(t=>t.id===e),r=t?.order_number||t?.job_number||`Job #${e}`;n.openCancelOrderModal({targetLabel:r,onConfirm:()=>this.handleQuickStatusChange(e,`Cancelled`)})}}),this.allJobs=[],this.filteredJobs=[],this.kanbanData={},this.kpis={},this.statuses=[],this.printTypes=[],this.availableStocks=[],this._initializedEl=null,this.init()}init(){let e=document.getElementById(`module-print-jobs`);e&&this._initializedEl!==e&&(this._initializedEl=e,this.initUI(),this.loadInitialData(),i.subscribe([`print_jobs`,`orders`,`inventory`],async()=>{await this.reloadFloorData(!0)},{key:`print-jobs-live-sync`}))}initUI(){let e=document.getElementById(`btnViewCards`),t=document.getElementById(`btnViewTable`),n=document.getElementById(`stageTabsContainer`),r=document.getElementById(`tableViewContainer`);e&&t&&(e.onclick=()=>{e.classList.add(`active`),t.classList.remove(`active`),n&&(n.style.display=`block`),r&&(r.style.display=`none`)},t.onclick=()=>{t.classList.add(`active`),e.classList.remove(`active`),n&&(n.style.display=`none`),r&&(r.style.display=`block`),this.tableHandler.render()});let i=document.getElementById(`jobSearchInput`);if(i){let e=null;i.oninput=()=>{clearTimeout(e),e=setTimeout(()=>this.applyFilters(),250)}}let a=document.getElementById(`filterPrintType`);a&&(a.onchange=()=>this.applyFilters());let o=document.getElementById(`filterStatus`);o&&(o.onchange=()=>this.applyFilters());let s=document.getElementById(`btnRefreshJobs`);s&&(s.onclick=()=>this.reloadFloorData());let c=document.getElementById(`btnExportJobs`);c&&(c.onclick=()=>this.exportCsv())}loadInitialData(){window.__INITIAL_PRINT_JOBS_DATA__?this.processFloorData(window.__INITIAL_PRINT_JOBS_DATA__):this.reloadFloorData()}async reloadFloorData(e=!1){try{let t=await this.dataLoader.fetchFloorData();this.processFloorData(t),e||this.showToast(`Production floor data refreshed.`,`success`)}catch(t){e||this.showToast(t.message||`Error refreshing floor data.`,`error`)}}processFloorData(e){this.allJobs=e.jobs||[],this.filteredJobs=[...this.allJobs],this.kanbanData=e.kanban||{},this.kpis=e.kpis||{},this.statuses=e.statuses||[],this.printTypes=e.print_types||[],this.availableStocks=e.available_stocks||[],this.materialCategories=e.material_categories||[],this.materialSubcategories=e.material_subcategories||[],this.modalHandler.setReferenceData(this.statuses,this.availableStocks,this.materialCategories,this.materialSubcategories),_.update(this.kpis),this.populateDropdowns(),this.applyFilters()}populateDropdowns(){let e=document.getElementById(`filterPrintType`);if(e&&this.printTypes&&this.printTypes.length>0){let t=e.value;e.innerHTML=`<option value="">All Categories</option>`,this.printTypes.forEach(n=>{let r=document.createElement(`option`);r.value=n.id,r.textContent=n.name,String(n.id)===String(t)&&(r.selected=!0),e.appendChild(r)})}let t=document.getElementById(`filterStatus`);if(t&&this.statuses&&this.statuses.length>0){let e=t.value;t.innerHTML=`<option value="">All Statuses</option>`,this.statuses.forEach(n=>{let r=document.createElement(`option`);r.value=n.id,r.textContent=n.name,String(n.id)===String(e)&&(r.selected=!0),t.appendChild(r)})}}applyFilters(){let e=document.getElementById(`jobSearchInput`)?.value||``,t=document.getElementById(`filterPrintType`)?.value||``,n=document.getElementById(`filterStatus`)?.value||``,r=h.filter(this.allJobs,{query:e,typeId:t,statusId:n});this.filteredJobs=r.filteredJobs,this.tabHandler.render(r.kanbanGrouped),this.tableHandler.setData(this.filteredJobs)}handleViewDetails(e){let t=this.allJobs.find(t=>t.id===e);t&&this.modalHandler.openDetails(t)}handleChangeStatus(e){let t=this.allJobs.find(t=>t.id===e);t&&this.modalHandler.openChangeStatus(t)}async handleAdvanceFromCard(e){let t=this.allJobs.find(t=>t.id===e);if(!t)return;if(t.stage_key===`printing`&&!((t.materials||[]).length>0)){this.showToast(`Please select the materials used for this print before moving to Finishing.`,`warning`),this.modalHandler.openAllocateMaterial(t,{forStartPrinting:!1});return}let n={prepress:`Printing`,printing:`Finishing`,finishing:`Ready for Pickup`,ready:`Completed`}[t.stage_key]||null;!n&&t.stage_key===`completed`&&String(t.status_name||``).toLowerCase().trim()!==`delivered`&&(n=`Delivered`),n?await this.handleQuickStatusChange(e,n):this.modalHandler.openChangeStatus(t)}handleAllocateStock(e){let t=this.allJobs.find(t=>t.id===e);if(!t)return;let n=t.stage_key||``,r=parseInt(t.status_id,10);n!==`printing`&&r!==4?this.showToast(`Materials can only be added or modified during Printing on Machine stage.`,`info`):this.modalHandler.openAllocateMaterial(t)}async handleQuickStatusChange(e,t){let n=this.allJobs.find(t=>t.id===e);if(String(t).toLowerCase()===`finishing`&&!((n?.materials||[]).length>0)){this.showToast(`Please select the materials used for this print before moving to Finishing.`,`warning`),n&&this.modalHandler.openAllocateMaterial(n,{forStartPrinting:!1});return}let r=(this.statuses||[]).find(e=>String(e.name||``).toLowerCase().trim()===t.toLowerCase());if(!r)this.showToast(`Status "${t}" not found.`,`error`);else try{await this.dataLoader.updateStatus(e,r.id),this.showToast(`Job status updated to ${r.name}.`,`success`),await this.reloadFloorData()}catch(e){this.showToast(e.message||`Failed to mark job as ${t}.`,`error`)}}exportCsv(){try{g.exportToCsv(this.filteredJobs),this.showToast(`Print jobs exported successfully.`,`success`)}catch(e){this.showToast(e.message,`warning`)}}showToast(e,t=`info`){let n=document.getElementById(`poToastContainer`);n||(n=document.createElement(`div`),n.id=`poToastContainer`,n.className=`po-toast-container`,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`po-toast ${t}`,r.innerHTML=`<i class="fa-solid ${t===`success`?`fa-circle-check`:t===`error`?`fa-triangle-exclamation`:`fa-circle-info`}"></i> <span>${this.escapeHtml(e)}</span>`,n.appendChild(r),setTimeout(()=>{r.style.opacity=`0`,r.style.transform=`translateY(-8px)`,setTimeout(()=>r.remove(),300)},3200)}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},y=()=>{let e=document.getElementById(`module-print-jobs`);e&&e.dataset.printJobsBooted!==`1`&&(e.dataset.printJobsBooted=`1`,window.printJobsManager=new v)};typeof window<`u`&&(window.PrintJobsManager=v),document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,y,{once:!0}):y(),document.addEventListener(`turbo:load`,y);