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

// todo: rename file in another PR
import { ReStruct, StereLabelStyleType } from 'ketcher-core'

import { OperationType } from './OperationType'

type ValueOf<TObject extends object> = Readonly<TObject[keyof TObject]>
type OperationType = ValueOf<typeof OperationType>

class BaseOperation {
  private _inverted: BaseOperation | undefined
  type: OperationType
  priority: number

  constructor(type: OperationType, priority = 0) {
    this.type = type
    this.priority = priority
  }

  // @ts-ignore
  execute(ReStruct: ReStruct): void {
    throw new Error('Operation.execute() is not implemented')
  }

  perform(ReStruct: ReStruct): BaseOperation {
    this.execute(ReStruct)
    if (!this._inverted) {
      this._inverted = this.invert()
      this._inverted._inverted = this
    }
    return this._inverted
  }

  invert(): BaseOperation {
    throw new Error('Operation.invert() is not implemented')
  }

  // @ts-ignore
  isDummy(ReStruct: ReStruct): boolean {
    return false
  }

  protected static invalidateAtom(ReStruct: ReStruct, atomId: number, level?) {
    const atom = ReStruct.atoms.get(atomId)
    if (!atom) {
      return
    }

    ReStruct.markAtom(atomId, level ? 1 : 0)

    const halfBonds = ReStruct.molecule.halfBonds

    atom.a.neighbors.forEach(halfBondId => {
      if (!halfBonds.has(halfBondId)) {
        return
      }

      const halfBond = halfBonds.get(halfBondId)
      if (!halfBond) {
        return
      }

      ReStruct.markBond(halfBond.bid, 1)
      ReStruct.markAtom(halfBond.end, 0)

      if (level) {
        BaseOperation.invalidateLoop(ReStruct, halfBond.bid)
      }
    })

    const fragment = atom.a.fragment
    const stereoLabelStyle = ReStruct.render.options.stereoLabelStyle

    ReStruct.atoms.forEach((atom, atomId) => {
      if (
        stereoLabelStyle === StereLabelStyleType.IUPAC ||
        stereoLabelStyle === StereLabelStyleType.Classic
      ) {
        if (atom.a.fragment === fragment) ReStruct.markAtom(atomId, 0)
      }
    })
  }

  protected static invalidateLoop(ReStruct: ReStruct, bondId: number) {
    const bond = ReStruct.bonds.get(bondId)
    if (!bond || !bond.b.hb1 || !bond.b.hb2) {
      return
    }

    const halfBond1 = ReStruct.molecule.halfBonds.get(bond.b.hb1)
    const halfBond2 = ReStruct.molecule.halfBonds.get(bond.b.hb2)

    if (halfBond1 && halfBond1.loop >= 0) {
      ReStruct.loopRemove(halfBond1.loop)
    }

    if (halfBond2 && halfBond2.loop >= 0) {
      ReStruct.loopRemove(halfBond2.loop)
    }
  }

  protected static invalidateBond(ReStruct: ReStruct, bondId: number) {
    BaseOperation.invalidateLoop(ReStruct, bondId)

    const bond = ReStruct.bonds.get(bondId)
    if (!bond) {
      return
    }
    BaseOperation.invalidateAtom(ReStruct, bond.b.begin, 0)
    BaseOperation.invalidateAtom(ReStruct, bond.b.end, 0)
  }

  protected static invalidateItem(
    ReStruct: ReStruct,
    map,
    id: number,
    level?: any
  ) {
    if (map === 'atoms') {
      BaseOperation.invalidateAtom(ReStruct, id, level)
      return
    }

    if (map === 'bonds') {
      BaseOperation.invalidateBond(ReStruct, id)

      if (level > 0) {
        BaseOperation.invalidateLoop(ReStruct, id)
      }
      return
    }

    ReStruct.markItem(map, id, level)
  }

  protected static invalidateEnhancedFlag(
    ReStruct: ReStruct,
    fragmentId: number
  ) {
    BaseOperation.invalidateItem(ReStruct, 'enhancedFlags', fragmentId, 1)
  }
}

export { BaseOperation }
export default BaseOperation
