import { MolfileManager } from '../chem'
import { StructFormatter, StructProvider } from './structFormatter.types'

export class RxnFormatter implements StructFormatter {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly molfileManager: MolfileManager
  ) {}

  getStructureAsync(): Promise<string> {
    const struct = this.structProvider.struct()
    const stringifiedMolfile = this.molfileManager.stringify(struct)
    return Promise.resolve(stringifiedMolfile)
  }
}
