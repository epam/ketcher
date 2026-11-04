# Localization

In a multi-language build, a user picks the interface language in Settings. The interface changes at once, and the choice survives a reload. Behavior is owned by [openspec/specs/localization/spec.md](../../../../openspec/specs/localization/spec.md).

## Sub-features

- `lang-switch` changes the interface language from Settings at once.
- `lang-survives-cancel` keeps the new language after Settings is closed with Cancel.
- `lang-persist` restores the language after a reload.
- `lang-default-hidden` shows no language selector in the default build.

## How to get to it (user POV)

- Open Settings (`settings-button`). The panel is `settings-panel`. The selector is `language-select` in the "General Editing & Display" section. Options are `English-option` and `简体中文-option`.
- Close Settings with Cancel (`settings-panel-cancel`) or Apply (`settings-panel-apply`). The language applies on selection.

## Driving it with drive.mjs

Preconditions:

- Start the server with the flag: `KETCHER_MULTI_LANGUAGE_BUILD=true node .agents/skills/verify-ketcher/scripts/server.mjs start`. Then the rest of the baseline in [README.md](./README.md).

- **Default build.** On a server started without the flag, run `node $D click --testid settings-button`, then `node $D state --testid language-select`: `exists: false`.
- **Switch.** With the flag, run `node $D click --testid settings-button`, `node $D click --testid language-select`, `node $D click --testid 简体中文-option`. `node $D click --role button --name 取消` succeeds and closes the panel.
- **Survives Cancel.** `node $D click --role button --name 设置` succeeds: the Settings button title is now Chinese. Close with `node $D click --role button --name 取消`.
- **Persist.** Run `node $D open --mode molecules`, then `node $D state --role button --name 设置`: `exists: true`.
- **Reset.** Run `node $D click --testid settings-button`, `node $D click --testid language-select`, `node $D click --testid English-option`, `node $D click --role button --name Cancel`. `node $D state --role button --name Settings` shows `exists: true`.

## Gotchas

- Always run Reset. The language is saved in local storage for the browser session, and every later name-based click breaks in Chinese.
- Restarting the server with the flag means a cold server: run the warm-up in [SKILL.md](../SKILL.md#doctor).
- Section test IDs are built from translated labels and change with the language.
