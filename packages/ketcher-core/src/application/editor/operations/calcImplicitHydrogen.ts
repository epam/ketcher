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

import { BaseOperation } from './base'
import { OperationType } from './OperationType'
import { ReStruct } from '../../render'

export class CalcImplicitHydrogen extends BaseOperation {
  atomIds: Array<number>

  constructor(aids: Array<number>) {
    super(OperationType.CALC_IMPLICIT_H, 10)
    this.atomIds = aids
  }

  execute(restruct: ReStruct) {
    const aIds = this.atomIds

    restruct.molecule.setImplicitHydrogen(aIds)
  }

  invert() {
    return new CalcImplicitHydrogen(this.atomIds)
  }
}
