"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/customers/detail"],{

/***/ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/detail!./src/pages/customers/detail.tsx":
/*!***********************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/detail!./src/pages/customers/detail.tsx ***!
  \***********************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ CustomerDetailPage; }
/* harmony export */ });
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_defineProperty_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/defineProperty.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/objectSpread2.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/objectSpread2.js");
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











var SOURCE_OPTIONS = [{
  label: '转介绍',
  value: 'REFERRAL'
}, {
  label: '自主开发',
  value: 'SELF_DEVELOPED'
}, {
  label: '活动获客',
  value: 'ACTIVITY'
}, {
  label: '线上渠道',
  value: 'ONLINE'
}, {
  label: '其他',
  value: 'OTHER'
}];
var STATUS_LABELS = {
  PENDING: '待审核',
  APPROVED: '有效',
  REJECTED: '已拒绝',
  EXPIRED: '已到期',
  REFUND_PENDING: '退款中',
  REFUNDED: '已退款'
};
var STATUS_CLASS = {
  PENDING: 'tag--pending',
  APPROVED: 'tag--approved',
  REJECTED: 'tag--rejected',
  EXPIRED: 'tag--expired',
  REFUND_PENDING: 'tag--pending',
  REFUNDED: 'tag--expired'
};
function CustomerDetailPage() {
  var _SOURCE_OPTIONS$find, _customer$memberships, _customer$memberships2;
  var router = (0,_tarojs_taro__WEBPACK_IMPORTED_MODULE_1__.useRouter)();
  var _router$params = router.params,
    id = _router$params.id,
    mode = _router$params.mode;
  var isCreate = mode === 'create';
  var user = (0,_store_auth__WEBPACK_IMPORTED_MODULE_3__.useAuthStore)(function (s) {
    return s.user;
  });
  var _useState = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null),
    _useState2 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState, 2),
    customer = _useState2[0],
    setCustomer = _useState2[1];
  var _useState3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(!isCreate),
    _useState4 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(isCreate),
    _useState6 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState5, 2),
    editing = _useState6[0],
    setEditing = _useState6[1];
  var _useState7 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false),
    _useState8 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState7, 2),
    saving = _useState8[0],
    setSaving = _useState8[1];
  var _useState9 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
      name: '',
      phone: '',
      customerType: 'INDIVIDUAL',
      source: 'OTHER',
      tags: '',
      notes: '',
      wechat: ''
    }),
    _useState0 = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_slicedToArray_js__WEBPACK_IMPORTED_MODULE_5__["default"])(_useState9, 2),
    form = _useState0[0],
    setForm = _useState0[1];
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(function () {
    if (!isCreate && id) {
      _services_customers__WEBPACK_IMPORTED_MODULE_2__.customersApi.getOne(id).then(function (data) {
        var _data$tags, _data$notes, _data$wechat;
        setCustomer(data);
        setForm({
          name: data.name,
          phone: data.phone,
          customerType: data.customerType,
          source: data.source,
          tags: (_data$tags = data.tags) !== null && _data$tags !== void 0 ? _data$tags : '',
          notes: (_data$notes = data.notes) !== null && _data$notes !== void 0 ? _data$notes : '',
          wechat: (_data$wechat = data.wechat) !== null && _data$wechat !== void 0 ? _data$wechat : ''
        });
        setLoading(false);
      }).catch(function () {
        _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
          title: '加载失败',
          icon: 'none'
        });
        setLoading(false);
      });
    }
  }, [id]);
  var handleSave = /*#__PURE__*/function () {
    var _ref = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_6__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_7__["default"])().m(function _callee() {
      var _t;
      return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_7__["default"])().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!(!form.name || !form.phone)) {
              _context.n = 1;
              break;
            }
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: '姓名和手机号必填',
              icon: 'none'
            });
            return _context.a(2);
          case 1:
            setSaving(true);
            _context.p = 2;
            if (!isCreate) {
              _context.n = 4;
              break;
            }
            _context.n = 3;
            return _services_customers__WEBPACK_IMPORTED_MODULE_2__.customersApi.create(form);
          case 3:
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: '创建成功',
              icon: 'success'
            });
            setTimeout(function () {
              return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().navigateBack();
            }, 1500);
            _context.n = 6;
            break;
          case 4:
            _context.n = 5;
            return _services_customers__WEBPACK_IMPORTED_MODULE_2__.customersApi.update(id, form);
          case 5:
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: '保存成功',
              icon: 'success'
            });
            setEditing(false);
            _services_customers__WEBPACK_IMPORTED_MODULE_2__.customersApi.getOne(id).then(setCustomer);
          case 6:
            _context.n = 8;
            break;
          case 7:
            _context.p = 7;
            _t = _context.v;
            _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().showToast({
              title: _t.message || '操作失败',
              icon: 'none'
            });
          case 8:
            _context.p = 8;
            setSaving(false);
            return _context.f(8);
          case 9:
            return _context.a(2);
        }
      }, _callee, null, [[2, 7, 8, 9]]);
    }));
    return function handleSave() {
      return _ref.apply(this, arguments);
    };
  }();
  if (loading) return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
    className: "loading",
    children: "\u52A0\u8F7D\u4E2D\u2026"
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
    className: "page",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.ScrollView, {
      scrollY: true,
      style: {
        height: '100vh'
      },
      children: editing ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
        style: {
          paddingBottom: '160rpx'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "section-title",
          children: "\u57FA\u672C\u4FE1\u606F"
        }), [{
          label: '姓名',
          key: 'name',
          placeholder: '请输入姓名'
        }, {
          label: '手机',
          key: 'phone',
          placeholder: '请输入手机号'
        }, {
          label: '微信',
          key: 'wechat',
          placeholder: '微信号（选填）'
        }, {
          label: '标签',
          key: 'tags',
          placeholder: '多个标签用逗号分隔'
        }].map(function (_ref2) {
          var label = _ref2.label,
            key = _ref2.key,
            placeholder = _ref2.placeholder;
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            className: "field",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              className: "field__label",
              children: label
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Input, {
              className: "field__input",
              placeholder: placeholder,
              value: form[key],
              onInput: function onInput(e) {
                return setForm((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_9__["default"])((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_9__["default"])({}, form), {}, (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_defineProperty_js__WEBPACK_IMPORTED_MODULE_10__["default"])({}, key, e.detail.value)));
              }
            })]
          }, key);
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "field",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
            className: "field__label",
            children: "\u5907\u6CE8"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Textarea, {
            style: {
              width: '100%',
              fontSize: '28rpx',
              minHeight: '120rpx'
            },
            placeholder: "\u5907\u6CE8\uFF08\u9009\u586B\uFF09",
            value: form.notes,
            onInput: function onInput(e) {
              return setForm((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_9__["default"])((0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_objectSpread2_js__WEBPACK_IMPORTED_MODULE_9__["default"])({}, form), {}, {
                notes: e.detail.value
              }));
            }
          })]
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.Fragment, {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "card",
          style: {
            margin: '24rpx'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16rpx'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              style: {
                fontSize: '36rpx',
                fontWeight: '700'
              },
              children: customer === null || customer === void 0 ? void 0 : customer.name
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              className: "tag",
              children: (customer === null || customer === void 0 ? void 0 : customer.customerType) === 'INDIVIDUAL' ? '个人' : '企业'
            })]
          }), [{
            label: '手机',
            value: customer === null || customer === void 0 ? void 0 : customer.phone
          }, {
            label: '微信',
            value: customer === null || customer === void 0 ? void 0 : customer.wechat
          }, {
            label: '来源',
            value: (_SOURCE_OPTIONS$find = SOURCE_OPTIONS.find(function (s) {
              return s.value === (customer === null || customer === void 0 ? void 0 : customer.source);
            })) === null || _SOURCE_OPTIONS$find === void 0 ? void 0 : _SOURCE_OPTIONS$find.label
          }, {
            label: '标签',
            value: customer === null || customer === void 0 ? void 0 : customer.tags
          }, {
            label: '备注',
            value: customer === null || customer === void 0 ? void 0 : customer.notes
          }].map(function (_ref3) {
            var label = _ref3.label,
              value = _ref3.value;
            return value ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              className: "row",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
                className: "row__label",
                children: label
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
                className: "row__value",
                children: value
              })]
            }, label) : null;
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "section-title",
          children: "\u4F1A\u5458\u8BB0\u5F55"
        }), ((_customer$memberships = customer === null || customer === void 0 ? void 0 : customer.memberships) !== null && _customer$memberships !== void 0 ? _customer$memberships : []).length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          className: "empty",
          children: "\u6682\u65E0\u4F1A\u5458\u8BB0\u5F55"
        }) : ((_customer$memberships2 = customer === null || customer === void 0 ? void 0 : customer.memberships) !== null && _customer$memberships2 !== void 0 ? _customer$memberships2 : []).map(function (m) {
          var _m$memberLevel$name, _m$memberLevel, _STATUS_CLASS$m$statu, _STATUS_LABELS$m$stat, _m$startDate, _m$endDate;
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
            className: "card",
            style: {
              margin: '0 24rpx 16rpx',
              cursor: 'pointer'
            },
            onClick: function onClick() {
              return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().navigateTo({
                url: "/pages/memberships/detail?id=".concat(m.id)
              });
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8rpx'
              },
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
                style: {
                  fontWeight: '600'
                },
                children: (_m$memberLevel$name = (_m$memberLevel = m.memberLevel) === null || _m$memberLevel === void 0 ? void 0 : _m$memberLevel.name) !== null && _m$memberLevel$name !== void 0 ? _m$memberLevel$name : '会员'
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
                className: "tag ".concat((_STATUS_CLASS$m$statu = STATUS_CLASS[m.status]) !== null && _STATUS_CLASS$m$statu !== void 0 ? _STATUS_CLASS$m$statu : ''),
                children: (_STATUS_LABELS$m$stat = STATUS_LABELS[m.status]) !== null && _STATUS_LABELS$m$stat !== void 0 ? _STATUS_LABELS$m$stat : m.status
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Text, {
              style: {
                fontSize: '26rpx',
                color: '#888'
              },
              children: ["\xA5", Number(m.fee).toLocaleString(), " \xB7 ", (_m$startDate = m.startDate) === null || _m$startDate === void 0 ? void 0 : _m$startDate.slice(0, 10), " ~ ", (_m$endDate = m.endDate) === null || _m$endDate === void 0 ? void 0 : _m$endDate.slice(0, 10)]
            })]
          }, m.id);
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
          style: {
            padding: '24rpx'
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
            style: {
              background: '#00a3a3',
              color: '#fff',
              borderRadius: '12rpx',
              marginBottom: '16rpx'
            },
            onClick: function onClick() {
              return _tarojs_taro__WEBPACK_IMPORTED_MODULE_1___default().navigateTo({
                url: "/pages/memberships/create?customerId=".concat(customer === null || customer === void 0 ? void 0 : customer.id, "&customerName=").concat(customer === null || customer === void 0 ? void 0 : customer.name)
              });
            },
            children: "\u63D0\u4EA4\u4F1A\u5458\u7533\u8BF7"
          })
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.View, {
      style: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        padding: '24rpx 32rpx',
        borderTop: '1rpx solid #f0f1f3',
        display: 'flex',
        gap: '16rpx'
      },
      children: editing ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.Fragment, {
        children: [!isCreate && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
          style: {
            flex: 1,
            background: '#f5f6f8',
            color: '#666',
            borderRadius: '12rpx'
          },
          onClick: function onClick() {
            return setEditing(false);
          },
          children: "\u53D6\u6D88"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
          style: {
            flex: 2,
            background: '#00a3a3',
            color: '#fff',
            borderRadius: '12rpx'
          },
          loading: saving,
          onClick: handleSave,
          children: "\u4FDD\u5B58"
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__.Button, {
        style: {
          flex: 1,
          background: '#00a3a3',
          color: '#fff',
          borderRadius: '12rpx'
        },
        onClick: function onClick() {
          return setEditing(true);
        },
        children: "\u7F16\u8F91"
      })
    })]
  });
}

