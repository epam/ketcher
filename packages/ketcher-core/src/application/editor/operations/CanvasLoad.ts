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

import { BaseOperation } from './base';
import { OperationType } from './OperationType';
import { ReStruct } from '../../render';
import { Struct } from 'domain/entities';
import { KetcherLogger } from 'utilities';

export class CanvasLoad extends BaseOperation {
  data: {
    newStruct?: Struct;
    oldStruct?: Struct;
  };

  constructor(struct?: Struct) {
    super(OperationType.CANVAS_LOAD);
    this.data = { newStruct: struct };
  }

  execute(restruct: ReStruct) {
    KetcherLogger.log('CanvasLoad.execute(), start');
    restruct.clearVisels(); // TODO: What is it?
    this.data.oldStruct = restruct.molecule.clone();
    if (this.data.newStruct) {
      restruct.render.setMolecule(this.data.newStruct, true);
    }

    KetcherLogger.log('CanvasLoad.execute(), end');
  }

  invert() {
    const inverted = new CanvasLoad();
    inverted.data = {
      oldStruct: this.data.newStruct,
      newStruct: this.data.oldStruct,
    };
    return inverted;
  }
}
