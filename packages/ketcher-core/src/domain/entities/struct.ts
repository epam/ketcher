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

import { Atom, radicalElectrons } from './atom'

import { Bond } from './bond'
import { Box2Abs } from './box2Abs'
import { Elements } from 'domain/constants'
import { Fragment } from './fragment'
import { FunctionalGroup } from './functionalGroup'
import { HalfBond } from './halfBond'
import { Loop } from './loop'
import { Pile } from './pile'
import { Pool } from './pool'
import { RGroup } from './rgroup'
import { RxnArrow } from './rxnArrow'
import { RxnPlus } from './rxnPlus'
import { SGroup } from './sgroup'
import { SGroupForest } from './sgroupForest'
import { SimpleObject } from './simpleObject'
import { Text } from './text'
import { Vec2 } from './vec2'
import { Highlight } from './highlight'

export type Neighbor = {
  aid: number
  bid: number
}

function arrayAddIfMissing(array, item) {
  for (let i = 0; i < array.length; ++i) {
    if (array[i] === item) return false
  }
  array.push(item)
  return true
}

export class Struct {
  atoms: Pool<Atom>
  bonds: Pool<Bond>
  sgroups: Pool<SGroup>
  halfBonds: Pool<HalfBond>
  loops: Pool<Loop>
  isReaction: boolean
  rxnArrows: Pool<RxnArrow>
  rxnPluses: Pool<RxnPlus>
  frags: Pool<Fragment | null>
  rgroups: Pool<RGroup>
  name: string
  abbreviation?: string
  sGroupForest: SGroupForest
  simpleObjects: Pool<SimpleObject>
  texts: Pool<Text>
  functionalGroups: Pool<FunctionalGroup>
  highlights: Pool<Highlight>

  constructor() {
    this.atoms = new Pool<Atom>()
    this.bonds = new Pool<Bond>()
    this.sgroups = new Pool<SGroup>()
    this.halfBonds = new Pool<HalfBond>()
    this.loops = new Pool<Loop>()
    this.isReaction = false
    this.rxnArrows = new Pool<RxnArrow>()
    this.rxnPluses = new Pool<RxnPlus>()
    this.frags = new Pool<Fragment>()
    this.rgroups = new Pool<RGroup>()
    this.name = ''
    this.abbreviation = ''
    this.sGroupForest = new SGroupForest()
    this.simpleObjects = new Pool<SimpleObject>()
    this.texts = new Pool<Text>()
    this.functionalGroups = new Pool<FunctionalGroup>()
    this.highlights = new Pool<Highlight>()
  }

  hasRxnProps(): boolean {
    return !!(
      this.atoms.find((_aid, atom) => atom.hasRxnProps()) ||
      this.bonds.find((_bid, bond) => bond.hasRxnProps())
    )
  }

  hasRxnArrow(): boolean {
    return this.rxnArrows.size >= 1
  }

  hasRxnPluses(): boolean {
    return this.rxnPluses.size > 0
  }

  isRxn(): boolean {
    return this.hasRxnArrow() || this.hasRxnPluses()
  }

  isBlank(): boolean {
    return (
      this.atoms.size === 0 &&
      this.rxnArrows.size === 0 &&
      this.rxnPluses.size === 0 &&
      this.simpleObjects.size === 0 &&
      this.texts.size === 0
    )
  }

  isSingleGroup(): boolean {
    if (!this.sgroups.size || this.sgroups.size > 1) return false
    const sgroup = this.sgroups.values().next().value // get sgroup from map
    return this.atoms.size === sgroup.atoms.length
  }

  clone(
    atomSet?: Pile<number> | null,
    bondSet?: Pile<number> | null,
    dropRxnSymbols?: boolean,
    aidMap?: Map<number, number> | null,
    simpleObjectsSet?: Pile<number> | null,
    textsSet?: Pile<number> | null
  ): Struct {
    return this.mergeInto(
      new Struct(),
      atomSet,
      bondSet,
      dropRxnSymbols,
      false,
      aidMap,
      simpleObjectsSet,
      textsSet
    )
  }

