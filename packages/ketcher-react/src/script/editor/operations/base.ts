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
import Restruct from '../../render/restruct'
import { OperationType } from './OperationType'

type ValueOf<TObject extends object> = Readonly<TObject[keyof TObject]>
type OperationType = ValueOf<typeof OperationType>

class BaseOperation {
  private _inverted: BaseOperation | undefined
  type: OperationType

  constructor(type: OperationType) {
    this.type = type
  }

  // @ts-ignore
  execute(restruct: Restruct): void {
    throw new Error('Operation.execute() is not implemented')
  }

  perform(restruct: Restruct): BaseOperation {
    this.execute(restruct)
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
  isDummy(restruct: Restruct): boolean {
    return false
  }

  protected static invalidateAtom(restruct: Restruct, atomId: number, level?) {
    const atom = restruct.atoms.get(atomId)
    if (!atom) {
      return
    }

    restruct.markAtom(atomId, level ? 1 : 0)

    const halfBonds = restruct.molecule.halfBonds

    atom.a.neighbors.forEach(halfBondId => {
      if (!halfBonds.has(halfBondId)) {
        return
      }

      const halfBond = halfBonds.get(halfBondId)
      if (!halfBond) {
        return
      }

      restruct.markBond(halfBond.bid, 1)
      restruct.markAtom(halfBond.end, 0)

      if (level) {
        BaseOperation.invalidateLoop(restruct, halfBond.bid)
      }
    })
  }

  protected static invalidateLoop(restruct: Restruct, bondId: number) {
    const bond = restruct.bonds.get(bondId)
    if (!bond) {
      return
    }

    const halfBond1 = restruct.molecule.halfBonds.get(bond.b.hb1)
    const halfBond2 = restruct.molecule.halfBonds.get(bond.b.hb2)

    if (halfBond1 && halfBond1.loop >= 0) {
      restruct.loopRemove(halfBond1.loop)
    }

    if (halfBond2 && halfBond2.loop >= 0) {
      restruct.loopRemove(halfBond2.loop)
    }
  }

  protected static invalidateBond(restruct: Restruct, bondId: number) {
    BaseOperation.invalidateLoop(restruct, bondId)

    const bond = restruct.bonds.get(bondId)
    if (!bond) {
      return
    }
    BaseOperation.invalidateAtom(restruct, bond.b.begin, 0)
    BaseOperation.invalidateAtom(restruct, bond.b.end, 0)
  }

  protected static invalidateItem(restruct: Restruct, map, id: number, level?) {
    if (map === 'atoms') {
      BaseOperation.invalidateAtom(restruct, id, level)
      return
    }

    if (map === 'bonds') {
      BaseOperation.invalidateBond(restruct, id)

      if (level > 0) {
        BaseOperation.invalidateLoop(restruct, id)
      }
      return
    }

    restruct.markItem(map, id, level)
  }

  protected static invalidateEnhancedFlag(
    restruct: Restruct,
    fragmentId: any,
    flag: any
  ) {
    const reEnhancedFlag = restruct.enhancedFlags.get(fragmentId)
    if (reEnhancedFlag.flag === flag) {
      return
    }

    reEnhancedFlag.flag = flag
    BaseOperation.invalidateItem(restruct, 'enhancedFlags', fragmentId, 1)
  }
}

export { BaseOperation }
export default BaseOperation
