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

function EraserTool(editor, mode) {
  if (!(this instanceof EraserTool)) {
    if (!editor.selection()) return new EraserTool(editor, mode)

    const action = fromFragmentDeletion(editor.render.ctab, editor.selection())
    editor.update(action)
    editor.selection(null)
    return null
  }

  this.editor = editor
  this.sgroups = editor.render.ctab.sgroups
  this.struct = editor.render.ctab
  this.molecule = editor.render.ctab.molecule
  this.functionalGroups = this.molecule.functionalGroups

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
}

EraserTool.prototype.mousedown = function (event) {
  const ci = this.editor.findItem(event, this.maps)
  if (!ci)
    //  ci.type == 'Canvas'
    this.lassoHelper.begin(event)
}

EraserTool.prototype.mousemove = function (event) {
  if (this.lassoHelper.running())
    this.editor.selection(this.lassoHelper.addPoint(event))
  else this.editor.hover(this.editor.findItem(event, this.maps))
}

EraserTool.prototype.mouseup = function (event) {
  const selected = this.editor.selection()
  const newSelected = { atoms: [], bonds: [] }
  let actualSgroupId
  const atomsResult = []
  const bondsResult = []
  const preResult = []

  if (selected && this.functionalGroups.size && selected.atoms) {
    for (const atom of selected.atoms) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        this.functionalGroups,
        atom
      )
      const atomFromStruct = atomId !== null && this.struct.atoms.get(atomId).a

      if (atomFromStruct) {
        for (const sgId of atomFromStruct.sgs.values()) {
          actualSgroupId = sgId
        }
      }
      if (
        atomFromStruct &&
        FunctionalGroup.isAtomInContractedFunctionalGroup(
          atomFromStruct,
          this.sgroups,
          this.functionalGroups,
          true
        )
      ) {
        const sgroupAtoms =
          actualSgroupId !== undefined &&
          SGroup.getAtoms(
            this.molecule,
            this.struct.sgroups.get(actualSgroupId).item
          )
        const sgroupBonds =
          actualSgroupId !== undefined &&
          SGroup.getBonds(
            this.molecule,
            this.struct.sgroups.get(actualSgroupId).item
          )
        atom === sgroupAtoms[0] &&
          newSelected.atoms.push(...sgroupAtoms) &&
          newSelected.bonds.push(...sgroupBonds)
      }

      if (
        atomFromStruct &&
        !FunctionalGroup.isAtomInContractedFunctionalGroup(
          atomFromStruct,
          this.sgroups,
          this.functionalGroups,
          true
        )
      )
        atomsResult.push(atomId)
    }
  }
  if (selected && this.functionalGroups.size && selected.bonds) {
    for (const bond of selected.bonds) {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        this.molecule,
        this.functionalGroups,
        bond
      )
      const bondFromStruct = bondId !== null && this.struct.bonds.get(bondId).b
      if (
        bondFromStruct &&
        !FunctionalGroup.isBondInContractedFunctionalGroup(
          bondFromStruct,
          this.sgroups,
          this.functionalGroups,
          true
        )
      )
        bondsResult.push(bondId)
    }
  }
  if (atomsResult.length > 0) {
    for (const id of atomsResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        this.functionalGroups,
        id
      )
      fgId !== null && !preResult.includes(fgId) && preResult.push(fgId)
    }
  }
  if (bondsResult.length > 0) {
    for (const id of bondsResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByBond(
        this.molecule,
        this.functionalGroups,
        id
      )
      fgId !== null && !preResult.includes(fgId) && preResult.push(fgId)
    }
  }
  if (preResult.length > 0) {
    const result = []
    const sgroups = this.sgroups
    preResult.forEach((fgId) => {
      const sgAtoms = sgroups.get(fgId).item.atoms
      sgAtoms.forEach((atom) => {
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
        ? selMerge(this.lassoHelper.end(event), newSelected)
        : this.lassoHelper.end(event)
    this.editor.update(fromFragmentDeletion(rnd.ctab, sel))
    this.editor.selection(null)
  }
}

EraserTool.prototype.click = function (event) {
  const rnd = this.editor.render
  const restruct = this.editor.render.ctab
  const ci = this.editor.findItem(event, this.maps)
  const atomResult = []
  const bondResult = []
  const result = []

  if (
    ci &&
    this.functionalGroups &&
    ci.map === 'functionalGroups' &&
    !FunctionalGroup.isContractedFunctionalGroup(ci.id, this.functionalGroups)
  ) {
    const sGroup = this.sgroups.get(ci.id)
    if (FunctionalGroup.isFunctionalGroup(sGroup.item)) {
      result.push(ci.id)
    }
  } else if (ci && this.functionalGroups && ci.map === 'atoms') {
    const atomId = FunctionalGroup.atomsInFunctionalGroup(
      this.functionalGroups,
      ci.id
    )
    const atomFromStruct = atomId !== null && this.struct.atoms.get(atomId).a
    if (
      atomFromStruct &&
      !FunctionalGroup.isAtomInContractedFunctionalGroup(
        atomFromStruct,
        this.sgroups,
        this.functionalGroups,
        true
      )
    )
      atomResult.push(atomId)
  } else if (ci && this.functionalGroups && ci.map === 'bonds') {
    const bondId = FunctionalGroup.bondsInFunctionalGroup(
      this.molecule,
      this.functionalGroups,
      ci.id
    )
    const bondFromStruct = bondId !== null && this.struct.bonds.get(bondId).b
    if (
      bondFromStruct &&
      !FunctionalGroup.isBondInContractedFunctionalGroup(
        bondFromStruct,
        this.sgroups,
        this.functionalGroups,
        true
      )
    )
      bondResult.push(bondId)
  }
  if (atomResult.length) {
    for (const id of atomResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        this.functionalGroups,
        id
      )
      if (fgId !== null && !result.includes(fgId)) {
        result.push(fgId)
      }
    }
  } else if (bondResult.length) {
    for (const id of bondResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByBond(
        this.molecule,
        this.functionalGroups,
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
    FunctionalGroup.isContractedFunctionalGroup(ci.id, this.functionalGroups)
  ) {
    const sGroup = this.sgroups.get(ci.id)
    this.editor.update(
      fromFragmentDeletion(rnd.ctab, {
        atoms: [...SGroup.getAtoms(this.molecule, sGroup.item)],
        bonds: [...SGroup.getBonds(this.molecule, sGroup.item)]
      })
    )
  } else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
    const sGroup = this.sgroups.get(ci.id)
    if (FunctionalGroup.isFunctionalGroup(sGroup.item)) {
      this.editor.event.removeFG.dispatch({ fgIds: [ci.id] })
    } else {
      this.editor.update(fromSgroupDeletion(restruct, ci.id))
    }
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

EraserTool.prototype.mouseleave = EraserTool.prototype.mouseup

EraserTool.prototype.cancel = function () {
  if (this.lassoHelper.running()) this.lassoHelper.end()
  this.editor.selection(null)
}

export default EraserTool
