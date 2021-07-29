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

export class RxnArrow {
  pp: Vec2
  mode: RxnArrowMode

  constructor(pp: Vec2, mode: RxnArrowMode = RxnArrowMode.OpenAngle) {
    this.pp = pp
    this.mode = mode
  }

  clone() {
    return new RxnArrow(this.pp, this.mode)
  }
}
