import React from "react";
import { mount } from "enzyme";

import { History, withRouter, TinyRouter, Link } from "../src";
import Router from "../src/router.macro";

test("handles routing", () => {
  const Dynamic = ({ segment }) => <p>{segment}</p>;

  const Button = withRouter(({ onPathChange }) => (
    <button type="button" onClick={() => onPathChange("/c")}>C</button>
  ));

  const component = mount(
    <History>
      <ul>
        <li><Link to="/a">A</Link></li>
        <li><Link to="/a/a">AA</Link></li>
        <li><Link to="/a/b">AB</Link></li>
        <li><Link to="/b">B</Link></li>
        <li><Link to="/b/dynamic">BDynamic</Link></li>
        <li><Button /></li>
      </ul>
      <Router>
        <p path="/a">A Page</p>
        <p path="/a/a">AA Page</p>
        <p path="/a/b">AB Page</p>
        <p path="/b">B Page</p>
        <Dynamic path="/b/:segment" />
        <p path="/c">C Page</p>
        <p default>No match found</p>
      </Router>
    </History>
  );

  component.find(Link).findWhere(link => link.props().to === "/a").simulate("click");
  expect(component.find(TinyRouter).text()).toEqual("A Page");

  component.find(Link).findWhere(link => link.props().to === "/a/a").simulate("click");
  expect(component.find(TinyRouter).text()).toEqual("AA Page");

  component.find(Link).findWhere(link => link.props().to === "/b/dynamic").simulate("click");
  expect(component.find(TinyRouter).text()).toEqual("dynamic");

  component.find(History).instance().handlePathChange("/foobar");
  component.update();
  expect(component.find(TinyRouter).text()).toEqual("No match found");

  component.find(History).instance().handlePathReplace("/a/b");
  component.update();
  expect(component.find(TinyRouter).text()).toEqual("AB Page");

  component.find(History).instance().handlePopState({
    currentTarget: { location: { pathname: "/b/foo" } }
  });
  component.update();
  expect(component.find(TinyRouter).text()).toEqual("foo");

  component.unmount();
});

test("returns null when no matches are found and no default", () => {
  const component = mount(
    <History>
      <Link to="/foobar">Foobar</Link>
      <Router>
        <p path="/foo" />
      </Router>
    </History>
  );

  component.find(Link).simulate("click");
  expect(component.find(TinyRouter).text()).toBe(null);
});
