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
import { Vec2 } from 'ketcher-core'
import Restruct from '../../render/restruct'
import { BaseOperation } from './base'
import { OperationType } from './OperationType'

export class EnhancedFlagMove extends BaseOperation {
  data: {
    frid: any
    p: any
  }

  constructor(fragmentId?: any, p?: any) {
    super(OperationType.ENHANCED_FLAG_MOVE)
    this.data = { frid: fragmentId, p }
  }

  execute(restruct: Restruct) {
    const { frid } = this.data

    if (!this.data.p) {
      const bb = restruct.molecule.getFragment(frid).getCoordBoundingBox()
      this.data.p = new Vec2(bb.max.x, bb.min.y - 1)
    }

    const { p } = this.data

    const enhancedFlag = restruct.enhancedFlags.get(frid)
    if (enhancedFlag?.pp) {
      enhancedFlag.pp.add_(p)
    }

    this.data.p = p.negated()
    BaseOperation.invalidateItem(restruct, 'enhancedFlags', frid, 1)
  }

  invert() {
    const inverted = new EnhancedFlagMove()
    inverted.data = this.data
    return inverted
  }
}
