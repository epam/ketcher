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
/* eslint-disable @typescript-eslint/no-use-before-define */

import { Highlight } from 'domain/entities';
import { ReStruct } from '../../render';

import { BaseOperation } from './base';
import { OperationType } from './OperationType';

type Data = {
  atoms: Array<number>;
  bonds: Array<number>;
  color: string;
  highlightId?: number;
};

export class HighlightAdd extends BaseOperation {
  data: Data;

  constructor(
    atoms: Array<number>,
    bonds: Array<number>,
    color: string,
    highlightId?: number
  ) {
    super(OperationType.ADD_HIGHLIGHT);
    this.data = {
      atoms,
      bonds,
      color,
      highlightId,
    };
  }

  execute(restruct: ReStruct) {
    const { atoms, bonds, color } = this.data;

    if (!color) {
      return;
    }

    const struct = restruct.molecule;
    const highlight = new Highlight({
      atoms,
      bonds,
      color,
    });

    if (typeof this.data.highlightId !== 'number') {
      this.data.highlightId = struct.highlights.add(highlight);
    } else {
      struct.highlights.set(this.data.highlightId, highlight);
    }

    notifyChanged(restruct, atoms, bonds);
  }

  invert() {
    const { atoms, bonds, color, highlightId } = this.data;
    const inverted = new HighlightDelete(highlightId, atoms, bonds, color);
    return inverted;
  }
}

export class HighlightDelete extends BaseOperation {
  data: Data;

  constructor(
    highlightId?: number,
    atoms?: Array<number>,
    bonds?: Array<number>,
    color?: string
  ) {
    super(OperationType.REMOVE_HIGHLIGHT, 5);
    this.data = {
      highlightId,
      atoms: atoms || [],
      bonds: bonds || [],
      color: color || 'white',
    };
  }

  execute(restruct: ReStruct) {
    if (typeof this.data.highlightId === 'number') {
      const struct = restruct.molecule;

      const highlightToRemove = struct.highlights.get(this.data.highlightId);
      if (typeof highlightToRemove === 'undefined') {
        return;
      }

      const { atoms, bonds, color } = highlightToRemove;

      this.data.atoms = atoms;
      this.data.bonds = bonds;
      this.data.color = color;

      struct.highlights.delete(this.data.highlightId);
      notifyChanged(restruct, atoms, bonds);
    }
  }

  invert() {
    const { atoms, bonds, color, highlightId } = this.data;
    const inverted = new HighlightAdd(atoms, bonds, color, highlightId);
    inverted.data = this.data;
    return inverted;
  }
}

export class HighlightUpdate extends BaseOperation {
  // making sure highlightId is not optional
  newData: Data & { highlightId: number };
  oldData: Data & { highlightId: number };

  constructor(
    highlightId: number,
    atoms: Array<number>,
    bonds: Array<number>,
    color: string
  ) {
    super(OperationType.UPDATE_HIGHLIGHT);
    this.newData = {
      atoms,
      bonds,
      color,
      highlightId,
    };

    // pre-filling with new data. Upon execution this will be replaced
    this.oldData = {
      atoms,
      bonds,
      color,
      highlightId,
    };
  }

  execute(restruct: ReStruct) {
    const { atoms, bonds, color } = this.newData;
    if (!color) {
      return;
    }

    const highlightId = this.newData.highlightId;
    const struct = restruct.molecule;

    const highlightToUpdate = struct.highlights.get(highlightId);

    if (highlightToUpdate) {
      // saving data of existing highlight
      const {
        atoms: oldAtoms,
        bonds: oldBonds,
        color: oldColor,
      } = highlightToUpdate;
      this.oldData = {
        atoms: oldAtoms,
        bonds: oldBonds,
        color: oldColor,
        highlightId,
      };

      // creating new highlight with new data
      const updatedHighlight = new Highlight({
        atoms,
        bonds,
        color,
      });

      // setting the new highlight
      struct.highlights.set(this.newData.highlightId, updatedHighlight);

      // notify atoms from both collections that repaint is needed
      notifyChanged(restruct, [...atoms, ...oldAtoms], [...bonds, ...oldBonds]);
    }
  }

  invert() {
    const { atoms, bonds, color } = this.oldData;
    const inverted = new HighlightUpdate(
      this.newData.highlightId,
      atoms,
      bonds,
      color
    );
    return inverted;
  }
}

function notifyChanged(restruct: ReStruct, atoms?: number[], bonds?: number[]) {
  // Notifying ReStruct that repaint needed
  const reAtoms = restruct.atoms;
  const reBonds = restruct.bonds;

  if (atoms) {
    atoms.forEach((atomId) => {
      if (typeof reAtoms.get(atomId) !== 'undefined') {
        restruct.markAtom(atomId, 1);
      }
    });
  }

  if (bonds) {
    bonds.forEach((bondId) => {
      if (typeof reBonds.get(bondId) !== 'undefined') {
        restruct.markBond(bondId, 1);
      }
    });
  }
}
