/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

export const enum Command {
  Info,
  Convert,
  Layout,
  Clean,
  Aromatize,
  Dearomatize,
  CalculateCip,
  Automap,
  Check,
  Calculate,
  GenerateImageAsBase64,
  GenerateInchIKey
}

export enum SupportedFormat {
  Rxn = 'rxnfile',
  Mol = 'molfile',
  Smiles = 'smiles',
  Smarts = 'smarts',
  CML = 'cml',
  InChI = 'inchi',
  InChIAuxInfo = 'inchi-aux',
  Ket = 'ket',
  CDX = 'cdx',
  CDXML = 'cdxml'
}

export interface WithStruct {
  struct: string
}

export interface WithFormat {
  format: SupportedFormat
}

export interface WithSelection {
  selectedAtoms: Array<number>
}

export interface CommandOptions {
  [key: string]: string | number | boolean | undefined
}

export interface CommandData {
  options?: CommandOptions
}

export interface CheckCommandData extends CommandData, WithStruct {
  types: Array<string>
}

export interface ConvertCommandData
  extends CommandData,
    WithStruct,
    WithFormat {}

export interface GenerateInchIKeyCommandData extends CommandData, WithStruct {}

export interface GenerateImageCommandData extends CommandData, WithStruct {
  outputFormat: 'png' | 'svg'
  backgroundColor?: string
}

export interface LayoutCommandData
  extends CommandData,
    WithStruct,
    WithFormat {}

export interface CleanCommandData
  extends CommandData,
    WithStruct,
    WithSelection,
    WithFormat {}

export interface AromatizeCommandData
  extends CommandData,
    WithStruct,
    WithFormat {}

export interface DearomatizeCommandData
  extends CommandData,
    WithStruct,
    WithFormat {}

export interface CalculateCipCommandData
  extends CommandData,
    WithStruct,
    WithFormat {}

export type CalculateProps =
  | 'molecular-weight'
  | 'most-abundant-mass'
  | 'monoisotopic-mass'
  | 'gross'
  | 'gross-formula'
  | 'mass-composition'

export interface CalculateCommandData
  extends CommandData,
    WithStruct,
    WithSelection {
  properties: Array<string>
}

export interface AutomapCommandData
  extends CommandData,
    WithStruct,
    WithFormat {
  mode: string
}

export interface OutputMessage<T> {
  hasError?: boolean
  payload?: T
  error?: string
}
export interface InputMessage<T> {
  type: Command
  data: T
}
