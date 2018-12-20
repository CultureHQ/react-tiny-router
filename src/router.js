import React, { Component } from "react";

const { Provider, Consumer } = React.createContext({
  currentPath: "",
  onLinkClick: () => {},
  onPathChange: () => {},
  onPathReplace: () => {}
});

/* eslint-disable react/no-unused-state */
export class History extends Component {
  constructor(props) {
    super(props);

    const onPathChange = nextPath => {
      this.setState({ currentPath: nextPath });
      window.history.pushState({}, "", nextPath);
    };

    this.state = {
      currentPath: window.location.pathname,
      onPathChange,
      onPathReplace: nextPath => {
        this.setState({ currentPath: nextPath });
        window.history.replaceState({}, "", nextPath);
      },
      onLinkClick: event => {
        event.preventDefault();
        onPathChange(event.currentTarget.pathname);
      }
    };

    this.handlePopState = this.handlePopState.bind(this);
  }

  componentDidMount() {
    window.addEventListener("popstate", this.handlePopState);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState);
  }

  handlePopState({ currentTarget: { location } }) {
    this.setState({ currentPath: location.pathname });
  }

  render() {
    const { children } = this.props;

    return <Provider value={this.state}>{children}</Provider>;
  }
}
/* eslint-enable react/no-unused-state */

export const withRouter = Child => props => (
  <Consumer>
    {state => <Child {...state} {...props} />}
  </Consumer>
);

export const Link = ({ to, children, ...props }) => (
  <Consumer>
    {({ onLinkClick }) => (
      <a {...props} href={to} onClick={onLinkClick}>{children}</a>
    )}
  </Consumer>
);

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

export const TinyRouter = ({ ast }) => (
  <Consumer>
    {({ currentPath }) => match(ast, currentPath)}
  </Consumer>
);
