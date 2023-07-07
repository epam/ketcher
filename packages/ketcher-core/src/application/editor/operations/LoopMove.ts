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
import { Scale } from 'domain/helpers';

export class LoopMove extends BaseOperation {
  data: {
    id: any;
    d: any;
  };

  constructor(id?: any, d?: any) {
    super(OperationType.LOOP_MOVE);
    this.data = { id, d };
  }

  execute(restruct: ReStruct) {
    // not sure if there should be an action to move a loop in the first place
    // but we have to somehow move the aromatic ring,
    // which is associated with the loop, rather than with any of the bonds
    const { id, d } = this.data;
    const reloop = restruct.reloops.get(id);

    if (reloop && reloop.visel) {
      const scaled = Scale.obj2scaled(d, restruct.render.options);
      reloop.visel.translate(scaled);
    }
    this.data.d = d.negated();
  }

  invert() {
    const inverted = new LoopMove();
    inverted.data = this.data;
    return inverted;
  }
}
