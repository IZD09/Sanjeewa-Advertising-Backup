/**
 * SanjeewaAdvertising - Topbar Header Meta Process
 *
 * Manages live Sri Lanka date display, page title, and breadcrumb updates.
 */

"use strict";

export class HeaderMetaProcess {
  constructor() {
    this.dateElem = null;
    this.pageTitleElem = null;
    this.breadcrumbElem = null;
  }

  init() {
    this.dateElem = document.getElementById("todayDate");
    this.pageTitleElem = document.getElementById("pageTitle");
    this.breadcrumbElem = document.getElementById("breadcrumbArea");
    this.setDate();
  }

  setDate() {
    if (!this.dateElem) return;
    this.dateElem.textContent = new Intl.DateTimeFormat("en-LK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }

  updateTitleAndBreadcrumb(title, breadcrumbHtml) {
    if (this.pageTitleElem && title) {
      this.pageTitleElem.textContent = title;
    }
    if (this.breadcrumbElem && breadcrumbHtml) {
      this.breadcrumbElem.innerHTML = breadcrumbHtml;
    }
  }
}

export default HeaderMetaProcess;
