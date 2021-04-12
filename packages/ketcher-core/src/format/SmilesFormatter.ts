import { MolSerializer, SmiSerializer, Struct } from 'chemistry'
import { StructService, StructServiceOptions } from 'infrastructure/services'
import { ServerFormatter } from './ServerFormatter'
import { StructFormatter, SupportedFormat } from './structFormatter.types'

export class SmilesFormatter implements StructFormatter {
  constructor(
    private readonly smiSerializer: SmiSerializer,

    // only for ServerFormatter

    private readonly structService: StructService,
    private readonly molfileManager: MolSerializer,
    private readonly format: SupportedFormat,
    private readonly options?: StructServiceOptions
  ) {}

  getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.smiSerializer.serialize(struct)
    return Promise.resolve(stringifiedMolfile)
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
