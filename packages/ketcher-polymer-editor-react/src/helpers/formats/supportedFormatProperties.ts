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

export enum ChemicalMimeType {
  Mol = 'chemical/x-mdl-molfile',
  Helm = 'chemical/x-helm'
}

export class SupportedFormatProperties {
  name: string
  mime: ChemicalMimeType
  extensions: string[]
  supportsCoords?: boolean
  options?: any

  constructor(
    name: string,
    mime: ChemicalMimeType,
    extensions: string[],
    supportsCoords?: boolean,
    options?: any
  ) {
    this.name = name
    this.mime = mime
    this.extensions = extensions
    this.supportsCoords = supportsCoords || false
    this.options = options || {}
  }
}
