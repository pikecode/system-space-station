"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/profile/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx":
/*!*****************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx ***!
  \*****************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ ProfilePage; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@4.2.1_@tarojs+service@4.2.1_@tarojs+shared@4.2.1/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _store_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../store/auth */ "./src/store/auth.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);




var ROLE_LABELS = {
  ADMIN: '系统管理员',
  HEAD: '部门负责人',
  MEMBER: '部门成员'
};
function ProfilePage() {
  var _user$name$, _user$name, _ROLE_LABELS, _user$role;
  var _useAuthStore = (0,_store_auth__WEBPACK_IMPORTED_MODULE_1__.useAuthStore)(),
    user = _useAuthStore.user,
    logout = _useAuthStore.logout;
  var handleLogout = function handleLogout() {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().showModal({
      title: '退出登录',
      content: '确认退出？',
      success: function success(_ref) {
        var confirm = _ref.confirm;
        if (confirm) {
          logout();
          _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().reLaunch({
            url: '/pages/login/index'
          });
        }
      }
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
    className: "page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: "card",
      style: {
        margin: '24rpx',
        display: 'flex',
        alignItems: 'center',
        gap: '24rpx'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
        style: {
          width: '100rpx',
          height: '100rpx',
          borderRadius: '50rpx',
          background: '#00a3a3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          style: {
            color: '#fff',
            fontSize: '40rpx',
            fontWeight: '700'
          },
          children: (_user$name$ = user === null || user === void 0 || (_user$name = user.name) === null || _user$name === void 0 ? void 0 : _user$name[0]) !== null && _user$name$ !== void 0 ? _user$name$ : '?'
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          style: {
            fontSize: '34rpx',
            fontWeight: '700',
            display: 'block'
          },
          children: user === null || user === void 0 ? void 0 : user.name
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          style: {
            fontSize: '26rpx',
            color: '#888',
            display: 'block',
            marginTop: '8rpx'
          },
          children: (_ROLE_LABELS = ROLE_LABELS[(_user$role = user === null || user === void 0 ? void 0 : user.role) !== null && _user$role !== void 0 ? _user$role : '']) !== null && _ROLE_LABELS !== void 0 ? _ROLE_LABELS : user === null || user === void 0 ? void 0 : user.role
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      className: "section-title",
      children: "\u529F\u80FD"
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      style: {
        background: '#fff',
        borderRadius: '16rpx',
        margin: '0 24rpx'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
        className: "row",
        style: {
          padding: '28rpx 32rpx',
          cursor: 'pointer'
        },
        onClick: function onClick() {
          return _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().navigateTo({
            url: '/pages/commissions/list'
          });
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          style: {
            fontSize: '30rpx',
            flex: 1
          },
          children: "\u6211\u7684\u5206\u6210"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Text, {
          style: {
            color: '#bbb',
            fontSize: '24rpx'
          },
          children: "\u203A"
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.View, {
      style: {
        padding: '48rpx 24rpx 0'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
        style: {
          background: '#fff',
          color: '#f5222d',
          border: '2rpx solid #f5222d',
          borderRadius: '12rpx'
        },
        onClick: handleLogout,
        children: "\u9000\u51FA\u767B\u5F55"
      })
    })]
  });
}

/***/ }),

/***/ "./src/pages/profile/index.tsx":
/*!*************************************!*\
  !*** ./src/pages/profile/index.tsx ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/profile/index!./src/pages/profile/index.tsx");


var config = {"navigationBarTitleText":"我的"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/profile/index', {root:{cn:[]}}, config || {})
if (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"] && _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_profile_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","common"], function() { return __webpack_exec__("./src/pages/profile/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map