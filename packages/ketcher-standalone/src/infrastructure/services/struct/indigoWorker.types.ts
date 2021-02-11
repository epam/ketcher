/****************************************************************************
 * Copyright 2020 EPAM Systems
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
export enum Command {
  Info = 'info',
  Convert = 'convert',
  Layout = 'layout',
  Clean = 'clean',
  Aromatize = 'aromatize',
  Dearomatize = 'dearomatize',
  CalculateCip = 'calculateCip',
  Automap = 'automap',
  Check = 'check',
  Calculate = 'calculate',
  GenerateImageAsBase64 = 'generateImageAsBase64'
}

export enum SupportedFormat {
  Rxn = 'rxnfile',
  Mol = 'molfile',
  Smiles = 'smiles',
  Smarts = 'smarts',
  CML = 'cml',
  InChI = 'inchi',
  InChIAuxInfo = 'inchi-aux'
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

export interface CheckCommandData extends CommandData, WithStruct {
  types: Array<string>
}

export interface CommandData {
  options: CommandOptions
}

export interface ConvertCommandData
  extends CommandData,
    WithStruct,
    WithFormat {}

export interface GenerateImageCommandData extends CommandData, WithStruct {
  outputFormat: 'png' | 'svg'
}

export interface LayoutCommandData extends CommandData, WithStruct {}

export interface CleanCommandData
  extends CommandData,
    WithStruct,
    WithSelection {}

export interface AromatizeCommandData extends CommandData, WithStruct {}

export interface DearomatizeCommandData extends CommandData, WithStruct {}

export interface CalculateCipCommandData extends CommandData, WithStruct {}

export interface CalculateCommandData
  extends CommandData,
    WithStruct,
    WithSelection {
  properties: Array<string>
}

export interface AutomapCommandData extends CommandData, WithStruct {
  mode: string
}

export interface CommandOptions {
  [key: string]: string | number | boolean
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
