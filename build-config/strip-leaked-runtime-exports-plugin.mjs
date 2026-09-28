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
 * This plugin strips the leaked `exports.__toESM = __toESM;` line(s) from
 * entry chunks of the given output `format`, leaving every other export -
 * and the helper's normal internal use earlier in the same chunk, which real
 * interop still needs - untouched. Only `__toESM` is handled: it is the one
 * helper observed leaking today, and a text-only strip cannot safely be
 * generalised to helpers whose leaked form isn't known - see the two checks
 * below for what happens if that stops being true.
 *
 * The removed line is part of the synthetic export trailer Rolldown appends
 * after all real code, not a mapped source line, so dropping the chunk's
 * sourcemap for this transform (`map: null`) does not affect the accuracy of
 * any other line's mapping.
 */
// Tolerant of the leading indentation, any spacing around `=`, an optional
// trailing `;`, and either line-ending style - the shape Rolldown emits this
// trailer in is not a documented contract. Anchored to the exact
// self-assignment form (`exports.__toESM = __toESM`) so it only ever removes
// the specific leaked trailer line, never a real export of something that
// happens to be named `__toESM`.
const leakedExportLineRE =
  /^[ \t]*exports\.__toESM\s*=\s*__toESM\s*;?[ \t]*\r?\n/gm;

// A deliberately looser check than `leakedExportLineRE`: any reference that
// makes `__toESM` reachable as a property of `exports` at all - dot access,
// bracket access with either quote style - regardless of how it's assigned.
// Used only to confirm the export is gone after the narrow strip above, so a
// future Rolldown release emitting this in a shape the narrow regex doesn't
// match (different assignment form, `Object.defineProperty`, ...) is caught
// as a leftover instead of silently passing because the exact same pattern
// that just ran was, tautologically, satisfied.
const stillExportsHelperRE =
  /\bexports(?:\.__toESM\b|\[\s*["']__toESM["']\s*\])/;

export const createStripLeakedRuntimeExportsPlugin = ({ format }) => ({
  name: 'strip-leaked-runtime-exports',
  renderChunk(code, chunk, outputOptions) {
    if (outputOptions.format !== format || !chunk.isEntry) {
      return null;
    }

    leakedExportLineRE.lastIndex = 0;
    if (!leakedExportLineRE.test(code)) {
      return null;
    }

    leakedExportLineRE.lastIndex = 0;
    const result = code.replace(leakedExportLineRE, '');

    // Check the export itself, not just a second pass of the same narrow
    // regex that did the removal (which could only ever confirm itself) -
    // if the chunk still exports `__toESM` in any form after the rewrite,
    // this plugin has failed at the one thing it exists to do.
    if (stillExportsHelperRE.test(result)) {
      this.error(
        `strip-leaked-runtime-exports: "${chunk.fileName}" still exports ` +
          '__toESM after the rewrite - the leaked interop-helper assignment ' +
          "this plugin strips didn't match the shape Rolldown emitted this " +
          'time; see this file for the fix that needs revisiting.',
      );
    }

    return { code: result, map: null };
  },
});
