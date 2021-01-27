import { Api } from '../../api'
import { StructProvider } from '../../editor'
import { SupportedFormat } from '../../ui/data/convert/struct.types'
import { GraphServiceStrategy } from './strategies/GraphServiceStrategy'
import { MolfileV2000ServiceStrategy } from './strategies/MolfileV2000ServiceStrategy'
import { RxnServiceStrategy } from './strategies/RxnServiceStrategy'
import { ServerServiceStrategy } from './strategies/ServerServiceStrategy'
import { SmilesServiceStrategy } from './strategies/SmilesServiceStrategy'
import { StructureService } from './StructureService'

export class StructureServiceFactory {
  constructor(
    private readonly structProvider: StructProvider,
    private readonly api: Api
  ) {}

  create(format: SupportedFormat, options?: any): StructureService {
    let strategy: StructureService

    switch (format) {
      case SupportedFormat.Graph:
        strategy = new GraphServiceStrategy(this.structProvider)
        break

      case SupportedFormat.Mol:
        strategy = new MolfileV2000ServiceStrategy(this.structProvider)
        break

      case SupportedFormat.Rxn:
        strategy = new RxnServiceStrategy(this.structProvider)
        break

      case SupportedFormat.Smiles:
        strategy = new SmilesServiceStrategy(this.structProvider)
        break

      case SupportedFormat.CML:
      case SupportedFormat.InChIAuxInfo:
      case SupportedFormat.InChI:
      case SupportedFormat.MolV3000:
      case SupportedFormat.RxnV3000:
      case SupportedFormat.SmilesExt:
      case SupportedFormat.Smarts:
      default:
        strategy = new ServerServiceStrategy(
          this.structProvider,
          this.api,
          format,
          options
        )
    }

    return strategy
  }
}
