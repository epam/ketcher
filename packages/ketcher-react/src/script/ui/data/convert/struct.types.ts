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

export enum SupportedFormat {
  Rxn,
  RxnV3000,
  Mol,
  MolV3000,
  Smiles,
  SmilesExt,
  Smarts,
  InChI,
  InChIAuxInfo,
  CML,
  Graph
}

export enum ChemicalMimeType {
  Mol = 'chemical/x-mdl-molfile',
  Rxn = 'chemical/x-mdl-rxnfile',
  DaylightSmiles = 'chemical/x-daylight-smiles',
  ExtendedSmiles = 'chemical/x-chemaxon-cxsmiles',
  DaylightSmarts = 'chemical/x-daylight-smarts',
  InChI = 'chemical/x-inchi',
  InChIAuxInfo = 'chemical/x-inchi-aux',
  CML = 'chemical/x-cml',
  JSON = 'application/json'
}

export class SupportedFormatProperties {
  name: string
  mime: ChemicalMimeType
  ext: Array<string>
  supportsCoords?: boolean
  options?: any

  constructor(
    name: string,
    mime: ChemicalMimeType,
    ext: Array<string>,
    supportsCoords?: boolean,
    options?: any
  ) {
    this.name = name
    this.mime = mime
    this.ext = ext
    this.supportsCoords = supportsCoords || false
    this.options = options || {}
  }
}
export type SupportedFormatStrings = keyof typeof SupportedFormat
type FormatPropertiesMap = {
  [key in SupportedFormatStrings]: SupportedFormatProperties
}

export const SupportedFormatPropertiesMap: FormatPropertiesMap = {
  Mol: new SupportedFormatProperties(
    'MDL Molfile V2000',
    ChemicalMimeType.Mol,
    ['.mol'],
    true
  ),
  MolV3000: new SupportedFormatProperties(
    'MDL Molfile V3000',
    ChemicalMimeType.Mol,
    ['.mol'],
    true,
    { 'molfile-saving-mode': '3000' }
  ),
  Rxn: new SupportedFormatProperties(
    'MDL Rxnfile V2000',
    ChemicalMimeType.Rxn,
    ['.rxn'],
    true
  ),
  RxnV3000: new SupportedFormatProperties(
    'MDL Rxnfile V3000',
    ChemicalMimeType.Rxn,
    ['.rxn'],
    true,
    { 'molfile-saving-mode': '3000' }
  ),
  Smiles: new SupportedFormatProperties(
    'Daylight SMILES',
    ChemicalMimeType.DaylightSmiles,
    ['.smi', '.smiles']
  ),
  SmilesExt: new SupportedFormatProperties(
    'Extended SMILES',
    ChemicalMimeType.ExtendedSmiles,
    ['.cxsmi', '.cxsmiles']
  ),
  Smarts: new SupportedFormatProperties(
    'Daylight SMARTS',
    ChemicalMimeType.DaylightSmiles,
    ['.smarts']
  ),
  InChI: new SupportedFormatProperties('InChI', ChemicalMimeType.InChI, [
    '.inchi'
  ]),
  InChIAuxInfo: new SupportedFormatProperties(
    'InChI AuxInfo',
    ChemicalMimeType.InChIAuxInfo,
    ['.inchi']
  ),
  CML: new SupportedFormatProperties(
    'CML',
    ChemicalMimeType.CML,
    ['.cml', '.mrv'],
    true
  ),
  Graph: new SupportedFormatProperties('Graph Format', ChemicalMimeType.JSON, [
    '.ket'
  ])
}

export function getPropertiesByFormat(format: SupportedFormat) {
  return SupportedFormatPropertiesMap[SupportedFormat[format]]
}
