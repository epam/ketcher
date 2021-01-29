// todo: remove Managers from export outside, when this managers will be moved under Core package
import {
  Graph,
  GraphManager,
  MolfileManager,
  MolfileParseOptions,
  Pile,
  Pool,
  Struct,
  SGroupForest,
  SmilesManager
} from './chem'

import {
  FormatterFactory,
  formatProperties,
  getPropertiesByFormat,
  StructFormatter,
  StructProvider,
  SupportedFormat,
  identifyStructFormat
} from './format'

import {
  RemoteStructService,
  RemoteStructServiceProvider,
  ChemicalMimeType
} from './infrastructure/services'

import type {
  StructService,
  StructServiceOptions,
  AromatizeData,
  AromatizeResult,
  AutomapData,
  AutomapResult,
  CalculateCipData,
  CalculateCipResult,
  CalculateData,
  CalculateResult,
  CheckData,
  CheckResult,
  CleanData,
  CleanResult,
  ConvertData,
  ConvertResult,
  DearomatizeData,
  DearomatizeResult,
  InfoResult,
  LayoutData,
  LayoutResult,
  RecognizeResult,
  ServiceMode,
  StructServiceProvider
} from './infrastructure/services'

export type {
  Graph,
  GraphManager,
  MolfileManager,
  MolfileParseOptions,
  Pile,
  Pool,
  Struct,
  SGroupForest,
  SmilesManager
}
export type { StructFormatter, StructProvider, SupportedFormat }
export {
  FormatterFactory,
  formatProperties,
  getPropertiesByFormat,
  identifyStructFormat
}

export { RemoteStructService, RemoteStructServiceProvider, ChemicalMimeType }
export type {
  StructService,
  StructServiceOptions,
  AromatizeData,
  AromatizeResult,
  AutomapData,
  AutomapResult,
  CalculateCipData,
  CalculateCipResult,
  CalculateData,
  CalculateResult,
  CheckData,
  CheckResult,
  CleanData,
  CleanResult,
  ConvertData,
  ConvertResult,
  DearomatizeData,
  DearomatizeResult,
  InfoResult,
  LayoutData,
  LayoutResult,
  RecognizeResult,
  ServiceMode,
  StructServiceProvider
}
