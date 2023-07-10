## Prerequisites

- Stable [Node.js](https://nodejs.org) version >= 16
- Stable [npm](https://npmjs.com) version >= 7

# NOTES

The project switched from using yarn to using npm for managing packages.
If you want to convert your current codebase from yarn to npm you can follow the instructions below.

Remove current node_modules from all directories:

```
rm -rf node_modules
rm -rf ./packages/ketcher-core/node_modules
rm -rf ./packages/ketcher-react/node_modules
rm -rf ./packages/ketcher-standalone/node_modules
rm -rf ./packages/ketcher-polymer-editor-react/node_modules
rm -rf ./example/node_modules
rm -rf ./demo/node_modules
```

Remove yarn.lock:

```
rm yarn.lock
```

Install all packages with npm:

```
npm install
```

_NOTE!_ this command should only be run from root directory

Build the project:

```
npm run build
```

## Build instructions

The latest version of Ketcher has been splitted into two packages: component library (see /packages/ketcher-react folder) and React ready-to-run application (see /example folder).

### Create production build

To create production build of ready-to-run application execute the following command from root directory:

```sh
npm install
npm run build
```

The following parameters are used by default:

```sh
API_PATH='/v2'
PUBLIC_URL='./'
```

If you want to change these parameters you can build application by using the following command:

```sh
npx cross-env API_PATH='{your_api_path_here}' PUBLIC_URL='{your_public_url_here}' npm run build
```

To serve results of build locally run the following command from root directory:

```sh
npm run serve:remote
  or
npm run serve:standalone
  or
npm run serve
```

### Development

The latest version of Ketcher is based on npm workspaces. So before starting development it is necessary to run the following command from root directory:

```sh
npm install
```

Then start a Vite dev server in example:

```sh
cd example

# Standalone
npm run dev:standalone

# Or remote
npm run dev:remote
```

**NB!** We use Vite for development and react-app-rewired(Webpack based) for build. To make sure your implementation has consistent behavior both in development and production, after you finish developing with Vite, you'd better check your implementation with react-app-rewired before creating a new PR. Please follow the following steps:

Component libraries and application should be started separately. First should be started ketcher-core package.

#### Build ketcher-core package

```sh
cd packages/ketcher-core
npm start
```

#### Build ketcher-react package

```sh
cd packages/ketcher-react
npm start
```

#### Build ketcher-standalone package

```sh
cd packages/ketcher-standalone
npm start
```

#### Build example application

```sh
cd example
npm run start:remote
  or
npm run start:standalone
```

## Indigo service

Ketcher uses Indigo Service for server operations.
You may pass it as a property while Editor component is used or just add api_path query parameter:

```sh
<Editor staticResourcesUrl={process.env.PUBLIC_URL} apiPath={insert link to Indigo service here} />
  or
http://localhost:3000/?api_path={insert link to Indigo service here}
```

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).

## Additional commands

### Start unit tests

```sh
npm run test:unit
  or
npm run test:watch
```

### Start prettier

```sh
prettier
  or
prettier:write
```

### Start eslint

```sh
test:lint
```

### Start stylelint

```sh
npm run stylelint
  or
npm run stylelint:fix
```

### Start all tests and formatting

```sh
npm test
```

## Simple server

Place this docker-compose.yml file at the root of your repository

```sh
version: '3'
services:
  nginx:
    image: nginx:1.17.10-alpine
    ports:
      - 8080:80
    volumes:
      - ./nginx:/etc/nginx/conf.d:ro
      - ./ketcher:/srv/www:ro
    links:
      - indigo_service
    depends_on:
      - indigo_service

  indigo_service:
    image: epmlsop/indigo_service
    environment:
      - PYTHONPATH=${INDIGO_SERVICE_PYTHONPATH:-/srv/indigo-python}
      - INDIGO_UWSGI_RUN_PARAMETERS=--plugin python3 --py-autoreload=1
      - PYTHONDONTWRITEBYTECODE=1
    ports:
      - 8002:8002
    command: supervisord -n
```

Copy Ketcher files under ketcher/ folder
Add this file under nginx/defaut.conf

```sh
server {
  listen 80;
  keepalive_timeout 5;

  # The following configuration are related to the indigo service
  # see here https://lifescience.opensource.epam.com/indigo/service/index.html
  location / {
    root /srv/www;
    index ketcher.html;
    try_files $uri $uri/ @indigoservice;
  }

  location @indigoservice {
    # Should be set 'always' to transfer our lovely HTTP500 errors
    # Headers could be also set by Flasgger in service/config.py
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'POST, GET, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Accept, Content-Type' always;
    add_header 'Access-Control-Max-Age' '86400' always;
    include uwsgi_params;
    uwsgi_pass indigo_service:8002;
  }
}
```

Run

```sh
docker-compose up -d
```

Service with Ketcher will be run under localhost:8080/ketcher.html
