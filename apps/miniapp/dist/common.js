"use strict";
(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["common"],{

/***/ "./src/services/customers.ts":
/*!***********************************!*\
  !*** ./src/services/customers.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   customersApi: function() { return /* binding */ customersApi; }
/* harmony export */ });
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _request__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./request */ "./src/services/request.ts");
/* provided dependency */ var URLSearchParams = __webpack_require__(/*! @tarojs/runtime */ "webpack/container/remote/@tarojs/runtime")["URLSearchParams"];



var customersApi = {
  getAll: function () {
    var _getAll = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().m(function _callee(params) {
      var _data;
      var qs, res;
      return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            qs = params ? new URLSearchParams(params).toString() : '';
            _context.n = 1;
            return _request__WEBPACK_IMPORTED_MODULE_0__.http.get("/customers".concat(qs ? "?".concat(qs) : ''));
          case 1:
            res = _context.v;
            return _context.a(2, Array.isArray(res) ? res : (_data = res.data) !== null && _data !== void 0 ? _data : []);
        }
      }, _callee);
    }));
    function getAll(_x) {
      return _getAll.apply(this, arguments);
    }
    return getAll;
  }(),
  getOne: function getOne(id) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.get("/customers/".concat(id));
  },
  create: function create(data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.post('/customers', data);
  },
  update: function update(id, data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.patch("/customers/".concat(id), data);
  }
};

/***/ }),

/***/ "./src/services/memberships.ts":
/*!*************************************!*\
  !*** ./src/services/memberships.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   membershipsApi: function() { return /* binding */ membershipsApi; }
/* harmony export */ });
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _request__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./request */ "./src/services/request.ts");



var membershipsApi = {
  getAll: function () {
    var _getAll = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().m(function _callee() {
      var res;
      return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return _request__WEBPACK_IMPORTED_MODULE_0__.http.get('/memberships');
          case 1:
            res = _context.v;
            return _context.a(2, Array.isArray(res) ? {
              data: res,
              total: res.length
            } : res);
        }
      }, _callee);
    }));
    function getAll() {
      return _getAll.apply(this, arguments);
    }
    return getAll;
  }(),
  getPending: function () {
    var _getPending = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().m(function _callee2() {
      var _data;
      var res;
      return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            _context2.n = 1;
            return _request__WEBPACK_IMPORTED_MODULE_0__.http.get('/memberships/pending');
          case 1:
            res = _context2.v;
            return _context2.a(2, Array.isArray(res) ? res : (_data = res.data) !== null && _data !== void 0 ? _data : []);
        }
      }, _callee2);
    }));
    function getPending() {
      return _getPending.apply(this, arguments);
    }
    return getPending;
  }(),
  getMemberLevels: function () {
    var _getMemberLevels = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_1__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().m(function _callee3() {
      var _data2;
      var res;
      return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_2__["default"])().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            _context3.n = 1;
            return _request__WEBPACK_IMPORTED_MODULE_0__.http.get('/member-levels');
          case 1:
            res = _context3.v;
            return _context3.a(2, Array.isArray(res) ? res : (_data2 = res.data) !== null && _data2 !== void 0 ? _data2 : []);
        }
      }, _callee3);
    }));
    function getMemberLevels() {
      return _getMemberLevels.apply(this, arguments);
    }
    return getMemberLevels;
  }(),
  create: function create(data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.post('/memberships', data);
  },
  resubmit: function resubmit(id, data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.patch("/memberships/".concat(id, "/resubmit"), data);
  },
  approve: function approve(id, data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.patch("/memberships/".concat(id, "/approve"), data);
  },
  reject: function reject(id, data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.patch("/memberships/".concat(id, "/reject"), data);
  },
  requestRefund: function requestRefund(id, data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.post("/memberships/".concat(id, "/refund"), data);
  },
  approveRefund: function approveRefund(id) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.patch("/memberships/".concat(id, "/refund/approve"));
  },
  rejectRefund: function rejectRefund(id, data) {
    return _request__WEBPACK_IMPORTED_MODULE_0__.http.patch("/memberships/".concat(id, "/refund/reject"), data);
  }
};

/***/ }),

/***/ "./src/services/request.ts":
/*!*********************************!*\
  !*** ./src/services/request.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   http: function() { return /* binding */ http; }
/* harmony export */ });
/* unused harmony export ApiError */
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/regenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_createClass_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/createClass.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_classCallCheck_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/classCallCheck.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_callSuper_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/callSuper.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/callSuper.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_inherits_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/inherits.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_wrapNativeSuper_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js");
/* harmony import */ var _Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_defineProperty_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/defineProperty.js */ "../../node_modules/.pnpm/@babel+runtime@7.29.7/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/storage */ "./src/utils/storage.ts");










