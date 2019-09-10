import * as React from "react";

type ContextValue = {
  currentPath: string;
  onLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onPathChange: (nextPath: string) => void;
  onPathReplace: (nextPath: string) => void;
};

const RouterContext = React.createContext<ContextValue>({
  currentPath: "/",
  onLinkClick: () => {},
  onPathChange: () => {},
  onPathReplace: () => {}
});

export const useRouter = () => React.useContext(RouterContext);

export const History = ({ children }: { children: React.ReactNode }) => {
  const [currentPath, setCurrentPath] = React.useState<string>(window.location.pathname);

  const value = React.useMemo(
    () => ({
      currentPath,
      onLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setCurrentPath(event.currentTarget.pathname);
        window.history.pushState({}, "", event.currentTarget.pathname);
      },
      onPathChange: (nextPath: string) => {
        setCurrentPath(nextPath);
        window.history.pushState({}, "", nextPath);
      },
      onPathReplace: (nextPath: string) => {
        setCurrentPath(nextPath);
        window.history.replaceState({}, "", nextPath);
      }
    }),
    [currentPath, setCurrentPath]
  );

  React.useEffect(
    () => {
      const onEvent = (event: PopStateEvent) => {
        const target = event.currentTarget as Window;
        setCurrentPath(target.location.pathname);
      };

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

type LinkProps = React.HTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: React.ReactNode;
};

export const Link = ({ to, children, ...props }: LinkProps) => {
  const { onLinkClick } = useRouter();

  return <a {...props} href={to} onClick={onLinkClick}>{children}</a>;
};

type ASTNode = {
  next: { [key: string]: ASTNode } & { ":dynamic"?: ASTNode };
  render: (...props: string[]) => React.ReactNode;
};

type ASTRoot = ASTNode & { default?: () => React.ReactNode };

export const TinyRouter = ({ ast }: { ast: ASTRoot }) => {
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

  matched = matched && !!node.render;
  if (!matched && ast.default) {
    return ast.default();
  }

  if (!matched) {
    return null;
  }

  return node.render.apply(null, dynamics);
};
