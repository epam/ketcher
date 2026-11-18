# Localization (i18n)

Ketcher ships as an **English-only build by default** — the smallest bundle, no language switcher in Settings, nothing to configure.

Consumers who want multiple languages opt in at build time by setting `KETCHER_MULTI_LANGUAGE_BUILD=true` when building `ketcher-react`/`ketcher-macromolecules` — either export it in the shell, or copy the repo-root `.env.example` to `.env` and set it there. That produces the multi-language variant of the app: a **Settings → General → Language** switcher appears, users can switch language with no reload (applying immediately across toolbars, dialogs, context menus, Settings itself), and the choice is remembered for the next visit. This covers both the `ketcher-react` (small molecules) and `ketcher-macromolecules` UIs.

Currently supported in the multi-language build: **English**, **Simplified Chinese (简体中文)** and **Spanish (español)**. Chemistry vocabulary (element symbols, bond-type names, file-format codes) is intentionally kept untranslated in every language, since it must stay consistent with chemistry file formats.
