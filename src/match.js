const match = (ast, currentPath) => {
  const segments = currentPath.split("/").filter(Boolean);
  const dynamics = [];

  let currentAst = ast;
  let matched = true;

  for (let idx = 0; idx < segments.length; idx += 1) {
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

export default match;
