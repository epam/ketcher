import { MolSerializer, Struct } from 'chemistry'
import { StructFormatter } from './structFormatter.types'

export class RxnFormatter implements StructFormatter {
  constructor(private readonly molfileManager: MolSerializer) {}

  getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.molfileManager.serialize(struct)
    return Promise.resolve(stringifiedMolfile)
  }

  getStructureFromStringAsync(stringifiedStruct: string): Promise<Struct> {
    const struct = this.molfileManager.deserialize(stringifiedStruct)
    return Promise.resolve(struct)
  }
}
