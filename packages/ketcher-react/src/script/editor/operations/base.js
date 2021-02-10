class Base {
  type

  constructor(type) {
    this.type = type
  }

  execute(restruct) {
    throw new Error('Operation.execute() is not implemented')
  }

  perform(restruct) {
    this.execute(restruct)
    if (!this._inverted) {
      this._inverted = this.invert()
      this._inverted._inverted = this
    }
    return this._inverted
  }

  invert() {
    throw new Error('Operation.invert() is not implemented')
  }

  isDummy(restruct) {
    return false
  }
}

export const OperationType = {
  ATOM_ADD: 'Add atom',
  ATOM_DELETE: 'Delete atom',
  ATOM_ATTR: 'Set atom attribute',
  ATOM_MOVE: 'Move atom',
  BOND_ADD: 'Add bond',
  BOND_DELETE: 'Delete bond',
  BOND_ATTR: 'Set bond attribute',
  BOND_MOVE: 'Move bond',
  LOOP_MOVE: 'Move loop',
  S_GROUP_ATOM_ADD: 'Add atom to s-group',
  S_GROUP_ATOM_REMOVE: 'Remove atom from s-group',
  S_GROUP_ATTR: 'Set s-group attribute',
  S_GROUP_CREATE: 'Create s-group',
  S_GROUP_DELETE: 'Delete s-group',
  S_GROUP_ADD_TO_HIERACHY: 'Add s-group to hierarchy',
  S_GROUP_REMOVE_FROM_HIERACHY: 'Delete s-group from hierarchy',
  R_GROUP_ATTR: 'Set r-group attribute',
  R_GROUP_FRAGMENT: 'R-group fragment',
  UPDATE_IF_THEN: 'Update',
  RESTORE_IF_THEN: 'Restore',
  RXN_ARROW_ADD: 'Add rxn arrow',
  RXN_ARROW_DELETE: 'Delete rxn arrow',
  RXN_ARROW_MOVE: 'Move rxn arrow',
  RXN_PLUS_ADD: 'Add rxn plus',
  RXN_PLUS_DELETE: 'Delete rxn plus',
  RXN_PLUS_MOVE: 'Move rxn plus',
  S_GROUP_DATA_MOVE: 'Move s-group data',
  CANVAS_LOAD: 'Load canvas',
  ALIGN_DESCRIPTORS: 'Align descriptors',
  SIMPLE_OBJECT_ADD: 'Add simple object',
  SIMPLE_OBJECT_DELETE: 'Delete simple object',
  SIMPLE_OBJECT_MOVE: 'Move simple object',
  SIMPLE_OBJECT_RESIZE: 'Resize simple object',
  RESTORE_DESCRIPTORS_POSITION: 'Restore descriptors position',
  FRAGMENT_ADD: 'Add fragment',
  FRAGMENT_DELETE: 'Delete fragment',
  FRAGMENT_STEREO_FLAG: 'Add fragment stereo flag',
  FRAGMENT_ADD_STEREO_ATOM: 'Add stereo atom to fragment',
  FRAGMENT_DELETE_STEREO_ATOM: 'Delete stereo atom from fragment',
  ENHANCED_FLAG_MOVE: 'Move enhanced flag'
}

export function invalidateAtom(restruct, aid, level) {
  const atom = restruct.atoms.get(aid)

  restruct.markAtom(aid, level ? 1 : 0)

  const hbs = restruct.molecule.halfBonds

  atom.a.neighbors.forEach(hbid => {
    if (!hbs.has(hbid)) return

    const hb = hbs.get(hbid)
    restruct.markBond(hb.bid, 1)
    restruct.markAtom(hb.end, 0)

    if (level) invalidateLoop(restruct, hb.bid)
  })
}

export function invalidateLoop(restruct, bid) {
  const bond = restruct.bonds.get(bid)
  const lid1 = restruct.molecule.halfBonds.get(bond.b.hb1).loop
  const lid2 = restruct.molecule.halfBonds.get(bond.b.hb2).loop

  if (lid1 >= 0) restruct.loopRemove(lid1)

  if (lid2 >= 0) restruct.loopRemove(lid2)
}

export function invalidateBond(restruct, bid) {
  const bond = restruct.bonds.get(bid)
  invalidateLoop(restruct, bid)
  invalidateAtom(restruct, bond.b.begin, 0)
  invalidateAtom(restruct, bond.b.end, 0)
}

export function invalidateItem(restruct, map, id, level) {
  if (map === 'atoms') {
    invalidateAtom(restruct, id, level)
  } else if (map === 'bonds') {
    invalidateBond(restruct, id)
    if (level > 0) invalidateLoop(restruct, id)
  } else {
    restruct.markItem(map, id, level)
  }
}

export default Base
