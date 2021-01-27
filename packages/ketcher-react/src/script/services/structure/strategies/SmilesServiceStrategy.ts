import { SupportedFormat } from '../../../ui/data/convert/struct.types'
import { StructureService } from '../StructureService'
import { BaseServiceStrategy } from './BaseServiceStrategy'

export class SmilesServiceStrategy
  extends BaseServiceStrategy
  implements StructureService {
  getStructureAsync(): Promise<string> {
    return this.getStructureByFormatAsync(SupportedFormat.Smiles)
  }
}
