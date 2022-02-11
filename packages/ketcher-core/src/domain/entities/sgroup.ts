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

import { Atom } from './atom'
import { Bond } from './bond'
import { Box2Abs } from './box2Abs'
import { Pile } from './pile'
import { Struct } from './struct'
import { Vec2 } from './vec2'

export class SGroupBracketParams {
  readonly c: Vec2
  readonly d: Vec2
  readonly n: Vec2
  readonly w: number
  readonly h: number

  constructor(c: Vec2, d: Vec2, w: number, h: number) {
    this.c = c
    this.d = d
    this.n = d.rotateSC(1, 0)
    this.w = w
    this.h = h
  }
}

export class SGroup {
  static TYPES = {
    SUP: 'SUP',
    MUL: 'MUL',
    SRU: 'SRU',
    MON: 'MON',
    MER: 'MER',
    COP: 'COP',
    CRO: 'CRO',
    MOD: 'MOD',
    GRA: 'GRA',
    COM: 'COM',
    MIX: 'MIX',
    FOR: 'FOR',
    DAT: 'DAT',
    ANY: 'ANY',
    GEN: 'GEN'
  }

  type: string
  id: number
  label: number
  bracketBox: any
  bracketDir: Vec2
  areas: any
  hover: boolean
  hovering: any
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
    this.type = type
    this.id = -1
    this.label = -1
    this.bracketBox = null
    this.bracketDir = new Vec2(1, 0)
    this.areas = []

    this.hover = false
    this.hovering = null
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
      expanded: undefined,
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

  // TODO: these methods should be overridden
  //      and should only accept valid attributes for each S-group type.
  //      The attributes should be accessed via these methods only and not directly through this.data.
  // stub
  getAttr(attr: string): any {
    return this.data[attr]
  }

  // TODO: should be group-specific
  getAttrs(): any {
    var attrs = {}
    Object.keys(this.data).forEach(attr => {
      attrs[attr] = this.data[attr]
    })
    return attrs
  }

  // stub
  setAttr(attr: string, value: any): any {
    var oldValue = this.data[attr]
    this.data[attr] = value
    return oldValue
  }

  // stub
  checkAttr(attr: string, value: any): boolean {
    return this.data[attr] === value
  }

  updateOffset(offset: Vec2): void {
    this.pp = Vec2.sum(this.bracketBox.p1, offset)
  }

  calculatePP(struct: Struct): void {
    let topLeftPoint

    if (this.data.context === 'Atom' || this.data.context === 'Bond') {
      const contentBoxes: Array<any> = []
      let contentBB: Box2Abs | null = null
      const direction = new Vec2(1, 0)

      this.atoms.forEach(aid => {
        const atom = struct.atoms.get(aid)
        const pos = new Vec2(atom!.pp)
        const ext = new Vec2(0.05 * 3, 0.05 * 3)
        const bba = new Box2Abs(pos, pos).extend(ext, ext)
        contentBoxes.push(bba)
      })
      contentBoxes.forEach(bba => {
        var bbb: Box2Abs | null = null
        ;[bba.p0.x, bba.p1.x].forEach(x => {
          ;[bba.p0.y, bba.p1.y].forEach(y => {
            var v = new Vec2(x, y)
            var p = new Vec2(
              Vec2.dot(v, direction),
              Vec2.dot(v, direction.rotateSC(1, 0))
            )
            bbb = !bbb ? new Box2Abs(p, p) : bbb!.include(p)
          })
        })
        contentBB = !contentBB ? bbb : Box2Abs.union(contentBB, bbb!)
      })

      topLeftPoint = contentBB!.p0
    } else {
      topLeftPoint = this.bracketBox.p1.add(new Vec2(0.5, 0.5))
    }

    const sgroups = Array.from(struct.sgroups.values())
    for (let i = 0; i < struct.sgroups.size; ++i) {
      if (!descriptorIntersects(sgroups as [], topLeftPoint)) break

      topLeftPoint = topLeftPoint.add(new Vec2(0, 0.5))
    }

    // TODO: the code below is a temporary solution that will be removed after the implementation of the internal format
    // TODO: in schema.json required fields ["context", "FieldValue"] in sgroups type DAT must be returned
    if (this.data.fieldName === 'INDIGO_CIP_DESC') {
      if (this.atoms.length === 1) {
        const sAtom = this.atoms[0]
        const sAtomPP = struct.atoms.get(sAtom)?.pp

        if (sAtomPP) {
          topLeftPoint = sAtomPP
        }
      } else {
        topLeftPoint = SGroup.getMassCentre(struct, this.atoms)
      }
    }

    this.pp = topLeftPoint
  }

