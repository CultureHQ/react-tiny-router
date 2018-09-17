const { createMacro } = require("babel-plugin-macros");

const buildFastRouterOpening = (t, routerIdent, ast) => (
  t.jsxOpeningElement(
    routerIdent,
    [t.jsxAttribute(t.jsxIdentifier("ast"), t.jsxExpressionContainer(ast))],
    true
  )
);

const buildFastRouter = (t, routerIdent, ast) => (
  t.jsxElement(buildFastRouterOpening(t, routerIdent, ast), null, [], true)
);

const buildDynamicProp = (t, prop) => (
  t.jsxAttribute(
    t.jsxIdentifier(prop),
    t.jsxExpressionContainer(t.identifier(prop))
  )
);

const buildRenderFunc = (t, props, rendered) => (
  t.functionExpression(
    null,
    props.map(prop => t.identifier(prop)),
    t.blockStatement([t.returnStatement(rendered)])
  )
);

const buildASTExpression = (t, ast) => {
  const properties = Object.keys(ast).map(key => {
    let value = ast[key];

    if (!value.type) {
      switch (typeof value) {
        case "object":
          value = buildASTExpression(t, value);
          break;
        case "number":
          value = t.numericLiteral(value);
          break;
        case "string":
          value = t.stringLiteral(value);
          break;
      }
    }

    const objectKey = key.startsWith(":") ? t.stringLiteral(key) : t.identifier(key);
    return t.objectProperty(objectKey, value);
  });

  return t.objectExpression(properties);
};

const extractProp = (element, prop) => {
  const { attributes } = element.openingElement;
  const index = attributes.findIndex(({ name: { name } }) => name === prop);

  if (index !== -1) {
    const { value } = attributes.splice(index, 1)[0];
    return value && value.value;
  }

  return null;
};

const addToAST = (t, routingAST, childNode) => {
  const path = extractProp(childNode, "path");
  const segments = path.split("/").filter(Boolean);

  let currentTree = routingAST;
  const props = [];

  segments.forEach(segment => {
    let normalized = segment;

    if (normalized.startsWith(":")) {
      props.push(normalized.slice(1));
      normalized = ":dynamic";
    }

    if (!currentTree.next.hasOwnProperty(normalized)) {
      currentTree.next[normalized] = { next: {} };
    }

    currentTree = currentTree.next[normalized];
  });

  if (currentTree.hasOwnProperty("render")) {
    throw new Error(`${path} has an overlapping route`);
  }

  props.forEach(prop => childNode.openingElement.attributes.push(buildDynamicProp(t, prop)));
  currentTree.render = buildRenderFunc(t, props, childNode);
};

const buildAST = (t, declaration) => {
  const ast = { next: {} };

  const children = declaration.node.children.filter(({ type }) => type === "JSXElement");
  const defaultIndex = children.findIndex(node => (
    node.openingElement.attributes.some(attribute => attribute.name.name === "default")
  ));

  if (defaultIndex !== -1) {
    const defaultChild = children.splice(defaultIndex, 1)[0];
    extractProp(defaultChild, "default")

    ast.default = buildRenderFunc(t, [], defaultChild);
  }

  children.forEach(node => addToAST(t, ast, node));

  return buildASTExpression(t, ast);
};

const routerMacro = ({ references, babel: { types: t } }) => {
  const { default: routers = [] } = references;

  let index = 0;

  const { FastRouter } = routers[0].scope.getProgramParent().path.scope.bindings;

  routers.forEach(router => {
    if (router.parent.type !== "JSXOpeningElement") {
      return;
    }

    FastRouter.referenced = true;
    FastRouter.references += 1;

    const declaration = router.parentPath.parentPath;
    const ast = buildAST(t, declaration);

    const routerIdent = Object.assign({}, FastRouter.identifier, { type: "JSXIdentifier" });
    declaration.replaceWith(buildFastRouter(t, routerIdent, ast));
    index += 1;
  });
};

module.exports = createMacro(routerMacro);
