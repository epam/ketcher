import { MolSerializer } from 'domain/serializers'
import { Struct } from 'domain/entities'
import { StructFormatter } from './structFormatter.types'

export class RxnFormatter implements StructFormatter {
  constructor(private readonly molfileManager: MolSerializer) {}

  async getStructureFromStructAsync(struct: Struct): Promise<string> {
    const stringifiedMolfile = this.molfileManager.serialize(struct)
    return stringifiedMolfile
  }

  async getStructureFromStringAsync(
    stringifiedStruct: string
  ): Promise<Struct> {
    const struct = this.molfileManager.deserialize(stringifiedStruct)
    return struct
  }
}
