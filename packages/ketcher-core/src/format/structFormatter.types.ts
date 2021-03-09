import { MolfileParseOptions } from 'chemistry'
import { Struct } from 'chemistry'
import { StructServiceOptions } from 'infrastructure/services'

export interface StructFormatter {
  getStructureFromStructAsync: (struct: Struct) => Promise<string>
  getStructureFromStringAsync: (stringifiedStruct: string) => Promise<Struct>
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
