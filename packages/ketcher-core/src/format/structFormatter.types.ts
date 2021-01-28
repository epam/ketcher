import { Struct } from '../chem'

export interface StructFormatter {
  getStructureAsync: () => Promise<any>
}

export interface StructProvider {
  struct: () => Struct
}

export type SupportedFormat =
  | 'rxn'
  | 'rxnV3000'
  | 'mol'
  | 'molV3000'
  | 'smiles'
  | 'smilesExt'
  | 'smarts'
  | 'inChI'
  | 'inChIAuxInfo'
  | 'cml'
  | 'graph'
