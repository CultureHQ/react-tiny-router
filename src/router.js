import React, { useContext, useEffect, useMemo, useState } from "react";

const RouterContext = React.createContext({
  currentPath: "/",
  onLinkClick: () => {},
  onPathChange: () => {},
  onPathReplace: () => {}
});

export const useRouter = () => useContext(RouterContext);

export const History = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const value = useMemo(
    () => ({
      currentPath,
      onLinkClick: event => {
        event.preventDefault();
        setCurrentPath(event.currentTarget.pathname);
        window.history.pushState({}, "", event.currentTarget.pathname);
      },
      onPathChange: nextPath => {
        setCurrentPath(nextPath);
        window.history.pushState({}, "", nextPath);
      },
      onPathReplace: nextPath => {
        setCurrentPath(nextPath);
        window.history.replaceState({}, "", nextPath);
      }
    }),
    [currentPath, setCurrentPath]
  );

  useEffect(
    () => {
      const onEvent = event => (
        setCurrentPath(event.currentTarget.location.pathname)
      );

      window.addEventListener("popstate", onEvent);
      return () => window.removeEventListener("popstate", onEvent);
    },
    [setCurrentPath]
  );

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

export const Link = ({ to, children, ...props }) => {
  const { onLinkClick } = useRouter();

  return <a {...props} href={to} onClick={onLinkClick}>{children}</a>;
};

export const TinyRouter = ({ ast }) => {
  const { currentPath } = useRouter();

  const segments = currentPath.split("/").filter(Boolean);
  const dynamics = [];

  let node = ast;
  let matched = true;

  for (let idx = 0; idx < segments.length; idx += 1) {
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
  if (!matched && ast.default) {
    return ast.default();
  }

  if (!matched) {
    return null;
  }

  return node.render.apply(null, dynamics);
};
