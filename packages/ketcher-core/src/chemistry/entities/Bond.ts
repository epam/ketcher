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
import { Vec2 } from 'utils'

export interface BondParams {
  reactingCenterStatus?: number
  topology?: number
  stereo?: number
  xxx?: string
  type: number
  end: number
  begin: number
}

export class Bond {
  static PATTERN = {
    TYPE: {
      SINGLE: 1,
      DOUBLE: 2,
      TRIPLE: 3,
      AROMATIC: 4,
      SINGLE_OR_DOUBLE: 5,
      SINGLE_OR_AROMATIC: 6,
      DOUBLE_OR_AROMATIC: 7,
      ANY: 8
    },

    STEREO: {
      NONE: 0,
      UP: 1,
      EITHER: 4,
      DOWN: 6,
      CIS_TRANS: 3
    },

    // STEREO:
    // {
    // 	NONE: 0,
    // 	UP: 1,
    // 	EITHER: 2,
    // 	DOWN: 3
    // },

    TOPOLOGY: {
      EITHER: 0,
      RING: 1,
      CHAIN: 2
    },

    REACTING_CENTER: {
      NOT_CENTER: -1,
      UNMARKED: 0,
      CENTER: 1,
      UNCHANGED: 2,
      MADE_OR_BROKEN: 4,
      ORDER_CHANGED: 8,
      MADE_OR_BROKEN_AND_CHANGED: 12
    }
  }

  static attrlist = {
    type: Bond.PATTERN.TYPE.SINGLE,
    stereo: Bond.PATTERN.STEREO.NONE,
    topology: Bond.PATTERN.TOPOLOGY.EITHER,
    reactingCenterStatus: Bond.PATTERN.REACTING_CENTER.UNMARKED
  }

  begin: number
  end: number
  readonly type: number
  readonly xxx: string
  readonly stereo: number
  readonly topology: number
  readonly reactingCenterStatus: number
  readonly len: number
  readonly sb: number
  readonly sa: number
  hb1?: number
  hb2?: number
  angle: number
  center: Vec2

  constructor(params: BondParams) {
    this.begin = params.begin
    this.end = params.end
    this.type = params.type
    this.xxx = params.xxx || ''
    this.stereo = Bond.PATTERN.STEREO.NONE
    this.topology = Bond.PATTERN.TOPOLOGY.EITHER
    this.reactingCenterStatus = 0
    this.len = 0
    this.sb = 0
    this.sa = 0
    this.angle = 0

    if (params.stereo) this.stereo = params.stereo
    if (params.topology) this.topology = params.topology
    if (params.reactingCenterStatus)
      this.reactingCenterStatus = params.reactingCenterStatus

    this.center = new Vec2()
  }

  static getAttrHash(bond: Bond) {
    let attrs = {}
    for (let attr in Bond.attrlist) {
      if (bond[attr]) {
        attrs[attr] = bond[attr]
      }
    }
    return attrs
  }

  static attrGetDefault(attr: string) {
    if (attr in Bond.attrlist) {
      return Bond.attrlist[attr]
    }
  }

  hasRxnProps(): boolean {
    return !!this.reactingCenterStatus
  }

  getCenter(struct: any): Vec2 {
    const p1 = struct.atoms.get(this.begin).pp
    const p2 = struct.atoms.get(this.end).pp
    return Vec2.lc2(p1, 0.5, p2, 0.5)
  }

  getDir(struct: any): Vec2 {
    const p1 = struct.atoms.get(this.begin)!.pp
    const p2 = struct.atoms.get(this.end)!.pp
    return p2.sub(p1).normalized()
  }

  clone(aidMap?: Map<number, number> | null): Bond {
    const cp = new Bond(this)
    if (aidMap) {
      cp.begin = aidMap.get(cp.begin)!
      cp.end = aidMap.get(cp.end)!
    }
    return cp
  }
}