  getScaffold(): Struct {
    const atomSet = new Pile<number>()
    this.atoms.forEach((_atom, aid) => {
      atomSet.add(aid)
    })

    this.rgroups.forEach((rg) => {
      rg.frags.forEach((_fnum, fid) => {
        this.atoms.forEach((atom, aid) => {
          if (atom.fragment === fid) atomSet.delete(aid)
        })
      })
    })

    return this.clone(atomSet)
  }

  getFragmentIds(fid: number): Pile<number> {
    const atomSet = new Pile<number>()

    this.atoms.forEach((atom, aid) => {
      if (atom.fragment === fid) atomSet.add(aid)
    })

    return atomSet
  }

  getFragment(fid: number): Struct {
    return this.clone(this.getFragmentIds(fid), null, true)
  }

  mergeInto(
    cp: Struct,
    atomSet?: Pile<number> | null,
    bondSet?: Pile<number> | null,
    dropRxnSymbols?: boolean,
    keepAllRGroups?: boolean,
    aidMap?: Map<number, number> | null,
    simpleObjectsSet?: Pile<number> | null,
    textsSet?: Pile<number> | null
  ): Struct {
    atomSet = atomSet || new Pile<number>(this.atoms.keys())
    bondSet = bondSet || new Pile<number>(this.bonds.keys())
    simpleObjectsSet =
      simpleObjectsSet || new Pile<number>(this.simpleObjects.keys())
    textsSet = textsSet || new Pile<number>(this.texts.keys())
    aidMap = aidMap || new Map()

    bondSet = bondSet.filter((bid) => {
      const bond = this.bonds.get(bid)!
      return atomSet!.has(bond.begin) && atomSet!.has(bond.end)
    })

    const fidMask = new Pile()
    this.atoms.forEach((atom, aid) => {
      if (atomSet!.has(aid)) fidMask.add(atom.fragment)
    })

    const fidMap = new Map()
    this.frags.forEach((_frag, fid) => {
      if (fidMask.has(fid)) fidMap.set(fid, cp.frags.add(null))
    })

    const rgroupsIds: Array<number> = []
    this.rgroups.forEach((rgroup, rgid) => {
      let keepGroup = keepAllRGroups
      if (!keepGroup) {
        rgroup.frags.forEach((_fnum, fid) => {
          rgroupsIds.push(fid)
          if (fidMask.has(fid)) keepGroup = true
        })

        if (!keepGroup) return
      }

      const rg = cp.rgroups.get(rgid)
      if (rg) {
        rgroup.frags.forEach((_fnum, fid) => {
          rgroupsIds.push(fid)
          if (fidMask.has(fid)) rg.frags.add(fidMap.get(fid))
        })
      } else {
        cp.rgroups.set(rgid, rgroup.clone(fidMap))
      }
    })

    // atoms in not RGroup
    this.atoms.forEach((atom, aid) => {
      if (atomSet!.has(aid) && rgroupsIds.indexOf(atom.fragment) === -1) {
        aidMap!.set(aid, cp.atoms.add(atom.clone(fidMap)))
      }
    })
    // atoms in RGroup
    this.atoms.forEach((atom, aid) => {
      if (atomSet!.has(aid) && rgroupsIds.indexOf(atom.fragment) !== -1) {
        aidMap!.set(aid, cp.atoms.add(atom.clone(fidMap)))
      }
    })

    fidMap.forEach((newfid, oldfid) => {
      const fragment = this.frags.get(oldfid)

      // TODO: delete type check
      if (fragment && fragment instanceof Fragment) {
        cp.frags.set(newfid, this.frags.get(oldfid)!.clone(aidMap!)) // clone Fragments
      }
    })

    const bidMap = new Map()
    this.bonds.forEach((bond, bid) => {
      if (bondSet!.has(bid)) bidMap.set(bid, cp.bonds.add(bond.clone(aidMap!)))
    })

    this.sgroups.forEach((sg) => {
      if (sg.atoms.some((aid) => !atomSet!.has(aid))) return

      sg = SGroup.clone(sg, aidMap!)
      const id = cp.sgroups.add(sg)
      sg.id = id

      sg.atoms.forEach((aid) => {
        const atom = cp.atoms.get(aid)
        if (atom) {
          atom.sgs.add(id)
        }
      })

      if (sg.type === 'DAT') cp.sGroupForest.insert(sg, -1, [])
      else cp.sGroupForest.insert(sg)
    })

    this.functionalGroups.forEach((fg) => {
      fg = FunctionalGroup.clone(fg)
      cp.functionalGroups.add(fg)
    })

    simpleObjectsSet.forEach((soid) => {
      cp.simpleObjects.add(this.simpleObjects.get(soid)!.clone())
    })

    textsSet.forEach((id) => {
      cp.texts.add(this.texts.get(id)!.clone())
    })

    if (!dropRxnSymbols) {
      cp.isReaction = this.isReaction
      this.rxnArrows.forEach((item) => {
        cp.rxnArrows.add(item.clone())
      })
      this.rxnPluses.forEach((item) => {
        cp.rxnPluses.add(item.clone())
      })
    }

    cp.name = this.name

    return cp
  }

