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
  Pile,
  SgContexts,
  checkOverlapping,
  fromSeveralSgroupAddition,
  fromSgroupAction,
  fromSgroupDeletion,
  FunctionalGroup,
  SGroup,
  Pool
} from 'ketcher-core'

import LassoHelper from './helper/lasso'
import { isEqual } from 'lodash/fp'
import { selMerge } from './select'
import Editor from '../Editor'
// import { extendChoosing } from '../utils/choose/choose'
// import { chooseItems } from '../utils/choose/chooseUtils/chooseItems'
import { finishChoosing } from '../utils/choose/finishChoosing'
import { startChoosing } from '../utils/choose/startChoosing'

const searchMaps = [
  'atoms',
  'bonds',
  'sgroups',
  'functionalGroups',
  'sgroupData'
]

class SGroupTool {
  editor: Editor
  type: any
  lassoHelper: any
  isNotActiveTool: boolean | undefined

  constructor(editor, type) {
    this.editor = editor
    this.type = type
    this.lassoHelper = new LassoHelper(1, editor, null)

    this.checkSelection()
  }

  // todo rename to checkChosenItems
  checkSelection() {
    const selection = this.editor.selection() || {}

    if (selection.atoms && selection.bonds) {
      const selectedAtoms = this.editor.selection()?.atoms
      const struct = this.editor.render.ctab
      const molecule = struct.molecule
      const sgroups: Pool<SGroup> = molecule.sgroups
      const newSelected: { atoms: Array<any>; bonds: Array<any> } = {
        atoms: [],
        bonds: []
      }
      let actualSgroupId
      let atomsResult: Array<number> = []
      let extraAtoms
      const functionalGroups = molecule.functionalGroups
      const result: Array<number> = []

      const id = sgroups.find((_, sgroup) =>
        isEqual(sgroup.atoms, selectedAtoms)
      )

      if (selectedAtoms && functionalGroups.size) {
        for (const atom of selectedAtoms) {
          const atomId = FunctionalGroup.atomsInFunctionalGroup(
            functionalGroups,
            atom
          )

          if (atomId == null) {
            extraAtoms = true
          }

          const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a

          if (atomFromStruct) {
            for (const sgId of atomFromStruct.sgs.values()) {
              actualSgroupId = sgId
            }
          }

          if (
            atomFromStruct &&
            FunctionalGroup.isAtomInContractedFunctionalGroup(
              atomFromStruct,
              sgroups,
              functionalGroups,
              false
            )
          ) {
            const sgroupAtoms =
              actualSgroupId !== undefined &&
              SGroup.getAtoms(molecule, sgroups.get(actualSgroupId))
            const sgroupBonds =
              actualSgroupId !== undefined &&
              SGroup.getBonds(molecule, sgroups.get(actualSgroupId))
            atom === sgroupAtoms[0] &&
              newSelected.atoms.push(...(sgroupAtoms as Array<any>)) &&
              newSelected.bonds.push(...(sgroupBonds as Array<any>))
          }

          if (atomFromStruct) {
            atomsResult.push(atomId)
          }
        }
      }

      if (extraAtoms) {
        atomsResult = []
      }

      if (atomsResult && atomsResult.length > 0) {
        for (const id of atomsResult) {
          const fgId = FunctionalGroup.findFunctionalGroupByAtom(
            functionalGroups,
            id
          )

          if (fgId !== null && !result.includes(fgId)) {
            result.push(fgId)
          }
        }
      }

      if (result.length) {
        this.editor.selection(null)
        this.editor.event.removeFG.dispatch({ fgIds: result })
        return
      }

      sgroupDialog(this.editor, id !== undefined ? id : null, this.type)
      this.isNotActiveTool = true
    }
  }