var BASE_URL = "http://localhost:4100/api" || 0;
var ApiError = /*#__PURE__*/function (_Error) {
  function ApiError(message, status) {
    var _this;
    (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_classCallCheck_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this, ApiError);
    _this = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_callSuper_js__WEBPACK_IMPORTED_MODULE_3__["default"])(this, ApiError, [message]);
    (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_defineProperty_js__WEBPACK_IMPORTED_MODULE_4__["default"])(_this, "status", void 0);
    _this.status = status;
    return _this;
  }
  (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_inherits_js__WEBPACK_IMPORTED_MODULE_5__["default"])(ApiError, _Error);
  return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_createClass_js__WEBPACK_IMPORTED_MODULE_6__["default"])(ApiError);
}(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_wrapNativeSuper_js__WEBPACK_IMPORTED_MODULE_7__["default"])(Error));
function request(_x) {
  return _request.apply(this, arguments);
}
function _request() {
  _request = (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_asyncToGenerator_js__WEBPACK_IMPORTED_MODULE_8__["default"])(/*#__PURE__*/(0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_9__["default"])().m(function _callee(path) {
    var options,
      _options$method,
      method,
      data,
      _options$auth,
      auth,
      header,
      token,
      res,
      _message,
      _res$data,
      msg,
      _args = arguments;
    return (0,_Users_peakom_workbd_system_space_station_node_modules_pnpm_babel_runtime_7_29_7_node_modules_babel_runtime_helpers_esm_regenerator_js__WEBPACK_IMPORTED_MODULE_9__["default"])().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          options = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
          _options$method = options.method, method = _options$method === void 0 ? 'GET' : _options$method, data = options.data, _options$auth = options.auth, auth = _options$auth === void 0 ? true : _options$auth;
          header = {
            'Content-Type': 'application/json'
          };
          if (auth) {
            token = _utils_storage__WEBPACK_IMPORTED_MODULE_1__.storage.getToken();
            if (token) header['Authorization'] = "Bearer ".concat(token);
          }
          _context.n = 1;
          return _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().request({
            url: "".concat(BASE_URL).concat(path),
            method: method,
            data: data !== null && data !== void 0 ? data : undefined,
            header: header
          });
        case 1:
          res = _context.v;
          if (!(res.statusCode === 401 && auth)) {
            _context.n = 2;
            break;
          }
          _utils_storage__WEBPACK_IMPORTED_MODULE_1__.storage.clear();
          _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().reLaunch({
            url: '/pages/login/index'
          });
          throw new ApiError('未授权，请重新登录', 401);
        case 2:
          if (!(res.statusCode >= 400)) {
            _context.n = 3;
            break;
          }
          msg = (_message = (_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.message) !== null && _message !== void 0 ? _message : '请求失败';
          throw new ApiError(Array.isArray(msg) ? msg[0] : msg, res.statusCode);
        case 3:
          return _context.a(2, res.data);
      }
    }, _callee);
  }));
  return _request.apply(this, arguments);
}
var http = {
  get: function get(path) {
    return request(path);
  },
  post: function post(path, data) {
    var auth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    return request(path, {
      method: 'POST',
      data: data,
      auth: auth
    });
  },
  patch: function patch(path, data) {
    return request(path, {
      method: 'PATCH',
      data: data
    });
  },
  delete: function _delete(path) {
    return request(path, {
      method: 'DELETE'
    });
  }
};

/***/ }),

/***/ "./src/store/auth.ts":
/*!***************************!*\
  !*** ./src/store/auth.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAuthStore: function() { return /* binding */ useAuthStore; }
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand */ "webpack/container/remote/zustand");
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(zustand__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_storage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/storage */ "./src/utils/storage.ts");


var useAuthStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__.create)(function (set, get) {
  return {
    token: _utils_storage__WEBPACK_IMPORTED_MODULE_1__.storage.getToken(),
    user: _utils_storage__WEBPACK_IMPORTED_MODULE_1__.storage.getUser(),
    setAuth: function setAuth(token, user) {
      _utils_storage__WEBPACK_IMPORTED_MODULE_1__.storage.setToken(token);
      _utils_storage__WEBPACK_IMPORTED_MODULE_1__.storage.setUser(user);
      set({
        token: token,
        user: user
      });
    },
    logout: function logout() {
      _utils_storage__WEBPACK_IMPORTED_MODULE_1__.storage.clear();
      set({
        token: null,
        user: null
      });
    },
    isLoggedIn: function isLoggedIn() {
      return !!get().token;
    }
  };
});

/***/ }),

/***/ "./src/utils/storage.ts":
/*!******************************!*\
  !*** ./src/utils/storage.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   storage: function() { return /* binding */ storage; }
/* harmony export */ });
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/taro */ "webpack/container/remote/@tarojs/taro");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_0__);

var TOKEN_KEY = 'auth_token';
var USER_KEY = 'auth_user';
var storage = {
  getToken: function getToken() {
    try {
      return _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(TOKEN_KEY) || null;
    } catch (_unused) {
      return null;
    }
  },
  setToken: function setToken(token) {
    return _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(TOKEN_KEY, token);
  },
  removeToken: function removeToken() {
    return _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().removeStorageSync(TOKEN_KEY);
  },
  getUser: function getUser() {
    try {
      var raw = _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().getStorageSync(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_unused2) {
      return null;
    }
  },
  setUser: function setUser(user) {
    return _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().setStorageSync(USER_KEY, JSON.stringify(user));
  },
  removeUser: function removeUser() {
    return _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().removeStorageSync(USER_KEY);
  },
  clear: function clear() {
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().removeStorageSync(TOKEN_KEY);
    _tarojs_taro__WEBPACK_IMPORTED_MODULE_0___default().removeStorageSync(USER_KEY);
  }
};

/***/ })

}]);
//# sourceMappingURL=common.js.map