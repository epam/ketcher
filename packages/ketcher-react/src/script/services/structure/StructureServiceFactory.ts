import { Api } from '../../api'
import Editor from '../../editor'
import { SupportedFormat } from '../../ui/data/convert/struct.types'
import { GraphServiceStrategy } from './strategies/GraphServiceStrategy'
import { MolfileV2000ServiceStrategy } from './strategies/MolfileV2000ServiceStrategy'
import { MolfileV3000ServiceStrategy } from './strategies/MolfileV3000ServiceStrategy'
import { SmilesExtendedServiceStrategy } from './strategies/SmilesExtendedServiceStrategy'
import { SmilesServiceStrategy } from './strategies/SmilesServiceStrategy'
import { StructureService } from './StructureService'

export class StructureServiceFactory {
  constructor(private readonly editor: Editor, private readonly api: Api) {}

  create(format: SupportedFormat): StructureService {
    let strategy: StructureService

    switch (format) {
      case SupportedFormat.Graph:
        strategy = new GraphServiceStrategy(this.editor, this.api)
        break

      case SupportedFormat.Mol:
        strategy = new MolfileV2000ServiceStrategy(this.editor, this.api)
        break

      case SupportedFormat.MolV3000:
        strategy = new MolfileV3000ServiceStrategy(this.editor, this.api)
        break

      case SupportedFormat.Smiles:
        strategy = new SmilesServiceStrategy(this.editor, this.api)
        break

      case SupportedFormat.SmilesExt:
        strategy = new SmilesExtendedServiceStrategy(this.editor, this.api)
        break

      case SupportedFormat.Smarts:
      case SupportedFormat.InChIAuxInfo:
      case SupportedFormat.InChI:
      case SupportedFormat.CML:
      case SupportedFormat.Rxn:
      case SupportedFormat.RxnV3000:
      default:
        throw new Error(`The ${format} format is not supported`)
    }

    return strategy
  }
}
