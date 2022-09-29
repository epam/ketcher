# NOTES

## Prerequisites

- Stable [Node.js](https://nodejs.org) version
- [Yarn](https://yarnpkg.com/) installed globally

## Build instructions

The latest version of Ketcher has been splitted into two packages: component library (see /packages/ketcher-react folder) and React ready-to-run application (see /example folder).

### Create production build

To create production build of ready-to-run application execute the following command from root directory:

```sh
yarn install
yarn build
```

The following parameters are used by default:

```sh
API_PATH='/v2'
PUBLIC_URL='./'
```

If you want to change these parameters you can build application by using the following command:

```sh
npx cross-env API_PATH='{your_api_path_here}' PUBLIC_URL='{your_public_url_here}' yarn build
```

To serve results of build locally run the following command from root directory:

```sh
yarn serve:remote
  or
yarn serve:standalone
  or
yarn serve
```

### Development

The latest version of Ketcher is based on yarn workspaces. So before starting development it is necessary to run the following command from root directory:

```sh
yarn install
```

After that component library and application should be started separately.

#### Build ketcher-react package

```sh
cd packages/ketcher-react
yarn install
yarn start
```

#### Build ketcher-standalone package

```sh
cd packages/ketcher-standalone
yarn install
yarn start
```

#### Build ketcher-core package

```sh
cd packages/ketcher-core
yarn install
yarn start
```

#### Build example application

```sh
cd example
yarn start:remote
  or
yarn start:standalone
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
yarn test:unit
  or
yarn test:watch
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
yarn stylelint
  or
yarn stylelint:fix
```

### Start all tests and formatting

```sh
yarn test
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
