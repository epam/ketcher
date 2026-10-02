---
paths:
  - "example/**"
  - "example-ssr/**"
  - "demo/**"
description: "Host applications: example, example-ssr and demo"
---

# Host applications

These consume the packages. Library behaviour is fixed in the packages, not here.

- `example/` is the reference host and the app the E2E suite runs against (`dist/standalone` served
  on port 4002 by `npm run serve:standalone`). Dev runs on Vite (`npm run dev:standalone -w example`,
  or `dev:remote`), which aliases every package to its `src/`. The production build is CRA through
  `react-app-rewired` (`example/config/webpack.config.js`) on the packages' **built** `dist` — run
  `npm run build:packages` first. Four built HTML entries (index, popup, duo, closable) plus the
  static `public/iframe.html`. `MODE` selects standalone or remote.
- `demo/` is a CRA playground that calls the `ketcher` API.
- `example-ssr/` is a Next.js app with its **own** `package-lock.json` pinning old published Ketcher
  versions; CI builds it against the workspace install instead.
- The Vite dev server compiles package Less with Less 4, the package build with Less 3 — see
  `styles.md` before trusting a style that looks right only in dev.
