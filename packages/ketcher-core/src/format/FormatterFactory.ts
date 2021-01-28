import { GraphManager, MolfileManager, SmilesManager } from '../chem'
import { StructService } from '../infrastructure/services'
import {
  StructProvider,
  StructFormatter,
  SupportedFormat
} from './structFormatter.types'
import { GraphFormatter } from './GraphFormatter'
import { MolfileV2000Formatter } from './MolfileV2000Formatter'
import { RxnFormatter } from './RxnFormatter'
import { ServerFormatter } from './ServerFormatter'
import { SmilesFormatter } from './SmilesFormatter'

export class FormatterFactory {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly structService: StructService,
    private readonly graphManager: GraphManager,
    private readonly molfileManager: MolfileManager,
    private readonly smilesManager: SmilesManager
  ) {}

  create(format: SupportedFormat, options?: any): StructFormatter {
    let strategy: StructFormatter

    switch (format) {
      case 'graph':
        strategy = new GraphFormatter(this.structProvider, this.graphManager)
        break

      case 'mol':
        strategy = new MolfileV2000Formatter(
          this.structProvider,
          this.molfileManager
        )
        break

      case 'rxn':
        strategy = new RxnFormatter(this.structProvider, this.molfileManager)
        break

      case 'smiles':
        strategy = new SmilesFormatter(this.structProvider, this.smilesManager)
        break

      case 'cml':
      case 'inChIAuxInfo':
      case 'inChI':
      case 'molV3000':
      case 'rxnV3000':
      case 'smilesExt':
      case 'smarts':
      default:
        strategy = new ServerFormatter(
          this.structProvider,
          this.structService,
          this.molfileManager,
          format,
          options
        )
    }

    return strategy
  }
}
