## Prerequisites

- Stable [Node.js](https://nodejs.org) version
- [Yarn](https://yarnpkg.com/) installed globally

## Build instructions

The latest version of Ketcher has been splitted into two packages: component library (see /packaes/ketcher-react folder) and React ready-to-run application (see /example folder).

### Create production build

To create production build of ready-to-run application execute the following command from root directory:

    yarn install
    yarn build

To serve results of build locally run the following command from root directory:

    yarn serve:remote
      or
    yarn serve:standalone
      or
    yarn serve

### Development

The latest version of Ketcher is based on yarn workspaces. So before starting development it is necessary to run the following commands from root directory:

    yarn install

After that component library and application should be started separately.

**Build kecther-react package (terminal #1)**

    cd packages/ketcher-react
    yarn start

**Build ketcher-standalone package**

    cd packages/ketcher-standalone
    yarn start

**Build example application (terminal #2)**

    cd example
    yarn start:remote
      or
    yarn start:standalone

## Indigo service

Ketcher uses Indigo Service for server operations.
You may pass it as a property while Editor component is used or just add api_path query parameter:

    <Editor staticResourcesUrl={process.env.PUBLIC_URL} apiPath={insert link to Indigo service here} />
      or
    http://localhost:3000/?api_path={insert link to Indigo service here}

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).

## Additional commands

To start unit tests:

    yarn test:unit
      or
    yarn test:watch

To start prettier:

    prettier
    prettier:write

To start eslint:

    test:lint

To start stylelint:

    yarn stylelint
      or
    yarn stylelint:fix

To start all tests and formatting:

    yarn test

## Simple server

Place this docker-compose.yml file at the root of your repository

```
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

```
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

```
docker-compose up -d
```

Service with Ketcher will be run under localhost:8080/ketcher.html
