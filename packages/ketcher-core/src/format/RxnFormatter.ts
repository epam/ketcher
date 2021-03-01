import { MolfileManager, MolfileParseOptions, Struct } from 'chemistry'
import { StructFormatter } from './structFormatter.types'

export class RxnFormatter implements StructFormatter {
  constructor(
    private readonly molfileManager: MolfileManager,
    private readonly options?: MolfileParseOptions
  ) {}

  getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.molfileManager.stringify(struct)
    return Promise.resolve(stringifiedMolfile)
  }

  getStructureFromStringAsync(stringifiedStruct: string): Promise<Struct> {
    const struct = this.molfileManager.parse(stringifiedStruct, this.options)
    return Promise.resolve(struct)
  }
}
