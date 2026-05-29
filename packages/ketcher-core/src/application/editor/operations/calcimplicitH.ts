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

import { BaseOperation } from './BaseOperation';
import { OperationPriority, OperationType } from './OperationType';
import type { ReStruct } from '../../render';

export class CalcImplicitH extends BaseOperation {
  readonly atomIds: Array<number>;

  constructor(aids: Array<number>) {
    super(OperationType.CALC_IMPLICIT_H, OperationPriority.CALC_IMPLICIT_H);
    this.atomIds = aids;
  }

  execute(restruct: ReStruct) {
    const aIds = this.atomIds;

    restruct.molecule.setImplicitHydrogen(aIds);
  }

  isDummy(restruct?: ReStruct): boolean {
    if (!restruct) {
      return false;
    }

    const atomIds = Array.from(new Set(this.atomIds));
    if (atomIds.length === 0) {
      return true;
    }

    const { molecule } = restruct;
    const beforeState = new Map<
      number,
      { implicitH: number; badConn: boolean; hasImplicitH?: boolean }
    >();

    atomIds.forEach((atomId) => {
      const atom = molecule.atoms.get(atomId);
      if (!atom) {
        return;
      }

      beforeState.set(atomId, {
        implicitH: atom.implicitH,
        badConn: atom.badConn,
        hasImplicitH: atom.hasImplicitH,
      });
    });

    if (beforeState.size === 0) {
      return true;
    }

    const aidMap = new Map<number, number>();
    const moleculeClone = molecule.clone(null, null, false, aidMap);
    const mappedAtomIds = atomIds
      .map((atomId) => aidMap.get(atomId))
      .filter((atomId): atomId is number => atomId !== undefined);

    moleculeClone.setImplicitHydrogen(mappedAtomIds);

    for (const [atomId, state] of beforeState.entries()) {
      const mappedAtomId = aidMap.get(atomId);
      if (mappedAtomId === undefined) {
        continue;
      }

      const clonedAtom = moleculeClone.atoms.get(mappedAtomId);
      if (!clonedAtom) {
        continue;
      }

      if (
        clonedAtom.implicitH !== state.implicitH ||
        clonedAtom.badConn !== state.badConn ||
        clonedAtom.hasImplicitH !== state.hasImplicitH
      ) {
        return false;
      }
    }

    return true;
  }

  invert() {
    return new CalcImplicitH(this.atomIds);
  }
}
