/****************************************************************************
 * Copyright 2020 EPAM Systems
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
export interface StructService {
  info: () => Promise<any>
  convert: (data: any, options: any) => Promise<any>
  layout: (data: any, options: any) => Promise<any>
  clean: (data: any, options: any) => Promise<any>
  aromatize: (data: any, options: any) => Promise<any>
  dearomatize: (data: any, options: any) => Promise<any>
  calculateCip: (data: any, options: any) => Promise<any>
  automap: (data: any, options: any) => Promise<any>
  check: (data: any, options: any) => Promise<any>
  calculate: (data: any, options: any) => Promise<any>
  recognize: (data: any, options: any) => Promise<any>
  generatePngAsBase64: (data: any, options: any) => Promise<any>
}

export type ServiceMode = 'standalone' | 'remote'

export interface StructServiceProvider {
  mode: ServiceMode
  createStructService: (baseUrl: string, options: any) => StructService
}
