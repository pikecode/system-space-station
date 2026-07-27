"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/customers/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/index!./src/pages/customers/index.tsx":
/*!*********************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/index!./src/pages/customers/index.tsx ***!
  \*********************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ CustomersPage; }
/* harmony export */ });
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/slicedToArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@4.2.1_@tarojs+service@4.2.1_@tarojs+shared@4.2.1/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _services_customers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/customers */ "./src/services/customers.ts");
/* harmony import */ var _store_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../store/auth */ "./src/store/auth.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);









function CustomersPage() {
  var user = (0,_store_auth__WEBPACK_IMPORTED_MODULE_3__.useAuthStore)(function (s) {
    return s.user;
  });
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),
    _useState2 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState, 2),
    list = _useState2[0],
    setList = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(''),
    _useState4 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState3, 2),
    search = _useState4[0],
    setSearch = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true),
    _useState6 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState5, 2),
    loading = _useState6[0],
    setLoading = _useState6[1];
  var load = /*#__PURE__*/function () {
    var _ref = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_6__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_7__["default"])().m(function _callee(name) {
      var data, _t;
      return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_7__["default"])().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            setLoading(true);
            _context.p = 1;
            _context.n = 2;
            return _services_customers__WEBPACK_IMPORTED_MODULE_2__.customersApi.getAll(name ? {
              name: name
            } : undefined);
          case 2:
            data = _context.v;
            setList(data);
            _context.n = 4;
            break;
          case 3:
            _context.p = 3;
            _t = _context.v;
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: _t.message || '加载失败',
              icon: 'none'
            });
          case 4:
            _context.p = 4;
            setLoading(false);
            return _context.f(4);
          case 5:
            return _context.a(2);
        }
      }, _callee, null, [[1, 3, 4, 5]]);
    }));
    return function load(_x) {
      return _ref.apply(this, arguments);
    };
  }();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    load();
  }, []);
  var SOURCE_LABELS = {
    REFERRAL: '转介绍',
    SELF_DEVELOPED: '自主开发',
    ACTIVITY: '活动',
    ONLINE: '线上',
    OTHER: '其他'
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
    className: "page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
      style: {
        background: '#fff',
        padding: '20rpx 32rpx',
        display: 'flex',
        gap: '16rpx'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
        style: {
          flex: 1,
          background: '#f5f6f8',
          borderRadius: '10rpx',
          padding: '16rpx 24rpx',
          display: 'flex',
          alignItems: 'center'
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Input, {
          style: {
            flex: 1,
            fontSize: '28rpx'
          },
          placeholder: "\u641C\u7D22\u5BA2\u6237\u59D3\u540D",
          value: search,
          onInput: function onInput(e) {
            return setSearch(e.detail.value);
          },
          onConfirm: function onConfirm() {
            return load(search);
          }
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
        style: {
          background: '#00a3a3',
          color: '#fff',
          borderRadius: '10rpx',
          padding: '16rpx 28rpx',
          fontSize: '28rpx',
          display: 'flex',
          alignItems: 'center'
        },
        onClick: function onClick() {
          return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().navigateTo({
            url: '/pages/customers/detail?mode=create'
          });
        },
        children: "\u65B0\u589E"
      })]
    }), loading ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
      className: "loading",
      children: "\u52A0\u8F7D\u4E2D\u2026"
    }) : list.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
      className: "empty",
      children: "\u6682\u65E0\u5BA2\u6237"
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.ScrollView, {
      scrollY: true,
      style: {
        height: 'calc(100vh - 120rpx)'
      },
      children: list.map(function (item) {
        var _SOURCE_LABELS$item$s, _item$tags;
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "card",
          style: {
            margin: '16rpx 24rpx',
            cursor: 'pointer'
          },
          onClick: function onClick() {
            return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().navigateTo({
              url: "/pages/customers/detail?id=".concat(item.id)
            });
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12rpx'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              style: {
                fontSize: '32rpx',
                fontWeight: '600'
              },
              children: item.name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              className: "tag ".concat(item.customerType === 'COMPANY' ? 'tag--pending' : ''),
              children: item.customerType === 'INDIVIDUAL' ? '个人' : '企业'
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
            style: {
              fontSize: '26rpx',
              color: '#888',
              display: 'block'
            },
            children: item.phone
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            style: {
              marginTop: '12rpx',
              display: 'flex',
              gap: '12rpx'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              className: "tag",
              children: (_SOURCE_LABELS$item$s = SOURCE_LABELS[item.source]) !== null && _SOURCE_LABELS$item$s !== void 0 ? _SOURCE_LABELS$item$s : item.source
            }), (_item$tags = item.tags) === null || _item$tags === void 0 ? void 0 : _item$tags.split(',').map(function (t) {
              return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
                className: "tag",
                children: t
              }, t);
            })]
          })]
        }, item.id);
      })
    })]
  });
}

/***/ }),

/***/ "./src/pages/customers/index.tsx":
/*!***************************************!*\
  !*** ./src/pages/customers/index.tsx ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/index!./src/pages/customers/index.tsx");


var config = {"navigationBarTitleText":"我的客户"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/customers/index', {root:{cn:[]}}, config || {})
if (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"] && _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/customers/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map