# react-tiny-router

[![Package Version](https://img.shields.io/npm/v/react-tiny-router.svg)](https://www.npmjs.com/package/react-tiny-router)
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

A tiny router for React.js.

## Getting started

`react-tiny-router` is a router for `React.js` projects. It aims to be a small and out of the way as possible. Under the hood it uses `babel-plugin-macros` to precompile the paths that you provide to ensure it can route as efficiently as possible. In order for this to work, your build process will need to be [set up with the babel macros plugin](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md).

Here's an example application that we can look at in detail:

```javascript
import React from "react";

import { History, TinyRouter, Link } from "react-tiny-router";
import Router from "react-tiny-router/router.macro";

const Maps = () => ...;

const Racer = ({ name }) => ...;

export default const MarioKart = () => (
  <History>
    <h1>MarioKart</h1>
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/maps">Maps</Link></li>
      <li><Link to="/racer/toad">Toad</Link></li>
      <li><Link to="/racer/yoshi">Yoshi</Link></li>
      <li><Link to="/racer/peach">Peach</Link></li>
    </ul>
    <Router>
      <p path="/">Welcome!</p>
      <Maps path="/maps" />
      <Racer path="/racer/:name" />
      <p default>Looks like you made a wrong turn!</p>
    </Router>
  </History>
);
```

A lot of things are happening here, so let's break it down, starting with the imports:

* `import { History }` - `History` is the context provider that needs to wrap any `Link` or `Router` tags. It maintains the state of the current path as well as provides various callbacks to manipulate the state (discussed later).
* `import { TinyRouter }` - `TinyRouter` is the router that ends up replacing the `Router` declaration that you specify. Much like `React` with `JSX`, you need to import this even if you're not using the object directly. `TinyRouter` itself is a `React` component that accepts a singular `ast` prop, which is the compiled version of the routes that you declare.
* `import { Link }` - `Link` is a very simple `<a>` tag that when clicked will inform the `History` provider that the route needs to change.
* `import Router` - `Router` is a `babel` macro that will replace itself with an instance of `TinyRouter` when compiled.

Now, for the actual body of the application:

* `<History>` - You need to wrap anything that will use `Link` or `Router` tags with this component in order for them to have access to necessary context.
* `<Router>` - All child components within a `Router` declaration should have either a `path` prop (which is the template URL to match) or a `default` prop (which indicates which component to render should no match be found). The child components can be any valid `React` component. They will receive as props any dynamic segments specified in the template URL. (In the example above, the `Racer` component will receive a `name` prop from the URL.)
* `<Link>` - `Link` components function very similarly to anchor tags, and should be treated the same.

### Internals

Internally when `babel` compiles this file, the JSX expressions inside of the `Router` component become a large `ast` object that becomes a prop to the `TinyRouter` component that replaces the `Router`. So in the above example, the entire `Router` expression gets replaced by:

```javascript
<TinyRouter
  ast={{
    render: () => <p>Welcome!</p>,
    next: {
      maps: {
        render: () => <Maps />
      },
      racer: {
        next: {
          ":dynamic": {
            render: name => <Racer name={name} />
          }
        }
      }
    },
    default: () => <p>Looks like you made a wrong turn!</p>
  }}
/>
```

This `ast` prop is then used by walking through each segment of the current URL (split by parentheses). For each segment, it will check the `next` object for a key that matches the segment. If found, it will move into that subtree and continue. Once all of the segments are exhausted, it will look for a `render` function at that node in the tree to know what to render.

Dynamic route segments are handled effectively the same way, except that they have a special `:dynamic` key which the router will fall back to if a more specific route is not matched first. In this case the dynamic segment becomes a prop on the route's component.

## `withRouter`

In case you need direct access to the routing context (for instance from a `button` that will redirect when clicked), you can use the `withRouter` higher-order component. Example usage is below:

```javascript
import React, { Component, Fragment } from "react";

import { History, TinyRouter, withRouter } from "react-tiny-router";
import Router from "react-tiny-router/router.macro";

const Racer = ({ name }) => ...;

const TextInput = ({ onChange, value }) => ...;

class RacerSearch extends Component {
  state = { search: "" };

  handleSearchChange = search => {
    this.setState({ search });
  };

  handleButtonClick = () => {
    const { onPathChange } = this.props;
    const { search } = this.state;

    onPathChange(`/racer/${search}`);
  };

  render() {
    const { search } = this.state;

    return (
      <Fragment>
        <button type="button" onClick={this.handleButtonClick}>
          Select Your Player
        </button>
        <TextInput onChange={this.handleSearchChange} value={search} />
      </Fragment>
    );
  }
}

const RacerSearchWithRouter = withRouter(RacerSearch);

export default const MarioKart = () => (
  <History>
    <h1>MarioKart</h1>
    <Router>
      <RacerSearchWithRouter path="/" />
      <Racer path="/racer/:name" />
    </Router>
  </History>
);
```

In this case we're using the `withRouter` HOC to get access to the `onPathChange` callback. Then, when our text input is set to the correct value and the button is clicked, the route will change and the router will be rerendered.

`withRouter` also gives you access to `currentPath` (the current path in state) and `onPathReplace` (which will replace the path in history as opposed to just pushing onto the stack).

## `eslint`

Depending on your configuration, `eslint` may get mad at you for importing `TinyRouter` without it thinking you're using it in your source file. Rest assured, it does get used. To get rid of the linting error, you can add:

```json
"no-unused-vars": ["error", { "varsIgnorePattern": "TinyRouter" }]
```

to the `rules` section of your `eslint` config.
