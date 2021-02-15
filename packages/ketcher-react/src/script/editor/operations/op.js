/****************************************************************************
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import Vec2 from '../../util/vec2'
import scale from '../../util/scale'
import Pile from '../../util/pile'
import {
  Atom,
  Bond,
  RGroup,
  RxnArrow,
  RxnPlus,
  SGroup
} from '../../chem/struct'
import {
  ReAtom,
  ReBond,
  ReRxnPlus,
  ReRxnArrow,
  ReRGroup,
  ReSGroup
} from '../../render/restruct'

import Base, {
  invalidateAtom,
  invalidateBond,
  invalidateItem,
  invalidateLoop,
  OperationType
} from './base'
import {
  FragmentAdd,
  FragmentDelete,
  FragmentStereoFlag,
  FragmentAddStereoAtom,
  FragmentDeleteStereoAtom,
  EnhancedFlagMove
} from './op-frag'

import {
  SimpleObjectAdd,
  SimpleObjectDelete,
  SimpleObjectMove,
  SimpleObjectResize
} from './simpleObject'

class AtomAdd extends Base {
  constructor(atom, pos) {
    super(OperationType.ATOM_ADD)
    this.data = { atom, pos, aid: null }
  }

  execute(restruct) {
    const struct = restruct.molecule

    const pp = {}
    if (this.data.atom)
      Object.keys(this.data.atom).forEach(p => {
        pp[p] = this.data.atom[p]
      })

    pp.label = pp.label || 'C'

    if (!(typeof this.data.aid === 'number'))
      this.data.aid = struct.atoms.add(new Atom(pp))
    else struct.atoms.set(this.data.aid, new Atom(pp))

    // notifyAtomAdded
    const atomData = new ReAtom(struct.atoms.get(this.data.aid))

    atomData.component = restruct.connectedComponents.add(
      new Pile([this.data.aid])
    )
    restruct.atoms.set(this.data.aid, atomData)
    restruct.markAtom(this.data.aid, 1)

    struct.atomSetPos(this.data.aid, new Vec2(this.data.pos))

    const arrow = struct.rxnArrows.get(0)
    if (arrow) {
      const atom = struct.atoms.get(this.data.aid)
      atom.rxnFragmentType = struct.defineRxnFragmentTypeForAtomset(
        new Pile([this.data.aid]),
        arrow.pp.x
      ) // eslint-disable-line
    }
  }

  invert() {
    const ret = new AtomDelete()
    ret.data = this.data
    return ret
  }
}

class AtomDelete extends Base {
  constructor(aid) {
    super(OperationType.ATOM_DELETE)
    this.data = { aid, atom: null, pos: null }
  }

  execute(restruct) {
    const struct = restruct.molecule
    if (!this.data.atom) {
      this.data.atom = struct.atoms.get(this.data.aid)
      this.data.pos = this.data.atom.pp
    }

    // notifyAtomRemoved(this.data.aid);
    const atom = restruct.atoms.get(this.data.aid)
    const set = restruct.connectedComponents.get(atom.component)
    set.delete(this.data.aid)
    if (set.size === 0) restruct.connectedComponents.delete(atom.component)
    restruct.clearVisel(atom.visel)
    restruct.atoms.delete(this.data.aid)
    restruct.markItemRemoved()
    struct.atoms.delete(this.data.aid)
  }

  invert() {
    const ret = new AtomAdd()
    ret.data = this.data
    return ret
  }
}

class AtomAttr extends Base {
  constructor(aid, attribute, value) {
    super(OperationType.ATOM_ATTR)
    this.data = { aid, attribute, value }
    this.data2 = null
  }

  execute(restruct) {
    const atom = restruct.molecule.atoms.get(this.data.aid)
    if (!this.data2) {
      this.data2 = {
        aid: this.data.aid,
        attribute: this.data.attribute,
        value: atom[this.data.attribute]
      }
    }

    atom[this.data.attribute] = this.data.value
    invalidateAtom(restruct, this.data.aid)
  }

  invert() {
    const ret = new AtomAttr()
    ret.data = this.data2
    ret.data2 = this.data
    return ret
  }

  isDummy(restruct) {
    return (
      restruct.molecule.atoms.get(this.data.aid)[this.data.attribute] ===
      this.data.value
    )
  }
}

class AtomMove extends Base {
  constructor(aid, d, noinvalidate) {
    super(OperationType.ATOM_MOVE)
    this.data = { aid, d, noinvalidate }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const aid = this.data.aid
    const d = this.data.d
    struct.atoms.get(aid).pp.add_(d) // eslint-disable-line no-underscore-dangle
    restruct.atoms
      .get(aid)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))

    this.data.d = d.negated()

    if (!this.data.noinvalidate) invalidateAtom(restruct, aid, 1)
  }

  invert() {
    const ret = new AtomMove()
    ret.data = this.data
    return ret
  }

  isDummy() {
    return this.data.d.x === 0 && this.data.d.y === 0
  }
}

class BondMove extends Base {
  constructor(bid, d) {
    super(OperationType.BOND_MOVE)
    this.data = { bid, d }
  }

  execute(restruct) {
    restruct.bonds
      .get(this.data.bid)
      .visel.translate(scale.obj2scaled(this.data.d, restruct.render.options))
    this.data.d = this.data.d.negated()
  }

  invert() {
    const ret = new BondMove()
    ret.data = this.data
    return ret
  }
}

class LoopMove extends Base {
  constructor(id, d) {
    super(OperationType.LOOP_MOVE)
    this.data = { id, d }
  }

  execute(restruct) {
    // not sure if there should be an action to move a loop in the first place
    // but we have to somehow move the aromatic ring,
    // which is associated with the loop, rather than with any of the bonds
    if (
      restruct.reloops.get(this.data.id) &&
      restruct.reloops.get(this.data.id).visel
    ) {
      restruct.reloops
        .get(this.data.id)
        .visel.translate(scale.obj2scaled(this.data.d, restruct.render.options))
    }
    this.data.d = this.data.d.negated()
  }

  invert() {
    const ret = new LoopMove()
    ret.data = this.data
    return ret
  }
}

class SGroupAtomAdd extends Base {
  constructor(sgid, aid) {
    super(OperationType.S_GROUP_ATOM_ADD)
    this.data = { sgid, aid }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const aid = this.data.aid
    const sgid = this.data.sgid
    const atom = struct.atoms.get(aid)
    const sg = struct.sgroups.get(sgid)

    if (sg.atoms.indexOf(aid) >= 0)
      throw new Error(
        'The same atom cannot be added to an S-group more than once'
      )

    if (!atom) throw new Error('OpSGroupAtomAdd: Atom ' + aid + ' not found')

    struct.atomAddToSGroup(sgid, aid)
    invalidateAtom(restruct, aid)
  }

  invert() {
    const ret = new SGroupAtomRemove()
    ret.data = this.data
    return ret
  }
}

class SGroupAtomRemove extends Base {
  constructor(sgid, aid) {
    super(OperationType.S_GROUP_ATOM_REMOVE)
    this.data = { sgid, aid }
  }

  execute(restruct) {
    const aid = this.data.aid
    const sgid = this.data.sgid
    const struct = restruct.molecule
    const atom = struct.atoms.get(aid)
    const sg = struct.sgroups.get(sgid)

    SGroup.removeAtom(sg, aid)
    atom.sgs.delete(sgid)
    invalidateAtom(restruct, aid)
  }

  invert() {
    const ret = new SGroupAtomAdd()
    ret.data = this.data
    return ret
  }
}

class SGroupAttr extends Base {
  constructor(sgid, attr, value) {
    super(OperationType.S_GROUP_ATTR)
    this.data = { sgid, attr, value }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const sgid = this.data.sgid
    const sg = struct.sgroups.get(sgid)

    if (sg.type === 'DAT' && restruct.sgroupData.has(sgid)) {
      // clean the stuff here, else it might be left behind if the sgroups is set to "attached"
      restruct.clearVisel(restruct.sgroupData.get(sgid).visel)
      restruct.sgroupData.delete(sgid)
    }

    this.data.value = sg.setAttr(this.data.attr, this.data.value)
  }

  invert() {
    const ret = new SGroupAttr()
    ret.data = this.data
    return ret
  }
}

class SGroupCreate extends Base {
  constructor(sgid, type, pp) {
    super(OperationType.S_GROUP_CREATE)
    this.data = { sgid, type, pp }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const sg = new SGroup(this.data.type)
    const sgid = this.data.sgid

    sg.id = sgid
    struct.sgroups.set(sgid, sg)

    if (this.data.pp) struct.sgroups.get(sgid).pp = new Vec2(this.data.pp)

    restruct.sgroups.set(sgid, new ReSGroup(struct.sgroups.get(sgid)))
    this.data.sgid = sgid
  }

  invert() {
    const ret = new SGroupDelete()
    ret.data = this.data
    return ret
  }
}

class SGroupDelete extends Base {
  constructor(sgid) {
    super(OperationType.S_GROUP_DELETE)
    this.data = { sgid }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const sgid = this.data.sgid
    const sg = restruct.sgroups.get(sgid)

    this.data.type = sg.item.type
    this.data.pp = sg.item.pp

    if (sg.item.type === 'DAT' && restruct.sgroupData.has(sgid)) {
      restruct.clearVisel(restruct.sgroupData.get(sgid).visel)
      restruct.sgroupData.delete(sgid)
    }

    restruct.clearVisel(sg.visel)
    if (sg.item.atoms.length !== 0) throw new Error('S-Group not empty!')

    restruct.sgroups.delete(sgid)
    struct.sgroups.delete(sgid)
  }

  invert() {
    const ret = new SGroupCreate()
    ret.data = this.data
    return ret
  }
}

class SGroupAddToHierarchy extends Base {
  constructor(sgid, parent, children) {
    super(OperationType.S_GROUP_ADD_TO_HIERACHY)
    this.data = { sgid, parent, children }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const sg = struct.sgroups.get(this.data.sgid)
    const relations = struct.sGroupForest.insert(
      sg,
      this.data.parent,
      this.data.children
    )

    this.data.parent = relations.parent
    this.data.children = relations.children
  }

  invert() {
    const ret = new SGroupRemoveFromHierarchy()
    ret.data = this.data
    return ret
  }
}

class SGroupRemoveFromHierarchy extends Base {
  constructor(sgid) {
    super(OperationType.S_GROUP_REMOVE_FROM_HIERACHY)
    this.data = { sgid }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const sgid = this.data.sgid

    this.data.parent = struct.sGroupForest.parent.get(sgid)
    this.data.children = struct.sGroupForest.children.get(sgid)
    struct.sGroupForest.remove(sgid)
  }

  invert() {
    const ret = new SGroupAddToHierarchy()
    ret.data = this.data
    return ret
  }
}

class BondAdd extends Base {
  constructor(begin, end, bond) {
    super(OperationType.BOND_ADD)
    this.data = { bond, begin, end, bid: null }
  }

  execute(restruct) {
    // eslint-disable-line max-statements
    const struct = restruct.molecule

    if (this.data.begin === this.data.end)
      throw new Error('Distinct atoms expected')

    invalidateAtom(restruct, this.data.begin, 1)
    invalidateAtom(restruct, this.data.end, 1)

    const pp = {}
    if (this.data.bond) {
      Object.keys(this.data.bond).forEach(p => {
        pp[p] = this.data.bond[p]
      })
    }

    pp.type = pp.type || Bond.PATTERN.TYPE.SINGLE
    pp.begin = this.data.begin
    pp.end = this.data.end

    if (!(typeof this.data.bid === 'number'))
      this.data.bid = struct.bonds.add(new Bond(pp))
    else struct.bonds.set(this.data.bid, new Bond(pp))

    struct.bondInitHalfBonds(this.data.bid)
    struct.atomAddNeighbor(struct.bonds.get(this.data.bid).hb1)
    struct.atomAddNeighbor(struct.bonds.get(this.data.bid).hb2)

    // notifyBondAdded
    restruct.bonds.set(
      this.data.bid,
      new ReBond(struct.bonds.get(this.data.bid))
    )
    restruct.markBond(this.data.bid, 1)
  }

  invert() {
    const ret = new BondDelete()
    ret.data = this.data
    return ret
  }
}

class BondDelete extends Base {
  constructor(bid) {
    super(OperationType.BOND_DELETE)
    this.data = { bid, bond: null, begin: null, end: null }
  }

  execute(restruct) {
    // eslint-disable-line max-statements
    const struct = restruct.molecule
    if (!this.data.bond) {
      this.data.bond = struct.bonds.get(this.data.bid)
      this.data.begin = this.data.bond.begin
      this.data.end = this.data.bond.end
    }

    invalidateBond(restruct, this.data.bid)

    // notifyBondRemoved
    const rebond = restruct.bonds.get(this.data.bid)
    ;[rebond.b.hb1, rebond.b.hb2].forEach(hbid => {
      const hb = restruct.molecule.halfBonds.get(hbid)
      if (hb.loop >= 0) restruct.loopRemove(hb.loop)
    }, restruct)
    restruct.clearVisel(rebond.visel)
    restruct.bonds.delete(this.data.bid)
    restruct.markItemRemoved()

    const bond = struct.bonds.get(this.data.bid)
    ;[bond.hb1, bond.hb2].forEach(hbid => {
      const hb = struct.halfBonds.get(hbid)
      const atom = struct.atoms.get(hb.begin)
      const pos = atom.neighbors.indexOf(hbid)
      const prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length
      const next = (pos + 1) % atom.neighbors.length
      struct.setHbNext(atom.neighbors[prev], atom.neighbors[next])
      atom.neighbors.splice(pos, 1)
    })
    struct.halfBonds.delete(bond.hb1)
    struct.halfBonds.delete(bond.hb2)

    struct.bonds.delete(this.data.bid)
  }

  invert() {
    const ret = new BondAdd()
    ret.data = this.data
    return ret
  }
}

class BondAttr extends Base {
  constructor(bid, attribute, value) {
    super(OperationType.BOND_ATTR)
    this.data = { bid, attribute, value }
    this.data2 = null
  }

  execute(restruct) {
    const bond = restruct.molecule.bonds.get(this.data.bid)

    if (!this.data2) {
      this.data2 = {
        bid: this.data.bid,
        attribute: this.data.attribute,
        value: bond[this.data.attribute]
      }
    }

    bond[this.data.attribute] = this.data.value

    invalidateBond(restruct, this.data.bid)
    if (this.data.attribute === 'type') invalidateLoop(restruct, this.data.bid)
  }

  isDummy(restruct) {
    // eslint-disable-line no-underscore-dangle
    return (
      restruct.molecule.bonds.get(this.data.bid)[this.data.attribute] ===
      this.data.value
    )
  }

  invert() {
    const ret = new BondAttr()
    ret.data = this.data2
    ret.data2 = this.data
    return ret
  }
}

class RGroupAttr extends Base {
  constructor(rgid, attribute, value) {
    super(OperationType.R_GROUP_ATTR)
    this.data = { rgid, attribute, value }
    this.data2 = null
  }

  execute(restruct) {
    const rgp = restruct.molecule.rgroups.get(this.data.rgid)
    if (!this.data2) {
      this.data2 = {
        rgid: this.data.rgid,
        attribute: this.data.attribute,
        value: rgp[this.data.attribute]
      }
    }

    rgp[this.data.attribute] = this.data.value

    invalidateItem(restruct, 'rgroups', this.data.rgid)
  }

  invert() {
    const ret = new RGroupAttr()
    ret.data = this.data2
    ret.data2 = this.data
    return ret
  }

  isDummy(restruct) {
    // eslint-disable-line no-underscore-dangle
    return (
      restruct.molecule.rgroups.get(this.data.rgid)[this.data.attribute] ===
      this.data.value
    )
  }
}

class RGroupFragment extends Base {
  constructor(rgid, frid, rg) {
    super(OperationType.R_GROUP_FRAGMENT)
    this.rgid_new = rgid
    this.rg_new = rg
    this.rgid_old = null
    this.rg_old = null
    this.frid = frid
  }

  execute(restruct) {
    // eslint-disable-line max-statements
    const struct = restruct.molecule
    this.rgid_old =
      this.rgid_old || RGroup.findRGroupByFragment(struct.rgroups, this.frid)
    this.rg_old = this.rgid_old ? struct.rgroups.get(this.rgid_old) : null

    if (this.rg_old) {
      this.rg_old.frags.delete(this.frid)
      restruct.clearVisel(restruct.rgroups.get(this.rgid_old).visel)

      if (this.rg_old.frags.size === 0) {
        restruct.rgroups.delete(this.rgid_old)
        struct.rgroups.delete(this.rgid_old)
        restruct.markItemRemoved()
      } else {
        restruct.markItem('rgroups', this.rgid_old, 1)
      }
    }

    if (this.rgid_new) {
      let rgNew = struct.rgroups.get(this.rgid_new)
      if (!rgNew) {
        rgNew = this.rg_new || new RGroup()
        struct.rgroups.set(this.rgid_new, rgNew)
        restruct.rgroups.set(this.rgid_new, new ReRGroup(rgNew))
      } else {
        restruct.markItem('rgroups', this.rgid_new, 1)
      }
      rgNew.frags.add(this.frid)
    }
  }

  invert() {
    return new RGroupFragment(this.rgid_old, this.frid, this.rg_old)
  }
}

class UpdateIfThen extends Base {
  constructor(rgNew, rgOld, skipRgids = []) {
    super(OperationType.UPDATE_IF_THEN)
    this.rgid_new = rgNew
    this.rgid_old = rgOld
    this.ifThenHistory = new Map()
    this.skipRgids = skipRgids || []
  }

  execute(restruct) {
    const struct = restruct.molecule

    struct.rgroups.forEach((rg, rgid) => {
      if (rg.ifthen === this.rgid_old && !this.skipRgids.includes(rgid)) {
        rg.ifthen = this.rgid_new
        this.ifThenHistory.set(rgid, this.rgid_old)
        struct.rgroups.set(rgid, rg)
      }
    })
  }

  invert() {
    return new RestoreIfThen(this.rgid_new, this.rgid_old, this.ifThenHistory)
  }
}

class RestoreIfThen extends Base {
  constructor(rgNew, rgOld, history) {
    super(OperationType.RESTORE_IF_THEN)
    this.rgid_new = rgNew
    this.rgid_old = rgOld
    this.ifThenHistory = history || new Map()
  }

  execute(restruct) {
    const struct = restruct.molecule

    this.ifThenHistory.forEach((rg, rgid) => {
      const rgValue = struct.rgroups.get(rgid)
      rgValue.ifthen = rg
      struct.rgroups.set(rgid, rgValue)
    })
  }

  invert() {
    return new UpdateIfThen(this.rgid_old, this.rgid_new)
  }
}

class RxnArrowAdd extends Base {
  constructor(pos) {
    super(OperationType.RXN_ARROW_ADD)
    this.data = { pos, arid: null }
  }

  execute(restruct) {
    const struct = restruct.molecule

    if (!(typeof this.data.arid === 'number'))
      this.data.arid = struct.rxnArrows.add(new RxnArrow())
    else struct.rxnArrows.set(this.data.arid, new RxnArrow())

    // notifyRxnArrowAdded
    restruct.rxnArrows.set(
      this.data.arid,
      new ReRxnArrow(struct.rxnArrows.get(this.data.arid))
    )

    struct.rxnArrowSetPos(this.data.arid, new Vec2(this.data.pos))

    let { reactants, products } = struct.getComponents()

    reactants = reactants.reduce((acc, item) => acc.concat(...item), [])
    products = products.reduce((acc, item) => acc.concat(...item), [])

    reactants.forEach(aid => {
      const atom = struct.atoms.get(aid)
      atom.rxnFragmentType = 1
    })

    products.forEach(aid => {
      const atom = struct.atoms.get(aid)
      atom.rxnFragmentType = 2
    })

    invalidateItem(restruct, 'rxnArrows', this.data.arid, 1)
  }

  invert() {
    const ret = new RxnArrowDelete()
    ret.data = this.data
    return ret
  }
}

class RxnArrowDelete extends Base {
  constructor(arid) {
    super(OperationType.RXN_ARROW_DELETE)
    this.data = { arid, pos: null }
  }

  execute(restruct) {
    const struct = restruct.molecule

    if (!this.data.pos) this.data.pos = struct.rxnArrows.get(this.data.arid).pp

    // notifyRxnArrowRemoved
    restruct.markItemRemoved()
    restruct.clearVisel(restruct.rxnArrows.get(this.data.arid).visel)
    restruct.rxnArrows.delete(this.data.arid)

    struct.rxnArrows.delete(this.data.arid)

    struct.atoms.forEach(atom => {
      atom.rxnFragmentType = -1
    })
  }

  invert() {
    const ret = new RxnArrowAdd()
    ret.data = this.data
    return ret
  }
}

class RxnArrowMove extends Base {
  constructor(id, d, noinvalidate) {
    super(OperationType.RXN_ARROW_MOVE)
    this.data = { id, d, noinvalidate }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    struct.rxnArrows.get(id).pp.add_(d) // eslint-disable-line no-underscore-dangle
    restruct.rxnArrows
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate) invalidateItem(restruct, 'rxnArrows', id, 1)
  }

  invert() {
    const ret = new RxnArrowMove()
    ret.data = this.data
    return ret
  }
}

class RxnPlusAdd extends Base {
  constructor(pos) {
    super(OperationType.RXN_PLUS_ADD)
    this.data = { plid: null, pos }
  }

  execute(restruct) {
    const struct = restruct.molecule
    if (!(typeof this.data.plid === 'number'))
      this.data.plid = struct.rxnPluses.add(new RxnPlus())
    else struct.rxnPluses.set(this.data.plid, new RxnPlus())

    // notifyRxnPlusAdded
    restruct.rxnPluses.set(
      this.data.plid,
      new ReRxnPlus(struct.rxnPluses.get(this.data.plid))
    )

    struct.rxnPlusSetPos(this.data.plid, new Vec2(this.data.pos))

    invalidateItem(restruct, 'rxnPluses', this.data.plid, 1)
  }

  invert() {
    const ret = new RxnPlusDelete()
    ret.data = this.data
    return ret
  }
}

class RxnPlusDelete extends Base {
  constructor(plid) {
    super(OperationType.RXN_PLUS_DELETE)
    this.data = { plid, pos: null }
  }

  execute(restruct) {
    const struct = restruct.molecule
    if (!this.data.pos) this.data.pos = struct.rxnPluses.get(this.data.plid).pp

    // notifyRxnPlusRemoved
    restruct.markItemRemoved()
    restruct.clearVisel(restruct.rxnPluses.get(this.data.plid).visel)
    restruct.rxnPluses.delete(this.data.plid)

    struct.rxnPluses.delete(this.data.plid)
  }

  invert() {
    const ret = new RxnPlusAdd()
    ret.data = this.data
    return ret
  }
}

class RxnPlusMove extends Base {
  constructor(id, d, noinvalidate) {
    super(OperationType.RXN_PLUS_MOVE)
    this.data = { id, d, noinvalidate }
  }

  execute(restruct) {
    const struct = restruct.molecule
    const id = this.data.id
    const d = this.data.d
    struct.rxnPluses.get(id).pp.add_(d) // eslint-disable-line no-underscore-dangle
    restruct.rxnPluses
      .get(id)
      .visel.translate(scale.obj2scaled(d, restruct.render.options))
    this.data.d = d.negated()
    if (!this.data.noinvalidate) invalidateItem(restruct, 'rxnPluses', id, 1)
  }

  invert() {
    const ret = new RxnPlusMove()
    ret.data = this.data
    return ret
  }
}

class SGroupDataMove extends Base {
  constructor(id, d) {
    super(OperationType.S_GROUP_DATA_MOVE)
    this.data = { id, d }
  }

  execute(restruct) {
    const { sgroups } = restruct.molecule
    sgroups.get(this.data.id).pp.add_(this.data.d) // eslint-disable-line no-underscore-dangle
    this.data.d = this.data.d.negated()
    invalidateItem(restruct, 'sgroupData', this.data.id, 1) // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
  }

  invert() {
    const ret = new SGroupDataMove()
    ret.data = this.data
    return ret
  }
}

class CanvasLoad extends Base {
  constructor(struct) {
    super(OperationType.CANVAS_LOAD)
    this.data = { struct }
  }

  execute(restruct) {
    const oldStruct = restruct.molecule
    restruct.clearVisels() // TODO: What is it?
    restruct.render.setMolecule(this.data.struct)
    this.data.struct = oldStruct
  }

  invert() {
    const ret = new CanvasLoad()
    ret.data = this.data
    return ret
  }
}

class AlignDescriptors extends Base {
  constructor() {
    super(OperationType.ALIGN_DESCRIPTORS)
    this.history = {}
  }

  execute(restruct) {
    const sgroups = Array.from(restruct.molecule.sgroups.values()).reverse()

    const structBox = restruct.molecule.getCoordBoundingBoxObj()
    let alignPoint = new Vec2(structBox.max.x, structBox.min.y).add(
      new Vec2(2.0, -1.0)
    )

    sgroups.forEach(sg => {
      this.history[sg.id] = new Vec2(sg.pp)
      alignPoint = alignPoint.add(new Vec2(0.0, 0.5))
      sg.pp = alignPoint
      restruct.molecule.sgroups.set(sg.id, sg)
      invalidateItem(restruct, 'sgroupData', sg.id, 1)
    })
  }

  invert() {
    return new RestoreDescriptorsPosition(this.history)
  }
}

class RestoreDescriptorsPosition extends Base {
  constructor(history) {
    super(OperationType.RESTORE_DESCRIPTORS_POSITION)
    this.history = history
  }

  execute(restruct) {
    const sgroups = Array.from(restruct.molecule.sgroups.values())

    sgroups.forEach(sg => {
      sg.pp = this.history[sg.id]
      restruct.molecule.sgroups.set(sg.id, sg)
      invalidateItem(restruct, 'sgroupData', sg.id, 1)
    })
  }

  invert() {
    return new AlignDescriptors()
  }
}

export {
  OperationType,
  AtomAdd,
  AtomDelete,
  AtomAttr,
  AtomMove,
  BondMove,
  LoopMove,
  SGroupAtomAdd,
  SGroupAtomRemove,
  SGroupAttr,
  SGroupCreate,
  SGroupDelete,
  SGroupAddToHierarchy,
  SGroupRemoveFromHierarchy,
  BondAdd,
  BondDelete,
  BondAttr,
  RGroupAttr,
  RGroupFragment,
  RxnArrowAdd,
  RxnArrowDelete,
  RxnArrowMove,
  RxnPlusAdd,
  RxnPlusDelete,
  RxnPlusMove,
  SGroupDataMove,
  CanvasLoad,
  UpdateIfThen,
  AlignDescriptors,
  FragmentAdd,
  FragmentDelete,
  FragmentStereoFlag,
  FragmentAddStereoAtom,
  FragmentDeleteStereoAtom,
  EnhancedFlagMove,
  SimpleObjectAdd,
  SimpleObjectDelete,
  SimpleObjectMove,
  SimpleObjectResize
}
