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

import { ChemicalMimeType } from 'domain/services'
import { SupportedFormat } from './structFormatter.types'
import { SupportedFormatProperties } from './supportedFormatProperties'

type FormatPropertiesMap = {
  [key in SupportedFormat]: SupportedFormatProperties
}

const formatProperties: FormatPropertiesMap = {
  molAuto: new SupportedFormatProperties(
    // TODO: is it a valid name?
    'MDL Molfile Auto Format detect',
    ChemicalMimeType.Mol,
    ['.mol'],
    true,
    { 'molfile-saving-mode': 'auto' }
  ),
  mol: new SupportedFormatProperties(
    'MDL Molfile V2000',
    ChemicalMimeType.Mol,
    ['.mol'],
    true
  ),
  molV3000: new SupportedFormatProperties(
    'MDL Molfile V3000',
    ChemicalMimeType.Mol,
    ['.mol'],
    true,
    { 'molfile-saving-mode': '3000' }
  ),
  rxn: new SupportedFormatProperties(
    'MDL Rxnfile V2000',
    ChemicalMimeType.Rxn,
    ['.rxn'],
    true
  ),
  rxnV3000: new SupportedFormatProperties(
    'MDL Rxnfile V3000',
    ChemicalMimeType.Rxn,
    ['.rxn'],
    true,
    { 'molfile-saving-mode': '3000' }
  ),
  smiles: new SupportedFormatProperties(
    'Daylight SMILES',
    ChemicalMimeType.DaylightSmiles,
    ['.smi', '.smiles']
  ),
  smilesExt: new SupportedFormatProperties(
    'Extended SMILES',
    ChemicalMimeType.ExtendedSmiles,
    ['.cxsmi', '.cxsmiles']
  ),
  smarts: new SupportedFormatProperties(
    'Daylight SMARTS',
    ChemicalMimeType.DaylightSmarts,
    ['.smarts']
  ),
  inChI: new SupportedFormatProperties('InChI', ChemicalMimeType.InChI, [
    '.inchi'
  ]),
  inChIAuxInfo: new SupportedFormatProperties(
    'InChI AuxInfo',
    ChemicalMimeType.InChIAuxInfo,
    ['.inchi']
  ),
  cml: new SupportedFormatProperties(
    'CML',
    ChemicalMimeType.CML,
    ['.cml', '.mrv'],
    true
  ),
  ket: new SupportedFormatProperties('Ket Format', ChemicalMimeType.KET, [
    '.ket'
  ]),
  cdxml: new SupportedFormatProperties(
    'CDXML',
    ChemicalMimeType.CDXML,
    ['.cdxml'],
    true
  ),
  cdx: new SupportedFormatProperties(
    'Base64 CDX',
    ChemicalMimeType.CDX,
    ['.b64cdx'],
    true
  ),
  binaryCdx: new SupportedFormatProperties(
    'CDX',
    ChemicalMimeType.CDX,
    ['.cdx'],
    true
  ),
  unknown: new SupportedFormatProperties(
    'Unknown',
    ChemicalMimeType.UNKNOWN,
    ['.'],
    true
  )
}

const imgFormatProperties = {
  svg: { extension: '.svg', name: 'SVG Document' },
  png: { extension: '.png', name: 'PNG Image' }
}

function getPropertiesByImgFormat(format) {
  return imgFormatProperties[format]
}

function getPropertiesByFormat(format: SupportedFormat) {
  return formatProperties[format]
}

export { formatProperties, getPropertiesByFormat, getPropertiesByImgFormat }
