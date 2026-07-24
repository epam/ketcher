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

import type { ChemicalMimeType } from 'domain/services/struct/structService.types';
import type { SupportedFormat } from './structFormatter.types';
import { SupportedFormatProperties } from './supportedFormatProperties';

type FormatPropertiesMap = {
  [key in SupportedFormat]: SupportedFormatProperties;
};

const asChemicalMimeType = (mimeType: string) => mimeType as ChemicalMimeType;

const CHEMICAL_MIME_TYPE = {
  Mol: asChemicalMimeType('chemical/x-mdl-molfile'),
  Rxn: asChemicalMimeType('chemical/x-mdl-rxnfile'),
  DaylightSmiles: asChemicalMimeType('chemical/x-daylight-smiles'),
  ExtendedSmiles: asChemicalMimeType('chemical/x-chemaxon-cxsmiles'),
  DaylightSmarts: asChemicalMimeType('chemical/x-daylight-smarts'),
  InChI: asChemicalMimeType('chemical/x-inchi'),
  InChIAuxInfo: asChemicalMimeType('chemical/x-inchi-aux'),
  InChIKey: asChemicalMimeType('chemical/x-inchi-key'),
  CDX: asChemicalMimeType('chemical/x-cdx'),
  CDXML: asChemicalMimeType('chemical/x-cdxml'),
  CML: asChemicalMimeType('chemical/x-cml'),
  KET: asChemicalMimeType('chemical/x-indigo-ket'),
  UNKNOWN: asChemicalMimeType('chemical/x-unknown'),
  SDF: asChemicalMimeType('chemical/x-sdf'),
  FASTA: asChemicalMimeType('chemical/x-fasta'),
  SEQUENCE: asChemicalMimeType('chemical/x-sequence'),
  IDT: asChemicalMimeType('chemical/x-idt'),
  AXOLABS: asChemicalMimeType('chemical/x-axo-labs'),
  HELM: asChemicalMimeType('chemical/x-helm'),
  BILN: asChemicalMimeType('chemical/x-biln'),
  RDF: asChemicalMimeType('chemical/x-rdf'),
} as const;

