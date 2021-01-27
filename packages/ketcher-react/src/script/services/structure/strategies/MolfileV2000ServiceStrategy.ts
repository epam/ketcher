import { SupportedFormat } from '../../../ui/data/convert/struct.types'
import { StructureService } from '../StructureService'
import { BaseServiceStrategy } from './BaseServiceStrategy'

export class MolfileV2000ServiceStrategy
  extends BaseServiceStrategy
  implements StructureService {
  getStructureAsync(): Promise<string> {
    return this.getStructureByFormatAsync(SupportedFormat.Mol)
  }
}
