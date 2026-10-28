---
applyTo: 'packages/ketcher-core/src/domain/**'
---

<!-- Generated from .memory-bank/review-rules.md. Do not edit. -->

## R1: Domain code does not import rendering, editor, or React code (major)

Why: Invariant A4 keeps the domain layer free of rendering, editor, and UI imports. Existing violations are listed in accepted-patterns.md. Only new imports are flagged.

Bad: a new `import { provideEditorInstance } from 'application/editor/editorSingleton';` in a file under domain/

Good: move the logic into application/ and pass the domain value into it
