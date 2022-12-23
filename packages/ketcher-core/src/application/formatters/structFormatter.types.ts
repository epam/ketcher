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

import { MolSerializerOptions } from 'domain/serializers'
import { Struct } from 'domain/entities'
import { StructServiceOptions } from 'domain/services'

export interface StructFormatter {
  getStructureFromStructAsync: (struct: Struct) => Promise<string>
  getStructureFromStringAsync: (stringifiedStruct: string) => Promise<Struct>
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
  cml = 'cml',
  ket = 'ket',
  cdxml = 'cdxml',
  cdx = 'cdx',
  unknown = 'unknown'
}

export type FormatterFactoryOptions = Partial<
  MolSerializerOptions & StructServiceOptions
>
