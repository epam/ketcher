/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import { Box2Abs, Vec2, Pile } from 'utils'
import { Atom } from './Atom'
import { Bond } from './Bond'

export class SGroupBracketParams {
  readonly c: Vec2
  readonly d: Vec2
  readonly n: Vec2
  readonly w: number
  readonly h: number

  constructor(c: Vec2, d: Vec2, w: number, h: number) {
    this.c = c
    this.d = d
    this.n = Vec2.rotateSC(d, 1, 0)
    this.w = w
    this.h = h
  }
}

export class SGroup {
  static TYPES = {
    MUL: 1,
    SRU: 2,
    SUP: 3,
    DAT: 4,
    GEN: 5
  }

  type: string
  id: number
  label: number
  bracketBox: any
  bracketDir: Vec2
  areas: any
  highlight: boolean
  highlighting: any
  selected: boolean
  selectionPlate: any
  atoms: any
  atomSet: any
  parentAtomSet: any
  patoms?: any
  allAtoms: any
  bonds: any
  xBonds: any
  neiAtoms: any
  pp: Vec2 | null
  data: any

  constructor(type: string) {
    // eslint-disable-line max-statements
    console.assert(
      type && type in SGroup.TYPES,
      'Invalid or unsupported s-group type'
    )

    this.type = type
    this.id = -1
    this.label = -1
    this.bracketBox = null
    this.bracketDir = new Vec2(1, 0)
    this.areas = []

    this.highlight = false
    this.highlighting = null
    this.selected = false
    this.selectionPlate = null

    this.atoms = []
    this.patoms = []
    this.bonds = []
    this.xBonds = []
    this.neiAtoms = []
    this.pp = null
    this.data = {
      mul: 1, // multiplication count for MUL group
      connectivity: 'ht', // head-to-head, head-to-tail or either-unknown
      name: '',
      subscript: 'n',

      // data s-group fields
      attached: false,
      absolute: true,
      showUnits: false,
      nCharsToDisplay: -1,
      tagChar: '',
      daspPos: 1,
      fieldType: 'F',
      fieldName: '',
      fieldValue: '',
      units: '',
      query: '',
      queryOp: ''
    }
  }

  static filterAtoms(atoms: any, map: any) {
    let newAtoms: Array<any> = []
    for (var i = 0; i < atoms.length; ++i) {
      var aid = atoms[i]
      if (typeof map[aid] !== 'number') newAtoms.push(aid)
      else if (map[aid] >= 0) newAtoms.push(map[aid])
      else newAtoms.push(-1)
    }
    return newAtoms
  }

  static removeNegative(atoms: any) {
    let newAtoms: Array<any> = []
    for (var j = 0; j < atoms.length; ++j) {
      if (atoms[j] >= 0) newAtoms.push(atoms[j])
    }
    return newAtoms
  }

  static filter(_mol: any, sg: any, atomMap: any) {
    sg.atoms = SGroup.removeNegative(SGroup.filterAtoms(sg.atoms, atomMap))
  }

  static clone(sgroup: SGroup, aidMap: Map<number, number>): SGroup {
    const cp = new SGroup(sgroup.type)

    Object.keys(sgroup.data).forEach(field => {
      cp.data[field] = sgroup.data[field]
    })

    cp.atoms = sgroup.atoms.map(elem => aidMap.get(elem))
    cp.pp = sgroup.pp
    cp.bracketBox = sgroup.bracketBox
    cp.patoms = null
    cp.bonds = null
    cp.allAtoms = sgroup.allAtoms
    return cp
  }

  static addAtom = function (sgroup: SGroup, aid: number): void {
    sgroup.atoms.push(aid)
  }

  static removeAtom(sgroup: SGroup, aid: number) {
    for (let i = 0; i < sgroup.atoms.length; ++i) {
      if (sgroup.atoms[i] === aid) {
        sgroup.atoms.splice(i, 1)
        return
      }
    }
    console.error('The atom is not found in the given s-group')
  }

  static getCrossBonds(
    inBonds: any,
    xBonds: any,
    mol: any,
    parentAtomSet: any
  ) {
    mol.bonds.forEach((bond: any, bid: any) => {
      if (parentAtomSet.has(bond.begin) && parentAtomSet.has(bond.end)) {
        if (inBonds !== null) inBonds.push(bid)
      } else if (parentAtomSet.has(bond.begin) || parentAtomSet.has(bond.end)) {
        if (xBonds !== null) xBonds.push(bid)
      }
    })
  }

