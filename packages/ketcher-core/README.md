# ketcher-core

[![npm version](https://img.shields.io/npm/v/ketcher-core)](https://www.npmjs.com/package/ketcher-core)
[![Downloads](https://img.shields.io/npm/dm/ketcher-core)](https://www.npmjs.com/package/ketcher-core)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Copyright (c) 2021 [EPAM Systems, Inc.](https://www.epam.com/)

Ketcher is an open-source web-based chemical structure editor incorporating high performance, good portability, light weight, and ability to easily integrate into a custom web-application. Ketcher is designed for chemists, laboratory scientists and technicians who draw structures and reactions.

For more details please look at the following [link](https://github.com/epam/ketcher/blob/master/README.md).

The ketcher-core package serves as the entry point to Ketcher core functionality including domain, shared services, functions and interface declarations. It is intended to be paired with the main Ketcher package, which is shipped as [ketcher-react](https://www.npmjs.com/package/ketcher-react) to npm.

## Installation

```sh
npm install --save ketcher-core
```

or [Yarn](https://yarnpkg.com/):

```sh
yarn add ketcher-core
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