  // NB: this updates the structure without modifying the corresponding ReStruct.
  //  To be applied to standalone structures only.
  prepareLoopStructure() {
    this.initHalfBonds()
    this.initNeighbors()
    this.updateHalfBonds(Array.from(this.atoms.keys()))
    this.sortNeighbors(Array.from(this.atoms.keys()))
    this.findLoops()
  }

  atomAddToSGroup(sgid, aid) {
    // TODO: [MK] make sure the addition does not break the hierarchy?
    SGroup.addAtom(this.sgroups.get(sgid)!, aid)
    this.atoms.get(aid)!.sgs.add(sgid)
  }

  calcConn(atom) {
    let conn = 0
    for (let i = 0; i < atom.neighbors.length; ++i) {
      const hb = this.halfBonds.get(atom.neighbors[i])!
      const bond = this.bonds.get(hb.bid)!
      switch (bond.type) {
        case Bond.PATTERN.TYPE.SINGLE:
          conn += 1
          break
        case Bond.PATTERN.TYPE.DOUBLE:
          conn += 2
          break
        case Bond.PATTERN.TYPE.TRIPLE:
          conn += 3
          break
        case Bond.PATTERN.TYPE.DATIVE:
          break
        case Bond.PATTERN.TYPE.HYDROGEN:
          break
        case Bond.PATTERN.TYPE.AROMATIC:
          if (atom.neighbors.length === 1) return [-1, true]
          return [atom.neighbors.length, true]
        default:
          return [-1, false]
      }
    }
    return [conn, false]
  }

  findBondId(begin, end) {
    return this.bonds.find(
      (_bid, bond) =>
        (bond.begin === begin && bond.end === end) ||
        (bond.begin === end && bond.end === begin)
    )
  }

  initNeighbors() {
    this.atoms.forEach((atom) => {
      atom.neighbors = []
    })

    this.bonds.forEach((bond) => {
      const a1 = this.atoms.get(bond.begin)!
      const a2 = this.atoms.get(bond.end)!
      a1.neighbors.push(bond.hb1!)
      a2.neighbors.push(bond.hb2!)
    })
  }

  bondInitHalfBonds(bid, bond?: Bond) {
    bond = bond || this.bonds.get(bid)!
    bond.hb1 = 2 * bid
    bond.hb2 = 2 * bid + 1 // eslint-disable-line no-mixed-operators
    this.halfBonds.set(bond.hb1, new HalfBond(bond.begin, bond.end, bid))
    this.halfBonds.set(bond.hb2, new HalfBond(bond.end, bond.begin, bid))
    const hb1 = this.halfBonds.get(bond.hb1)!
    const hb2 = this.halfBonds.get(bond.hb2)!
    hb1.contra = bond.hb2
    hb2.contra = bond.hb1
  }

  halfBondUpdate(halfBondId: number) {
    const halfBond = this.halfBonds.get(halfBondId)!
    const startCoords = this.atoms.get(halfBond.begin)!.pp
    const endCoords = this.atoms.get(halfBond.end)!.pp
    const coordsDifference = Vec2.diff(endCoords, startCoords).normalized()
    halfBond.dir =
      Vec2.dist(endCoords, startCoords) > 1e-4
        ? coordsDifference
        : new Vec2(1, 0)
    halfBond.norm = halfBond.dir.turnLeft()
    halfBond.ang = halfBond.dir.oxAngle()
    if (halfBond.loop < 0) halfBond.loop = -1
  }

  initHalfBonds() {
    this.halfBonds.clear()
    this.bonds.forEach((bond, bid) => {
      this.bondInitHalfBonds(bid, bond)
    })
  }

