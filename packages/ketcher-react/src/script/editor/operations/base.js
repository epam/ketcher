class Base {
  #type

  constructor(type) {
    this.#type = type
  }

  get type() {
    return this.#type
  }

  execute() {
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
