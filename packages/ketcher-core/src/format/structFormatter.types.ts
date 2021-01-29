import { MolfileParseOptions, Struct } from '../chem'
import { StructServiceOptions } from '../infrastructure/services'

export interface StructFormatter<TFormat = any> {
  getStructureAsync: () => Promise<TFormat>
  getStructureFromStructAsync: (struct: Struct) => Promise<TFormat>
  getStructureFromStringAsync: (stringifiedStruct: string) => Promise<Struct>
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

export type FormatterFactoryOptions = Partial<
  MolfileParseOptions & StructServiceOptions
>
