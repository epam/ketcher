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

import {
  AutomapMode,
  CalculateProps,
  CheckTypes,
  ChemicalMimeType,
  OutputFormatType,
  StructService
} from 'domain/services'
import { Indigo, StructOrString } from 'application/indigo.types'
import { KetSerializer } from 'domain/serializers'

const defaultTypes: Array<CheckTypes> = [
  'radicals',
  'pseudoatoms',
  'stereo',
  'query',
  'overlapping_atoms',
  'overlapping_bonds',
  'rgroups',
  'chiral',
  '3d'
]
const defaultCalcProps: Array<CalculateProps> = [
  'molecular-weight',
  'most-abundant-mass',
  'monoisotopic-mass',
  'gross',
  'mass-composition'
]

export class IndigoService implements Indigo {
  #structService: StructService
  #ketSerializer: KetSerializer

  constructor(structService) {
    this.#structService = structService
    this.#ketSerializer = new KetSerializer()
  }

  checkStructType = (struct: StructOrString): string => {
    if (typeof struct !== 'string') {
      const aidMap = new Map()
      const result = struct.clone(null, null, false, aidMap)

      return this.#ketSerializer.serialize(result)
    }

    return struct
  }

  info = () => this.#structService.info()

  convert = (
    struct: StructOrString,
    {
      outputFormat = ChemicalMimeType.KET
    }: { outputFormat?: ChemicalMimeType } = {
      outputFormat: ChemicalMimeType.KET
    }
  ) =>
    this.#structService.convert({
      struct: this.checkStructType(struct),
      output_format: outputFormat
    })

  layout = (struct: StructOrString) =>
    this.#structService
      .layout({
        struct: this.checkStructType(struct),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))

  clean = (struct: StructOrString) =>
    this.#structService
      .clean({
        struct: this.checkStructType(struct),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))

  aromatize = (struct: StructOrString) =>
    this.#structService
      .aromatize({
        struct: this.checkStructType(struct),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))

  dearomatize = (struct: StructOrString) =>
    this.#structService
      .dearomatize({
        struct: this.checkStructType(struct),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))

  calculateCip = (struct: StructOrString) =>
    this.#structService
      .calculateCip({
        struct: this.checkStructType(struct),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))

  automap = (
    struct: StructOrString,
    { mode = 'discard' }: { mode?: AutomapMode } = { mode: 'discard' }
  ) =>
    this.#structService
      .automap({
        struct: this.checkStructType(struct),
        output_format: ChemicalMimeType.KET,
        mode
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))

  check = (
    struct: StructOrString,
    { types = defaultTypes }: { types?: Array<CheckTypes> } = {
      types: defaultTypes
    }
  ) =>
    this.#structService.check({ struct: this.checkStructType(struct), types })

  calculate = (
    struct: StructOrString,
    {
      properties = defaultCalcProps
    }: { properties?: Array<CalculateProps> } = {
      properties: defaultCalcProps
    }
  ) => {
    return this.#structService.calculate({
      properties,
      struct: this.checkStructType(struct)
    })
  }

  recognize = (
    blob: Blob,
    { version = '' }: { version?: string } = { version: '' }
  ) =>
    this.#structService
      .recognize(blob, version)
      .then((data) => this.#ketSerializer.deserialize(data.struct))

  generateImageAsBase64 = (
    data: string,
    {
      outputFormat = 'png',
      backgroundColor
    }: { outputFormat?: OutputFormatType; backgroundColor?: string } = {
      outputFormat: 'png'
    }
  ) =>
    this.#structService.generateImageAsBase64(data, {
      outputFormat,
      backgroundColor
    })
}
