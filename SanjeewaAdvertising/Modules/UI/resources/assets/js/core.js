/**
 * SanjeewaAdvertising - Core Module
 */

import {
  BaseTableLoader,
  BaseTableRowBuilder,
  BaseModalHandler,
  FormValidator,
  ValidatBuilder,
  RequestHandler,
  BaseRequestHandler
} from "./core/index.js";

export {
  BaseTableLoader,
  BaseTableRowBuilder,
  BaseModalHandler,
  FormValidator,
  ValidatBuilder,
  RequestHandler,
  BaseRequestHandler
};

if (typeof window !== "undefined") {
  window.BaseTableLoader = BaseTableLoader;
  window.BaseTableRowBuilder = BaseTableRowBuilder;
  window.BaseModalHandler = BaseModalHandler;
  window.FormValidator = FormValidator;
  window.ValidatBuilder = ValidatBuilder;
  window.RequestHandler = RequestHandler;
  window.BaseRequestHandler = BaseRequestHandler;
}
