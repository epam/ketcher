import { MolfileManager, MolfileParseOptions, Struct } from 'chemistry'
import { StructFormatter } from './structFormatter.types'

export class MolfileV2000Formatter implements StructFormatter {
  constructor(
    private readonly molfileManager: MolfileManager,
    private readonly options?: MolfileParseOptions
  ) {}

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