  static getOffset(sgroup: SGroup): null | Vec2 {
    if (!sgroup?.pp) return null
    return Vec2.diff(sgroup.pp, sgroup.bracketBox.p1)
  }

  static filterAtoms(atoms: any, map: any) {
    var newAtoms: Array<any> = []
    for (var i = 0; i < atoms.length; ++i) {
      var aid = atoms[i]
      if (typeof map[aid] !== 'number') newAtoms.push(aid)
      else if (map[aid] >= 0) newAtoms.push(map[aid])
      else newAtoms.push(-1)
    }
    return newAtoms
  }

  static removeNegative(atoms: any) {
    var newAtoms: Array<any> = []
    for (var j = 0; j < atoms.length; ++j) {
      if (atoms[j] >= 0) newAtoms.push(atoms[j])
    }
    return newAtoms
  }

  static filter(_mol, sg, atomMap) {
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
    cp.data.expanded = sgroup.data.expanded
    return cp
  }

  static addAtom(sgroup: SGroup, aid: number): void {
    sgroup.atoms.push(aid)
  }

  static removeAtom(sgroup: SGroup, aid: number): void {
    for (var i = 0; i < sgroup.atoms.length; ++i) {
      if (sgroup.atoms[i] === aid) {
        sgroup.atoms.splice(i, 1)
        return
      }
    }
  }

  static getCrossBonds(
    mol: any,
    parentAtomSet: Pile<number>
  ): { [key: number]: Array<Bond> } {
    const crossBonds: { [key: number]: Array<Bond> } = {}
    mol.bonds.forEach((bond, bid) => {
      if (parentAtomSet.has(bond.begin) && !parentAtomSet.has(bond.end)) {
        if (!crossBonds[bond.begin]) {
          crossBonds[bond.begin] = []
        }
        crossBonds[bond.begin].push(bid)
      } else if (
        parentAtomSet.has(bond.end) &&
        !parentAtomSet.has(bond.begin)
      ) {
        if (!crossBonds[bond.end]) {
          crossBonds[bond.end] = []
        }
        crossBonds[bond.end].push(bid)
      }
    })
    return crossBonds
  }

  static bracketPos(
    sGroup,
    mol,
    crossBondsPerAtom: { [key: number]: Array<Bond> }
  ): void {
    var atoms = sGroup.atoms
    const crossBonds = Object.values(crossBondsPerAtom).flat()
    if (!crossBonds || crossBonds.length !== 2) {
      sGroup.bracketDir = new Vec2(1, 0)
    } else {
      var p1 = mol.bonds.get(crossBonds[0]).getCenter(mol)
      var p2 = mol.bonds.get(crossBonds[1]).getCenter(mol)
      sGroup.bracketDir = Vec2.diff(p2, p1).normalized()
    }
    var d = sGroup.bracketDir

    var braketBox: Box2Abs | null = null
    var contentBoxes: Array<any> = []
    atoms.forEach(aid => {
      var atom = mol.atoms.get(aid)
      var pos = new Vec2(atom.pp)
      var ext = new Vec2(0.05 * 3, 0.05 * 3)
      var bba = new Box2Abs(pos, pos).extend(ext, ext)
      contentBoxes.push(bba)
    })
    contentBoxes.forEach(bba => {
      var bbb: Box2Abs | null = null
      ;[bba.p0.x, bba.p1.x].forEach(x => {
        ;[bba.p0.y, bba.p1.y].forEach(y => {
          var v = new Vec2(x, y)
          var p = new Vec2(Vec2.dot(v, d), Vec2.dot(v, d.rotateSC(1, 0)))
          bbb = !bbb ? new Box2Abs(p, p) : bbb!.include(p)
        })
      })
      braketBox = !braketBox ? bbb : Box2Abs.union(braketBox, bbb!)
    })
    var vext = new Vec2(0.2, 0.4)
    if (braketBox) braketBox = (braketBox as Box2Abs).extend(vext, vext)
    sGroup.bracketBox = braketBox
  }

