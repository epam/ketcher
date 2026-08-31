# ADR: Stylelint Shadowing and Version 17 Upgrade Logic

Date: 2026-08-31
Status: Proposed

## Context

The project is currently using `stylelint@14`. There is a configuration shadowing issue where the `stylelint` block in the root `package.json` overrides the `.stylelintrc.json` file.

Reference: [package.json stylelint block](https://github.com/epam/ketcher/blob/053c0f17d69b4abe65a525f24c54e56fdf29b7cc/package.json#L85) is overriding [root .stylelintrc.json](https://github.com/epam/ketcher/blob/master/.stylelintrc.json), making Stylelint check nothing.

At the moment these scripts are checking nothing:
* `npm run test:stylelint --workspace=packages/ketcher-react`
* `npm run test:stylelint --workspace=packages/ketcher-macromolecules`
* `npm run test:stylelint --workspace=example`
* `npm run stylelint:fix --workspace=packages/ketcher-react`

Thus upgrading to `stylelint@17` does not throw errors as long as this shadowing exists.

## Situation

If the override is removed from `package.json`, Stylelint starts to throw incompatibility issues with the current (legacy) `.stylelintrc.json` and the existing codebase.

Example of CLI crash with `stylelint@17` due to legacy flags:
```
npm run test:stylelint --workspace=packages/ketcher-react            

> ketcher-react@3.19.0-rc.1 test:stylelint
> stylelint "./**/*.{css,less}" --formatter

Error: You must use a valid formatter option: "compact", "json", "string", "tap", "unix", "verbose" or a function
    at getFormatter (file:///Users/philipp/Documents/GitHub/ketcher/node_modules/stylelint/lib/utils/getFormatter.mjs:28:11)
    at async standalone (file:///Users/philipp/Documents/GitHub/ketcher/node_modules/stylelint/lib/standalone.mjs:126:28)
```

## Decision

We have decided to proceed with the version bump of Stylelint to `^17.14.1` while maintaining the shadowing block in `package.json` to avoid a massive immediate refactor. 

We will:
1. Bump `stylelint` and `stylelint-config-standard` versions.
2. Remove the bare `--formatter` flag from workspace scripts to prevent CLI crashes.
3. Keep the minimal configuration in `package.json` to maintain the current (silent) state of the linter.

## Consequences

* The linter remains "blind" and does not catch CSS/Less errors.
* Fixing Stylelint compatibility and enabling full linting is considered out of scope for this task and should be addressed in separate tasks.
