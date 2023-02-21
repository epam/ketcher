import { ReBond, ReStruct, isAttachmentBond } from 'ketcher-core'

export function isFlipDisabled(editor): boolean {
  const selection: { atoms: number[]; bonds: number[] } = editor.selection()
  const restruct: ReStruct = editor.render.ctab

  if (!selection) {
    return false
  }

  const { bonds = [], atoms = [] } = selection
  const getBondIdsForAtom = (atomId: number) => {
    const result: number[] = []
    for (const [bondId, bond] of restruct.bonds.entries()) {
      if (bond.b.begin === atomId || bond.b.end === atomId) {
        result.push(bondId)
      }
    }
    return result
  }
  const getBondIdsForAttachmentAtoms = () => {
    const result: number[] = []
    for (const atomId of atoms) {
      const atomBondIds = getBondIdsForAtom(atomId)
      for (const atomBondId of atomBondIds) {
        const bond: ReBond | undefined = restruct.bonds.get(atomBondId)
        if (bond && isAttachmentBond(bond.b, selection)) {
          result.push(atomBondId)
        }
      }
    }
    return result
  }
  const getAmountOfAttachmentBonds = (): number => {
    let amountOfAttachmentBonds = 0
    const totalBondIds = new Set([...bonds, ...getBondIdsForAttachmentAtoms()])
    for (const bondId of totalBondIds) {
      const bond: ReBond | undefined = restruct.bonds.get(bondId)
      if (bond && isAttachmentBond(bond.b, selection)) {
        amountOfAttachmentBonds++
      }
    }

    return amountOfAttachmentBonds
  }

  return getAmountOfAttachmentBonds() > 1
}
