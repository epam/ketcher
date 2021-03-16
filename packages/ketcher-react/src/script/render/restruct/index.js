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
// ReStruct is to store all the auxiliary information for
//  Struct while rendering

import util from '../util'
import { Struct, Box2Abs, Pool, Pile, Vec2 } from 'ketcher-core'

import ReAtom from './reatom'
import ReBond from './rebond'
import ReRxnPlus from './rerxnplus'
import ReRxnArrow from './rerxnarrow'
import ReFrag from './refrag'
import ReRGroup from './rergroup'
import ReDataSGroupData from './redatasgroupdata'
import ReEnhancedFlag from './reenhancedflag'
import ReSGroup from './resgroup'
import ReLoop from './reloop'
import ReSimpleObject from './ReSimpleObject'

var LAYER_MAP = {
  background: 0,
  selectionPlate: 1,
  highlighting: 2,
  warnings: 3,
  data: 4,
  indices: 5
}
class ReStruct {
  constructor(molecule, render) {
    // eslint-disable-line max-statements
    this.render = render
    /** @type {Map<number, ReAtom>} */
    this.atoms = new Map()
    /** @type {Map<number, any>} */
    this.bonds = new Map()
    this.reloops = new Map()
    this.rxnPluses = new Map()
    this.rxnArrows = new Map()
    this.frags = new Pool()
    this.rgroups = new Pool()
    this.sgroups = new Map()
    this.sgroupData = new Map()
    this.enhancedFlags = new Map()
    this.simpleObjects = new Map()
    /** @type {Struct} */
    this.molecule = molecule || new Struct()
    this.initialized = false
    this.layers = []
    this.initLayers()

    this.connectedComponents = new Pool()
    this.ccFragmentType = new Pool()

    this.clearMarks()

    this.structChanged = false

    // TODO: eachItem ?

    molecule.atoms.forEach((atom, aid) => {
      this.atoms.set(aid, new ReAtom(atom))
    })

    molecule.bonds.forEach((bond, bid) => {
      this.bonds.set(bid, new ReBond(bond))
    })

    molecule.loops.forEach((loop, lid) => {
      this.reloops.set(lid, new ReLoop(loop))
    })

    molecule.rxnPluses.forEach((item, id) => {
      this.rxnPluses.set(id, new ReRxnPlus(item))
    })

    molecule.rxnArrows.forEach((item, id) => {
      this.rxnArrows.set(id, new ReRxnArrow(item))
    })

    molecule.simpleObjects.forEach((item, id) => {
      this.simpleObjects.set(id, new ReSimpleObject(item))
    })

    molecule.frags.forEach((item, id) => {
      this.frags.set(id, new ReFrag(item))
      const bb = molecule.getFragment(id).getCoordBoundingBox()
      if (item)
        this.enhancedFlags.set(
          id,
          new ReEnhancedFlag(
            item.enhancedStereoFlag || null,
            new Vec2(bb.max.x, bb.min.y - 1)
          )
        )
    })

    molecule.rgroups.forEach((item, id) => {
      this.rgroups.set(id, new ReRGroup(item))
    })

    molecule.sgroups.forEach((item, id) => {
      this.sgroups.set(id, new ReSGroup(item))
      if (item.type === 'DAT' && !item.data.attached)
        this.sgroupData.set(id, new ReDataSGroupData(item)) // [MK] sort of a hack, we use the SGroup id for the data field id
    })
  }

  /**
   * @param aid { number }
   * @param atom { Atom }
   */
  connectedComponentRemoveAtom(aid, atom = null) {
    atom = atom || this.atoms.get(aid)
    if (atom.component < 0) return
    var cc = this.connectedComponents.get(atom.component)

    cc.delete(aid)
    if (cc.size < 1) this.connectedComponents.delete(atom.component)

    atom.component = -1
  }

  clearConnectedComponents() {
    this.connectedComponents.clear()
    this.atoms.forEach(atom => {
      atom.component = -1
    })
  }

  /**
   * @param aid { Array<number>|number }
   * @param adjacentComponents { Pile }
   * @returns { Pile }
   */
  getConnectedComponent(aid, adjacentComponents) {
    const list = Array.isArray(aid) ? Array.from(aid) : [aid]
    const ids = new Pile()

    while (list.length > 0) {
      const aid = list.pop()
      ids.add(aid)
      const atom = this.atoms.get(aid)

      if (atom.component >= 0) adjacentComponents.add(atom.component)

      atom.a.neighbors.forEach(neighbor => {
        const neiId = this.molecule.halfBonds.get(neighbor).end
        if (!ids.has(neiId)) list.push(neiId)
      })
    }

    return ids
  }

