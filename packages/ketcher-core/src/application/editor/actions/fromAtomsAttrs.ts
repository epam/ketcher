import { Atom } from 'domain/entities';
import { AtomAttr, CalcImplicitH } from '../operations';
import { Action } from './action';
import { fromBondStereoUpdate } from './bond';
import ReStruct from 'application/render/restruct/restruct';
import assert from 'assert';

export function fromAtomsAttrs(
  restruct: ReStruct,
  ids: Array<number> | number,
  attrs: Partial<Record<string, unknown>>,
  reset: boolean | null,
) {
  const action = new Action();
  const aids = Array.isArray(ids) ? ids : [ids];

  aids.forEach((atomId) => {
    Object.keys(Atom.attrlist).forEach((key) => {
      if (key === 'attachmentPoints' && !(key in attrs)) return;
      if (!(key in attrs) && !reset) return;

      const value = key in attrs ? attrs[key] : Atom.attrGetDefault(key);

      switch (key) {
        case 'stereoLabel':
        case 'stereoParity':
          if (key in attrs && value) {
            action.addOp(new AtomAttr(atomId, key, value).perform(restruct));
          }
          break;
        default:
          action.addOp(new AtomAttr(atomId, key, value).perform(restruct));
          break;
      }
    });

    if (
      !reset &&
      'label' in attrs &&
      attrs.label !== null &&
      attrs.label !== 'L#' &&
      !('atomList' in attrs)
    ) {
      action.addOp(new AtomAttr(atomId, 'atomList', null).perform(restruct));
    }

    action.addOp(new CalcImplicitH([atomId]).perform(restruct));

    const atomNeighbors = restruct.molecule.atomGetNeighbors(atomId);
    const bond = restruct.molecule.bonds.get(atomNeighbors?.[0]?.bid as number);
    if (bond) {
      action.mergeWith(fromBondStereoUpdate(restruct, bond));
    }
    // when a heteroatom connects to an aromatic ring it's necessary to add a ImplicitHCount
    // property to this atom to specify the number of hydrogens on it.
    const atom = restruct.molecule.atoms.get(atomId);
    assert(atom != null);

    if (Atom.isInAromatizedRing(restruct.molecule, atomId)) {
      action.addOp(
        new AtomAttr(atomId, 'implicitHCount', atom.implicitH).perform(
          restruct,
        ),
      );
    }
  });

  return action;
}