const formatProperties: FormatPropertiesMap = {
  molAuto: new SupportedFormatProperties(
    // TODO: is it a valid name?
    'MDL Molfile Auto Format detect',
    CHEMICAL_MIME_TYPE.Mol,
    ['.mol'],
    true,
    { 'molfile-saving-mode': 'auto' },
  ),
  mol: new SupportedFormatProperties(
    'MDL Molfile V2000',
    CHEMICAL_MIME_TYPE.Mol,
    ['.mol'],
    true,
  ),
  molV3000: new SupportedFormatProperties(
    'MDL Molfile V3000',
    CHEMICAL_MIME_TYPE.Mol,
    ['.mol'],
    true,
    { 'molfile-saving-mode': '3000' },
  ),
  rxn: new SupportedFormatProperties(
    'MDL Rxnfile V2000',
    CHEMICAL_MIME_TYPE.Rxn,
    ['.rxn'],
    true,
  ),
  rxnV3000: new SupportedFormatProperties(
    'MDL Rxnfile V3000',
    CHEMICAL_MIME_TYPE.Rxn,
    ['.rxn'],
    true,
    { 'molfile-saving-mode': '3000' },
  ),
  smiles: new SupportedFormatProperties(
    'Daylight SMILES',
    CHEMICAL_MIME_TYPE.DaylightSmiles,
    ['.smi', '.smiles'],
    true,
  ),
  smilesExt: new SupportedFormatProperties(
    'Extended SMILES',
    CHEMICAL_MIME_TYPE.ExtendedSmiles,
    ['.cxsmi', '.cxsmiles'],
  ),
  smarts: new SupportedFormatProperties(
    'Daylight SMARTS',
    CHEMICAL_MIME_TYPE.DaylightSmarts,
    ['.smarts'],
  ),
  inChI: new SupportedFormatProperties('InChI', CHEMICAL_MIME_TYPE.InChI, [
    '.inchi',
  ]),
  inChIAuxInfo: new SupportedFormatProperties(
    'InChI AuxInfo',
    CHEMICAL_MIME_TYPE.InChIAuxInfo,
    ['.inchi'],
  ),
  inChIKey: new SupportedFormatProperties(
    'InChIKey',
    CHEMICAL_MIME_TYPE.InChIKey,
    ['.inchikey'],
  ),
  cml: new SupportedFormatProperties(
    'CML',
    CHEMICAL_MIME_TYPE.CML,
    ['.cml', '.mrv'],
    true,
  ),
  ket: new SupportedFormatProperties('Ket Format', CHEMICAL_MIME_TYPE.KET, [
    '.ket',
  ]),
  cdxml: new SupportedFormatProperties(
    'CDXML',
    CHEMICAL_MIME_TYPE.CDXML,
    ['.cdxml'],
    true,
  ),
  cdx: new SupportedFormatProperties(
    'Base64 CDX',
    CHEMICAL_MIME_TYPE.CDX,
    ['.b64cdx'],
    true,
  ),
  binaryCdx: new SupportedFormatProperties(
    'CDX',
    CHEMICAL_MIME_TYPE.CDX,
    ['.cdx'],
    true,
  ),
  sdf: new SupportedFormatProperties(
    'SDF V2000',
    CHEMICAL_MIME_TYPE.SDF,
    ['.sdf'],
    true,
    { 'molfile-saving-mode': '2000' },
  ),
  sdfV3000: new SupportedFormatProperties(
    'SDF V3000',
    CHEMICAL_MIME_TYPE.SDF,
    ['.sdf'],
    true,
    { 'molfile-saving-mode': '3000' },
  ),
  fasta: new SupportedFormatProperties(
    'FASTA',
    CHEMICAL_MIME_TYPE.FASTA,
    ['.fasta'],
    true,
  ),
  idt: new SupportedFormatProperties(
    'IDT',
    CHEMICAL_MIME_TYPE.IDT,
    ['.idt'],
    false,
  ),
  axoLabs: new SupportedFormatProperties(
    'AxoLabs',
    CHEMICAL_MIME_TYPE.AXOLABS,
    ['.axolabs'],
    true,
  ),
  helm: new SupportedFormatProperties(
    'HELM',
    CHEMICAL_MIME_TYPE.HELM,
    ['.helm'],
    true,
  ),
  biln: new SupportedFormatProperties(
    'BILN',
    CHEMICAL_MIME_TYPE.BILN,
    ['.biln'],
    true,
  ),
  sequence: new SupportedFormatProperties(
    'SEQUENCE',
    CHEMICAL_MIME_TYPE.SEQUENCE,
    ['.seq'],
    false,
    {},
  ),
  'sequence-3-letter': new SupportedFormatProperties(
    'SEQUENCE (3-letter code)',
    CHEMICAL_MIME_TYPE.SEQUENCE,
    ['.seq'],
    false,
    {},
  ),
  unknown: new SupportedFormatProperties(
    'Unknown',
    CHEMICAL_MIME_TYPE.UNKNOWN,
    ['.'],
    true,
  ),
  rdf: new SupportedFormatProperties(
    'RDF V2000',
    CHEMICAL_MIME_TYPE.RDF,
    ['.rdf'],
    true,
  ),
  rdfV3000: new SupportedFormatProperties(
    'RDF V3000',
    CHEMICAL_MIME_TYPE.RDF,
    ['.rdf'],
    true,
    { 'molfile-saving-mode': '3000' },
  ),
};

const imgFormatProperties = {
  svg: { extension: '.svg', name: 'SVG Document' },
  png: { extension: '.png', name: 'PNG Image' },
};

function getPropertiesByImgFormat(format) {
  return imgFormatProperties[format];
}

function getPropertiesByFormat(format: SupportedFormat) {
  return formatProperties[format];
}

function getFormatMimeTypeByFileName(fileName: string) {
  const fileExtension = '.' + fileName.split('.').pop();
  const format = Object.values(formatProperties).find((properties) => {
    return properties.extensions.includes(fileExtension);
  });
  return format?.mime;
}

export {
  formatProperties,
  getPropertiesByFormat,
  getPropertiesByImgFormat,
  getFormatMimeTypeByFileName,
};
