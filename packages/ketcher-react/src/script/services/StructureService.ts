import { MolfileFormat } from '../chem/molfile'
import { SupportedFormat } from '../ui/data/convert/struct.types'

export interface StructureService {
  getStructureAsync: (structureFormat?: SupportedFormat) => Promise<string>
  getSmilesAsync: (isExtended?: boolean) => Promise<string>
  getMolfileAsync: (molfileFormat?: MolfileFormat) => Promise<string>
}
