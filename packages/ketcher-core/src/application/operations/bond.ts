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

import { AttrValueType, PerformOperationResult } from './operations.types'
import { Bond, BondAttributes, Struct, Vec2 } from 'domain/entities'

import { BaseOperation } from './baseOperation'
import assert from 'assert'

export class AddBond extends BaseOperation {
  #bondAttributes: BondAttributes
  #bondId?: number

  constructor(bondAttributes: BondAttributes, bondId?: number) {
    assert(bondAttributes != null)
    assert(
      bondAttributes.begin !== bondAttributes.end,
      'Distinct atoms expected'
    )

    super('BOND_ADD', 1)

    this.#bondAttributes = bondAttributes
    this.#bondId = bondId
  }

  execute(struct: Struct): PerformOperationResult {
    // BaseOperation.invalidateAtom(restruct, begin, 1)
    // BaseOperation.invalidateAtom(restruct, end, 1)

    const bond = new Bond({
      ...{ type: Bond.PATTERN.TYPE.SINGLE },
      ...this.#bondAttributes
    })

    let bondId: number
    if (typeof this.#bondId === 'number') {
      struct.bonds.set(this.#bondId, bond)
      bondId = this.#bondId
    } else {
      bondId = struct.bonds.add(bond)
    }

    const structBond = struct.bonds.get(bondId)!

    struct.bondInitHalfBonds(bondId)
    struct.atomAddNeighbor(structBond.hb1)
    struct.atomAddNeighbor(structBond.hb2)

    // TODO: move to renderer
    // notifyBondAdded
    // restruct.bonds.set(bid, new ReBond(structBond))
    // restruct.markBond(bid, 1)

    const inverseOperation = new DeleteBond(bondId)

    return { inverseOperation, entityId: bondId, operationType: this.type }
  }
}

export class DeleteBond extends BaseOperation {
  #bondId: number

  constructor(bondId: number) {
    super('BOND_DELETE', 3)

    this.#bondId = bondId
  }

  execute(struct: Struct): PerformOperationResult {
    const bond = struct.bonds.get(this.#bondId)!
    // BaseOperation.invalidateBond(restruct, bid)

    // TODO: move to renderer
    // notifyBondRemoved
    // const rebond = restruct.bonds.get(bid)
    // if (!rebond) return
    // ;[rebond.b.hb1, rebond.b.hb2].forEach(hbid => {
    //   if (hbid === undefined) return
    //   const halfBond = restruct.molecule.halfBonds.get(hbid)
    //   if (halfBond && halfBond.loop >= 0) {
    //     restruct.loopRemove(halfBond.loop)
    //   }
    // }, restruct)
    // restruct.clearVisel(rebond.visel)
    // restruct.bonds.delete(bid)
    // restruct.markItemRemoved()

    const halfBonds = [bond.hb1!, bond.hb2!]
    halfBonds.forEach((hbid: number) => {
      const halfBond = struct.halfBonds.get(hbid!)
      if (!halfBond) {
        return
      }

      const atom = struct.atoms.get(halfBond.begin)!
      const pos = atom.neighbors.indexOf(hbid!)
      const prev = (pos + atom.neighbors.length - 1) % atom.neighbors.length
      const next = (pos + 1) % atom.neighbors.length
      struct.setHbNext(atom.neighbors[prev], atom.neighbors[next])
      atom.neighbors.splice(pos, 1)
    })
    struct.halfBonds.delete(bond.hb1!)
    struct.halfBonds.delete(bond.hb2!)

    struct.bonds.delete(this.#bondId)

    const inverseOperation = new AddBond(bond, this.#bondId)

    return {
      inverseOperation,
      entityId: this.#bondId,
      operationType: this.type
    }
  }
}

export class MoveBond extends BaseOperation {
  #bondId: number
  #delta: Vec2

  constructor(bondId: number, delta: Vec2) {
    super('BOND_MOVE', 2)

    this.#bondId = bondId
    this.#delta = delta
  }

  execute(_struct: Struct): PerformOperationResult {
    // TODO: move to renderer
    // const bond = restruct.bonds.get(bid)
    // const scaled = Scale.increaseBy(d, restruct.render.options)
    // bond.visel.translate(scaled)

    const inverseOperation = new MoveBond(this.#bondId, this.#delta.negated())

    return {
      inverseOperation,
      entityId: this.#bondId,
      operationType: this.type
    }
  }
}

export class SetBondAttr extends BaseOperation {
  #bondId: number
  #attribute: string
  #value: AttrValueType

  constructor(bondId: number, attribute: string, value: AttrValueType) {
    super('BOND_ATTR', 2)

    this.#bondId = bondId
    this.#attribute = attribute
    this.#value = value
  }

  execute(struct: Struct): PerformOperationResult {
    const bond = struct.bonds.get(this.#bondId)!
    const previousValue = bond[this.#attribute]

    bond[this.#attribute] = this.#value

    const inverseOperation = new SetBondAttr(
      this.#bondId,
      this.#attribute,
      previousValue
    )

    return {
      inverseOperation,
      entityId: this.#bondId,
      operationType: this.type
    }

    // BaseOperation.invalidateBond(restruct, bid)
    // if (attribute === 'type') {
    //   BaseOperation.invalidateLoop(restruct, bid)
    // }
  }
}
