import { Api } from '../../../api'
import { StructProvider } from '../../../editor'
import {
  getPropertiesByFormat,
  SupportedFormat
} from '../../../ui/data/convert/struct.types'
import { molfileManager } from '../../../chem/molfile'
import { StructureService } from '../StructureService'

export class ServerServiceStrategy implements StructureService {
  constructor(
    protected readonly structProvider: StructProvider,
    protected readonly api: Api,
    private readonly format: SupportedFormat,
    private readonly options?: any
  ) {}

  async getStructureAsync(): Promise<string> {
    const { structProvider } = this
    const { api } = this

    const formatProperties = getPropertiesByFormat(this.format)

    const server = await api
    if (!server.isAvailable) {
      throw new Error('Server is not available')
    }

    try {
      const stringifiedStruct = molfileManager.stringify(
        structProvider.struct()
      )
      const convertResult = await api.convert(
        {
          struct: stringifiedStruct,
          output_format: formatProperties.mime
        },
        { ...this.options, ...formatProperties.options }
      )

      return convertResult.struct
    } catch (error) {
      throw error.message === 'Server is not compatible'
        ? Error(`${formatProperties.name} is not supported in standalone mode.`)
        : Error(`Convert error!\n${error.message}`)
    }
  }
}
