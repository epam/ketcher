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

import { Fragment, Point, Struct, Vec2 } from 'domain/entities'

import { BaseOperation } from './baseOperation'
import { PerformOperationResult } from './operations.types'
import assert from 'assert'

class AddFragment extends BaseOperation {
  #fragmentId?: number
  #stereoAtoms: Array<number>
  #stereoFlagPosition?: Point

  constructor(
    stereoAtoms: Array<number> = [],
    stereoFlagPosition?: Point,
    fragmentId?: number
  ) {
    super('FRAGMENT_ADD')

    this.#fragmentId = fragmentId
    this.#stereoAtoms = stereoAtoms
    this.#stereoFlagPosition = stereoFlagPosition
  }

  execute(struct: Struct): PerformOperationResult {
    const fragment = new Fragment(this.#stereoAtoms, this.#stereoFlagPosition)

    let fragmentId: number
    if (typeof this.#fragmentId !== 'number') {
      fragmentId = struct.frags.add(fragment)
    } else {
      struct.frags.set(this.#fragmentId, fragment)
      fragmentId = this.#fragmentId
    }

    // TODO: move to renderer
    // restruct.frags.set(this.frid, new ReFrag(fragment)) // TODO add ReStruct.notifyFragmentAdded
    // restruct.enhancedFlags.set(this.frid, new ReEnhancedFlag())

    const inverseOperation = new DeleteFragment(fragmentId)

    return { inverseOperation, entityId: fragmentId, operationType: this.type }
  }
}

class DeleteFragment extends BaseOperation {
  #fragmentId: number

  constructor(fragmentId: number) {
    super('FRAGMENT_DELETE', 100)

    this.#fragmentId = fragmentId
  }

  execute(struct: Struct): PerformOperationResult {
    const fragment = struct.frags.get(this.#fragmentId)!
    // TODO: move to renderer
    // BaseOperation.invalidateItem(restruct, 'frags', this.frid, 1)
    // restruct.frags.delete(this.frid)

    struct.frags.delete(this.#fragmentId)

    // TODO: move to renderer
    // const enhancedFalg = restruct.enhancedFlags.get(this.frid)
    // if (!enhancedFalg) return
    // restruct.clearVisel(enhancedFalg.visel)
    // restruct.enhancedFlags.delete(this.frid)

    const inverseOperation = new AddFragment(
      fragment.stereoAtoms,
      fragment.stereoFlagPosition,
      this.#fragmentId
    )

    return {
      inverseOperation,
      entityId: this.#fragmentId,
      operationType: this.type
    }
  }
}

export class AddStereoAtom extends BaseOperation {
  #fragmentId: number
  #atomId: number

  constructor(fragmentId: number, atomId: number) {
    super('FRAGMENT_ADD_STEREO_ATOM', 100)

    this.#fragmentId = fragmentId
    this.#atomId = atomId
  }

  execute(struct: Struct): PerformOperationResult {
    const fragment = struct.frags.get(this.#fragmentId)!
    if (fragment.addStereoAtom(this.#atomId)) {
      fragment.updateStereoFlag(struct)
    }
    // BaseOperation.invalidateEnhancedFlag(restruct, frid)

    const inverseOperation = new DeleteStereoAtom(
      this.#fragmentId,
      this.#atomId
    )

    return {
      inverseOperation,
      entityId: this.#fragmentId,
      operationType: this.type
    }
  }
}

export class DeleteStereoAtom extends BaseOperation {
  #fragmentId: number
  #atomId: number

  constructor(fragmentId: number, atomId: number) {
    super('FRAGMENT_DELETE_STEREO_ATOM', 90)

    this.#fragmentId = fragmentId
    this.#atomId = atomId
  }

  execute(struct: Struct): PerformOperationResult {
    const fragment = struct.frags.get(this.#fragmentId)!
    if (fragment.deleteStereoAtom(struct, this.#fragmentId, this.#atomId)) {
      fragment.updateStereoFlag(struct)
    }

    // BaseOperation.invalidateEnhancedFlag(restruct, frid)
    const inverseOperation = new AddStereoAtom(this.#fragmentId, this.#atomId)

    return {
      inverseOperation,
      entityId: this.#fragmentId,
      operationType: this.type
    }
  }
}

export class UpdateStereoFlag extends BaseOperation {
  #fragmentId: number

  constructor(fragmentId: number) {
    super('FRAGMENT_UPDATE_STEREO_FLAG', 6)

    this.#fragmentId = fragmentId
  }

  execute(struct: Struct): PerformOperationResult {
    const fragment = struct.frags.get(this.#fragmentId)!
    fragment.updateStereoFlag(struct)

    // BaseOperation.invalidateEnhancedFlag(restruct, this.frid)

    const inverseOperation = new UpdateStereoFlag(this.#fragmentId)

    return {
      inverseOperation,
      entityId: this.#fragmentId,
      operationType: this.type
    }
  }
}

export class MoveStereoFlag extends BaseOperation {
  #fragmentId: number
  #delta: Vec2

  constructor(fragmentId: number, delta: Vec2) {
    assert(delta != null)

    super('FRAGMENT_MOVE_STEREO_FLAG')

    this.#fragmentId = fragmentId
    this.#delta = delta
  }

  execute(struct: Struct): PerformOperationResult {
    const fragment = struct.frags.get(this.#fragmentId)!

    const currentPosition = fragment.stereoFlagPosition
      ? new Vec2(fragment.stereoFlagPosition)
      : Fragment.getDefaultStereoFlagPosition(struct, this.#fragmentId)!

    const newPosition = Vec2.sum(currentPosition, this.#delta)
    fragment.stereoFlagPosition = newPosition

    // BaseOperation.invalidateItem(restruct, 'enhancedFlags', frid, 1)

    const inverseOperation = new MoveStereoFlag(
      this.#fragmentId,
      this.#delta.negated()
    )

    return {
      inverseOperation,
      entityId: this.#fragmentId,
      operationType: this.type
    }
  }
}
