import type { Atom } from 'domain/entities/CoreAtom';
import type { Bond } from 'domain/entities/CoreBond';
import type { RGroup } from 'domain/entities/rgroup';

export interface RGroupDefinitionMembers {
  rgroup: RGroup;
  atoms: Atom[];
  bonds: Bond[];
}

/** Fragment IDs are local to each molecule, whereas R-group numbers are canvas-wide. */
export function getRGroupDefinitions(
  atoms: Iterable<Atom>,
  bonds: Iterable<Bond>,
): Map<number, RGroupDefinitionMembers> {
  const definitions = new Map<number, RGroupDefinitionMembers>();
  const atomToDefinition = new Map<Atom, RGroupDefinitionMembers>();
  for (const atom of atoms) {
    const struct = atom.monomer.monomerItem.struct;
    const fragmentId = struct.atoms.get(atom.atomIdInMicroMode)?.fragment;
    if (fragmentId === undefined) continue;
    struct.rgroups.forEach((rgroup, id) => {
      if (!rgroup.frags.has(fragmentId)) return;
      let definition = definitions.get(id);
      if (!definition) {
        definition = { rgroup, atoms: [], bonds: [] };
        definitions.set(id, definition);
      }
      definition.atoms.push(atom);
      atomToDefinition.set(atom, definition);
    });
  }
  for (const bond of bonds) {
    const definition = atomToDefinition.get(bond.firstAtom);
    if (definition && definition === atomToDefinition.get(bond.secondAtom)) {
      definition.bonds.push(bond);
    }
  }
  return definitions;
}
