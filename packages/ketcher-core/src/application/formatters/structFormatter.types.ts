import { MolSerializerOptions } from 'domain/serializers'
import { Struct } from 'domain/entities'
import { StructServiceOptions } from 'domain/services'

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
  | 'cdxml'

export type FormatterFactoryOptions = Partial<
  MolSerializerOptions & StructServiceOptions
>
