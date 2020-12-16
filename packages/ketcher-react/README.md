# Ketcher

[![npm version](https://img.shields.io/npm/v/ketcher-react)](https://www.npmjs.com/package/ketcher-react)
[![Downloads](https://img.shields.io/npm/dm/ketcher-react)](https://www.npmjs.com/package/ketcher-react)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Copyright (c) 2020 [EPAM Systems, Inc.](https://www.epam.com/)

Ketcher is an open-source web-based chemical structure editor incorporating high performance, good portability, light weight, and ability to easily integrate into a custom web-application. Ketcher is designed for chemists, laboratory scientists and technicians who draw structures and reactions.

For more details please look at the following [link](https://github.com/epam/ketcher/blob/master/README.md).

## Installation

Ketcher library is available as an [NPM](https://www.npmjs.com/) package. Install it either with NPM:

```sh
npm install --save ketcher-react
```

or [Yarn](https://yarnpkg.com/):

```sh
yarn add ketcher-react
```

## Usage

### Indigo Service

Ketcher uses Indigo Service for server operations.
You may pass it as a property while Editor component is used or just add api_path query parameter:

```sh
<Editor staticResourcesUrl={process.env.PUBLIC_URL} apiPath={link to Indigo service} />
    or
http://localhost:3000/?api_path={link to Indigo service}
```

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).

### 3D Viewer

Ketcher uses Miew for viewing and editing data in 3D.
For use of this functionality you should add the link to miew by your own:

```sh
...
import Miew from 'miew'
import 'miew/dist/Miew.min.css'
...
;(global as any).Miew = Miew
...
```

You can find the latest version of viewer [here](https://github.com/epam/miew).
The last checked version - [0.9.0](https://github.com/epam/miew/releases/tag/v0.9.0).

## License

Please read [LICENSE](./../../LICENSE) and [NOTICE](./../../NOTICE) for details.
