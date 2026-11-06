/**
 * Runtime-measured monomer body size, owned by the domain.
 *
 * `Nucleoside.createOnCanvas` and `Nucleotide.createOnCanvas` read the height
 * to lay out the monomers they create. `BaseMonomerRenderer` writes the value
 * when it is first constructed, from the DOM symbol element.
 *
 * The value starts at `{ width: 0, height: 0 }` and keeps that until the first
 * monomer renderer is built.
 */

let _monomerSize: { width: number; height: number } = { width: 0, height: 0 };

export function getMonomerSize(): { width: number; height: number } {
  return _monomerSize;
}

export function setMonomerSize(size: { width: number; height: number }): void {
  _monomerSize = size;
}
