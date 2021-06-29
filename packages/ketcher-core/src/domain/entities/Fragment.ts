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

import { Bond } from './Bond'
import { StereoLabel } from './Atom'
import { Struct } from './Struct'
import { Vec2 } from 'utils'

export enum StereoFlag {
  Mixed = 'MIXED',
  Abs = 'ABS',
  And = 'AND',
  Or = 'OR'
}

function calcStereoFlag(
  struct: Struct,
  stereoAids: Array<number>
): StereoFlag | undefined {
  if (!stereoAids || stereoAids.length === 0) return undefined
  const filteredStereoAtoms = stereoAids
    .map(aid => struct.atoms.get(aid))
    .filter(atom => atom?.stereoLabel)
  if (!filteredStereoAtoms.length) return undefined

  const atom = filteredStereoAtoms[0]!
  const stereoLabel = atom.stereoLabel! // {string | null} "<abs|and|or>-<group>"

  const hasAnotherLabel = filteredStereoAtoms.some(
    atom => atom?.stereoLabel !== stereoLabel
  )

  let stereoFlag: StereoFlag
  if (hasAnotherLabel) {
    stereoFlag = StereoFlag.Mixed
  } else {
    const label = stereoLabel.match(/\D+/g)?.[0]
    switch (label) {
      case StereoLabel.Abs: {
        stereoFlag = StereoFlag.Abs
        break
      }
      case StereoLabel.And: {
        stereoFlag = StereoFlag.And
        break
      }
      case StereoLabel.Or: {
        stereoFlag = StereoFlag.Or
        break
      }
      default: {
        throw new Error(`Unsupported stereo label: ${label}.`)
      }
    }
  }
  return stereoFlag
}

export class Fragment {
  #enhancedStereoFlag?: StereoFlag
  stereoFlagPosition?: Vec2
  stereoAtoms: Array<number> = []

  get enhancedStereoFlag() {
    return this.#enhancedStereoFlag
  }

  constructor(stereoFlagPosition?: Vec2) {
    this.stereoFlagPosition = stereoFlagPosition
  }

  static getDefaultStereoFlagPosition(
    struct: Struct,
    fragmentId: number
  ): Vec2 | undefined {
    const fragment = struct.getFragment(fragmentId)
    if (!fragment) return undefined
    const bb = fragment.getCoordBoundingBox()
    return new Vec2(bb.max.x, bb.min.y - 1)
  }

  clone(aidMap: Map<number, number>) {
    const fr = new Fragment(this.stereoFlagPosition)
    fr.stereoAtoms = this.stereoAtoms.map(aid => aidMap.get(aid)!)
    fr.#enhancedStereoFlag = this.#enhancedStereoFlag
    return fr
  }

  updateStereoFlag(struct: Struct) {
    this.#enhancedStereoFlag = calcStereoFlag(struct, this.stereoAtoms)
    return this.#enhancedStereoFlag
  }

  //TODO: split to 'add' and 'remove methods
  updateStereoAtom(struct: Struct, aid: number, isAdd: boolean) {
    if (isAdd && !this.stereoAtoms.includes(aid)) this.stereoAtoms.push(aid)
    if (
      !isAdd &&
      !Array.from(struct.bonds.values())
        .filter(bond => bond.stereo && bond.type !== Bond.PATTERN.TYPE.DOUBLE)
        .some(bond => bond.begin === aid)
    ) {
      this.stereoAtoms = this.stereoAtoms.filter(item => item !== aid)
    }

    this.#enhancedStereoFlag = calcStereoFlag(struct, this.stereoAtoms)
  }
}