  mousedown(event) {
    debugger
    const closestItem = this.editor.findItem(event, searchMaps)
    const struct = this.editor.render.ctab
    const sgroups = struct.sgroups
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const atomResult: Array<number> = []
    const bondResult: Array<number> = []
    const result: Array<number> = []

    startChoosing(this, event, this.editor, this.lassoHelper)

    if (closestItem && functionalGroups.size && closestItem.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        closestItem.id
      )
      const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a

      if (
        atomFromStruct &&
        !FunctionalGroup.isAtomInContractedFunctionalGroup(
          atomFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      ) {
        atomResult.push(atomId)
      }
    }

    if (closestItem && functionalGroups.size && closestItem.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        closestItem.id
      )
      const bondFromStruct = bondId !== null && struct.bonds.get(bondId)?.b

      if (
        bondFromStruct &&
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          bondFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      ) {
        bondResult.push(bondId)
      }
    }

    if (
      closestItem &&
      functionalGroups.size &&
      closestItem.map === 'functionalGroups'
    ) {
      const sgroup = sgroups.get(closestItem.id)

      if (FunctionalGroup.isFunctionalGroup(sgroup?.item)) {
        this.editor.event.removeFG.dispatch({ fgIds: [closestItem.id] })
        return
      }
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

      this.editor.event.removeFG.dispatch({ fgIds: result })
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

    if (!closestItem) {
      this.lassoHelper.begin(event)
    }
  }

  mousemove(event) {
    if (this.lassoHelper.running(event)) {
      this.editor.selection(this.lassoHelper.addPoint(event))
    } else {
      this.editor.hover(this.editor.findItem(event, searchMaps))
    }

    // extendChoosing()
  }

  mouseleave(event) {
    if (this.lassoHelper.running(event)) {
      this.lassoHelper.end(event)
    }
  }

  mouseup(event) {
    const struct = this.editor.render.ctab
    const sgroups = struct.sgroups
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const closestItem = this.editor.findItem(event, searchMaps)
    const selected = this.editor.selection()
    const newSelected: Record<string, Array<any>> = { atoms: [], bonds: [] }
    let actualSgroupId
    let atomsResult: Array<number> | null = []
    let extraAtoms
    let bondsResult: Array<number> | null = []
    let extraBonds
    const result: Array<number> = []

    finishChoosing(event, this.editor, this.lassoHelper)

    if (
      closestItem &&
      closestItem.map === 'functionalGroups' &&
      functionalGroups.size &&
      FunctionalGroup.isContractedFunctionalGroup(
        closestItem.id,
        functionalGroups
      )
    )
      return

    if (selected && functionalGroups.size && selected.atoms) {
      for (const atom of selected.atoms) {
        const atomId = FunctionalGroup.atomsInFunctionalGroup(
          functionalGroups,
          atom
        )

        if (atomId == null) {
          extraAtoms = true
        }

        const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a

        if (atomFromStruct) {
          for (const sgId of atomFromStruct.sgs.values()) {
            actualSgroupId = sgId
          }
        }

        if (
          atomFromStruct &&
          FunctionalGroup.isAtomInContractedFunctionalGroup(
            atomFromStruct,
            sgroups,
            functionalGroups,
            true
          )
        ) {
          const sgroupAtoms =
            actualSgroupId !== undefined &&
            SGroup.getAtoms(molecule, struct.sgroups.get(actualSgroupId)?.item)
          const sgroupBonds =
            actualSgroupId !== undefined &&
            SGroup.getBonds(molecule, struct.sgroups.get(actualSgroupId)?.item)
          atom === sgroupAtoms[0] &&
            newSelected.atoms.push(...(sgroupAtoms as Array<any>)) &&
            newSelected.bonds.push(...(sgroupBonds as Array<any>))
        }

        if (atomFromStruct) {
          atomsResult.push(atomId)
        }
      }
    }

    if (selected && functionalGroups.size && selected.bonds) {
      for (const bond of selected.bonds) {
        const bondId = FunctionalGroup.bondsInFunctionalGroup(
          molecule,
          functionalGroups,
          bond
        )

        if (bondId === null) {
          extraBonds = true
        }

        const bondFromStruct = bondId !== null && struct.bonds.get(bondId)?.b
        if (bondFromStruct) {
          bondsResult.push(bondId)
        }
      }
    }

    if (atomsResult.length) {
      atomsResult.forEach((id) => {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id
        ) as number
        const sgroupAtoms = SGroup.getAtoms(
          molecule,
          struct.sgroups.get(fgId)?.item
        )
        newSelected.atoms.push(...sgroupAtoms)
      })
    }

