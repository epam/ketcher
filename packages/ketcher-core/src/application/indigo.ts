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
  CalculateResult,
  CheckResult,
  CheckTypes,
  ChemicalMimeType,
  ConvertResult,
  InfoResult,
  OutputFormatType,
  StructService
} from 'domain/services'
import { StructOrString } from 'application/indigo.types'
import { KetSerializer } from 'domain/serializers'
import { Struct } from 'domain/entities'

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

type ConvertOptions = {
  outputFormat?: ChemicalMimeType
}
type AutomapOptions = {
  mode?: AutomapMode
}
type CheckOptions = {
  types?: Array<CheckTypes>
}
type CalculateOptions = {
  properties?: Array<CalculateProps>
}
type RecognizeOptions = {
  version?: string
}
type GenerateImageOptions = {
  outputFormat?: OutputFormatType
  backgroundColor?: string
}

function convertStructToString(
  struct: StructOrString,
  serializer: KetSerializer
): string {
  if (typeof struct !== 'string') {
    const aidMap = new Map()
    const result = struct.clone(null, null, false, aidMap)

    return serializer.serialize(result)
  }

  return struct
}

/**
 * Class, performing 'server' (indigo) functions
 *
 * @exports Indigo
 * @class
 */
export class Indigo {
  #structService: StructService
  #ketSerializer: KetSerializer

  constructor(structService) {
    this.#structService = structService
    this.#ketSerializer = new KetSerializer()
  }

  /**
   * Returns information about indigo service
   * @public
   * @returns {Promise<InfoResult>} promise, which fulfills into object with indigo information
   */
  info(): Promise<InfoResult> {
    return this.#structService.info()
  }

  /**
   * Returns converted structure
   * @public
   * @param {Struct} struct - structure
   * @param {ConvertOptions} [options] object with output format
   * @returns {Promise<ConvertResult>} promise, resolving into an object with structure and format
   */
  convert(
    struct: StructOrString,
    options?: ConvertOptions
  ): Promise<ConvertResult> {
    const outputFormat = options?.outputFormat || ChemicalMimeType.KET

    return this.#structService.convert({
      struct: convertStructToString(struct, this.#ketSerializer),
      output_format: outputFormat
    })
  }

  /**
   * Returns a structure with normalized layout
   * @public
   * @param {StructOrString} struct - structure
   * @returns {Promise<Struct>} promise, resolving into normalized struct
   */
  layout(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .layout({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))
  }

  /**
   * Returns a structure with normalized bond lengths and angles
   * @public
   * @param {StructOrString} struct - initial structure
   * @returns {Promise<Struct>} promise, resolving into normalized struct
   */
  clean(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .clean({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))
  }

  /**
   * Returns aromatized structure
   * @public
   * @param {StructOrString} struct - initial structure
   * @returns {Promise<Struct>} promise, resolving into atomatized struct
   */
  aromatize(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .aromatize({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))
  }

  /**
   * Returns dearomatized structure
   * @public
   * @param {StructOrString} struct - initial structure
   * @returns {Promise<Struct>} promise, resolving into dearomatized structure
   */
  dearomatize(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .dearomatize({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))
  }

  /**
   * Returns a structure ..........................
   * @public
   * @param {StructOrString} struct - initial structure
   * @returns {Promise<Struct>} promise, resolving into .............................
   */
  calculateCip(struct: StructOrString): Promise<Struct> {
    return this.#structService
      .calculateCip({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))
  }

  /**
   * Returns a structure ..........................
   * @public
   * @param {StructOrString} struct - initial structure
   * @param {AutomapOptions} [options] - object with automap mode
   * @returns {Promise<Struct>} promise, resolving into .............................
   */
  automap(struct: StructOrString, options?: AutomapOptions): Promise<Struct> {
    const mode = options?.mode || 'discard'

    return this.#structService
      .automap({
        struct: convertStructToString(struct, this.#ketSerializer),
        output_format: ChemicalMimeType.KET,
        mode
      })
      .then((data) => this.#ketSerializer.deserialize(data.struct))
  }

  /**
   * Returns a structure ..........................
   * @public
   * @param {StructOrString} struct - initial structure
   * @param {CheckOptions} [options] - object with check types
   * @returns {Promise<Struct>} promise, resolving into .............................
   */
  check(struct: StructOrString, options?: CheckOptions): Promise<CheckResult> {
    const types = options?.types || defaultTypes

    return this.#structService.check({
      struct: convertStructToString(struct, this.#ketSerializer),
      types
    })
  }

  /**
   * Returns calculated values of molecule
   * @public
   * @param {StructOrString} struct - structure
   * @param {CalculateOptions} [options] - object with properties
   * @returns {Promise<CalculateResult>} promise, resolving into object with molecule calculated values
   */
  calculate(
    struct: StructOrString,
    options?: CalculateOptions
  ): Promise<CalculateResult> {
    const properties = options?.properties || defaultCalcProps

    return this.#structService.calculate({
      struct: convertStructToString(struct, this.#ketSerializer),
      properties
    })
  }

  /**
   * Returns struct ..........................
   * @public
   * @param {Blob} image - image
   * @param {RecognizeOptions} [options] - object with imago versions
   * @returns {Promise<CalculateResult>} promise, resolving into .............................
   */
  recognize(image: Blob, options?: RecognizeOptions): Promise<Struct> {
    const version = options?.version || ''

    return this.#structService
      .recognize(image, version)
      .then((data) => this.#ketSerializer.deserialize(data.struct))
  }

  /**
   * Returns base 64 string generated from struct
   * @public
   * @param {StructOrString} struct - struct
   * @param {GenerateImageOptions} [options] - object with imago versions
   * @returns {Promise<string>} promise, resolving into base64 string
   */
  generateImageAsBase64(
    struct: StructOrString,
    options?: GenerateImageOptions
  ): Promise<string> {
    const outputFormat = options?.outputFormat || 'png'
    const backgroundColor = options?.backgroundColor || ''

    return this.#structService.generateImageAsBase64(
      convertStructToString(struct, this.#ketSerializer),
      {
        outputFormat,
        backgroundColor
      }
    )
  }
}
