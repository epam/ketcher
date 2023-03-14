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
  fromBondsAttrs,
  fromItemsFuse,
  fromMultipleMove,
  fromTextDeletion,
  fromTextUpdating,
  getHoverToFuse,
  FunctionalGroup,
  fromSimpleObjectResizing,
  fromArrowResizing,
  ReStruct,
  ReSGroup,
  Vec2,
  Atom
} from 'ketcher-core'

import LassoHelper from './helper/lasso'
import { atomLongtapEvent } from './atom'
import SGroupTool from './sgroup'
import utils from '../shared/utils'
import { xor } from 'lodash/fp'
import { Editor } from '../Editor'
import { dropAndMerge } from './helper/dropAndMerge'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'
import { getMergeItems } from './helper/getMergeItems'
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms'
import {
  isCloseToEdgeOfCanvas,
  isCloseToEdgeOfScreen,
  scrollByVector,
  shiftAndExtendCanvasByVector
} from '../utils/canvasExtension'

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

    this.editor.hover(null) // TODO review hovering for touch devicess

    const map = getMapsForClosestItem(
      this.#lassoHelper.fragment || event.ctrlKey
    )
    const ci = this.editor.findItem(event, map, null)

    const selected = {
      ...(ci?.map === 'atoms' && { atoms: [ci.id] }),
      ...(ci?.map === 'bonds' && { bonds: [ci.id] })
    }
    const selectedSgroups = ci
      ? getGroupIdsFromItemArrays(molecule, selected)
      : []
    const newSelected = getNewSelectedItems(this.editor, selectedSgroups)
    if (newSelected.atoms?.length || newSelected.bonds?.length) {
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
    if (dragCtx?.stopTapping) dragCtx.stopTapping()
    if (dragCtx?.item) {
      const atoms = restruct.molecule.atoms
      const selection = editor.selection()

      /* handle atoms */
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
        editor.event.message.dispatch({ info: degrees + 'º' })
      }
      /* end */

      /* handle simpleObjects */
      if (dragCtx.item.map === 'simpleObjects' && dragCtx.item.ref) {
        if (dragCtx.action) dragCtx.action.perform(rnd.ctab)
        const props = getResizingProps(editor, dragCtx, event)
        dragCtx.action = fromSimpleObjectResizing(...props, event.shiftKey)
        editor.update(dragCtx.action, true)
        return true
      }
      /* end + fullstop */

      /* handle rxnArrows */
      if (dragCtx.item.map === 'rxnArrows' && dragCtx.item.ref) {
        if (dragCtx?.action) dragCtx.action.perform(rnd.ctab)
        const props = getResizingProps(editor, dragCtx, event)
        dragCtx.action = fromArrowResizing(...props)
        editor.update(dragCtx.action, true)
        return true
      }
      /* end + fullstop */

      /* handle functionalGroups */
      if (dragCtx.item.map === 'functionalGroups' && !dragCtx.action) {
        editor.event.showInfo.dispatch(null)
      }
      /* end */

      if (dragCtx.action) {
        dragCtx.action.perform(restruct)
      }

      const expSel = editor.explicitSelected()
      dragCtx.action = fromMultipleMove(
        restruct,
        expSel,
        editor.render.page2obj(event).sub(dragCtx.xy0)
      )

      dragCtx.mergeItems = getMergeItems(editor, expSel)
      editor.hover(getHoverToFuse(dragCtx.mergeItems))

      extendCanvas(rnd, event)
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

    const maps = getMapsForClosestItem(
      this.#lassoHelper.fragment || event.ctrlKey
    )
    editor.hover(editor.findItem(event, maps, null), null, event)

    return true
  }

  mouseup(event) {
    const editor = this.editor
    const selected = editor.selection()
    const struct = editor.render.ctab
    const molecule = struct.molecule

    // add all items of all selectedSGroups to selection
    const selectedSgroups = selected
      ? getGroupIdsFromItemArrays(molecule, selected)
      : []
    const newSelected = getNewSelectedItems(editor, selectedSgroups)

    if (this.dragCtx?.stopTapping) this.dragCtx.stopTapping()

    /* ignore salts and solvents */
    const possibleSaltOrSolvent = struct.sgroups.get(
      selectedSgroups[selectedSgroups.length - 1]
    )
    const isDraggingSaltOrSolventOnStructure = SGroup.isSaltOrSolvent(
      possibleSaltOrSolvent?.item.data.name
    )
    if (
      this.dragCtx &&
      (isDraggingSaltOrSolventOnStructure ||
        this.isDraggingStructureOnSaltOrSolvent(this.dragCtx, struct.sgroups))
    ) {
      preventSaltAndSolventsMerge(struct, this.dragCtx, editor)
      delete this.dragCtx
    }
    /* end */

    if (this.dragCtx?.item) {
      dropAndMerge(editor, this.dragCtx.mergeItems, this.dragCtx.action)
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
        bondFromStruct &&
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          // TODO: examine if this code is really needed, seems like its a hack
          bondFromStruct,
          sgroups,
          functionalGroups
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
    if (!ci) return

    const selection = this.editor.selection()

    if (ci.map === 'atoms') {
      const atoms = getSelectedAtoms(selection, molecule)
      const changeAtomPromise = editor.event.elementEdit.dispatch(atoms)
      updateSelectedAtoms({
        atoms: selection?.atoms || [],
        editor,
        changeAtomPromise
      })
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
      SGroupTool.sgroupDialog(editor, ci.id)
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

function extendCanvas(render, event) {
  const offset = 1
  const {
    isCloseToLeftEdgeOfCanvas,
    isCloseToTopEdgeOfCanvas,
    isCloseToRightEdgeOfCanvas,
    isCloseToBottomEdgeOfCanvas
  } = isCloseToEdgeOfCanvas(event, render.sz)
  const {
    isCloseToLeftEdgeOfScreen,
    isCloseToTopEdgeOfScreen,
    isCloseToRightEdgeOfScreen,
    isCloseToBottomEdgeOfScreen
  } = isCloseToEdgeOfScreen(event)

  if (isCloseToLeftEdgeOfCanvas) {
    shiftAndExtendCanvasByVector(new Vec2(-offset, 0, 0), render)
  }

  if (isCloseToTopEdgeOfCanvas) {
    shiftAndExtendCanvasByVector(new Vec2(0, -offset, 0), render)
  }

  if (isCloseToRightEdgeOfCanvas) {
    shiftAndExtendCanvasByVector(new Vec2(offset, 0, 0), render)
  }

  if (isCloseToBottomEdgeOfCanvas) {
    shiftAndExtendCanvasByVector(new Vec2(0, offset, 0), render)
  }

  const isCloseToSomeEdgeOfCanvas = [
    isCloseToTopEdgeOfCanvas,
    isCloseToRightEdgeOfCanvas,
    isCloseToBottomEdgeOfCanvas,
    isCloseToLeftEdgeOfCanvas
  ].some((isCloseToEdge) => isCloseToEdge)

  if (isCloseToSomeEdgeOfCanvas) {
    return
  }

  if (isCloseToTopEdgeOfScreen) {
    scrollByVector(new Vec2(0, -offset), render)
  }

  if (isCloseToBottomEdgeOfScreen) {
    scrollByVector(new Vec2(0, offset), render)
  }

  if (isCloseToLeftEdgeOfScreen) {
    scrollByVector(new Vec2(-offset, 0), render)
  }

  if (isCloseToRightEdgeOfScreen) {
    scrollByVector(new Vec2(offset, 0), render)
  }
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

export function getSelectedAtoms(selection, molecule) {
  if (selection?.atoms) {
    return mapAtomIdsToAtoms(selection?.atoms, molecule)
  }
  return []
}

export function mapAtomIdsToAtoms(atomsIds: number[], molecule): Atom[] {
  return atomsIds.map((atomId) => {
    const atomOrReAtom = molecule.atoms.get(atomId)
    return atomOrReAtom.a || atomOrReAtom
  })
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

function getMapsForClosestItem(selectFragment: boolean) {
  return [
    'sgroups',
    'functionalGroups',
    'sgroupData',
    'rgroups',
    'rxnArrows',
    'rxnPluses',
    'enhancedFlags',
    'simpleObjects',
    'texts',
    ...(selectFragment ? ['frags'] : ['atoms', 'bonds'])
  ]
}

function getResizingProps(
  editor: Editor,
  dragCtx,
  event
): [ReStruct, number, Vec2, Vec2, any] {
  const current = editor.render.page2obj(event)
  const diff = current.sub(dragCtx.xy0)
  return [editor.render.ctab, dragCtx.item.id, diff, current, dragCtx.item.ref]
}

function getNewSelectedItems(
  editor: Editor,
  selectedSgroups: number[]
): { atoms: number[]; bonds: number[] } {
  const newSelected: Record<'atoms' | 'bonds', number[]> = {
    atoms: [],
    bonds: []
  }

  for (const sgId of selectedSgroups) {
    const sgroup = editor.render.ctab.sgroups.get(sgId)
    if (sgroup) {
      const sgroupAtoms = SGroup.getAtoms(editor.struct(), sgroup.item)
      const sgroupBonds = SGroup.getBonds(editor.struct(), sgroup.item)
      newSelected.atoms.push(...sgroupAtoms)
      newSelected.bonds.push(...sgroupBonds)
    }
  }

  return newSelected
}

export default SelectTool
