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
  SGroup,
  fromAtomsAttrs,
  fromBondsAttrs,
  fromItemsFuse,
  fromMultipleMove,
  fromTextDeletion,
  fromTextUpdating,
  getHoverToFuse,
  getItemsToFuse,
  FunctionalGroup,
  fromSimpleObjectResizing,
  fromArrowResizing,
  ReStruct,
  ReSGroup,
  Vec2
} from 'ketcher-core'

import LassoHelper from './helper/lasso'
import { atomLongtapEvent } from './atom'
import SGroupTool from './sgroup'
import utils from '../shared/utils'
import { xor } from 'lodash/fp'
import { Editor } from '../Editor'
import { isCloseToEdgeOfCanvas } from '../utils/canvasExtension'

let extendCanvasTimeout: ReturnType<typeof setTimeout> | null = null

class SelectTool {
  #mode: string
  #lassoHelper: LassoHelper
  editor: Editor
  dragCtx: any

  constructor(editor, mode) {
    this.editor = editor
    this.#mode = mode
    this.#lassoHelper = new LassoHelper(
      this.#mode === 'lasso' ? 0 : 1,
      editor,
      this.#mode === 'fragment'
    )
  }

  isSelectionRunning() {
    return this.#lassoHelper.running()
  }

  mousedown(event) {
    const rnd = this.editor.render
    const ctab = rnd.ctab
    const molecule = ctab.molecule
    const functionalGroups = molecule.functionalGroups
    const selectedSgroups: any[] = []
    const newSelected = { atoms: [] as any[], bonds: [] as any[] }
    let actualSgroupId

    this.editor.hover(null) // TODO review hovering for touch devicess

    const selectFragment = this.#lassoHelper.fragment || event.ctrlKey
    const ci = this.editor.findItem(
      event,
      selectFragment
        ? [
            'frags',
            'sgroups',
            'functionalGroups',
            'sgroupData',
            'rgroups',
            'rxnArrows',
            'rxnPluses',
            'enhancedFlags',
            'simpleObjects',
            'texts'
          ]
        : [
            'atoms',
            'bonds',
            'sgroups',
            'functionalGroups',
            'sgroupData',
            'rgroups',
            'rxnArrows',
            'rxnPluses',
            'enhancedFlags',
            'simpleObjects',
            'texts'
          ],
      null
    )

    if (ci && ci.map === 'atoms' && functionalGroups.size) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id
      )
      const atomFromStruct = atomId !== null && ctab.atoms.get(ci.id)?.a

      if (atomFromStruct) {
        for (const sgId of atomFromStruct.sgs.values()) {
          actualSgroupId = sgId
        }
      }
      if (
        atomFromStruct &&
        actualSgroupId !== undefined &&
        !selectedSgroups.includes(actualSgroupId)
      )
        selectedSgroups.push(actualSgroupId)
    }
    if (ci && ci.map === 'bonds' && functionalGroups.size) {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id
      )
      const sGroupId = FunctionalGroup.findFunctionalGroupByBond(
        molecule,
        functionalGroups,
        bondId
      )
      if (sGroupId !== null && !selectedSgroups.includes(sGroupId))
        selectedSgroups.push(sGroupId)
    }

    if (selectedSgroups.length) {
      for (const sgId of selectedSgroups) {
        const sgroup = ctab.sgroups.get(sgId)
        if (sgroup) {
          const sgroupAtoms = SGroup.getAtoms(molecule, sgroup.item)
          const sgroupBonds = SGroup.getBonds(molecule, sgroup.item)
          newSelected.atoms.push(...sgroupAtoms) &&
            newSelected.bonds.push(...sgroupBonds)
        }
      }
      this.editor.selection(newSelected)
    }

    this.dragCtx = {
      item: ci,
      xy0: rnd.page2obj(event)
    }

    if (!ci || ci.map === 'atoms') {
      atomLongtapEvent(this, rnd)
    }

    if (!ci) {
      //  ci.type == 'Canvas'
      if (!event.shiftKey) this.editor.selection(null)
      delete this.dragCtx.item
      if (!this.#lassoHelper.fragment) this.#lassoHelper.begin(event)
      return true
    }

    let sel = closestToSel(ci)
    const sgroups = ctab.sgroups.get(ci.id)
    const selection = this.editor.selection()
    if (ci.map === 'frags') {
      const frag = ctab.frags.get(ci.id)
      sel = {
        atoms: frag.fragGetAtoms(ctab, ci.id),
        bonds: frag.fragGetBonds(ctab, ci.id)
      }
    } else if (
      (ci.map === 'sgroups' || ci.map === 'functionalGroups') &&
      sgroups
    ) {
      const sgroup = sgroups.item
      sel = {
        atoms: SGroup.getAtoms(molecule, sgroup),
        bonds: SGroup.getBonds(molecule, sgroup)
      }
    } else if (ci.map === 'rgroups') {
      const rgroup = ctab.rgroups.get(ci.id)
      sel = {
        atoms: rgroup.getAtoms(rnd),
        bonds: rgroup.getBonds(rnd)
      }
    } else if (ci.map === 'sgroupData') {
      if (isSelected(selection, ci)) return true
    }

    if (event.shiftKey) {
      this.editor.selection(selMerge(sel, selection, true))
    } else {
      this.editor.selection(null)
      this.editor.selection(isSelected(selection, ci) ? selection : sel)
    }
    return true
  }

  mousemove(event) {
    const editor = this.editor
    const rnd = editor.render
    const restruct = editor.render.ctab
    const dragCtx = this.dragCtx
    if (dragCtx && dragCtx.stopTapping) dragCtx.stopTapping()
    if (dragCtx?.item) {
      const atoms = restruct.molecule.atoms
      const selection = editor.selection()
      const shouldDisplayDegree =
        dragCtx.item.map === 'atoms' &&
        atoms?.get(dragCtx.item.id)?.neighbors.length === 1 &&
        selection?.atoms?.length === 1 &&
        !selection.bonds
      if (shouldDisplayDegree) {
        // moving selected objects
        const pos = rnd.page2obj(event)
        const angle = utils.calcAngle(dragCtx.xy0, pos)
        const degrees = utils.degrees(angle)
        this.editor.event.message.dispatch({ info: degrees + 'º' })
      }
      if (dragCtx.item.map === 'simpleObjects' && dragCtx.item.ref) {
        if (dragCtx?.action) dragCtx.action.perform(rnd.ctab)
        const current = rnd.page2obj(event)
        const diff = current.sub(this.dragCtx.xy0)
        dragCtx.action = fromSimpleObjectResizing(
          rnd.ctab,
          dragCtx.item.id,
          diff,
          current,
          dragCtx.item.ref,
          event.shiftKey
        )
        editor.update(dragCtx.action, true)
        return true
      }
      if (dragCtx.item.map === 'rxnArrows' && dragCtx.item.ref) {
        if (dragCtx?.action) dragCtx.action.perform(rnd.ctab)
        const current = rnd.page2obj(event)
        const diff = current.sub(dragCtx.xy0)
        dragCtx.previous = current
        dragCtx.action = fromArrowResizing(
          rnd.ctab,
          dragCtx.item.id,
          diff,
          current,
          dragCtx.item.ref
        )
        editor.update(dragCtx.action, true)
        return true
      }
      if (dragCtx.action) {
        dragCtx.action.perform(restruct)
        // redraw the elements in unshifted position, lest the have different offset
        // editor.update(dragCtx.action, true)
      }

      const expSel = editor.explicitSelected()
      dragCtx.action = fromMultipleMove(
        restruct,
        expSel,
        editor.render.page2obj(event).sub(dragCtx.xy0)
      )

      dragCtx.mergeItems = getItemsToFuse(editor, expSel)
      editor.hover(getHoverToFuse(dragCtx.mergeItems))

      extendCanvas(rnd, event, selection)
      editor.update(dragCtx.action, true)
      return true
    }

    if (this.#lassoHelper.running()) {
      const sel = this.#lassoHelper.addPoint(event)
      editor.selection(
        !event.shiftKey ? sel : selMerge(sel, editor.selection(), false)
      )
      return true
    }

    const maps =
      this.#lassoHelper.fragment || event.ctrlKey
        ? [
            'frags',
            'sgroups',
            'functionalGroups',
            'sgroupData',
            'rgroups',
            'rxnArrows',
            'rxnPluses',
            'enhancedFlags',
            'simpleObjects',
            'texts'
          ]
        : [
            'atoms',
            'bonds',
            'sgroups',
            'functionalGroups',
            'sgroupData',
            'rgroups',
            'rxnArrows',
            'rxnPluses',
            'enhancedFlags',
            'simpleObjects',
            'texts'
          ]

    editor.hover(editor.findItem(event, maps, null), null, event)

    return true
  }

  mouseup(event) {
    const editor = this.editor
    const selected = editor.selection()
    const struct = editor.render.ctab
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const selectedSgroups: any[] = []
    const newSelected = { atoms: [] as any[], bonds: [] as any[] }
    clearTimeout(extendCanvasTimeout as ReturnType<typeof setTimeout>)
    let actualSgroupId

    if (selected && functionalGroups.size && selected.atoms) {
      for (const atom of selected.atoms) {
        const atomId = FunctionalGroup.atomsInFunctionalGroup(
          functionalGroups,
          atom
        )
        const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a

        if (atomFromStruct) {
          for (const sgId of atomFromStruct.sgs.values()) {
            actualSgroupId = sgId
          }
        }
        if (
          atomFromStruct &&
          actualSgroupId !== undefined &&
          !selectedSgroups.includes(actualSgroupId)
        )
          selectedSgroups.push(actualSgroupId)
      }
    }

    if (selected && functionalGroups.size && selected.bonds) {
      for (const atom of selected.bonds) {
        const bondId = FunctionalGroup.bondsInFunctionalGroup(
          molecule,
          functionalGroups,
          atom
        )
        const sGroupId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          functionalGroups,
          bondId
        )
        if (sGroupId !== null && !selectedSgroups.includes(sGroupId))
          selectedSgroups.push(sGroupId)
      }
    }

    if (selectedSgroups.length) {
      for (const sgId of selectedSgroups) {
        const sgroup = struct.sgroups.get(sgId)
        if (sgroup) {
          const sgroupAtoms = SGroup.getAtoms(molecule, sgroup.item)
          const sgroupBonds = SGroup.getBonds(molecule, sgroup.item)
          newSelected.atoms.push(...sgroupAtoms) &&
            newSelected.bonds.push(...sgroupBonds)
        }
      }
    }

    const dragCtx = this.dragCtx

    if (dragCtx && dragCtx.stopTapping) dragCtx.stopTapping()

    const possibleSaltOrSolvent = struct.sgroups.get(actualSgroupId)
    const isDraggingSaltOrSolventOnStructure = SGroup.isSaltOrSolvent(
      possibleSaltOrSolvent?.item.data.name
    )
    if (
      (isDraggingSaltOrSolventOnStructure ||
        this.isDraggingStructureOnSaltOrSolvent(dragCtx, struct.sgroups)) &&
      dragCtx
    ) {
      preventSaltAndSolventsMerge(struct, dragCtx, editor)
      delete this.dragCtx
      if (this.#lassoHelper.running()) {
        this.selectElementsOnCanvas(newSelected, editor, event)
      }
      return true
    }

    if (dragCtx && dragCtx.item) {
      dragCtx.action = dragCtx.action
        ? fromItemsFuse(struct, dragCtx.mergeItems).mergeWith(dragCtx.action)
        : fromItemsFuse(struct, dragCtx.mergeItems)

      editor.hover(null)
      if (dragCtx.mergeItems) editor.selection(null)
      if (dragCtx.action.operations.length !== 0) editor.update(dragCtx.action)

      delete this.dragCtx
    } else if (this.#lassoHelper.running()) {
      // TODO it catches more events than needed, to be re-factored
      this.selectElementsOnCanvas(newSelected, editor, event)
    } else if (this.#lassoHelper.fragment) {
      if (
        !event.shiftKey &&
        this.editor.render.clientArea.contains(event.target)
      )
        editor.selection(null)
    }
    editor.event.message.dispatch({
      info: false
    })
    return true
  }

  dblclick(event) {
    const editor = this.editor
    const struct = editor.render.ctab
    const { molecule, sgroups } = struct
    const functionalGroups = molecule.functionalGroups
    const rnd = editor.render
    const ci = editor.findItem(
      event,
      ['atoms', 'bonds', 'sgroups', 'functionalGroups', 'sgroupData', 'texts'],
      null
    )

    const atomResult: any[] = []
    const bondResult: any[] = []
    const result: any[] = []
    if (ci && functionalGroups && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id
      )
      const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a
      if (
        atomId !== null &&
        !FunctionalGroup.isAtomInContractedFunctionalGroup(
          // TODO: examine if this code is really needed, seems like its a hack
          atomFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      )
        atomResult.push(atomId)
    }
    if (ci && functionalGroups && ci.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id
      )
      const bondFromStruct = bondId !== null && struct.bonds.get(bondId)?.b
      if (
        bondId !== null &&
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          // TODO: examine if this code is really needed, seems like its a hack
          bondFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      )
        bondResult.push(bondId)
    }
    if (atomResult.length > 0) {
      for (const id of atomResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id
        )
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId)
        }
      }
      editor.event.removeFG.dispatch({ fgIds: result })
      return
    } else if (bondResult.length > 0) {
      for (const id of bondResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          functionalGroups,
          id
        )
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId)
        }
      }
      this.editor.event.removeFG.dispatch({ fgIds: result })
      return
    }
    if (!ci) return true

    const selection = this.editor.selection()

    if (ci.map === 'atoms') {
      const action = new Action()
      const atom = molecule.atoms.get(ci.id)
      const ra = editor.event.elementEdit.dispatch(atom)
      if (selection?.atoms) {
        const selectionAtoms = selection.atoms
        Promise.resolve(ra)
          .then((newatom) => {
            // TODO: deep compare to not produce dummy, e.g.
            // atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)
            selectionAtoms.forEach((aid) => {
              action.mergeWith(fromAtomsAttrs(struct, aid, newatom, false))
            })
            editor.update(action)
          })
          .catch(() => null)
      }
    } else if (ci.map === 'bonds') {
      const bond = rnd.ctab.bonds.get(ci.id)?.b
      const rb = editor.event.bondEdit.dispatch(bond)

      if (selection?.bonds) {
        const action = new Action()
        const bondsSelection = selection.bonds
        Promise.resolve(rb)
          .then((newbond) => {
            bondsSelection.forEach((bid) => {
              action.mergeWith(fromBondsAttrs(struct, bid, newbond))
            })
            editor.update(action)
          })
          .catch(() => null) // w/o changes
      }
    } else if (
      (ci.map === 'sgroups' &&
        !FunctionalGroup.isFunctionalGroup(molecule.sgroups.get(ci.id))) ||
      ci.map === 'sgroupData'
    ) {
      editor.selection(closestToSel(ci))
      SGroupTool.sgroupDialog(editor, ci.id, null)
    } else if (ci.map === 'texts') {
      editor.selection(closestToSel(ci))
      const text = molecule.texts.get(ci.id)
      const dialog = editor.event.elementEdit.dispatch({
        ...text,
        type: 'text'
      })

      dialog
        .then(({ content }) => {
          if (!content) {
            editor.update(fromTextDeletion(struct, ci.id))
          } else if (content !== text?.content) {
            editor.update(fromTextUpdating(struct, ci.id, content))
          }
        })
        .catch(() => null)
    }
    return true
  }

  mouseleave(_) {
    if (this.dragCtx && this.dragCtx.stopTapping) this.dragCtx.stopTapping()

    if (this.dragCtx && this.dragCtx.action) {
      const action = this.dragCtx.action
      this.editor.update(action)
    }
    if (this.#lassoHelper.running())
      this.editor.selection(this.#lassoHelper.end())

    delete this.dragCtx

    this.editor.hover(null)
  }

  selectElementsOnCanvas(
    elements: { atoms: number[]; bonds: number[] },
    editor: Editor,
    event
  ) {
    const sel =
      elements.atoms.length > 0
        ? selMerge(this.#lassoHelper.end(), elements, false)
        : this.#lassoHelper.end()
    editor.selection(
      !event.shiftKey ? sel : selMerge(sel, editor.selection(), false)
    )
  }

  isDraggingStructureOnSaltOrSolvent(dragCtx, sgroups: Map<number, ReSGroup>) {
    let isDraggingOnSaltOrSolventAtom
    let isDraggingOnSaltOrSolventBond
    if (dragCtx?.mergeItems) {
      const mergeAtoms = Array.from(dragCtx.mergeItems.atoms.values())
      const mergeBonds = Array.from(dragCtx.mergeItems.bonds.values())
      const sgroupsOnCanvas = Array.from(sgroups.values()).map(
        ({ item }) => item
      )
      isDraggingOnSaltOrSolventAtom = mergeAtoms.some((atomId) =>
        SGroup.isAtomInSaltOrSolvent(atomId as number, sgroupsOnCanvas)
      )
      isDraggingOnSaltOrSolventBond = mergeBonds.some((bondId) =>
        SGroup.isBondInSaltOrSolvent(bondId as number, sgroupsOnCanvas)
      )
    }
    return isDraggingOnSaltOrSolventAtom || isDraggingOnSaltOrSolventBond
  }
}

function extendCanvas(render, event, _) {
  const offset = 150
  // const speedCoefficient = 2
  const { layerX, layerY } = event
  // const isCloseToTopEdgeOfScreen = null
  const {
    isCloseToLeftEdgeOfCanvas,
    isCloseToTopEdgeOfCanvas,
    isCloseToRightEdgeOfCanvas,
    isCloseToBottomEdgeOfCanvas
  } = isCloseToEdgeOfCanvas(event, render.sz)
  console.log(event)
  // const shiftAndExtendCanvasByVector = (vector: Vec2) => {
  //   // const newCanvasSize = new Vec2(
  //   //   render.sz.x + Math.abs(vector.x),
  //   //   render.sz.y + Math.abs(vector.y),
  //   //   0
  //   // )
  //   // const delta = new Vec2(
  //   //   vector.x / speedCoefficient,
  //   //   vector.y / speedCoefficient,
  //   //   0
  //   // )
  //   render.setScrollOffset(render.options.offset.add(vector))
  //   // render.setOffset(render.options.offset.add(delta))
  //   // render.ctab.translate(delta)
  // }
  const calculateCanvasExtension = (
    clientArea,
    currentCanvasSize,
    extensionVector
  ) => {
    const newHorizontalScrollPosition =
      clientArea.scrollLeft + extensionVector.x
    const newVerticalScrollPosition = clientArea.scrollTop + extensionVector.y
    let horizontalExtension = 0
    let verticalExtension = 0
    if (newHorizontalScrollPosition > currentCanvasSize.x) {
      horizontalExtension = newHorizontalScrollPosition - currentCanvasSize.x
    }
    if (newHorizontalScrollPosition < 0) {
      horizontalExtension = Math.abs(newHorizontalScrollPosition)
    }
    if (newVerticalScrollPosition > currentCanvasSize.y) {
      verticalExtension = newVerticalScrollPosition - currentCanvasSize.y
    }
    if (newVerticalScrollPosition < 0) {
      verticalExtension = Math.abs(newVerticalScrollPosition)
    }
    return new Vec2(horizontalExtension, verticalExtension, 0)
  }
  const shiftAndExtendCanvasByVector = (vector: Vec2) => {
    const clientArea = render.clientArea
    const extensionVector = calculateCanvasExtension(
      clientArea,
      render.sz.scaled(render.options.zoom),
      vector
    ).scaled(1 / render.options.zoom)
    console.log(extensionVector)
    if (extensionVector.x > 0 || extensionVector.y > 0) {
      render.setPaperSize(render.sz.add(extensionVector))
      render.setOffset(render.options.offset.add(vector))
      render.ctab.translate(vector)
    }

    clientArea.scrollLeft += vector.x * render.options.scale
    clientArea.scrollTop += vector.y * render.options.scale

    render.update(false)
  }

  if (isCloseToLeftEdgeOfCanvas) {
    // console.log('cursor is close to left corner')
    render.setScrollOffset(render.options.offset.add(new Vec2(-offset, 0, 0)))
    // shiftAndExtendCanvasByVector(new Vec2(offset, 0, 0))
  }

  if (isCloseToTopEdgeOfCanvas) {
    // console.log('cursor is close to top corner')
    render.setScrollOffset(render.options.offset.add(new Vec2(0, offset, 0)))
    // shiftAndExtendCanvasByVector(new Vec2(0, offset, 0))
  }

  if (isCloseToRightEdgeOfCanvas) {
    // console.log('cursor is close to right corner')
    shiftAndExtendCanvasByVector(new Vec2(offset, 0, 0))
  }

  if (isCloseToBottomEdgeOfCanvas) {
    // console.log('cursor is close to bottom corner')
    shiftAndExtendCanvasByVector(new Vec2(0, offset, 0))
  }
  clearTimeout(extendCanvasTimeout as ReturnType<typeof setTimeout>)
  extendCanvasTimeout = setTimeout(() => extendCanvas(render, event, _), 0)
}

function closestToSel(ci) {
  const res = {}
  res[ci.map] = [ci.id]
  return res
}

// TODO: deep-merge?
export function selMerge(selection, add, reversible: boolean) {
  if (add) {
    Object.keys(add).forEach((item) => {
      if (!selection[item]) selection[item] = add[item].slice()
      else selection[item] = uniqArray(selection[item], add[item], reversible)
    })
  }
  return selection
}

function isSelected(selection, item) {
  return (
    selection && selection[item.map] && selection[item.map].includes(item.id)
  )
}

function uniqArray(dest, add, reversible: boolean) {
  return add.reduce((_, item) => {
    if (reversible) dest = xor(dest, [item])
    else if (!dest.includes(item)) dest.push(item)
    return dest
  }, [])
}

function preventSaltAndSolventsMerge(
  struct: ReStruct,
  dragCtx,
  editor: Editor
) {
  const action = dragCtx.action
    ? fromItemsFuse(struct, null).mergeWith(dragCtx.action)
    : fromItemsFuse(struct, null)
  editor.hover(null)
  if (dragCtx.mergeItems) {
    editor.selection(null)
  }
  editor.update(action)
  editor.event.message.dispatch({
    info: false
  })
}

export default SelectTool
