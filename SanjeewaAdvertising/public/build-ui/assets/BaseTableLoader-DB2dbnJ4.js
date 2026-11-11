import{t as e}from"./BasePaginationHandler-CxkMXfSO.js";var t=class extends e{constructor(e={}){super({paginationInfoId:e.paginationInfoId||`paginationInfo`,paginationControlsId:e.paginationControlsId||`paginationControls`,pageSize:e.pageSize||20,itemLabel:e.itemLabel||`records`,onPageChange:e.onPageChange||(()=>{})}),this.tbodyId=e.tbodyId||``,this.colspan=e.colspan||10,this.emptyIcon=e.emptyIcon||`fa-folder-open`,this.emptyMessage=e.emptyMessage||`No records matching your criteria`,this.rowBuilder=e.rowBuilder||null,this.searchTerm=``,this.filters={}}getTbody(){return typeof document<`u`&&this.tbodyId?document.getElementById(this.tbodyId):null}showLoading(e=`Loading records...`){let t=this.getTbody();t&&(t.innerHTML=`
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
    `}loadTable(e=[],t=null,n=this.currentPage,r=this.pageSize){let i=this.getTbody();if(!i)return;if(i.innerHTML=``,!e||e.length===0){this.renderEmptyState(),this.renderPagination(0,1,1,r);return}let{pageItems:a,total:o,totalPages:s,activePage:c}=this.paginate(e,n,r);a.forEach((e,n)=>{let r=null;typeof t==`function`?r=t(e,n):typeof e?.render==`function`?r=e.render():this.rowBuilder&&(r=new this.rowBuilder(e).render()),r instanceof HTMLElement?i.appendChild(r):typeof r==`string`&&i.insertAdjacentHTML(`beforeend`,r)}),this.renderPagination(o,s,c,r)}clear(){let e=this.getTbody();e&&(e.innerHTML=``)}};export{t};