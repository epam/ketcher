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
  ConvertData,
  ConvertResult,
  LayoutData,
  LayoutResult,
  StructService,
  StructServiceOptions
} from 'domain/services'
import { StructFormatter, SupportedFormat } from './structFormatter.types'

import { MolSerializer } from 'domain/serializers'
import { Struct } from 'domain/entities'
import { getPropertiesByFormat } from './formatProperties'

export class ServerFormatter implements StructFormatter {
  constructor(
    private readonly structService: StructService,
    private readonly molfileManager: MolSerializer,
    private readonly format: SupportedFormat,
    private readonly options?: StructServiceOptions
  ) {}

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const infoResult = await this.structService.info()
    if (!infoResult.isAvailable) {
      throw new Error('Server is not available')
    }

    const formatProperties = getPropertiesByFormat(this.format)

    try {
      const stringifiedStruct = this.molfileManager.serialize(struct)
      const convertResult = await this.structService.convert(
        {
          struct: stringifiedStruct,
          output_format: formatProperties.mime
        },
        { ...this.options, ...formatProperties.options }
      )

      return convertResult.struct
    } catch (error: any) {
      let message
      if (error.message === 'Server is not compatible') {
        message = `${formatProperties.name} is not supported.`
      } else {
        message = `Convert error!\n${error.message || error}`
      }

      throw new Error(message)
    }
  }

  async getStructureFromStringAsync(
    stringifiedStruct: string
  ): Promise<Struct> {
    const infoResult = await this.structService.info()
    if (!infoResult.isAvailable) {
      throw new Error('Server is not available')
    }

    type ConvertPromise = (
      data: ConvertData,
      options?: StructServiceOptions
    ) => Promise<ConvertResult>

    type LayoutPromise = (
      data: LayoutData,
      options?: StructServiceOptions
    ) => Promise<LayoutResult>

    let promise: LayoutPromise | ConvertPromise

    let data: ConvertData | LayoutData = {
      struct: undefined as any,
      output_format: getPropertiesByFormat('mol').mime
    }

    const withCoords = getPropertiesByFormat(this.format).supportsCoords
    if (withCoords) {
      promise = this.structService.convert
      data.struct = stringifiedStruct
    } else {
      promise = this.structService.layout
      data.struct = stringifiedStruct.trim()
    }

    try {
      const result = await promise(data, this.options)
      const parsedStruct = this.molfileManager.deserialize(result.struct)
      if (!withCoords) {
        parsedStruct.rescale()
      }
      return parsedStruct
    } catch (error: any) {
      if (error.message !== 'Server is not compatible') {
        throw Error(`Convert error!\n${error.message || error}`)
      }

      const formatError =
        this.format === 'smiles'
          ? `${getPropertiesByFormat('smilesExt').name} and opening of ${
              getPropertiesByFormat('smiles').name
            }`
          : getPropertiesByFormat(this.format).name

      throw Error(`${formatError} is not supported in standalone mode.`)
    }
  }
}
