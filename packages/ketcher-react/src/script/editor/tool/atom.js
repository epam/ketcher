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

import {
  Action,
  Atom,
  Bond,
  fromAtomAddition,
  fromAtomsAttrs,
  fromBondAddition,
  fromFragmentDeletion,
  fromSgroupDeletion,
  FunctionalGroup,
  SGroup
} from 'ketcher-core'

import utils from '../shared/utils'

function AtomTool(editor, atomProps) {
  if (!(this instanceof AtomTool)) {
    if (!editor.selection() || !editor.selection().atoms)
      return new AtomTool(editor, atomProps)

    const action = fromAtomsAttrs(
      editor.render.ctab,
      editor.selection().atoms,
      atomProps,
      true
    )
    editor.update(action)
    editor.selection(null)
    return null
  }

  this.editor = editor
  this.atomProps = atomProps
  this.struct = editor.render.ctab
  this.bondProps = { type: 1, stereo: Bond.PATTERN.STEREO.NONE }
  this.sgroups = editor.render.ctab.sgroups
  this.molecule = editor.render.ctab.molecule
  this.functionalGroups = this.molecule.functionalGroups
}

AtomTool.prototype.mousedown = function (event) {
  this.editor.hover(null)
  this.editor.selection(null)
  const ci = this.editor.findItem(event, ['atoms', 'functionalGroups'])
  if (
    ci &&
    ci.map === 'functionalGroups' &&
    this.functionalGroups &&
    FunctionalGroup.isContractedFunctionalGroup(ci.id, this.functionalGroups)
  ) {
    const action = new Action()
    const selectedSgroup = this.sgroups.get(ci.id)
    const sGroupAtoms = SGroup.getAtoms(this.molecule, selectedSgroup.item)
    const [firstAtom, ...atoms] = sGroupAtoms
    const atomNeighbours = this.struct.molecule.atomGetNeighbors(firstAtom)
    const extraNeighbour = atomNeighbours.some(
      (atom) => !sGroupAtoms.includes(atom.aid)
    )
    if (extraNeighbour) {
      action.mergeWith(fromSgroupDeletion(this.struct, ci.id))
      action.mergeWith(fromFragmentDeletion(this.struct, { atoms: atoms }))
      action.mergeWith(
        fromAtomsAttrs(this.struct, firstAtom, this.atomProps, true)
      )
    } else {
      const firstAtomPp = this.struct.atoms.get(firstAtom).a.pp
      action.mergeWith(
        fromFragmentDeletion(this.struct, {
          atoms: SGroup.getAtoms(this.molecule, selectedSgroup.item),
          bonds: SGroup.getBonds(this.molecule, selectedSgroup.item)
        })
      )
      action.mergeWith(
        fromAtomAddition(this.struct, firstAtomPp, this.atomProps)
      )
    }
    this.editor.update(action)
  }
  const atomResult = []
  const result = []
  if (ci && this.functionalGroups.size && ci.map === 'atoms') {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      this.functionalGroups,
      ci.id
    )
    if (atomId !== null) atomResult.push(atomId)
  }
  if (atomResult.length > 0) {
    for (const id of atomResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        this.functionalGroups,
        id
      )
      if (fgId !== null && !result.includes(fgId)) {
        result.push(fgId)
      }
    }
    this.editor.event.removeFG.dispatch({ fgIds: result })
    return
  }
  if (!ci) {
    // ci.type == 'Canvas'
    this.dragCtx = {}
  } else if (ci.map === 'atoms') {
    this.dragCtx = { item: ci }
  }
}

AtomTool.prototype.mousemove = function (event) {
  const rnd = this.editor.render
  if (!this.dragCtx || !this.dragCtx.item) {
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'functionalGroups'])
    )
    return
  }

  const dragCtx = this.dragCtx
  const ci = this.editor.findItem(event, ['atoms'])

  if (ci && ci.map === 'atoms' && ci.id === dragCtx.item.id) {
    // fromAtomsAttrs
    this.editor.hover(this.editor.findItem(event, ['atoms']))
    return
  }

  // fromAtomAddition
  const atom = rnd.ctab.molecule.atoms.get(dragCtx.item.id)
  let angle = utils.calcAngle(atom.pp, rnd.page2obj(event))
  if (!event.ctrlKey) angle = utils.fracAngle(angle)
  const degrees = utils.degrees(angle)
  this.editor.event.message.dispatch({ info: degrees + 'º' })
  const newAtomPos = utils.calcNewAtomPos(
    atom.pp,
    rnd.page2obj(event),
    event.ctrlKey
  )
  if (dragCtx.action) dragCtx.action.perform(rnd.ctab)

  dragCtx.action = fromBondAddition(
    rnd.ctab,
    this.bondProps,
    dragCtx.item.id,
    Object.assign({}, this.atomProps),
    newAtomPos,
    newAtomPos
  )[0]
  this.editor.update(dragCtx.action, true)
}

AtomTool.prototype.mouseup = function (event) {
  const ci = this.editor.findItem(event, ['atoms', 'bonds'])
  const atomResult = []
  const result = []
  if (ci && this.functionalGroups && ci.map === 'atoms') {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      this.functionalGroups,
      ci.id
    )
    if (atomId !== null) atomResult.push(atomId)
  }
  if (atomResult.length > 0) {
    for (const id of atomResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        this.functionalGroups,
        id
      )
      if (fgId !== null && !result.includes(fgId)) {
        result.push(fgId)
      }
    }
    this.editor.event.removeFG.dispatch({ fgIds: result })
    return
  }

  if (this.dragCtx) {
    const dragCtx = this.dragCtx
    const rnd = this.editor.render

    this.editor.update(
      dragCtx.action ||
        (dragCtx.item
          ? fromAtomsAttrs(rnd.ctab, dragCtx.item.id, this.atomProps, true)
          : fromAtomAddition(rnd.ctab, rnd.page2obj(event), this.atomProps))
    )

    delete this.dragCtx
  }
  this.editor.event.message.dispatch({
    info: false
  })
}

export function atomLongtapEvent(tool, render) {
  const { dragCtx, editor } = tool
  const atomid = dragCtx.item?.id
  const fgs = render.ctab.molecule.functionalGroups
  // edit atom or add atom
  const atom =
    atomid !== undefined && atomid !== null
      ? render.ctab.molecule.atoms.get(atomid)
      : new Atom({ label: '' })
  const fgId = FunctionalGroup.findFunctionalGroupByAtom(fgs, atomid)
  // TODO: longtab event
  dragCtx.timeout = setTimeout(() => {
    delete tool.dragCtx
    if (fgId != null) {
      editor.event.removeFG.dispatch({ fgIds: [fgId] })
      return
    }
    editor.selection(null)
    const res = editor.event.quickEdit.dispatch(atom)
    Promise.resolve(res)
      .then((newatom) => {
        const action = atomid
          ? fromAtomsAttrs(render.ctab, atomid, newatom)
          : fromAtomAddition(render.ctab, dragCtx.xy0, newatom)
        editor.update(action)
      })
      .catch(() => null) // w/o changes
  }, 750)

  dragCtx.stopTapping = function () {
    if (dragCtx.timeout) {
      clearTimeout(dragCtx.timeout)
      delete dragCtx.timeout
    }
  }
}

export default AtomTool
