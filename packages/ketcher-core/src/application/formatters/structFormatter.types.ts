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

import type { MolSerializerOptions } from 'domain/serializers/mol/mol.types';
import type { Struct } from 'domain/entities/struct';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { StructServiceOptions } from 'domain/services';
import type { EditorSelection } from 'application/editor/editor.types';

export interface StructFormatter {
  getStringFromStructureAsync: (
    struct: Struct,
    drawingEntitiesManager?: DrawingEntitiesManager,
    selection?: EditorSelection,
  ) => Promise<string>;
  getStructureFromStringAsync: (stringifiedStruct: string) => Promise<Struct>;
  parseMacromoleculeString?: (stringifiedStruct: string) => void;
}

export enum SupportedFormat {
  mol = 'mol',
  molV3000 = 'molV3000',
  molAuto = 'molAuto',
  rxn = 'rxn',
  rxnV3000 = 'rxnV3000',
  smiles = 'smiles',
  smilesExt = 'smilesExt',
  smarts = 'smarts',
  inChI = 'inChI',
  inChIAuxInfo = 'inChIAuxInfo',
  inChIKey = 'inChIKey',
  cml = 'cml',
  ket = 'ket',
  cdxml = 'cdxml',
  cdx = 'cdx',
  binaryCdx = 'binaryCdx',
  sdf = 'sdf',
  sdfV3000 = 'sdfV3000',
  fasta = 'fasta',
  sequence = 'sequence',
  sequence3Letter = 'sequence-3-letter',
  idt = 'idt',
  axoLabs = 'axoLabs',
  helm = 'helm',
  biln = 'biln',
  unknown = 'unknown',
  rdf = 'rdf',
  rdfV3000 = 'rdfV3000',
}

export type FormatterFactoryOptions = Partial<
  MolSerializerOptions & StructServiceOptions
>;