  setHbNext(hbid, next) {
    this.halfBonds.get(this.halfBonds.get(hbid)!.contra)!.next = next
  }

  halfBondSetAngle(hbid, left) {
    const hb = this.halfBonds.get(hbid)!
    const hbl = this.halfBonds.get(left)!

    hbl.rightCos = Vec2.dot(hbl.dir, hb.dir)
    hb.leftCos = Vec2.dot(hbl.dir, hb.dir)

    hbl.rightSin = Vec2.cross(hbl.dir, hb.dir)
    hb.leftSin = Vec2.cross(hbl.dir, hb.dir)

    hb.leftNeighbor = left
    hbl.rightNeighbor = hbid
  }

  atomAddNeighbor(hbid) {
    const hb = this.halfBonds.get(hbid)!
    const atom = this.atoms.get(hb.begin)!

    let i
    for (i = 0; i < atom.neighbors.length; ++i) {
      if (this.halfBonds.get(atom.neighbors[i])!.ang > hb.ang) break
    }
    atom.neighbors.splice(i, 0, hbid)
    const ir = atom.neighbors[(i + 1) % atom.neighbors.length]
    const il =
      atom.neighbors[(i + atom.neighbors.length - 1) % atom.neighbors.length]
    this.setHbNext(il, hbid)
    this.setHbNext(hbid, ir)
    this.halfBondSetAngle(hbid, il)
    this.halfBondSetAngle(ir, hbid)
  }

  atomSortNeighbors(aid) {
    const atom = this.atoms.get(aid)!
    const halfBonds = this.halfBonds

    atom.neighbors
      .sort((nei, nei2) => halfBonds.get(nei)!.ang - halfBonds.get(nei2)!.ang)
      .forEach((nei, i) => {
        const nextNei = atom.neighbors[(i + 1) % atom.neighbors.length]
        this.halfBonds.get(this.halfBonds.get(nei)!.contra)!.next = nextNei
        this.halfBondSetAngle(nextNei, nei)
      })
  }

  sortNeighbors(list) {
    if (!list) {
      this.atoms.forEach((_atom, aid) => {
        this.atomSortNeighbors(aid)
      })
    } else {
      list.forEach((aid) => {
        this.atomSortNeighbors(aid)
      })
    }
  }

  atomUpdateHalfBonds(atomId: number) {
    this.atoms.get(atomId)!.neighbors.forEach((hbid) => {
      this.halfBondUpdate(hbid)
      this.halfBondUpdate(this.halfBonds.get(hbid)!.contra)
    })
  }

  updateHalfBonds(list) {
    if (!list) {
      this.atoms.forEach((_atom, atomId) => {
        this.atomUpdateHalfBonds(atomId)
      })
    } else {
      list.forEach((atomId) => {
        this.atomUpdateHalfBonds(atomId)
      })
    }
  }

  sGroupsRecalcCrossBonds() {
    this.sgroups.forEach((sg) => {
      sg.xBonds = []
      sg.neiAtoms = []
    })

    this.bonds.forEach((bond, bid) => {
      const a1 = this.atoms.get(bond.begin)!
      const a2 = this.atoms.get(bond.end)!

      a1.sgs.forEach((sgid) => {
        if (!a2.sgs.has(sgid)) {
          const sg = this.sgroups.get(sgid)!
          sg.xBonds.push(bid)
          arrayAddIfMissing(sg.neiAtoms, bond.end)
        }
      })

      a2.sgs.forEach((sgid) => {
        if (!a1.sgs.has(sgid)) {
          const sg = this.sgroups.get(sgid)!
          sg.xBonds.push(bid)
          arrayAddIfMissing(sg.neiAtoms, bond.begin)
        }
      })
    })
  }

  sGroupDelete(sgid: number) {
    this.sgroups.get(sgid)!.atoms.forEach((atom) => {
      this.atoms.get(atom)!.sgs.delete(sgid)
    })

    this.sGroupForest.remove(sgid)
    this.sgroups.delete(sgid)
  }

  atomSetPos(id: number, pp: Vec2): void {
    const item = this.atoms.get(id)!
    item.pp = pp
  }

  rxnPlusSetPos(id: number, pp: Vec2): void {
    const item = this.rxnPluses.get(id)!
    item.pp = pp
  }

