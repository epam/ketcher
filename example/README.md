This example was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

It is linked to the @ketcher/react package in the parent directory for development purposes.

To run application for development purposes, please check instructions:
[DEVNOTES.md](https://github.com/epam/ketcher/blob/master/DEVNOTES.md)

## Environment variables

The example application reads variables from `example/.env` and from the shell environment. Shell values can be supplied before an npm script, for example:

```sh
npx cross-env REACT_APP_API_PATH=https://indigo.example.com/v2 npm run dev:remote
```

| Variable | Default | Description |
| --- | --- | --- |
| `MODE` | `standalone` | Selects the structure service provider. Use `standalone` to run Indigo in the browser with `ketcher-standalone`, or `remote` to call an Indigo service. The provided `dev:*`, `start:*`, and `build:*` scripts set this value automatically. |
| `REACT_APP_API_PATH` | `/v2` | Indigo service URL used in remote mode. This value is also exposed as `API_PATH` in Webpack builds. |
| `API_PATH` | `REACT_APP_API_PATH` | Indigo service URL consumed by the application when it is available. Prefer `REACT_APP_API_PATH` for consistency between Vite development and Webpack builds. |
| `PUBLIC_URL` | `./` | Base URL for static assets and Ketcher resources such as icons, the manifest, and standalone assets. |
| `GENERATE_SOURCEMAP` | `false` | Controls whether Create React App generates production source maps during Webpack builds. |
| `SKIP_PREFLIGHT_CHECK` | `true` | Skips Create React App dependency preflight checks. |
| `SEPARATE_INDIGO_RENDER` | unset | Enables the standalone Indigo callback path for builds that use a separate render-capable Indigo module. Normally this is set by standalone package build scripts rather than by contributors running the example. |
