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

import { MolSerializer, SmiSerializer } from 'domain/serializers'
import { StructFormatter, SupportedFormat } from './structFormatter.types'
import { StructService, StructServiceOptions } from 'domain/services'

import { ServerFormatter } from './serverFormatter'
import { Struct } from 'domain/entities'

export class SmilesFormatter implements StructFormatter {
  constructor(
    private readonly smiSerializer: SmiSerializer,

    // only for ServerFormatter

    private readonly structService: StructService,
    private readonly molfileManager: MolSerializer,
    private readonly format: SupportedFormat,
    private readonly options?: StructServiceOptions
  ) {}

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.smiSerializer.serialize(struct)
    return stringifiedMolfile
  }

  getStructureFromStringAsync(stringifiedStruct: string): Promise<Struct> {
    const serverFormatter = new ServerFormatter(
      this.structService,
      this.molfileManager,
      this.format,
      this.options
    )

    return serverFormatter.getStructureFromStringAsync(stringifiedStruct)
  }
}
