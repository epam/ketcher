/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/**
 * Rolldown's CJS renderer has a known bug (confirmed in Rolldown's own test
 * suite: crates/rolldown/tests/rolldown/topics/exports/README.md, "Bugs
 * Found" - "Test #1: Entry + Cjs + Default + default") where the shared
 * CJS/ESM-interop runtime helpers it injects into a bundle (`__toESM`,
 * `__toCommonJS`, `__name`, ...) can leak into that bundle's own emitted
 * named exports. For an entry composed of many `export * from` barrels with
 * `output.exports: 'named'` - ketcher-react's shape - this surfaces as an
 * extra top-level `exports.__toESM = __toESM;` assignment alongside the
 * package's real exports (verified empirically: the `es` output for the
 * same entry never needs or emits this helper at all, and master's
 * pre-Rolldown Rollup build never exported it either). It is a bundler
 * implementation detail, not part of the package's public API.
 *
 * This plugin strips the leaked `exports.<helperName> = <helperName>;`
 * line(s) from entry chunks of the given output `format`, leaving every
 * other export - and the helper's normal internal use earlier in the same
 * chunk, which real interop still needs - untouched. `helperNames` defaults
 * to `__toESM`, the one helper observed leaking today; pass more if a future
 * Rolldown version starts leaking others.
 *
 * The removed line is part of the synthetic export trailer Rolldown appends
 * after all real code, not a mapped source line, so dropping the chunk's
 * sourcemap for this transform (`map: null`) does not affect the accuracy of
 * any other line's mapping.
 */
export const createStripLeakedRuntimeExportsPlugin = ({
  format,
  helperNames = ['__toESM'],
}) => ({
  name: 'strip-leaked-runtime-exports',
  renderChunk(code, chunk, outputOptions) {
    if (outputOptions.format !== format || !chunk.isEntry) {
      return null;
    }

    let result = code;
    for (const helperName of helperNames) {
      result = result.replace(
        new RegExp(`^exports\\.${helperName} = ${helperName};\\n`, 'm'),
        '',
      );
    }

    return result === code ? null : { code: result, map: null };
  },
});
