# English-only is the default build; multi-language is opt-in

## Decision

Ketcher's default build (`ketcher-react`/`ketcher-macromolecules`, no build flag set) ships English-only: smallest bundle, no non-English translation payload, no Settings language switcher. Every other supported language is available only when the consumer explicitly opts in at build time via `KETCHER_MULTI_LANGUAGE_BUILD=true`.

## Context

The i18n build-time flag was originally implemented the other way around: the default build shipped every language, and `KETCHER_SINGLE_LANGUAGE_BUILD=true` was needed to strip non-English content down to English-only. Product direction reversed this after the initial implementation — the common case (a consumer who doesn't need multi-language support) should get the smallest bundle and simplest UI without having to know a flag exists, and multi-language should be the deliberate, opt-in choice.

## Alternatives considered

- **Keep the original flag name/polarity, just document the "recommended" value** — rejected: a flag named `..._SINGLE_LANGUAGE_BUILD` that defaults to "off" (i.e. multi-language) is the opposite of what a reader expects from the name, and doesn't change actual out-of-the-box behavior for anyone who doesn't read the docs.
- **Runtime-only default (still bundle everything, just start on English)** — rejected: doesn't reduce bundle size, which is the whole point of the flag; a consumer who never wants multi-language still pays for it.

## Rationale

Renaming to `KETCHER_MULTI_LANGUAGE_BUILD` (opt-in, default off) makes the flag's name match its default polarity, and makes "no flag" the smallest/simplest build — which is what most consumers embedding Ketcher as a component actually want. The underlying mechanism (compile-time `@rollup/plugin-replace` constant, Rollup tree-shaking the unreachable locale-import branch, Settings switcher hidden at `SUPPORTED_LANGUAGES.length === 1`) is unchanged from the original implementation — only the flag's name and which branch is the default were inverted. See [modules/i18n.md](../modules/i18n.md) and the archived `openspec/changes/archive/2026-09-30-ketcher-macromolecules-i18n/design.md` (Decision 6 and its amendment) for the full mechanism and verification detail.

## Consequences

- Any existing consumer relying on the old `KETCHER_SINGLE_LANGUAGE_BUILD` flag silently loses multi-language support on upgrade (the old flag name is no longer read by either package) — this is a breaking change for multi-language consumers and must be called out in release notes/changelog.
- Jest's i18n regression guards (`i18n.test.ts`, `noHardcodedStrings.test.ts`) must force `KETCHER_MULTI_LANGUAGE_BUILD=true` in `jest.setup.js` so they keep exercising full-language parity regardless of the shipped default — otherwise the test environment would silently validate only the English-only code path.