    if (bondsResult.length) {
      bondsResult.forEach((id) => {
        const fgId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          functionalGroups,
          id
        ) as number
        const sgroupBonds = SGroup.getBonds(
          molecule,
          struct.sgroups.get(fgId)?.item
        )
        newSelected.bonds.push(...sgroupBonds)
      })
    }

    if (extraAtoms || extraBonds) {
      atomsResult = null
      bondsResult = null
    }

    if (atomsResult && atomsResult.length > 0) {
      for (const id of atomsResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id
        )
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId)
        }
      }
    }

    if (bondsResult && bondsResult.length > 0) {
      for (const id of bondsResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          functionalGroups,
          id
        )
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId)
        }
      }
    }

    if (result.length === 1) {
      this.editor.selection(null)
      this.lassoHelper.cancel()
      this.editor.event.removeFG.dispatch({ fgIds: result })
      return
    }

    let id = null // id of an existing group, if we're editing one
    let selection: any = null // atoms to include in a newly created group

    if (this.lassoHelper.running(event)) {
      // TODO it catches more events than needed, to be re-factored
      selection =
        newSelected.atoms.length > 0
          ? selMerge(this.lassoHelper.end(event), newSelected, false)
          : this.lassoHelper.end(event)
      this.editor.selection(selection)
    } else {
      if (!closestItem)
        // closestItem.type == 'Canvas'
        return
      this.editor.hover(null)

      if (closestItem.map === 'atoms') {
        // if we click the SGroup tool on a single atom or bond, make a group out of those
        selection = { atoms: [closestItem.id] }
      } else if (closestItem.map === 'bonds') {
        const bond = this.editor.render.ctab.bonds.get(closestItem.id)
        selection = { atoms: [bond?.b.begin, bond?.b.end] }
      } else if (
        closestItem.map === 'sgroups' ||
        closestItem.map === 'sgroupData'
      ) {
        id = closestItem.id
      } else {
        return
      }
    }

    // TODO: handle click on an existing group?
    if (id !== null || (selection && selection.atoms))
      sgroupDialog(this.editor, id, this.type)
  }

  cancel() {
    if (this.lassoHelper.running()) {
      this.lassoHelper.end()
    }
    this.editor.selection(null)
  }
}

export function sgroupDialog(editor, id, defaultType) {
  const restruct = editor.render.ctab
  console.log('editor', editor)

  const struct = restruct.molecule
  const selection = editor.selection() || {}
  // const selection = chooseItems()
  const sg = id !== null ? struct.sgroups.get(id) : null
  const type = sg ? sg.type : defaultType
  const eventName = type === 'DAT' ? 'sdataEdit' : 'sgroupEdit'

  // if (!selection.atoms && !selection.bonds && !sg) {
  //   console.info('There are no chosen Items AND sgroup')
  //   return
  // }

  let attrs
  if (sg) {
    attrs = sg.getAttrs()
    if (!attrs.context) attrs.context = getContextBySgroup(restruct, sg.atoms)
  } else {
    attrs = {
      context: getContextBySelection(restruct, selection)
    }
  }

  const res = editor.event[eventName].dispatch({
    type,
    attrs
  })

  Promise.resolve(res)
    .then((newSg) => {
      // TODO: check before signal
      if (
        newSg.type !== 'DAT' && // when data s-group separates
        checkOverlapping(struct, selection.atoms || [])
      ) {
        editor.event.message.dispatch({
          error: 'Partial S-group overlapping is not allowed.'
        })
      } else {
        if (
          !sg &&
          newSg.type !== 'DAT' &&
          (!selection.atoms || selection.atoms.length === 0)
        )
          return

        const isDataSg = sg && sg.getAttrs().context === newSg.attrs.context

        if (isDataSg) {
          const action = fromSeveralSgroupAddition(
            restruct,
            newSg.type,
            sg.atoms,
            newSg.attrs
          ).mergeWith(fromSgroupDeletion(restruct, id))

          editor.update(action)
          editor.selection(selection)
          return
        }

        const result = fromContextType(id, editor, newSg, selection)
        editor.update(result.action)
        editor.selection(null)
      }
    })
    .catch(() => null)
}

