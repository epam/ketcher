import {
  Action,
  Atom,
  AtomPropertiesInContextMenu,
  fromAtomsAttrs,
} from 'ketcher-core';
import { updateOnlyChangedProperties } from './utils';

export function isAtomsArray(selectedElements: Atom | Atom[]): boolean {
  return (
    Array.isArray(selectedElements) &&
    selectedElements?.every((element) => element instanceof Atom)
  );
}

export function updateSelectedAtoms({
  atoms,
  changeAtomPromise,
  editor,
}: {
  atoms: number[];
  editor;
  changeAtomPromise: Promise<Atom> | PromiseLike<AtomPropertiesInContextMenu>;
}) {
  const action = new Action();
  const struct = editor.render.ctab;
  const { molecule } = struct;
  if (atoms) {
    Promise.resolve(changeAtomPromise)
      .then((userChangedAtom) => {
        // TODO: deep compare to not produce dummy, e.g.
        // atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)
        atoms.forEach((atomId) => {
          const unchangedAtom = molecule.atoms.get(atomId);
          const atomWithChangedProperties = updateOnlyChangedProperties(
            unchangedAtom,
            userChangedAtom,
          );
          action.mergeWith(
            fromAtomsAttrs(struct, atomId, atomWithChangedProperties, false),
          );
        });
        editor.update(action);
      })
      .catch(() => null);
  }
}
