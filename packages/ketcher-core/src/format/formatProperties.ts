import { ChemicalMimeType } from 'infrastructure/services'
import { SupportedFormat } from './structFormatter.types'
import { SupportedFormatProperties } from './SupportedFormatProperties'

type FormatPropertiesMap = {
  [key in SupportedFormat]: SupportedFormatProperties
}

const formatProperties: FormatPropertiesMap = {
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
  graph: new SupportedFormatProperties('Graph Format', ChemicalMimeType.KET, [
    '.ket'
  ])
}

function getPropertiesByFormat(format: SupportedFormat) {
  return formatProperties[format]
}

export { formatProperties, getPropertiesByFormat }
