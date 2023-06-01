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
  FunctionalGroup,
  SGroup,
  fromAtomAddition,
  fromAtomsAttrs,
  fromBondAddition,
  fromFragmentDeletion,
  fromSgroupDeletion,
  ElementColor
} from 'ketcher-core'

import Editor from '../Editor'
import utils from '../shared/utils'
import { Tool } from './Tool'
import { deleteFunctionalGroups } from './helper/deleteFunctionalGroups'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'

class AtomTool implements Tool {
  private readonly editor: Editor
  private readonly atomProps: any
  private dragCtx: any
  readonly #bondProps: { stereo: number; type: number }
  isNotActiveTool: boolean | undefined

  constructor(editor, atomProps) {
    this.editor = editor
    this.atomProps = atomProps
    this.#bondProps = { type: 1, stereo: Bond.PATTERN.STEREO.NONE }

    const editorSelection = editor.selection()

    if (editorSelection) {
      if (editorSelection.atoms) {
        const struct = editor.render.ctab
        const action = new Action()
        const selectedSGroupsId =
          editorSelection &&
          getGroupIdsFromItemArrays(struct.molecule, editorSelection)
        const deletedAtomsInSGroups = deleteFunctionalGroups(
          selectedSGroupsId,
          struct,
          action
        )
        action.mergeWith(
          fromAtomsAttrs(
            struct,
            editorSelection?.atoms?.filter(
              (selectAtomId) => !deletedAtomsInSGroups?.includes(selectAtomId)
            ),
            atomProps,
            true
          )
        )
        editor.update(action)
        editor.selection(null)
        this.editor.hoverIcon.hide()
      }
      this.isNotActiveTool = true
    } else {
      this.editor.hoverIcon.show()
      this.editor.hoverIcon.label = atomProps.label
      this.editor.hoverIcon.fill = ElementColor[atomProps.label] ?? '#000000'
      this.editor.hoverIcon.updatePosition()
    }
  }

  mousedown(event) {
    const {
      editor,
      editor: {
        render: {
          ctab: {
            molecule,
            molecule: { functionalGroups }
          }
        }
      }
    } = this

    editor.hover(null)
    editor.selection(null)

    const eventMaps = ['atoms', 'functionalGroups']
    const ci = editor.findItem(event, eventMaps)

    if (ci?.map === 'atoms') {
      const atomId = ci.id

      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        functionalGroups,
        atomId
      )

      if (fgId !== null) {
        editor.event.removeFG.dispatch({ fgIds: [fgId] })
        return
      }
    }

    const ciFunctionalGroupName =
      ci?.map === 'functionalGroups'
        ? molecule.sgroups.get(ci?.id)?.data.name
        : undefined
    const isSaltOrSolvent = ciFunctionalGroupName
      ? SGroup.isSaltOrSolvent(ciFunctionalGroupName)
      : false

    this.dragCtx = {
      item: ci,
      isSaltOrSolvent
    }
  }

  mousemove(event) {
    const {
      dragCtx,
      atomProps,
      editor,
      editor: {
        render: rnd,
        render: {
          ctab: reStruct,
          ctab: { molecule }
        }
      }
    } = this

    const eventMaps = ['atoms', 'functionalGroups']
    const ci = editor.findItem(event, eventMaps)

    if (
      !dragCtx?.item ||
      dragCtx?.isSaltOrSolvent ||
      (ci?.id !== undefined && ci.id === dragCtx.item.id)
    ) {
      editor.hoverIcon.show()
      editor.hoverIcon.updatePosition()
      editor.hover(editor.findItem(event, eventMaps), null, event)

      if (dragCtx?.action) {
        const action = dragCtx.action.perform(reStruct)

        delete dragCtx.action

        editor.update(action, true)
      }

      return
    }

    editor.hoverIcon.hide()

    let atomId: number | undefined
    if (dragCtx.item.map === 'atoms') {
      atomId = dragCtx.item.id
    } else if (dragCtx.item.map === 'functionalGroups') {
      const sGroup = molecule.sgroups.get(dragCtx.item.id)
      const attachmentAtomId = sGroup?.getAttAtomId(molecule)
      atomId = attachmentAtomId
    }

    if (atomId !== undefined) {
      const atom = molecule.atoms.get(atomId)
      let angle = utils.calcAngle(atom?.pp, rnd.page2obj(event))
      if (!event.ctrlKey) angle = utils.fracAngle(angle, null)
      const degrees = utils.degrees(angle)
      editor.event.message.dispatch({ info: degrees + 'º' })
      const newAtomPos = utils.calcNewAtomPos(
        atom?.pp,
        rnd.page2obj(event),
        event.ctrlKey
      )

      if (dragCtx.action) {
        dragCtx.action.perform(reStruct)
      }

      dragCtx.action = fromBondAddition(
        rnd.ctab,
        this.#bondProps,
        atomId,
        Object.assign({}, atomProps),
        undefined,
        newAtomPos
      )[0]

      editor.update(dragCtx.action, true)
    }
  }

  mouseup(event) {
    const {
      dragCtx,
      atomProps,
      editor,
      editor: {
        render: rnd,
        render: {
          ctab: reStruct,
          ctab: {
            molecule,
            molecule: { functionalGroups }
          }
        }
      }
    } = this

    const ci = editor.findItem(event, ['atoms', 'bonds', 'functionalGroups'])
    const action = new Action()

    if ((!dragCtx.item || dragCtx?.isSaltOrSolvent) && !ci) {
      action.mergeWith(
        fromAtomAddition(reStruct, rnd.page2obj(event), atomProps)
      )
    } else if (dragCtx.item && ci) {
      if (dragCtx.item.id === ci.id) {
        if (
          ci.map === 'functionalGroups' &&
          FunctionalGroup.isContractedFunctionalGroup(ci.id, functionalGroups)
        ) {
          const sGroup = molecule.sgroups.get(ci.id)
          const attachmentAtomId = sGroup?.getAttAtomId(molecule)

          if (attachmentAtomId !== undefined) {
            const atomsToDelete = [...SGroup.getAtoms(molecule, sGroup)].filter(
              (atomId) => atomId !== attachmentAtomId
            )
            const bondsToDelete = [...SGroup.getBonds(molecule, sGroup)]
            action.mergeWith(fromSgroupDeletion(reStruct, ci.id))
            action.mergeWith(
              fromFragmentDeletion(reStruct, {
                atoms: atomsToDelete,
                bonds: bondsToDelete
              })
            )
            action.mergeWith(
              fromAtomsAttrs(reStruct, attachmentAtomId, atomProps, true)
            )
          }
        } else if (ci.map === 'atoms') {
          const atomId = ci.id

          if (
            dragCtx.action === undefined &&
            FunctionalGroup.atomsInFunctionalGroup(functionalGroups, atomId) ===
              null
          ) {
            action.mergeWith(fromAtomsAttrs(reStruct, atomId, atomProps, true))
          }
        }
      }
    }

    editor.event.message.dispatch({
      info: false
    })
    editor.hover(
      this.editor.findItem(event, ['atoms', 'functionalGroups']),
      null,
      event
    )

    delete this.dragCtx

    editor.update(dragCtx.action ? action.mergeWith(dragCtx.action) : action)
  }
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
          ? fromAtomsAttrs(render.ctab, atomid, newatom, null)
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