  rxnArrowSetPos(id: number, pos: Array<Vec2>): void {
    const item = this.rxnArrows.get(id)
    if (item) {
      item.pos = pos
    }
  }

  simpleObjectSetPos(id: number, pos: Array<Vec2>) {
    const item = this.simpleObjects.get(id)!
    item.pos = pos
  }

  textSetPosition(id: number, position: Vec2): void {
    const item = this.texts.get(id)

    if (item) {
      item.position = position
    }
  }

  getCoordBoundingBox(atomSet?: Pile<number>) {
    let bb: any = null
    function extend(pp) {
      if (!bb) {
        bb = {
          min: pp,
          max: pp
        }
      } else {
        if (pp instanceof Array) {
          pp.forEach((vec) => {
            bb.min = Vec2.min(bb.min, vec)
            bb.max = Vec2.max(bb.max, vec)
          })
        } else {
          bb.min = Vec2.min(bb.min, pp)
          bb.max = Vec2.max(bb.max, pp)
        }
      }
    }

    const global = !atomSet || atomSet.size === 0

    this.atoms.forEach((atom, aid) => {
      if (global || atomSet!.has(aid)) extend(atom.pp)
    })
    if (global) {
      this.rxnPluses.forEach((item) => {
        extend(item.pp)
      })
      this.rxnArrows.forEach((item) => {
        extend(item.pos)
      })
      this.simpleObjects.forEach((item) => {
        extend(item.pos)
      })
      this.texts.forEach((item) => {
        extend(item.position)
      })
    }
    if (!bb && global) {
      bb = {
        min: new Vec2(0, 0),
        max: new Vec2(1, 1)
      }
    }
    return bb
  }

  getCoordBoundingBoxObj() {
    let bb: any = null
    function extend(pp) {
      if (!bb) {
        bb = {
          min: new Vec2(pp),
          max: new Vec2(pp)
        }
      } else {
        bb.min = Vec2.min(bb.min, pp)
        bb.max = Vec2.max(bb.max, pp)
      }
    }

    this.atoms.forEach((atom) => {
      extend(atom.pp)
    })
    return bb
  }

  getBondLengthData() {
    let totalLength = 0
    let cnt = 0
    this.bonds.forEach((bond) => {
      totalLength += Vec2.dist(
        this.atoms.get(bond.begin)!.pp,
        this.atoms.get(bond.end)!.pp
      )
      cnt++
    })
    return { cnt, totalLength }
  }

  getAvgBondLength(): number {
    const bld = this.getBondLengthData()
    return bld.cnt > 0 ? bld.totalLength / bld.cnt : -1
  }

  getAvgClosestAtomDistance(): number {
    let totalDist = 0
    let minDist
    let dist = 0
    const keys = Array.from(this.atoms.keys())
    let k
    let j
    for (k = 0; k < keys.length; ++k) {
      minDist = -1
      for (j = 0; j < keys.length; ++j) {
        if (j === k) continue // eslint-disable-line no-continue
        dist = Vec2.dist(
          this.atoms.get(keys[j])!.pp,
          this.atoms.get(keys[k])!.pp
        )
        if (minDist < 0 || minDist > dist) minDist = dist
      }
      totalDist += minDist
    }

    return keys.length > 0 ? totalDist / keys.length : -1
  }

  checkBondExists(begin: number, end: number): boolean {
    const key = this.bonds.find(
      (_bid, bond) =>
        (bond.begin === begin && bond.end === end) ||
        (bond.end === begin && bond.begin === end)
    )

    return key !== undefined
  }

  findConnectedComponent(firstaid: number): Pile<number> {
    const list = [firstaid]
    const ids = new Pile<number>()
    while (list.length > 0) {
      const aid = list.pop()!
      ids.add(aid)
      const atom = this.atoms.get(aid)!
      atom.neighbors.forEach((nei) => {
        const neiId = this.halfBonds.get(nei)!.end
        if (!ids.has(neiId)) list.push(neiId)
      })
    }

    return ids
  }

