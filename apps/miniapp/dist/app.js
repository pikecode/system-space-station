"use strict";
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_react-dom_js.js");
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_chunk-GBF5LTOQ_js.js");
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_chunk-GNBE3VWC_js.js");
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_chunk-QILVP6DE_js.js");
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_tarojs_plugin-framework-react_dist_runtime_js.js");
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_tarojs_plugin-platform-weapp_dist_runtime_js.js");
require("./prebundle/node_modules_taro_weapp_prebundle_tarojs_runtime_js.js");
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_zustand_js.js");
require("./prebundle/vendors-node_modules_taro_weapp_prebundle_tarojs_taro_js.js");
require("./prebundle/remoteEntry.js");
require("./prebundle/node_modules_taro_weapp_prebundle_react_jsx-runtime_js.js");
require("./prebundle/node_modules_taro_weapp_prebundle_react_js.js");

require("./common");
require("./vendors");
require("./taro");
require("./runtime");

(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["app"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=app!./src/app.ts":
/*!********************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=app!./src/app.ts ***!
  \********************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ App; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);



function App(_ref) {
  var children = _ref.children;
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    try {
      var _options$query;
      var options = _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getLaunchOptionsSync();
      var shareCode = (_options$query = options.query) === null || _options$query === void 0 ? void 0 : _options$query.shareCode;
      if (shareCode) {
        _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().setStorageSync('pendingShareCode', shareCode);
      }
    } catch (_unused) {}
  }, []);
  return children;
}

/***/ }),

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_plugin_platform_weapp_dist_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/plugin-platform-weapp/dist/runtime */ "webpack/container/remote/@tarojs/plugin-platform-weapp/dist/runtime");
/* harmony import */ var _tarojs_plugin_platform_weapp_dist_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_plugin_platform_weapp_dist_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _tarojs_plugin_framework_react_dist_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tarojs/plugin-framework-react/dist/runtime */ "webpack/container/remote/@tarojs/plugin-framework-react/dist/runtime");
/* harmony import */ var _tarojs_plugin_framework_react_dist_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_tarojs_plugin_framework_react_dist_runtime__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_app_app_ts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !!../../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=app!./app.ts */ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=app!./src/app.ts");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-dom */ "webpack/container/remote/react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_6__);











var config = {"pages":["pages/login/index","pages/register/index","pages/register/success","pages/customers/index","pages/customers/detail","pages/approvals/index","pages/profile/index","pages/memberships/create","pages/memberships/detail","pages/commissions/list"],"window":{"backgroundTextStyle":"light","navigationBarBackgroundColor":"#ffffff","navigationBarTitleText":"客户资源管理","navigationBarTextStyle":"black"},"tabBar":{"color":"#666666","selectedColor":"#00a3a3","backgroundColor":"#ffffff","borderStyle":"black","list":[{"pagePath":"pages/customers/index","text":"客户","iconPath":"assets/icons/customers.png","selectedIconPath":"assets/icons/customers-active.png"},{"pagePath":"pages/approvals/index","text":"待办","iconPath":"assets/icons/approvals.png","selectedIconPath":"assets/icons/approvals-active.png"},{"pagePath":"pages/profile/index","text":"我的","iconPath":"assets/icons/profile.png","selectedIconPath":"assets/icons/profile-active.png"}]}};
_tarojs_runtime__WEBPACK_IMPORTED_MODULE_1__.window.__taroAppConfig = config
var inst = App((0,_tarojs_plugin_framework_react_dist_runtime__WEBPACK_IMPORTED_MODULE_2__.createReactApp)(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_app_app_ts__WEBPACK_IMPORTED_MODULE_4__["default"], react__WEBPACK_IMPORTED_MODULE_5__, (react_dom__WEBPACK_IMPORTED_MODULE_6___default()), config))

;(0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_3__.initPxTransform)({
  designWidth: 750,
  deviceRatio: {"375":2,"640":1.17,"750":1,"828":0.905},
  baseFontSize: 20,
  unitPrecision: undefined,
  targetUnit: undefined
})


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["common"], function() { return __webpack_exec__("./src/app.ts"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);;;
//# sourceMappingURL=app.js.map