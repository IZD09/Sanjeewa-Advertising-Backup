var e=class{constructor(e={}){this.tbodyId=e.tbodyId||``,this.paginationInfoId=e.paginationInfoId||`paginationInfo`,this.paginationControlsId=e.paginationControlsId||`paginationControls`,this.pageSize=e.pageSize||8,this.colspan=e.colspan||10,this.emptyIcon=e.emptyIcon||`fa-folder-open`,this.emptyMessage=e.emptyMessage||`No records matching your criteria`,this.onPageChange=e.onPageChange||(()=>{}),this.rowBuilder=e.rowBuilder||null,this.currentPage=1,this.searchTerm=``,this.filters={}}getTbody(){return typeof document<`u`&&this.tbodyId?document.getElementById(this.tbodyId):null}showLoading(e=`Loading records...`){let t=this.getTbody();t&&(t.innerHTML=`
      <tr>
        <td colspan="${this.colspan}">
          <div class="po-empty-state" style="padding: 32px 16px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: var(--po-orange, #ff6b00);"></i>
            <p style="margin-top: 10px;">${e}</p>
          </div>
        </td>
      </tr>
    `)}renderEmptyState(e=null,t=null){let n=this.getTbody();if(!n)return;let r=e||this.emptyMessage,i=t||this.emptyIcon;n.innerHTML=`
      <tr>
        <td colspan="${this.colspan}">
          <div class="po-empty-state">
            <i class="fa-solid ${i}"></i>
            <p>${r}</p>
          </div>
        </td>
      </tr>
    `}paginate(e=[],t=this.currentPage,n=this.pageSize){let r=e.length,i=Math.ceil(r/n)||1,a=Math.max(1,Math.min(t,i)),o=(a-1)*n;return{pageItems:e.slice(o,o+n),total:r,totalPages:i,activePage:a,pageSize:n}}renderPagination(e,t,n,r){let i=document.getElementById(this.paginationInfoId),a=document.getElementById(this.paginationControlsId);if(!i||!a)return;if(e===0){i.textContent=`Showing 0 records`,a.innerHTML=``;return}i.textContent=`Showing ${(n-1)*r+1}-${Math.min(n*r,e)} of ${e} records`,a.innerHTML=``;let o=document.createElement(`button`);o.className=`page-btn`,o.innerHTML=`<i class="fa-solid fa-chevron-left"></i>`,o.disabled=n===1,o.addEventListener(`click`,()=>{n>1&&this.onPageChange(n-1)}),a.appendChild(o);for(let e=1;e<=t;e++){let t=document.createElement(`button`);t.className=`page-btn ${e===n?`active`:``}`,t.textContent=String(e),t.addEventListener(`click`,()=>{this.onPageChange(e)}),a.appendChild(t)}let s=document.createElement(`button`);s.className=`page-btn`,s.innerHTML=`<i class="fa-solid fa-chevron-right"></i>`,s.disabled=n===t,s.addEventListener(`click`,()=>{n<t&&this.onPageChange(n+1)}),a.appendChild(s)}loadTable(e=[],t=null,n=this.currentPage,r=this.pageSize){let i=this.getTbody();if(!i)return;if(i.innerHTML=``,!e||e.length===0){this.renderEmptyState(),this.renderPagination(0,1,1,r);return}let{pageItems:a,total:o,totalPages:s,activePage:c}=this.paginate(e,n,r);a.forEach((e,n)=>{let r=null;typeof t==`function`?r=t(e,n):typeof e?.render==`function`?r=e.render():this.rowBuilder&&(r=new this.rowBuilder(e).render()),r instanceof HTMLElement?i.appendChild(r):typeof r==`string`&&i.insertAdjacentHTML(`beforeend`,r)}),this.renderPagination(o,s,c,r)}clear(){let e=this.getTbody();e&&(e.innerHTML=``)}},t=class{constructor(e={}){this.activeModalClass=e.activeModalClass||`open`,this.closeSelectors=e.closeSelectors||[`[data-close-modal]`,`[data-close-grn-modal]`,`[data-close-inv-modal]`,`[data-close-pay-modal]`,`.po-modal-close`,`.pay-modal-close`,`.ant-modal-close`],this.overlaySelector=e.overlaySelector||`.po-modal-overlay, .pay-modal-backdrop, .ant-modal-mask`,this.toastContainerId=e.toastContainerId||`poToastContainer`,this.closeOnEscape=e.closeOnEscape!==!1,this.closeOnBackdrop=e.closeOnBackdrop!==!1,e.autoBind!==!1&&typeof document<`u`&&this.bindModalEvents()}getModalElement(e){return e?typeof e==`string`?document.getElementById(e):e instanceof HTMLElement?e:null:null}open(e){let t=this.getModalElement(e);if(!t)return null;t.classList.add(this.activeModalClass),t.setAttribute(`aria-hidden`,`false`);let n=typeof e==`string`?e:t.id;return this.onOpen(n,t),t}openModal(e){return this.open(e)}close(e){let t=this.getModalElement(e);if(!t)return null;t.classList.remove(this.activeModalClass),t.setAttribute(`aria-hidden`,`true`);let n=typeof e==`string`?e:t.id;return this.onClose(n,t),t}closeModal(e){return this.close(e)}toggle(e){let t=this.getModalElement(e);return t?this.isOpen(t)?(this.close(t),!1):(this.open(t),!0):!1}isOpen(e){let t=this.getModalElement(e);return t?t.classList.contains(this.activeModalClass):!1}closeAll(e=null){if(typeof document>`u`)return;let t=e||this.overlaySelector;document.querySelectorAll(t.split(`,`).map(e=>`${e.trim()}.${this.activeModalClass}`).join(`,`)).forEach(e=>{this.close(e)})}closeAllModals(e=null){this.closeAll(e)}bindModalEvents(){typeof document<`u`&&(document.addEventListener(`click`,e=>{let t=this.closeSelectors.join(`, `),n=e.target.closest(t);if(n){e.preventDefault();let t=n.getAttribute(`data-close-modal`)||n.getAttribute(`data-close-grn-modal`)||n.getAttribute(`data-close-inv-modal`)||n.getAttribute(`data-close-pay-modal`);if(t&&document.getElementById(t))this.close(t);else{let e=n.closest(this.overlaySelector);e&&this.close(e)}}else if(this.closeOnBackdrop){let t=e.target.closest(this.overlaySelector);t&&e.target===t&&this.close(t)}}),this.closeOnEscape&&document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.closeAll()}))}showToast(e,t=`success`,n=3500){if(typeof document>`u`)return;let r=document.getElementById(this.toastContainerId);r||(r=document.createElement(`div`),r.id=this.toastContainerId,r.className=`po-toast-container`,document.body.appendChild(r));let i=document.createElement(`div`);i.className=`po-toast ${t}`;let a=`fa-check-circle`;t===`error`&&(a=`fa-triangle-exclamation`),t===`warning`&&(a=`fa-circle-exclamation`),t===`info`&&(a=`fa-circle-info`),i.innerHTML=`<i class="fa-solid ${a}"></i> <span>${e}</span>`,r.appendChild(i),setTimeout(()=>{i.style.transition=`opacity 0.25s ease, transform 0.25s ease`,i.style.opacity=`0`,i.style.transform=`translateX(100%)`,setTimeout(()=>i.remove(),260)},n)}printDocument(e,t=`Document`,n=``){if(typeof window>`u`)return;let r=window.open(``,`_blank`,`width=850,height=900`);r?(r.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 24px; color: #111; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          ${n}
        </style>
      </head>
      <body>
        ${e}
      </body>
      </html>
    `),r.document.close(),r.focus(),setTimeout(()=>{r.print(),r.close()},350)):alert(`Please allow popups to print this document.`)}onOpen(e,t){}onClose(e,t){}};export{e as n,t};