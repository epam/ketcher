import { SmilesManager } from '../chem'
import { StructFormatter, StructProvider } from './structFormatter.types'

export class SmilesFormatter implements StructFormatter {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly smilesManager: SmilesManager
  ) {}

  getStructureAsync(): Promise<string> {
    const struct = this.structProvider.struct()
    const stringifiedMolfile = this.smilesManager.stringify(struct)
    return Promise.resolve(stringifiedMolfile)
  }
}
