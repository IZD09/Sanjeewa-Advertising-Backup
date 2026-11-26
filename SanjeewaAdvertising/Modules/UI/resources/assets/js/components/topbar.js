/**
 * Global Topbar Controller & Component Orchestrator
 * Sanjeewa Advertising Printing Shop Management System
 *
 * Delegates modular responsibilities to components/topbar/ process classes:
 * - NotificationController: In-app notification dropdown, live sync, read actions
 * - ProfileDropdownProcess: User/Admin profile dropdown menu
 * - AutoHidePinProcess: Desktop hover auto-hide, pin toggle, peek pill
 * - ThemeProcess: Dark / Light mode toggle & chart theme sync
 * - HeaderMetaProcess: Live Sri Lanka date, page title, and breadcrumbs
 */

"use strict";

import {
  NotificationController,
  ThemeProcess,
  ProfileDropdownProcess,
  AutoHidePinProcess,
  HeaderMetaProcess,
} from "./topbar/index.js";

class TopbarController {
  constructor() {
    this.themeProcess = new ThemeProcess();
    this.headerMetaProcess = new HeaderMetaProcess();

    this.profileDropdownProcess = new ProfileDropdownProcess({
      onOpen: () => {
        this.notificationController.close();
        this.autoHidePinProcess.clearHideTimeout();
        this.autoHidePinProcess.showTopbar();
      },
      onClose: () => {
        if (!this.isPinned && !this.autoHidePinProcess.isMouseOverTopbar && !this.isNotifOpen) {
          this.autoHidePinProcess.scheduleHide(500);
        }
      },
    });

    this.notificationController = new NotificationController({
      onOpen: () => {
        this.profileDropdownProcess.close();
        this.autoHidePinProcess.clearHideTimeout();
        this.autoHidePinProcess.showTopbar();
      },
      onClose: () => {
        if (!this.isPinned && !this.autoHidePinProcess.isMouseOverTopbar && !this.isDropdownOpen) {
          this.autoHidePinProcess.scheduleHide(500);
        }
      },
    });

    this.autoHidePinProcess = new AutoHidePinProcess({
      hasOpenDropdown: () => this.isDropdownOpen || this.isNotifOpen,
    });

    this.init();
  }

  get topbar() {
    return this.autoHidePinProcess.topbar;
  }

  get isPinned() {
    return this.autoHidePinProcess.isPinned;
  }

  get isDropdownOpen() {
    return Boolean(this.profileDropdownProcess?.isOpen);
  }

  get isNotifOpen() {
    return Boolean(this.notificationController?.isOpen);
  }

  init() {
    this.autoHidePinProcess.refreshElements();
    if (!this.topbar) return;

    this.themeProcess.init();
    this.headerMetaProcess.init();
    this.autoHidePinProcess.init();
    this.profileDropdownProcess.init();
    this.notificationController.init();
    this.autoHidePinProcess.showInitialState();
  }

  refreshElements() {
    this.autoHidePinProcess.refreshElements();
    if (!this.topbar) {
      this.autoHidePinProcess.clearHideTimeout();
      return;
    }

    this.themeProcess.init();
    this.headerMetaProcess.init();
    this.autoHidePinProcess.init();
    this.profileDropdownProcess.init();
    this.notificationController.init();
  }

  showTopbar() {
    this.autoHidePinProcess.showTopbar();
  }

  hideTopbar() {
    this.autoHidePinProcess.hideTopbar();
  }

  scheduleHide(delay = 300) {
    this.autoHidePinProcess.scheduleHide(delay);
  }

  togglePin(forceState = null) {
    this.autoHidePinProcess.togglePin(forceState);
  }

  onModuleNavigate() {
    this.autoHidePinProcess.showInitialState();
  }

  closeProfileDropdown() {
    this.profileDropdownProcess.close();
  }

  closeNotificationDropdown() {
    this.notificationController.close();
  }

  loadNotifications() {
    return this.notificationController.load();
  }

  updateTitleAndBreadcrumb(title, breadcrumbHtml) {
    this.headerMetaProcess.updateTitleAndBreadcrumb(title, breadcrumbHtml);
  }
}

// Global initialization with safe readyState handling
if (typeof window !== "undefined") {
  window.TopbarController = TopbarController;
  window.TopbarComponent = TopbarController;

  const bootTopbar = () => {
    if (!window.topbarController) {
      window.topbarController = new TopbarController();
      window.topbarComponent = window.topbarController;
    } else {
      window.topbarController.refreshElements();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootTopbar);
  } else {
    bootTopbar();
  }
  document.addEventListener("turbo:load", bootTopbar);
}
