import React, { Component } from "react";

import findMatch from "./find-match";

const { Provider, Consumer } = React.createContext({
  currentPath: "",
  onLinkClick: () => {},
  onPathChange: () => {},
  onPathReplace: () => {}
});

export class History extends Component {
  handleLinkClick = event => {
    event.preventDefault();
    this.handleRedirect(event.currentTarget.pathname);
  };

  handlePathChange = nextPath => {
    this.setState({ currentPath: nextPath });
    window.history.pushState({}, "", nextPath);
  };

  handlePathReplace = nextPath => {
    this.setState({ currentPath: nextPath });
    window.history.replaceState({}, "", nextPath);
  };

  state = {
    currentPath: window.location.pathname,
    onLinkClick: this.handleLinkClick,
    onPathChange: this.handlePathChange,
    onPathReplace: this.handlePathReplace
  };

  componentDidMount() {
    window.addEventListener("popstate", this.handlePopState);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState);
  }

  handlePopState = ({ currentTarget: { location } }) => {
    this.setState({ currentPath: location.pathname });
  };

  render() {
    const { children } = this.props;

    return <Provider value={this.state}>{children}</Provider>;
  }
}

export const withRouter = Child => {
  const Parent = props => (
    <Consumer>{state => <Child {...state} {...props} />}</Consumer>
  );

  const childName = Child.displayName || Child.name || "Component";
  Parent.displayName = `withRouter(${childName})`;

  return Parent;
};

export const Router = ({ children }) => (
  <Consumer>
    {({ currentPath }) => findMatch(children, currentPath)}
  </Consumer>
);

export const Link = ({ to, children, ...props }) => (
  <Consumer>
    {({ onLinkClick }) => (
      <a {...props} href={to} onClick={onLinkClick}>{children}</a>
    )}
  </Consumer>
);
