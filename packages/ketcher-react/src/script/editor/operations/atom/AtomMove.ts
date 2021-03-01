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
import Restruct from '../../../render/restruct'
import { scale } from 'ketcher-core'
import { BaseOperation } from '../base'
import { OperationType } from '../OperationType'

export class AtomMove extends BaseOperation {
  data: {
    aid: any
    d: any
    noinvalidate: any
  }

  constructor(atomId?: any, d?: any, noinvalidate?: any) {
    super(OperationType.ATOM_MOVE)
    this.data = { aid: atomId, d, noinvalidate }
  }

  execute(restruct: Restruct) {
    const struct = restruct.molecule
    const { aid, d } = this.data

    struct.atoms.get(aid)!.pp.add_(d) // eslint-disable-line no-underscore-dangle
    const atom = restruct.atoms.get(aid)
    if (atom) {
      const scaled = scale.obj2scaled(d, restruct.render.options)
      atom.visel.translate(scaled)
    }

    this.data.d = d.negated()

    if (!this.data.noinvalidate) {
      BaseOperation.invalidateAtom(restruct, aid, 1)
    }
  }

  invert() {
    const inverted = new AtomMove()
    inverted.data = this.data
    return inverted
  }

  isDummy() {
    const { d } = this.data
    return d.x === 0 && d.y === 0
  }
}
