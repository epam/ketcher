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
import RemoteStructService from './RemoteStructService'
import RemoteStructServiceProvider from './RemoteStructServiceProvider'
import { ChemicalMimeType } from './structService.types'
import type {
  StructService,
  StructServiceOptions,
  GenerateImageOptions,
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
  RecognizeResult
} from './structService.types'
import type {
  ServiceMode,
  StructServiceProvider
} from './structServiceProvider.types'

export { RemoteStructService, RemoteStructServiceProvider, ChemicalMimeType }
export type {
  StructService,
  StructServiceOptions,
  GenerateImageOptions,
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
