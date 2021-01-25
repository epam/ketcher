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
//TODO: move all these types in core module to reuse
export enum ChemicalMimeType {
  Mol = 'chemical/x-mdl-molfile',
  Rxn = 'chemical/x-mdl-rxnfile',
  DaylightSmiles = 'chemical/x-daylight-smiles',
  ExtendedSmiles = 'chemical/x-chemaxon-cxsmiles',
  DaylightSmarts = 'chemical/x-daylight-smarts',
  InchI = 'chemical/x-inchi',
  InChIAuxInfo = 'chemical/x-inchi-aux',
  CML = 'chemical/x-cml'
}

export interface WithStruct {
  struct: string
}

export interface WithFormat {
  format: ChemicalMimeType
}

export interface CheckData extends WithStruct {
  types: Array<string>
}

export interface CheckResult {
  [key: string]: string
}

export interface ConvertData extends WithStruct {
  output_format: ChemicalMimeType
}

export interface ConvertResult extends WithStruct, WithFormat {}

export interface LayoutData extends WithStruct {}

export interface LayoutResult extends WithStruct, WithFormat {}

export interface CleanData extends WithStruct {}

export interface CleanResult extends WithStruct, WithFormat {}

export interface AromatizeData extends WithStruct {}

export interface AromatizeResult extends WithStruct, WithFormat {}

export interface DearomatizeData extends WithStruct {}

export interface DearomatizeResult extends WithStruct, WithFormat {}

export interface CalculateCipData extends WithStruct {}

export interface CalculateCipResult extends WithStruct, WithFormat {}

export interface CalculateData extends WithStruct {
  properties: Array<string>
}

export interface CalculateResult {
  [key: string]: string | number | boolean
}

export interface AutomapData extends WithStruct {
  mode: string
}

export interface AutomapResult extends WithStruct, WithFormat {}

export interface InfoResult {
  indigoVersion: string
  imagoVersions: Array<string>
  isAvailable: boolean
}

export interface RecognizeResult extends WithStruct {}

export interface Options {
  [key: string]: string | number | boolean
}

export interface StructService {
  info: () => Promise<InfoResult>
  convert: (data: ConvertData, options: Options) => Promise<ConvertResult>
  layout: (data: LayoutData, options: Options) => Promise<LayoutResult>
  clean: (data: CleanData, options: Options) => Promise<CleanResult>
  aromatize: (data: AromatizeData, options: Options) => Promise<AromatizeResult>
  dearomatize: (
    data: DearomatizeData,
    options: Options
  ) => Promise<DearomatizeResult>
  calculateCip: (
    data: CalculateCipData,
    options: Options
  ) => Promise<CalculateCipResult>
  automap: (data: AutomapData, options: Options) => Promise<AutomapResult>
  check: (data: CheckData, options: Options) => Promise<CheckResult>
  calculate: (data: CalculateData, options: Options) => Promise<CalculateResult>
  recognize: (blob: Blob, version: string) => Promise<RecognizeResult>
  generatePngAsBase64: (data: any, options: any) => Promise<string>
}

export type ServiceMode = 'standalone' | 'remote'

export interface StructServiceProvider {
  mode: ServiceMode
  createStructService: (baseUrl: string, options: any) => StructService
}
