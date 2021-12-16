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
  fromArrowDeletion,
  fromFragmentDeletion,
  fromOneAtomDeletion,
  fromOneBondDeletion,
  fromPlusDeletion,
  fromSgroupDeletion,
  fromSimpleObjectDeletion,
  fromTextDeletion,
  FunctionalGroup,
  SGroup
} from 'ketcher-core'

import LassoHelper from './helper/lasso'
import { selMerge } from './select'
import Editor from '../Editor'

class EraserTool {
  editor: Editor
  lassoHelper: LassoHelper
  maps: Array<string>
  shouldActiveToolRemain: boolean | undefined

  constructor(editor, mode) {
    this.editor = editor
    this.maps = [
      'atoms',
      'bonds',
      'rxnArrows',
      'rxnPluses',
      'sgroups',
      'functionalGroups',
      'sgroupData',
      'simpleObjects',
      'texts'
    ]
    this.lassoHelper = new LassoHelper(mode || 0, editor)
    if (editor.selection()) {
      const action = fromFragmentDeletion(editor.render.ctab, editor.selection())
      editor.update(action)
      editor.selection(null)
      this.shouldActiveToolRemain = true
    }
  }

  mousedown(event) {
    const ci = this.editor.findItem(event, this.maps, null)
    if (!ci)
      //  ci.type == 'Canvas'
      this.lassoHelper.begin(event)
  }

  mousemove(event) {
    if (this.lassoHelper.running())
      this.editor.selection(this.lassoHelper.addPoint(event))
    else this.editor.hover(this.editor.findItem(event, this.maps, null))
  }

