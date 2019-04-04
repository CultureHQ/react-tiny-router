"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// eslint-disable-next-line import/no-extraneous-dependencies
var _require = require("babel-plugin-macros"),
    createMacro = _require.createMacro,
    MacroError = _require.MacroError;

var hasOwnProperty = Object.prototype.hasOwnProperty;

var buildTinyRouterOpening = function buildTinyRouterOpening(t, routerIdent, ast) {
  return t.jsxOpeningElement(routerIdent, [t.jsxAttribute(t.jsxIdentifier("ast"), t.jsxExpressionContainer(ast))], true);
};

var buildTinyRouter = function buildTinyRouter(t, routerIdent, ast) {
  return t.jsxElement(buildTinyRouterOpening(t, routerIdent, ast), null, [], true);
};

var buildDynamicProp = function buildDynamicProp(t, prop) {
  return t.jsxAttribute(t.jsxIdentifier(prop), t.jsxExpressionContainer(t.identifier(prop)));
};

var buildRenderFunc = function buildRenderFunc(t, props, rendered) {
  return t.functionExpression(null, props.map(function (prop) {
    return t.identifier(prop);
  }), t.blockStatement([t.returnStatement(rendered)]));
};

var buildASTExpression = function buildASTExpression(t, ast) {
  var properties = Object.keys(ast).map(function (key) {
    var value = ast[key];

    if (!value.type) {
      switch (_typeof(value)) {
        case "object":
          value = buildASTExpression(t, value);
          break;

        case "number":
          value = t.numericLiteral(value);
          break;

        case "string":
          value = t.stringLiteral(value);
          break;

        default:
          break;
      }
    }

    return t.objectProperty(t.stringLiteral(key), value);
  });
  return t.objectExpression(properties);
};

var extractProp = function extractProp(element, prop) {
  var attributes = element.openingElement.attributes;
  var index = attributes.findIndex(function (_ref) {
    var name = _ref.name.name;
    return name === prop;
  });

  if (index !== -1) {
    var value = attributes.splice(index, 1)[0].value;
    return value && value.value;
  }

  return null;
};

var addToAST = function addToAST(t, routingAST, childNode) {
  var path = extractProp(childNode, "path");
  var segments = path.split("/").filter(Boolean);
  var currentTree = routingAST;
  var props = [];
  segments.forEach(function (segment) {
    var normalized = segment;

    if (normalized.startsWith(":")) {
      props.push(normalized.slice(1));
      normalized = ":dynamic";
    }

    if (!hasOwnProperty.call(currentTree.next, normalized)) {
      currentTree.next[normalized] = {
        next: {}
      };
    }

    currentTree = currentTree.next[normalized];
  });

  if (hasOwnProperty.call(currentTree, "render")) {
    throw new MacroError("".concat(path, " has an overlapping route"));
  }

  props.forEach(function (prop) {
    return childNode.openingElement.attributes.push(buildDynamicProp(t, prop));
  });
  currentTree.render = buildRenderFunc(t, props, childNode);
};

var buildAST = function buildAST(t, declaration) {
  var ast = {
    next: {}
  };
  var children = declaration.node.children.filter(function (_ref2) {
    var type = _ref2.type;
    return type === "JSXElement";
  });
  var defaultIndex = children.findIndex(function (node) {
    return node.openingElement.attributes.some(function (attribute) {
      return attribute.name.name === "default";
    });
  });

  if (defaultIndex !== -1) {
    var defaultChild = children.splice(defaultIndex, 1)[0];
    extractProp(defaultChild, "default");
    ast["default"] = buildRenderFunc(t, [], defaultChild);
  }

  children.forEach(function (node) {
    return addToAST(t, ast, node);
  });
  return buildASTExpression(t, ast);
};

var routerMacro = function routerMacro(_ref3) {
  var references = _ref3.references,
      t = _ref3.babel.types;
  var _references$default = references["default"],
      routers = _references$default === void 0 ? [] : _references$default;
  var TinyRouter = routers[0].scope.getProgramParent().path.scope.bindings.TinyRouter;
  routers.forEach(function (router) {
    if (router.parent.type !== "JSXOpeningElement") {
      return;
    }

    TinyRouter.referenced = true;
    TinyRouter.references += 1;
    var declaration = router.parentPath.parentPath;
    var ast = buildAST(t, declaration);
    var routerIdent = Object.assign({}, TinyRouter.identifier, {
      type: "JSXIdentifier"
    });
    declaration.replaceWith(buildTinyRouter(t, routerIdent, ast));
  });
};

module.exports = createMacro(routerMacro);