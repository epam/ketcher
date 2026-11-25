# Adding templates through the Ketcher API

`ketcher.addTemplate()` adds a molecular structure to the template library at
runtime. Database templates in the bottom toolbar scroll horizontally when they
exceed the available width; the Structure Library button remains visible.
It does not place the structure on the drawing canvas. The user selects
the template and then clicks the canvas to place it.

## API

```ts
addTemplate(
  structure: string,
  name: string,
  group?: string,
): Promise<void>;
```

| Parameter   | Required | Description                                                                                                                      |
| ----------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `structure` | Yes      | A structure string in a format supported by the configured Ketcher structure service, such as SMILES, MOL, CML, or KET.          |
| `name`      | Yes      | The template's display name. Leading and trailing whitespace is trimmed; whitespace-only names are rejected.                     |
| `group`     | No       | The library group. Defaults to `User Templates`. Use exactly `DB Templates` to display database templates in the bottom toolbar. |

Call the method after the editor has initialized and its Ketcher instance is
available. For example, in an application that exposes the instance as
`window.ketcher`:

```js
await window.ketcher.addTemplate('C1CC1', 'Cyclopropane');

await window.ketcher.addTemplate('C1CCC1', 'Cyclobutane', 'DB Templates');
```

The returned promise resolves after parsing the structure and dispatching the
template-library update. It does not wait for the toolbar preview to finish
rendering.

## JSON input from a database or HTTP API

The method takes the three arguments above, rather than a JSON object directly.
A caller can use the following JSON record and pass its fields to the method:

```json
{
  "name": "Cyclopropane",
  "structure": "C1CC1",
  "group": "DB Templates"
}
```

`name` and `structure` must be non-empty strings. The trimmed `name` must also be
non-empty. `group` is an optional string;
omit it to use `User Templates`. Non-string group values are rejected before
structure parsing. The structure is a string even when it contains
serialized KET JSON. Multiline MOL or CML strings must use JSON newline escapes
(`\n`) when stored in a JSON payload.

```js
const record = {
  name: 'Cyclopropane',
  structure: 'C1CC1',
  group: 'DB Templates',
};

await window.ketcher.addTemplate(record.structure, record.name, record.group);
```

For several templates, return an array of records:

```json
[
  {
    "name": "Cyclopropane",
    "structure": "C1CC1",
    "group": "DB Templates"
  },
  {
    "name": "Cyclobutane",
    "structure": "C1CCC1",
    "group": "DB Templates"
  }
]
```

Load records sequentially to preserve their order in the library and toolbar:

```js
async function loadTemplates(ketcher, records) {
  for (const record of records) {
    await ketcher.addTemplate(record.structure, record.name, record.group);
  }
}
```

## Groups and toolbar previews

- Templates in `User Templates` or another custom group are added to the library.
- Templates in `DB Templates` also appear in the bottom toolbar, in insertion
  order. When that group contains templates, those templates replace the default
  bottom-toolbar templates.
- Without any `DB Templates`, the bottom toolbar keeps the default templates.
- Database toolbar buttons do not advertise the built-in `T` shortcut, which
  still selects built-in structures. Select database templates by clicking their
  previews. Runtime template shortcut mapping is not currently supported.
- Database previews use `window.ketcher.generateImage()`. Expose the initialized
  Ketcher instance as `window.ketcher` in the same window or iframe as the editor
  to enable those previews.

## Errors and lifecycle

Missing, empty, or non-string `structure` and `name` values reject the promise
with `Template structure is required` or `Template name is required`. Structure
parsing failures also reject the promise and do not add a template.

```js
try {
  await window.ketcher.addTemplate(record.structure, record.name, record.group);
} catch (error) {
  console.error('Template could not be loaded:', record.name, error);
}
```

Templates added through this method survive asynchronous library loading and
library reinitialization after settings changes within the current editor session.
They are released when the editor is cleaned up.

Templates added through this method are held in the current editor session;
the method does not save them to a backend or automatically persist them across
reloads. Reload them from your data source after initializing the editor. Each
call appends a template, so repeated calls can create duplicates.

The current implementation sends the library update through a window-level
event. Editors sharing the same window receive the same update. Use separate
iframes when editor instances need independent runtime template libraries.

## Running the tests

From the repository root, generate the KET validation schema and run the focused
API and library tests with Vitest:

```sh
npm run ajv --workspace=packages/ketcher-core
npm run test:unit --workspace=packages/ketcher-core -- __tests__/application/addTemplate.test.ts
npm run test:unit --workspace=packages/ketcher-react -- src/script/ui/state/templates/addTemplate.test.ts
```