  mouseup() {
    const selected = this.editor.selection()
    let newSelected: { atoms: Array<any>; bonds: Array<any> } = {
      atoms: [],
      bonds: []
    }
    let actualSgroupId
    const atomsResult: Array<any> = []
    const bondsResult: Array<any> = []
    const preResult: Array<any> = []

    const struct = this.editor.render.ctab
    const molecule = struct.molecule
    const functionalGroups = molecule.functionalGroups
    const sgroups = struct.sgroups

    if (selected && functionalGroups.size && selected.atoms) {
      for (let atom of selected.atoms) {
        const atomId = FunctionalGroup.atomsInFunctionalGroup(
          functionalGroups,
          atom
        )
        const atomFromStruct = atomId !== null && struct.atoms.get(atomId)?.a

        if (atomFromStruct) {
          for (let sgId of atomFromStruct.sgs.values()) {
            actualSgroupId = sgId
          }
        }
        if (
          atomFromStruct &&
          FunctionalGroup.isAtomInContractedFinctionalGroup(
            atomFromStruct,
            sgroups,
            functionalGroups,
            true
          )
        ) {
          const sgroupAtoms =
            actualSgroupId !== undefined &&
            SGroup.getAtoms(molecule, sgroups.get(actualSgroupId)?.item)
          const sgroupBonds =
            actualSgroupId !== undefined &&
            SGroup.getBonds(molecule, sgroups.get(actualSgroupId)?.item)
          atom === sgroupAtoms[0] &&
            // @ts-ignore
            newSelected.atoms.push(...sgroupAtoms) &&
            newSelected.bonds.push(...sgroupBonds)
        }

        if (
          atomFromStruct &&
          !FunctionalGroup.isAtomInContractedFinctionalGroup(
            atomFromStruct,
            sgroups,
            functionalGroups,
            true
          )
        )
          atomsResult.push(atomId)
      }
    }
    if (selected && functionalGroups.size && selected.bonds) {
      for (let bond of selected.bonds) {
        const bondId = FunctionalGroup.bondsInFunctionalGroup(
          molecule,
          functionalGroups,
          bond
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
        )
          bondsResult.push(bondId)
      }
    }
    if (atomsResult.length > 0) {
      for (let id of atomsResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id
        )
        fgId !== null && !preResult.includes(fgId) && preResult.push(fgId)
      }
    }
    if (bondsResult.length > 0) {
      for (let id of bondsResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          functionalGroups,
          id
        )
        fgId !== null && !preResult.includes(fgId) && preResult.push(fgId)
      }
    }
    if (preResult.length > 0) {
      const result: Array<any> = []
      preResult.forEach(fgId => {
        const sgAtoms = sgroups.get(fgId)?.item.atoms
        sgAtoms.forEach(atom => {
          !atomsResult.includes(atom) &&
            !result.includes(fgId) &&
            result.push(fgId)
        })
      })
      if (result.length > 0) {
        this.editor.selection(null)
        this.editor.event.removeFG.dispatch({ fgIds: result })
        this.lassoHelper.cancel()
      }
    }

    // eslint-disable-line max-statements
    const rnd = this.editor.render

    if (this.lassoHelper.running()) {
      // TODO it catches more events than needed, to be re-factored
      const sel =
        newSelected.atoms.length > 0
          ? selMerge(this.lassoHelper.end(), newSelected, true)
          : this.lassoHelper.end()
      this.editor.update(fromFragmentDeletion(rnd.ctab, sel))
      this.editor.selection(null)
    }
  }

  click(event) {
    const rnd = this.editor.render
    const restruct = this.editor.render.ctab
    const ci = this.editor.findItem(event, this.maps, null)
    const atomResult: Array<any> = []
    const bondResult: Array<any> = []
    const result: Array<any> = []

    const molecule = restruct.molecule
    const functionalGroups = molecule.functionalGroups
    const sgroups = restruct.sgroups

    if (
      ci &&
      functionalGroups &&
      ci.map === 'functionalGroups' &&
      !FunctionalGroup.isContractedFunctionalGroup(ci.id, functionalGroups)
    ) {
      const sGroup = sgroups.get(ci.id)
      if (FunctionalGroup.isFunctionalGroup(sGroup?.item)) {
        result.push(ci.id)
      }
    } else if (ci && functionalGroups && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id
      )
      const atomFromStruct = atomId !== null && restruct.atoms.get(atomId)?.a
      if (
        atomFromStruct &&
        !FunctionalGroup.isAtomInContractedFinctionalGroup(
          atomFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      )
        atomResult.push(atomId)
    } else if (ci && functionalGroups && ci.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id
      )
      const bondFromStruct = bondId !== null && restruct.bonds.get(bondId)?.b
      if (
        bondFromStruct &&
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          bondFromStruct,
          sgroups,
          functionalGroups,
          true
        )
      )
        bondResult.push(bondId)
    }
    if (atomResult.length) {
      for (let id of atomResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id
        )
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId)
        }
      }
    } else if (bondResult.length) {
      for (let id of bondResult) {
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
    if (result.length) {
      this.editor.event.removeFG.dispatch({ fgIds: result })
      return
    }

    if (!ci) return // ci.type == 'Canvas'

    this.editor.hover(null)
    if (ci.map === 'atoms') {
      this.editor.update(fromOneAtomDeletion(restruct, ci.id))
    } else if (ci.map === 'bonds') {
      this.editor.update(fromOneBondDeletion(restruct, ci.id))
    } else if (
      ci.map === 'functionalGroups' &&
      FunctionalGroup.isContractedFunctionalGroup(ci.id, functionalGroups)
    ) {
      const sGroup = sgroups.get(ci.id)
      this.editor.update(
        fromFragmentDeletion(rnd.ctab, {
          atoms: [...SGroup.getAtoms(molecule, sGroup?.item)],
          bonds: [...SGroup.getBonds(molecule, sGroup?.item)]
        })
      )
    } else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
      this.editor.update(fromSgroupDeletion(restruct, ci.id))
    } else if (ci.map === 'rxnArrows') {
      this.editor.update(fromArrowDeletion(restruct, ci.id))
    } else if (ci.map === 'rxnPluses') {
      this.editor.update(fromPlusDeletion(restruct, ci.id))
    } else if (ci.map === 'simpleObjects') {
      this.editor.update(fromSimpleObjectDeletion(restruct, ci.id))
    } else if (ci.map === 'texts') {
      this.editor.update(fromTextDeletion(restruct, ci.id))
    } else {
      // TODO re-factoring needed - should be "map-independent"
      console.error(
        'EraserTool: unable to delete the object ' + ci.map + '[' + ci.id + ']'
      )
      return
    }
    this.editor.selection(null)
  }

  mouseleave() {
    this.mouseup()
  }

  cancel() {
    if (this.lassoHelper.running()) this.lassoHelper.end()
    this.editor.selection(null)
  }
}

export default EraserTool
