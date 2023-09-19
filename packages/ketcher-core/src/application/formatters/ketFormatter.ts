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

import { KetSerializer } from 'domain/serializers';
import { Struct } from 'domain/entities';
import { StructFormatter } from './structFormatter.types';

export class KetFormatter implements StructFormatter {
  #ketSerializer: KetSerializer;

  constructor(serializer: KetSerializer) {
    this.#ketSerializer = serializer;
  }

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const ket = this.#ketSerializer.serialize(struct);
    return ket;
  }

  async getStructureFromStringAsync(content: string): Promise<Struct> {
    return this.#ketSerializer.deserialize(content);
  }

  parseMacromoleculeString(content: string): void {
    this.#ketSerializer.deserializeMacromolecule(content);
  }
}
