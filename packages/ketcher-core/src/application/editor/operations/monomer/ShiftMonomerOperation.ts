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

import BaseOperation from 'application/editor/operations/base';
import { OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { MonomerMicromolecule } from 'domain/entities';

type ShiftMonomerData = {
  id: number;
  value: Partial<{
    x: number;
    y: number;
  }> | null;
};

export class ShiftMonomerOperation extends BaseOperation {
  private previousValue: Partial<{ x: number; y: number }> | null = null;

  constructor(public data: ShiftMonomerData) {
    super(OperationType.SHIFT_MONOMER);
  }

  execute(restruct: ReStruct) {
    const monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
    if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
      return;
    }

    const monomerTransformation =
      (monomerSGroup.monomer.monomerItem.transformation ||= {});
    this.previousValue = monomerTransformation.shift ?? null;

    if (this.data.value === null) {
      delete monomerTransformation.shift;
      return;
    }

    if (this.data.value) {
      monomerTransformation.shift = {
        x: (this.previousValue?.x ?? 0) + (this.data.value.x ?? 0),
        y: (this.previousValue?.y ?? 0) + (this.data.value.y ?? 0),
      };
    }
  }

  invert() {
    return new ShiftMonomerOperation({
      id: this.data.id,
      value: this.previousValue,
    });
  }
}