  /**
   * @param idSet { Pile<number> }
   * @returns { number }
   */
  addConnectedComponent(idSet) {
    const compId = this.connectedComponents.add(idSet)
    const adjacentComponents = new Pile()
    const aidSet = this.getConnectedComponent(
      Array.from(idSet),
      adjacentComponents
    )

    adjacentComponents.delete(compId)

    let type = -1
    aidSet.forEach(aid => {
      const atom = this.atoms.get(aid)
      atom.component = compId
      if (atom.a.rxnFragmentType !== -1) type = atom.a.rxnFragmentType
    })

    this.ccFragmentType.set(compId, type)
    return compId
  }

  /**
   * @param ccid { number }
   * @returns { number }
   */
  removeConnectedComponent(ccid) {
    this.connectedComponents.get(ccid).forEach(aid => {
      this.atoms.get(aid).component = -1
    })

    return this.connectedComponents.delete(ccid)
  }

  assignConnectedComponents() {
    this.atoms.forEach((atom, aid) => {
      if (atom.component >= 0) return

      const adjacentComponents = new Pile()
      const idSet = this.getConnectedComponent(aid, adjacentComponents)
      adjacentComponents.forEach(ccid => {
        this.removeConnectedComponent(ccid)
      })

      this.addConnectedComponent(idSet)
    })
  }

  initLayers() {
    for (const group in LAYER_MAP) {
      this.layers[LAYER_MAP[group]] = this.render.paper
        .rect(0, 0, 10, 10)
        .attr({
          class: group + 'Layer',
          fill: '#000',
          opacity: '0.0'
        })
        .toFront()
    }
  }

  addReObjectPath(group, visel, path, pos, visible) {
    // eslint-disable-line max-params
    if (!path || !this.layers[LAYER_MAP[group]].node.parentNode) return

    const paths = Array.isArray(path) ? path : [path]

    paths.forEach(path => {
      const offset = this.render.options.offset
      let bb = visible ? Box2Abs.fromRelBox(util.relBox(path.getBBox())) : null
      const ext = pos && bb ? bb.translate(pos.negated()) : null
      if (offset !== null) {
        path.translateAbs(offset.x, offset.y)
        bb = bb ? bb.translate(offset) : null
      }
      visel.add(path, bb, ext)
      path.insertBefore(this.layers[LAYER_MAP[group]])
    })
  }

  clearMarks() {
    Object.keys(ReStruct.maps).forEach(map => {
      this[map + 'Changed'] = new Map()
    })

    this.structChanged = false
  }

  markItemRemoved() {
    this.structChanged = true
  }

  markBond(bid, mark) {
    this.markItem('bonds', bid, mark)
  }

  markAtom(aid, mark) {
    this.markItem('atoms', aid, mark)
  }

  markItem(map, id, mark) {
    const mapChanged = this[map + 'Changed']

    const value = mapChanged.has(id) ? Math.max(mark, mapChanged.get(id)) : mark

    mapChanged.set(id, value)

    // console.log("??????????", map + 'Changed', mapChanged);

    if (this[map].has(id)) this.clearVisel(this[map].get(id).visel)
  }

  clearVisel(visel) {
    visel.paths.forEach(path => {
      path.remove()
    })
    visel.clear()
  }

  eachItem(func) {
    Object.keys(ReStruct.maps).forEach(map => {
      this[map].forEach(func)
    })
  }

  getVBoxObj(selection) {
    selection = selection || {}

    if (isSelectionEmpty(selection)) {
      Object.keys(ReStruct.maps).forEach(map => {
        selection[map] = Array.from(this[map].keys())
      })
    }

    let vbox = null
    Object.keys(ReStruct.maps).forEach(map => {
      if (!selection[map]) return

      selection[map].forEach(id => {
        const box = this[map].get(id).getVBoxObj(this.render)
        if (box) vbox = vbox ? Box2Abs.union(vbox, box) : box.clone()
      })
    })

    vbox = vbox || new Box2Abs(0, 0, 0, 0)
    return vbox
  }

  translate(d) {
    this.eachItem(item => item.visel.translate(d))
  }

  scale(s) {
    // NOTE: bounding boxes are not valid after scaling
    this.eachItem(item => scaleVisel(item.visel, s))
  }

  clearVisels() {
    this.eachItem(item => this.clearVisel(item.visel))
  }