  findConnectedComponents(discardExistingFragments?: boolean) {
    // NB: this is a hack
    // TODO: need to maintain half-bond and neighbor structure permanently
    if (!this.halfBonds.size) {
      this.initHalfBonds()
      this.initNeighbors()
      this.updateHalfBonds(Array.from(this.atoms.keys()))
      this.sortNeighbors(Array.from(this.atoms.keys()))
    }

    let addedAtoms = new Pile<number>()

    const components: Array<any> = []
    this.atoms.forEach((atom, aid) => {
      if (
        (discardExistingFragments || atom.fragment < 0) &&
        !addedAtoms.has(aid)
      ) {
        const component = this.findConnectedComponent(aid)
        components.push(component)
        addedAtoms = addedAtoms.union(component)
      }
    })

    return components
  }

  markFragment(idSet: Pile<number>) {
    const frag = new Fragment()
    const fid = this.frags.add(frag)

    idSet.forEach((aid) => {
      const atom = this.atoms.get(aid)!
      if (atom.stereoLabel) frag.updateStereoAtom(this, aid, fid, true)
      atom.fragment = fid
    })
  }

  markFragments() {
    const components = this.findConnectedComponents()
    components.forEach((comp) => {
      this.markFragment(comp)
    })
  }

  scale(scale: number) {
    if (scale === 1) return

    this.atoms.forEach((atom) => {
      atom.pp = atom.pp.scaled(scale)
    })

    this.rxnPluses.forEach((item) => {
      item.pp = item.pp.scaled(scale)
    })

    this.rxnArrows.forEach((item) => {
      item.pos = item.pos.map((p) => p.scaled(scale))
    })

    this.sgroups.forEach((item) => {
      item.pp = item.pp ? item.pp.scaled(scale) : null
    })

    this.texts.forEach((item) => {
      // Scale text only for reactions - i.e file contains reaction arrows
      const isReactionStruct = this.rxnArrows.size
      if (isReactionStruct) {
        item.pos = item.pos.map((p) => p.scaled(scale))
        item.position = item.position.scaled(scale)
      }
    })
  }

  rescale() {
    let avg = this.getAvgBondLength()
    if (avg < 0 && !this.isReaction) {
      // TODO [MK] this doesn't work well for reactions as the distances between
      // the atoms in different components are generally larger than those between atoms of a single component
      // (KETCHER-341)
      avg = this.getAvgClosestAtomDistance()
    }
    if (avg < 1e-3) avg = 1

    const scale = 1 / avg
    this.scale(scale)
  }

  loopHasSelfIntersections(hbs: Array<number>) {
    for (let i = 0; i < hbs.length; ++i) {
      const hbi = this.halfBonds.get(hbs[i])!
      const ai = this.atoms.get(hbi.begin)!.pp
      const bi = this.atoms.get(hbi.end)!.pp
      const set = new Pile([hbi.begin, hbi.end])

      for (let j = i + 2; j < hbs.length; ++j) {
        const hbj = this.halfBonds.get(hbs[j])!
        if (set.has(hbj.begin) || set.has(hbj.end)) continue // skip edges sharing an atom

        const aj = this.atoms.get(hbj.begin)!.pp
        const bj = this.atoms.get(hbj.end)!.pp

        if (Box2Abs.segmentIntersection(ai, bi, aj, bj)) return true
      }
    }

    return false
  }

  // partition a cycle into simple cycles
  // TODO: [MK] rewrite the detection algorithm to only find simple ones right away?
  partitionLoop(loop: any) {
    // eslint-disable-line max-statements
    const subloops: Array<any> = []
    let continueFlag = true
    while (continueFlag) {
      const atomToHalfBond = {} // map from every atom in the loop to the index of the first half-bond starting from that atom in the uniqHb array
      continueFlag = false

      for (let l = 0; l < loop.length; ++l) {
        const hbid = loop[l]
        const aid1 = this.halfBonds.get(hbid)!.begin
        const aid2 = this.halfBonds.get(hbid)!.end
        if (aid2 in atomToHalfBond) {
          // subloop found
          const s = atomToHalfBond[aid2] // where the subloop begins
          const subloop = loop.slice(s, l + 1)
          subloops.push(subloop)
          if (l < loop.length) {
            // remove half-bonds corresponding to the subloop
            loop.splice(s, l - s + 1)
          }
          continueFlag = true
          break
        }
        atomToHalfBond[aid1] = l
      }
      if (!continueFlag) subloops.push(loop) // we're done, no more subloops found
    }
    return subloops
  }

