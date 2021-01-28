import { MolfileManager } from '../chem'
import { getPropertiesByFormat } from './formatProperties'
import { StructProvider } from './structFormatter.types'
import { StructService } from '../infrastructure/services'
import { StructFormatter, SupportedFormat } from './structFormatter.types'

export class ServerFormatter implements StructFormatter {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly structService: StructService,
    private readonly molfileManager: MolfileManager,
    private readonly format: SupportedFormat,
    private readonly options?: any
  ) {}

  async getStructureAsync(): Promise<string> {
    const formatProperties = getPropertiesByFormat(this.format)

    const infoResult = await this.structService.info()
    if (!infoResult.isAvailable) {
      throw new Error('Server is not available')
    }

    try {
      const stringifiedStruct = this.molfileManager.stringify(
        this.structProvider.struct()
      )
      const convertResult = await this.structService.convert(
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
