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

export type SupportedFormat =
  | 'molAuto'
  | 'rxn'
  | 'rxnV3000'
  | 'mol'
  | 'molV3000'
  | 'smiles'
  | 'smilesExt'
  | 'smarts'
  | 'inChI'
  | 'inChIAuxInfo'
  | 'cml'
  | 'ket'
  | 'cdxml'

export type FormatterFactoryOptions = Partial<
  MolSerializerOptions & StructServiceOptions
>
