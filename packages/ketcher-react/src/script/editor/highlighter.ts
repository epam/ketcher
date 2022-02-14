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

import { union } from 'lodash'

import {
  fromHighlightCreate,
  fromHighlightClear,
  fromHighlightDelete,
  fromHighlightUpdate
} from 'ketcher-core'
import type { Struct } from 'ketcher-core'

import type { Editor } from './Editor'

type HighlightAttributes = {
  atoms: number[]
  bonds: number[]
  color: string
}

export class Highlighter {
  editor: Editor

  constructor(editor: Editor) {
    this.editor = editor
  }

  getAll() {
    const highlightsMap = this.editor.render.ctab.molecule.highlights
    return Array.from(highlightsMap)
  }

  create(...args: HighlightAttributes[]) {
    const createdHighlights: HighlightAttributes[] = []

    args.forEach((arg) => {
      const { atoms, bonds, color } = arg
      if (typeof color !== 'string') {
        return
      }

      if (!atoms && !bonds) {
        return
      }

      const restruct = this.editor.render.ctab

      const { validAtoms, validBonds } = getValidInputOnly(
        restruct.molecule,
        atoms,
        bonds
      )

      if (validAtoms.length === 0 && validBonds.length === 0) {
        return
      }

      createdHighlights.push({ atoms: validAtoms, bonds: validBonds, color })
    })
    const action = fromHighlightCreate(
      this.editor.render.ctab,
      createdHighlights
    )
    this.editor.update(action)
  }

  update(
    id: number,
    {
      atoms,
      bonds,
      color
    }: {
      atoms?: number[]
      bonds?: number[]
      color: string
    }
  ) {
    if (typeof color !== 'string' || typeof id !== 'number') {
      return
    }
    if (!atoms && !bonds) {
      return
    }

    const restruct = this.editor.render.ctab

    const { validAtoms, validBonds } = getValidInputOnly(
      restruct.molecule,
      atoms,
      bonds
    )

    if (validAtoms.length === 0 && validBonds.length === 0) {
      return
    }

    const action = fromHighlightUpdate(
      id,
      this.editor.render.ctab,
      validAtoms,
      validBonds,
      color
    )
    this.editor.update(action)
  }

  append(
    id: number,
    {
      atoms,
      bonds,
      color
    }: {
      atoms?: number[]
      bonds?: number[]
      color?: string
    }
  ) {
    if (!atoms && !bonds && !color) {
      return
    }
    const restruct = this.editor.render.ctab

    const { validAtoms, validBonds } = getValidInputOnly(
      restruct.molecule,
      atoms,
      bonds
    )

    if (validAtoms.length === 0 && validBonds.length === 0 && !color) {
      return
    }

    const currentHighlight = restruct.molecule.highlights.get(id)

    if (currentHighlight) {
      const mergedHighlight = {
        atoms: union(currentHighlight.atoms, validAtoms),
        bonds: union(currentHighlight.bonds, validBonds),
        color: color || currentHighlight.color
      }

      const action = fromHighlightUpdate(
        id,
        restruct,
        mergedHighlight.atoms,
        mergedHighlight.bonds,
        mergedHighlight.color
      )
      this.editor.update(action)
    }
  }

  delete(id: number) {
    if (typeof id !== 'number') {
      return
    }

    const action = fromHighlightDelete(this.editor.render.ctab, id)
    this.editor.update(action)
  }

  clear() {
    const action = fromHighlightClear(this.editor.render.ctab)
    this.editor.update(action)
  }
}

type ValidInput = {
  validAtoms: number[]
  validBonds: number[]
}

function getValidInputOnly(struct: Struct, atoms, bonds): ValidInput {
  if (!Array.isArray(atoms)) {
    atoms = []
  }

  if (!Array.isArray(bonds)) {
    bonds = []
  }

  const { atoms: structAtoms, bonds: structBonds } = struct

  // Filter out atom ids that are not in struct
  if (atoms.length > 0) {
    atoms = atoms.filter((aid) => structAtoms.has(aid))
  }

  // Filter out bond ids that are not in struct
  if (bonds.length > 0) {
    bonds = bonds.filter((bid) => structBonds.has(bid))
  }

  return {
    validAtoms: atoms,
    validBonds: bonds
  }
}
