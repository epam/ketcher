---
name: ketcher-code-generation-guardrails
description: Enforce Ketcher-specific TypeScript and React code generation guardrails when creating, editing, reviewing, or refactoring `.ts`, `.tsx`, `.js`, and `.jsx` files in this repository. Use when Codex needs to produce or review React components, Redux logic, utilities, controllers, or class-based infrastructure and the output must follow the project's nullish-coalescing, readonly, string-boundary, ternary, cast, union-type, and dead-code cleanup rules.
---

# Ketcher Code Generation Guardrails

## Quick Start

- Apply these guardrails to every new or modified line in the current task.
- Read `AGENTS.md` and `.github/copilot-instructions.md` if you need the repo-wide wording.
- Prefer targeted fixes in the touched area over broad style-only refactors.
- Match the existing architecture before inventing new abstractions.

## Mandatory Guardrails

- Prefer `??` instead of `||` for fallback values unless the logic truly depends on falsy coercion.
- Make React component props readonly. Use `Readonly<{ ... }>` or `readonly` fields in the props type.
- Do not assign inside sub-expressions such as `if`, `while`, ternaries, `return`, or callback arguments. Move the assignment into a separate statement.
- Mark class fields as `readonly` when the field is assigned only in the constructor.
- Use `startsWith()` and `endsWith()` for prefix and suffix checks instead of manual slicing, regex checks, or index math when the goal is a boundary check.
- Do not use nested ternaries. Extract the nested branch into a local variable, helper, or `if` statement.
- Avoid redundant casts and non-null assertions. Narrow the type with guards, optional chaining, or early returns.
- Avoid unspecified `any`. Prefer a precise interface or type when the shape is known, or `unknown` when the shape is not known yet.
- Before introducing a new type, check whether an existing declaration already covers the case. If not, create a reusable declaration in `types.ts` when it can be shared outside the current file.
- Extract repeated or domain-meaningful union types into a named type alias instead of repeating inline unions.
- Remove unused typed React props from the component you touch.
- Remove unused React component methods or local helpers from the component you touch.

## Editing Strategy

- Keep compatibility with Ketcher's TypeScript, React, Redux Toolkit, and immutable-update patterns.
- Reuse existing helpers, services, controllers, and slices before adding new ones.
- If the surrounding code violates a guardrail, fix only the nearby cases that are clearly safe and in scope.
- If a wider cleanup is desirable but out of scope, mention it in the handoff instead of expanding the patch.

## Review Checklist

- Are all fallback expressions using `??` unless falsy behavior is intentional?
- Are component props readonly?
- Are assignments separated from conditions and other sub-expressions?
- Are constructor-only fields marked readonly?
- Are prefix or suffix checks using `startsWith()` and `endsWith()`?
- Have nested ternaries been flattened?
- Were unnecessary casts and non-null assertions removed?
- Was unspecified `any` avoided in favor of an existing type, a new typed declaration, or `unknown`?
- If a new reusable type was needed, was it added to `types.ts` instead of being duplicated inline?
- Were meaningful union types extracted into aliases?
- Were unused typed props removed?
- Were unused component methods or helpers removed?
