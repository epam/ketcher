---
name: add-localstorage-setting
description: 'Persist a new setting in LocalStorage via the ketcher-opts mechanism and wire it into a React component in ketcher-react. Use when: a component needs to remember user preferences, UI state, or editor options across page reloads; adding a new field to SettingsService and reading/writing it through the useSettings hook; replacing direct localStorage access with the standard settings store.'
argument-hint: '<setting-name> <type> <default> in <component-file-path> — e.g. colorPickerCustomColors string[] [] in src/script/ui/component/form/colorPicker/ColorPicker.tsx'
---

# Add a New LocalStorage Setting

## Before You Start

This skill needs four pieces of information. If any are missing from the request, **ask the user before writing any code**:

| #   | What you need                                                                             | Example                                                                                            |
| --- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | **Setting name** (camelCase)                                                              | `colorPickerCustomColors`                                                                          |
| 2   | **TypeScript type**                                                                       | `readonly string[]`, `boolean`, `'px' \| 'pt'`                                                     |
| 3   | **Default value**                                                                         | `[]`, `false`, `'px'`                                                                              |
| 4   | **Target component path** and how it uses the setting (read-only? writes on which event?) | `src/script/ui/component/form/colorPicker/ColorPicker.tsx` — reads on open, writes on Apply/Delete |

Only proceed once all four are clear.

---

## Overview

All persistent settings live under the `ketcher-opts` key in `localStorage`, managed through a centralized `SettingsService` in `ketcher-core`. React components read and write settings via the `useSettings` hook.

A complete addition touches **four locations**:

| #   | File                                                       | What to add                                                     |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | `packages/ketcher-core/src/application/settings/types.ts`  | Field declaration in `Settings` interface                       |
| 2   | `packages/ketcher-core/src/application/settings/schema.ts` | Default value in `DEFAULT_SETTINGS` + JSON Schema entry         |
| 3   | React component (or hook)                                  | Read via `settings?.fieldName`; write via `updateSettings(...)` |
| 4   | Component test file                                        | Mock `useSettings`; assert `updateSettings` calls               |

---

## Step 1 — Declare the field in the `Settings` interface

File: `packages/ketcher-core/src/application/settings/types.ts`

Add a `readonly` field at the bottom of the interface, grouped by domain:

```typescript
// My feature
readonly myNewSetting: string;          // scalar
readonly myNewArraySetting: readonly string[];  // array — always readonly
```

**Rules**

- Mark every field `readonly` (settings objects are frozen by the service).
- Use the narrowest type possible (e.g. `'px' | 'pt'` instead of `string`).
- Arrays must be `readonly T[]`, not `T[]`.

---

## Step 2 — Register the default value and JSON Schema

File: `packages/ketcher-core/src/application/settings/schema.ts`

### 2a — Default value in `DEFAULT_SETTINGS`

Add inside the matching domain comment block (or create a new one):

```typescript
// My feature
myNewSetting: 'defaultValue',
myNewArraySetting: [],
```

### 2b — JSON Schema entry in `SCHEMA.properties`

Add next to the default value block:

```typescript
// My feature
myNewSetting: { type: 'string' },
myNewArraySetting: { type: 'array', items: { type: 'string' } },
```

Common schema patterns:
| TypeScript type | JSON Schema |
|-----------------|-------------|
| `string` | `{ type: 'string' }` |
| `number` | `{ type: 'number', minimum: 0, maximum: 100 }` |
| `boolean` | `{ type: 'boolean' }` |
| `'a' \| 'b' \| 'c'` | `{ enum: ['a', 'b', 'c'] }` |
| `readonly string[]` | `{ type: 'array', items: { type: 'string' } }` |
| `Record<string, number>` | `{ type: 'object' }` |

---

## Step 3 — Read and write in a React component

### 3a — Import the hook

```typescript
import { useSettings } from 'src/hooks';
```

### 3b — Destructure inside the component

```typescript
const { settings, updateSettings } = useSettings();
```

### 3c — Read the setting

