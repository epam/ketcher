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
import { RxnArrow, RxnArrowMode, Vec2 } from 'ketcher-core'
import Restruct, { ReRxnArrow } from '../../../render/restruct'
import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

// todo: separate classes: now here is circular dependency in `invert` method

type Data = {
  pos: any
  arid: any
  mode: RxnArrowMode
}

class RxnArrowAdd extends BaseOperation {
  data: Data

  constructor(mode: RxnArrowMode, pos: any, arid = null) {
    super(OperationType.RXN_ARROW_ADD)
    this.data = { pos, arid, mode }
  }

  execute(restruct: Restruct) {
    const struct = restruct.molecule

    if (typeof this.data.arid === 'number') {
      struct.rxnArrows.set(
        this.data.arid,
        new RxnArrow(new Vec2(), this.data.mode)
      )
    } else {
      this.data.arid = struct.rxnArrows.add(
        new RxnArrow(new Vec2(), this.data.mode)
      )
    }

    const { pos, arid } = this.data

    const rxn = struct.rxnArrows.get(arid)!
    // notifyRxnArrowAdded
    restruct.rxnArrows.set(arid, new ReRxnArrow(rxn))

    struct.rxnArrowSetPos(arid, new Vec2(pos))

    const components = struct.getComponents()

    const reactants = components.reactants.reduce(
      (acc, item) => acc.concat(...item),
      [] as number[]
    )
    const products = components.products.reduce(
      (acc, item) => acc.concat(...item),
      [] as number[]
    )

    reactants.forEach(aid => {
      const atom = struct.atoms.get(aid)!
      atom.rxnFragmentType = 1
    })

    products.forEach(aid => {
      const atom = struct.atoms.get(aid)!
      atom.rxnFragmentType = 2
    })

    BaseOperation.invalidateItem(restruct, 'rxnArrows', this.data.arid, 1)
  }

  invert() {
    const inverted = new RxnArrowDelete()
    inverted.data = this.data
    return inverted
  }
}

class RxnArrowDelete extends BaseOperation {
  data: Data

  constructor(arid?: any) {
    super(OperationType.RXN_ARROW_DELETE)
    this.data = { arid, pos: null, mode: RxnArrowMode.simple }
  }

  execute(restruct: any) {
    const { arid } = this.data
    const struct = restruct.molecule

    if (!this.data.pos || !this.data.mode) {
      const arrow = struct.rxnArrows.get(arid)
      this.data.pos = arrow.pp
      this.data.mode = arrow.mode
    }

    // notifyRxnArrowRemoved
    restruct.markItemRemoved()
    const rxn = restruct.rxnArrows.get(arid)
    restruct.clearVisel(rxn.visel)
    restruct.rxnArrows.delete(arid)

    struct.rxnArrows.delete(arid)

    struct.atoms.forEach(atom => {
      atom.rxnFragmentType = -1
    })
  }

  invert() {
    return new RxnArrowAdd(this.data.mode, this.data.pos, this.data.arid)
  }
}

export { RxnArrowAdd, RxnArrowDelete }
export * from './RxnArrowMove'
export * from './plus'
