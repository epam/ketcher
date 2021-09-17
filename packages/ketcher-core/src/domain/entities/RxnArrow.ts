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

import { Vec2 } from './Vec2'

export enum RxnArrowMode {
  OpenAngle = 'open-angle',
  FilledTriangle = 'filled-triangle',
  FilledBow = 'filled-bow',
  DashedOpenAngle = 'dashed-open-angle',
  Failed = 'failed',
  BothEndsFilledTriangle = 'both-ends-filled-triangle',
  EquilibriumFilledTriangle = 'equilibrium-filled-triangle',
  EquilibriumFilledHalfBow = 'equilibrium-filled-half-bow',
  EquilibriumOpenAngle = 'equilibrium-open-angle',
  UnbalancedEquilibriumFilledHalfBow = 'unbalanced-equilibrium-filled-half-bow',
  UnbalancedEquilibriumOpenHalfAngle = 'unbalanced-equilibrium-open-half-angle',
  UnbalancedEquilibriumLargeFilledHalfBow = 'unbalanced-equilibrium-large-filled-half-bow',
  UnbalancedEquilibriumFilleHalfTriangle = 'unbalanced-equilibrium-fille-half-triangle'
}

export interface RxnArrowParams {
  mode: RxnArrowMode
  pos?: Array<Vec2>
}

export class RxnArrow {
  mode: RxnArrowMode
  pos: Array<Vec2>

  constructor(params: RxnArrowParams) {
    params = params || {}
    this.pos = []

    if (params.pos) {
      for (let i = 0; i < params.pos.length; i++) {
        const currentP = params.pos[i]
        this.pos[i] = currentP ? new Vec2(params.pos[i]) : new Vec2()
      }
    }

    this.mode = params.mode
  }

  clone() {
    return new RxnArrow(this)
  }

  center(): Vec2 {
    return Vec2.centre(this.pos[0], this.pos[1])
  }
}
