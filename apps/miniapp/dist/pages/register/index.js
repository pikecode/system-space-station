"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/register/index"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/register/index!./src/pages/register/index.tsx":
/*!*******************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/register/index!./src/pages/register/index.tsx ***!
  \*******************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ RegisterPage; }
/* harmony export */ });
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/objectSpread2.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/slicedToArray.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "webpack/container/remote/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "../../node_modules/.pnpm/@tarojs+plugin-platform-weapp@4.2.1_@tarojs+service@4.2.1_@tarojs+shared@4.2.1/node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _services_invite__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/invite */ "./src/services/invite.ts");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "webpack/container/remote/react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);









var CUSTOMER_TYPES = [{
  value: 'INDIVIDUAL',
  label: '个人'
}, {
  value: 'COMPANY',
  label: '企业'
}];
function RegisterPage() {
  var _ref, _router$params$shareC;
  var router = (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
  var shareCode = (_ref = (_router$params$shareC = router.params.shareCode) !== null && _router$params$shareC !== void 0 ? _router$params$shareC : _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().getStorageSync('pendingShareCode')) !== null && _ref !== void 0 ? _ref : '';
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState2 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_4__["default"])(_useState, 2),
    inviter = _useState2[0],
    setInviter = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(''),
    _useState4 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_4__["default"])(_useState3, 2),
    inviterError = _useState4[0],
    setInviterError = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0),
    _useState6 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_4__["default"])(_useState5, 2),
    typeIndex = _useState6[0],
    setTypeIndex = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
      name: '',
      phone: '',
      wechat: '',
      notes: ''
    }),
    _useState8 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_4__["default"])(_useState7, 2),
    form = _useState8[0],
    setForm = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState0 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_4__["default"])(_useState9, 2),
    submitting = _useState0[0],
    setSubmitting = _useState0[1];
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    if (!shareCode) {
      setInviterError('邀请码无效，请重新扫描二维码');
      return;
    }
    _services_invite__WEBPACK_IMPORTED_MODULE_2__.inviteApi.getInviter(shareCode).then(setInviter).catch(function () {
      return setInviterError('邀请码已失效');
    });
  }, [shareCode]);
  var handleSubmit = /*#__PURE__*/function () {
    var _ref2 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_5__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_6__["default"])().m(function _callee() {
      var _t;
      return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_6__["default"])().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (form.name.trim()) {
              _context.n = 1;
              break;
            }
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: '请输入姓名',
              icon: 'none'
            });
            return _context.a(2);
          case 1:
            if (/^1\d{10}$/.test(form.phone)) {
              _context.n = 2;
              break;
            }
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: '请输入正确的手机号',
              icon: 'none'
            });
            return _context.a(2);
          case 2:
            setSubmitting(true);
            _context.p = 3;
            _context.n = 4;
            return _services_invite__WEBPACK_IMPORTED_MODULE_2__.inviteApi.register({
              shareCode: shareCode,
              customerType: CUSTOMER_TYPES[typeIndex].value,
              name: form.name.trim(),
              phone: form.phone,
              wechat: form.wechat.trim() || undefined,
              notes: form.notes.trim() || undefined
            });
          case 4:
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().removeStorageSync('pendingShareCode');
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().redirectTo({
              url: '/pages/register/success'
            });
            _context.n = 6;
            break;
          case 5:
            _context.p = 5;
            _t = _context.v;
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: _t.message || '提交失败，请重试',
              icon: 'none'
            });
          case 6:
            _context.p = 6;
            setSubmitting(false);
            return _context.f(6);
          case 7:
            return _context.a(2);
        }
      }, _callee, null, [[3, 5, 6, 7]]);
    }));
    return function handleSubmit() {
      return _ref2.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
    style: {
      minHeight: '100vh',
      background: '#f5f7fa',
      paddingBottom: '160rpx'
    },
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
      style: {
        background: '#00a3a3',
        padding: '48rpx 32rpx 40rpx',
        textAlign: 'center'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
        style: {
          color: '#fff',
          fontSize: '32rpx',
          display: 'block',
          marginBottom: '12rpx'
        },
        children: "\u60A8\u53D7\u5230\u9080\u8BF7"
      }), inviter ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
        style: {
          color: 'rgba(255,255,255,0.85)',
          fontSize: '26rpx'
        },
        children: [inviter.inviterName, "\uFF08", inviter.deptName, "\uFF09\u9080\u8BF7\u60A8\u767B\u8BB0\u4FE1\u606F"]
      }) : inviterError ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
        style: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: '26rpx'
        },
        children: inviterError
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
        style: {
          color: 'rgba(255,255,255,0.7)',
          fontSize: '26rpx'
        },
        children: "\u9A8C\u8BC1\u9080\u8BF7\u7801\u4E2D\u2026"
      })]
    }), !inviterError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
      style: {
        margin: '24rpx 24rpx 0',
        background: '#fff',
        borderRadius: '16rpx',
        overflow: 'hidden'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
        style: {
          padding: '32rpx 32rpx 0'
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
          style: {
            fontSize: '28rpx',
            fontWeight: '600',
            color: '#1a1d21'
          },
          children: "\u586B\u5199\u60A8\u7684\u4FE1\u606F"
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Picker, {
        mode: "selector",
        range: CUSTOMER_TYPES.map(function (t) {
          return t.label;
        }),
        value: typeIndex,
        onChange: function onChange(e) {
          return setTypeIndex(+e.detail.value);
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
          style: {
            display: 'flex',
            alignItems: 'center',
            padding: '28rpx 32rpx',
            borderBottom: '1rpx solid #f0f1f3'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            style: {
              flex: 1,
              color: '#666',
              fontSize: '28rpx'
            },
            children: "\u5BA2\u6237\u7C7B\u578B"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            style: {
              color: '#1a1d21',
              fontSize: '28rpx',
              marginRight: '12rpx'
            },
            children: CUSTOMER_TYPES[typeIndex].label
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            style: {
              color: '#ccc',
              fontSize: '24rpx'
            },
            children: "\u203A"
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '28rpx 32rpx',
          borderBottom: '1rpx solid #f0f1f3'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
          style: {
            width: '140rpx',
            color: '#666',
            fontSize: '28rpx',
            flexShrink: 0
          },
          children: ["\u59D3\u540D ", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            style: {
              color: '#f5222d'
            },
            children: "*"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Input, {
          style: {
            flex: 1,
            fontSize: '28rpx',
            color: '#1a1d21'
          },
          placeholder: "\u8BF7\u8F93\u5165\u59D3\u540D",
          placeholderStyle: "color:#bbb",
          maxlength: 50,
          value: form.name,
          onInput: function onInput(e) {
            return setForm((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])({}, form), {}, {
              name: e.detail.value
            }));
          }
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '28rpx 32rpx',
          borderBottom: '1rpx solid #f0f1f3'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
          style: {
            width: '140rpx',
            color: '#666',
            fontSize: '28rpx',
            flexShrink: 0
          },
          children: ["\u624B\u673A\u53F7 ", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
            style: {
              color: '#f5222d'
            },
            children: "*"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Input, {
          style: {
            flex: 1,
            fontSize: '28rpx',
            color: '#1a1d21'
          },
          type: "number",
          placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7",
          placeholderStyle: "color:#bbb",
          maxlength: 11,
          value: form.phone,
          onInput: function onInput(e) {
            return setForm((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])({}, form), {}, {
              phone: e.detail.value
            }));
          }
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '28rpx 32rpx',
          borderBottom: '1rpx solid #f0f1f3'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
          style: {
            width: '140rpx',
            color: '#666',
            fontSize: '28rpx',
            flexShrink: 0
          },
          children: "\u5FAE\u4FE1\u53F7"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Input, {
          style: {
            flex: 1,
            fontSize: '28rpx',
            color: '#1a1d21'
          },
          placeholder: "\u9009\u586B",
          placeholderStyle: "color:#bbb",
          maxlength: 64,
          value: form.wechat,
          onInput: function onInput(e) {
            return setForm((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])({}, form), {}, {
              wechat: e.detail.value
            }));
          }
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          padding: '28rpx 32rpx'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Text, {
          style: {
            width: '140rpx',
            color: '#666',
            fontSize: '28rpx',
            flexShrink: 0,
            paddingTop: '4rpx'
          },
          children: "\u5907\u6CE8"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Input, {
          style: {
            flex: 1,
            fontSize: '28rpx',
            color: '#1a1d21'
          },
          placeholder: "\u9009\u586B\uFF0C\u4F8B\u5982\uFF1A\u610F\u5411\u4EA7\u54C1\u6216\u9700\u6C42\u8BF4\u660E",
          placeholderStyle: "color:#bbb",
          maxlength: 200,
          value: form.notes,
          onInput: function onInput(e) {
            return setForm((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_8__["default"])({}, form), {}, {
              notes: e.detail.value
            }));
          }
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.View, {
      style: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        padding: '24rpx 32rpx',
        borderTop: '1rpx solid #f0f1f3'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__.Button, {
        disabled: !!inviterError || submitting,
        style: {
          background: inviterError ? '#ccc' : '#00a3a3',
          color: '#fff',
          borderRadius: '12rpx',
          fontSize: '30rpx'
        },
        loading: submitting,
        onClick: handleSubmit,
        children: "\u63D0\u4EA4\u4FE1\u606F"
      })
    })]
  });
}

/***/ }),

/***/ "./src/pages/register/index.tsx":
/*!**************************************!*\
  !*** ./src/pages/register/index.tsx ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_register_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/register/index!./index.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/register/index!./src/pages/register/index.tsx");


var config = {"navigationBarTitleText":"信息登记","navigationBarBackgroundColor":"#00a3a3","navigationBarTextStyle":"white"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_register_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/register/index', {root:{cn:[]}}, config || {})
if (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_register_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"] && _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_register_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_register_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_register_index_index_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ }),

/***/ "./src/services/invite.ts":
/*!********************************!*\
  !*** ./src/services/invite.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   inviteApi: function() { return /* binding */ inviteApi; }
/* harmony export */ });
/* harmony import */ var _request__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./request */ "./src/services/request.ts");

var inviteApi = {
  getInviter: function getInviter(shareCode) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.get("/public/invite/".concat(shareCode));
  },
  register: function register(data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.post('/public/register', data, false);
  }
};

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/register/index.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=index.js.map