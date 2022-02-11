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

import { Highlight } from 'domain/entities'
import { ReStruct } from '../../render'

import { BaseOperation } from './base'
import { OperationType } from './OperationType'

type Data = {
  atoms: Array<number> | undefined
  bonds: Array<number> | undefined
  color: string | undefined
  highlightId: number | undefined
}

export class HighlightAdd extends BaseOperation {
  data: Data

  constructor(atoms?: Array<number>, bonds?: Array<number>, color?: string) {
    super(OperationType.ADD_HIGHLIGHT)
    this.data = {
      atoms: atoms,
      bonds: bonds,
      color: color,
      highlightId: undefined
    }
  }

  execute(restruct: ReStruct) {
    const { atoms, bonds, color } = this.data

    if (!color) {
      return
    }

    const struct = restruct.molecule
    const highlight = new Highlight({
      atoms,
      bonds,
      color
    })

    if (typeof this.data.highlightId !== 'number') {
      this.data.highlightId = struct.highlights.add(highlight)
    } else {
      struct.highlights.set(this.data.highlightId, highlight)
    }

    // const highlightId = struct.highlights.add(highlight)
    // this.data.highlightId = highlightId

    notifyChanged(restruct, atoms, bonds)
  }

  invert() {
    const inverted = new HighlightDelete()
    inverted.data = this.data
    return inverted
  }
}

export class HighlightDelete extends BaseOperation {
  data: Data

  constructor(highlightId?: number) {
    super(OperationType.REMOVE_HIGHLIGHT, 5)
    this.data = {
      highlightId: highlightId,
      atoms: undefined,
      bonds: undefined,
      color: undefined
    }
  }

  execute(restruct: ReStruct) {
    if (typeof this.data.highlightId === 'number') {
      const struct = restruct.molecule

      const highlightToRemove = struct.highlights.get(this.data.highlightId)
      if (typeof highlightToRemove === 'undefined') {
        return
      }

      console.log('Performing deletion ', this.data)

      const { atoms, bonds, color } = highlightToRemove

      this.data.atoms = atoms
      this.data.bonds = bonds
      this.data.color = color

      struct.highlights.delete(this.data.highlightId)
      notifyChanged(restruct, atoms, bonds)
    }
  }

  invert() {
    const inverted = new HighlightAdd()
    inverted.data = this.data
    return inverted
  }
}

function notifyChanged(restruct: ReStruct, atoms?: number[], bonds?: number[]) {
  // Notifying ReStruct that repaint needed
  const reAtoms = restruct.atoms
  const reBonds = restruct.bonds

  if (atoms) {
    atoms.forEach((atomId) => {
      if (typeof reAtoms.get(atomId) !== 'undefined') {
        restruct.markAtom(atomId, 1)
      }
    })
  }

  if (bonds) {
    bonds.forEach((bondId) => {
      if (typeof reBonds.get(bondId) !== 'undefined') {
        restruct.markBond(bondId, 1)
      }
    })
  }
}
