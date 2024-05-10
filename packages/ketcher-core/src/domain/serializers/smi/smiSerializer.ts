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

import { Serializer } from '../serializers.types';
import { SmiSerializerOptions } from './smi.types';
import { Smiles } from './smiles';
import { Struct } from 'domain/entities';

export class SmiSerializer implements Serializer<Struct> {
  static DefaultOptions: SmiSerializerOptions = {
    ignoreErrors: false,
  };

  private readonly options: SmiSerializerOptions;

  constructor(options?: Partial<SmiSerializerOptions>) {
    this.options = { ...SmiSerializer.DefaultOptions, ...options };
  }

  deserialize(_content: string): Struct {
    throw new Error('Not implemented yet.');
  }

  serialize(struct: Struct): string {
    return new Smiles().saveMolecule(struct, this.options.ignoreErrors);
  }
}
