# Ketcher AI Collaboration Rules

Use these rules for every AI role that generates or edits code in this repository.

## Project Defaults

- Follow existing Ketcher architecture and file patterns before introducing new structures.
- Prefer TypeScript, React functional components, Redux Toolkit, and immutable updates.
- Keep changes local to the task. Do not perform wide cleanup unless the task asks for it.

## Mandatory Code Generation Guardrails

- Prefer the nullish coalescing operator (`??`) over logical OR (`||`) for fallback values unless boolean coercion is explicitly required.
- Mark React component props as readonly. Use `Readonly<...>` or `readonly` fields in the props type.
- Do not assign values inside sub-expressions such as conditions, ternaries, returns, or callbacks. Split the assignment into a standalone statement.
- Mark class fields as `readonly` when they are assigned only in the constructor.
- Use `startsWith()` and `endsWith()` for prefix and suffix checks instead of manual string slicing, regex checks, or index math when the intent is a string boundary check.
- Do not nest ternary operators. Extract the nested decision into a separate variable, helper, or `if` statement.
- Avoid redundant type casts and non-null assertions. Narrow the type instead.
- Avoid unspecified `any`. Prefer a precise interface or type when the shape is known, or `unknown` when the shape is not known yet.
- Before introducing a new type, check whether an existing declaration already covers the case. If not, create a reusable declaration in `types.ts` when it can be shared outside the current file.
- Extract repeated or semantically meaningful union types into a named type alias instead of leaving them inline.
- Remove unused typed React props from touched components.
- Remove unused React component methods or local helpers from touched components.

## While Editing Existing Code

- Apply these guardrails to all new code and to the area you touch.
- If a nearby violation is easy and safe to fix as part of the task, fix it.
- If a broader cleanup would create noise or risk, leave it out and mention it in the handoff.

## Skill Hook

- If the active AI system supports project skills, use `.codex/skills/ketcher-code-generation-guardrails` for TypeScript and React code generation or review work.
