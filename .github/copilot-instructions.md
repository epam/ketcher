# Guidelines for Using GitHub Copilot in the Ketcher Project

This document defines how GitHub Copilot should behave when assisting contributors working on the Ketcher web application. Keep generated code consistent with Ketcher's architecture, coding standards, and domain-specific constraints.

## Project Overview

Ketcher is an open-source chemical structure editor built with TypeScript, React, Redux, and a custom MVC-style architecture for rendering and editing molecules, reactions, macromolecules, and monomers.

Copilot should generate solutions compatible with:

- TypeScript in strict mode
- React functional components
- Redux Toolkit
- Immutable state principles
- Ketcher's MVC architecture

Architecture boundaries:

- Model: chemical objects such as atoms, bonds, monomers, and coordinates
- View: SVG-based rendering and visual helpers
- Controller: tools, user actions, and interaction logic

## General Rules

Copilot should:

- Prefer TypeScript over JavaScript.
- Follow existing Ketcher file patterns before introducing new structures.
- Use strict typing, pure functions where practical, and React plus Redux Toolkit patterns for UI logic.
- Preserve model immutability unless state changes happen through the accepted reducers or actions.
- Reuse existing Ketcher services, helpers, actions, and controllers when possible.
- Keep domain constraints intact, including Ketcher-specific identifiers and chemistry-related validation rules.
- Keep comments concise and focused on non-obvious domain or algorithmic logic.

Copilot should not:

- Mutate Redux state directly.
- Introduce libraries that are not already used by the project unless explicitly requested.
- Invent new APIs or file structures without a clear need.
- Use React class components.
- Hide magic numbers without context.
- Break architectural boundaries between model, view, and controller layers.

## Mandatory Code Generation Guardrails

These guardrails apply to every Copilot role and every generated or edited code snippet:

- Prefer `??` over `||` for fallback values unless boolean behavior is explicitly intended.
- Mark React component props as readonly by using `Readonly<...>` or `readonly` fields in the props type.
- Do not assign values inside sub-expressions such as conditions, ternaries, returns, or callbacks. Move the assignment into a separate statement.
- Mark class fields as `readonly` when they are assigned only in the constructor.
- Use `startsWith()` and `endsWith()` for prefix and suffix checks instead of manual slicing, regular expressions, or index math when checking string boundaries.
- Do not nest ternary operators. Extract the decision into a separate variable, helper, or `if` block.
- Avoid redundant casts and non-null assertions. Prefer type narrowing and early returns.
- Avoid unspecified `any`. Prefer a precise interface or type when the shape is known, or `unknown` when the shape is not known yet.
- Before introducing a new type, check whether an existing declaration already covers the case. If not, create a reusable declaration in `types.ts` when it can be shared outside the current file.
- Extract repeated or semantically meaningful union types into a named type alias instead of leaving them inline.
- Remove unused typed React props from touched components.
- Remove unused React component methods or local helpers from touched components.

## Typical Tasks Copilot Should Assist With

- Generating utilities for atom and bond operations.
- Parsing or producing Molfile V2000 and V3000 blocks.
- Implementing coordinate transformations and layout calculations.
- Handling stereochemistry, CFG tags, and polymer or monomer logic.
- Adding or refining editor tools, selections, highlights, drag behavior, and transforms.
- Improving SVG rendering helpers.
- Building dialogs, menus, context panels, wizards, and validation flows in React.

## Copilot Behavior Principles

Copilot must:

- Prioritize existing Ketcher patterns over generic web-development shortcuts.
- Generate safe, readable, and testable code.
- Keep chemistry-related logic explicit when it affects correctness.

Copilot should not:

- Perform large refactors unless asked.
- Suggest major architectural changes without justification.
- Produce code that violates chemistry or domain rules.

## Example Prompts for Contributors

Good prompts:

- Generate a helper to restore monomer coordinates when switching from snake mode to flex mode.
- Create a Redux slice for storing macromolecule editor settings.
- Implement a controller action for dragging a monomer along the polymer backbone.
- Add a typed utility for computing CFG stereochemistry from V3000 data.

Prompts to avoid:

- Rewrite the entire rendering engine.
- Replace Redux with another state library.
- Add Lodash just to map objects.
