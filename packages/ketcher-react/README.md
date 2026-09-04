# ketcher-react

[![npm version](https://img.shields.io/npm/v/ketcher-react)](https://www.npmjs.com/package/ketcher-react)
[![Downloads](https://img.shields.io/npm/dm/ketcher-react)](https://www.npmjs.com/package/ketcher-react)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Copyright (c) 2021 [EPAM Systems, Inc.](https://www.epam.com/)

Ketcher is an open-source web-based chemical structure editor incorporating high performance, good portability, light weight, and ability to easily integrate into a custom web-application. Ketcher is designed for chemists, laboratory scientists and technicians who draw structures and reactions.

For more details please look at the following [link](https://github.com/epam/ketcher/blob/master/README.md).

The ketcher-react package contains only the functionality necessary to define components. It is used together with [ketcher-core](https://www.npmjs.com/package/ketcher-core) and optionally with [ketcher-standalone](https://www.npmjs.com/package/ketcher-standalone) if standaolone mode is required.

## Installation

### Requirements

- **React**: 18.2.0 or higher (React 19 is also supported)
- **Node.js**: 24.14.1 or higher

### Install

The ketcher-react library is available as an [NPM](https://www.npmjs.com/) package. Install it either with NPM:

```sh
npm install --save ketcher-react
```

or [Yarn](https://yarnpkg.com/):

```sh
yarn add ketcher-react
```

## Usage

```js
import { RemoteStructServiceProvider } from 'ketcher-core'

const structServiceProvider = new RemoteStructServiceProvider(
  process.env.REACT_APP_API_PATH!,
  {
    'custom header': 'value' // optionally you can add custom headers object
  }
)

const MyComponent = () => {
  return (
    <Editor
      staticResourcesUrl={process.env.PUBLIC_URL}
      structServiceProvider={structServiceProvider}
    />
  )
}
```

### Indigo Service

Ketcher uses Indigo Service for server operations.
You may pass it as a property while Editor component is used or just add api_path query parameter:

```sh
<Editor staticResourcesUrl={process.env.PUBLIC_URL} apiPath={link to Indigo service} />
    or
http://localhost:3000/?api_path={link to Indigo service}
```

You can find the instruction for service installation
[here](https://lifescience.opensource.epam.com/indigo/service/index.html).

### 3D Viewer

Ketcher uses Miew-React for viewing and editing data in 3D.
Miew-React package default exports Viewer component which
initializes and renders a Miew instance inside of it

```js
...
import Viewer from 'miew-react'

const MyComponent = () => {
  return <Viewer />
}
...
...
```

You can find the latest version of Miew-React [here](https://github.com/epam/miew/tree/master/packages/miew-react).
The last checked version - [0.12.0](https://www.npmjs.com/package/miew-react).

## Troubleshooting

### "Can't resolve 'react/jsx-runtime'" or module resolution errors

Ketcher requires **React 18.2.0 or higher** (or React 19.x). If you see errors like:

```
Module not found: Error: Can't resolve 'react/jsx-runtime'
Can't import the named export 'Children' from non EcmaScript module
```

**Solution 1: Update React version**

Make sure you have the correct React version installed:

```sh
npm install react@^18.2.0 react-dom@^18.2.0
```

**Solution 2: Check your bundler configuration**

If you're still seeing the "Can't import the named export" error after updating React, you may need to update your webpack or build tool configuration:

For **webpack 5**, ensure you have:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
```

For **Create React App**, you may need to upgrade to the latest version:

```sh
npm install react-scripts@latest
```

For **Vite**, the default configuration should work. If you encounter issues, ensure you're using Vite 4+ with the React plugin properly configured.

### Editor appears but templates/icons are missing

Make sure you've correctly set `staticResourcesUrl` and that the Ketcher static assets are accessible:

```jsx
// For Vite
staticResourcesUrl={import.meta.env.BASE_URL}

// For Create React App
staticResourcesUrl={process.env.PUBLIC_URL}

// Or provide absolute path
staticResourcesUrl="/ketcher-assets"
```

### "Cannot find module 'ketcher-standalone'"

Make sure you've installed the standalone package:

```sh
npm install ketcher-standalone
```

### TypeScript errors

Install type definitions:

```sh
npm install --save-dev @types/react @types/react-dom
```

### Editor is blank or not visible

Ensure the editor container has a defined height:

```jsx
<div style={{ height: '100vh', width: '100%' }}>
  <Editor {...props} />
</div>
```

### CSS styles not applied

Make sure you import the CSS file:

```jsx
import 'ketcher-react/dist/index.css';
```

## Examples

For complete working examples, see:

- [Basic example](https://github.com/epam/ketcher/tree/master/example) - Full-featured example with both standalone and remote modes
- [Main README](https://github.com/epam/ketcher/blob/master/README.md) - Additional usage examples and API documentation
