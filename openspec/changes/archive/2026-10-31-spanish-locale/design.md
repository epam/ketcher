## Context

The i18n layer resolves every UI string through `react-i18next` with per-locale namespace JSON files. `ketcher-react` owns six namespaces and `ketcher-macromolecules` owns two, both registered into one shared instance. `scripts/generate-locale-resources.mjs` discovers complete locale directories and emits `localeResources.generated.ts`, so a language is added by adding data, not code. Only `en` and `zh-CN` exist today.

The Settings language control was removed by the Settings redesign (#12354) and restored in a separate bug fix (#12554 / PR #12555). This change does not touch that code path; it assumes the control exists in the multi-language build.

## Goals / Non-Goals

**Goals:**

- Complete `es` content for all eight namespaces, key-for-key with `en`.
- Preserve ICU placeholders so interpolation keeps working.
- Remain data-only: no changes to `i18n.ts`, `registerNamespaces.ts`, bundle flags or package API.
- Keep labels short enough for the existing Settings and dialog layouts.

**Non-Goals:**

- Changing the i18n infrastructure, build flag or English-only default.
- Re-adding or redesigning the language control (separate fix).
- Translating chemistry vocabulary (element symbols, bond-type names in the toolbar/context menu, MDL/SDF codes, valence notation).
- Extracting the UI strings that are still hardcoded in some macromolecules context menus; those render in English in every locale and are tracked separately.
- RTL support or additional languages.

## Decisions

**Both packages in one change.** The Chinese locale required two changes because the `ketcher-macromolecules` i18n integration did not exist yet. Here the integration exists and the work is content for both packages, so one locale capability covers it and satisfies the localization requirement that every shipped language covers both packages.

**Glossary.** Bond = enlace, ring = anillo, S-Group = grupo S, R-Group = grupo R, preset = preajuste, attachment point = punto de unión, leaving group = grupo saliente, sugar/base/phosphate = azúcar/base/fosfato, RNA/DNA = ARN/ADN. Element symbols and format identifiers stay untranslated.

**Short UI labels.** The translation drops the redundant "Herramienta de" prefix from tool names (the tooltip context already conveys it), uses `General` for the Settings section, `Gestionar` for the Manage Settings button, `Plantillas` for the template-library tab, and `Dibujado` (same length as `As drawn`) for the two "as drawn" enums. Miew styles are `Esferas y varillas` and `Cilindros finos`.

**Quality caveat.** The translation is an AI-authored first pass, consistent to the precedent recorded by the Chinese and macromolecules i18n changes. A native-speaker review is recommended before production use; this change does not claim translation-quality sign-off.

## Risks / Trade-offs

- **Longer strings overflow controls.** Mitigated by testing the Settings panel and the periodic table in the running app and by shortening labels that did not fit.
- **Terminology drift** between packages or screens. Mitigated by the glossary above and by keeping duplicated strings in `common`.
- **Incomplete coverage of hardcoded leftovers.** Known macromolecules context-menu strings remain English; called out as a non-goal rather than silently shipped as translated.
- **AI translation quality.** Accepted with the native-review caveat, matching existing locale precedent.
