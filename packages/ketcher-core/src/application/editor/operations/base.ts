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

// todo: rename file in another PR
import { ReStruct, StereLabelStyleType } from '../../render';

import { OperationType } from './OperationType';

type ValueOf<TObject extends object> = Readonly<TObject[keyof TObject]>;
type OperationType = ValueOf<typeof OperationType>;

class BaseOperation {
  // eslint-disable-next-line no-use-before-define
  private _inverted: BaseOperation | undefined;
  type: OperationType;
  priority: number;
  data: any;

  constructor(type: OperationType, priority = 0) {
    this.type = type;
    this.priority = priority;
  }

  execute(_restruct: ReStruct): void {
    throw new Error('Operation.execute() is not implemented');
  }

  perform(restruct: ReStruct): BaseOperation {
    this.execute(restruct);
    if (!this._inverted) {
      this._inverted = this.invert();
      this._inverted._inverted = this;
    }
    return this._inverted;
  }

  invert(): BaseOperation {
    throw new Error('Operation.invert() is not implemented');
  }

  isDummy(_restruct: ReStruct): boolean {
    return false;
  }

  protected static invalidateAtom(restruct: ReStruct, atomId: number, level?) {
    const atom = restruct.atoms.get(atomId);
    if (!atom) {
      return;
    }

    restruct.markAtom(atomId, level ? 1 : 0);

    const halfBonds = restruct.molecule.halfBonds;

    atom.a.neighbors.forEach((halfBondId) => {
      if (!halfBonds.has(halfBondId)) {
        return;
      }

      const halfBond = halfBonds.get(halfBondId);
      if (!halfBond) {
        return;
      }

      restruct.markBond(halfBond.bid, 1);
      restruct.markAtom(halfBond.end, 0);

      if (level) {
        BaseOperation.invalidateLoop(restruct, halfBond.bid);
      }
    });

    const fragment = atom.a.fragment;
    const stereoLabelStyle = restruct.render.options.stereoLabelStyle;

    restruct.atoms.forEach((atom, atomId) => {
      if (
        stereoLabelStyle === StereLabelStyleType.IUPAC ||
        stereoLabelStyle === StereLabelStyleType.Classic
      ) {
        if (atom.a.fragment === fragment) restruct.markAtom(atomId, 0);
      }
    });
  }

  protected static invalidateLoop(restruct: ReStruct, bondId: number) {
    const bond = restruct.bonds.get(bondId);
    if (!bond || !bond.b.hb1 || !bond.b.hb2) {
      return;
    }

    const halfBond1 = restruct.molecule.halfBonds.get(bond.b.hb1);
    const halfBond2 = restruct.molecule.halfBonds.get(bond.b.hb2);

    if (halfBond1 && halfBond1.loop >= 0) {
      restruct.loopRemove(halfBond1.loop);
    }

    if (halfBond2 && halfBond2.loop >= 0) {
      restruct.loopRemove(halfBond2.loop);
    }
  }

  protected static invalidateBond(restruct: ReStruct, bondId: number) {
    BaseOperation.invalidateLoop(restruct, bondId);

    const bond = restruct.bonds.get(bondId);
    if (!bond) {
      return;
    }
    BaseOperation.invalidateAtom(restruct, bond.b.begin, 0);
    BaseOperation.invalidateAtom(restruct, bond.b.end, 0);
  }

  protected static invalidateItem(
    restruct: ReStruct,
    map,
    id: number,
    level?: any,
  ) {
    if (map === 'atoms') {
      BaseOperation.invalidateAtom(restruct, id, level);
      return;
    }

    if (map === 'bonds') {
      BaseOperation.invalidateBond(restruct, id);

      if (level > 0) {
        BaseOperation.invalidateLoop(restruct, id);
      }
      return;
    }

    restruct.markItem(map, id, level);
  }

  protected static invalidateEnhancedFlag(
    restruct: ReStruct,
    fragmentId: number,
  ) {
    BaseOperation.invalidateItem(restruct, 'enhancedFlags', fragmentId, 1);
  }
}

export { BaseOperation };
export default BaseOperation;