  static bracketPos(sg: SGroup, mol: any, xbonds: any) {
    let atoms = sg.atoms
    if (!xbonds || xbonds.length !== 2) {
      sg.bracketDir = new Vec2(1, 0)
    } else {
      var p1 = mol.bonds.get(xbonds[0]).getCenter(mol)
      var p2 = mol.bonds.get(xbonds[1]).getCenter(mol)
      sg.bracketDir = Vec2.normalize(Vec2.diff(p2, p1))
    }
    const d = sg.bracketDir

    let bb: Box2Abs | null = null
    let contentBoxes: Array<any> = []
    atoms.forEach(aid => {
      const atom = mol.atoms.get(aid)
      const pos = new Vec2(atom.pp)
      const ext = new Vec2(0.05 * 3, 0.05 * 3)
      const bba = Box2Abs.extend(new Box2Abs(pos, pos), ext, ext)
      contentBoxes.push(bba)
    })
    contentBoxes.forEach(bba => {
      let bbb: Box2Abs | null = null
      ;[bba.p0.x, bba.p1.x].forEach(x => {
        ;[bba.p0.y, bba.p1.y].forEach(y => {
          const v = new Vec2(x, y)
          const p = new Vec2(
            Vec2.dot(v, d),
            Vec2.dot(v, Vec2.rotateSC(d, 1, 0))
          )
          bbb = bbb === null ? new Box2Abs(p, p) : Box2Abs.include(bbb!, p)
        })
      })
      bb = bb === null ? bbb : Box2Abs.union(bb, bbb!)
    })
    var vext = new Vec2(0.2, 0.4)
    if (bb !== null) bb = Box2Abs.extend(bb, vext, vext)
    sg.bracketBox = bb
  }

  static getBracketParameters(
    mol: any,
    xbonds: any,
    atomSet: any,
    bb: Box2Abs,
    d: Vec2,
    n: Vec2
  ) {
    const brackets: Array<SGroupBracketParams> = []
    if (xbonds.length < 2) {
      d = d || new Vec2(1, 0)
      n = n || Vec2.rotateSC(d, 1, 0)
      const boxSize = bb.size()
      const bracketWidth = Math.min(0.25, boxSize.x * 0.3)
      const bracketHeight = boxSize.y
      const cl = Vec2.lc2(d, bb.p0.x, n, 0.5 * (bb.p0.y + bb.p1.y))
      const cr = Vec2.lc2(d, bb.p1.x, n, 0.5 * (bb.p0.y + bb.p1.y))

      brackets.push(
        new SGroupBracketParams(
          cl,
          Vec2.negate(d),
          bracketWidth,
          bracketHeight
        ),
        new SGroupBracketParams(cr, d, bracketWidth, bracketHeight)
      )
    } else if (xbonds.length === 2) {
      const b1: Bond = mol.bonds.get(xbonds[0])
      const b2: Bond = mol.bonds.get(xbonds[1])
      const cl0 = b1.getCenter(mol)
      const cr0 = b2.getCenter(mol)
      const dr = Vec2.normalize(Vec2.diff(cr0, cl0))
      const dl = Vec2.negate(dr)

      const bracketWidth = 0.25
      const bracketHeight = 1.5
      brackets.push(
        new SGroupBracketParams(
          Vec2.scale(Vec2.sum(cl0, dl), 0),
          dl,
          bracketWidth,
          bracketHeight
        ),
        new SGroupBracketParams(
          Vec2.scale(Vec2.sum(cr0, dr), 0),
          dr,
          bracketWidth,
          bracketHeight
        )
      )
    } else {
      for (let i = 0; i < xbonds.length; ++i) {
        const b: Bond = mol.bonds.get(xbonds[i])
        const c: Vec2 = b.getCenter(mol)
        const d: Vec2 = atomSet.has(b.begin)
          ? b.getDir(mol)
          : Vec2.negate(b.getDir(mol))
        brackets.push(new SGroupBracketParams(c, d, 0.2, 1.0))
      }
    }
    return brackets
  }

  static getObjBBox(atoms: any, mol: any) {
    console.assert(atoms.length !== 0, 'Atom list is empty')

    const a0 = mol.atoms.get(atoms[0]).pp
    let bb = new Box2Abs(a0, a0)
    for (let i = 1; i < atoms.length; ++i) {
      const aid = atoms[i]
      const atom = mol.atoms.get(aid)
      const p = atom.pp
      bb = Box2Abs.include(bb, p)
    }
    return bb
  }

