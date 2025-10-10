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

type RotateMonomerData = {
  id: number;
  value: number | null;
};

export class RotateMonomerOperation extends BaseOperation {
  private previousValue: number | null = null;

  constructor(public data: RotateMonomerData) {
    super(OperationType.ROTATE_MONOMER);
  }

  execute(restruct: ReStruct) {
    const monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
    if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
      return;
    }

    const monomerTransformation =
      (monomerSGroup.monomer.monomerItem.transformation ||= {});
    this.previousValue = monomerTransformation.rotate ?? 0;

    if (this.data.value === null) {
      delete monomerTransformation.rotate;
      return;
    }

    const newRotation = this.previousValue + this.data.value;
    const normalizedRotation =
      ((newRotation + Math.PI) % (2 * Math.PI)) - Math.PI;

    monomerTransformation.rotate = normalizedRotation;
  }

  invert() {
    return new RotateMonomerOperation({
      id: this.data.id,
      value: this.previousValue,
    });
  }
}
