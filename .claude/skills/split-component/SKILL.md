---
name: split-component
description: 'Split a bloated React component file into multiple co-located files following Ketcher project conventions. Use when: a component file has grown too large; it mixes constants, utility functions, and subcomponents in one file; you want to improve maintainability by separating concerns. Produces: ComponentName.constants.ts, ComponentName.utils.ts, SubComponentName.tsx — all co-located flat in the same folder, with a barrel index.ts. A ComponentName.types.ts may be created for shared domain types, but component props interfaces always stay local to their component file.'
argument-hint: 'Path to the component file to split (e.g. src/.../MyComponent.tsx)'
---

# Split Component

Splits a large component file into multiple co-located files following Ketcher project conventions.

## File Layout (Ketcher conventions)

| Content             | File                                   | Example                    |
| ------------------- | -------------------------------------- | -------------------------- |
| Main component      | `ComponentName.tsx`                    | `ColorPicker.tsx`          |
| Constants           | `ComponentName.constants.ts`           | `ColorPicker.constants.ts` |
| Utilities & helpers | `ComponentName.utils.ts`               | `ColorPicker.utils.ts`     |
| Sub-components      | `SubComponentName.tsx` (flat, sibling) | `ColorSlider.tsx`          |
| CSS module          | `ComponentName.module.less`            | `ColorPicker.module.less`  |
| Barrel export       | `index.ts`                             | `index.ts`                 |
| Shared domain types | `ComponentName.types.ts` (optional)    | `ColorPicker.types.ts`     |
| Props / interfaces  | **Stay local** in the component file   | —                          |

**A `.types.ts` file may be created** for types shared across multiple files in the folder (domain types, enums, utility types). **Component props interfaces are NOT placed there** — they live in the same file as the component that owns them.

## Steps

### 1. Analyse the source file

Read the target file and categorise its top-level declarations:

- **Constants** — module-level `const` values (arrays, numbers, strings)
- **Utilities** — pure functions that contain no JSX and use no React hooks
- **Sub-components** — functions/arrow functions that return JSX (other than the main component)
- **Shared domain types** — types/enums used across multiple files in the folder → `ComponentName.types.ts`
- **Props interfaces** — stay in place in their component file, do not move
- **Main component** — stays in the original file

### 2. Create only the files that are needed

Create a file only if it will contain at least one item:

**`ComponentName.constants.ts`**

```ts
// license header

export const MY_CONSTANT = ...;
export const MY_ARRAY = [...];
```

**`ComponentName.utils.ts`**

```ts
// license header

import { MY_CONSTANT } from './ComponentName.constants'; // if needed

export function myHelper(...) { ... }
export function anotherHelper(...) { ... }
```

**`SubComponentName.tsx`** (one file per sub-component)

```tsx
// license header

import { ... } from 'react';
import classes from './ParentComponent.module.less'; // reuses the parent CSS module

interface SubComponentNameProps { // interface stays local to this file
  ...
}

function SubComponentName({ ... }: SubComponentNameProps) {
  ...
}

export default SubComponentName;
```

**`index.ts`**

```ts
// license header

export { default } from './ComponentName';
```

### 4. Update the main file

- Remove the extracted constants, utilities, and sub-components
- Add imports from the new files
- Merge split `Props` + `CallProps` into a single interface if they were separate
- Keep `Props` unexported unless it is used outside the folder

### 5. Check for errors

Run `get_errors` on the entire component folder and fix any issues found.
Pay special attention to:

- `import type` instead of `import` for type-only imports
- Multi-line import style (the project requires each named import on its own line)

## What NOT to do

- ❌ Do not put component props interfaces in `ComponentName.types.ts` — props stay in their component file
- ❌ Do not extract functions that use React hooks (`useState`, `useCallback`, etc.) into utils
- ❌ Do not create a `components/` sub-folder for simple sub-components — they live flat alongside the parent
- ❌ Do not rename CSS classes or modify the `.module.less` file
- ❌ Do not add `export` to props interfaces unless they are consumed outside the folder
