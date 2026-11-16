/**
 * SanjeewaAdvertising - Core Module Registry Class
 */

import {
  BasePaginationHandler,
  BaseTableLoader,
  BaseTableRowBuilder,
  BaseModalHandler,
  FormValidator,
  ValidatBuilder,
  RequestHandler,
  BaseRequestHandler,
  MobileNumberHelper,
  ActionMenuHelper,
  ConfirmModalHelper,
  StatusHelper
} from "./core/index.js";

export class CoreModule {
  static registerGlobals(target = typeof window !== "undefined" ? window : null) {
    if (!target) return;
    target.BasePaginationHandler = BasePaginationHandler;
    target.BaseTableLoader = BaseTableLoader;
    target.BaseTableRowBuilder = BaseTableRowBuilder;
    target.BaseModalHandler = BaseModalHandler;
    target.FormValidator = FormValidator;
    target.ValidatBuilder = ValidatBuilder;
    target.RequestHandler = RequestHandler;
    target.BaseRequestHandler = BaseRequestHandler;
    target.MobileNumberHelper = MobileNumberHelper;
    target.ActionMenuHelper = ActionMenuHelper;
    target.ConfirmModalHelper = ConfirmModalHelper;
    target.StatusHelper = StatusHelper;
  }
}

CoreModule.registerGlobals();

export {
  BasePaginationHandler,
  BaseTableLoader,
  BaseTableRowBuilder,
  BaseModalHandler,
  FormValidator,
  ValidatBuilder,
  RequestHandler,
  BaseRequestHandler,
  MobileNumberHelper,
  ActionMenuHelper,
  ConfirmModalHelper,
  StatusHelper
};

export default CoreModule;
