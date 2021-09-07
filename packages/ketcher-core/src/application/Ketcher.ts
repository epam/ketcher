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

import { FormatterFactory, SupportedFormat } from './formatters'
import { GenerateImageOptions, StructService } from 'domain/services'

import { Editor } from './editor'
import { MolfileFormat } from 'domain/serializers'
import { Struct } from 'domain/entities'
import { isEqual } from 'lodash/fp'

function getStructure(
  structureFormat: SupportedFormat = 'rxn',
  formatterFactory: FormatterFactory,
  struct: Struct
): Promise<string> {
  const formatter = formatterFactory.create(structureFormat)
  return formatter.getStructureFromStructAsync(struct)
}

export class Ketcher {
  #structService: StructService
  #formatterFactory: FormatterFactory
  #editor: Editor
  #origin?: number

  get editor(): Editor {
    return this.#editor
  }

  constructor(
    editor: Editor,
    structService: StructService,
    formatterFactory: FormatterFactory
  ) {
    this.#editor = editor
    this.#structService = structService
    this.#formatterFactory = formatterFactory
  }

  getSmiles(isExtended: boolean = false): Promise<string> {
    const format: SupportedFormat = isExtended ? 'smilesExt' : 'smiles'
    return getStructure(format, this.#formatterFactory, this.editor.struct())
  }

  async getMolfile(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.MOL due to reaction arrrows.'
      )
    }
    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'molV3000' : 'mol'
    const molfile = await getStructure(
      format,
      this.#formatterFactory,
      this.#editor.struct()
    )

    return molfile
  }

  async getRxn(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (!this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.RXN: there is no reaction arrows.'
      )
    }
    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'rxnV3000' : 'rxn'
    const rxnfile = await getStructure(
      format,
      this.#formatterFactory,
      this.#editor.struct()
    )

    return rxnfile
  }

  getKet(): Promise<string> {
    return getStructure('graph', this.#formatterFactory, this.#editor.struct())
  }

  getSmarts(): Promise<string> {
    return getStructure('smarts', this.#formatterFactory, this.#editor.struct())
  }

  getCml(): Promise<string> {
    return getStructure('cml', this.#formatterFactory, this.#editor.struct())
  }

  getInchi(withAuxInfo = false): Promise<string> {
    return getStructure(
      withAuxInfo ? 'inChIAuxInfo' : 'inChI',
      this.#formatterFactory,
      this.#editor.struct()
    )
  }

  containsReaction(): boolean {
    return this.editor.struct().hasRxnArrow()
  }

  setMolecule(structure: string): void {
    if (typeof structure !== 'string') return
    this.#editor.load(structure, { rescale: true, fragment: false })
  }

  addFragment(fragment: string): void {
    if (typeof fragment !== 'string') return
    this.#editor.load(fragment, {
      rescale: true,
      fragment: true
    })
  }

  isDirty(): boolean {
    const position = this.editor.history.current
    const length = this.editor.history.length
    if (!length || !this.#origin) {
      return false
    }
    return !isEqual(this.editor.historyStack[position - 1], this.#origin)
  }

  setOrigin(): void {
    const position = this.editor.history.current
    this.#origin = position ? this.editor.historyStack[position - 1] : null
  }

  async generateImage(
    data: string,
    options: GenerateImageOptions = { outputFormat: 'png' }
  ): Promise<Blob> {
    let meta = ''

    switch (options.outputFormat) {
      case 'svg':
        meta = 'image/svg+xml'
        break

      case 'png':
      default:
        meta = 'image/png'
        options.outputFormat = 'png'
    }

    const base64 = await this.#structService.generateImageAsBase64(
      data,
      options
    )
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: meta })
    return blob
  }
}