  static getAtoms(mol: any, sg: SGroup) {
    /* shoud we use prototype? */
    if (!sg.allAtoms) return sg.atoms
    let atoms: Array<any> = []
    mol.atoms.forEach((_atom: any, aid: any) => {
      atoms.push(aid)
    })
    return atoms
  }

  static getBonds(mol: any, sg: SGroup) {
    const atoms = SGroup.getAtoms(mol, sg)
    let bonds: Array<any> = []
    mol.bonds.forEach((bond: any, bid: any) => {
      if (atoms.indexOf(bond.begin) >= 0 && atoms.indexOf(bond.end) >= 0)
        bonds.push(bid)
    })
    return bonds
  }

  static prepareMulForSaving(sgroup: SGroup, mol: any) {
    sgroup.atoms.sort((a: any, b: any) => a - b)
    sgroup.atomSet = new Pile(sgroup.atoms)
    sgroup.parentAtomSet = new Pile(sgroup.atomSet)
    const inBonds: Array<any> = []
    const xBonds: Array<any> = []

    mol.bonds.forEach((bond: any, bid: any) => {
      if (
        sgroup.parentAtomSet.has(bond.begin) &&
        sgroup.parentAtomSet.has(bond.end)
      )
        inBonds.push(bid)
      else if (
        sgroup.parentAtomSet.has(bond.begin) ||
        sgroup.parentAtomSet.has(bond.end)
      )
        xBonds.push(bid)
    })

    if (xBonds.length !== 0 && xBonds.length !== 2)
      throw Error('Unsupported cross-bonds number')

    let xAtom1 = -1
    let xAtom2 = -1
    let crossBond = null
    if (xBonds.length === 2) {
      let bond1 = mol.bonds.get(xBonds[0])
      xAtom1 = sgroup.parentAtomSet.has(bond1.begin) ? bond1.begin : bond1.end

      let bond2 = mol.bonds.get(xBonds[1])
      xAtom2 = sgroup.parentAtomSet.has(bond2.begin) ? bond2.begin : bond2.end
      crossBond = bond2
    }

    let tailAtom = xAtom2

    const newAtoms: Array<any> = []
    for (let j = 0; j < sgroup.data.mul - 1; j++) {
      let amap = {}
      sgroup.atoms.forEach(aid => {
        var atom = mol.atoms.get(aid)
        var aid2 = mol.atoms.add(new Atom(atom))
        newAtoms.push(aid2)
        sgroup.atomSet.add(aid2)
        amap[aid] = aid2
      })
      inBonds.forEach(bid => {
        var bond = mol.bonds.get(bid)
        var newBond = new Bond(bond)
        newBond.begin = amap[newBond.begin]
        newBond.end = amap[newBond.end]
        mol.bonds.add(newBond)
      })
      if (crossBond !== null) {
        var newCrossBond = new Bond(crossBond)
        newCrossBond.begin = tailAtom
        newCrossBond.end = amap[xAtom1]
        mol.bonds.add(newCrossBond)
        tailAtom = amap[xAtom2]
      }
    }
    if (tailAtom >= 0) {
      var xBond2 = mol.bonds.get(xBonds[1])
      if (xBond2.begin === xAtom2) xBond2.begin = tailAtom
      else xBond2.end = tailAtom
    }
    sgroup.bonds = xBonds

    newAtoms.forEach(aid => {
      mol.sGroupForest
        .getPathToRoot(sgroup.id)
        .reverse()
        .forEach(sgid => {
          mol.atomAddToSGroup(sgid, aid)
        })
    })
  }

  static getMassCenter(mol: any, atoms: any) {
    let c = new Vec2()
    for (let i = 0; i < atoms.length; ++i)
      c = Vec2.sum(
        c,
        Vec2.scale(mol.atoms.get(atoms[i]).pp, 1.0 / atoms.length)
      )
    return c
  }

  // TODO: these methods should be overridden
  //      and should only accept valid attributes for each S-group type.
  //      The attributes should be accessed via these methods only and not directly through this.data.
  // stub
  getAttr(attr: string) {
    return this.data[attr]
  }

  // TODO: should be group-specific
  getAttrs() {
    var attrs = {}
    Object.keys(this.data).forEach(attr => {
      attrs[attr] = this.data[attr]
    })
    return attrs
  }

  // stub
  setAttr(attr: string, value: any) {
    var oldValue = this.data[attr]
    this.data[attr] = value
    return oldValue
  }

  // stub
  checkAttr(attr: string, value: any) {
    return this.data[attr] === value
  }
}