  update(force) {
    // eslint-disable-line max-statements
    force = force || !this.initialized

    // check items to update
    Object.keys(ReStruct.maps).forEach(map => {
      const mapChanged = this[map + 'Changed']
      // console.log(map + 'Changed', mapChanged);
      if (force) {
        this[map].forEach((item, id) => mapChanged.set(id, 1))
      } else {
        // check if some of the items marked are already gone
        mapChanged.forEach((value, id) => {
          if (!this[map].has(id)) mapChanged.delete(id)
        })
      }
    })

    this.atomsChanged.forEach((value, aid) =>
      this.connectedComponentRemoveAtom(aid)
    )

    // clean up empty fragments
    // TODO: fragment removal should be triggered by the action responsible for the fragment contents removal and form an operation of its own
    const emptyFrags = this.frags.filter(
      (fid, frag) => !frag.calcBBox(this.render.ctab, fid, this.render)
    )

    emptyFrags.forEach((frag, fid) => {
      this.clearVisel(frag.visel)
      this.frags.delete(fid)
      this.molecule.frags.delete(fid)
    })

    Object.keys(ReStruct.maps).forEach(map => {
      const mapChanged = this[map + 'Changed']

      mapChanged.forEach((value, id) => {
        this.clearVisel(this[map].get(id).visel)
        this.structChanged |= mapChanged.get(id) > 0
      })
    })

    // TODO: when to update sgroup?
    this.sgroups.forEach(sgroup => {
      this.clearVisel(sgroup.visel)
      sgroup.highlighting = null
      sgroup.selectionPlate = null
    })

    // TODO [RB] need to implement update-on-demand for fragments and r-groups
    this.frags.forEach(frag => {
      this.clearVisel(frag.visel)
    })

    this.rgroups.forEach(rgroup => {
      this.clearVisel(rgroup.visel)
    })

    if (force) {
      // clear and recreate all half-bonds
      this.clearConnectedComponents()
      this.molecule.initHalfBonds()
      this.molecule.initNeighbors()
    }

    // only update half-bonds adjacent to atoms that have moved
    const atomsChangedArray = Array.from(this.atomsChanged.keys())
    this.molecule.updateHalfBonds(atomsChangedArray)
    this.molecule.sortNeighbors(atomsChangedArray)

    this.assignConnectedComponents()
    this.initialized = true

    this.verifyLoops()
    const updLoops = force || this.structChanged
    if (updLoops) this.updateLoops()
    this.setImplicitHydrogen()
    this.showLabels()
    this.showBonds()
    if (updLoops) this.showLoops()
    this.showReactionSymbols()
    this.showSGroups()

    this.showFragments()
    this.showRGroups()
    this.showEnhancedFlags()
    this.showSimpleObjects()
    this.clearMarks()

    return true
  }

  updateLoops() {
    this.reloops.forEach(reloop => {
      this.clearVisel(reloop.visel)
    })
    const ret = this.molecule.findLoops()
    ret.bondsToMark.forEach(bid => {
      this.markBond(bid, 1)
    })
    ret.newLoops.forEach(loopId => {
      this.reloops.set(loopId, new ReLoop(this.molecule.loops.get(loopId)))
    })
  }

  showLoops() {
    const options = this.render.options
    this.reloops.forEach((reloop, rlid) => {
      reloop.show(this, rlid, options)
    })
  }

  showSimpleObjects() {
    const options = this.render.options

    this.simpleObjectsChanged.forEach((value, id) => {
      const simpleObject = this.simpleObjects.get(id)
      simpleObject.show(this, options)
    })
  }

  showReactionSymbols() {
    const options = this.render.options

    this.rxnArrowsChanged.forEach((value, id) => {
      const arrow = this.rxnArrows.get(id)
      arrow.show(this, id, options)
    })

    this.rxnPlusesChanged.forEach((value, id) => {
      const plus = this.rxnPluses.get(id)
      plus.show(this, id, options)
    })
  }

  showSGroups() {
    const options = this.render.options

    this.molecule.sGroupForest
      .getSGroupsBFS()
      .reverse()
      .forEach(id => {
        const resgroup = this.sgroups.get(id)
        resgroup.show(this, id, options)
      })
  }

  showFragments() {
    this.frags.forEach((frag, id) => {
      const path = frag.draw(this.render, id)
      if (path) this.addReObjectPath('data', frag.visel, path, null, true)
      // TODO fragment selection & highlighting
    })
  }

  showRGroups() {
    const options = this.render.options
    this.rgroups.forEach((rgroup, id) => {
      rgroup.show(this, id, options)
    })
  }

  setImplicitHydrogen() {
    // calculate implicit hydrogens for atoms that have been modified
    this.molecule.setImplicitHydrogen(Array.from(this.atomsChanged.keys()))
  }