  halfBondAngle(hbid1: number, hbid2: number): number {
    const hba = this.halfBonds.get(hbid1)!
    const hbb = this.halfBonds.get(hbid2)!
    return Math.atan2(Vec2.cross(hba.dir, hbb.dir), Vec2.dot(hba.dir, hbb.dir))
  }

  loopIsConvex(loop: Array<any>): boolean {
    return loop.every((item, k, loopArr) => {
      const angle = this.halfBondAngle(item, loopArr[(k + 1) % loopArr.length])
      return angle <= 0
    })
  }

  // check whether a loop is on the inner or outer side of the polygon
  //  by measuring the total angle between bonds
  loopIsInner(loop: Array<any>): boolean {
    let totalAngle = 2 * Math.PI
    loop.forEach((hbida, k, loopArr) => {
      const hbidb = loopArr[(k + 1) % loopArr.length]
      const hbb = this.halfBonds.get(hbidb)!
      const angle = this.halfBondAngle(hbida, hbidb)
      totalAngle += hbb.contra === hbida ? Math.PI : angle // back and forth along the same edge
    })
    return Math.abs(totalAngle) < Math.PI
  }

  findLoops() {
    const newLoops: Array<any> = []
    const bondsToMark = new Pile<number>()

    /*
      Starting from each half-bond not known to be in a loop yet,
      follow the 'next' links until the initial half-bond is reached or
      the length of the sequence exceeds the number of half-bonds available.
      In a planar graph, as long as every bond is a part of some "loop" -
      either an outer or an inner one - every iteration either yields a loop
      or doesn't start at all. Thus this has linear complexity in the number
      of bonds for planar graphs.
   */

    let hbIdNext, c, loop
    this.halfBonds.forEach((hb, hbId) => {
      if (hb.loop !== -1) return

      for (
        hbIdNext = hbId, c = 0, loop = [];
        c <= this.halfBonds.size;
        hbIdNext = this.halfBonds.get(hbIdNext)!.next, ++c
      ) {
        if (!(c > 0 && hbIdNext === hbId)) {
          loop.push(hbIdNext)
          continue // eslint-disable-line no-continue
        }

        // loop found
        const subloops = this.partitionLoop(loop)
        subloops.forEach((loop) => {
          let loopId
          if (this.loopIsInner(loop) && !this.loopHasSelfIntersections(loop)) {
            /*
                        loop is internal
                        use lowest half-bond id in the loop as the loop id
                        this ensures that the loop gets the same id if it is discarded and then recreated,
                        which in turn is required to enable redrawing while dragging, as actions store item id's
                     */
            loopId = Math.min(...loop)
            this.loops.set(
              loopId,
              new Loop(loop, this, this.loopIsConvex(loop))
            )
          } else {
            loopId = -2
          }

          loop.forEach((hbid) => {
            this.halfBonds.get(hbid)!.loop = loopId
            bondsToMark.add(this.halfBonds.get(hbid)!.bid)
          })

          if (loopId >= 0) newLoops.push(loopId)
        })
        break
      }
    })

    return {
      newLoops,
      bondsToMark: Array.from(bondsToMark)
    }
  }

  calcImplicitHydrogen(aid: number) {
    const atom = this.atoms.get(aid)!
    const [conn, isAromatic] = this.calcConn(atom)
    let correctConn = conn
    atom.badConn = false

    if (isAromatic) {
      if (atom.label === 'C' && atom.charge === 0) {
        if (conn === 3) {
          atom.implicitH = -radicalElectrons(atom.radical)
          return
        }
        if (conn === 2) {
          atom.implicitH = 1 - radicalElectrons(atom.radical)
          return
        }
      } else if (
        (atom.label === 'O' && atom.charge === 0) ||
        (atom.label === 'N' && atom.charge === 0 && conn === 3) ||
        (atom.label === 'N' && atom.charge === 1 && conn === 3) ||
        (atom.label === 'S' && atom.charge === 0 && conn === 3)
      ) {
        atom.implicitH = 0
        return
      } else if (!atom.hasImplicitH) {
        correctConn++
      }
    }

    if (correctConn < 0 || atom.isQuery()) {
      atom.implicitH = 0
      return
    }

    if (atom.explicitValence >= 0) {
      const elem = Elements.get(atom.label)
      atom.implicitH = elem
        ? atom.explicitValence - atom.calcValenceMinusHyd(correctConn)
        : 0
      if (atom.implicitH < 0) {
        atom.implicitH = 0
        atom.badConn = true
      }
    } else {
      atom.calcValence(correctConn)
    }
  }

