# Localization (i18n)

Ketcher's UI text was originally hardcoded in English throughout `ketcher-react`. Users who prefer another language had no way to see menus, dialogs, tooltips, and settings in their own language, and there was no infrastructure to add one safely (no key convention, no guard against new hardcoded strings, no way to know a translation was incomplete).

Spec: [openspec/specs/localization/spec.md](../../openspec/specs/localization/spec.md)

## Limitations

- Only left-to-right languages are shipped today; RTL groundwork (CSS logical properties, a direction-sensitive-icon inventory) exists but no RTL locale has been added yet.
- Translation quality for non-English languages depends on who authored it; a language may be added by a non-native speaker as a functional first pass, pending a later native-speaker/professional review. This does not block the language from shipping, but content may be refined afterward without changing behavior.
- Playwright end-to-end coverage for the language switcher/localized-UI flows was explicitly deferred (product decision, not a technical blocker) and has not been added.
