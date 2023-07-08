import { Atom, ReBond, ReStruct, isAttachmentBond } from 'ketcher-core';

export function isFlipDisabled(editor): boolean {
  const selection: { atoms: number[]; bonds: number[] } = editor.selection();
  const restruct: ReStruct = editor.render.ctab;

  if (!selection) {
    return false;
  }

  const { bonds = [], atoms = [] } = selection;
  const getBondIdsForAttachmentAtoms = () => {
    const result: number[] = [];
    for (const atomId of atoms) {
      const atomBondIds = Atom.getConnectedBondIds(restruct.molecule, atomId);
      for (const atomBondId of atomBondIds) {
        const bond: ReBond | undefined = restruct.bonds.get(atomBondId);
        if (bond && isAttachmentBond(bond.b, selection)) {
          result.push(atomBondId);
        }
      }
    }
    return result;
  };
  const getAmountOfAttachmentBonds = (): number => {
    let amountOfAttachmentBonds = 0;
    const totalBondIds = new Set([...bonds, ...getBondIdsForAttachmentAtoms()]);
    for (const bondId of totalBondIds) {
      const bond: ReBond | undefined = restruct.bonds.get(bondId);
      if (bond && isAttachmentBond(bond.b, selection)) {
        amountOfAttachmentBonds++;
      }
    }

    return amountOfAttachmentBonds;
  };

  return getAmountOfAttachmentBonds() > 1;
}
