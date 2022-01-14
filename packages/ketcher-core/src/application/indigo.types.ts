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

import {
  AutomapMode,
  CalculateProps,
  CalculateResult,
  CheckResult,
  CheckTypes,
  ChemicalMimeType,
  ConvertResult,
  InfoResult,
  OutputFormatType
} from 'domain/services'
import { Struct } from 'domain/entities'

export type StructOrString = Struct | string

export interface Indigo {
  info: () => Promise<InfoResult>
  calculate: (
    struct: StructOrString,
    options?: {
      properties?: Array<CalculateProps>
    }
  ) => Promise<CalculateResult>
  convert: (
    struct: StructOrString,
    options?: {
      outputFormat?: ChemicalMimeType
    }
  ) => Promise<ConvertResult>
  layout: (struct: StructOrString) => Promise<Struct>
  clean: (struct: StructOrString) => Promise<Struct>
  aromatize: (struct: StructOrString) => Promise<Struct>
  dearomatize: (struct: StructOrString) => Promise<Struct>
  calculateCip: (struct: StructOrString) => Promise<Struct>
  automap: (
    struct: StructOrString,
    options?: { mode?: AutomapMode }
  ) => Promise<Struct>
  check: (
    struct: StructOrString,
    options?: { types?: Array<CheckTypes> }
  ) => Promise<CheckResult>
  recognize: (blob: Blob, options?: { version?: string }) => Promise<Struct>
  generateImageAsBase64: (
    data: string,
    options?: {
      outputFormat?: OutputFormatType
      backgroundColor?: string
    }
  ) => Promise<string>
}
