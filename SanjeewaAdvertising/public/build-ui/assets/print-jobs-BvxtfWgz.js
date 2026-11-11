var e=class{constructor(){this.csrfToken=document.querySelector(`meta[name="csrf-token"]`)?.getAttribute(`content`)||``}getHeaders(){return{"Content-Type":`application/json`,Accept:`application/json`,"X-CSRF-TOKEN":this.csrfToken,"X-Requested-With":`XMLHttpRequest`}}async fetchFloorData(e={}){let t=new URLSearchParams(e).toString(),n=`/print-jobs/floor-data${t?`?`+t:``}`,r=await fetch(n,{credentials:`same-origin`,headers:this.getHeaders()}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Failed to fetch production floor data.`);return i.data}async updateStatus(e,t){let n=`/print-jobs/${e}/status`,r=await fetch(n,{method:`PATCH`,credentials:`same-origin`,headers:this.getHeaders(),body:JSON.stringify({print_job_statuses_id:t})}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Failed to update job status.`);return i.data}async fetchStatusHistory(e){let t=`/print-jobs/${e}/status-history`,n=await fetch(t,{credentials:`same-origin`,headers:this.getHeaders()}),r=await n.json();if(!n.ok||!r.success)throw Error(r.message||`Failed to load status history.`);return r.data}async assignStockItem(e,t,n){let r=`/print-jobs/${e}/stock-items`,i=await fetch(r,{method:`POST`,credentials:`same-origin`,headers:this.getHeaders(),body:JSON.stringify({stock_id:t,qty:n})}),a=await i.json();if(!i.ok||!a.success)throw Error(a.message||`Failed to assign stock item.`);return a.data}async removeStockItem(e,t){let n=`/print-jobs/${e}/stock-items/${t}`,r=await fetch(n,{method:`DELETE`,credentials:`same-origin`,headers:this.getHeaders()}),i=await r.json();if(!r.ok||!i.success)throw Error(i.message||`Failed to remove stock item.`);return i.data}},t=class{static getStageThemeClass(e){switch(e){case`prepress`:return`card-purple`;case`printing`:return`card-blue`;case`finishing`:return`card-amber`;case`ready`:return`card-mint`;case`completed`:return`card-slate`;default:return`card-purple`}}static build(e,t){let n=this.getStageThemeClass(t||e.stage_key),r=e.materials_count>0?`<div class="pj-card-materials has-material" title="Allocated Materials">
                 <i class="fa-solid fa-boxes-stacked"></i>
                 <span class="pj-material-name">${this.escapeHtml(e.materials[0].name)} ${e.materials.length>1?`(+${e.materials.length-1} more)`:``}</span>
               </div>`:`<div class="pj-card-materials no-material" title="No material allocated">
                 <i class="fa-solid fa-circle-exclamation"></i>
                 <span>No stock material linked</span>
               </div>`;return`
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

                ${r}

                <div class="pj-card-bottom-row">
                    <div class="pj-card-date-info">
                        <i class="fa-regular fa-calendar"></i> ${this.escapeHtml(e.date_formatted)}
                    </div>
                    <div class="pj-card-btn-group">
                        <button type="button" class="pj-btn-icon-sm btn-action-details" data-job-id="${e.id}" title="View Details & History">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-allocate" data-job-id="${e.id}" title="Allocate Stock / Material">
                            <i class="fa-solid fa-boxes-stacked"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-status" data-job-id="${e.id}" title="Advance Production Status">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `}static escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},n=class{static buildRow(e){let t=e.materials_count>0?e.materials.map(e=>`
                <span class="pj-spec-tag" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                    <i class="fa-solid fa-box"></i> ${this.escapeHtml(e.name)} (${e.qty})
                </span>
            `).join(` `):`<span style="color: #94a3b8; font-size: 11px;">Not allocated</span>`,n=e.payment_status===`Paid`?`paid`:e.payment_status===`Partially Paid`?`partially-paid`:`unpaid`;return`
            <tr data-job-id="${e.id}">
                <td>
                    <div style="font-weight: 700; font-family: monospace; color: #0f172a;">${this.escapeHtml(e.job_number)}</div>
                    <div style="font-size: 11px; color: #64748b;">${this.escapeHtml(e.order_number)}</div>
                </td>
                <td>
                    <div style="font-weight: 600;">${this.escapeHtml(e.customer_name)}</div>
                    <div style="font-size: 11px; color: #64748b;"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(e.customer_mobile)}</div>
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
                        <button type="button" class="pj-btn-icon-sm btn-action-details" data-job-id="${e.id}" title="Details & Timeline">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-allocate" data-job-id="${e.id}" title="Allocate Stock">
                            <i class="fa-solid fa-boxes-stacked"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-status" data-job-id="${e.id}" title="Update Status">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
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
        `}static escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},r=class{constructor(e={}){this.onViewDetails=e.onViewDetails||(()=>{}),this.onChangeStatus=e.onChangeStatus||(()=>{}),this.onAllocateStock=e.onAllocateStock||(()=>{}),this.currentStage=`prepress`,this.stages=[`prepress`,`printing`,`finishing`,`ready`,`completed`],this.initTabs()}initTabs(){let e=document.getElementById(`pjStageTabs`);e&&e.querySelectorAll(`.pj-stage-tab`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-stage`);t&&this.switchTab(t)}})}switchTab(e){this.stages.includes(e)&&(this.currentStage=e,document.querySelectorAll(`#pjStageTabs .pj-stage-tab`).forEach(t=>{t.getAttribute(`data-stage`)===e?t.classList.add(`active`):t.classList.remove(`active`)}),document.querySelectorAll(`.pj-tab-pane`).forEach(t=>{t.id===`tabPane-${e}`?(t.classList.add(`active`),t.style.display=`grid`):(t.classList.remove(`active`),t.style.display=`none`)}))}render(e={}){this.stages.forEach(n=>{let r=document.getElementById(`tabCards-${n}`),i=document.getElementById(`tabBadge-${n}`),a=e[n]||[];i&&(i.textContent=a.length),r&&(r.innerHTML=a.length===0?`
                    <div class="pj-tab-empty">
                        <i class="fa-solid fa-inbox"></i>
                        <div class="pj-empty-title">No jobs in this stage</div>
                        <div class="pj-empty-sub">Jobs assigned to this production stage will appear here.</div>
                    </div>
                `:a.map(e=>t.build(e,n)).join(``))}),this.attachCardEvents()}attachCardEvents(){document.querySelectorAll(`.pj-job-card .btn-action-details`).forEach(e=>{e.onclick=t=>{t.stopPropagation();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onViewDetails(n)}}),document.querySelectorAll(`.pj-job-card .btn-action-status`).forEach(e=>{e.onclick=t=>{t.stopPropagation();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onChangeStatus(n)}}),document.querySelectorAll(`.pj-job-card .btn-action-allocate`).forEach(e=>{e.onclick=t=>{t.stopPropagation();let n=parseInt(e.getAttribute(`data-job-id`),10);this.onAllocateStock(n)}})}},i=class{constructor(e={}){this.onViewDetails=e.onViewDetails||(()=>{}),this.onChangeStatus=e.onChangeStatus||(()=>{}),this.onAllocateStock=e.onAllocateStock||(()=>{}),this.tableBody=document.getElementById(`pjTableBody`),this.paginationInfo=document.getElementById(`pjPaginationInfo`),this.btnPrev=document.getElementById(`pjBtnPrevPage`),this.btnNext=document.getElementById(`pjBtnNextPage`),this.jobs=[],this.currentPage=1,this.perPage=10,this.btnPrev&&(this.btnPrev.onclick=()=>this.goToPage(this.currentPage-1)),this.btnNext&&(this.btnNext.onclick=()=>this.goToPage(this.currentPage+1))}setData(e=[]){this.jobs=e,this.currentPage=1,this.render()}goToPage(e){let t=Math.ceil(this.jobs.length/this.perPage)||1;e<1||e>t||(this.currentPage=e,this.render())}render(){if(!this.tableBody)return;if(this.jobs.length===0){this.tableBody.innerHTML=n.buildEmpty(8),this.paginationInfo&&(this.paginationInfo.textContent=`Showing 0 of 0 jobs`),this.btnPrev&&(this.btnPrev.disabled=!0),this.btnNext&&(this.btnNext.disabled=!0);return}let e=Math.ceil(this.jobs.length/this.perPage)||1,t=(this.currentPage-1)*this.perPage,r=this.jobs.slice(t,t+this.perPage);this.tableBody.innerHTML=r.map(e=>n.buildRow(e)).join(``);let i=Math.min(t+this.perPage,this.jobs.length);this.paginationInfo&&(this.paginationInfo.textContent=`Showing ${t+1} to ${i} of ${this.jobs.length} jobs (Page ${this.currentPage} of ${e})`),this.btnPrev&&(this.btnPrev.disabled=this.currentPage<=1),this.btnNext&&(this.btnNext.disabled=this.currentPage>=e),this.attachRowEvents()}attachRowEvents(){this.tableBody&&(this.tableBody.querySelectorAll(`.btn-action-details`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-job-id`),10);this.onViewDetails(t)}}),this.tableBody.querySelectorAll(`.btn-action-status`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-job-id`),10);this.onChangeStatus(t)}}),this.tableBody.querySelectorAll(`.btn-action-allocate`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.getAttribute(`data-job-id`),10);this.onAllocateStock(t)}}))}},a=class{constructor(e){this.dataLoader=e,this.modal=document.getElementById(`modalJobDetails`)}async open(e){if(!this.modal||!e)return;document.getElementById(`detailsJobCode`).textContent=`${e.job_number} (${e.order_number})`,document.getElementById(`detailsCustomerName`).textContent=e.customer_name,document.getElementById(`detailsCustomerContact`).textContent=`${e.customer_mobile||`—`} ${e.customer_email?`• ${e.customer_email}`:``}`,document.getElementById(`detailsPrintType`).textContent=e.print_type_name,document.getElementById(`detailsQuantity`).textContent=`${e.qty} units`,document.getElementById(`detailsDate`).textContent=e.date_formatted,document.getElementById(`detailsOperator`).textContent=e.operator_name,document.getElementById(`detailsTotalAmount`).textContent=`Rs. ${Number(e.total_amount).toLocaleString(`en-US`,{minimumFractionDigits:2})}`,document.getElementById(`detailsPaidAmount`).textContent=`Rs. ${Number(e.paid_amount).toLocaleString(`en-US`,{minimumFractionDigits:2})}`,document.getElementById(`detailsBalanceAmount`).textContent=`Rs. ${Number(e.balance_amount).toLocaleString(`en-US`,{minimumFractionDigits:2})}`;let t=document.getElementById(`detailsPaymentBadge`);t&&(t.textContent=e.payment_status,t.className=`pj-pay-badge ${e.payment_status===`Paid`?`paid`:e.payment_status===`Partially Paid`?`partially-paid`:`unpaid`}`);let n=document.getElementById(`detailsMaterialsList`);n&&(n.innerHTML=e.materials&&e.materials.length>0?`
                    <table class="pj-assigned-table">
                        <thead>
                            <tr><th>Material</th><th>Brand</th><th>Assigned Qty</th></tr>
                        </thead>
                        <tbody>
                            ${e.materials.map(e=>`
                                <tr>
                                    <td><strong>${this.escapeHtml(e.name)}</strong></td>
                                    <td>${this.escapeHtml(e.brand||`—`)}</td>
                                    <td>${e.qty}</td>
                                </tr>
                            `).join(``)}
                        </tbody>
                    </table>
                `:`<div style="font-size: 12px; color: #94a3b8; font-style: italic;">No stock materials currently linked to this job.</div>`);let r=document.getElementById(`detailsTimelineContainer`);if(this.modal.classList.add(`active`),r){r.innerHTML=`<div style="font-size: 12px; color: #8c8c8c;"><i class="fa-solid fa-spinner fa-spin"></i> Loading status history...</div>`;try{let t=await this.dataLoader.fetchStatusHistory(e.id);r.innerHTML=t&&t.length>0?`
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
                    `}catch{r.innerHTML=`<div style="font-size: 12px; color: #cf1322;">Failed to load timeline. Current status: ${this.escapeHtml(e.status_name)}</div>`}}}close(){this.modal&&this.modal.classList.remove(`active`)}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},o=class{constructor(e,t={}){this.dataLoader=e,this.onJobUpdated=t.onJobUpdated||(()=>{}),this.showToast=t.showToast||((e,t)=>alert(e)),this.modal=document.getElementById(`modalChangeStatus`),this.currentJob=null,this.statuses=[],this.initEvents()}initEvents(){let e=document.getElementById(`btnSubmitStatusChange`);e&&(e.onclick=()=>this.submit())}setStatuses(e=[]){this.statuses=e;let t=document.getElementById(`selectNewStatus`);t&&(t.innerHTML=`<option value="">-- Choose New Status --</option>`+e.map(e=>`<option value="${e.id}">${this.escapeHtml(e.name)}</option>`).join(``))}open(e){if(this.currentJob=e,!this.modal||!e)return;let t=document.getElementById(`statusJobHeader`);t&&(t.textContent=`${e.job_number} • ${e.customer_name}`);let n=document.getElementById(`statusCurrentBadge`);n&&(n.textContent=e.status_name,n.className=`pj-badge ${e.badge_class}`);let r=document.getElementById(`selectNewStatus`);r&&(r.value=``),this.modal.classList.add(`active`)}close(){this.modal&&this.modal.classList.remove(`active`),this.currentJob=null}async submit(){if(!this.currentJob)return;let e=document.getElementById(`selectNewStatus`),t=parseInt(e.value,10);if(!t){this.showToast(`Please select a new production stage.`,`warning`);return}let n=document.getElementById(`btnSubmitStatusChange`),r=n.innerHTML;n.disabled=!0,n.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Updating...`;try{await this.dataLoader.updateStatus(this.currentJob.id,t),this.showToast(`Job ${this.currentJob.job_number} status updated successfully!`,`success`),this.close(),this.onJobUpdated()}catch(e){this.showToast(e.message||`Failed to update status.`,`error`)}finally{n.disabled=!1,n.innerHTML=r}}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},s=class{constructor(e,t={}){this.dataLoader=e,this.onJobUpdated=t.onJobUpdated||(()=>{}),this.showToast=t.showToast||((e,t)=>alert(e)),this.modal=document.getElementById(`modalAllocateMaterial`),this.currentJob=null,this.availableStocks=[],this.initEvents()}initEvents(){let e=document.getElementById(`btnSubmitAssignMaterial`);e&&(e.onclick=()=>this.submitAssign())}setAvailableStocks(e=[]){this.availableStocks=e;let t=document.getElementById(`selectAllocateStock`);t&&(t.innerHTML=`<option value="">-- Choose Raw Material / Stock Item --</option>`+e.map(e=>`
                <option value="${e.id}">
                    ${this.escapeHtml(e.name)} ${e.brand?`[${this.escapeHtml(e.brand)}]`:``} - (Available: ${e.qty} in stock)
                </option>
            `).join(``))}open(e){if(this.currentJob=e,!this.modal||!e)return;let t=document.getElementById(`allocJobHeader`);t&&(t.textContent=`${e.job_number} • ${e.print_type_name} (${e.qty} units)`),this.renderAllocatedList();let n=document.getElementById(`inputMaterialQty`);n&&(n.value=`1`),this.modal.classList.add(`active`)}close(){this.modal&&this.modal.classList.remove(`active`),this.currentJob=null}renderAllocatedList(){let e=document.getElementById(`allocatedMaterialsList`);if(!e||!this.currentJob)return;let t=this.currentJob.materials||[];t.length===0?e.innerHTML=`<div style="font-size: 12px; color: #94a3b8; padding: 12px; text-align: center;">No materials allocated to this job yet.</div>`:(e.innerHTML=`
            <table class="pj-assigned-table">
                <thead>
                    <tr>
                        <th>Material Item</th>
                        <th>Brand</th>
                        <th>Allocated Qty</th>
                        <th style="text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map(e=>`
                        <tr>
                            <td><strong>${this.escapeHtml(e.name)}</strong></td>
                            <td>${this.escapeHtml(e.brand||`—`)}</td>
                            <td>${e.qty}</td>
                            <td style="text-align: right;">
                                <button type="button" class="pj-btn-icon-sm btn-remove-stock" data-stock-id="${e.stock_id}" title="Remove Allocation" style="color: #ff4d4f;">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        </tr>
                    `).join(``)}
                </tbody>
            </table>
        `,e.querySelectorAll(`.btn-remove-stock`).forEach(e=>{e.onclick=async()=>{let t=parseInt(e.getAttribute(`data-stock-id`),10);await this.removeStock(t)}}))}async removeStock(e){if(this.currentJob)try{await this.dataLoader.removeStockItem(this.currentJob.id,e),this.showToast(`Material allocation removed.`,`success`),this.currentJob.materials=this.currentJob.materials.filter(t=>t.stock_id!==e),this.currentJob.materials_count=this.currentJob.materials.length,this.renderAllocatedList(),this.onJobUpdated()}catch(e){this.showToast(e.message||`Failed to remove material.`,`error`)}}async submitAssign(){if(!this.currentJob)return;let e=document.getElementById(`selectAllocateStock`),t=document.getElementById(`inputMaterialQty`),n=parseInt(e.value,10),r=parseInt(t.value,10);if(!n){this.showToast(`Please select a stock material.`,`warning`);return}if(!r||r<=0){this.showToast(`Please enter a valid quantity.`,`warning`);return}let i=document.getElementById(`btnSubmitAssignMaterial`),a=i.innerHTML;i.disabled=!0,i.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Assigning...`;try{await this.dataLoader.assignStockItem(this.currentJob.id,n,r),this.showToast(`Stock material assigned successfully!`,`success`);let e=this.availableStocks.find(e=>e.id===n),t=this.currentJob.materials.find(e=>e.stock_id===n);t?t.qty=r:this.currentJob.materials.push({stock_id:n,name:e?e.name:`Stock #${n}`,brand:e?e.brand:``,qty:r}),this.currentJob.materials_count=this.currentJob.materials.length,this.renderAllocatedList(),this.onJobUpdated()}catch(e){this.showToast(e.message||`Failed to assign stock material.`,`error`)}finally{i.disabled=!1,i.innerHTML=a}}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}},c=class{constructor(e,t={}){this.dataLoader=e,this.onJobUpdated=t.onJobUpdated||(()=>{}),this.showToast=t.showToast||((e,t)=>alert(e)),this.detailsModal=new a(this.dataLoader),this.statusModal=new o(this.dataLoader,{onJobUpdated:this.onJobUpdated,showToast:this.showToast}),this.materialModal=new s(this.dataLoader,{onJobUpdated:this.onJobUpdated,showToast:this.showToast}),this.initGlobalEvents()}initGlobalEvents(){document.querySelectorAll(`.pj-modal-close, [data-modal-dismiss]`).forEach(e=>{e.onclick=()=>this.closeAll()}),document.querySelectorAll(`.pj-modal-overlay`).forEach(e=>{e.onclick=t=>{t.target===e&&this.closeAll()}}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.closeAll()})}setReferenceData(e=[],t=[]){this.statusModal.setStatuses(e),this.materialModal.setAvailableStocks(t)}openDetails(e){this.detailsModal.open(e)}openChangeStatus(e){this.statusModal.open(e)}openAllocateMaterial(e){this.materialModal.open(e)}closeAll(){this.detailsModal.close(),this.statusModal.close(),this.materialModal.close()}},l=class{static filter(e=[],t={}){let n=(t.query||``).toLowerCase().trim(),r=t.typeId||``,i=t.statusId||``,a=e.filter(e=>{if(n){let t=String(e.id).includes(n)||e.job_number.toLowerCase().includes(n)||e.order_number.toLowerCase().includes(n),r=e.customer_name.toLowerCase().includes(n)||e.customer_mobile.includes(n),i=e.print_type_name.toLowerCase().includes(n);if(!t&&!r&&!i)return!1}return!(r&&String(e.print_types_id)!==String(r)||i&&String(e.status_id)!==String(i))}),o={prepress:[],printing:[],finishing:[],ready:[],completed:[]};return a.forEach(e=>{o[e.stage_key]&&o[e.stage_key].push(e)}),{filteredJobs:a,kanbanGrouped:o}}},u=class{static exportToCsv(e=[]){if(!e||e.length===0)throw Error(`No jobs available to export.`);let t=[`Job ID`,`Order Number`,`Customer Name`,`Mobile`,`Print Type`,`Quantity`,`Production Stage`,`Total Amount (LKR)`,`Paid Amount (LKR)`,`Payment Status`,`Order Date`],n=e.map(e=>[e.job_number,e.order_number,`"${(e.customer_name||``).replace(/"/g,`""`)}"`,e.customer_mobile,`"${(e.print_type_name||``).replace(/"/g,`""`)}"`,e.qty,`"${(e.status_name||``).replace(/"/g,`""`)}"`,e.total_amount,e.paid_amount,e.payment_status,e.date_formatted]),r=`data:text/csv;charset=utf-8,`+[t.join(`,`),...n.map(e=>e.join(`,`))].join(`
`),i=encodeURI(r),a=document.createElement(`a`);a.setAttribute(`href`,i),a.setAttribute(`download`,`print_jobs_export_${new Date().toISOString().slice(0,10)}.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a)}},d=class{static update(e={}){let t=document.getElementById(`kpiTotalJobs`),n=document.getElementById(`kpiPrepressJobs`),r=document.getElementById(`kpiPrintingJobs`),i=document.getElementById(`kpiFinishingJobs`),a=document.getElementById(`kpiReadyJobs`);t&&(t.textContent=e.total||0),n&&(n.textContent=e.prepress||0),r&&(r.textContent=e.printing||0),i&&(i.textContent=e.finishing||0),a&&(a.textContent=e.ready_completed||0)}},f=class{constructor(){this.dataLoader=new e,this.modalHandler=new c(this.dataLoader,{onJobUpdated:()=>this.reloadFloorData(),showToast:(e,t)=>this.showToast(e,t)}),this.tabHandler=new r({onViewDetails:e=>this.handleViewDetails(e),onChangeStatus:e=>this.handleChangeStatus(e),onAllocateStock:e=>this.handleAllocateStock(e)}),this.tableHandler=new i({onViewDetails:e=>this.handleViewDetails(e),onChangeStatus:e=>this.handleChangeStatus(e),onAllocateStock:e=>this.handleAllocateStock(e)}),this.allJobs=[],this.filteredJobs=[],this.kanbanData={},this.kpis={},this.statuses=[],this.printTypes=[],this.availableStocks=[],this.initUI(),this.loadInitialData()}initUI(){let e=document.getElementById(`btnViewCards`),t=document.getElementById(`btnViewTable`),n=document.getElementById(`stageTabsContainer`),r=document.getElementById(`tableViewContainer`);e&&t&&(e.onclick=()=>{e.classList.add(`active`),t.classList.remove(`active`),n&&(n.style.display=`block`),r&&(r.style.display=`none`)},t.onclick=()=>{t.classList.add(`active`),e.classList.remove(`active`),n&&(n.style.display=`none`),r&&(r.style.display=`block`),this.tableHandler.render()});let i=document.getElementById(`jobSearchInput`);if(i){let e=null;i.oninput=()=>{clearTimeout(e),e=setTimeout(()=>this.applyFilters(),250)}}let a=document.getElementById(`filterPrintType`);a&&(a.onchange=()=>this.applyFilters());let o=document.getElementById(`filterStatus`);o&&(o.onchange=()=>this.applyFilters());let s=document.getElementById(`btnRefreshJobs`);s&&(s.onclick=()=>this.reloadFloorData());let c=document.getElementById(`btnExportJobs`);c&&(c.onclick=()=>this.exportCsv())}loadInitialData(){window.__INITIAL_PRINT_JOBS_DATA__?this.processFloorData(window.__INITIAL_PRINT_JOBS_DATA__):this.reloadFloorData()}async reloadFloorData(){try{let e=await this.dataLoader.fetchFloorData();this.processFloorData(e),this.showToast(`Production floor data refreshed.`,`success`)}catch(e){this.showToast(e.message||`Error refreshing floor data.`,`error`)}}processFloorData(e){this.allJobs=e.jobs||[],this.filteredJobs=[...this.allJobs],this.kanbanData=e.kanban||{},this.kpis=e.kpis||{},this.statuses=e.statuses||[],this.printTypes=e.print_types||[],this.availableStocks=e.available_stocks||[],this.modalHandler.setReferenceData(this.statuses,this.availableStocks),d.update(this.kpis),this.populateDropdowns(),this.applyFilters()}populateDropdowns(){let e=document.getElementById(`filterPrintType`);if(e&&this.printTypes&&this.printTypes.length>0){let t=e.value;e.innerHTML=`<option value="">All Categories</option>`,this.printTypes.forEach(n=>{let r=document.createElement(`option`);r.value=n.id,r.textContent=n.name,String(n.id)===String(t)&&(r.selected=!0),e.appendChild(r)})}let t=document.getElementById(`filterStatus`);if(t&&this.statuses&&this.statuses.length>0){let e=t.value;t.innerHTML=`<option value="">All Statuses</option>`,this.statuses.forEach(n=>{let r=document.createElement(`option`);r.value=n.id,r.textContent=n.name,String(n.id)===String(e)&&(r.selected=!0),t.appendChild(r)})}}applyFilters(){let e=document.getElementById(`jobSearchInput`)?.value||``,t=document.getElementById(`filterPrintType`)?.value||``,n=document.getElementById(`filterStatus`)?.value||``,r=l.filter(this.allJobs,{query:e,typeId:t,statusId:n});this.filteredJobs=r.filteredJobs,this.tabHandler.render(r.kanbanGrouped),this.tableHandler.setData(this.filteredJobs)}handleViewDetails(e){let t=this.allJobs.find(t=>t.id===e);t&&this.modalHandler.openDetails(t)}handleChangeStatus(e){let t=this.allJobs.find(t=>t.id===e);t&&this.modalHandler.openChangeStatus(t)}handleAllocateStock(e){let t=this.allJobs.find(t=>t.id===e);t&&this.modalHandler.openAllocateMaterial(t)}exportCsv(){try{u.exportToCsv(this.filteredJobs),this.showToast(`Print jobs exported successfully.`,`success`)}catch(e){this.showToast(e.message,`warning`)}}showToast(e,t=`info`){let n=document.getElementById(`poToastContainer`);n||(n=document.createElement(`div`),n.id=`poToastContainer`,n.className=`po-toast-container`,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`po-toast ${t}`,r.innerHTML=`<i class="fa-solid ${t===`success`?`fa-circle-check`:t===`error`?`fa-triangle-exclamation`:`fa-circle-info`}"></i> <span>${this.escapeHtml(e)}</span>`,n.appendChild(r),setTimeout(()=>{r.style.opacity=`0`,r.style.transform=`translateY(-8px)`,setTimeout(()=>r.remove(),300)},3200)}escapeHtml(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`):``}};document.addEventListener(`DOMContentLoaded`,()=>{window.printJobsManager=new f});