  loopRemove(loopId) {
    if (!this.reloops.has(loopId)) return

    const reloop = this.reloops.get(loopId)
    this.clearVisel(reloop.visel)

    const bondlist = []

    reloop.loop.hbs.forEach(hbid => {
      if (!this.molecule.halfBonds.has(hbid)) return

      const hb = this.molecule.halfBonds.get(hbid)
      hb.loop = -1
      this.markBond(hb.bid, 1)
      this.markAtom(hb.begin, 1)
      bondlist.push(hb.bid)
    })

    this.reloops.delete(loopId)
    this.molecule.loops.delete(loopId)
  }

  verifyLoops() {
    this.reloops.forEach((reloop, rlid) => {
      if (!reloop.isValid(this.molecule, rlid)) this.loopRemove(rlid)
    })
  }

  showLabels() {
    // eslint-disable-line max-statements
    const options = this.render.options

    this.atomsChanged.forEach((value, aid) => {
      const atom = this.atoms.get(aid)
      atom.show(this, aid, options)
    })
  }

  showEnhancedFlags() {
    const options = this.render.options

    // console.log("!!", this.enhancedFlagsChanged);

    this.enhancedFlagsChanged.forEach((value, chid) => {
      const flag = this.enhancedFlags.get(chid)
      flag.show(this, chid, options)
    })
  }

  showBonds() {
    // eslint-disable-line max-statements
    const options = this.render.options

    this.bondsChanged.forEach((value, bid) => {
      const bond = this.bonds.get(bid)
      bond.show(this, bid, options)
    })
  }

  setSelection(selection) {
    const redraw = arguments.length === 0 // render.update only

    Object.keys(ReStruct.maps).forEach(map => {
      if (ReStruct.maps[map].isSelectable()) {
        this[map].forEach((item, id) => {
          const selected = redraw
            ? item.selected
            : selection && selection[map] && selection[map].indexOf(id) > -1

          this.showItemSelection(item, selected)
        })
      }
    })
  }
  showItemSelection(item, selected) {
    var exists = isSelectionSvgObjectExists(item)
    // TODO: simplify me, who sets `removed`?
    item.selected = selected
    if (item instanceof ReDataSGroupData) item.sgroup.selected = selected
    if (selected) {
      if (!exists) {
        var render = this.render
        var options = render.options
        var paper = render.paper

        item.selectionPlate = item.makeSelectionPlate(this, paper, options)
        this.addReObjectPath('selectionPlate', item.visel, item.selectionPlate)
      }
      if (item.selectionPlate) item.selectionPlate.show() // TODO [RB] review
    } else if (exists && item.selectionPlate) {
      item.selectionPlate.hide() // TODO [RB] review
    }
  }
}

function isSelectionEmpty(selection) {
  if (!selection) return true

  const anySelection = Object.keys(ReStruct.maps).some(
    map => selection[map] && selection[map].length > 0
  )

  return !anySelection
}

function scaleRPath(path, s) {
  if (path.type == 'set') {
    // TODO: rework scaling
    for (var i = 0; i < path.length; ++i) scaleRPath(path[i], s)
  } else {
    if (!(typeof path.attrs === 'undefined')) {
      if ('font-size' in path.attrs)
        path.attr('font-size', path.attrs['font-size'] * s)
      else if ('stroke-width' in path.attrs)
        path.attr('stroke-width', path.attrs['stroke-width'] * s)
    }
    path.scale(s, s, 0, 0)
  }
}

function scaleVisel(visel, s) {
  for (let i = 0; i < visel.paths.length; ++i) scaleRPath(visel.paths[i], s)
}

/**
 * SelectionPlate could be an item then value would be in it
 * or it could be a set of items then removed value need to be check on at least one of items in set
 * @param item
 * @returns {boolean}
 */
function isSelectionSvgObjectExists(item) {
  return (
    item.selectionPlate !== null &&
    ((!item.selectionPlate.items && !item.selectionPlate.removed) ||
      (Array.isArray(item.selectionPlate.items) &&
        !item.selectionPlate[0].removed))
  )
}

ReStruct.maps = {
  atoms: ReAtom,
  bonds: ReBond,
  rxnPluses: ReRxnPlus,
  rxnArrows: ReRxnArrow,
  frags: ReFrag,
  rgroups: ReRGroup,
  sgroupData: ReDataSGroupData,
  enhancedFlags: ReEnhancedFlag,
  sgroups: ReSGroup,
  reloops: ReLoop,
  simpleObjects: ReSimpleObject
}

export default ReStruct
export {
  ReAtom,
  ReBond,
  ReRxnPlus,
  ReRxnArrow,
  ReFrag,
  ReRGroup,
  ReEnhancedFlag,
  ReSGroup,
  ReSimpleObject
}
