import type { Struct } from 'ketcher-core';

type StructureSelection = {
  atoms?: number[];
  bonds?: number[];
};

/**
 * Returns whether the given selection (or the whole structure, when no
 * selection is passed) forms a single connected component, by running a BFS
 * over the selected bonds.
 *
 * Extracted from `Editor` so consumers (e.g. React components) can reuse it
 * without importing the whole `Editor` class, which would risk reintroducing
 * the circular dependencies that were recently refactored away.
 */
export function isStructureContinuous(
  struct: Struct,
  selection?: StructureSelection,
): boolean {
  const atomIds = selection
    ? selection.atoms ?? []
    : Array.from(struct.atoms.keys());
  const bondIds = selection
    ? selection.bonds ?? []
    : Array.from(struct.bonds.keys());

  if (atomIds.length === 0) {
    return false;
  }

  const adjacencyList = new Map<number, number[]>();
  for (const atomId of atomIds) {
    adjacencyList.set(atomId, []);
  }
  bondIds.forEach((bondId) => {
    const bond = struct.bonds.get(bondId);
    if (!bond) {
      return;
    }

    const { begin, end } = bond;
    if (adjacencyList.has(begin) && adjacencyList.has(end)) {
      adjacencyList.get(begin)?.push(end);
      adjacencyList.get(end)?.push(begin);
    }
  });

  const visited = new Set<number>();
  const queue = [atomIds[0]];

  while (queue.length > 0) {
    const nextAtomId = queue.shift();
    if (nextAtomId !== undefined && !visited.has(nextAtomId)) {
      visited.add(nextAtomId);
      for (const neighbor of adjacencyList.get(nextAtomId) ?? []) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  return visited.size === atomIds.length;
}

/**
 * Returns whether a set of selected atoms forms a single connected component.
 *
 * The bonds are derived from the selected atoms (every bond whose endpoints are
 * both selected) rather than taken from `structureSelection.bonds`: canvas
 * selections frequently carry only atoms — e.g. shift-clicking individual atoms,
 * which is exactly how a non-continuous selection is made — so the selection's
 * bond list can be empty even for a chemically connected set, which would make
 * a connected selection look non-continuous.
 *
 * An empty selection is treated as continuous (callers gate the empty case via
 * a separate "has selection" check).
 */
export function isAtomSelectionContinuous(
  struct: Struct,
  atomIds: number[],
): boolean {
  if (atomIds.length === 0) {
    return true;
  }

  const selectedAtomIds = new Set(atomIds);
  const bondIds = Array.from(struct.bonds.entries())
    .filter(
      ([, bond]) =>
        selectedAtomIds.has(bond.begin) && selectedAtomIds.has(bond.end),
    )
    .map(([id]) => id);

  return isStructureContinuous(struct, { atoms: atomIds, bonds: bondIds });
}
