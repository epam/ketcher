# ketcher-standalone

[![npm version](https://img.shields.io/npm/v/ketcher-standalone)](https://www.npmjs.com/package/ketcher-standalone)
[![Downloads](https://img.shields.io/npm/dm/ketcher-standalone)](https://www.npmjs.com/package/ketcher-standalone)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Copyright (c) 2021 [EPAM Systems, Inc.](https://www.epam.com/)

Ketcher is an open-source web-based chemical structure editor incorporating high performance, good portability, light weight, and ability to easily integrate into a custom web-application. Ketcher is designed for chemists, laboratory scientists and technicians who draw structures and reactions.

For more details please look at the following [link](https://github.com/epam/ketcher/blob/master/README.md).

The ketcher-standalone package contains only the functionality necessary to start Ketcher in standalone mode. It is intended to be paired with the main Ketcher package, which is shipped as [ketcher-react](https://www.npmjs.com/package/ketcher-react) to npm.

## Installation

```sh
npm install --save ketcher-standalone
```

```sh
npm install ketcher-standalone
```

## Usage

```js
import { StandaloneStructServiceProvider } from 'ketcher-standalone'

const structServiceProvider = new StandaloneStructServiceProvider()

const MyComponent = () => {
  return (
    <Editor
      staticResourcesUrl={process.env.PUBLIC_URL}
      structServiceProvider={structServiceProvider}
    />
  )
}
```
