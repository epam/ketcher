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
import util from '../../render/util'
import {
  Atom,
  Bond,
  RGroup,
  RxnArrow,
  RxnPlus,
  SGroup,
  SimpleObject
} from '../../chem/struct'
import {
  ReAtom,
  ReBond,
  ReRxnPlus,
  ReRxnArrow,
  ReRGroup,
  ReSGroup,
  ReSimpleObject
} from '../../render/restruct'

import Base, {
  invalidateAtom,
  invalidateBond,
  invalidateItem,
  invalidateLoop
} from './base'
import {
  FragmentAdd,
  FragmentDelete,
  FragmentStereoFlag,
  FragmentAddStereoAtom,
  FragmentDeleteStereoAtom,
  EnhancedFlagMove
} from './op-frag'

const tfx = util.tfx

function AtomAdd(atom, pos) {
  this.data = { atom, pos, aid: null }
}

AtomAdd.prototype = new Base('Add atom')

AtomAdd.prototype.execute = function (restruct) {
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

AtomAdd.prototype.invert = function () {
  const ret = new AtomDelete()
  ret.data = this.data
  return ret
}

function AtomDelete(aid) {
  this.data = { aid, atom: null, pos: null }
}

AtomDelete.prototype = new Base('Delete atom')

AtomDelete.prototype.execute = function (restruct) {
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

AtomDelete.prototype.invert = function () {
  const ret = new AtomAdd()
  ret.data = this.data
  return ret
}

function AtomAttr(aid, attribute, value) {
  this.data = { aid, attribute, value }
  this.data2 = null
}

AtomAttr.prototype = new Base('Set atom attribute')

AtomAttr.prototype.execute = function (restruct) {
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

AtomAttr.prototype.invert = function () {
  const ret = new AtomAttr()
  ret.data = this.data2
  ret.data2 = this.data
  return ret
}

AtomAttr.prototype.isDummy = function (restruct) {
  return (
    restruct.molecule.atoms.get(this.data.aid)[this.data.attribute] ===
    this.data.value
  )
}

function AtomMove(aid, d, noinvalidate) {
  this.data = { aid, d, noinvalidate }
}

AtomMove.prototype = new Base('Move atom')
AtomMove.prototype.execute = function (restruct) {
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

AtomMove.prototype.invert = function () {
  const ret = new AtomMove()
  ret.data = this.data
  return ret
}

AtomMove.prototype.isDummy = function () {
  return this.data.d.x === 0 && this.data.d.y === 0
}

function BondMove(bid, d) {
  this.data = { bid, d }
}

BondMove.prototype = new Base('Move bond')

BondMove.prototype.execute = function (restruct) {
  restruct.bonds
    .get(this.data.bid)
    .visel.translate(scale.obj2scaled(this.data.d, restruct.render.options))
  this.data.d = this.data.d.negated()
}

BondMove.prototype.invert = function () {
  const ret = new BondMove()
  ret.data = this.data
  return ret
}

function LoopMove(id, d) {
  this.data = { id, d }
}

LoopMove.prototype = new Base('Move loop')

LoopMove.prototype.execute = function (restruct) {
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

LoopMove.prototype.invert = function () {
  const ret = new LoopMove()
  ret.data = this.data
  return ret
}

function SGroupAtomAdd(sgid, aid) {
  this.data = { sgid, aid }
}

SGroupAtomAdd.prototype = new Base('Add atom to s-group')

SGroupAtomAdd.prototype.execute = function (restruct) {
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

SGroupAtomAdd.prototype.invert = function () {
  const ret = new SGroupAtomRemove()
  ret.data = this.data
  return ret
}

function SGroupAtomRemove(sgid, aid) {
  this.data = { sgid, aid }
}

SGroupAtomRemove.prototype = new Base('Remove atom from s-group')

SGroupAtomRemove.prototype.execute = function (restruct) {
  const aid = this.data.aid
  const sgid = this.data.sgid
  const struct = restruct.molecule
  const atom = struct.atoms.get(aid)
  const sg = struct.sgroups.get(sgid)

  SGroup.removeAtom(sg, aid)
  atom.sgs.delete(sgid)
  invalidateAtom(restruct, aid)
}

SGroupAtomRemove.prototype.invert = function () {
  const ret = new SGroupAtomAdd()
  ret.data = this.data
  return ret
}

function SGroupAttr(sgid, attr, value) {
  this.data = { sgid, attr, value }
}

SGroupAttr.prototype = new Base('Set s-group attribute')

SGroupAttr.prototype.execute = function (restruct) {
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

SGroupAttr.prototype.invert = function () {
  const ret = new SGroupAttr()
  ret.data = this.data
  return ret
}

function SGroupCreate(sgid, type, pp) {
  this.data = { sgid, type, pp }
}

SGroupCreate.prototype = new Base('Create s-group')

SGroupCreate.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  const sg = new SGroup(this.data.type)
  const sgid = this.data.sgid

  sg.id = sgid
  struct.sgroups.set(sgid, sg)

  if (this.data.pp) struct.sgroups.get(sgid).pp = new Vec2(this.data.pp)

  restruct.sgroups.set(sgid, new ReSGroup(struct.sgroups.get(sgid)))
  this.data.sgid = sgid
}

SGroupCreate.prototype.invert = function () {
  const ret = new SGroupDelete()
  ret.data = this.data
  return ret
}

function SGroupDelete(sgid) {
  this.data = { sgid }
}

SGroupDelete.prototype = new Base('Delete s-group')

SGroupDelete.prototype.execute = function (restruct) {
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

SGroupDelete.prototype.invert = function () {
  const ret = new SGroupCreate()
  ret.data = this.data
  return ret
}

function SGroupAddToHierarchy(sgid, parent, children) {
  this.data = { sgid, parent, children }
}

SGroupAddToHierarchy.prototype = new Base('Add s-group to hierarchy')

SGroupAddToHierarchy.prototype.execute = function (restruct) {
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

SGroupAddToHierarchy.prototype.invert = function () {
  const ret = new SGroupRemoveFromHierarchy()
  ret.data = this.data
  return ret
}

function SGroupRemoveFromHierarchy(sgid) {
  this.data = { sgid }
}

SGroupRemoveFromHierarchy.prototype = new Base('Delete s-group from hierarchy')

SGroupRemoveFromHierarchy.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  const sgid = this.data.sgid

  this.data.parent = struct.sGroupForest.parent.get(sgid)
  this.data.children = struct.sGroupForest.children.get(sgid)
  struct.sGroupForest.remove(sgid)
}

SGroupRemoveFromHierarchy.prototype.invert = function () {
  const ret = new SGroupAddToHierarchy()
  ret.data = this.data
  return ret
}

function BondAdd(begin, end, bond) {
  this.data = { bond, begin, end, bid: null }
}

BondAdd.prototype = new Base('Add bond')

BondAdd.prototype.execute = function (restruct) {
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
  restruct.bonds.set(this.data.bid, new ReBond(struct.bonds.get(this.data.bid)))
  restruct.markBond(this.data.bid, 1)
}

BondAdd.prototype.invert = function () {
  const ret = new BondDelete()
  ret.data = this.data
  return ret
}

function BondDelete(bid) {
  this.data = { bid, bond: null, begin: null, end: null }
}

BondDelete.prototype = new Base('Delete bond')

BondDelete.prototype.execute = function (restruct) {
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

BondDelete.prototype.invert = function () {
  const ret = new BondAdd()
  ret.data = this.data
  return ret
}

function BondAttr(bid, attribute, value) {
  this.data = { bid, attribute, value }
  this.data2 = null
}

BondAttr.prototype = new Base('Set bond attribute')

BondAttr.prototype.execute = function (restruct) {
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

BondAttr.prototype.isDummy = function (restruct) {
  // eslint-disable-line no-underscore-dangle
  return (
    restruct.molecule.bonds.get(this.data.bid)[this.data.attribute] ===
    this.data.value
  )
}

BondAttr.prototype.invert = function () {
  const ret = new BondAttr()
  ret.data = this.data2
  ret.data2 = this.data
  return ret
}

function RGroupAttr(rgid, attribute, value) {
  this.data = { rgid, attribute, value }
  this.data2 = null
}

RGroupAttr.prototype = new Base('Set r-group attribute')

RGroupAttr.prototype.execute = function (restruct) {
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

RGroupAttr.prototype.invert = function () {
  const ret = new RGroupAttr()
  ret.data = this.data2
  ret.data2 = this.data
  return ret
}

RGroupAttr.prototype.isDummy = function (restruct) {
  // eslint-disable-line no-underscore-dangle
  return (
    restruct.molecule.rgroups.get(this.data.rgid)[this.data.attribute] ===
    this.data.value
  )
}

function RGroupFragment(rgid, frid, rg) {
  this.rgid_new = rgid
  this.rg_new = rg
  this.rgid_old = null
  this.rg_old = null
  this.frid = frid
}

RGroupFragment.prototype = new Base('R-group fragment')

RGroupFragment.prototype.execute = function (restruct) {
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

RGroupFragment.prototype.invert = function () {
  return new RGroupFragment(this.rgid_old, this.frid, this.rg_old)
}

function UpdateIfThen(rgNew, rgOld, skipRgids = []) {
  this.rgid_new = rgNew
  this.rgid_old = rgOld
  this.ifThenHistory = new Map()
  this.skipRgids = skipRgids || []
}

UpdateIfThen.prototype = new Base('Update if then')

UpdateIfThen.prototype.execute = function (restruct) {
  const struct = restruct.molecule

  struct.rgroups.forEach((rg, rgid) => {
    if (rg.ifthen === this.rgid_old && !this.skipRgids.includes(rgid)) {
      rg.ifthen = this.rgid_new
      this.ifThenHistory.set(rgid, this.rgid_old)
      struct.rgroups.set(rgid, rg)
    }
  })
}

UpdateIfThen.prototype.invert = function () {
  return new RestoreIfThen(this.rgid_new, this.rgid_old, this.ifThenHistory)
}

function RestoreIfThen(rgNew, rgOld, history) {
  this.rgid_new = rgNew
  this.rgid_old = rgOld
  this.ifThenHistory = history || new Map()
}

RestoreIfThen.prototype = new Base('Restore if then')

RestoreIfThen.prototype.execute = function (restruct) {
  const struct = restruct.molecule

  this.ifThenHistory.forEach((rg, rgid) => {
    const rgValue = struct.rgroups.get(rgid)
    rgValue.ifthen = rg
    struct.rgroups.set(rgid, rgValue)
  })
}

RestoreIfThen.prototype.invert = function () {
  return new UpdateIfThen(this.rgid_old, this.rgid_new)
}

function RxnArrowAdd(pos) {
  this.data = { pos, arid: null }
}

RxnArrowAdd.prototype = new Base('Add rxn arrow')

RxnArrowAdd.prototype.execute = function (restruct) {
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

RxnArrowAdd.prototype.invert = function () {
  const ret = new RxnArrowDelete()
  ret.data = this.data
  return ret
}

function RxnArrowDelete(arid) {
  this.data = { arid, pos: null }
}

RxnArrowDelete.prototype = new Base('Delete rxn arrow')

RxnArrowDelete.prototype.execute = function (restruct) {
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

RxnArrowDelete.prototype.invert = function () {
  const ret = new RxnArrowAdd()
  ret.data = this.data
  return ret
}

function RxnArrowMove(id, d, noinvalidate) {
  this.data = { id, d, noinvalidate }
}

RxnArrowMove.prototype = new Base('Move rxn arrow')

RxnArrowMove.prototype.execute = function (restruct) {
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

RxnArrowMove.prototype.invert = function () {
  const ret = new RxnArrowMove()
  ret.data = this.data
  return ret
}

function RxnPlusAdd(pos) {
  this.data = { plid: null, pos }
}

RxnPlusAdd.prototype = new Base('Add rxn plus')

RxnPlusAdd.prototype.execute = function (restruct) {
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

RxnPlusAdd.prototype.invert = function () {
  const ret = new RxnPlusDelete()
  ret.data = this.data
  return ret
}

function RxnPlusDelete(plid) {
  this.data = { plid, pos: null }
}

RxnPlusDelete.prototype = new Base('Delete rxn plus')

RxnPlusDelete.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  if (!this.data.pos) this.data.pos = struct.rxnPluses.get(this.data.plid).pp

  // notifyRxnPlusRemoved
  restruct.markItemRemoved()
  restruct.clearVisel(restruct.rxnPluses.get(this.data.plid).visel)
  restruct.rxnPluses.delete(this.data.plid)

  struct.rxnPluses.delete(this.data.plid)
}

RxnPlusDelete.prototype.invert = function () {
  const ret = new RxnPlusAdd()
  ret.data = this.data
  return ret
}

function RxnPlusMove(id, d, noinvalidate) {
  this.data = { id, d, noinvalidate }
}

RxnPlusMove.prototype = new Base('Nove rxn plus')

RxnPlusMove.prototype.execute = function (restruct) {
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

RxnPlusMove.prototype.invert = function () {
  const ret = new RxnPlusMove()
  ret.data = this.data
  return ret
}

function SGroupDataMove(id, d) {
  this.data = { id, d }
}

SGroupDataMove.prototype = new Base('Move s-group data')

SGroupDataMove.prototype.execute = function (restruct) {
  const { sgroups } = restruct.molecule
  sgroups.get(this.data.id).pp.add_(this.data.d) // eslint-disable-line no-underscore-dangle
  this.data.d = this.data.d.negated()
  invalidateItem(restruct, 'sgroupData', this.data.id, 1) // [MK] this currently does nothing since the DataSGroupData Visel only contains the highlighting/selection and SGroups are redrawn every time anyway
}

SGroupDataMove.prototype.invert = function () {
  const ret = new SGroupDataMove()
  ret.data = this.data
  return ret
}

function CanvasLoad(struct) {
  this.data = { struct }
}

CanvasLoad.prototype = new Base('Load canvas')

CanvasLoad.prototype.execute = function (restruct) {
  const oldStruct = restruct.molecule
  restruct.clearVisels() // TODO: What is it?
  restruct.render.setMolecule(this.data.struct)
  this.data.struct = oldStruct
}

CanvasLoad.prototype.invert = function () {
  const ret = new CanvasLoad()
  ret.data = this.data
  return ret
}

function AlignDescriptors() {
  this.history = {}
}

AlignDescriptors.prototype = new Base('Align descriptors')

AlignDescriptors.prototype.execute = function (restruct) {
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

AlignDescriptors.prototype.invert = function () {
  return new RestoreDescriptorsPosition(this.history)
}

function RestoreDescriptorsPosition(history) {
  this.history = history
}

RestoreDescriptorsPosition.prototype = new Base('Restore descriptors position')

RestoreDescriptorsPosition.prototype.execute = function (restruct) {
  const sgroups = Array.from(restruct.molecule.sgroups.values())

  sgroups.forEach(sg => {
    sg.pp = this.history[sg.id]
    restruct.molecule.sgroups.set(sg.id, sg)
    invalidateItem(restruct, 'sgroupData', sg.id, 1)
  })
}

RestoreDescriptorsPosition.prototype.invert = function () {
  return new AlignDescriptors()
}

function SimpleObjectAdd(pos, mode) {
  this.data = { id: null, pos, mode }
  this.performed = false
}

SimpleObjectAdd.prototype = new Base('Add simple object')

SimpleObjectAdd.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  if (!this.performed) {
    this.data.id = struct.simpleObjects.add(
      new SimpleObject({ mode: this.data.mode })
    )
    this.performed = true
  } else {
    struct.simpleObjects.set(
      this.data.id,
      new SimpleObject({ mode: this.data.mode })
    )
  }

  restruct.simpleObjects.set(
    this.data.id,
    new ReSimpleObject(struct.simpleObjects.get(this.data.id))
  )

  struct.simpleObjectSetPos(
    this.data.id,
    this.data.pos.map(p => new Vec2(p))
  )

  invalidateItem(restruct, 'simpleObjects', this.data.id, 1)
}

SimpleObjectAdd.prototype.invert = function () {
  const ret = new SimpleObjectDelete()
  ret.data = this.data
  return ret
}

function SimpleObjectDelete(id) {
  this.data = { id, pos: null, item: null }
  this.performed = false
}

SimpleObjectDelete.prototype = new Base('Delete simple object')

SimpleObjectDelete.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  if (!this.performed) {
    const item = struct.simpleObjects.get(this.data.id)
    this.data.pos = item.pos
    this.data.mode = item.mode
    this.performed = true
  }

  restruct.markItemRemoved()
  restruct.clearVisel(restruct.simpleObjects.get(this.data.id).visel)
  restruct.simpleObjects.delete(this.data.id)

  struct.simpleObjects.delete(this.data.id)
}

SimpleObjectDelete.prototype.invert = function () {
  const ret = new SimpleObjectAdd()
  ret.data = this.data
  return ret
}

function SimpleObjectMove(id, d, noinvalidate) {
  this.data = { id, d, noinvalidate }
}

SimpleObjectMove.prototype = new Base('Move simple object')

SimpleObjectMove.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  const id = this.data.id
  const d = this.data.d
  const item = struct.simpleObjects.get(id)
  item.pos.forEach(p => p.add_(d))
  restruct.simpleObjects
    .get(id)
    .visel.translate(scale.obj2scaled(d, restruct.render.options))
  this.data.d = d.negated()
  if (!this.data.noinvalidate) invalidateItem(restruct, 'simpleObjects', id, 1)
}

SimpleObjectMove.prototype.invert = function () {
  const ret = new SimpleObjectMove()
  ret.data = this.data
  return ret
}

function SimpleObjectResize(id, d, current, anchor, noinvalidate) {
  this.data = { id, d, current, anchor, noinvalidate }
}

SimpleObjectResize.prototype = new Base('Resize simple object')

SimpleObjectResize.prototype.execute = function (restruct) {
  const struct = restruct.molecule
  const id = this.data.id
  const d = this.data.d
  const current = this.data.current
  const item = struct.simpleObjects.get(id)
  const anchor = this.data.anchor

  if (item.mode === 'circle') {
    const previousPos1 = item.pos[1].get_xy0()
    item.pos[1].x = current.x
    item.pos[1].y = current.y
    this.data.current = previousPos1
  } else if (item.mode === 'line' && anchor) {
    const previousPos1 = anchor.get_xy0()
    anchor.x = current.x
    anchor.y = current.y
    this.data.current = previousPos1
  } else if (item.mode === 'rectangle' && anchor) {
    const previousPos0 = item.pos[0].get_xy0()
    const previousPos1 = item.pos[1].get_xy0()

    if (tfx(anchor.x) === tfx(item.pos[1].x)) {
      item.pos[1].x = anchor.x = current.x
      this.data.current.x = previousPos1.x
    }
    if (tfx(anchor.y) === tfx(item.pos[1].y)) {
      item.pos[1].y = anchor.y = current.y
      this.data.current.y = previousPos1.y
    }
    if (tfx(anchor.x) === tfx(item.pos[0].x)) {
      item.pos[0].x = anchor.x = current.x
      this.data.current.x = previousPos0.x
    }
    if (tfx(anchor.y) === tfx(item.pos[0].y)) {
      item.pos[0].y = anchor.y = current.y
      this.data.current.y = previousPos0.y
    }
  } else item.pos[1].add_(d)

  restruct.simpleObjects
    .get(id)
    .visel.translate(scale.obj2scaled(d, restruct.render.options))
  this.data.d = d.negated()
  if (!this.data.noinvalidate) invalidateItem(restruct, 'simpleObjects', id, 1)
}

SimpleObjectResize.prototype.invert = function () {
  const ret = new SimpleObjectResize()
  ret.data = this.data
  return ret
}

const operations = {
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

export default operations
