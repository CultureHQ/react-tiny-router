"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TinyRouter = exports.Link = exports.withRouter = exports.History = void 0;

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _React$createContext = _react.default.createContext({
  currentPath: "",
  onLinkClick: function onLinkClick() {},
  onPathChange: function onPathChange() {},
  onPathReplace: function onPathReplace() {}
}),
    Provider = _React$createContext.Provider,
    Consumer = _React$createContext.Consumer;

var History =
/*#__PURE__*/
function (_Component) {
  _inherits(History, _Component);

  function History() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, History);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(History)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "handleLinkClick", function (event) {
      event.preventDefault();

      _this.handlePathChange(event.currentTarget.pathname);
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "handlePathChange", function (nextPath) {
      _this.setState({
        currentPath: nextPath
      });

      window.history.pushState({}, "", nextPath);
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "handlePathReplace", function (nextPath) {
      _this.setState({
        currentPath: nextPath
      });

      window.history.replaceState({}, "", nextPath);
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "state", {
      currentPath: window.location.pathname,
      onLinkClick: _this.handleLinkClick,
      onPathChange: _this.handlePathChange,
      onPathReplace: _this.handlePathReplace
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "handlePopState", function (_ref) {
      var location = _ref.currentTarget.location;

      _this.setState({
        currentPath: location.pathname
      });
    });

    return _this;
  }

  _createClass(History, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      window.addEventListener("popstate", this.handlePopState);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("popstate", this.handlePopState);
    }
  }, {
    key: "render",
    value: function render() {
      var children = this.props.children;
      return _react.default.createElement(Provider, {
        value: this.state
      }, children);
    }
  }]);

  return History;
}(_react.Component);

exports.History = History;

var withRouter = function withRouter(Child) {
  return function (props) {
    return _react.default.createElement(Consumer, null, function (state) {
      return _react.default.createElement(Child, _extends({}, state, props));
    });
  };
};

exports.withRouter = withRouter;

var Link = function Link(_ref2) {
  var to = _ref2.to,
      children = _ref2.children,
      props = _objectWithoutProperties(_ref2, ["to", "children"]);

  return _react.default.createElement(Consumer, null, function (_ref3) {
    var onLinkClick = _ref3.onLinkClick;
    return _react.default.createElement("a", _extends({}, props, {
      href: to,
      onClick: onLinkClick
    }), children);
  });
};

exports.Link = Link;

var match = function match(ast, currentPath) {
  var segments = currentPath.split("/").filter(Boolean);
  var dynamics = [];
  var currentAst = ast;
  var matched = true;

  for (var idx = 0; idx < segments.length; idx += 1) {
    if (currentAst.next[segments[idx]]) {
      currentAst = currentAst.next[segments[idx]];
    } else if (currentAst.next[":dynamic"]) {
      dynamics.push(segments[idx]);
      currentAst = currentAst.next[":dynamic"];
    } else {
      matched = false;
      break;
    }
  }

  matched = matched && currentAst.render;

  if (!matched && ast.default) {
    return ast.default();
  }

  if (!matched) {
    return null;
  }

  return currentAst.render.apply(null, dynamics);
};

var TinyRouter = function TinyRouter(_ref4) {
  var ast = _ref4.ast;
  return _react.default.createElement(Consumer, null, function (_ref5) {
    var currentPath = _ref5.currentPath;
    return match(ast, currentPath);
  });
};

exports.TinyRouter = TinyRouter;