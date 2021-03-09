import { MolfileManager, Struct } from 'chemistry'
import { getPropertiesByFormat } from './formatProperties'
import {
  ConvertData,
  ConvertResult,
  LayoutData,
  LayoutResult,
  StructService,
  StructServiceOptions
} from 'infrastructure/services'
import { StructFormatter, SupportedFormat } from './structFormatter.types'

export class ServerFormatter implements StructFormatter {
  constructor(
    private readonly structService: StructService,
    private readonly molfileManager: MolfileManager,
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
      const stringifiedStruct = this.molfileManager.stringify(struct)
      const convertResult = await this.structService.convert(
        {
          struct: stringifiedStruct,
          output_format: formatProperties.mime
        },
        { ...this.options, ...formatProperties.options }
      )

      return convertResult.struct
    } catch (error) {
      let message
      if (error.message === 'Server is not compatible') {
        message = `${formatProperties.name} is not supported in standalone mode.`
      } else {
        message = `Convert error!\n${error.message}`
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
      const parsedStruct = this.molfileManager.parse(result.struct)
      if (!withCoords) {
        parsedStruct.rescale()
      }
      return parsedStruct
    } catch (error) {
      if (error.message !== 'Server is not compatible') {
        throw Error(`Convert error!\n${error.message}`)
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
