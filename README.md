# react-tiny-router

[![Build Status](https://travis-ci.com/CultureHQ/react-tiny-router.svg?branch=master)](https://travis-ci.com/CultureHQ/react-tiny-router)
[![Package Version](https://img.shields.io/npm/v/react-tiny-router.svg)](https://www.npmjs.com/package/react-tiny-router)
[![Minified GZipped Size](https://img.shields.io/bundlephobia/minzip/react-tiny-router.svg)](https://www.npmjs.com/package/react-tiny-router)
[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)

A tiny router for React.js.

## Getting started

`react-tiny-router` is a router for `React.js` projects. It aims to be a small and out of the way as possible. Under the hood it uses `babel-plugin-macros` to precompile the paths that you provide to ensure it can route as efficiently as possible. In order for this to work, your build process will need to be [set up with the macros plugin](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md).

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

## `eslint`

Depending on your configuration, `eslint` may get mad at you for importing `TinyRouter` without it thinking you're using it in your source file. Rest assured, it does get used. To get rid of the linting error, you can add:

```json
"no-unused-vars": ["error", { "varsIgnorePattern": "TinyRouter" }]
```

to the `rules` section of your `eslint` config.
