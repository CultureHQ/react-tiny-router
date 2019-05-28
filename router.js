"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TinyRouter = exports.Link = exports.History = exports.useRouter = void 0;

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var RouterContext = _react["default"].createContext({
  currentPath: "/",
  onLinkClick: function onLinkClick() {},
  onPathChange: function onPathChange() {},
  onPathReplace: function onPathReplace() {}
});

var useRouter = function useRouter() {
  return (0, _react.useContext)(RouterContext);
};

exports.useRouter = useRouter;

var History = function History(_ref) {
  var children = _ref.children;

  var _useState = (0, _react.useState)(window.location.pathname),
      _useState2 = _slicedToArray(_useState, 2),
      currentPath = _useState2[0],
      setCurrentPath = _useState2[1];

  var value = (0, _react.useMemo)(function () {
    return {
      currentPath: currentPath,
      onLinkClick: function onLinkClick(event) {
        event.preventDefault();
        setCurrentPath(event.currentTarget.pathname);
      },
      onPathChange: function onPathChange(nextPath) {
        setCurrentPath(nextPath);
        window.history.pushState({}, "", nextPath);
      },
      onPathReplace: function onPathReplace(nextPath) {
        setCurrentPath(nextPath);
        window.history.replaceState({}, "", nextPath);
      }
    };
  }, [currentPath, setCurrentPath]);
  (0, _react.useEffect)(function () {
    var onEvent = function onEvent(event) {
      return setCurrentPath(event.currentTarget.location.pathname);
    };

    window.addEventListener("popstate", onEvent);
    return function () {
      return window.removeEventListener("popstate", onEvent);
    };
  }, [setCurrentPath]);
  return _react["default"].createElement(RouterContext.Provider, {
    value: value
  }, children);
};

exports.History = History;

var Link = function Link(_ref2) {
  var to = _ref2.to,
      children = _ref2.children,
      props = _objectWithoutProperties(_ref2, ["to", "children"]);

  var _useRouter = useRouter(),
      onLinkClick = _useRouter.onLinkClick; // eslint-disable-next-line react/jsx-props-no-spreading


  return _react["default"].createElement("a", _extends({}, props, {
    href: to,
    onClick: onLinkClick
  }), children);
};

exports.Link = Link;

var TinyRouter = function TinyRouter(_ref3) {
  var ast = _ref3.ast;

  var _useRouter2 = useRouter(),
      currentPath = _useRouter2.currentPath;

  var segments = currentPath.split("/").filter(Boolean);
  var dynamics = [];
  var node = ast;
  var matched = true;

  for (var idx = 0; idx < segments.length; idx += 1) {
    if (node.next[segments[idx]]) {
      node = node.next[segments[idx]];
    } else if (node.next[":dynamic"]) {
      dynamics.push(segments[idx]);
      node = node.next[":dynamic"];
    } else {
      matched = false;
      break;
    }
  }

  matched = matched && node.render;

  if (!matched && ast["default"]) {
    return ast["default"]();
  }

  if (!matched) {
    return null;
  }

  return node.render.apply(null, dynamics);
};

exports.TinyRouter = TinyRouter;