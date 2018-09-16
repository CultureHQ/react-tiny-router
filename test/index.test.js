import React from "react";
import { mount } from "enzyme";

import { History, withRouter, Router, Link } from "../src";

const Dynamic = ({ segment }) => <p>{segment}</p>;

const Button = withRouter(({ onPathChange }) => (
  <button type="button" onClick={() => onPathChange("/c")}>C</button>
));

const Application = () => (
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
      <p>No match found</p>
    </Router>
  </History>
);

test("handles routing", () => {
  const component = mount(<Application />);

  component.find(Link).findWhere(link => link.props().to === "/a").simulate("click");
  expect(component.find(Router).text()).toEqual("A Page");

  component.find(Link).findWhere(link => link.props().to === "/a/a").simulate("click");
  expect(component.find(Router).text()).toEqual("AA Page");

  component.find(Link).findWhere(link => link.props().to === "/b/dynamic").simulate("click");
  expect(component.find(Router).text()).toEqual("dynamic");

  component.find(History).instance().handlePathChange("/foobar");
  component.update();
  expect(component.find(Router).text()).toEqual("No match found");

  component.find(History).instance().handlePathReplace("/a/b");
  component.update();
  expect(component.find(Router).text()).toEqual("AB Page");
});
