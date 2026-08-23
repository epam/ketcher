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
import { IKetMacromoleculesContent } from 'ketcher-core';

export interface IndigoVectorInt {
  push_back(value: number): void;
}

export interface IndigoOptions {
  set(key: string, value: string): void;
}

export interface IndigoModule {
  MapStringString: new () => IndigoOptions;
  VectorInt: new () => IndigoVectorInt;
  render(struct: string, options: IndigoOptions): string;
  layout(struct: string, format: string, options: IndigoOptions): string;
  dearomatize(struct: string, format: string, options: IndigoOptions): string;
  check(struct: string, types: string, options: IndigoOptions): string;
  calculateCip(struct: string, format: string, options: IndigoOptions): string;
  calculate(
    struct: string,
    options: IndigoOptions,
    selectedAtoms: IndigoVectorInt,
  ): string;
  automap(
    struct: string,
    mode: string,
    format: string,
    options: IndigoOptions,
  ): string;
  aromatize(struct: string, format: string, options: IndigoOptions): string;
  clean2d(
    struct: string,
    format: string,
    options: IndigoOptions,
    selectedAtoms: IndigoVectorInt,
  ): string;
  convert(struct: string, format: string, options: IndigoOptions): string;
  version(): string;
  convert_explicit_hydrogens(
    struct: string,
    mode: string,
    format: string,
    options: IndigoOptions,
  ): string;
  calculateMacroProperties(struct: string, options: IndigoOptions): string;
}

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
  GetInChIKey,
  ExplicitHydrogens,
  CalculateMacromoleculeProperties,
}

export const enum WorkerEvent {
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
  GenerateImageAsBase64 = 'generateImageAsBase64',
  GetInChIKey = 'getInChIKey',
  ExplicitHydrogens = 'convert_explicit_hydrogens',
  CalculateMacromoleculeProperties = 'calculateMacroProperties',
}

export enum SupportedFormat {
  Rxn = 'rxnfile',
  Mol = 'molfile',
  Smiles = 'smiles',
  Smarts = 'smarts',
  CML = 'cml',
  InChI = 'inchi',
  InChIAuxInfo = 'inchi-aux',
  InChIKey = 'inchi-key',
  Ket = 'ket',
  CDX = 'cdx',
  CDXML = 'cdxml',
  SDF = 'sdf',
  FASTA = 'fasta',
  SEQUENCE = 'sequence',
  SEQUENCE_3_LETTER = 'peptide-sequence-3-letter',
  IDT = 'idt',
  AXOLABS = 'axo-labs',
  HELM = 'helm',
  BILN = 'biln',
  RDF = 'rdf',
  MonomerLibrary = 'monomer-library',
}

export interface WithStruct {
  struct: string;
}

export interface WithFormat {
  format: SupportedFormat;
}

export interface WithSelection {
  selectedAtoms: Array<number>;
}

export interface CommandOptions {
  [key: string]:
    | IKetMacromoleculesContent
    | string
    | number
    | boolean
    | undefined;
}

export interface CommandData {
  options?: CommandOptions;
}

export interface CheckCommandData extends CommandData, WithStruct {
  types: Array<string>;
}

export interface ConvertCommandData
  extends CommandData,
    WithStruct,
    WithFormat {}

export interface GenerateInchIKeyCommandData extends CommandData, WithStruct {}

export interface GenerateImageCommandData extends CommandData, WithStruct {
  outputFormat: 'png' | 'svg';
  backgroundColor?: string;
  bondThickness?: number;
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
  | 'mass-composition';

export interface CalculateCommandData
  extends CommandData,
    WithStruct,
    WithSelection {
  properties: Array<string>;
}

export interface AutomapCommandData
  extends CommandData,
    WithStruct,
    WithFormat {
  mode: string;
}

export interface ExplicitHydrogensCommandData
  extends CommandData,
    WithStruct,
    WithFormat {
  mode: 'auto' | 'fold' | 'unfold';
}

export interface CalculateMacromoleculePropertiesCommandData
  extends CommandData,
    WithStruct {}

interface OutputMessageBase {
  type?: Command;
  hasError?: boolean;
}

interface OutputMessageWithError extends OutputMessageBase {
  hasError: true;
  error: string;
  inputData?: string;
}

interface OutputMessageWithoutError<T> extends OutputMessageBase {
  hasError?: false;
  payload: T;
  inputData?: string;
}

export type OutputMessage<T> =
  | OutputMessageWithError
  | OutputMessageWithoutError<T>;

export interface InputMessage<T> {
  type: Command;
  data: T;
}

export interface OutputMessageWrapper<T = string> {
  data: OutputMessage<T>;
}
