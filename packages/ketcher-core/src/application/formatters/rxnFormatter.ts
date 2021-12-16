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

import { MolSerializer } from 'domain/serializers'
import { Struct } from 'domain/entities'
import { StructFormatter } from './structFormatter.types'

export class RxnFormatter implements StructFormatter {
  #molSerializer: MolSerializer

  constructor(molSerializer: MolSerializer) {
    this.#molSerializer = molSerializer
  }

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.#molSerializer.serialize(struct)
    return stringifiedMolfile
  }

  async getStructureFromStringAsync(
    stringifiedStruct: string
  ): Promise<Struct> {
    const struct = this.#molSerializer.deserialize(stringifiedStruct)
    return struct
  }
}