  static getBracketParameters(
    mol,
    crossBondsPerAtom: { [key: number]: Array<Bond> },
    atomSet: Pile<number>,
    bb,
    d,
    n
  ): Array<any> {
    var brackets: Array<any> = []
    const crossBondsPerAtomValues = Object.values(crossBondsPerAtom)
    const crossBonds = crossBondsPerAtomValues.flat()
    if (crossBonds.length < 2) {
      ;(function () {
        d = d || new Vec2(1, 0)
        n = n || d.rotateSC(1, 0)
        var bracketWidth = Math.min(0.25, bb.sz().x * 0.3)
        var cl = Vec2.lc2(d, bb.p0.x, n, 0.5 * (bb.p0.y + bb.p1.y))
        var cr = Vec2.lc2(d, bb.p1.x, n, 0.5 * (bb.p0.y + bb.p1.y))
        var bracketHeight = bb.sz().y

        brackets.push(
          new SGroupBracketParams(cl, d.negated(), bracketWidth, bracketHeight),
          new SGroupBracketParams(cr, d, bracketWidth, bracketHeight)
        )
      })()
    } else if (
      crossBonds.length === 2 &&
      crossBondsPerAtomValues.length === 2
    ) {
      ;(function () {
        var b1 = mol.bonds.get(crossBonds[0])
        var b2 = mol.bonds.get(crossBonds[1])
        var cl0 = b1.getCenter(mol)
        var cr0 = b2.getCenter(mol)
        var dr = Vec2.diff(cr0, cl0).normalized()
        var dl = dr.negated()

        var bracketWidth = 0.25
        var bracketHeight = 1.5
        brackets.push(
          new SGroupBracketParams(
            cl0.addScaled(dl, 0),
            dl,
            bracketWidth,
            bracketHeight
          ),
          new SGroupBracketParams(
            cr0.addScaled(dr, 0),
            dr,
            bracketWidth,
            bracketHeight
          )
        )
      })()
    } else {
      ;(function () {
        for (var i = 0; i < crossBonds.length; ++i) {
          var b = mol.bonds.get(crossBonds[i])
          var c = b.getCenter(mol)
          var d = atomSet.has(b.begin) ? b.getDir(mol) : b.getDir(mol).negated()
          brackets.push(new SGroupBracketParams(c, d, 0.2, 1.0))
        }
      })()
    }
    return brackets
  }

  static getObjBBox(atoms, mol): Box2Abs {
    var a0 = mol.atoms.get(atoms[0]).pp
    var bb = new Box2Abs(a0, a0)
    for (var i = 1; i < atoms.length; ++i) {
      var aid = atoms[i]
      var atom = mol.atoms.get(aid)
      var p = atom.pp
      bb = bb.include(p)
    }
    return bb
  }

  static getAtoms(mol, sg): Array<any> {
    if (!sg.allAtoms) return sg.atoms
    var atoms: Array<any> = []
    mol.atoms.forEach((_atom, aid) => {
      atoms.push(aid)
    })
    return atoms
  }

  static getBonds(mol, sg): Array<any> {
    var atoms = SGroup.getAtoms(mol, sg)
    var bonds: Array<any> = []
    mol.bonds.forEach((bond, bid) => {
      if (atoms.indexOf(bond.begin) >= 0 && atoms.indexOf(bond.end) >= 0)
        bonds.push(bid)
    })
    return bonds
  }

  static prepareMulForSaving(sgroup, mol): void {
    sgroup.atoms.sort((a, b) => a - b)
    sgroup.atomSet = new Pile(sgroup.atoms)
    sgroup.parentAtomSet = new Pile(sgroup.atomSet)
    var inBonds: Array<any> = []
    var xBonds: Array<any> = []

    mol.bonds.forEach((bond, bid) => {
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

    var xAtom1 = -1
    var xAtom2 = -1
    var crossBond = null
    if (xBonds.length === 2) {
      var bond1 = mol.bonds.get(xBonds[0])
      xAtom1 = sgroup.parentAtomSet.has(bond1.begin) ? bond1.begin : bond1.end

      var bond2 = mol.bonds.get(xBonds[1])
      xAtom2 = sgroup.parentAtomSet.has(bond2.begin) ? bond2.begin : bond2.end
      crossBond = bond2
    }

    var tailAtom = xAtom2

    var newAtoms: Array<any> = []
    for (var j = 0; j < sgroup.data.mul - 1; j++) {
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

  static getMassCentre(mol, atoms): Vec2 {
    var c = new Vec2() // mass centre
    for (var i = 0; i < atoms.length; ++i)
      c = c.addScaled(mol.atoms.get(atoms[i]).pp, 1.0 / atoms.length)
    return c
  }
}

function descriptorIntersects(sgroups: [], topLeftPoint: Vec2): boolean {
  return sgroups.some((sg: SGroup) => {
    if (!sg.pp) return false

    const sgBottomRightPoint = sg.pp.add(new Vec2(0.5, 0.5))
    const bottomRightPoint = topLeftPoint.add(new Vec2(0.5, 0.5))

    return Box2Abs.segmentIntersection(
      sg.pp,
      sgBottomRightPoint,
      topLeftPoint,
      bottomRightPoint
    )
  })
}
