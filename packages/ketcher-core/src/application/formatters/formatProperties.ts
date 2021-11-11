import { ChemicalMimeType } from 'domain/services'
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
    true,
    { rescale: false }
  ),
  molV3000: new SupportedFormatProperties(
    'MDL Molfile V3000',
    ChemicalMimeType.Mol,
    ['.mol'],
    true,
    { 'molfile-saving-mode': '3000', rescale: false }
  ),
  rxn: new SupportedFormatProperties(
    'MDL Rxnfile V2000',
    ChemicalMimeType.Rxn,
    ['.rxn'],
    true,
    { rescale: false }
  ),
  rxnV3000: new SupportedFormatProperties(
    'MDL Rxnfile V3000',
    ChemicalMimeType.Rxn,
    ['.rxn'],
    true,
    { 'molfile-saving-mode': '3000', rescale: false }
  ),
  smiles: new SupportedFormatProperties(
    'Daylight SMILES',
    ChemicalMimeType.DaylightSmiles,
    ['.smi', '.smiles'],
    false,
    { rescale: false }
  ),
  smilesExt: new SupportedFormatProperties(
    'Extended SMILES',
    ChemicalMimeType.ExtendedSmiles,
    ['.cxsmi', '.cxsmiles'],
    false,
    { rescale: false }
  ),
  smarts: new SupportedFormatProperties(
    'Daylight SMARTS',
    ChemicalMimeType.DaylightSmarts,
    ['.smarts'],
    false,
    { rescale: false }
  ),
  inChI: new SupportedFormatProperties(
    'InChI',
    ChemicalMimeType.InChI,
    ['.inchi'],
    false,
    { rescale: false }
  ),
  inChIAuxInfo: new SupportedFormatProperties(
    'InChI AuxInfo',
    ChemicalMimeType.InChIAuxInfo,
    ['.inchi'],
    false,
    { rescale: false }
  ),
  cml: new SupportedFormatProperties(
    'CML',
    ChemicalMimeType.CML,
    ['.cml', '.mrv'],
    true,
    { rescale: false }
  ),
  graph: new SupportedFormatProperties(
    'Graph Format',
    ChemicalMimeType.KET,
    ['.ket'],
    false,
    { rescale: false }
  ),
  cdxml: new SupportedFormatProperties(
    'CDXML',
    ChemicalMimeType.CDXML,
    ['.cdxml'],
    true,
    { rescale: true }
  )
}

function getPropertiesByFormat(format: SupportedFormat) {
  return formatProperties[format]
}

export { formatProperties, getPropertiesByFormat }
