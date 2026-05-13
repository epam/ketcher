/**
 * Shared, lazily-populated monomer size cache.
 *
 * Extracted from `BaseMonomerRenderer` so that domain-layer code
 * (e.g. `Nucleoside.createOnCanvas`, `Nucleotide.createOnCanvas`) can read
 * the runtime-measured monomer body dimensions without importing the full
 * renderer class — which would introduce circular dependencies.
 *
 * The value starts at `{ width: 0, height: 0 }` and is populated on the
 * first render pass when a `BaseMonomerRenderer` instance is constructed and
 * reads the actual dimensions from the DOM symbol element.
 */

let _monomerSize: { width: number; height: number } = { width: 0, height: 0 };

export function getMonomerSize(): { width: number; height: number } {
  return _monomerSize;
}

export function setMonomerSize(size: { width: number; height: number }): void {
  _monomerSize = size;
}
