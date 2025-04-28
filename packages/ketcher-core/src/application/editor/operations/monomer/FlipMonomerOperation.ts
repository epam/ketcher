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
import { FlipDirection, OperationType } from 'application/editor';
import { ReStruct } from 'application/render';
import { MonomerMicromolecule } from 'domain/entities';

type FlipMonomerData = {
  id: number;
  value: FlipDirection | null;
  rotate?: number;
};

export class FlipMonomerOperation extends BaseOperation {
  private previousValue: FlipDirection | null = null;
  private previousRotate: number | undefined;

  constructor(public data: FlipMonomerData) {
    super(OperationType.FLIP_MONOMER);
  }

  execute(_restruct: ReStruct) {
    const monomerSGroup = _restruct.molecule.sgroups.get(this.data.id);
    if (!monomerSGroup || !(monomerSGroup instanceof MonomerMicromolecule)) {
      return;
    }

    const monomerTransformation =
      (monomerSGroup.monomer.monomerItem.transformation ||= {});
    this.previousValue = monomerTransformation.flip ?? null;
    this.previousRotate = monomerTransformation.rotate;

    if (this.data.value === null) {
      delete monomerTransformation.flip;
      return;
    }

    const previousFlip = monomerTransformation.flip;
    const newFlip = this.data.value;

    // If two different flips are applied, nullify flip transformation and apply rotation by 180 degrees instead
    if (previousFlip && previousFlip !== newFlip) {
      monomerTransformation.rotate = (this.previousRotate ?? 0) + Math.PI;
      delete monomerTransformation.flip;
      return;
    }

    monomerTransformation.flip = this.data.value;
    if (this.data.rotate) {
      monomerTransformation.rotate =
        (this.previousRotate ?? 0) + this.data.rotate;
    }
  }

  invert() {
    return new FlipMonomerOperation({
      id: this.data.id,
      value: this.previousValue,
      rotate: this.previousRotate ? -this.previousRotate : undefined,
    });
  }
}