function getContextBySgroup(restruct, sgAtoms) {
  const struct = restruct.molecule

  if (sgAtoms.length === 1) {
    return SgContexts.Atom
  }

  if (manyComponentsSelected(restruct, sgAtoms)) {
    return SgContexts.Multifragment
  }

  if (singleComponentSelected(restruct, sgAtoms)) {
    return SgContexts.Fragment
  }

  const atomSet = new Pile(sgAtoms)

  const sgBonds = Array.from(struct.bonds.values()).filter(
    (bond: any) => atomSet.has(bond.begin) && atomSet.has(bond.end)
  )

  return anyChainedBonds(sgBonds) ? SgContexts.Group : SgContexts.Bond
}

function getContextBySelection(restruct, selection) {
  const struct = restruct.molecule

  if (selection.atoms && !selection.bonds) {
    return SgContexts.Atom
  }

  const bonds = selection.bonds.map((bondid) => struct.bonds.get(bondid))

  if (!anyChainedBonds(bonds)) {
    return SgContexts.Bond
  }

  selection.atoms = selection.atoms || []

  const atomSet = new Pile(selection.atoms)
  const allBondsSelected = bonds.every(
    (bond) => atomSet.has(bond.begin) && atomSet.has(bond.end)
  )

  if (singleComponentSelected(restruct, selection.atoms) && allBondsSelected) {
    return SgContexts.Fragment
  }

  return manyComponentsSelected(restruct, selection.atoms)
    ? SgContexts.Multifragment
    : SgContexts.Group
}

function fromContextType(id, editor, newSg, currSelection) {
  const restruct = editor.render.ctab
  const sg = restruct.molecule.sgroups.get(id)
  const sourceAtoms = (sg && sg.atoms) || currSelection.atoms || []
  const context = newSg.attrs.context

  const result = fromSgroupAction(
    context,
    restruct,
    newSg,
    sourceAtoms,
    currSelection
  )

  result.selection = result.selection || currSelection

  if (id !== null && id !== undefined) {
    result.action = result.action.mergeWith(fromSgroupDeletion(restruct, id))
  }

  editor.selection(result.selection)

  return result
}

function anyChainedBonds(bonds) {
  if (bonds.length === 0) {
    return true
  }

  for (let i = 0; i < bonds.length; ++i) {
    const fixedBond = bonds[i]
    for (let j = 0; j < bonds.length; ++j) {
      if (i === j) continue

      const bond = bonds[j]

      if (fixedBond.end === bond.begin || fixedBond.end === bond.end) {
        return true
      }
    }
  }

  return false
}

function singleComponentSelected(restruct, atoms) {
  return countOfSelectedComponents(restruct, atoms) === 1
}

function manyComponentsSelected(restruct, atoms) {
  return countOfSelectedComponents(restruct, atoms) > 1
}

function countOfSelectedComponents(restruct, atoms): any {
  const atomSet = new Pile(atoms)

  return Array.from(restruct.connectedComponents.values()).reduce(
    (acc: number, component) =>
      acc + (atomSet.isSuperset(component as Pile) ? 1 : 0),
    0
  )
}

export default SGroupTool
