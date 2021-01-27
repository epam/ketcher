import { molfileManager } from '../../../chem/molfile'
import { StructProvider } from '../../../editor'
import { StructureService } from '../StructureService'

export class MolfileV2000ServiceStrategy implements StructureService {
  constructor(protected readonly structProvider: StructProvider) {}

  getStructureAsync(): Promise<string> {
    const struct = this.structProvider.struct()
    const stringifiedMolfile = molfileManager.stringify(struct)
    return Promise.resolve(stringifiedMolfile)
  }
}
