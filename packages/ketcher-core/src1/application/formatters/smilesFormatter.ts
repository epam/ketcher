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