/***/ }),

/***/ "./src/pages/customers/detail.tsx":
/*!****************************************!*\
  !*** ./src/pages/customers/detail.tsx ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime");
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_detail_detail_tsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../../../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/detail!./detail.tsx */ "../../node_modules/.pnpm/@tarojs+taro-loader@4.2.1_webpack@5.97.1_@swc+core@1.3.96_lightningcss@1.33.0_postcss@8.5.20_/node_modules/@tarojs/taro-loader/lib/entry-cache.js?name=pages/customers/detail!./src/pages/customers/detail.tsx");


var config = {"navigationBarTitleText":"客户详情"};



var taroOption = (0,_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__.createPageConfig)(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_detail_detail_tsx__WEBPACK_IMPORTED_MODULE_1__["default"], 'pages/customers/detail', {root:{cn:[]}}, config || {})
if (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_detail_detail_tsx__WEBPACK_IMPORTED_MODULE_1__["default"] && _node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_detail_detail_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors) {
  taroOption.behaviors = (taroOption.behaviors || []).concat(_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_detail_detail_tsx__WEBPACK_IMPORTED_MODULE_1__["default"].behaviors)
}
var inst = Page(taroOption)



/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_pnpm_tarojs_taro_loader_4_2_1_webpack_5_97_1_swc_core_1_3_96_lightningcss_1_33_0_postcss_8_5_20_node_modules_tarojs_taro_loader_lib_entry_cache_js_name_pages_customers_detail_detail_tsx__WEBPACK_IMPORTED_MODULE_1__["default"]);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, ["taro","vendors","common"], function() { return __webpack_exec__("./src/pages/customers/detail.tsx"); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=detail.js.map