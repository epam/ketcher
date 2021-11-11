/****************************************************************************
 * Copyright 2018 EPAM Systems
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
  FormatterFactory,
  GenerateImageOptions,
  MolSerializer,
  MolfileFormat,
  Struct,
  StructService,
  SupportedFormat
} from 'ketcher-core'

import Editor from './editor'
import Render from './render'
import { isEqual } from 'lodash/fp'

interface UI {
  load: (structStr: string | null, options?: any) => undefined
  loadStruct: (struct: Struct) => any
}

function getStructureAsync(
  structureFormat: SupportedFormat = 'rxn',
  formatterFactory: FormatterFactory,
  struct: Struct
): Promise<string> {
  const formatter = formatterFactory.create(structureFormat)
  return formatter.getStructureFromStructAsync(struct)
}

class Ketcher {
  private origin = null

  constructor(
    readonly editor: Editor,
    readonly server: StructService, // todo: remove
    readonly ui: UI,
    private readonly formatterFactory: FormatterFactory
  ) {}

  getSmilesAsync(isExtended: boolean = false): Promise<string> {
    const format: SupportedFormat = isExtended ? 'smilesExt' : 'smiles'
    return getStructureAsync(
      format,
      this.formatterFactory,
      this.editor.struct()
    )
  }

  getMolfileAsync(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.MOL due to reaction arrrows.'
      )
    }
    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'molV3000' : 'mol'
    return getStructureAsync(
      format,
      this.formatterFactory,
      this.editor.struct()
    )
  }

  getGraphAsync(): Promise<string> {
    return getStructureAsync(
      'graph',
      this.formatterFactory,
      this.editor.struct()
    )
  }

  containsReaction(): boolean {
    return this.editor.struct().hasRxnArrow()
  }

  getRxnAsync(molfileFormat: MolfileFormat = 'v2000'): Promise<string> {
    if (!this.containsReaction()) {
      throw Error(
        'The structure cannot be saved as *.RXN: there is no reaction arrows.'
      )
    }
    const format: SupportedFormat =
      molfileFormat === 'v3000' ? 'rxnV3000' : 'rxn'
    return getStructureAsync(
      format,
      this.formatterFactory,
      this.editor.struct()
    )
  }

  setMolecule(molString: string, rescale = true): void {
    if (typeof molString !== 'string') return
    this.ui.load(molString, {
      rescale
    })
  }

  addFragment(molString: string): void {
    if (typeof molString !== 'string') return
    this.ui.load(molString, {
      rescale: true,
      fragment: true
    })
  }

  showMolfile(clientArea: any, molString: string, options: any): Render {
    const render = new Render(
      clientArea,
      Object.assign(
        {
          scale: options.bondLength || 75
        },
        options
      )
    )
    if (molString) {
      const molSerializer = new MolSerializer()
      const mol = molSerializer.deserialize(molString)
      render.setMolecule(mol)
    }
    render.update()
    // not sure we need to expose guts
    return render
  }

  isDirty(): boolean {
    const position = this.editor.historyPtr
    const length = this.editor.historyStack.length
    if (!length || !this.origin) {
      return false
    }
    return !isEqual(this.editor.historyStack[position - 1], this.origin)
  }

  setOrigin(): void {
    const position = this.editor.historyPtr
    this.origin = position ? this.editor.historyStack[position - 1] : null
  }

  generateImageAsync(
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
        options.outputFormat = 'png' // if option wasn't pass
    }

    return this.server.generateImageAsBase64(data, options).then(base64 => {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: meta })
      return Promise.resolve(blob)
    })
  }
}

export type { UI }
export { Ketcher }
