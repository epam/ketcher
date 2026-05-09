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
import { OperationType } from './OperationType';
import { ReStruct } from '../../render';
import { SGroup, Vec2 } from 'domain/entities';

class AlignDescriptors extends BaseOperation {
  readonly history: Record<number, Vec2 | null>;
  static InverseConstructor: new (
    history: Record<number, Vec2 | null>,
  ) => BaseOperation;

  constructor() {
    super(OperationType.ALIGN_DESCRIPTORS);
    this.history = {};
  }

  execute(restruct: ReStruct) {
    const struct = restruct.molecule;
    const sgroups: SGroup[] = Array.from(struct.sgroups.values()).reverse();

    const structBox = struct.getCoordBoundingBoxObj();
    if (!structBox) return;

    let alignPoint = new Vec2(structBox.max.x, structBox.min.y).add(
      new Vec2(2.0, -1.0),
    );

    sgroups.forEach((sgroup) => {
      this.history[sgroup.id] = sgroup.pp ? new Vec2(sgroup.pp) : null;
      alignPoint = alignPoint.add(new Vec2(0.0, 0.5));
      sgroup.pp = alignPoint;
      struct.sgroups.set(sgroup.id, sgroup);
      BaseOperation.invalidateItem(restruct, 'sgroupData', sgroup.id, 1);
    });
  }

  invert() {
    return new AlignDescriptors.InverseConstructor(this.history);
  }
}

export { AlignDescriptors };