```typescript
// settings is null until the service initializes — always use optional chaining
const value = settings?.myNewSetting ?? defaultFallback;

// For arrays — spread to get a mutable copy if needed
const items = [...(settings?.myNewArraySetting ?? [])];
```

### 3d — Write the setting

`updateSettings` is async and performs a deep merge — pass only the fields that changed:

```typescript
// In an event handler or callback
updateSettings({ myNewSetting: newValue });

// For arrays, compute the new array first, then update state and service together
const newItems = computeNewItems(currentItems, input);
setLocalState(newItems);
updateSettings({ myNewArraySetting: newItems });
```

**Important**

- Do **not** use `void` or `.catch(() => {})` — both trigger ESLint errors (`no-confusing-void-expression`, `no-empty-function`). Just call `updateSettings(...)` without awaiting unless you need the result.
- Do **not** read from or write to `localStorage` directly. Always go through `updateSettings` / `settings`.
- `settings` is `null` on the first render (async init). Always guard with `?? fallback`.
- If you need a local UI state that mirrors the setting, initialize it to `[]` / `null` / `''` and populate it on first meaningful interaction (e.g., when a picker opens), reading from `settings` at that point.

---

## Step 4 — Test the component

### 4a — Mock `useSettings` at the top of the test file

```javascript
import { useSettings } from 'src/hooks';
jest.mock('src/hooks', () => ({
  useSettings: jest.fn(),
}));
```

### 4b — Set up mock state in `beforeEach`

```javascript
let mockSettings;
let mockUpdateSettings;

beforeEach(() => {
  mockSettings = { myNewSetting: 'default', myNewArraySetting: [] };
  mockUpdateSettings = jest.fn().mockResolvedValue({});
  useSettings.mockReturnValue({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
  });
});
```

### 4c — Test initial state (reading from service)

Set the desired value on `mockSettings` **before** rendering:

```javascript
it('should display value from settings', () => {
  mockSettings.myNewSetting = 'custom';
  renderComponent();
  // assert UI reflects 'custom'
});
```

### 4d — Test persistence (writing to service)

Assert that `updateSettings` was called with the expected partial:

```javascript
it('should persist new value via SettingsService', async () => {
  renderComponent();
  // perform user interaction that changes the setting
  expect(mockUpdateSettings).toHaveBeenCalledWith(
    expect.objectContaining({ myNewSetting: 'expectedValue' }),
  );
});
```

### 4e — Test service update between renders

To simulate the service returning different data (e.g., cross-tab sync), update `mockSettings` and call `useSettings.mockReturnValue` again before triggering a re-render:

```javascript
mockSettings.myNewArraySetting = ['newValue'];
useSettings.mockReturnValue({
  settings: mockSettings,
  updateSettings: mockUpdateSettings,
});
// trigger re-render / re-open
```

---

## Checklist

- [ ] Field added to `Settings` interface (`types.ts`) as `readonly`
- [ ] Default value added to `DEFAULT_SETTINGS` (`schema.ts`)
- [ ] JSON Schema entry added to `SCHEMA.properties` (`schema.ts`)
- [ ] Component reads via `settings?.fieldName ?? fallback`
- [ ] Component writes via `updateSettings({ fieldName: newValue })`
- [ ] No direct `localStorage` access in the component
- [ ] Test mocks `useSettings` with `jest.mock`
- [ ] Test verifies initial render from `mockSettings`
- [ ] Test asserts `mockUpdateSettings` call arguments
- [ ] TypeScript: no new compile errors in `types.ts` or `schema.ts`

---

## Key Files Reference

| Purpose                | Path                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| Settings interface     | `packages/ketcher-core/src/application/settings/types.ts`               |
| Defaults + schema      | `packages/ketcher-core/src/application/settings/schema.ts`              |
| Service implementation | `packages/ketcher-core/src/application/settings/SettingsService.ts`     |
| LocalStorage adapter   | `packages/ketcher-core/src/application/settings/LocalStorageAdapter.ts` |
| React hook             | `packages/ketcher-react/src/hooks/useSettings.ts`                       |
| Hooks barrel export    | `packages/ketcher-react/src/hooks/index.ts`                             |
