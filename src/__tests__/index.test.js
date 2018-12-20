import React from "react";

import { cleanup, fireEvent, render } from "react-testing-library";

import { History, withRouter, TinyRouter, Link } from "../index";
import Router from "../router.macro";

afterEach(cleanup);

test("handles routing", () => {
  const Dynamic = ({ segment }) => <p>{segment}</p>;

  const Button = withRouter(({ onPathReplace }) => (
    <button type="button" onClick={() => onPathReplace("/d")}>D</button>
  ));

  const { getByText, queryByText } = render(
    <History>
      <ul>
        <li><Link to="/a">A</Link></li>
        <li><Link to="/a/a">AA</Link></li>
        <li><Link to="/a/b">AB</Link></li>
        <li><Link to="/b">B</Link></li>
        <li><Link to="/b/dynamic">BDynamic</Link></li>
        <li><Link to="/foobar">Foobar</Link></li>
        <li><Link to="/c-c">C</Link></li>
        <li><Button /></li>
      </ul>
      <Router>
        <p path="/a">A Page</p>
        <p path="/a/a">AA Page</p>
        <p path="/a/b">AB Page</p>
        <p path="/b">B Page</p>
        <Dynamic path="/b/:segment" />
        <p path="/c-c">C Page</p>
        <p path="/d">D Page</p>
        <p default>No match found</p>
      </Router>
    </History>
  );

  fireEvent.click(getByText("A"));
  expect(queryByText("A Page")).toBeTruthy();

  fireEvent.click(getByText("AA"));
  expect(queryByText("AA Page")).toBeTruthy();

  fireEvent.click(getByText("BDynamic"));
  expect(queryByText("dynamic")).toBeTruthy();

  fireEvent.click(getByText("Foobar"));
  expect(queryByText("No match found")).toBeTruthy();

  fireEvent.click(getByText("D"));
  expect(queryByText("D Page")).toBeTruthy();

  fireEvent.click(getByText("C"));
  expect(queryByText("C Page")).toBeTruthy();
});

test("handles pop state", () => {
  const fire = {};
  window.addEventListener = jest.fn((event, callback) => {
    fire[event] = callback;
  });

  const { getByText, queryByText } = render(
    <History>
      <Router>
        <p path="/foo">foo</p>
      </Router>
    </History>
  );

  fire.popstate({ currentTarget: { location: { pathname: "/foo" } } });
  expect(queryByText("foo")).toBeTruthy();

  window.addEventListener.mockRestore();
});

test("returns null when no matches are found and no default", () => {
  const { container, getByText } = render(
    <History>
      <Link to="/foobar">Foobar</Link>
      <div className="router">
        <Router>
          <p path="/foo" />
        </Router>
      </div>
    </History>
  );

  fireEvent.click(getByText("Foobar"));
  expect(container.querySelectorAll(".router *")).toHaveLength(0);
});
