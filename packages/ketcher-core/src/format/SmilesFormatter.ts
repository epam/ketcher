import { MolfileManager, SmilesManager, Struct } from '../chem'
import { StructService, StructServiceOptions } from '../infrastructure/services'
import { ServerFormatter } from './ServerFormatter'
import {
  StructFormatter,
  StructProvider,
  SupportedFormat
} from './structFormatter.types'

export class SmilesFormatter implements StructFormatter<string> {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly smilesManager: SmilesManager,

    // only for ServerFormatter

    private readonly structService: StructService,
    private readonly molfileManager: MolfileManager,
    private readonly format: SupportedFormat,
    private readonly options?: StructServiceOptions
  ) {}

  getStructureAsync(): Promise<string> {
    const struct = this.structProvider.struct()
    return this.getStructureFromStructAsync(struct)
  }

  getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.smilesManager.stringify(struct)
    return Promise.resolve(stringifiedMolfile)
  }

  getStructureFromStringAsync(stringifiedStruct: string): Promise<Struct> {
    const serverFormatter = new ServerFormatter(
      this.structProvider,
      this.structService,
      this.molfileManager,
      this.format,
      this.options
    )

    return serverFormatter.getStructureFromStringAsync(stringifiedStruct)
  }
}