  setImplicitHydrogen(list?: Array<number>) {
    this.sgroups.forEach((item) => {
      if (item.data.fieldName === 'MRV_IMPLICIT_H') {
        this.atoms.get(item.atoms[0])!.hasImplicitH = true
      }
    })

    if (!list) {
      this.atoms.forEach((_atom, aid) => {
        this.calcImplicitHydrogen(aid)
      })
    } else {
      list.forEach((aid) => {
        if (this.atoms.get(aid)) {
          this.calcImplicitHydrogen(aid)
        }
      })
    }
  }

  atomGetNeighbors(aid: number): Array<Neighbor> | undefined {
    return this.atoms.get(aid)?.neighbors.map((nei) => {
      const hb = this.halfBonds.get(nei)!
      return {
        aid: hb.end,
        bid: hb.bid
      }
    })
  }

  getComponents() {
    // eslint-disable-line max-statements
    /* saver */
    const connectedComponents = this.findConnectedComponents(true)
    const barriers: Array<any> = []
    let arrowPos: number | null = null

    this.rxnArrows.forEach((item) => {
      // there's just one arrow
      arrowPos = item.center().x
    })

    this.rxnPluses.forEach((item) => {
      barriers.push(item.pp.x)
    })

    if (arrowPos !== null) barriers.push(arrowPos)

    barriers.sort((a, b) => a - b)

    const components: Array<any> = []

    connectedComponents.forEach((component) => {
      const bb = this.getCoordBoundingBox(component)
      const c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5)
      let j = 0

      while (c.x > barriers[j]) ++j

      components[j] = components[j] || new Pile()
      components[j] = components[j].union(component)
    })

    const submolTexts: Array<string> = []
    const reactants: Array<any> = []
    const products: Array<any> = []

    components.forEach((component) => {
      if (!component) {
        submolTexts.push('')
        return
      }

      const rxnFragmentType = this.defineRxnFragmentTypeForAtomset(
        component,
        arrowPos || 0
      )

      if (rxnFragmentType === 1) reactants.push(component)
      else products.push(component)
    })

    return {
      reactants,
      products
    }
  }

  defineRxnFragmentTypeForAtomset(atomset: Pile<number>, arrowpos: number) {
    const bb = this.getCoordBoundingBox(atomset)
    const c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5)
    return c.x < arrowpos ? 1 : 2
  }

  getBondFragment(bid: number) {
    const aid = this.bonds.get(bid)?.begin
    return aid && this.atoms.get(aid)?.fragment
  }

  bindSGroupsToFunctionalGroups() {
    this.sgroups.forEach((sgroup) => {
      if (
        FunctionalGroup.isFunctionalGroup(sgroup) ||
        SGroup.isSuperAtom(sgroup)
      ) {
        this.functionalGroups.add(new FunctionalGroup(sgroup))
      }
    })
  }

  getGroupIdFromAtomId(atomId: number): number | null {
    for (const [groupId, sgroup] of Array.from(this.sgroups)) {
      if (sgroup.atoms.includes(atomId)) return groupId
    }
    return null
  }

  // TODO: simplify if bonds ids ever appear in sgroup
  // ! deprecate
  getGroupIdFromBondId(bondId: number): number | null {
    const bond = this.bonds.get(bondId)
    if (!bond) return null
    for (const [groupId, sgroup] of Array.from(this.sgroups)) {
      if (
        sgroup.atoms.includes(bond.begin) ||
        sgroup.atoms.includes(bond.end)
      ) {
        return groupId
      }
    }
    return null
  }

  getGroupsIdsFromBondId(bondId: number): number[] {
    const bond = this.bonds.get(bondId)
    if (!bond) return []

    const groupsIds: number[] = []

    for (const [groupId, sgroup] of Array.from(this.sgroups)) {
      if (
        sgroup.atoms.includes(bond.begin) ||
        sgroup.atoms.includes(bond.end)
      ) {
        groupsIds.push(groupId)
      }
    }
    return groupsIds
  }
}
