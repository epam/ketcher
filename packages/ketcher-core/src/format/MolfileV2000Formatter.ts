import { MolfileManager, MolfileParseOptions, Struct } from '../chem'
import { StructFormatter, StructProvider } from './structFormatter.types'

export class MolfileV2000Formatter implements StructFormatter<string> {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly molfileManager: MolfileManager,
    private readonly options?: MolfileParseOptions
  ) {}

  getStructureAsync(): Promise<string> {
    const struct = this.structProvider.struct()
    return this.getStructureFromStructAsync(struct)
  }

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.molfileManager.stringify(struct)
    return stringifiedMolfile
  }

  async getStructureFromStringAsync(
    stringifiedStruct: string
  ): Promise<Struct> {
    const struct = this.molfileManager.parse(stringifiedStruct, this.options)
    return struct
  }
}
